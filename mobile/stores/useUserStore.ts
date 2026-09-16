import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserAttempt, TopicMastery } from '../services/masteryService';
import type { MobileMistake } from '../services/mistakeService';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { createDurableStorage } from '../services/durableStorage';
import {
  accountScope, emptyAccount, importGuest, projectAccount, newLocalId,
  type LearningAccount, type ExamDraft,
} from '../services/accountLearningState';
import { DataService } from '../services/dataService';

export type { UserAttempt, TopicMastery, MobileMistake };
export type GradeId = 'grade9' | 'grade10' | 'grade11';

export interface GradeOption {
  id: GradeId;
  label: string;
  shortLabel: string;
  name?: string;
  shortName?: string;
  badge: string;
  description: string;
  icon: string;
  color: string;
}

export const GRADE_OPTIONS: GradeOption[] = [
  {
    id: 'grade9',
    label: 'Lớp 9 (Ôn Thi Vào 10)',
    shortLabel: 'Lớp 9 (Vào 10)',
    name: 'Lớp 9 (Ôn Thi Vào 10)',
    shortName: 'Lớp 9 (Vào 10)',
    badge: 'Trọng tâm',
    description: 'Luyện thi vào lớp 10 THPT công lập & chuyên',
    icon: 'GraduationCap',
    color: '#6366f1',
  },
  {
    id: 'grade10',
    label: 'Lớp 10 (GDPT 2018)',
    shortLabel: 'Lớp 10',
    name: 'Lớp 10 (GDPT 2018)',
    shortName: 'Lớp 10',
    badge: 'Chương trình mới',
    description: 'Nền tảng THPT & Đánh giá năng lực',
    icon: 'BookOpen',
    color: '#0ea5e9',
  },
  {
    id: 'grade11',
    label: 'Lớp 11 (GDPT 2018)',
    shortLabel: 'Lớp 11',
    name: 'Lớp 11 (GDPT 2018)',
    shortName: 'Lớp 11',
    badge: 'Nâng cao',
    description: 'Kiến thức cốt lõi & Hướng nghiệp',
    icon: 'Sparkles',
    color: '#10b981',
  },
];

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

export interface UserStats {
  user: UserProfile | null;
  activeScope: string;
  accounts: Record<string, LearningAccount>;
  legacyScope: string | null;
  legacyVocabularyMigrated: boolean;
  selectedGrade: GradeId;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedQuestions: Record<string, boolean>;
  attempts: UserAttempt[];
  mistakes: MobileMistake[];
  topicMastery: Record<string, { score: number; stars: number; hasEnoughEvidence?: boolean }>;
  reminderHour: number;
  reminderMinute: number;
  reminderEnabled: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  isHydrated: boolean;
  storageError: string | null;
}
export interface UserStore extends UserStats {
  setUser(user: UserProfile | null): void;
  setGrade(grade: GradeId): void;
  setHydrated(hydrated: boolean): void;
  recordAnswer(questionId: string, isCorrect: boolean, xpEarned?: number): Promise<void>;
  recordAttempt(questionId: string, topicId: string, subjectId: string, isCorrect: boolean,
    selectedAnswer: string, xpEarned?: number, id?: string, timeSpent?: number, expectedScope?: string): Promise<void>;
  resolveMistake(questionId: string, isCorrect: boolean, selectedAnswer?: string, expectedScope?: string): Promise<void>;
  updateAccount(scope: string, update: (account: LearningAccount) => LearningAccount): void;
  saveExamDraft(scope: string, draft: ExamDraft): Promise<void>;
  submitExamDraft(scope: string, draft: ExamDraft): Promise<void>;
  updateReminder(hour: number, minute: number, enabled: boolean): void;
  toggleSound(enabled: boolean): void;
  toggleHaptic(enabled: boolean): void;
  resetProgress(): void;
}

export function migrateLearningStorage(saved: Record<string, any>) {
  if (saved.accounts) {
    for (const scope of Object.keys(saved.accounts)) {
      const acc = saved.accounts[scope];
      if (acc) {
        if (!acc.vocabulary) acc.vocabulary = { mastered: [], starred: [], quizScores: {} };
        if (!acc.examDrafts) acc.examDrafts = {};
      }
    }
    return saved;
  }
  const owner = accountScope(saved.user?.uid);
  const account = {
    ...emptyAccount(), selectedGrade: saved.selectedGrade || 'grade9',
    attempts: (saved.attempts || []).map((attempt: UserAttempt) => ({ ...attempt, syncStatus: 'pending' })),
  };
  // Leave the old blob intact until persist has written the verified new snapshot.
  return { ...saved, user: null, accounts: { [owner]: account }, legacyScope: owner };
}

const durableStorage = createDurableStorage(AsyncStorage);
export async function flushLearningStorage() {
  try {
    await durableStorage.flush();
    if (useUserStore.getState().storageError) useUserStore.setState({ storageError: null });
  } catch (error) {
    useUserStore.setState({ storageError: 'Chưa ghi được bộ nhớ thiết bị. Giữ ứng dụng mở và thử lưu lại.' });
    throw error;
  }
}
export async function retryLearningStorage() {
  const state = useUserStore.getState();
  // Trigger another write of the complete current snapshot before retrying network.
  useUserStore.setState({ accounts: { ...state.accounts } });
  await flushLearningStorage();
}
export async function waitForLearningHydration() {
  if (useUserStore.getState().isHydrated) return;
  await new Promise<void>(resolve => {
    const unsubscribe = useUserStore.subscribe(state => {
      if (state.isHydrated) { unsubscribe(); resolve(); }
    });
  });
}

export const useUserStore = create<UserStore>()(persist((set, get) => {
  const updateAccount: UserStore['updateAccount'] = (scope, update) => {
    const state = get();
    const existing = state.accounts[scope] || emptyAccount();
    const safeAccount: LearningAccount = {
      ...emptyAccount(),
      ...existing,
      vocabulary: existing.vocabulary || { mastered: [], starred: [], quizScores: {} },
      examDrafts: existing.examDrafts || {},
    };
    const account = update(safeAccount);
    set({ accounts: { ...state.accounts, [scope]: account },
      ...(state.activeScope === scope ? projectAccount(account) : {}),
    });
  };
  return {
    ...projectAccount(emptyAccount()), user: null, activeScope: 'guest', accounts: { guest: emptyAccount() },
    legacyScope: null, legacyVocabularyMigrated: false, reminderHour: 19, reminderMinute: 30, reminderEnabled: true,
    soundEnabled: true, hapticEnabled: true, isHydrated: false, storageError: null,
    updateAccount,
    setUser(user) {
      const state = get();
      const scope = accountScope(user?.isAnonymous ? null : user?.uid);
      let accounts = { ...state.accounts };
      let account = accounts[scope] || emptyAccount();
      if (!account.vocabulary) account.vocabulary = { mastered: [], starred: [], quizScores: {} };
      if (scope !== 'guest' && state.activeScope === 'guest') {
        const guest = accounts.guest || emptyAccount();
        if (!guest.vocabulary) guest.vocabulary = { mastered: [], starred: [], quizScores: {} };
        account = importGuest(account, guest);
        accounts.guest = emptyAccount(); // Atomically consumes guest data in this same snapshot.
      }
      accounts = { ...accounts, [scope]: account };
      set({ user, activeScope: scope, accounts, ...projectAccount(account) });
    },
    setGrade(selectedGrade) { updateAccount(get().activeScope, account => ({ ...account, selectedGrade })); },
    setHydrated(isHydrated) { set({ isHydrated }); },
    async recordAnswer(questionId, isCorrect, xpEarned = 10) {
      const q = DataService.getAllQuestions().find(question => question.id === questionId);
      if (q) await get().recordAttempt(q.id, q.topicId, q.subjectId, isCorrect, isCorrect ? q.correctAnswer : '', xpEarned);
    },
    async recordAttempt(questionId, topicId, subjectId, isCorrect, selectedAnswer, _xpEarned = 10,
      id = `att_${newLocalId()}`, timeSpent = 0, expectedScope = get().activeScope) {
      if (!get().isHydrated) throw new Error('Learning storage is not ready');
      if (get().activeScope !== expectedScope) throw new Error('Tài khoản đã thay đổi. Không ghi bài sang tài khoản khác.');
      const question = DataService.getQuestionsForTopic(topicId).find(q => q.id === questionId && q.subjectId === subjectId);
      if (!question) throw new Error('Unknown mobile question');
      updateAccount(get().activeScope, account => account.attempts.some(a => a.id === id) ? account : ({
        ...account, attempts: [...account.attempts, { id, questionId, topicId, subjectId, isCorrect,
          selectedAnswer, answeredAt: new Date().toISOString(), timeSpent, syncStatus: 'pending' }],
      }));
      await flushLearningStorage();
    },
    async resolveMistake(questionId, isCorrect, selectedAnswer, expectedScope = get().activeScope) {
      const q = DataService.getAllQuestions().find(question => question.id === questionId);
      if (q) await get().recordAttempt(q.id, q.topicId, q.subjectId, isCorrect,
        selectedAnswer ?? (isCorrect ? q.correctAnswer : ''), 10, undefined, 0, expectedScope);
    },
    async saveExamDraft(scope, draft) {
      updateAccount(scope, account => {
        const previous = account.examDrafts[draft.exam.id];
        return { ...account, examDrafts: { ...account.examDrafts, [draft.exam.id]: draft },
          examDraftArchive: previous && previous.sessionId !== draft.sessionId
            ? { ...account.examDraftArchive, [previous.sessionId]: previous } : account.examDraftArchive };
      });
      await flushLearningStorage();
    },
    async submitExamDraft(scope, draft) {
      if (!draft.result || !draft.submittedAt) throw new Error('Exam submission is incomplete');
      updateAccount(scope, account => {
        const previous = account.examDrafts[draft.exam.id];
        if (previous?.sessionId === draft.sessionId && previous.submittedAt) return account;
        const attempts = new Map(account.attempts.map(a => [a.id, a]));
        for (const question of draft.exam.questions) {
          const id = `exam_${draft.sessionId}_${question.id}`;
          if (!attempts.has(id)) attempts.set(id, {
            id, questionId: question.id, topicId: question.topicId, subjectId: question.subjectId,
            selectedAnswer: draft.answers[question.id] || '', isCorrect: draft.answers[question.id] === question.correctAnswer,
            answeredAt: new Date(draft.submittedAt!).toISOString(), syncStatus: 'pending',
            timeSpent: Math.min(600, draft.result!.timeSpentSeconds / Math.max(1, draft.exam.questions.length)),
          });
        }
        return { ...account, attempts: [...attempts.values()], examDrafts: { ...account.examDrafts, [draft.exam.id]: draft } };
      });
      await flushLearningStorage();
    },
    updateReminder(hour, minute, enabled) { set({ reminderHour: hour, reminderMinute: minute, reminderEnabled: enabled }); },
    toggleSound(soundEnabled) { set({ soundEnabled }); },
    toggleHaptic(hapticEnabled) { set({ hapticEnabled }); },
    resetProgress() {
      // Never erase unacknowledged attempts or active drafts through a cosmetic local reset.
      updateAccount(get().activeScope, account => ({ ...emptyAccount(),
        attempts: account.attempts.filter(a => a.syncStatus !== 'acknowledged'),
        batch: account.batch, examDrafts: account.examDrafts, examDraftArchive: account.examDraftArchive, vocabulary: account.vocabulary, selectedGrade: account.selectedGrade,
      }));
    },
  };
}, {
  name: STORAGE_KEYS.USER_STORAGE, version: 2,
  storage: createJSONStorage(() => durableStorage),
  migrate: saved => migrateLearningStorage(saved as Record<string, any>),
  partialize: state => ({ accounts: state.accounts, legacyScope: state.legacyScope, legacyVocabularyMigrated: state.legacyVocabularyMigrated,
    reminderHour: state.reminderHour, reminderMinute: state.reminderMinute,
    reminderEnabled: state.reminderEnabled, soundEnabled: state.soundEnabled, hapticEnabled: state.hapticEnabled,
  }),
  merge(saved, current) {
    const persisted = saved as Partial<UserStore> | undefined;
    const accounts = persisted?.accounts || current.accounts;
    return { ...current, ...persisted, user: null, activeScope: 'guest', accounts,
      ...projectAccount(accounts.guest || emptyAccount()), isHydrated: true,
    };
  },
  onRehydrateStorage: () => (_state, error) => {
    if (error) useUserStore.setState({ isHydrated: true, storageError: 'Không đọc được dữ liệu đã lưu. Chưa được phép ghi đè dữ liệu cũ.' });
  },
}));
