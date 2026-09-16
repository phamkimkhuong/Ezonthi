import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAttempt, MasteryService, TopicMastery } from './masteryService';
import { MobileMistake, MistakeService } from './mistakeService';

export type { UserAttempt, TopicMastery, MobileMistake };

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

export interface UserStats {
  user: UserProfile | null;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedQuestions: Record<string, boolean>; // questionId -> isCorrect
  attempts: UserAttempt[];
  mistakes: MobileMistake[];
  topicMastery: Record<string, { score: number; stars: number }>;
  reminderHour: number;
  reminderMinute: number;
  reminderEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  isHydrated: boolean;
}

interface UserStore extends UserStats {
  setUser: (user: UserProfile | null) => void;
  setHydrated: (hydrated: boolean) => void;
  recordAnswer: (questionId: string, isCorrect: boolean, xpEarned?: number) => void;
  recordAttempt: (
    questionId: string,
    topicId: string,
    subjectId: string,
    isCorrect: boolean,
    selectedAnswer: string,
    xpEarned?: number
  ) => void;
  resolveMistake: (questionId: string, isCorrect: boolean) => void;
  updateReminder: (hour: number, minute: number, enabled: boolean) => void;
  toggleSound: (enabled: boolean) => void;
  toggleHaptic: (enabled: boolean) => void;
  resetProgress: () => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      xp: 0,
      streak: 1,
      lastActiveDate: getTodayString(),
      completedQuestions: {},
      attempts: [],
      mistakes: [],
      topicMastery: {},
      reminderHour: 19,
      reminderMinute: 30,
      reminderEnabled: true,
      soundEnabled: true,
      hapticEnabled: true,
      isHydrated: false,

      setUser: (user: UserProfile | null) => set({ user }),
      setHydrated: (isHydrated: boolean) => set({ isHydrated }),

      recordAnswer: (questionId: string, isCorrect: boolean, xpEarned: number = 10) => {
        const state = get();
        const today = getTodayString();
        
        // Tính toán streak
        let newStreak = state.streak;
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (state.lastActiveDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        set({
          xp: state.xp + (isCorrect ? xpEarned : 2),
          streak: newStreak,
          lastActiveDate: today,
          completedQuestions: {
            ...state.completedQuestions,
            [questionId]: isCorrect
          }
        });
      },

      recordAttempt: (
        questionId: string,
        topicId: string,
        subjectId: string,
        isCorrect: boolean,
        selectedAnswer: string,
        xpEarned: number = 10
      ) => {
        const state = get();
        const today = getTodayString();

        // 1. Tính toán streak
        let newStreak = state.streak;
        if (state.lastActiveDate !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          if (state.lastActiveDate === yesterday) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        // 2. Ghi nhận lượt làm bài mới
        const newAttempt: UserAttempt = {
          id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          questionId,
          topicId,
          subjectId,
          isCorrect,
          selectedAnswer,
          answeredAt: new Date().toISOString(),
        };
        const updatedAttempts = [...(state.attempts || []), newAttempt];

        // 3. Tính toán lại Mastery Score cho chuyên đề
        const topicAttempts = updatedAttempts.filter(a => a.topicId === topicId);
        const masteryResult = MasteryService.calculateTopicMastery(topicAttempts);
        const updatedMastery = {
          ...(state.topicMastery || {}),
          [topicId]: {
            score: masteryResult.score,
            stars: masteryResult.stars,
          },
        };

        // 4. Xử lý Sổ Lỗi Sai (Mistake Notebook)
        let updatedMistakes = [...(state.mistakes || [])];
        const existingMistakeIndex = updatedMistakes.findIndex(m => m.questionId === questionId);

        if (!isCorrect) {
          if (existingMistakeIndex >= 0) {
            const existing = updatedMistakes[existingMistakeIndex];
            const next = MistakeService.calculateNextReview(existing.reviewCount, false);
            updatedMistakes[existingMistakeIndex] = {
              ...existing,
              wrongAnswer: selectedAnswer,
              reviewStatus: next.reviewStatus,
              lastAttemptedAt: new Date().toISOString(),
              nextReviewAt: next.nextReviewAt,
            };
          } else {
            const next = MistakeService.calculateNextReview(0, false);
            updatedMistakes.push({
              id: `mis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              questionId,
              topicId,
              subjectId,
              wrongAnswer: selectedAnswer,
              reviewStatus: 'new',
              reviewCount: 0,
              lastAttemptedAt: new Date().toISOString(),
              nextReviewAt: next.nextReviewAt,
            });
          }
        } else if (existingMistakeIndex >= 0) {
          // Trả lời đúng một câu từng bị sai -> Nâng bậc ôn tập
          const existing = updatedMistakes[existingMistakeIndex];
          const next = MistakeService.calculateNextReview(existing.reviewCount, true);
          updatedMistakes[existingMistakeIndex] = {
            ...existing,
            reviewStatus: next.reviewStatus,
            reviewCount: existing.reviewCount + 1,
            lastAttemptedAt: new Date().toISOString(),
            nextReviewAt: next.nextReviewAt,
          };
        }

        set({
          xp: state.xp + (isCorrect ? xpEarned : 2),
          streak: newStreak,
          lastActiveDate: today,
          completedQuestions: {
            ...state.completedQuestions,
            [questionId]: isCorrect,
          },
          attempts: updatedAttempts,
          topicMastery: updatedMastery,
          mistakes: updatedMistakes,
        });
      },

      resolveMistake: (questionId: string, isCorrect: boolean) => {
        const state = get();
        const updatedMistakes = [...(state.mistakes || [])];
        const index = updatedMistakes.findIndex(m => m.questionId === questionId);
        if (index >= 0) {
          const existing = updatedMistakes[index];
          const next = MistakeService.calculateNextReview(existing.reviewCount, isCorrect);
          updatedMistakes[index] = {
            ...existing,
            reviewStatus: next.reviewStatus,
            reviewCount: existing.reviewCount + (isCorrect ? 1 : 0),
            lastAttemptedAt: new Date().toISOString(),
            nextReviewAt: next.nextReviewAt,
          };
          set({ mistakes: updatedMistakes });
        }
      },

      updateReminder: (hour: number, minute: number, enabled: boolean) => {
        set({
          reminderHour: hour,
          reminderMinute: minute,
          reminderEnabled: enabled
        });
      },

      toggleSound: (enabled: boolean) => set({ soundEnabled: enabled }),
      toggleHaptic: (enabled: boolean) => set({ hapticEnabled: enabled }),

      resetProgress: () => {
        set({
          xp: 0,
          streak: 1,
          lastActiveDate: getTodayString(),
          completedQuestions: {},
          attempts: [],
          mistakes: [],
          topicMastery: {},
        });
      }
    }),
    {
      name: 'ezonthi-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        xp: state.xp,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        completedQuestions: state.completedQuestions,
        attempts: state.attempts,
        mistakes: state.mistakes,
        topicMastery: state.topicMastery,
        reminderHour: state.reminderHour,
        reminderMinute: state.reminderMinute,
        reminderEnabled: state.reminderEnabled,
        soundEnabled: state.soundEnabled,
        hapticEnabled: state.hapticEnabled,
      }),
    }
  )
);
