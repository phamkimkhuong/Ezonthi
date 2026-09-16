import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface ReminderSetting {
  enabled: boolean;
  hour: number;
  minute: number;
}
export const NotificationService = {
  /**
   * Xin quyền gửi thông báo từ người dùng
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('study-reminders', {
        name: 'Nhắc nhở học tập hàng ngày',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      });
    }

    return true;
  },

  /**
   * Lên lịch thông báo định kỳ hàng ngày (Local Notification không cần internet)
   */
  async scheduleDailyReminder(hour: number = 19, minute: number = 30, streakCount: number = 0): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return '';

    // Hủy các lịch nhắc cũ trước khi đặt lịch mới
    await Notifications.cancelAllScheduledNotificationsAsync();

    const messages = [
      `🔥 Giữ vững chuỗi Streak ${streakCount > 0 ? `${streakCount} ngày ` : ''}nào! Chỉ 3 phút làm 5 câu trắc nghiệm hôm nay!`,
      `🎯 Đã đến giờ vàng luyện đề rồi! Vào thử sức ngay để leo Top bảng xếp hạng nhé!`,
      `⚡ Thử thách nhanh: Bạn có thể trả lời đúng 5/5 câu hỏi hôm nay không? Bấm vào giải ngay!`,
      `📚 Đừng để kiến thức trôi đi! Vào ôn luyện 5 phút giữ phản xạ nhanh nào bạn ơi!`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Đã đến giờ ôn tập rồi!',
        body: randomMessage,
        data: { screen: '/(tabs)/subjects' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: 'study-reminders',
        hour,
        minute,
      },
    });

    return id;
  },

  /**
   * Gửi một thông báo thử nghiệm ngay lập tức (để người dùng test chuông và rung)
   */
  async sendTestNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Thông báo thử nghiệm thành công!',
        body: 'Hệ thống nhắc nhở của EZ Ôn Thi đã sẵn sàng đồng hành cùng bạn mỗi tối!',
        sound: true,
      },
      trigger: {
        channelId: 'study-reminders',
      },
    });
  },

  /**
   * Hủy tất cả các thông báo nhắc nhở
   */
  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
