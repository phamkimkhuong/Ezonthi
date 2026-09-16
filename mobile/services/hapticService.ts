import * as Haptics from 'expo-haptics';

export const HapticService = {
  /**
   * Rung nhẹ khi chạm nút bấm hoặc chọn phương án A-B-C-D
   */
  selection() {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore in web/unsupported
    }
  },

  /**
   * Rung chúc mừng khi chọn đáp án đúng
   */
  success() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // ignore
    }
  },

  /**
   * Rung cảnh báo nhẹ khi chọn sai
   */
  warning() {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // ignore
    }
  },

  /**
   * Rung mạnh khi hoàn thành toàn bộ bài kiểm tra / đạt huy hiệu
   */
  heavy() {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // ignore
    }
  }
};
