import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useUserStore, UserProfile } from './storageService';
import { MobileMistake } from './mistakeService';

export const CloudSyncService = {
  /**
   * Đẩy dữ liệu tiến độ học tập cục bộ lên Firestore (khi học sinh đã đăng nhập)
   */
  async syncToCloud(): Promise<boolean> {
    const { user, xp, streak, topicMastery, completedQuestions, attempts, mistakes, lastActiveDate } =
      useUserStore.getState();

    // Chỉ đồng bộ lên Cloud khi đã đăng nhập tài khoản thực (không phải Guest)
    if (!user?.uid || user.isAnonymous) {
      return false;
    }

    try {
      const summaryRef = doc(db, 'users', user.uid, 'learning_progress', 'summary');
      await setDoc(
        summaryRef,
        {
          xp,
          streak,
          topicMastery,
          completedQuestionsCount: Object.keys(completedQuestions).length,
          totalAttempts: attempts.length,
          mistakesCount: mistakes.length,
          lastActiveDate,
          displayName: user.displayName,
          email: user.email,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      const mistakesRef = doc(db, 'users', user.uid, 'learning_progress', 'mistakes');
      await setDoc(
        mistakesRef,
        {
          mistakes,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return true;
    } catch {
      // Offline hoặc lỗi mạng -> Bỏ qua nhẹ nhàng để không gián đoạn trải nghiệm học tập
      return false;
    }
  },

  /**
   * Kéo và hợp nhất dữ liệu từ Cloud về máy khi học sinh đăng nhập tài khoản
   */
  async pullAndMergeFromCloud(user: UserProfile): Promise<boolean> {
    if (!user?.uid || user.isAnonymous) {
      return false;
    }

    try {
      const summaryRef = doc(db, 'users', user.uid, 'learning_progress', 'summary');
      const mistakesRef = doc(db, 'users', user.uid, 'learning_progress', 'mistakes');

      const [summarySnap, mistakesSnap] = await Promise.all([
        getDoc(summaryRef),
        getDoc(mistakesRef),
      ]);

      const state = useUserStore.getState();

      let mergedXp = state.xp;
      let mergedStreak = state.streak;
      let mergedMastery = { ...state.topicMastery };
      let mergedMistakes = [...state.mistakes];

      if (summarySnap.exists()) {
        const cloudData = summarySnap.data();
        mergedXp = Math.max(state.xp, cloudData.xp || 0);
        mergedStreak = Math.max(state.streak, cloudData.streak || 1);
        if (cloudData.topicMastery) {
          mergedMastery = {
            ...cloudData.topicMastery,
            ...state.topicMastery,
          };
        }
      }

      if (mistakesSnap.exists()) {
        const cloudMistakes = (mistakesSnap.data().mistakes as MobileMistake[]) || [];
        const mistakeMap = new Map<string, MobileMistake>();
        for (const m of cloudMistakes) {
          mistakeMap.set(m.questionId, m);
        }
        for (const localM of state.mistakes) {
          mistakeMap.set(localM.questionId, localM);
        }
        mergedMistakes = Array.from(mistakeMap.values());
      }

      useUserStore.setState({
        xp: mergedXp,
        streak: mergedStreak,
        topicMastery: mergedMastery,
        mistakes: mergedMistakes,
      });

      return true;
    } catch {
      return false;
    }
  },
};
