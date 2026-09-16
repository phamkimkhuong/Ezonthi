import * as Updates from 'expo-updates';

/**
 * Kiểm tra và áp dụng bản cập nhật OTA từ EAS Update.
 * Tự động bỏ qua khi đang chạy chế độ phát triển (__DEV__).
 */
export async function checkForAppUpdates(): Promise<{
  isAvailable: boolean;
  didUpdate: boolean;
}> {
  if (__DEV__) {
    return { isAvailable: false, didUpdate: false };
  }

  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      return { isAvailable: true, didUpdate: true };
    }
    return { isAvailable: false, didUpdate: false };
  } catch (error) {
    // Không gây gián đoạn trải nghiệm người dùng nếu rớt mạng
    console.warn('Lỗi khi kiểm tra EAS Update:', error);
    return { isAvailable: false, didUpdate: false };
  }
}

export { Updates };
