export interface MobileMistake {
  id: string;
  questionId: string;
  topicId: string;
  subjectId: string;
  wrongAnswer: string;
  reviewStatus: 'new' | 'reviewing' | 'fixed';
  reviewCount: number;
  lastAttemptedAt: string;
  nextReviewAt: string;
}

export const MistakeService = {
  /**
   * Tính toán thời gian ôn tập tiếp theo dựa trên thuật toán Spaced Retrieval
   */
  calculateNextReview(currentReviewCount: number, isCorrect: boolean): {
    nextReviewAt: string;
    reviewStatus: 'new' | 'reviewing' | 'fixed';
  } {
    const now = Date.now();
    if (!isCorrect) {
      // Làm sai lại -> Cần ôn lại ngay trong ngày
      return {
        nextReviewAt: new Date(now + 3600000).toISOString(), // 1 giờ sau
        reviewStatus: 'reviewing',
      };
    }

    // Làm đúng trong lần ôn tập
    const nextCount = currentReviewCount + 1;
    if (nextCount >= 3) {
      return {
        nextReviewAt: new Date(now + 14 * 86400000).toISOString(), // 14 ngày sau
        reviewStatus: 'fixed',
      };
    }

    // Khoảng cách lặp lại: Lần 1 = 1 ngày, Lần 2 = 3 ngày
    const intervalDays = nextCount === 1 ? 1 : 3;
    return {
      nextReviewAt: new Date(now + intervalDays * 86400000).toISOString(),
      reviewStatus: 'reviewing',
    };
  },
};
