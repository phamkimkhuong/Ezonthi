import * as Haptics from 'expo-haptics';

export type HapticType = 'light' | 'medium' | 'success' | 'warning' | 'selection';

/**
 * Tiện ích kích hoạt rung phản hồi xúc giác an toàn cho toàn bộ ứng dụng.
 * Tự động bắt lỗi nếu thiết bị không hỗ trợ rung phần cứng.
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
  } catch {
    // Không làm crash app nếu phần cứng thiết bị tắt rung
  }
}
