import type { UserAttempt, UserMistake, UserProgress, ExamResult, ActiveExamSession, ExamSummaryMap } from '../types';
import { calculateMasteryEvidence } from '../utils/theme';

const KEYS = {
  ATTEMPTS: 'otv10_attempts',
  MISTAKES: 'otv10_mistakes',
  PROGRESS: 'otv10_progress',
  EXAM_RESULTS: 'otv10_exam_results',
  READ_THEORY: 'otv10_read_theory',
  THEORY_CHECKPOINTS: 'otv10_theory_checkpoints',
  ACTIVE_EXAM: 'otv10_active_exam'
};

// Helper để đọc từ localStorage và tự động migrate dữ liệu cũ nếu là Array
const readAttemptsMap = (): Record<string, UserAttempt[]> => {
  try {
    const data = localStorage.getItem(KEYS.ATTEMPTS);
    if (!data) return {};
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const migrated = { guest: parsed };
      localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi khi đọc attempts từ localStorage', e);
    return {};
  }
};

const readMistakesMap = (): Record<string, UserMistake[]> => {
  try {
    const data = localStorage.getItem(KEYS.MISTAKES);
    if (!data) return {};
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const migrated = { guest: parsed };
      localStorage.setItem(KEYS.MISTAKES, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi khi đọc mistakes từ localStorage', e);
    return {};
  }
};

const readExamResultsMap = (): Record<string, ExamResult[]> => {
  try {
    const data = localStorage.getItem(KEYS.EXAM_RESULTS);
    if (!data) return {};
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const migrated = { guest: parsed };
      localStorage.setItem(KEYS.EXAM_RESULTS, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi khi đọc exam results từ localStorage', e);
    return {};
  }
};

const readProgressMap = (): Record<string, UserProgress> => {
  try {
    const data = localStorage.getItem(KEYS.PROGRESS);
    if (!data) return {};
    const parsed = JSON.parse(data);
    // Progress ban đầu đã được thiết kế dạng Map
    return parsed;
  } catch (e) {
    console.error('Lỗi khi đọc progress từ localStorage', e);
    return {};
  }
};

const readReadTheoryMap = (): Record<string, string[]> => {
  try {
    const data = localStorage.getItem(KEYS.READ_THEORY);
    if (!data) return {};
    const parsed = JSON.parse(data);
    // Tự động migrate dữ liệu cũ nếu là Array phẳng
    if (Array.isArray(parsed)) {
      const migrated = { guest: parsed };
      localStorage.setItem(KEYS.READ_THEORY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi khi đọc read theory từ localStorage', e);
    return {};
  }
};

const readTheoryCheckpointMap = (): Record<string, string[]> => {
  try {
    const data = localStorage.getItem(KEYS.THEORY_CHECKPOINTS);
    if (!data) return {};
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      const migrated = { guest: parsed };
      localStorage.setItem(KEYS.THEORY_CHECKPOINTS, JSON.stringify(migrated));
      return migrated;
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi khi đọc theory checkpoints từ localStorage', e);
    return {};
  }
};

const readActiveExamMap = (): Record<string, Record<string, ActiveExamSession>> => {
  try {
    const data = localStorage.getItem(KEYS.ACTIVE_EXAM);
    if (!data) return {};
    const parsed = JSON.parse(data);
    // Migration: nếu dữ liệu cũ lưu dạng Record<string, ActiveExamSession> (userId -> single session)
    // thì tự động migrate sang Record<string, Record<string, ActiveExamSession>> (userId -> sourceExamId -> session)
    const result: Record<string, Record<string, ActiveExamSession>> = {};
    for (const [userId, userVal] of Object.entries(parsed)) {
      if (userVal && typeof userVal === 'object') {
        if ('sourceExamId' in userVal) {
          const single = userVal as ActiveExamSession;
          result[userId] = { [single.sourceExamId]: single };
        } else {
          result[userId] = userVal as Record<string, ActiveExamSession>;
        }
      }
    }
    return result;
  } catch (e) {
    console.error('Lỗi khi đọc active exam từ localStorage', e);
    return {};
  }
};

// Helper để ghi vào localStorage an toàn
const writeToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
};

export const storageService = {
  // ATTEMPTS
  getAttempts(userId: string = 'guest'): UserAttempt[] {
    const map = readAttemptsMap();
    return map[userId] || [];
  },

  saveAttempt(userId: string = 'guest', attempt: UserAttempt): void {
    const map = readAttemptsMap();
    if (!map[userId]) {
      map[userId] = [];
    }
    const attemptWithSyncFlag = {
      ...attempt,
      synced: attempt.synced !== undefined ? attempt.synced : false
    };
    const existingIndex = map[userId].findIndex(item => item.id === attempt.id);
    if (existingIndex >= 0) {
      // Stable attempt IDs make local retries idempotent. Keep an acknowledged
      // flag when the same attempt is saved again after a successful sync.
      map[userId][existingIndex] = {
        ...map[userId][existingIndex],
        ...(map[userId][existingIndex].synced === true ? { synced: true } : attemptWithSyncFlag),
      };
    } else {
      map[userId].push(attemptWithSyncFlag);
    }
    writeToStorage(KEYS.ATTEMPTS, map);

    // Tự động cập nhật tiến độ học tập và sổ lỗi sai tương ứng với các bài làm được chấm tự động
    if (attempt.gradingMode !== 'manual') {
      this.updateProgress(userId, attempt.questionTypeId);

      if (!attempt.isCorrect) {
        this.addOrUpdateMistake(userId, attempt);
      } else {
        this.resolveMistakeIfCorrect(userId, attempt.questionId);
      }
    }
  },

  saveAttemptsLocal(userId: string, attempts: UserAttempt[]): void {
    const map = readAttemptsMap();
    const remote = new Map(attempts.map(attempt => [attempt.id, { ...attempt, synced: true }]));
    const pending = (map[userId] || []).filter(attempt => attempt.synced === false && !remote.has(attempt.id));
    map[userId] = [...remote.values(), ...pending];
    writeToStorage(KEYS.ATTEMPTS, map);
  },

  replaceAttemptsLocal(userId: string, attempts: UserAttempt[]): void {
    const map = readAttemptsMap();
    map[userId] = attempts;
    writeToStorage(KEYS.ATTEMPTS, map);
  },

  getTopicAttemptsLocal(userId: string, questionTypeId: string): UserAttempt[] {
    const attempts = this.getAttempts(userId);
    return attempts.filter(a => a.questionTypeId === questionTypeId);
  },

  saveTopicAttemptsLocal(userId: string, questionTypeId: string, topicAttempts: UserAttempt[]): void {
    const allAttempts = this.getAttempts(userId);
    const otherAttempts = allAttempts.filter(a => a.questionTypeId !== questionTypeId);
    const remote = new Map(topicAttempts.map(attempt => [attempt.id, { ...attempt, synced: true }]));
    const pendingForTopic = allAttempts.filter(attempt => attempt.questionTypeId === questionTypeId && attempt.synced === false && !remote.has(attempt.id));
    this.replaceAttemptsLocal(userId, [...otherAttempts, ...remote.values(), ...pendingForTopic]);
  },

  getPendingAttemptsLocal(userId: string): UserAttempt[] {
    const attempts = this.getAttempts(userId);
    return attempts.filter(a => a.synced === false);
  },

  markAttemptsAsSyncedLocal(userId: string, attemptIds: string[]): void {
    const map = readAttemptsMap();
    if (!map[userId]) return;
    const idsSet = new Set(attemptIds);
    map[userId] = map[userId].map(a => idsSet.has(a.id) ? { ...a, synced: true } : a);
    writeToStorage(KEYS.ATTEMPTS, map);
  },

  // MISTAKES (Sổ lỗi sai)
  getMistakes(userId: string = 'guest'): UserMistake[] {
    const map = readMistakesMap();
    return map[userId] || [];
  },

  addOrUpdateMistake(userId: string = 'guest', attempt: UserAttempt): void {
    const map = readMistakesMap();
    const mistakes = map[userId] || [];
    const existingIndex = mistakes.findIndex(m => m.questionId === attempt.questionId);

    if (existingIndex > -1) {
      const existing = mistakes[existingIndex];
      const updated: UserMistake = {
        ...existing,
        wrongAnswer: attempt.userAnswer,
        proofImages: attempt.proofImages ?? existing.proofImages,
        reviewStatus: existing.reviewStatus === 'fixed' ? 'reviewing' : existing.reviewStatus,
        reviewCount: existing.reviewCount + 1,
        lastAttemptedAt: attempt.createdAt,
        // Tính chu kỳ Spaced Repetition (Luyện tập ngắt quãng)
        nextReviewAt: this.calculateNextReviewDate(existing.reviewCount + 1)
      };
      mistakes[existingIndex] = updated;
    } else {
      const newMistake: UserMistake = {
        id: `mistake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        questionId: attempt.questionId,
        questionTypeId: attempt.questionTypeId,
        wrongAnswer: attempt.userAnswer,
        proofImages: attempt.proofImages,
        reviewStatus: 'new',
        reviewCount: 1,
        lastAttemptedAt: attempt.createdAt,
        nextReviewAt: this.calculateNextReviewDate(1)
      };
      mistakes.push(newMistake);
    }

    map[userId] = mistakes;
    writeToStorage(KEYS.MISTAKES, map);
  },

  resolveMistakeIfCorrect(userId: string = 'guest', questionId: string): void {
    const map = readMistakesMap();
    const mistakes = map[userId] || [];
    const index = mistakes.findIndex(m => m.questionId === questionId);

    if (index > -1) {
      const mistake = mistakes[index];
      // Nếu giải đúng lại, đánh dấu là đã fixed (mastered)
      mistakes[index] = {
        ...mistake,
        reviewStatus: 'fixed',
        nextReviewAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 ngày sau ôn lại
      };
      map[userId] = mistakes;
      writeToStorage(KEYS.MISTAKES, map);
    }
  },

  updateMistakeStatus(userId: string = 'guest', mistakeId: string, status: 'new' | 'reviewing' | 'fixed'): void {
    const map = readMistakesMap();
    const mistakes = map[userId] || [];
    const index = mistakes.findIndex(m => m.id === mistakeId);
    if (index > -1) {
      mistakes[index].reviewStatus = status;
      map[userId] = mistakes;
      writeToStorage(KEYS.MISTAKES, map);
    }
  },

  saveMistakesLocal(userId: string, mistakes: UserMistake[]): void {
    const map = readMistakesMap();
    map[userId] = mistakes;
    writeToStorage(KEYS.MISTAKES, map);
  },

  calculateNextReviewDate(reviewCount: number): string {
    const now = Date.now();
    let daysToAdd = 1; // 1 ngày
    if (reviewCount === 2) daysToAdd = 3; // 3 ngày
    else if (reviewCount >= 3) daysToAdd = 7; // 7 ngày

    return new Date(now + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
  },

  // PROGRESS (Tiến độ học tập)
  getProgress(userId: string = 'guest'): UserProgress {
    const progressMap = readProgressMap();
    if (!progressMap[userId]) {
      progressMap[userId] = {
        userId,
        masteryLevels: {},
        completedLessons: [],
        lastUpdatedAt: ''
      };
      writeToStorage(KEYS.PROGRESS, progressMap);
    }
    return progressMap[userId];
  },

  updateProgress(userId: string = 'guest', questionTypeId: string): void {
    const progressMap = readProgressMap();
    if (!progressMap[userId]) {
      progressMap[userId] = {
        userId,
        masteryLevels: {},
        completedLessons: [],
        lastUpdatedAt: ''
      };
    }

    // Lấy danh sách attempts của user cho dạng bài này
    const attempts = this.getAttempts(userId).filter(a => a.questionTypeId === questionTypeId);
    const evidence = calculateMasteryEvidence(attempts);
    const newScore = evidence.score;

    progressMap[userId].masteryLevels[questionTypeId] = newScore;

    const isCompleted = evidence.hasEnoughEvidence && newScore >= 70;
    const completedIndex = progressMap[userId].completedLessons.indexOf(questionTypeId);

    if (isCompleted && completedIndex === -1) {
      progressMap[userId].completedLessons.push(questionTypeId);
    } else if (!isCompleted && completedIndex !== -1) {
      progressMap[userId].completedLessons.splice(completedIndex, 1);
    }

    progressMap[userId].lastUpdatedAt = new Date().toISOString();
    writeToStorage(KEYS.PROGRESS, progressMap);
  },

  saveProgressLocal(userId: string, progress: UserProgress): void {
    const progressMap = readProgressMap();
    progressMap[userId] = progress;
    writeToStorage(KEYS.PROGRESS, progressMap);
  },

  // EXAM RESULTS (Kết quả thi thử)
  getExamResults(userId: string = 'guest'): ExamResult[] {
    const map = readExamResultsMap();
    return map[userId] || [];
  },

  getExamResultById(userId: string = 'guest', examId: string): ExamResult | undefined {
    const results = this.getExamResults(userId);
    return results.find(r => r.examId === examId);
  },

  getExamSummaryMap(userId: string = 'guest'): ExamSummaryMap {
    const results = this.getExamResults(userId);
    const summary: ExamSummaryMap = {};
    for (const r of results) {
      const examKey = r.sourceExamId || r.examId;
      if (!summary[examKey]) {
        summary[examKey] = {
          bestScore: r.score,
          lastScore: r.score,
          attemptsCount: 1,
          lastCompletedAt: r.completedAt,
          lastExamId: r.examId,
          lastTimeSpent: r.timeSpent
        };
      } else {
        summary[examKey].attemptsCount += 1;
        if (r.score > summary[examKey].bestScore) {
          summary[examKey].bestScore = r.score;
        }
        if (new Date(r.completedAt).getTime() >= new Date(summary[examKey].lastCompletedAt).getTime()) {
          summary[examKey].lastScore = r.score;
          summary[examKey].lastCompletedAt = r.completedAt;
          summary[examKey].lastExamId = r.examId;
          summary[examKey].lastTimeSpent = r.timeSpent;
        }
      }
    }
    return summary;
  },

  saveExamResult(userId: string = 'guest', result: ExamResult): void {
    const map = readExamResultsMap();
    if (!map[userId]) {
      map[userId] = [];
    }
    map[userId].push(result);
    writeToStorage(KEYS.EXAM_RESULTS, map);
  },

  saveExamResultsLocal(userId: string, exams: ExamResult[]): void {
    const map = readExamResultsMap();
    map[userId] = exams;
    writeToStorage(KEYS.EXAM_RESULTS, map);
  },

  clearGuestData(): void {
    const attemptsMap = readAttemptsMap();
    delete attemptsMap.guest;
    writeToStorage(KEYS.ATTEMPTS, attemptsMap);

    const mistakesMap = readMistakesMap();
    delete mistakesMap.guest;
    writeToStorage(KEYS.MISTAKES, mistakesMap);

    const progressMap = readProgressMap();
    delete progressMap.guest;
    writeToStorage(KEYS.PROGRESS, progressMap);

    const examResultsMap = readExamResultsMap();
    delete examResultsMap.guest;
    writeToStorage(KEYS.EXAM_RESULTS, examResultsMap);

    const readTheoryMap = readReadTheoryMap();
    delete readTheoryMap.guest;
    writeToStorage(KEYS.READ_THEORY, readTheoryMap);

    const checkpointMap = readTheoryCheckpointMap();
    delete checkpointMap.guest;
    writeToStorage(KEYS.THEORY_CHECKPOINTS, checkpointMap);

    const activeExamMap = readActiveExamMap();
    delete activeExamMap.guest;
    writeToStorage(KEYS.ACTIVE_EXAM, activeExamMap);
  },

  getReadLessons(userId: string): string[] {
    const map = readReadTheoryMap();
    return map[userId] || [];
  },

  saveLessonRead(userId: string, lessonId: string): void {
    try {
      const map = readReadTheoryMap();
      if (!map[userId]) {
        map[userId] = [];
      }
      if (!map[userId].includes(lessonId)) {
        map[userId].push(lessonId);
        writeToStorage(KEYS.READ_THEORY, map);
      }
    } catch (e) {
      console.error('Lỗi khi lưu read lesson vào localStorage', e);
    }
  },

  saveReadLessonsLocal(userId: string, lessons: string[]): void {
    const map = readReadTheoryMap();
    map[userId] = lessons;
    writeToStorage(KEYS.READ_THEORY, map);
  },

  getPassedTheoryCheckpoints(userId: string): string[] {
    const map = readTheoryCheckpointMap();
    return map[userId] || [];
  },

  saveTheoryCheckpointPassed(userId: string, checkpointId: string): void {
    const map = readTheoryCheckpointMap();
    if (!map[userId]) {
      map[userId] = [];
    }
    if (!map[userId].includes(checkpointId)) {
      map[userId].push(checkpointId);
      writeToStorage(KEYS.THEORY_CHECKPOINTS, map);
    }
  },

  savePassedTheoryCheckpointsLocal(userId: string, checkpointIds: string[]): void {
    const map = readTheoryCheckpointMap();
    map[userId] = checkpointIds;
    writeToStorage(KEYS.THEORY_CHECKPOINTS, map);
  },

  // ACTIVE EXAM SESSIONS (QUẢN LÝ ĐA PHIÊN THI DỞ DANG THEO TỪNG ĐỀ)
  getActiveExamSessions(userId: string = 'guest'): ActiveExamSession[] {
    const map = readActiveExamMap();
    const userSessions = map[userId] || {};
    return Object.values(userSessions);
  },

  getActiveExamSession(userId: string = 'guest', sourceExamId?: string): ActiveExamSession | null {
    const map = readActiveExamMap();
    const userSessions = map[userId] || {};
    if (sourceExamId) {
      return userSessions[sourceExamId] || null;
    }
    const sessions = Object.values(userSessions);
    if (sessions.length === 0) return null;
    return sessions.sort((a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime())[0];
  },

  saveActiveExamSession(userId: string = 'guest', session: ActiveExamSession): void {
    const map = readActiveExamMap();
    if (!map[userId]) {
      map[userId] = {};
    }
    map[userId][session.sourceExamId] = session;
    writeToStorage(KEYS.ACTIVE_EXAM, map);
  },

  clearActiveExamSession(userId: string = 'guest', sourceExamId?: string): void {
    const map = readActiveExamMap();
    if (!map[userId]) return;
    if (sourceExamId) {
      delete map[userId][sourceExamId];
      if (Object.keys(map[userId]).length === 0) {
        delete map[userId];
      }
    } else {
      delete map[userId];
    }
    writeToStorage(KEYS.ACTIVE_EXAM, map);
  },

  // RESET ALL DATA
  resetData(): void {
    localStorage.removeItem(KEYS.ATTEMPTS);
    localStorage.removeItem(KEYS.MISTAKES);
    localStorage.removeItem(KEYS.PROGRESS);
    localStorage.removeItem(KEYS.EXAM_RESULTS);
    localStorage.removeItem(KEYS.READ_THEORY);
    localStorage.removeItem(KEYS.THEORY_CHECKPOINTS);
    localStorage.removeItem(KEYS.ACTIVE_EXAM);
  }
};
