import { createHash } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import type { Firestore } from 'firebase-admin/firestore';

export const BROADCAST_SIZE = 95;
export const DAILY_EMAIL_LIMIT = 100;
export interface EmailContent { from: string; subject: string; html: string }

export function parseEmailContent(input: Record<string, unknown>): EmailContent {
  if ('apiKey' in input) throw new HttpsError('invalid-argument', 'API key chỉ được cấu hình trên server.');
  const sender = process.env.RESEND_FROM_EMAIL || 'thongbao@ezonthi.com';
  if (input.fromEmail !== undefined && input.fromEmail !== sender) {
    throw new HttpsError('invalid-argument', 'Địa chỉ người gửi không được phép.');
  }
  const name = input.fromName ?? 'Ban Giáo Dục ezonthi';
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || /[<>\r\n]/.test(name)) {
    throw new HttpsError('invalid-argument', 'Tên người gửi không hợp lệ.');
  }
  if (typeof input.subject !== 'string' || !input.subject.trim() || input.subject.length > 200 || /[\r\n]/.test(input.subject) ||
      typeof input.html !== 'string' || !input.html.trim() || Buffer.byteLength(input.html) > 200_000) {
    throw new HttpsError('invalid-argument', 'Tiêu đề hoặc nội dung email không hợp lệ.');
  }
  return { from: `${name.trim()} <${sender}>`, subject: input.subject.trim(), html: input.html };
}

export function parseRecipients(value: unknown, max: number): string[] {
  const list = Array.isArray(value) ? value : [value];
  if (!list.length || list.length > max || list.some(v => typeof v !== 'string' || v.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(v.trim()))) {
    throw new HttpsError('invalid-argument', `Cần từ 1 đến ${max} địa chỉ email hợp lệ.`);
  }
  return [...new Set((list as string[]).map(v => v.trim().toLowerCase()))].sort();
}

export function parseBatch(input: Record<string, unknown>): number {
  if (input.batchSize !== undefined && input.batchSize !== BROADCAST_SIZE) {
    throw new HttpsError('invalid-argument', 'Mỗi đợt gửi có tối đa 95 người nhận.');
  }
  const index = input.batchIndex ?? 0;
  if (typeof index !== 'number' || !Number.isSafeInteger(index) || index < 0 || index > 100_000) {
    throw new HttpsError('invalid-argument', 'Số thứ tự đợt gửi không hợp lệ.');
  }
  return index;
}

export async function deliverEmailBatch(
  db: Firestore, uid: string, recipients: string[], content: EmailContent,
  requestFetch: typeof fetch = fetch, now = Date.now(),
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new HttpsError('failed-precondition', 'Chưa cấu hình dịch vụ email trên server.');
  const day = new Date(now + 7 * 3_600_000).toISOString().slice(0, 10);
  const payload = recipients.map(to => ({ ...content, to: [to] }));
  const jobId = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const jobRef = db.collection('email_jobs').doc(jobId);
  const quotaRef = db.collection('email_daily_usage').doc(day);
  const cached = await db.runTransaction(async tx => {
    const job = (await tx.get(jobRef)).data();
    const quota = (await tx.get(quotaRef)).data();
    if (job?.status === 'sent') return job.result as { success: boolean; id: string; sentCount: number; message: string };
    if (job?.leaseUntil > now) throw new HttpsError('aborted', 'Đợt email này đang được xử lý.');
    if (job && now - job.createdAt >= 23 * 3_600_000) {
      throw new HttpsError('failed-precondition', 'Cần đối soát đợt gửi cũ trước khi thử lại.');
    }
    if (!job || job.reservedDay !== day) {
      const used = quota?.reservedRecipients ?? 0;
      if (used + recipients.length > DAILY_EMAIL_LIMIT) {
        throw new HttpsError('resource-exhausted', `Hạn mức email còn ${Math.max(0, DAILY_EMAIL_LIMIT - used)} người nhận hôm nay.`);
      }
      tx.set(quotaRef, { reservedRecipients: used + recipients.length, updatedAt: new Date(now) });
    }
    tx.set(jobRef, {
      reservedDay: day, requestedBy: uid, recipientCount: recipients.length, status: 'sending',
      createdAt: job?.createdAt ?? now, leaseUntil: now + 90_000,
    }, { merge: true });
    return null;
  });
  if (cached) return cached;
  try {
    const response = await requestFetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': jobId },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(30_000),
    });
    const body = await response.json() as { data?: { id: string }[] };
    if (!response.ok || !Array.isArray(body.data) || body.data.length !== recipients.length || body.data.some(v => !v.id)) {
      throw new Error(`Resend rejected or returned incomplete batch (${response.status})`);
    }
    const result = { success: true, id: jobId, sentCount: recipients.length, message: `Đã gửi thành công tới ${recipients.length} người nhận.` };
    await jobRef.update({ status: 'sent', leaseUntil: 0, result, providerIds: body.data.map(v => v.id) });
    return result;
  } catch (error) {
    // Reservations survive uncertain delivery; retries reuse the provider key.
    await jobRef.update({ status: 'retryable', leaseUntil: 0 }).catch(() => undefined);
    console.error('Email delivery failed', error);
    throw new HttpsError('unavailable', 'Chưa xác nhận gửi thành công. Có thể thử lại cùng nội dung mà không tạo đợt trùng với cùng nội dung.');
  }
}
