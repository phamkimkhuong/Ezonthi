/**
 * Bộ tiện ích định dạng thời gian cho ứng dụng Mobile
 */

/**
 * Chuyển số giây thành chuỗi thời gian dạng mm:ss (hoặc hh:mm:ss nếu > 1 giờ)
 * Ví dụ: 65 -> "01:05", 3665 -> "01:01:05"
 */
export function formatSecondsToTimer(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Định dạng ngày ISO thành ngày chuẩn Việt Nam (DD/MM/YYYY)
 */
export function formatDateVN(isoString: string | null | undefined): string {
  if (!isoString) return '--/--/----';
  try {
    const d = new Date(isoString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '--/--/----';
  }
}

/**
 * Định dạng giờ và phút thành chuỗi hiển thị 2 chữ số (HH:mm)
 * Ví dụ: 8, 5 -> "08:05"
 */
export function formatHourMinute(hour: number, minute: number): string {
  const h = Math.max(0, Math.min(23, Math.floor(hour))).toString().padStart(2, '0');
  const m = Math.max(0, Math.min(59, Math.floor(minute))).toString().padStart(2, '0');
  return `${h}:${m}`;
}

