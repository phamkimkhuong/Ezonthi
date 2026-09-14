import { randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../config.js';
import type { GeminiProxyRequest } from '../types.js';
import { recordProductMetric } from './productMetrics.js';

export const AI_REQUEST_LIMITS = {
  totalBytes: 7_500_000,
  promptChars: 12_000,
  systemInstructionChars: 24_000,
  contentItems: 12,
  contentTextChars: 60_000,
  imageBytes: 5_000_000,
  responseSchemaBytes: 20_000,
} as const;

export const AI_TASK_TYPES = [
  'tutor', 'proof_grading', 'rewrite', 'summary', 'diagnose', 'consolidate'
] as const;

export type AiTaskType = typeof AI_TASK_TYPES[number];

export class AiRequestValidationError extends Error {}
export class AiQuotaExceededError extends Error {}

const GRADES = new Set(['grade9', 'grade10', 'grade11']);
const SUBJECTS = new Set(['math', 'english', 'physics', 'chemistry', 'biology', 'history']);
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const byteLength = (value: unknown): number => Buffer.byteLength(JSON.stringify(value), 'utf8');

export function validateAiRequest(raw: unknown): GeminiProxyRequest {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new AiRequestValidationError('Payload AI phải là một object.');
  }
  if (byteLength(raw) > AI_REQUEST_LIMITS.totalBytes) {
    throw new AiRequestValidationError('Payload AI vượt quá giới hạn cho phép.');
  }
  const data = raw as GeminiProxyRequest;
  if (data.prompt !== undefined && (typeof data.prompt !== 'string' || data.prompt.length > AI_REQUEST_LIMITS.promptChars)) {
    throw new AiRequestValidationError('Prompt không hợp lệ hoặc quá dài.');
  }
  if (data.systemInstruction !== undefined &&
      (typeof data.systemInstruction !== 'string' || data.systemInstruction.length > AI_REQUEST_LIMITS.systemInstructionChars)) {
    throw new AiRequestValidationError('System instruction không hợp lệ hoặc quá dài.');
  }
  if (!data.prompt && (!Array.isArray(data.contents) || data.contents.length === 0)) {
    throw new AiRequestValidationError('Thiếu prompt hoặc contents.');
  }
  if (data.contents !== undefined) {
    if (!Array.isArray(data.contents) || data.contents.length > AI_REQUEST_LIMITS.contentItems) {
      throw new AiRequestValidationError('Lịch sử hội thoại vượt quá giới hạn.');
    }
    let textChars = 0;
    for (const content of data.contents) {
      if (!content || !['user', 'model'].includes(content.role) || !Array.isArray(content.parts) || content.parts.length > 4) {
        throw new AiRequestValidationError('Cấu trúc hội thoại không hợp lệ.');
      }
      for (const part of content.parts) {
        if (!part || typeof part !== 'object') throw new AiRequestValidationError('Nội dung hội thoại không hợp lệ.');
        if (part.text !== undefined) {
          if (typeof part.text !== 'string') throw new AiRequestValidationError('Nội dung hội thoại không hợp lệ.');
          textChars += part.text.length;
        }
        if (part.inlineData) validateImage(part.inlineData);
      }
    }
    if (textChars > AI_REQUEST_LIMITS.contentTextChars) {
      throw new AiRequestValidationError('Nội dung hội thoại quá dài.');
    }
  }
  if (data.image !== undefined) validateImage(data.image);
  if (data.responseSchema !== undefined && byteLength(data.responseSchema) > AI_REQUEST_LIMITS.responseSchemaBytes) {
    throw new AiRequestValidationError('Response schema quá lớn.');
  }
  if (data.temperature !== undefined &&
      (typeof data.temperature !== 'number' || !Number.isFinite(data.temperature) || data.temperature < 0 || data.temperature > 1)) {
    throw new AiRequestValidationError('Temperature phải nằm trong khoảng 0–1.');
  }
  if (data.subjectId !== undefined && (typeof data.subjectId !== 'string' || !SUBJECTS.has(data.subjectId))) {
    throw new AiRequestValidationError('Môn học không hợp lệ.');
  }
  if (data.gradeId !== undefined && (typeof data.gradeId !== 'string' || !GRADES.has(data.gradeId))) {
    throw new AiRequestValidationError('Lớp học không hợp lệ.');
  }
  if (data.useRag && (!data.subjectId || !data.gradeId)) {
    throw new AiRequestValidationError('RAG yêu cầu đầy đủ lớp và môn học.');
  }
  if (data.ragVersion !== undefined &&
      (typeof data.ragVersion !== 'string' || !/^[A-Za-z0-9._-]{1,40}$/.test(data.ragVersion))) {
    throw new AiRequestValidationError('Phiên bản RAG không hợp lệ.');
  }
  if (data.chatId !== undefined &&
      (typeof data.chatId !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(data.chatId))) {
    throw new AiRequestValidationError('Chat ID không hợp lệ.');
  }
  if (data.topicName !== undefined && (typeof data.topicName !== 'string' || data.topicName.length > 200)) {
    throw new AiRequestValidationError('Tên chủ đề không hợp lệ.');
  }
  if (data.taskType !== undefined && !AI_TASK_TYPES.includes(data.taskType)) {
    throw new AiRequestValidationError('Loại tác vụ AI không hợp lệ.');
  }
  return data;
}

function validateImage(image: { mimeType: string; data: string }): void {
  if (!image || typeof image.mimeType !== 'string' || !IMAGE_MIME_TYPES.has(image.mimeType) ||
      typeof image.data !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(image.data) ||
      Math.floor(image.data.length * 3 / 4) > AI_REQUEST_LIMITS.imageBytes) {
    throw new AiRequestValidationError('Ảnh phải là JPEG, PNG hoặc WebP và không quá 5 MB.');
  }
}

export function vietnamDayKey(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
}

export function nextQuotaCount(current: unknown, limit: number): number {
  const count = Number.isSafeInteger(current) && Number(current) >= 0 ? Number(current) : 0;
  if (!Number.isSafeInteger(limit) || limit <= 0 || count >= limit) throw new AiQuotaExceededError('AI quota exhausted');
  return count + 1;
}

export async function reserveAiQuota(uid: string, dailyLimit: number, taskType: AiTaskType, now = new Date()) {
  const day = vietnamDayKey(now);
  const requestId = randomUUID();
  const quotaRef = db.collection('users').doc(uid).collection('ai_quota_days').doc(day);
  const logRef = db.collection('ai_usage_logs').doc(requestId);
  const count = await db.runTransaction(async transaction => {
    const quota = await transaction.get(quotaRef);
    const next = nextQuotaCount(quota.data()?.requestCount, dailyLimit);
    transaction.set(quotaRef, {
      day, requestCount: next, dailyLimit, updatedAt: now,
      expiresAt: Timestamp.fromMillis(now.getTime() + 400 * 86_400_000),
    }, { merge: true });
    transaction.create(logRef, {
      requestId, userId: uid, day, taskType, status: 'reserved',
      promptTokens: 0, candidatesTokens: 0, cachedTokens: 0, totalTokens: 0,
      estimatedCostUsd: 0, costRateVersion: AI_COST_RATE_VERSION,
      startedAt: now, timestamp: now,
      expiresAt: Timestamp.fromMillis(now.getTime() + 400 * 86_400_000),
    });
    return next;
  });
  return { requestId, day, used: count, remaining: Math.max(0, dailyLimit - count) };
}

export const AI_COST_RATE_VERSION = 'estimated-2026-09-v1';

const COST_RATES: Record<string, { input: number; output: number }> = {
  gemini: { input: 0.30, output: 2.50 },
  groq: { input: 0.30, output: 0.80 },
  mistral: { input: 0.40, output: 2.00 },
};

export function estimateAiCostUsd(provider: string, promptTokens: number, candidatesTokens: number): number {
  const rate = COST_RATES[provider] ?? COST_RATES.gemini;
  return Number(((Math.max(0, promptTokens) * rate.input + Math.max(0, candidatesTokens) * rate.output) / 1_000_000).toFixed(8));
}

export interface AiUsageInput {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  cachedContentTokenCount?: number;
  totalTokenCount?: number;
}

export async function finalizeAiUsage(
  requestId: string,
  input: { status: 'succeeded' | 'failed'; taskType: AiTaskType; provider?: string; model?: string; usage?: AiUsageInput | null; durationMs: number; errorCode?: string; provenanceCount?: number }
): Promise<void> {
  const usage = input.usage ?? {};
  const promptTokens = Math.max(0, Number(usage.promptTokenCount) || 0);
  const candidatesTokens = Math.max(0, Number(usage.candidatesTokenCount) || 0);
  const cachedTokens = Math.max(0, Number(usage.cachedContentTokenCount) || 0);
  const totalTokens = Math.max(0, Number(usage.totalTokenCount) || promptTokens + candidatesTokens);
  const provider = input.provider ?? 'none';
  await db.collection('ai_usage_logs').doc(requestId).set({
    status: input.status,
    taskType: input.taskType,
    provider,
    model: input.model ?? 'none',
    promptTokens,
    candidatesTokens,
    cachedTokens,
    totalTokens,
    estimatedCostUsd: estimateAiCostUsd(provider, promptTokens, candidatesTokens),
    durationMs: Math.max(0, Math.round(input.durationMs)),
    provenanceCount: Math.max(0, input.provenanceCount ?? 0),
    ...(input.errorCode ? { errorCode: input.errorCode.slice(0, 80) } : {}),
    completedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function recordAuxiliaryAiUsage(
  parentRequestId: string,
  uid: string,
  taskType: Extract<AiTaskType, 'rewrite' | 'summary' | 'diagnose' | 'consolidate'>,
  provider: string,
  model: string,
  usage: AiUsageInput,
  durationMs = 0,
  now = new Date()
): Promise<void> {
  const requestId = `${parentRequestId}-${taskType}-${randomUUID().slice(0, 8)}`;
  const promptTokens = Math.max(0, Number(usage.promptTokenCount) || 0);
  const candidatesTokens = Math.max(0, Number(usage.candidatesTokenCount) || 0);
  const estimatedCostUsd = estimateAiCostUsd(provider, promptTokens, candidatesTokens);
  await db.collection('ai_usage_logs').doc(requestId).set({
    requestId, parentRequestId, userId: uid, day: vietnamDayKey(now), taskType,
    status: 'succeeded', provider, model, promptTokens, candidatesTokens,
    cachedTokens: Math.max(0, Number(usage.cachedContentTokenCount) || 0),
    totalTokens: Math.max(0, Number(usage.totalTokenCount) || promptTokens + candidatesTokens),
    estimatedCostUsd,
    costRateVersion: AI_COST_RATE_VERSION, durationMs: Math.max(0, Math.round(durationMs)),
    startedAt: now, completedAt: now, timestamp: now,
    expiresAt: Timestamp.fromMillis(now.getTime() + 400 * 86_400_000),
  });
  await recordProductMetric(uid, { ai: true, aiCostUsd: estimatedCostUsd }, now)
    .catch(error => console.error('Auxiliary AI metric write failed', error));
}

export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 20_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
