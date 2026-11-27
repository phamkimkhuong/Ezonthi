import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { requireTeacher, requireUser } from '../services/access.js';
import { migrateUserLearningData, syncCanonicalAttempts, SYNC_BATCH_SIZE } from '../services/learningData.js';

export const syncLearningData = onCall({ cors: true, timeoutSeconds: 120, memory: '512MiB' }, async request => {
  const uid = requireUser(request);
  if (request.data?.expectedUserId !== undefined && request.data.expectedUserId !== uid) {
    throw new HttpsError('permission-denied', 'Tài khoản đã thay đổi; batch vẫn được giữ trên thiết bị nguồn.');
  }
  const attempts = request.data?.attempts;
  if (!Array.isArray(attempts) || attempts.length > SYNC_BATCH_SIZE) throw new HttpsError('invalid-argument', `Mỗi lần đồng bộ tối đa ${SYNC_BATCH_SIZE} bài làm.`);
  await migrateUserLearningData(uid);
  try { return await syncCanonicalAttempts(uid, attempts, request.data?.operationId); }
  catch (error) { console.error('Learning sync failed', error); throw new HttpsError('aborted', 'Đồng bộ bài làm chưa hoàn tất; dữ liệu vẫn được giữ để thử lại.'); }
});

export const migrateLearningData = onCall({ cors: true, timeoutSeconds: 300, memory: '1GiB' }, async request => {
  const caller = requireUser(request);
  const uid = request.data?.userId ?? caller;
  if (typeof uid !== 'string' || !uid || uid.includes('/')) throw new HttpsError('invalid-argument', 'User ID không hợp lệ.');
  if (uid !== caller) await requireTeacher(request);
  try { return await migrateUserLearningData(uid); }
  catch (error) { console.error('Learning migration failed', error); throw new HttpsError('aborted', 'Migration chưa được xác minh; dữ liệu nguồn cũ vẫn được giữ nguyên.'); }
});
