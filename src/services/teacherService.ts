import { db, functions } from './firebase';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  doc, 
  orderBy, 
  limit, 
  startAfter,
  getCountFromServer 
} from 'firebase/firestore';
import { UserAttempt, SimulatedStudent } from '../types';
import { httpsCallable } from 'firebase/functions';
import { hasActivePremium } from '../utils/premium';
import { logger } from '../utils/logger';

export const teacherService = {
  /**
   * Lấy danh sách học sinh thực tế hỗ trợ phân trang Cursor-based
   */
  async getRealStudents(
    excludedUserIds: string[] = [],
    limitCount?: number,
    startAfterActiveAt?: string
  ): Promise<{ students: SimulatedStudent[]; lastActiveAt?: string; hasMore: boolean }> {
    try {
      const usersRef = collection(db, 'users');
      const fetchLimit = limitCount !== undefined ? limitCount + excludedUserIds.length + 1 : undefined;
      let q = query(usersRef, orderBy('lastActiveAt', 'desc'));
      
      if (startAfterActiveAt) {
        q = query(q, startAfter(startAfterActiveAt));
      }
      
      if (fetchLimit !== undefined) {
        q = query(q, limit(fetchLimit));
      }
      
      const querySnapshot = await getDocs(q);
      logger.dbRead('Tải danh sách học sinh (users)', querySnapshot.size || 1);
      let students: SimulatedStudent[] = [];
      const excludedIds = new Set(excludedUserIds);
      
      querySnapshot.forEach(docRef => {
        const data = docRef.data() as any;
        if (!excludedIds.has(docRef.id)) {
          students.push({
            id: docRef.id,
            name: data.name || 'Học sinh mới',
            avatar: data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${docRef.id}`,
            email: data.email || '',
            isPremium: hasActivePremium(data),
            premiumUntil: data.premiumUntil || null,
            premiumPlan: data.premiumPlan || data.planName || (data.trialActivated ? 'Gói Dùng Thử (Trial)' : 'Gói Premium VIP'),
            trialActivated: data.trialActivated === true,
            completedCount: data.completedCount ?? 0,
            lastActiveAt: data.lastActiveAt || '',
            masteryLevels: data.masteryLevels || {},
            completedLessons: data.completedLessons || [],
            stats: data.stats || null
          } as any);
        }
      });
      
      let hasMore = false;
      if (limitCount !== undefined && students.length > limitCount) {
        hasMore = true;
        students = students.slice(0, limitCount);
      }
      
      const lastStudent = students[students.length - 1];
      const lastActiveAtCursor = lastStudent ? (lastStudent as any).lastActiveAt : undefined;
      
      return {
        students,
        lastActiveAt: lastActiveAtCursor,
        hasMore
      };
    } catch (e) {
      logger.error('Tải danh sách học sinh', e);
      return { students: [], hasMore: false };
    }
  },

  /**
   * Lấy danh sách bài làm tự luận cần chấm của học sinh
   */
  async getRealPendingManualAttempts(limitCount?: number): Promise<Array<{ student: SimulatedStudent; attempt: UserAttempt }>> {
    try {
      const q = collection(db, 'manual_attempts');
      let queryRef = query(q);
      
      if (limitCount !== undefined) {
        queryRef = query(q, limit(limitCount));
      }
      
      const pendingSnapshot = await getDocs(queryRef);
      logger.dbRead('Tải bài tự luận chờ chấm (manual_attempts)', pendingSnapshot.size || 1);
      const pending: Array<{ student: SimulatedStudent; attempt: UserAttempt }> = [];
      
      pendingSnapshot.forEach(docRef => {
        const data = docRef.data() as any;
        const attempt = data as UserAttempt;
        
        // Trích xuất thông tin học sinh được phi chuẩn hóa nhúng kèm
        const student: SimulatedStudent = {
          id: attempt.userId,
          name: data.studentName || 'Học sinh mới',
          avatar: data.studentAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${attempt.userId}`,
          email: data.studentEmail || '',
          isPremium: hasActivePremium(data),
          premiumUntil: data.premiumUntil || null,
          premiumPlan: data.premiumPlan || data.planName || (data.trialActivated ? 'Gói Dùng Thử (Trial)' : 'Gói Premium VIP'),
          trialActivated: data.trialActivated === true,
          completedCount: data.completedCount ?? 0,
          masteryLevels: data.masteryLevels || {},
          completedLessons: data.completedLessons || [],
          stats: data.stats || null
        } as any;
        
        pending.push({ student, attempt });
      });
      
      return pending.sort((a, b) => new Date(b.attempt.createdAt).getTime() - new Date(a.attempt.createdAt).getTime());
    } catch (e) {
      logger.error('Tải bài tự luận chờ chấm', e);
      return [];
    }
  },

  /**
   * Giáo viên chấm điểm bài tự luận của học sinh
   */
  async gradeRealAttempt(studentId: string, attempt: UserAttempt, isCorrect: boolean, feedback?: string): Promise<void> {
    try {
      await httpsCallable(functions, 'gradeManualAttempt')({
        userId: studentId,
        attemptId: attempt.id,
        isCorrect,
        feedback: feedback || ''
      });
      logger.dbWrite('Chấm bài nguyên tử qua gradeManualAttempt', 1);
    } catch (e) {
      logger.error('Chấm điểm bài tự luận', e);
      throw e;
    }
  },

  /**
   * Đếm số bài làm tự luận đang chờ chấm bằng API getCountFromServer (chỉ tốn 1 Read)
   */
  async getRealPendingCount(): Promise<number> {
    try {
      const q = collection(db, 'manual_attempts');
      const snapshot = await getCountFromServer(q);
      logger.dbRead('Đếm bài chờ chấm (getCountFromServer)', 1);
      return snapshot.data().count;
    } catch (e) {
      logger.error('Đếm bài chờ chấm', e);
      return 0;
    }
  },

  /**
   * Đếm tổng số học sinh thực tế trong hệ thống bằng API getCountFromServer (chỉ tốn 1 Read)
   */
  async getTotalStudentsCount(): Promise<number> {
    try {
      const q = collection(db, 'users');
      const snapshot = await getCountFromServer(q);
      logger.dbRead('Đếm tổng số học sinh (getCountFromServer)', 1);
      return snapshot.data().count;
    } catch (e) {
      logger.error('Đếm tổng số học sinh', e);
      return 0;
    }
  },

  /**
   * Lấy chi tiết tiến độ 4 Chuyên đề nâng cao của học sinh (Toán 10, Lý 10, Hóa 10, Sinh 10)
   * Tối đa 4 Reads từ subcollection users/{studentId}/advancedProgress
   */
  async getStudentAdvancedProgress(studentId: string): Promise<StudentAdvancedSubjectData[]> {
    if (!studentId) return [];

    try {
      // Dynamic import các ngân hàng câu hỏi & topics nâng cao
      const [
        { advancedMath10Questions, advancedMath10Topics },
        { advancedPhysics10Questions, advancedPhysics10Topics },
        { advancedChemistry10Questions, advancedChemistry10Topics },
        { advancedBiology10Questions, advancedBiology10Topics }
      ] = await Promise.all([
        import('../data/grade10/math/advanced'),
        import('../data/grade10/physics/advanced'),
        import('../data/grade10/chemistry/advanced'),
        import('../data/grade10/biology/advanced')
      ]);

      const subjectsConfig: Array<{
        subjectKey: 'math10' | 'phy10' | 'chem10' | 'bio10';
        subjectName: string;
        icon: string;
        colorClass: string;
        questions: any[];
        topics: any[];
      }> = [
        {
          subjectKey: 'math10',
          subjectName: 'Toán 10 Nâng cao',
          icon: '📐',
          colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30',
          questions: advancedMath10Questions,
          topics: advancedMath10Topics
        },
        {
          subjectKey: 'phy10',
          subjectName: 'Vật lý 10 Nâng cao',
          icon: '⚡',
          colorClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
          questions: advancedPhysics10Questions,
          topics: advancedPhysics10Topics
        },
        {
          subjectKey: 'chem10',
          subjectName: 'Hóa học 10 Nâng cao',
          icon: '🧪',
          colorClass: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/30',
          questions: advancedChemistry10Questions,
          topics: advancedChemistry10Topics
        },
        {
          subjectKey: 'bio10',
          subjectName: 'Sinh học 10 Nâng cao',
          icon: '🧬',
          colorClass: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/30',
          questions: advancedBiology10Questions,
          topics: advancedBiology10Topics
        }
      ];

      // Đọc đồng thời 4 documents từ Firestore
      const docPromises = subjectsConfig.map(sub =>
        getDoc(doc(db, 'users', studentId, 'advancedProgress', sub.subjectKey))
      );
      const snaps = await Promise.all(docPromises);
      logger.dbRead(`Tải tiến độ 4 chuyên đề nâng cao của học sinh ${studentId}`, snaps.length);

      return subjectsConfig.map((sub, idx) => {
        const snap = snaps[idx];
        const data = snap.exists() ? snap.data() : null;
        const attempts: Record<string, { answer: string; isCorrect: boolean; updatedAt: string }> =
          data?.attempts || {};
        const lastUpdatedAt = data?.lastUpdatedAt || undefined;

        let completedCount = 0;
        let correctCount = 0;

        const levelStats = {
          hard: { total: 0, completed: 0, correct: 0 },
          very_hard: { total: 0, completed: 0, correct: 0 },
          extreme: { total: 0, completed: 0, correct: 0 }
        };

        const topicMap = new Map<string, { total: number; completed: number; correct: number }>();
        sub.topics.forEach(t => topicMap.set(t.id, { total: 0, completed: 0, correct: 0 }));

        sub.questions.forEach((q: any) => {
          const lvl = (q.advancedLevel as 'hard' | 'very_hard' | 'extreme') || 'hard';
          if (levelStats[lvl]) {
            levelStats[lvl].total++;
          }

          if (topicMap.has(q.topicId)) {
            topicMap.get(q.topicId)!.total++;
          }

          const attempt = attempts[q.id];
          if (attempt) {
            completedCount++;
            if (levelStats[lvl]) {
              levelStats[lvl].completed++;
            }
            if (topicMap.has(q.topicId)) {
              topicMap.get(q.topicId)!.completed++;
            }

            if (attempt.isCorrect) {
              correctCount++;
              if (levelStats[lvl]) {
                levelStats[lvl].correct++;
              }
              if (topicMap.has(q.topicId)) {
                topicMap.get(q.topicId)!.correct++;
              }
            }
          }
        });

        const topicStats = sub.topics.map(t => {
          const stats = topicMap.get(t.id) || { total: 0, completed: 0, correct: 0 };
          return {
            topicId: t.id,
            title: t.title,
            shortTitle: t.shortTitle,
            total: stats.total,
            completed: stats.completed,
            correct: stats.correct
          };
        });

        const accuracyRate =
          completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;

        return {
          subjectKey: sub.subjectKey,
          subjectName: sub.subjectName,
          icon: sub.icon,
          colorClass: sub.colorClass,
          totalQuestions: sub.questions.length,
          completedCount,
          correctCount,
          accuracyRate,
          lastUpdatedAt,
          levelStats,
          topicStats,
          attempts,
          questions: sub.questions.map((q: any) => ({
            id: q.id,
            topicId: q.topicId,
            prompt: q.content || q.prompt || '',
            content: q.content || q.prompt || '',
            advancedLevel: q.advancedLevel || 'hard',
            options: q.options || [],
            correctAnswer: q.correctAnswer || ''
          }))
        };
      });
    } catch (err) {
      logger.error('Lỗi khi tải tiến độ chuyên đề nâng cao của học sinh', err);
      return [];
    }
  }
};

export interface StudentAdvancedSubjectData {
  subjectKey: 'math10' | 'phy10' | 'chem10' | 'bio10';
  subjectName: string;
  icon: string;
  colorClass: string;
  totalQuestions: number;
  completedCount: number;
  correctCount: number;
  accuracyRate: number;
  lastUpdatedAt?: string;
  levelStats: {
    hard: { total: number; completed: number; correct: number };
    very_hard: { total: number; completed: number; correct: number };
    extreme: { total: number; completed: number; correct: number };
  };
  topicStats: Array<{
    topicId: string;
    title: string;
    shortTitle?: string;
    total: number;
    completed: number;
    correct: number;
  }>;
  attempts: Record<string, { answer: string; isCorrect: boolean; updatedAt: string }>;
  questions: Array<{
    id: string;
    topicId: string;
    prompt: string;
    advancedLevel: 'hard' | 'very_hard' | 'extreme';
    options?: string[];
    correctAnswer?: string;
  }>;
}
