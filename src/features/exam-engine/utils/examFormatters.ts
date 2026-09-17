export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const displayMins = mins < 10 ? `0${mins}` : mins;
  const displaySecs = secs < 10 ? `0${secs}` : secs;

  if (hrs > 0) {
    return `${hrs}:${displayMins}:${displaySecs}`;
  }
  return `${displayMins}:${displaySecs}`;
};

export const formatCompletedDate = (isoStr?: string): string => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoStr;
  }
};
