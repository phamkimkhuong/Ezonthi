import { useState, useEffect, useRef, useCallback } from 'react';
import { formatSecondsToTimer } from '../utils/timeFormatter';

export interface UseExamTimerOptions {
  initialSeconds: number;
  isRunning?: boolean;
  onTimeUp?: () => void;
}

/**
 * Custom Hook quản lý bộ đếm ngược thời gian thi an toàn
 */
export function useExamTimer({
  initialSeconds,
  isRunning = true,
  onTimeUp,
}: UseExamTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const resetTimer = useCallback((newSeconds: number) => {
    setTimeLeft(newSeconds);
  }, []);

  return {
    timeLeft,
    isTimeUp: timeLeft <= 0,
    formattedTime: formatSecondsToTimer(timeLeft),
    resetTimer,
  };
}
