import { DataService } from './dataService';
import type { UserAttempt } from './masteryService';
import type { MobileMistake } from './mistakeService';
import { calculateMasteryEvidence, getStarsFromScore } from '../../src/utils/theme';
import type { UserAttempt as SharedAttempt } from '../../src/types';
import type { GradeId } from '../stores/useUserStore';
import type { Exam, ExamResult } from './examService';

export const MOBILE_CONTENT_PREFIX = 'mobile-v1-';
export const accountScope = (uid?: string | null) => uid ? `user:${uid}` : 'guest';
export const newLocalId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;

export interface CanonicalRecord {
  id: string;
  questionId: string;
  questionTypeId: string;
  userAnswer: string;
  createdAt: string;
  timeSpent: number;
  isCorrect: boolean;
  gradingStatus?: 'pending' | 'graded';
  reviewedAt?: string;
  ingestedAt?: string;
  teacherFeedback?: string;
}
export interface SyncBatch { operationId: string; attemptIds: string[] }
export interface ExamDraft {
  sessionId: string;
  exam: Exam;
  startedAt: number;
  deadlineAt: number;
  answers: Record<string, string>;
  currentIndex: number;
  submittedAt?: number;
  result?: ExamResult;
}
export interface LearningAccount {
  selectedGrade: GradeId;
  attempts: UserAttempt[];
  canonicalRecords: Record<string, CanonicalRecord>;
  serverXp: number;
  batch: SyncBatch | null;
  syncError: string | null;
  lastSyncedAt: string | null;
  examDrafts: Record<string, ExamDraft>;
  vocabulary: { mastered: string[]; starred: string[]; quizScores: Record<string, number>; migrated?: boolean };
}
export const emptyAccount = (): LearningAccount => ({
  selectedGrade: 'grade9', attempts: [], canonicalRecords: {}, serverXp: 0,
  batch: null, syncError: null, lastSyncedAt: null, examDrafts: {},
  vocabulary: { mastered: [], starred: [], quizScores: {} },
});

export function canonicalPayload(attempt: UserAttempt) {
  const scope = DataService.getTopicScope(attempt.topicId);
  if (!scope || scope.subjectId !== attempt.subjectId ||
      !DataService.getQuestionsForTopic(attempt.topicId, scope.gradeId).some(q => q.id === attempt.questionId)) return null;
  return {
    id: attempt.id, questionId: `${MOBILE_CONTENT_PREFIX}${attempt.questionId}`,
    userAnswer: attempt.selectedAnswer, createdAt: attempt.answeredAt,
    timeSpent: attempt.timeSpent || 0,
  };
}

export function fromCanonical(record: CanonicalRecord): UserAttempt | null {
  if (!record.questionId.startsWith(MOBILE_CONTENT_PREFIX)) return null;
  const questionId = record.questionId.slice(MOBILE_CONTENT_PREFIX.length);
  const question = DataService.getAllQuestions().find(q => q.id === questionId);
  if (!question) return null;
  return {
    id: record.id, questionId, topicId: question.topicId, subjectId: question.subjectId,
    selectedAnswer: record.userAnswer, answeredAt: record.createdAt, isCorrect: record.isCorrect,
    timeSpent: record.timeSpent, syncStatus: 'acknowledged', gradingStatus: record.gradingStatus,
    teacherFeedback: record.teacherFeedback,
  };
}

export function mergeCanonical(account: LearningAccount, records: CanonicalRecord[], serverXp: number): LearningAccount {
  const canonicalRecords = { ...account.canonicalRecords };
  const attempts = new Map(account.attempts.map(a => [a.id, a]));
  for (const record of records) {
    const previous = canonicalRecords[record.id];
    const version = (item: CanonicalRecord) => Date.parse(item.reviewedAt || item.ingestedAt || item.createdAt);
    if (previous && version(previous) > version(record)) continue;
    canonicalRecords[record.id] = record;
    // A local pending attempt stays pending until the callable explicitly ACKs it.
    const local = attempts.get(record.id);
    const projected = fromCanonical(record);
    if (projected && local?.syncStatus !== 'pending' && local?.syncStatus !== 'blocked') attempts.set(record.id, projected);
    else if (projected && !local) attempts.set(record.id, projected);
  }
  return { ...account, canonicalRecords, serverXp, attempts: [...attempts.values()] };
}

export function prepareBatch(account: LearningAccount): LearningAccount {
  if (account.batch) return account;
  account = { ...account, attempts: account.attempts.map(attempt =>
    attempt.syncStatus === 'pending' && !canonicalPayload(attempt) ? { ...attempt, syncStatus: 'blocked' } : attempt
  ) };
  const attemptIds = account.attempts.filter(a => a.syncStatus === 'pending').slice(0, 50).map(a => a.id);
  return attemptIds.length ? { ...account, batch: { operationId: `mobile_${newLocalId()}`, attemptIds } } : account;
}

export function acknowledgeBatch(account: LearningAccount, operationId: string, acknowledgedIds: string[],
  conflictIds: string[], rejectedCount: number): LearningAccount {
  if (account.batch?.operationId !== operationId) return account;
  const sent = new Set(account.batch.attemptIds);
  const acknowledged = new Set(acknowledgedIds.filter(id => sent.has(id)));
  const conflicts = new Set(conflictIds.filter(id => sent.has(id)));
  const attempts = account.attempts.map(attempt => {
    if (!sent.has(attempt.id)) return attempt;
    if (acknowledged.has(attempt.id)) return fromCanonical(account.canonicalRecords[attempt.id] || {
      id: attempt.id, questionId: `${MOBILE_CONTENT_PREFIX}${attempt.questionId}`,
      questionTypeId: `${MOBILE_CONTENT_PREFIX}${attempt.topicId}`, userAnswer: attempt.selectedAnswer,
      createdAt: attempt.answeredAt, timeSpent: attempt.timeSpent || 0, isCorrect: attempt.isCorrect,
    }) || { ...attempt, syncStatus: 'acknowledged' as const };
    if (conflicts.has(attempt.id) || rejectedCount > 0) return { ...attempt, syncStatus: 'blocked' as const };
    return attempt;
  });
  const remaining = attempts.filter(a => sent.has(a.id) && a.syncStatus === 'pending').map(a => a.id);
  return {
    ...account, attempts,
    batch: remaining.length ? { ...account.batch, attemptIds: account.batch.attemptIds } : null,
    syncError: conflicts.size || rejectedCount ? 'Một số bài bị từ chối hoặc xung đột; bản trên máy vẫn được giữ.' : null,
  };
}

export function importGuest(target: LearningAccount, guest: LearningAccount): LearningAccount {
  const attempts = new Map(target.attempts.map(a => [a.id, a]));
  for (const attempt of guest.attempts) {
    if (!attempts.has(attempt.id)) attempts.set(attempt.id, { ...attempt, syncStatus: 'pending' });
  }
  return { ...target, attempts: [...attempts.values()], examDrafts: { ...guest.examDrafts, ...target.examDrafts },
    vocabulary: {
      mastered: [...new Set([...target.vocabulary.mastered, ...guest.vocabulary.mastered])],
      starred: [...new Set([...target.vocabulary.starred, ...guest.vocabulary.starred])],
      quizScores: Object.fromEntries([...new Set([...Object.keys(target.vocabulary.quizScores), ...Object.keys(guest.vocabulary.quizScores)])]
        .map(key => [key, Math.max(target.vocabulary.quizScores[key] || 0, guest.vocabulary.quizScores[key] || 0)])),
    },
  };
}

export function projectAccount(account: LearningAccount) {
  const latest = new Map<string, UserAttempt>();
  const activity = new Set<string>();
  const vnDay = (timestamp: string | number) => new Date(new Date(timestamp).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
  for (const attempt of account.attempts) {
    if (attempt.gradingStatus === 'pending') continue;
    activity.add(vnDay(attempt.answeredAt));
    const previous = latest.get(attempt.questionId);
    if (!previous || `${attempt.answeredAt}:${attempt.id}` > `${previous.answeredAt}:${previous.id}`) latest.set(attempt.questionId, attempt);
  }
  const topicMastery: Record<string, { score: number; stars: number; hasEnoughEvidence: boolean }> = {};
  const mistakes: MobileMistake[] = [];
  for (const topicId of new Set(account.attempts.map(a => a.topicId))) {
    const topicAttempts = account.attempts.filter(a => a.topicId === topicId && a.gradingStatus !== 'pending');
    const evidence = calculateMasteryEvidence(topicAttempts.map(a => ({
      id: a.id, questionId: a.questionId, createdAt: a.answeredAt, isCorrect: a.isCorrect,
    })) as SharedAttempt[], DataService.getQuestionsForTopic(topicId).length);
    topicMastery[topicId] = { score: evidence.score, stars: getStarsFromScore(evidence.score), hasEnoughEvidence: evidence.hasEnoughEvidence };
  }
  for (const attempt of latest.values()) {
    if (attempt.isCorrect) continue;
    const canonical = account.canonicalRecords[attempt.id];
    mistakes.push({ id: `mis_${attempt.questionId}`, questionId: attempt.questionId,
      topicId: attempt.topicId, subjectId: attempt.subjectId, wrongAnswer: attempt.selectedAnswer,
      reviewStatus: 'new', reviewCount: account.attempts.filter(a => a.questionId === attempt.questionId && !a.isCorrect).length,
      lastAttemptedAt: attempt.answeredAt,
      nextReviewAt: new Date(Date.parse(canonical?.reviewedAt || attempt.answeredAt) + 86_400_000).toISOString(),
    });
  }
  let streak = 0;
  let day = Date.now();
  if (!activity.has(vnDay(day))) day -= 86_400_000;
  while (activity.has(vnDay(day))) { streak++; day -= 86_400_000; }
  const pendingXp = [...latest.values()].filter(a => a.syncStatus !== 'acknowledged' && !account.canonicalRecords[a.id] && a.isCorrect).length * 15;
  return {
    selectedGrade: account.selectedGrade, attempts: account.attempts, mistakes, topicMastery,
    completedQuestions: Object.fromEntries([...latest].map(([id, attempt]) => [id, attempt.isCorrect])),
    xp: account.serverXp + pendingXp, streak, lastActiveDate: [...activity].sort().at(-1) || null,
  };
}

export const remainingExamSeconds = (draft: ExamDraft, now = Date.now()) =>
  Math.max(0, Math.ceil((draft.deadlineAt - now) / 1000));
