import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Volume2, Vibrate, RefreshCcw, Sparkles, Clock, LogIn, LogOut } from 'lucide-react-native';
import { MobileAuthService } from '../../services/authService';
import { ReminderModal } from '../../components/ReminderModal';
import { useUserStore } from '../../stores';
import { formatHourMinute } from '../../utils';
import { NotificationService } from '../../services/notificationService';

export default function SettingsScreen() {
  const router = useRouter();
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const {
    user,
    reminderHour,
    reminderMinute,
    reminderEnabled,
    soundEnabled,
    hapticEnabled,
    toggleSound,
    toggleHaptic,
    updateReminder,
    resetProgress,
    streak
  } = useUserStore();

  const formattedTime = formatHourMinute(reminderHour, reminderMinute);

  const handleToggleReminder = async (val: boolean) => {
    updateReminder(reminderHour, reminderMinute, val);
    if (val) {
      await NotificationService.scheduleDailyReminder(reminderHour, reminderMinute, streak);
      Alert.alert('Đã bật thông báo', `Ứng dụng sẽ nhắc bạn vào lúc ${formattedTime} mỗi tối.`);
    } else {
      await NotificationService.cancelAll();
      Alert.alert('Đã tắt thông báo', 'Bạn có thể bật lại bất cứ lúc nào.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Đăng Xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await MobileAuthService.signOut();
          } catch { Alert.alert('Chưa đăng xuất', 'Dữ liệu chưa lưu hoặc phiên đăng nhập chưa đóng. Vui lòng thử lại.'); }
        }
      }
    ]);
  };

  const handleReset = () => {
    Alert.alert(
      'Xác nhận đặt lại tiến độ?',
      'Chỉ đặt lại dữ liệu đã đồng bộ trên thiết bị. Bài chờ đồng bộ và bản nháp được giữ; dữ liệu cloud sẽ được tải lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đặt lại', style: 'destructive', onPress: resetProgress }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-950 px-4 py-3" showsVerticalScrollIndicator={false}>
      {/* Account Section */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Tài Khoản Học Sinh
      </Text>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-5">
        {user ? (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3 gap-3 flex-1">
              <View className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 items-center justify-center">
                <Text className="text-lg font-black text-indigo-300">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'K')}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-sm text-white" numberOfLines={1}>
                  {user.displayName || user.email || 'Học viên EZ'}
                </Text>
                <Text className="text-xs text-slate-400" numberOfLines={1}>
                  {user.email || 'Tài khoản học tập'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              activeOpacity={0.7}
              className="p-2.5 bg-slate-800 rounded-xl border border-slate-700"
            >
              <LogOut size={16} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center py-2">
            <Text className="text-sm font-bold text-white mb-1">Chưa đăng nhập tài khoản</Text>
            <Text className="text-xs text-slate-400 text-center mb-4">
              Đăng nhập để lưu trữ kết quả và ghi danh trên Bảng Xếp Hạng toàn quốc.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth')}
              activeOpacity={0.8}
              className="w-full py-3 bg-indigo-600 rounded-2xl flex-row items-center justify-center space-x-2 gap-2 shadow-md shadow-indigo-600/20"
            >
              <LogIn size={16} color="#ffffff" />
              <Text className="text-white font-bold text-xs">Đăng Nhập Bằng Google</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reminder Setting Section */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Hệ Thống Thông Báo Nhắc Học (Push Notification)
      </Text>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-5 space-y-4 gap-4">
        {/* Switch toggle */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3 gap-3 flex-1">
            <View className="w-10 h-10 bg-indigo-500/20 rounded-xl items-center justify-center border border-indigo-500/30">
              <Bell size={20} color="#818cf8" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm text-white">Nhắc nhở học tập hàng ngày</Text>
              <Text className="text-xs text-slate-400">Tự động hẹn giờ trên máy không cần 4G/Wifi</Text>
            </View>
          </View>

          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ false: '#334155', true: '#4f46e5' }}
            thumbColor={reminderEnabled ? '#ffffff' : '#94a3b8'}
          />
        </View>

        {/* Schedule button */}
        {reminderEnabled && (
          <TouchableOpacity
            onPress={() => setReminderModalVisible(true)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700"
          >
            <View className="flex-row items-center space-x-2 gap-2">
              <Clock size={18} color="#f59e0b" />
              <Text className="text-sm font-medium text-slate-200">Khung giờ nhắc hiện tại:</Text>
            </View>
            <Text className="text-sm font-black text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg">
              {formattedTime} ✏️
            </Text>
          </TouchableOpacity>
        )}

        {/* Test Notification */}
        <TouchableOpacity
          onPress={async () => {
            await NotificationService.sendTestNotification();
            Alert.alert('Đã kích hoạt! 🔔', 'Bạn sẽ thấy thông báo của EZ Ôn Thi xuất hiện trên thanh trạng thái ngay lập tức.');
          }}
          activeOpacity={0.7}
          className="flex-row items-center justify-center space-x-2 gap-2 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl"
        >
          <Sparkles size={16} color="#818cf8" />
          <Text className="text-xs font-bold text-indigo-300">Bấm thử chuông thông báo ngay 🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Sensory & Feedback Settings */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Trải Nghiệm Xúc Giác & Âm Thanh (Sensory UX)
      </Text>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-5 space-y-3.5 gap-3.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3 gap-3 flex-1">
            <View className="w-10 h-10 bg-emerald-500/20 rounded-xl items-center justify-center border border-emerald-500/30">
              <Volume2 size={20} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm text-white">Hiệu ứng âm thanh</Text>
              <Text className="text-xs text-slate-400">Tiếng Ting! khi làm đúng kích thích hưng phấn</Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: '#334155', true: '#10b981' }}
            thumbColor={soundEnabled ? '#ffffff' : '#94a3b8'}
          />
        </View>

        <View className="flex-row items-center justify-between pt-3 border-t border-slate-800">
          <View className="flex-row items-center space-x-3 gap-3 flex-1">
            <View className="w-10 h-10 bg-amber-500/20 rounded-xl items-center justify-center border border-amber-500/30">
              <Vibrate size={20} color="#f59e0b" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm text-white">Rung phản hồi (Haptics)</Text>
              <Text className="text-xs text-slate-400">Rung nhẹ bàn tay khi chạm chọn đáp án</Text>
            </View>
          </View>
          <Switch
            value={hapticEnabled}
            onValueChange={toggleHaptic}
            trackColor={{ false: '#334155', true: '#f59e0b' }}
            thumbColor={hapticEnabled ? '#ffffff' : '#94a3b8'}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Dữ Liệu & Bộ Nhớ
      </Text>

      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-8">
        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.7}
          className="flex-row items-center space-x-3 gap-3 p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl"
        >
          <RefreshCcw size={18} color="#f43f5e" />
          <View className="flex-1">
            <Text className="font-bold text-sm text-rose-300">Đặt lại toàn bộ tiến độ học tập</Text>
            <Text className="text-xs text-rose-200/70">Xóa chuỗi streak và bắt đầu lại từ đầu</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Reminder Picker Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
      />
    </ScrollView>
  );
}
