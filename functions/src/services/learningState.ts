import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validateAnswer } from '../generated/answerValidator.js';
import { calculateMasteryEvidence } from '../generated/theme.js';
import type { Question, UserAttempt, UserMistake } from '../generated/types.js';

export interface CanonicalAttempt extends UserAttempt {
  canonicalVersion: 2;
  contentHash: string;
  gradingStatus: 'graded' | 'pending';
  ingestedAt: string;
  historyBucket: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

let catalog: Record<string, Question> | undefined;
export function getLearningCatalog(): Record<string, Question> {
  catalog ??= JSON.parse(readFileSync(new URL('../../content/answer-catalog.json', import.meta.url), 'utf8'));
  return catalog!;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, stableValue(item)]));
  }
  return value;
}

export function recordHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

export function safeRecordId(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function safeProofImages(value: unknown): UserAttempt['proofImages'] {
  if (!Array.isArray(value) || value.length > 4 || Buffer.byteLength(JSON.stringify(value)) > 100_000) return undefined;
  return value as UserAttempt['proofImages'];
}

export function canonicalizeAttempt(uid: string, raw: unknown, now = Date.now(), questions = getLearningCatalog()): CanonicalAttempt | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  if (typeof input.id !== 'string' || !input.id || input.id.length > 200 || input.id.includes('/') ||
      typeof input.questionId !== 'string' || !Object.hasOwn(questions, input.questionId) ||
      typeof input.userAnswer !== 'string' || input.userAnswer.length > 10_000 ||
      typeof input.createdAt !== 'string') return null;
  const createdAt = Date.parse(input.createdAt);
  if (!Number.isFinite(createdAt) || createdAt > now + 300_000) return null;
  if (input.finalAnswer !== undefined && (!input.finalAnswer || typeof input.finalAnswer !== 'object' || Array.isArray(input.finalAnswer) ||
      Object.values(input.finalAnswer as Record<string, unknown>).some(value => typeof value !== 'string' || value.length > 2_000))) return null;

  const question = questions[input.questionId];
  const manual = question.validatorType === 'manual' || question.answerSchema?.autoCheckMode === 'manual' || input.gradingMode === 'manual';
  const answer = question.answerSchema ? (input.finalAnswer ?? input.userAnswer) : input.userAnswer;
  let isCorrect = false;
  if (!manual) {
    try { isCorrect = validateAnswer(question, answer as never); } catch { return null; }
  }
  const core = {
    id: input.id, userId: uid, questionId: input.questionId, questionTypeId: question.questionTypeId,
    userAnswer: input.userAnswer, ...(input.finalAnswer ? { finalAnswer: input.finalAnswer as Record<string, string> } : {}),
    ...(safeProofImages(input.proofImages) ? { proofImages: safeProofImages(input.proofImages) } : {}),
    gradingMode: manual ? 'manual' as const : 'auto' as const,
    gradingStatus: manual ? 'pending' as const : 'graded' as const,
    isCorrect, timeSpent: Math.max(0, Math.min(600, Number(input.timeSpent) || 0)),
    createdAt: new Date(createdAt).toISOString(),
    ...(typeof input.selectedSubTense === 'string' && input.selectedSubTense.length <= 100 ? { selectedSubTense: input.selectedSubTense } : {}),
  };
  return {
    ...core,
    canonicalVersion: 2,
    contentHash: recordHash(core),
    ingestedAt: new Date(now).toISOString(),
    historyBucket: new Date(createdAt).toISOString().slice(0, 7),
  };
}

function compareAttemptOrder(left: UserAttempt, right: UserAttempt): number {
  return Date.parse(left.createdAt) - Date.parse(right.createdAt) || left.id.localeCompare(right.id);
}

export function summarizeLearning(attempts: UserAttempt[], questions = getLearningCatalog()) {
  const byQuestion = new Map<string, UserAttempt>();
  for (const attempt of attempts) {
    if (!attempt || typeof attempt !== 'object' || typeof attempt.questionId !== 'string' || !Object.hasOwn(questions, attempt.questionId)) continue;
    if ((attempt as CanonicalAttempt).gradingStatus === 'pending') continue;
    const previous = byQuestion.get(attempt.questionId);
    if (!previous || compareAttemptOrder(previous, attempt) < 0) byQuestion.set(attempt.questionId, attempt);
  }
  const byType = new Map<string, UserAttempt[]>();
  const typeCapacity = new Map<string, number>();
  for (const question of Object.values(questions)) typeCapacity.set(question.questionTypeId, (typeCapacity.get(question.questionTypeId) ?? 0) + 1);
  const dailyActivity: Record<string, number> = {};
  let correctAttempts = 0;
  let totalStudySeconds = 0;
  for (const attempt of byQuestion.values()) {
    const list = byType.get(attempt.questionTypeId) ?? [];
    list.push(attempt); byType.set(attempt.questionTypeId, list);
    if (attempt.isCorrect) correctAttempts++;
    totalStudySeconds += Math.max(0, Math.min(600, Number(attempt.timeSpent) || 0));
    const date = new Date(attempt.createdAt).toISOString().slice(0, 10);
    dailyActivity[date] = (dailyActivity[date] ?? 0) + 1;
  }
  const retentionCutoff = new Date(Date.now() - 180 * 86_400_000).toISOString().slice(0, 10);
  for (const date of Object.keys(dailyActivity)) {
    if (date < retentionCutoff) delete dailyActivity[date];
  }
  const masteryEvidence = Object.fromEntries([...byType].map(([id, items]) => [id, calculateMasteryEvidence(items, typeCapacity.get(id))]));
  const masteryLevels = Object.fromEntries(Object.entries(masteryEvidence).map(([id, evidence]) => [id, evidence.score]));
  const completedLessons = Object.entries(masteryEvidence).filter(([, evidence]) => evidence.hasEnoughEvidence && evidence.score >= 70).map(([id]) => id);
  return {
    masteryLevels, masteryEvidence, completedLessons, completedCount: completedLessons.length,
    stats: {
      totalAttempts: byQuestion.size, correctAttempts, totalStudySeconds, dailyActivity,
      xpScore: correctAttempts * 15 + completedLessons.length * 100,
      source: 'server-checked-v2', timeSource: 'self-reported-capped',
    },
  };
}

export function deriveMistake(uid: string, questionId: string, attempts: UserAttempt[], now = Date.now()): UserMistake | null {
  const relevant = attempts.filter(item => item.questionId === questionId && (item as CanonicalAttempt).gradingStatus !== 'pending').sort(compareAttemptOrder);
  if (!relevant.length) return null;
  const latest = relevant[relevant.length - 1];
  const wrong = relevant.filter(item => !item.isCorrect);
  const proofImages = latest.isCorrect ? wrong[wrong.length - 1]?.proofImages : latest.proofImages;
  return {
    id: safeRecordId(questionId), userId: uid, questionId, questionTypeId: latest.questionTypeId,
    wrongAnswer: latest.isCorrect ? (wrong[wrong.length - 1]?.userAnswer ?? '') : latest.userAnswer,
    ...(proofImages ? { proofImages } : {}),
    reviewStatus: latest.isCorrect ? 'fixed' : (wrong.length > 1 ? 'reviewing' : 'new'),
    reviewCount: wrong.length, lastAttemptedAt: latest.createdAt,
    nextReviewAt: new Date(now + (latest.isCorrect ? 30 : wrong.length >= 3 ? 7 : wrong.length === 2 ? 3 : 1) * 86_400_000).toISOString(),
    ...(latest.teacherFeedback ? { teacherFeedback: latest.teacherFeedback } : {}),
    canonicalVersion: 2,
  } as UserMistake;
}

export interface ExistingLearningSummary {
  masteryLevels?: Record<string, number>;
  masteryEvidence?: Record<string, any>;
  completedLessons?: string[];
  completedCount?: number;
  stats?: {
    totalAttempts?: number;
    correctAttempts?: number;
    totalStudySeconds?: number;
    dailyActivity?: Record<string, number>;
    xpScore?: number;
    source?: string;
    timeSource?: string;
  };
}

export function updateLearningSummaryIncremental(
  existing: ExistingLearningSummary,
  affectedTypeIds: string[],
  pastAttemptsForAffectedTypes: UserAttempt[],
  acceptedAttempts: UserAttempt[],
  questions = getLearningCatalog(),
  now = Date.now()
) {
  const typeCapacity = new Map<string, number>();
  for (const question of Object.values(questions)) {
    typeCapacity.set(question.questionTypeId, (typeCapacity.get(question.questionTypeId) ?? 0) + 1);
  }

  const masteryLevels = { ...(existing.masteryLevels || {}) };
  const masteryEvidence = { ...(existing.masteryEvidence || {}) };
  const completedLessonsSet = new Set(existing.completedLessons || []);
  const oldStats = existing.stats || {};
  let totalAttempts = oldStats.totalAttempts || 0;
  let correctAttempts = oldStats.correctAttempts || 0;
  let totalStudySeconds = oldStats.totalStudySeconds || 0;
  const dailyActivity = { ...(oldStats.dailyActivity || {}) };

  for (const typeId of affectedTypeIds) {
    const pastForType = pastAttemptsForAffectedTypes.filter(
      a => a && a.questionTypeId === typeId && (a as CanonicalAttempt).gradingStatus !== 'pending' && Object.hasOwn(questions, a.questionId)
    );
    const oldLatestByQuestion = new Map<string, UserAttempt>();
    for (const attempt of pastForType) {
      const prev = oldLatestByQuestion.get(attempt.questionId);
      if (!prev || compareAttemptOrder(prev, attempt) < 0) {
        oldLatestByQuestion.set(attempt.questionId, attempt);
      }
    }

    const newForType = acceptedAttempts.filter(
      a => a && a.questionTypeId === typeId && (a as CanonicalAttempt).gradingStatus !== 'pending' && Object.hasOwn(questions, a.questionId)
    );

    const combinedForType = [...pastForType, ...newForType];
    const newLatestByQuestion = new Map<string, UserAttempt>();
    for (const attempt of combinedForType) {
      const prev = newLatestByQuestion.get(attempt.questionId);
      if (!prev || compareAttemptOrder(prev, attempt) < 0) {
        newLatestByQuestion.set(attempt.questionId, attempt);
      }
    }

    for (const [qid, newLatest] of newLatestByQuestion.entries()) {
      const oldLatest = oldLatestByQuestion.get(qid);
      if (!oldLatest) {
        totalAttempts++;
        if (newLatest.isCorrect) correctAttempts++;
        totalStudySeconds += Math.max(0, Math.min(600, Number(newLatest.timeSpent) || 0));
        const date = new Date(newLatest.createdAt).toISOString().slice(0, 10);
        dailyActivity[date] = (dailyActivity[date] ?? 0) + 1;
      } else if (oldLatest.id !== newLatest.id) {
        if (!oldLatest.isCorrect && newLatest.isCorrect) correctAttempts++;
        else if (oldLatest.isCorrect && !newLatest.isCorrect) correctAttempts = Math.max(0, correctAttempts - 1);

        const oldTime = Math.max(0, Math.min(600, Number(oldLatest.timeSpent) || 0));
        const newTime = Math.max(0, Math.min(600, Number(newLatest.timeSpent) || 0));
        totalStudySeconds = Math.max(0, totalStudySeconds + (newTime - oldTime));

        const oldDate = new Date(oldLatest.createdAt).toISOString().slice(0, 10);
        const newDate = new Date(newLatest.createdAt).toISOString().slice(0, 10);
        if (oldDate !== newDate) {
          dailyActivity[oldDate] = Math.max(0, (dailyActivity[oldDate] ?? 1) - 1);
          if (dailyActivity[oldDate] === 0) delete dailyActivity[oldDate];
          dailyActivity[newDate] = (dailyActivity[newDate] ?? 0) + 1;
        }
      }
    }

    const capacity = typeCapacity.get(typeId);
    const evidence = calculateMasteryEvidence([...newLatestByQuestion.values()], capacity);
    masteryEvidence[typeId] = evidence;
    masteryLevels[typeId] = evidence.score;

    if (evidence.hasEnoughEvidence && evidence.score >= 70) {
      completedLessonsSet.add(typeId);
    } else {
      completedLessonsSet.delete(typeId);
    }
  }

  const retentionCutoff = new Date(now - 180 * 86_400_000).toISOString().slice(0, 10);
  for (const date of Object.keys(dailyActivity)) {
    if (date < retentionCutoff) delete dailyActivity[date];
  }

  const completedLessons = [...completedLessonsSet];
  const completedCount = completedLessons.length;
  const xpScore = correctAttempts * 15 + completedCount * 100;

  return {
    masteryLevels,
    masteryEvidence,
    completedLessons,
    completedCount,
    stats: {
      totalAttempts,
      correctAttempts,
      totalStudySeconds,
      dailyActivity,
      xpScore,
      source: 'server-checked-v2',
      timeSource: 'self-reported-capped',
    },
  };
}
