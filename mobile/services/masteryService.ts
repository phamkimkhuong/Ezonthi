export interface UserAttempt {
  id: string;
  questionId: string;
  topicId: string;
  subjectId: string;
  isCorrect: boolean;
  selectedAnswer: string;
  answeredAt: string;
  timeSpent?: number;
  syncStatus?: 'pending' | 'acknowledged' | 'blocked';
  gradingStatus?: 'pending' | 'graded';
  teacherFeedback?: string;
}

export interface TopicMastery {
  score: number; // 0 - 100
  stars: number; // 0, 1, 2, 3
  accuracy: number; // 0 - 1
  completedCount: number;
  totalQuestions: number;
  status: 'not_started' | 'in_progress' | 'mastered';
}

/**
 * Quy đổi điểm làm chủ (0-100%) sang số sao vàng (0-3 sao)
 * Chuẩn thuật toán giáo dục EZ Ôn Thi:
 * - Dưới 40%: 0 sao (Cần cố gắng)
 * - 40% - 59%: 1 sao (Đạt chuẩn cơ bản)
 * - 60% - 79%: 2 sao (Khá - Vận dụng tốt)
 * - Từ 80% trở lên: 3 sao (Xuất sắc - Đã làm chủ kiến thức)
 */
export const getStarsFromScore = (score: number): number => {
  if (score < 40) return 0;
  if (score < 60) return 1;
  if (score < 80) return 2;
  return 3;
};

export const MasteryService = {
  /**
   * Tính toán Mastery Score dựa trên kết quả mới nhất của từng câu hỏi
   * (Loại trừ việc cày lặp đi lặp lại 1 câu dễ để lấy điểm ảo)
   */
  calculateTopicMastery(
    attempts: UserAttempt[],
    availableQuestionCount: number = 10
  ): TopicMastery {
    const latestByQuestion = new Map<string, UserAttempt>();
    for (const attempt of attempts) {
      const existing = latestByQuestion.get(attempt.questionId);
      if (!existing || Date.parse(attempt.answeredAt) >= Date.parse(existing.answeredAt)) {
        latestByQuestion.set(attempt.questionId, attempt);
      }
    }

    const uniqueAttempts = Array.from(latestByQuestion.values());
    if (uniqueAttempts.length === 0) {
      return {
        score: 0,
        stars: 0,
        accuracy: 0,
        completedCount: 0,
        totalQuestions: availableQuestionCount,
        status: 'not_started',
      };
    }

    const correctCount = uniqueAttempts.filter(a => a.isCorrect).length;
    const accuracy = correctCount / uniqueAttempts.length;
    const score = Math.round(accuracy * 100);
    const stars = getStarsFromScore(score);

    let status: 'not_started' | 'in_progress' | 'mastered' = 'in_progress';
    if (score >= 80 && uniqueAttempts.length >= Math.min(2, availableQuestionCount)) {
      status = 'mastered';
    }

    return {
      score,
      stars,
      accuracy,
      completedCount: uniqueAttempts.length,
      totalQuestions: availableQuestionCount,
      status,
    };
  },
};
