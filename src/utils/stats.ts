import { UserAttempt } from '../types';

const VIETNAM_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Chuyển mốc thời gian sang chuỗi YYYY-MM-DD theo múi giờ Việt Nam (tránh lệch ngày UTC lúc sáng sớm). */
export const toLocalDateKey = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value.substring(0, 10) : '';
  }
  return VIETNAM_DATE_FORMATTER.format(date);
};

export const calculateStudentStats = (attempts: UserAttempt[], completedLessonsCount = 0): {
  totalStudySeconds: number;
  totalAttempts: number;
  correctAttempts: number;
  dailyActivity: Record<string, number>;
  xpScore: number;
} => {
  const totalStudySeconds = attempts.reduce((acc, a) => acc + (a.timeSpent || 0), 0);
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter(a => a.isCorrect).length;
  const totalMinutes = Math.round(totalStudySeconds / 60);

  const dailyActivity: Record<string, number> = {};
  attempts.forEach(a => {
    if (a.createdAt) {
      const dateStr = toLocalDateKey(a.createdAt);
      if (dateStr) {
        dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
      }
    }
  });

  const timeXp = Math.min(totalMinutes * 2, 100);
  const xpScore = (correctAttempts * 15) + (completedLessonsCount * 100) + timeXp;

  return {
    totalStudySeconds,
    totalAttempts,
    correctAttempts,
    dailyActivity,
    xpScore
  };
};
