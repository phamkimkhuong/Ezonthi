import { SubjectCode, UserAttempt } from '../types';

export interface SubjectTheme {
  badge: string;
  text: string;
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
  solid: string;
  dot: string;
}

export const getSubjectTheme = (subject: SubjectCode): SubjectTheme => {
  switch (subject) {
    case 'math':
      return {
        badge: 'bg-blue-100/70 dark:bg-blue-950/35 text-blue-800 dark:text-blue-300 border border-blue-300/50 dark:border-blue-500/25',
        text: 'text-blue-800 dark:text-blue-300 font-extrabold',
        bg: 'bg-blue-50/55 dark:bg-blue-950/12',
        border: 'border-blue-500/15 shadow-sm',
        iconBg: 'bg-blue-500/10 dark:bg-blue-500/16',
        iconColor: 'text-blue-700 dark:text-blue-300',
        solid: 'bg-blue-700 hover:bg-blue-800 border-blue-700 text-white',
        dot: 'bg-blue-700'
      };
    case 'chemistry':
      return {
        badge: 'bg-teal-100/70 dark:bg-teal-950/35 text-teal-800 dark:text-teal-300 border border-teal-300/50 dark:border-teal-500/25',
        text: 'text-teal-800 dark:text-teal-300 font-extrabold',
        bg: 'bg-teal-50/55 dark:bg-teal-950/12',
        border: 'border-teal-500/15 shadow-sm',
        iconBg: 'bg-teal-500/10 dark:bg-teal-500/16',
        iconColor: 'text-teal-700 dark:text-teal-300',
        solid: 'bg-teal-700 hover:bg-teal-800 border-teal-700 text-white',
        dot: 'bg-teal-700'
      };
    case 'physics':
      return {
        badge: 'bg-cyan-100/70 dark:bg-cyan-950/35 text-cyan-800 dark:text-cyan-300 border border-cyan-300/50 dark:border-cyan-500/25',
        text: 'text-cyan-800 dark:text-cyan-300 font-extrabold',
        bg: 'bg-cyan-50/55 dark:bg-cyan-950/12',
        border: 'border-cyan-500/15 shadow-sm',
        iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/16',
        iconColor: 'text-cyan-700 dark:text-cyan-300',
        solid: 'bg-cyan-700 hover:bg-cyan-800 border-cyan-700 text-white',
        dot: 'bg-cyan-700'
      };
    case 'biology':
      return {
        badge: 'bg-green-100/70 dark:bg-green-950/35 text-green-800 dark:text-green-300 border border-green-300/50 dark:border-green-500/25',
        text: 'text-green-800 dark:text-green-300 font-extrabold',
        bg: 'bg-green-50/55 dark:bg-green-950/12',
        border: 'border-green-500/15 shadow-sm',
        iconBg: 'bg-green-500/10 dark:bg-green-500/16',
        iconColor: 'text-green-700 dark:text-green-300',
        solid: 'bg-green-700 hover:bg-green-800 border-green-700 text-white',
        dot: 'bg-green-700'
      };
    case 'history':
      return {
        badge: 'bg-amber-100/70 dark:bg-amber-950/35 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-500/25',
        text: 'text-amber-800 dark:text-amber-300 font-extrabold',
        bg: 'bg-amber-50/55 dark:bg-amber-950/12',
        border: 'border-amber-500/15 shadow-sm',
        iconBg: 'bg-amber-500/10 dark:bg-amber-500/16',
        iconColor: 'text-amber-700 dark:text-amber-300',
        solid: 'bg-amber-700 hover:bg-amber-800 border-amber-700 text-white',
        dot: 'bg-amber-700'
      };
    case 'english':
    default:
      return {
        badge: 'bg-orange-100/70 dark:bg-orange-950/35 text-orange-800 dark:text-orange-300 border border-orange-300/50 dark:border-orange-500/25',
        text: 'text-orange-800 dark:text-orange-300 font-extrabold',
        bg: 'bg-orange-50/55 dark:bg-orange-950/12',
        border: 'border-orange-500/15 shadow-sm',
        iconBg: 'bg-orange-500/10 dark:bg-orange-500/16',
        iconColor: 'text-orange-700 dark:text-orange-300',
        solid: 'bg-orange-700 hover:bg-orange-800 border-orange-700 text-white',
        dot: 'bg-orange-700'
      };
  }
};

export interface DifficultyTheme {
  text: string;
  dotClass: string;
}

export const getDifficultyTheme = (difficulty: 'easy' | 'medium' | 'hard'): DifficultyTheme => {
  switch (difficulty) {
    case 'easy':
      return {
        text: 'Cơ bản',
        dotClass: 'bg-emerald-500'
      };
    case 'medium':
      return {
        text: 'Trung bình',
        dotClass: 'bg-amber-500'
      };
    case 'hard':
      return {
        text: 'Nâng cao',
        dotClass: 'bg-rose-500'
      };
  }
};

export interface TierTheme {
  badgeStyle: string;
  lineStyle: string;
}

export const getTierTheme = (tierId: number): TierTheme => {
  switch (tierId) {
    case 1:
      return {
        badgeStyle: 'bg-brand-learning/10 border-brand-learning/25 text-brand-learning',
        lineStyle: 'border-brand-learning/25'
      };
    case 2:
      return {
        badgeStyle: 'bg-brand-ink/10 border-brand-ink/25 text-brand-ink',
        lineStyle: 'border-brand-ink/25'
      };
    case 3:
    default:
      return {
        badgeStyle: 'bg-brand-action/10 border-brand-action/25 text-brand-action',
        lineStyle: 'border-brand-action/25'
      };
  }
};
export const getStarsFromScore = (score: number): number => {
  if (score <= 3) {
    // Backwards compatibility migration: old format levels (0, 1, 2, 3)
    return score;
  }
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
};

export const MIN_MASTERY_EVIDENCE = 5;

export interface MasteryEvidence {
  score: number;
  accuracy: number;
  evidenceCount: number;
  requiredEvidence: number;
  hasEnoughEvidence: boolean;
}

/**
 * Mastery is based only on the latest graded result for each distinct question.
 * Rewards and streaks are intentionally excluded from this measure.
 */
export const calculateMasteryEvidence = (
  attempts: UserAttempt[],
  availableQuestionCount?: number
): MasteryEvidence => {
  const latestByQuestion = new Map<string, UserAttempt>();
  for (const attempt of attempts) {
    const gradingStatus = (attempt as UserAttempt & { gradingStatus?: string }).gradingStatus;
    if (!attempt?.questionId || gradingStatus === 'pending' || (attempt.gradingMode === 'manual' && gradingStatus !== 'graded')) continue;
    const current = latestByQuestion.get(attempt.questionId);
    const currentTime = current ? Date.parse(current.createdAt) : Number.NEGATIVE_INFINITY;
    const nextTime = Date.parse(attempt.createdAt);
    if (!current || nextTime > currentTime || (nextTime === currentTime && attempt.id.localeCompare(current.id) > 0)) {
      latestByQuestion.set(attempt.questionId, attempt);
    }
  }

  const evidence = [...latestByQuestion.values()];
  const correctCount = evidence.filter(attempt => attempt.isCorrect).length;
  const accuracy = evidence.length ? correctCount / evidence.length : 0;
  const capacity = Number.isFinite(availableQuestionCount) && (availableQuestionCount ?? 0) > 0
    ? Math.floor(availableQuestionCount!)
    : MIN_MASTERY_EVIDENCE;
  const requiredEvidence = Math.max(1, Math.min(MIN_MASTERY_EVIDENCE, capacity));

  return {
    score: Math.round(accuracy * 100),
    accuracy,
    evidenceCount: evidence.length,
    requiredEvidence,
    hasEnoughEvidence: evidence.length >= requiredEvidence,
  };
};

export const calculateMasteryScore = (attempts: UserAttempt[]): number => {
  return calculateMasteryEvidence(attempts).score;
};
