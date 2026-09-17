import { useState, useEffect, useRef } from 'react';

export interface UseExamTimerOptions {
  examState: 'intro' | 'testing' | 'result';
  onTimeUp?: () => void;
}

export interface UseExamTimerReturn {
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  timeSpent: number;
  setTimeSpent: React.Dispatch<React.SetStateAction<number>>;
  startTimer: (durationInSeconds: number) => void;
  resetTimer: () => void;
}

export const useExamTimer = ({
  examState,
  onTimeUp
}: UseExamTimerOptions): UseExamTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Cảnh báo người dùng trước khi vô tình tải lại hoặc đóng tab phòng thi
  useEffect(() => {
    if (examState !== 'testing') return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [examState]);

  // Đếm ngược thời gian làm bài (giây) và tự động nộp bài khi hết giờ
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    if (examState === 'testing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setTimeSpent(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === 'testing') {
      onTimeUpRef.current?.();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, timeLeft]);

  const startTimer = (durationInSeconds: number) => {
    setTimeLeft(durationInSeconds);
    setTimeSpent(0);
  };

  const resetTimer = () => {
    setTimeLeft(0);
    setTimeSpent(0);
  };

  return {
    timeLeft,
    setTimeLeft,
    timeSpent,
    setTimeSpent,
    startTimer,
    resetTimer
  };
};
