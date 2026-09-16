/**
 * Hằng số định danh Storage Key cho AsyncStorage toàn bộ ứng dụng Mobile.
 * Tập trung tại đây để tránh lỗi typo / duplicate key khi truy vấn bộ nhớ.
 */
export const STORAGE_KEYS = {
  // User & Progress storage (Zustand Persist)
  USER_STORAGE: 'ezonthi-user-storage',

  // Vocabulary module storage
  VOCAB_MASTERED_WORDS: '@ez_vocab_mastered_ids',
  VOCAB_STARRED_WORDS: '@ez_vocab_starred_ids',
  VOCAB_QUIZ_SCORES: '@ez_vocab_quiz_scores',

  // Offline / Cache storage
  OFFLINE_TOPICS_CACHE: '@ez_offline_topics_cache',
  OFFLINE_EXAMS_CACHE: '@ez_offline_exams_cache',
  LEADERBOARD_CACHE: '@ezonthi_leaderboard_cache',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
