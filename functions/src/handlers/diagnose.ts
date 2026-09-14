import { onCall, HttpsError } from "firebase-functions/v2/https";
import { updateStudentProfileFromSession, consolidateProfile } from "../services/profile.js";
import { DAILY_REQUEST_LIMIT, db } from '../config.js';
import { hasActivePremium } from '../services/entitlements.js';
import { AiQuotaExceededError, finalizeAiUsage, reserveAiQuota } from '../services/aiControl.js';

const SUBJECTS = new Set(['math', 'english', 'physics', 'chemistry', 'biology', 'history']);

export const diagnoseSession = onCall({
  cors: true,
  timeoutSeconds: 45,
  memory: '512MiB',
  maxInstances: 20,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Yêu cầu đăng nhập.");
  }

  const uid = request.auth.uid;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "API Key chưa được cấu hình ở phía máy chủ.");
  }

  const { chatHistory, subjectId } = request.data ?? {};
  if (!Array.isArray(chatHistory) || chatHistory.length === 0 || chatHistory.length > 20) {
    throw new HttpsError("invalid-argument", "Thiếu lịch sử chat hoặc định dạng không hợp lệ.");
  }
  let totalChars = 0;
  for (const message of chatHistory) {
    if (!message || !['user', 'model'].includes(message.role) || typeof message.text !== 'string' || message.text.length > 4_000) {
      throw new HttpsError('invalid-argument', 'Tin nhắn chẩn đoán không hợp lệ hoặc quá dài.');
    }
    totalChars += message.text.length;
  }
  if (totalChars > 30_000 || typeof subjectId !== 'string' || !SUBJECTS.has(subjectId)) {
    throw new HttpsError('invalid-argument', 'Ngữ cảnh chẩn đoán vượt giới hạn hoặc môn học không hợp lệ.');
  }

  const user = await db.collection('users').doc(uid).get();
  const dailyLimit = hasActivePremium(user.data()) ? DAILY_REQUEST_LIMIT : 20;
  let reservation;
  try {
    reservation = await reserveAiQuota(uid, dailyLimit, 'diagnose');
  } catch (error) {
    if (error instanceof AiQuotaExceededError) {
      throw new HttpsError('resource-exhausted', `Bạn đã dùng hết hạn mức AI hàng ngày (${dailyLimit} lượt).`);
    }
    throw error;
  }
  const startedAt = Date.now();

  try {
    const cleanSubjectId = subjectId;
    // Await để đảm bảo tác vụ được hoàn thành đầy đủ trên GCP trước khi đóng function container
    await updateStudentProfileFromSession(uid, cleanSubjectId, chatHistory, apiKey, reservation.requestId);
    await consolidateProfile(uid, cleanSubjectId, apiKey, reservation.requestId);
    await finalizeAiUsage(reservation.requestId, {
      status: 'succeeded', taskType: 'diagnose', provider: 'orchestrator',
      model: 'profile-pipeline', durationMs: Date.now() - startedAt,
    });

    return { success: true };
  } catch (error: any) {
    await finalizeAiUsage(reservation.requestId, {
      status: 'failed', taskType: 'diagnose', provider: 'orchestrator',
      model: 'profile-pipeline', durationMs: Date.now() - startedAt,
      errorCode: error?.name || 'diagnose_failed',
    }).catch(logError => console.error('Failed to finalize diagnose usage', logError));
    throw new HttpsError("internal", `Lỗi chẩn đoán phiên: ${error.message}`);
  }
});
