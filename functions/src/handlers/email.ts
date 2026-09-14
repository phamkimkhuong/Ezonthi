import { getAuth } from 'firebase-admin/auth';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db } from '../config.js';
import { requireTeacher } from '../services/access.js';
import { BROADCAST_SIZE, deliverEmailBatch, parseBatch, parseEmailContent, parseRecipients } from '../services/emailDelivery.js';

async function getDirectory(refresh = false) {
  const ref = db.collection('system').doc('email_directory');
  const existing = await ref.get();
  if (!refresh && existing.exists && existing.data()?.source === 'firebase-auth-v1') return existing.data()!;
  const directory = new Set<string>();
  let pageToken: string | undefined;
  do {
    const page = await getAuth().listUsers(1000, pageToken);
    for (const user of page.users) if (!user.disabled && user.email) directory.add(user.email.trim().toLowerCase());
    pageToken = page.pageToken;
  } while (pageToken);
  const emails = [...directory].sort();
  const data = { source: 'firebase-auth-v1', emails, totalCount: emails.length, updatedAt: new Date().toISOString() };
  await ref.set(data);
  return data;
}

export const sendResendEmail = onCall({ cors: true, timeoutSeconds: 60 }, async request => {
  const uid = await requireTeacher(request);
  const input = request.data || {};
  const content = parseEmailContent(input);
  const recipients = parseRecipients(input.to, 5);
  return deliverEmailBatch(db, uid, recipients, content);
});

export const syncEmailDirectory = onCall({ cors: true }, async request => {
  await requireTeacher(request);
  const data = await getDirectory(true);
  return { success: true, ...data, message: `Đã đồng bộ ${data.totalCount} email học viên.` };
});

export const getEmailDirectory = onCall({ cors: true }, async request => {
  await requireTeacher(request);
  return { success: true, ...await getDirectory() };
});

export const sendBroadcastBatch = onCall({ cors: true, timeoutSeconds: 60 }, async request => {
  const uid = await requireTeacher(request);
  const input = request.data || {};
  const content = parseEmailContent(input);
  const batchIndex = parseBatch(input);
  const directory = await getDirectory();
  const emails = directory.emails as string[];
  const selected = emails.slice(batchIndex * BROADCAST_SIZE, (batchIndex + 1) * BROADCAST_SIZE);
  if (!selected.length) throw new HttpsError('invalid-argument', 'Đợt gửi không có người nhận.');
  const recipients = parseRecipients(selected, BROADCAST_SIZE);
  const result = await deliverEmailBatch(db, uid, recipients, content);
  return {
    ...result, batchIndex, totalBatches: Math.ceil(emails.length / BROADCAST_SIZE),
    failedCount: 0, totalRecipientsInBatch: recipients.length, totalSystemEmails: emails.length,
  };
});
