import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { db } from '../config.js';
import { requireTeacher, requireUser } from '../services/access.js';
import { migrateUserLearningData } from '../services/learningData.js';
import { getLearningCatalog, summarizeLearning } from '../services/learningState.js';
import type { UserAttempt } from '../generated/types.js';

export { summarizeLearning } from '../services/learningState.js';

/** Rebuild the trusted projection from the canonical per-attempt collection. */
export const refreshLearningSummary = onCall({ cors: true, timeoutSeconds: 120, memory: '512MiB' }, async request => {
  const caller = requireUser(request);
  const uid = request.data?.userId ?? caller;
  if (typeof uid !== 'string' || !uid || uid.includes('/')) {
    throw new HttpsError('invalid-argument', 'User ID không hợp lệ.');
  }
  if (uid !== caller) await requireTeacher(request);

  try {
    await migrateUserLearningData(uid);
    const userRef = db.collection('users').doc(uid);
    const snapshot = await userRef.collection('learning_attempts').get();
    const summary = summarizeLearning(snapshot.docs.map(doc => doc.data() as UserAttempt), getLearningCatalog());
    await userRef.set({ ...summary, learningDataVersion: 2, lastActiveAt: new Date().toISOString() }, { merge: true });
    return summary;
  } catch (error) {
    console.error('Trusted learning summary failed', error);
    throw new HttpsError('aborted', 'Chưa thể tổng hợp dữ liệu học đã kiểm chứng.');
  }
});
