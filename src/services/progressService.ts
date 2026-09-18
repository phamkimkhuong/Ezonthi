import { db, functions } from './firebase';
import { doc, setDoc, collection, getDocs, query, getDoc, arrayUnion, updateDoc, deleteField, orderBy, limit, startAfter, documentId, where } from 'firebase/firestore';
import { UserAttempt, UserMistake, UserProgress, ExamResult, ActiveExamSession, ExamSummaryMap, ExamSummaryItem } from '../types';
import { User } from 'firebase/auth';
import { storageService } from './storage';
import { useAppStore } from './store';
import { httpsCallable } from 'firebase/functions';
import { logger } from '../utils/logger';
import { mergeMistakes, pendingAttemptsForAccount, reconcileAttempts } from '../utils/learningSync';

const authMergePromises = new Map<string, Promise<void>>();

const safeDocId = (rawId: string, fallback: string): string => {
  const id = rawId.trim() || fallback;
  return encodeURIComponent(id).replace(/\./g, '%2E');
};

const SYNC_BATCH_SIZE = 50;

interface LearningSyncResult {
  acknowledgedIds: string[];
  conflictIds: string[];
  rejectedCount: number;
}

export interface AttemptHistoryCursor {
  createdAt: string;
  id: string;
}

export interface AttemptHistoryPage {
  items: UserAttempt[];
  nextCursor: AttemptHistoryCursor | null;
}

const syncAttemptChunks = async (userId: string, attempts: UserAttempt[]): Promise<string[]> => {
  const acknowledged: string[] = [];
  for (let index = 0; index < attempts.length; index += SYNC_BATCH_SIZE) {
    const chunk = attempts.slice(index, index + SYNC_BATCH_SIZE).map(attempt => {
      const payload = { ...attempt, userId };
      delete payload.synced;
      return payload;
    });
    const response = await httpsCallable<{ attempts: UserAttempt[]; operationId: string }, LearningSyncResult>(functions, 'syncLearningData')({
      attempts: chunk,
      operationId: `sync-${Date.now()}-${index}`,
    });
    const result = response.data;
    if (result.rejectedCount > 0 || result.conflictIds.length > 0) {
      throw new Error(`Sync rejected=${result.rejectedCount}, conflicts=${result.conflictIds.length}`);
    }
    acknowledged.push(...result.acknowledgedIds);
    storageService.markAttemptsAsSyncedLocal(userId, result.acknowledgedIds);
  }
  return acknowledged;
};

export const progressService = {
  // Lấy hoặc khởi tạo Progress của người dùng từ Firestore
  async getUserProgressFromFirestore(userId: string): Promise<UserProgress | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      logger.dbRead('Lấy tiến trình học sinh (users/{userId})', 1);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        userId,
        masteryLevels: data.masteryLevels || {},
        completedLessons: data.completedLessons || [],
        readLessons: data.readLessons || [],
        passedCheckpoints: data.passedCheckpoints || [],
        lastUpdatedAt: data.lastActiveAt || new Date().toISOString()
      };
    } catch (e) {
      logger.error('Lấy tiến trình học sinh', e);
      return null;
    }
  },

  // Đồng bộ thông minh dữ liệu Firestore xuống LocalStorage (chỉ tải khi Local rỗng hoặc cũ hơn Server)
  async syncLocalDataToFirestore(userId: string): Promise<void> {
    return this.syncUserData(userId);
  },

  async syncUserData(userId: string): Promise<void> {
    const runningSync = authMergePromises.get(userId);
    if (runningSync) {
      return runningSync;
    }

    const syncPromise = this.syncUserDataInternal(userId)
      .finally(() => {
        authMergePromises.delete(userId);
      });

    authMergePromises.set(userId, syncPromise);
    return syncPromise;
  },

  async syncUserDataInternal(userId: string): Promise<void> {
    try {
      // Snapshot the outbox before any server hydration. Guest attempts are
      // reassigned only in the upload payload and remain local until all steps pass.
      const localAttempts = storageService.getAttempts(userId);
      const guestAttempts = storageService.getAttempts('guest');
      const pending = pendingAttemptsForAccount(userId, localAttempts, guestAttempts);
      const localReadLessons = storageService.getReadLessons(userId);
      const guestReadLessons = storageService.getReadLessons('guest');
      const localCheckpoints = storageService.getPassedTheoryCheckpoints(userId);
      const guestCheckpoints = storageService.getPassedTheoryCheckpoints('guest');
      const localExams = storageService.getExamResults(userId);
      const guestExams = storageService.getExamResults('guest');
      const guestActiveSessions = storageService.getActiveExamSessions('guest');
      if (guestActiveSessions.length > 0) {
        guestActiveSessions.forEach(guestSession => {
          const localSession = storageService.getActiveExamSession(userId, guestSession.sourceExamId);
          if (!localSession || new Date(guestSession.lastSavedAt).getTime() > new Date(localSession.lastSavedAt).getTime()) {
            storageService.saveActiveExamSession(userId, guestSession);
            void this.saveActiveExamSessionToFirestore(userId, guestSession);
          }
        });
      }

      await httpsCallable(functions, 'migrateLearningData')({});
      await syncAttemptChunks(userId, pending);

      const mergedReadLessons = Array.from(new Set([...localReadLessons, ...guestReadLessons]));
      const mergedPassedCheckpoints = Array.from(new Set([...localCheckpoints, ...guestCheckpoints]));
      const mergedExams = Array.from(new Map([...localExams, ...guestExams].map(exam => [exam.examId, exam])).values());
      const syncedAt = new Date().toISOString();
      const authenticatedUser = useAppStore.getState().user;

      await setDoc(doc(db, 'users', userId), {
        ...(authenticatedUser ? {
          id: userId,
          email: authenticatedUser.email,
          name: authenticatedUser.displayName || 'Học sinh mới',
          avatar: authenticatedUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`,
        } : {}),
        ...(mergedReadLessons.length ? { readLessons: arrayUnion(...mergedReadLessons) } : {}),
        ...(mergedPassedCheckpoints.length ? { passedCheckpoints: arrayUnion(...mergedPassedCheckpoints) } : {}),
        lastActiveAt: syncedAt
      }, { merge: true });
      await Promise.all(mergedExams.map(result => setDoc(
        doc(db, `users/${userId}/exam_results`, safeDocId(result.examId, `exam-${Date.now()}`)),
        { ...result, syncedAt },
        { merge: true }
      )));

      // Hydrate only after the upload has been acknowledged. A second device
      // therefore receives the same canonical documents and pending never vanishes.
      const [userSnap, remoteAttempts, remoteMistakes, remoteExams] = await Promise.all([
        getDoc(doc(db, 'users', userId)),
        this.getAttempts(userId),
        this.getMistakes(userId),
        this.getExamResults(userId)
      ]);
      const remoteData = userSnap.exists() ? userSnap.data() : {};
      const currentLocal = storageService.getAttempts(userId);
      const reassignedGuest = guestAttempts.map(attempt => ({ ...attempt, userId, synced: false }));
      storageService.replaceAttemptsLocal(userId, reconcileAttempts([...currentLocal, ...reassignedGuest], remoteAttempts));
      storageService.saveMistakesLocal(userId, mergeMistakes(remoteMistakes));
      storageService.saveExamResultsLocal(userId, remoteExams);
      storageService.saveReadLessonsLocal(userId, Array.from(new Set([
        ...mergedReadLessons,
        ...(Array.isArray(remoteData.readLessons) ? remoteData.readLessons : [])
      ])));
      storageService.savePassedTheoryCheckpointsLocal(userId, Array.from(new Set([
        ...mergedPassedCheckpoints,
        ...(Array.isArray(remoteData.passedCheckpoints) ? remoteData.passedCheckpoints : [])
      ])));
      storageService.saveProgressLocal(userId, {
        userId,
        masteryLevels: remoteData.masteryLevels || {},
        completedLessons: remoteData.completedLessons || [],
        readLessons: remoteData.readLessons || mergedReadLessons,
        passedCheckpoints: remoteData.passedCheckpoints || mergedPassedCheckpoints,
        lastUpdatedAt: remoteData.lastActiveAt || syncedAt
      });

      // Guest data is cleared only after upload, profile merge and hydration all pass.
      storageService.clearGuestData();
      useAppStore.setState({ userData: remoteData });
      useAppStore.getState().refreshProgress();
      logger.debug(`[Learning Sync v2] Hoàn tất đồng bộ cho user ${userId}`);
    } catch (e) {
      // Keep local and guest outboxes untouched so the next login/focus can retry.
      logger.error('Lỗi đồng bộ dữ liệu người dùng; dữ liệu pending được giữ lại:', e);
    }
  },
  // Tải dữ liệu từ Firestore về và ghi đè vào LocalStorage (Hydration)
  async hydrateFirestoreDataToLocal(userId: string): Promise<void> {
    try {
      // 1. Tải Progress
      const progress = await this.getUserProgressFromFirestore(userId);
      storageService.saveProgressLocal(userId, progress ?? {
        userId,
        masteryLevels: {},
        completedLessons: [],
        readLessons: [],
        passedCheckpoints: [],
        lastUpdatedAt: new Date().toISOString()
      });

      // 2. Tải Attempts
      const attempts = await this.getAttempts(userId);
      storageService.saveAttemptsLocal(userId, attempts);

      // 3. Tải Mistakes
      const mistakes = await this.getMistakes(userId);
      storageService.saveMistakesLocal(userId, mistakes);

      // 4. Tải Exam Results
      const exams = await this.getExamResults(userId);
      storageService.saveExamResultsLocal(userId, exams);

      if (progress?.readLessons) {
        storageService.saveReadLessonsLocal(userId, progress.readLessons);
      }
      if (progress?.passedCheckpoints) {
        storageService.savePassedTheoryCheckpointsLocal(userId, progress.passedCheckpoints);
      }

      useAppStore.getState().refreshProgress();
      console.log(`Đã hydrate thành công dữ liệu từ Firestore xuống LocalStorage cho user: ${userId}`);
    } catch (e) {
      console.error('Lỗi khi hydrate dữ liệu từ Firestore xuống local:', e);
    }
  },

  // Upload the durable local outbox in small idempotent batches.
  async flushPendingAttempts(userId: string, targetQuestionTypeId?: string): Promise<void> {
    try {
      let pendingAttempts = storageService.getPendingAttemptsLocal(userId);
      if (targetQuestionTypeId) {
        pendingAttempts = pendingAttempts.filter(attempt => attempt.questionTypeId === targetQuestionTypeId);
      }
      if (pendingAttempts.length === 0) return;

      const acknowledged = await syncAttemptChunks(userId, pendingAttempts);
      const syncedAt = new Date().toISOString();
      await setDoc(doc(db, 'users', userId), {
        readLessons: storageService.getReadLessons(userId),
        passedCheckpoints: storageService.getPassedTheoryCheckpoints(userId),
        lastActiveAt: syncedAt
      }, { merge: true });

      const progress = storageService.getProgress(userId);
      progress.lastUpdatedAt = syncedAt;
      storageService.saveProgressLocal(userId, progress);
      logger.dbWrite(`Đồng bộ ${acknowledged.length} bài làm vào learning_attempts`, acknowledged.length);
    } catch (e) {
      logger.error('Đồng bộ chưa hoàn tất; dữ liệu pending được giữ để thử lại', e);
    }
  },

  async saveAttempt(userId: string, attempt: UserAttempt): Promise<void> {
    // Local first is the durability boundary. Network failure cannot lose the answer.
    storageService.saveAttempt(userId, attempt);
    if (userId !== 'guest' && attempt.gradingMode === 'manual') {
      await this.flushPendingAttempts(userId);
    }
  },

  async saveExamSubmission(
    userId: string,
    result: ExamResult,
    attempts: UserAttempt[],
    mistakes: UserMistake[]
  ): Promise<void> {
    try {
      void mistakes;
      for (const attempt of attempts) storageService.saveAttempt(userId, attempt);
      storageService.saveExamResult(userId, result);
      await this.flushPendingAttempts(userId);
      await this.saveExamResult(userId, result);
    } catch (e) {
      logger.error('Nộp bài thi thử chưa hoàn tất; bản local vẫn được giữ', e);
    }
  },

  // Mistakes are a projection derived by the backend from canonical attempts.
  async saveMistake(userId: string, mistake: UserMistake): Promise<void> {
    const current = storageService.getMistakes(userId);
    storageService.saveMistakesLocal(userId, mergeMistakes(current, [{ ...mistake, userId }]));
  },
  // Lưu kết quả thi thử lên Firestore & cập nhật document tóm tắt duy nhất (1 Document Summary)
  async saveExamResult(userId: string, result: ExamResult): Promise<void> {
    try {
      // 1. Lưu bản ghi chi tiết đầy đủ (Lazy Load khi cần xem lại bài giải)
      const examRef = doc(db, `users/${userId}/exam_results`, safeDocId(result.examId, `exam-${Date.now()}`));
      await setDoc(examRef, {
        ...result,
        syncedAt: new Date().toISOString()
      }, { merge: true });
      logger.dbWrite('Lưu kết quả thi thử (users/{userId}/exam_results)', 1);

      // 2. Cập nhật Document tóm tắt duy nhất (Chỉ tốn 1 Read khi mở menu thi thử)
      const examKey = result.sourceExamId || result.examId;
      const summaryRef = doc(db, `users/${userId}/progress/exam_summary`);
      
      const localSummary = storageService.getExamSummaryMap(userId);
      const existing = localSummary[examKey];
      const bestScore = existing ? Math.max(existing.bestScore, result.score) : result.score;
      const attemptsCount = (existing?.attemptsCount ?? 0) + 1;

      const summaryItem: ExamSummaryItem = {
        bestScore,
        lastScore: result.score,
        attemptsCount,
        lastCompletedAt: result.completedAt,
        lastExamId: result.examId,
        lastTimeSpent: result.timeSpent
      };

      await setDoc(summaryRef, {
        [examKey]: summaryItem,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      logger.dbWrite('Cập nhật document tóm tắt thi thử (users/{userId}/progress/exam_summary)', 1);
    } catch (e) {
      logger.error('Lưu kết quả thi thử', e);
    }
  },

  // Lấy Document Tóm Tắt Thi Thử (Chỉ 1 lượt Read Firestore duy nhất cho toàn bộ danh sách đề thi!)
  async getExamSummary(userId: string): Promise<ExamSummaryMap> {
    try {
      const localSummary = storageService.getExamSummaryMap(userId);
      if (!userId || userId === 'guest') {
        return localSummary;
      }

      const summaryRef = doc(db, `users/${userId}/progress/exam_summary`);
      const snapshot = await getDoc(summaryRef);
      logger.dbRead('Tải document tóm tắt thi thử (1 read)', 1);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const remoteSummary: ExamSummaryMap = {};
        for (const [key, value] of Object.entries(data)) {
          if (key !== 'updatedAt' && typeof value === 'object' && value !== null) {
            remoteSummary[key] = value as ExamSummaryItem;
          }
        }
        // Hợp nhất dữ liệu
        const merged: ExamSummaryMap = { ...localSummary };
        for (const [key, val] of Object.entries(remoteSummary)) {
          if (!merged[key]) {
            merged[key] = val;
          } else {
            const isValNewer = new Date(val.lastCompletedAt).getTime() >= new Date(merged[key].lastCompletedAt).getTime();
            merged[key] = {
              bestScore: Math.max(merged[key].bestScore, val.bestScore),
              lastScore: isValNewer ? val.lastScore : merged[key].lastScore,
              attemptsCount: Math.max(merged[key].attemptsCount, val.attemptsCount),
              lastCompletedAt: isValNewer ? val.lastCompletedAt : merged[key].lastCompletedAt,
              lastExamId: isValNewer ? val.lastExamId : merged[key].lastExamId,
              lastTimeSpent: val.lastTimeSpent ?? merged[key].lastTimeSpent
            };
          }
        }
        return merged;
      }
      return localSummary;
    } catch (e) {
      logger.error('Tải document tóm tắt thi thử', e);
      return storageService.getExamSummaryMap(userId);
    }
  },

  // Lấy chi tiết 1 bài thi từ Firestore (Chỉ 1 Read theo nhu cầu khi học sinh bấm "Xem lại bài thi")
  async getExamResultDetail(userId: string, examId: string): Promise<ExamResult | null> {
    try {
      const local = storageService.getExamResultById(userId, examId);
      if (local) return local;

      if (!userId || userId === 'guest') return null;

      const examRef = doc(db, `users/${userId}/exam_results`, safeDocId(examId, examId));
      const snapshot = await getDoc(examRef);
      logger.dbRead('Tải chi tiết 1 bài thi (1 read)', 1);

      if (snapshot.exists()) {
        const result = snapshot.data() as ExamResult;
        storageService.saveExamResult(userId, result);
        return result;
      }
      return null;
    } catch (e) {
      logger.error('Tải chi tiết bài thi', e);
      return null;
    }
  },

  // Tải các attempt của đúng dạng bài hiện tại từ Firestore (Targeted Query)
  async getTopicAttempts(userId: string, questionTypeId: string): Promise<UserAttempt[]> {
    try {
      if (!userId || userId === 'guest' || !questionTypeId) return [];
      const base = collection(db, `users/${userId}/learning_attempts`);
      const q = query(
        base,
        where('questionTypeId', '==', questionTypeId),
        limit(50)
      );
      const snapshot = await getDocs(q);
      logger.dbRead(`Tải bài làm dạng bài ${questionTypeId} (learning_attempts)`, snapshot.size || 1);
      const items = snapshot.docs.map(item => ({ ...item.data(), id: item.id, synced: true } as UserAttempt));
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      logger.error(`Tải bài làm dạng bài ${questionTypeId}`, e);
      return [];
    }
  },

  async getAttemptsPage(userId: string, cursor: AttemptHistoryCursor | null = null, pageSize = 100, historyBucket?: string): Promise<AttemptHistoryPage> {
    const safeSize = Math.max(1, Math.min(100, Math.round(pageSize)));
    const base = collection(db, `users/${userId}/learning_attempts`);
    const constraints = [
      ...(historyBucket ? [where('historyBucket', '==', historyBucket)] : []),
      orderBy('createdAt', 'desc'),
      orderBy(documentId(), 'desc'),
      ...(cursor ? [startAfter(cursor.createdAt, cursor.id)] : []),
      limit(safeSize),
    ];
    const snapshot = await getDocs(query(base, ...constraints));
    const items = snapshot.docs.map(item => ({ ...item.data(), id: item.id, synced: true } as UserAttempt));
    const last = snapshot.docs.at(-1);
    return {
      items,
      nextCursor: snapshot.size === safeSize && last ? { createdAt: String(last.data().createdAt), id: last.id } : null,
    };
  },

  // Hydration tải theo trang và giữ trần 500 bài gần nhất; lịch sử cũ vẫn còn trên server và có cursor riêng.
  async getAttempts(userId: string): Promise<UserAttempt[]> {
    try {
      const items: UserAttempt[] = [];
      let cursor: AttemptHistoryCursor | null = null;
      do {
        const page = await this.getAttemptsPage(userId, cursor, 100);
        items.push(...page.items);
        cursor = page.nextCursor;
      } while (cursor && items.length < 500);
      logger.dbRead('Tải bài làm chuẩn theo trang (learning_attempts)', Math.max(1, items.length));
      return items;
    } catch (e) {
      logger.error('Tải bài làm chuẩn (learning_attempts)', e);
      return [];
    }
  },

  // Mistakes are the backend-derived canonical projection.
  async getMistakes(userId: string): Promise<UserMistake[]> {
    try {
      const snapshot = await getDocs(query(collection(db, `users/${userId}/learning_mistakes`)));
      logger.dbRead('Tải Sổ lỗi sai chuẩn (learning_mistakes)', snapshot.size || 1);
      return snapshot.docs.map(item => item.data() as UserMistake);
    } catch (e) {
      logger.error('Tải Sổ lỗi sai chuẩn (learning_mistakes)', e);
      return [];
    }
  },

  // Lấy toàn bộ Lịch sử Thi thử của người dùng từ Firestore
  async getExamResults(userId: string): Promise<ExamResult[]> {
    try {
      const q = query(collection(db, `users/${userId}/exam_results`));
      const querySnapshot = await getDocs(q);
      logger.dbRead('Tải kết quả thi thử của học sinh (exam_results)', querySnapshot.size || 1);
      const results: ExamResult[] = [];
      querySnapshot.forEach(doc => {
        results.push(doc.data() as ExamResult);
      });
      return results;
    } catch (e) {
      logger.error('Tải kết quả thi thử của học sinh (exam_results)', e);
      return [];
    }
  },

  // TEACHER REAL DATA INTEGRATION
  async saveUserProfile(user: User, name?: string): Promise<void> {
    try {
      const syncedAt = new Date().toISOString();
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        name: user.displayName || name || 'Học sinh mới',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
        email: user.email,
        lastActiveAt: syncedAt
      }, { merge: true });


    } catch (e) {
      console.error('Lỗi khi lưu thông tin user lên Firestore:', e);
    }
  },

  // Lưu tiến độ hoàn thành đọc lý thuyết tức thì lên Firestore
  async saveLessonRead(userId: string, lessonId: string): Promise<void> {
    try {
      storageService.saveLessonRead(userId, lessonId);
      if (userId && userId !== 'guest') {
        const syncedAt = new Date().toISOString();
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          readLessons: arrayUnion(lessonId),
          lastActiveAt: syncedAt
        }, { merge: true });
        logger.dbWrite(`Lưu hoàn thành bài học lý thuyết ${lessonId} lên Firestore`, 1);
      }
    } catch (e) {
      logger.error('Lỗi khi lưu bài học lý thuyết lên Firestore:', e);
    }
  },

  // Lưu tiến độ hoàn thành checkpoint lý thuyết tức thì lên Firestore
  async saveTheoryCheckpointPassed(userId: string, checkpointId: string): Promise<void> {
    try {
      storageService.saveTheoryCheckpointPassed(userId, checkpointId);
      if (userId && userId !== 'guest') {
        const syncedAt = new Date().toISOString();
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
          passedCheckpoints: arrayUnion(checkpointId),
          lastActiveAt: syncedAt
        }, { merge: true });
        logger.dbWrite(`Lưu hoàn thành checkpoint lý thuyết ${checkpointId} lên Firestore`, 1);
      }
    } catch (e) {
      logger.error('Lỗi khi lưu checkpoint lý thuyết lên Firestore:', e);
    }
  },

  // ACTIVE EXAM SESSIONS CLOUD SYNC (LƯU TRONG 1 DOCUMENT DUY NHẤT users/{userId} - 1 READ TỐI ƯU)
  async getActiveExamSessionsFromFirestore(userId: string): Promise<Record<string, ActiveExamSession>> {
    try {
      if (!userId || userId === 'guest') return {};
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      logger.dbRead('Lấy danh sách bài thi dở dang từ Firestore (users/{userId})', 1);

      if (!userSnap.exists()) return {};
      const data = userSnap.data();
      return (data.activeExamSessions as Record<string, ActiveExamSession>) || {};
    } catch (e) {
      logger.error('Lỗi khi lấy active exam sessions từ Firestore:', e);
      return {};
    }
  },

  async saveActiveExamSessionToFirestore(userId: string, session: ActiveExamSession): Promise<void> {
    try {
      if (!userId || userId === 'guest') return;
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        activeExamSessions: {
          [session.sourceExamId]: session
        }
      }, { merge: true });
      logger.dbWrite(`Lưu bản nháp bài thi ${session.sourceExamId} lên Firestore (users/{userId})`, 1);
    } catch (e) {
      logger.error('Lỗi khi lưu active exam session lên Firestore:', e);
    }
  },

  async deleteActiveExamSessionFromFirestore(userId: string, sourceExamId: string): Promise<void> {
    try {
      if (!userId || userId === 'guest') return;
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`activeExamSessions.${sourceExamId}`]: deleteField()
      });
      logger.dbWrite(`Xóa bản nháp bài thi ${sourceExamId} trên Firestore (users/{userId})`, 1);
    } catch (e) {
      logger.error('Lỗi khi xóa active exam session trên Firestore:', e);
    }
  },

  // --- Chuyên đề nâng cao (Advanced Progress Sync) ---
  async getAdvancedProgressFromFirestore(
    userId: string,
    subjectKey: string = 'phy10'
  ): Promise<Record<string, { answer: string; isCorrect: boolean; updatedAt: string }>> {
    try {
      if (!userId || userId === 'guest') return {};
      const docRef = doc(db, 'users', userId, 'advancedProgress', subjectKey);
      const snap = await getDoc(docRef);
      logger.dbRead(`Lấy tiến trình chuyên đề nâng cao ${subjectKey} (users/{userId}/advancedProgress/${subjectKey})`, 1);
      if (!snap.exists()) return {};
      return (snap.data().attempts as Record<string, { answer: string; isCorrect: boolean; updatedAt: string }>) || {};
    } catch (e) {
      logger.error(`Lỗi khi lấy tiến trình chuyên đề nâng cao ${subjectKey}:`, e);
      return {};
    }
  },

  async saveAdvancedAttemptToFirestore(
    userId: string,
    subjectKey: string,
    questionId: string,
    attempt: { answer: string; isCorrect: boolean; updatedAt: string }
  ): Promise<void> {
    try {
      if (!userId || userId === 'guest') return;
      const docRef = doc(db, 'users', userId, 'advancedProgress', subjectKey);
      await setDoc(docRef, {
        subjectKey,
        lastUpdatedAt: attempt.updatedAt,
        attempts: {
          [questionId]: attempt
        }
      }, { merge: true });
      logger.dbWrite(`Lưu câu làm ${questionId} chuyên đề nâng cao ${subjectKey} lên Firestore`, 1);
    } catch (e) {
      logger.error(`Lỗi khi lưu câu làm chuyên đề nâng cao ${subjectKey}:`, e);
    }
  },

  async clearAdvancedProgressFromFirestore(
    userId: string,
    subjectKey: string = 'phy10'
  ): Promise<void> {
    try {
      if (!userId || userId === 'guest') return;
      const docRef = doc(db, 'users', userId, 'advancedProgress', subjectKey);
      await setDoc(docRef, {
        subjectKey,
        lastUpdatedAt: new Date().toISOString(),
        attempts: {}
      });
      logger.dbWrite(`Xóa tiến độ chuyên đề nâng cao ${subjectKey} trên Firestore`, 1);
    } catch (e) {
      logger.error(`Lỗi khi xóa tiến độ chuyên đề nâng cao ${subjectKey}:`, e);
    }
  },

  async getAdvancedDataFromFirestore(
    userId: string,
    subjectKey: string = 'phy10'
  ): Promise<{
    attempts: Record<string, { answer: string; isCorrect: boolean; updatedAt: string }>;
    bookmarks: Record<string, { savedAt: string }>;
  }> {
    try {
      if (!userId || userId === 'guest') return { attempts: {}, bookmarks: {} };
      const docRef = doc(db, 'users', userId, 'advancedProgress', subjectKey);
      const snap = await getDoc(docRef);
      logger.dbRead(`Lấy toàn bộ dữ liệu chuyên đề nâng cao ${subjectKey} (users/{userId}/advancedProgress/${subjectKey})`, 1);
      if (!snap.exists()) return { attempts: {}, bookmarks: {} };
      const data = snap.data();
      return {
        attempts: (data.attempts as Record<string, { answer: string; isCorrect: boolean; updatedAt: string }>) || {},
        bookmarks: (data.bookmarks as Record<string, { savedAt: string }>) || {}
      };
    } catch (e) {
      logger.error(`Lỗi khi lấy toàn bộ dữ liệu chuyên đề nâng cao ${subjectKey}:`, e);
      return { attempts: {}, bookmarks: {} };
    }
  },

  async saveAdvancedBookmarkToFirestore(
    userId: string,
    subjectKey: string,
    questionId: string,
    isBookmarked: boolean
  ): Promise<void> {
    try {
      if (!userId || userId === 'guest') return;
      const docRef = doc(db, 'users', userId, 'advancedProgress', subjectKey);
      if (isBookmarked) {
        await setDoc(docRef, {
          subjectKey,
          bookmarks: {
            [questionId]: { savedAt: new Date().toISOString() }
          }
        }, { merge: true });
        logger.dbWrite(`Lưu bookmark câu ${questionId} chuyên đề ${subjectKey} lên Firestore`, 1);
      } else {
        await updateDoc(docRef, {
          [`bookmarks.${questionId}`]: deleteField()
        });
        logger.dbWrite(`Xóa bookmark câu ${questionId} chuyên đề ${subjectKey} trên Firestore`, 1);
      }
    } catch (e) {
      logger.error(`Lỗi khi cập nhật bookmark chuyên đề ${subjectKey}:`, e);
    }
  }
};
