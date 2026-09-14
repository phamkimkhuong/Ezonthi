import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { SubjectCode } from '../types';
import type { AppNotification } from '../types/notificationTypes';
import { AVAILABLE_SUBJECTS_BY_GRADE } from '../utils/courseRoutes';

type GradeCode = 'grade9' | 'grade10' | 'grade11' | 'grade12';

const getInitialCourseSelection = (): { grade: GradeCode; subject: SubjectCode } => {
  if (typeof localStorage === 'undefined') return { grade: 'grade9', subject: 'math' };

  const storedGrade = localStorage.getItem('otv10_selected_grade') as GradeCode | null;
  const grade = storedGrade && storedGrade in AVAILABLE_SUBJECTS_BY_GRADE ? storedGrade : 'grade9';
  const availableSubjects = AVAILABLE_SUBJECTS_BY_GRADE[grade];

  // Lớp chưa phát hành không được trở thành ngữ cảnh khởi động sau khi tải lại trang.
  if (availableSubjects.length === 0) return { grade: 'grade9', subject: 'math' };

  const storedSubject = localStorage.getItem('otv10_selected_subject') as SubjectCode | null;
  const subject = storedSubject && availableSubjects.includes(storedSubject)
    ? storedSubject
    : availableSubjects[0];

  return { grade, subject };
};

interface AppState {
  darkMode: boolean;
  selectedSubject: SubjectCode;
  selectedGrade: 'grade9' | 'grade10' | 'grade11' | 'grade12';

  // Auth state
  user: User | null;
  userData: any | null;
  authLoading: boolean;
  isPremium: boolean;
  trialActivated: boolean;
  premiumUntil: string | null;
  isProfileModalOpen: boolean;
  isAutoProfileModal: boolean;

  // Notifications state
  notifications: AppNotification[];
  unreadNotificationCount: number;

  // Reactivity trigger for LocalStorage progress changes
  progressVersion: number;

  // Data Loading State
  isLoadingData: boolean;

  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setSubject: (subject: SubjectCode) => void;
  setGrade: (grade: 'grade9' | 'grade10' | 'grade11' | 'grade12') => void;
  setCourse: (grade: GradeCode, subject: SubjectCode) => void;
  refreshProgress: () => void;
  setIsLoadingData: (loading: boolean) => void;
  setNotifications: (list: AppNotification[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Auth actions
  setUser: (user: User | null) => void;
  setPremium: (isPremium: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  setIsProfileModalOpen: (open: boolean) => void;
}

const getInitialDarkMode = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  const storedTheme = localStorage.getItem('otv10_theme');
  if (storedTheme === 'dark') return true;
  if (storedTheme === 'light') return false;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useAppStore = create<AppState>((set, get) => {
  const initialDarkMode = getInitialDarkMode();
  const initialCourseSelection = getInitialCourseSelection();

  if (typeof document !== 'undefined') {
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    darkMode: initialDarkMode,
    selectedSubject: initialCourseSelection.subject,
    selectedGrade: initialCourseSelection.grade,

    // Auth initial state
    user: null,
    userData: null,
    authLoading: true,
    progressVersion: 0,
    isPremium: false,
    trialActivated: false,
    premiumUntil: null,
    isLoadingData: true,
    isProfileModalOpen: false,
    isAutoProfileModal: false,
    notifications: [],
    unreadNotificationCount: 0,

    setNotifications: (list: AppNotification[]) => {
      const unreadCount = list.filter((n) => !n.read).length;
      set({ notifications: list, unreadNotificationCount: unreadCount });
    },

    markNotificationAsRead: (id: string) => {
      const user = get().user;
      if (user) {
        void import('./notificationService').then(({ notificationService }) => {
          notificationService.markAsRead(user.uid, id);
        });
      }
      const updated = get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      const unreadCount = updated.filter((n) => !n.read).length;
      set({ notifications: updated, unreadNotificationCount: unreadCount });
    },

    markAllNotificationsAsRead: () => {
      const user = get().user;
      const currentNotifs = get().notifications;
      if (user && currentNotifs.length > 0) {
        void import('./notificationService').then(({ notificationService }) => {
          notificationService.markAllAsRead(user.uid, currentNotifs.map((n) => n.id));
        });
      }
      const updated = currentNotifs.map((n) => ({ ...n, read: true }));
      set({ notifications: updated, unreadNotificationCount: 0 });
    },

    toggleDarkMode: () => {
      const nextDarkMode = !get().darkMode;
      if (typeof document !== 'undefined') {
        if (nextDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('otv10_theme', nextDarkMode ? 'dark' : 'light');
      }
      set({ darkMode: nextDarkMode });
    },

    setDarkMode: (dark: boolean) => {
      if (typeof document !== 'undefined') {
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('otv10_theme', dark ? 'dark' : 'light');
      }
      set({ darkMode: dark });
    },

    setSubject: (subject) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('otv10_selected_subject', subject);
      }
      set({ selectedSubject: subject });
    },
    setGrade: (grade) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('otv10_selected_grade', grade);
      }
      set({ selectedGrade: grade });
    },
    setCourse: (grade, subject) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('otv10_selected_grade', grade);
        localStorage.setItem('otv10_selected_subject', subject);
      }
      set({ selectedGrade: grade, selectedSubject: subject });
    },
    refreshProgress: () => set((state) => ({ progressVersion: state.progressVersion + 1 })),
    setIsLoadingData: (loading) => set({ isLoadingData: loading }),

    setUser: (user) => set({ user }),
    setPremium: (isPremium) => set({ isPremium }),
    setAuthLoading: (loading) => set({ authLoading: loading }),
    logout: async () => {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('./firebase');
      await signOut(auth);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('ezonthi_profile_auto_opened');
      }
      set({ user: null, userData: null });
    },
    setIsProfileModalOpen: (open) => set({ isProfileModalOpen: open })
  };
});
export default useAppStore;
