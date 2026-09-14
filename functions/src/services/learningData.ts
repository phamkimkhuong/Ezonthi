import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { recordProductMetric } from './productMetrics.js';
import { db } from '../config.js';
import type { UserMistake } from '../generated/types.js';
import { canonicalizeAttempt, deriveMistake, getLearningCatalog, recordHash, safeRecordId, summarizeLearning, type CanonicalAttempt } from './learningState.js';

export const SYNC_BATCH_SIZE = 50;

export async function syncCanonicalAttempts(uid: string, rawAttempts: unknown[], operationId?: string, now = Date.now()) {
  const normalized = rawAttempts.map(item => canonicalizeAttempt(uid, item, now)).filter((item): item is CanonicalAttempt => item !== null);
  const rejectedCount = rawAttempts.length - normalized.length;
  const unique = [...new Map(normalized.map(item => [item.id, item])).values()];
  if (unique.length > SYNC_BATCH_SIZE) throw new Error(`A sync batch may contain at most ${SYNC_BATCH_SIZE} attempts`);
  const attemptsRef = db.collection('users').doc(uid).collection('learning_attempts');
  const userRef = db.collection('users').doc(uid);
  const result = await db.runTransaction(async transaction => {
    const [snapshot, user] = await Promise.all([transaction.get(attemptsRef), transaction.get(userRef)]);
    const existing = new Map(snapshot.docs.map(doc => [doc.id, doc.data() as CanonicalAttempt]));
    const accepted: CanonicalAttempt[] = [];
    const conflicts: string[] = [];
    for (const attempt of unique) {
      const current = existing.get(attempt.id);
      if (!current) { existing.set(attempt.id, attempt); accepted.push(attempt); }
      else if (current.contentHash !== attempt.contentHash) conflicts.push(attempt.id);
    }
    const all = [...existing.values()];
    const summary = summarizeLearning(all);
    for (const attempt of accepted) {
      transaction.create(attemptsRef.doc(attempt.id), attempt);
      if (attempt.gradingStatus === 'pending') {
        const queueId = safeRecordId(`${uid}:${attempt.id}`);
        const profile = user.data() || {};
        transaction.set(db.collection('manual_attempts').doc(queueId), {
          ...attempt, queueId, studentName: profile.name || 'Học sinh mới', studentAvatar: profile.avatar || '',
          studentEmail: profile.email || '', queuedAt: FieldValue.serverTimestamp(),
        });
      }
    }
    for (const questionId of new Set(accepted.map(item => item.questionId))) {
      const mistake = deriveMistake(uid, questionId, all, now);
      if (mistake) transaction.set(userRef.collection('learning_mistakes').doc(safeRecordId(questionId)), mistake);
    }
    transaction.set(userRef, { ...summary, lastActiveAt: new Date(now).toISOString(), learningDataVersion: 2 }, { merge: true });
    if (operationId && /^[A-Za-z0-9_-]{8,160}$/.test(operationId)) {
      transaction.set(userRef.collection('learning_sync_ops').doc(operationId), {
        acceptedIds: accepted.map(item => item.id), conflictIds: conflicts,
        rejectedCount, completedAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(now + 30 * 86_400_000),
      });
    }
    return {
      acknowledgedIds: unique.filter(item => !conflicts.includes(item.id)).map(item => item.id),
      acceptedIds: accepted.map(item => item.id),
      conflictIds: conflicts,
      rejectedCount,
      summary,
    };
  });
  if (result.acceptedIds.length > 0) {
    const acceptedById = new Set(result.acceptedIds);
    const measured = unique.filter(item => acceptedById.has(item.id) && item.gradingStatus === 'graded');
    await recordProductMetric(uid, {
      learning: true,
      attemptCount: measured.length,
      correctAttemptCount: measured.filter(item => item.isCorrect).length,
      masteredOutcomeCount: result.summary.completedCount,
    }).catch(error => console.error('Learning metric write failed', error));
  }
  return result;
}

function latestMistakes(items: UserMistake[]): UserMistake[] {
  const map = new Map<string, UserMistake>();
  for (const item of items) {
    if (!item || typeof item.questionId !== 'string' || !item.questionId) continue;
    const previous = map.get(item.questionId);
    if (!previous || Date.parse(item.lastAttemptedAt || '') >= Date.parse(previous.lastAttemptedAt || '')) map.set(item.questionId, item);
  }
  return [...map.values()];
}

export async function migrateUserLearningData(uid: string, now = Date.now()) {
  const userRef = db.collection('users').doc(uid);
  const markerRef = userRef.collection('learning_migrations').doc('canonical-v2');
  const marker = await markerRef.get();
  if (marker.data()?.verified === true) return marker.data();
  const [topics, legacyAttempts, activeMistakes, legacyMistakes, manual, legacyReviews] = await Promise.all([
    userRef.collection('topic_attempts').get(), userRef.collection('attempts').get(),
    userRef.collection('active_mistakes').doc('current').get(), userRef.collection('mistakes').get(),
    db.collection('manual_attempts').where('userId', '==', uid).get(),
    userRef.collection('teacher_reviews').get(),
  ]);
  const rawAttempts = [
    ...topics.docs.flatMap(doc => Array.isArray(doc.data().attempts) ? doc.data().attempts : []),
    ...legacyAttempts.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    ...manual.docs.map(doc => ({ id: doc.data().id || doc.id, ...doc.data(), gradingMode: 'manual' })),
  ];
  const normalized = rawAttempts.map(item => canonicalizeAttempt(uid, item, now)).filter((item): item is CanonicalAttempt => item !== null);
  const unique = [...new Map(normalized.map(item => [item.id, item])).values()];
  for (let index = 0; index < unique.length; index += SYNC_BATCH_SIZE) await syncCanonicalAttempts(uid, unique.slice(index, index + SYNC_BATCH_SIZE), `migration-${index}-${recordHash(unique.slice(index, index + SYNC_BATCH_SIZE).map(item => item.id)).slice(0, 16)}`, now);

  let migratedReviewCount = 0;
  for (const reviewDoc of legacyReviews.docs) {
    const review = reviewDoc.data();
    const attemptId = typeof review.id === 'string' ? review.id : reviewDoc.id;
    if (typeof review.isCorrect !== 'boolean' || !attemptId || attemptId.includes('/')) continue;
    const attempt = await userRef.collection('learning_attempts').doc(attemptId).get();
    if (!attempt.exists || (attempt.data() as CanonicalAttempt).gradingStatus !== 'pending') continue;
    await gradeCanonicalAttempt('legacy-migration', uid, attemptId, review.isCorrect, typeof review.teacherFeedback === 'string' ? review.teacherFeedback.slice(0, 5_000) : '', now);
    migratedReviewCount++;
  }

  const currentMistakes = await userRef.collection('learning_mistakes').get();
  const existingQuestions = new Set(currentMistakes.docs.map(doc => doc.data().questionId));
  const questions = getLearningCatalog();
  const oldMistakes = latestMistakes([
    ...(Array.isArray(activeMistakes.data()?.mistakes) ? activeMistakes.data()!.mistakes : []),
    ...legacyMistakes.docs.map(doc => doc.data() as UserMistake),
  ]).filter(item => !existingQuestions.has(item.questionId) && Object.hasOwn(questions, item.questionId));
  for (let index = 0; index < oldMistakes.length; index += 400) {
    const batch = db.batch();
    for (const item of oldMistakes.slice(index, index + 400)) {
      const question = questions[item.questionId];
      const lastAttemptedAt = Number.isFinite(Date.parse(item.lastAttemptedAt)) ? new Date(item.lastAttemptedAt).toISOString() : new Date(now).toISOString();
      batch.set(userRef.collection('learning_mistakes').doc(safeRecordId(item.questionId)), {
        id: safeRecordId(item.questionId), userId: uid, questionId: item.questionId, questionTypeId: question.questionTypeId,
        wrongAnswer: typeof item.wrongAnswer === 'string' ? item.wrongAnswer.slice(0, 10_000) : '',
        reviewStatus: ['new', 'reviewing', 'fixed'].includes(item.reviewStatus) ? item.reviewStatus : 'new',
        reviewCount: Math.max(1, Math.min(10_000, Number(item.reviewCount) || 1)), lastAttemptedAt,
        nextReviewAt: Number.isFinite(Date.parse(item.nextReviewAt)) ? new Date(item.nextReviewAt).toISOString() : new Date(now + 86_400_000).toISOString(),
        canonicalVersion: 2, migratedFrom: 'legacy-v1',
      });
    }
    await batch.commit();
  }

  const verified = await userRef.collection('learning_attempts').get();
  const verifiedMap = new Map(verified.docs.map(doc => [doc.id, doc.data().contentHash]));
  const missingIds = unique.filter(item => verifiedMap.get(item.id) !== item.contentHash).map(item => item.id);
  if (missingIds.length) throw new Error(`Learning migration verification failed for ${missingIds.length} attempts`);
  const report = {
    verified: true, sourceAttemptCount: rawAttempts.length, validUniqueAttemptCount: unique.length,
    rejectedAttemptCount: rawAttempts.length - normalized.length, canonicalAttemptCount: verified.size,
    migratedMistakeCount: oldMistakes.length,
    migratedReviewCount,
    sourceChecksum: recordHash(unique.map(item => `${item.id}:${item.contentHash}`).sort()),
    canonicalChecksum: recordHash(unique.map(item => `${item.id}:${verifiedMap.get(item.id)}`).sort()),
    verifiedAt: new Date(now).toISOString(),
  };
  await markerRef.set(report);
  return report;
}

export async function gradeCanonicalAttempt(teacherUid: string, uid: string, attemptId: string, isCorrect: boolean, feedback: string, now = Date.now()) {
  const userRef = db.collection('users').doc(uid);
  const attemptRef = userRef.collection('learning_attempts').doc(attemptId);
  return db.runTransaction(async transaction => {
    const [attemptDoc, allSnapshot] = await Promise.all([transaction.get(attemptRef), transaction.get(userRef.collection('learning_attempts'))]);
    if (!attemptDoc.exists) throw new Error('Attempt not found in canonical store');
    const attempt = attemptDoc.data() as CanonicalAttempt;
    if (attempt.gradingStatus === 'graded') {
      if (attempt.isCorrect === isCorrect && (attempt.teacherFeedback || '') === feedback) return { status: 'duplicate' };
      throw new Error('Attempt was already graded with a different result');
    }
    const reviewed: CanonicalAttempt = { ...attempt, isCorrect, gradingStatus: 'graded', teacherFeedback: feedback, reviewedAt: new Date(now).toISOString(), reviewedBy: teacherUid };
    const all = allSnapshot.docs.map(doc => doc.id === attemptId ? reviewed : doc.data() as CanonicalAttempt);
    const summary = summarizeLearning(all, getLearningCatalog());
    const mistake = deriveMistake(uid, reviewed.questionId, all, now);
    transaction.set(attemptRef, reviewed);
    transaction.set(userRef.collection('learning_reviews').doc(attemptId), { attemptId, userId: uid, isCorrect, feedback, reviewedBy: teacherUid, reviewedAt: new Date(now).toISOString(), canonicalVersion: 2 });
    if (mistake) transaction.set(userRef.collection('learning_mistakes').doc(safeRecordId(reviewed.questionId)), mistake);
    transaction.delete(db.collection('manual_attempts').doc(safeRecordId(`${uid}:${attemptId}`)));
    transaction.delete(db.collection('manual_attempts').doc(attemptId));
    transaction.set(userRef, { ...summary, lastActiveAt: new Date(now).toISOString(), learningDataVersion: 2 }, { merge: true });
    return { status: 'graded', summary };
  });
}
