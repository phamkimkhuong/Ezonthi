import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { Bell, Clock, Check, X, Sparkles } from 'lucide-react-native';
import { useUserStore } from '../services/storageService';
import { NotificationService } from '../services/notificationService';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
}

const PRESET_TIMES = [
  { hour: 19, minute: 0, label: '19:00 (Sau bữa tối)' },
  { hour: 19, minute: 30, label: '19:30 (Giờ vàng học tập)' },
  { hour: 20, minute: 0, label: '20:00 (Tập trung cao độ)' },
  { hour: 20, minute: 30, label: '20:30 (Ôn nhanh trước khi ngủ)' },
  { hour: 21, minute: 0, label: '21:00 (Cú đêm chăm chỉ)' }
];

export const ReminderModal: React.FC<ReminderModalProps> = ({ visible, onClose }) => {
  const { reminderHour, reminderMinute, reminderEnabled, updateReminder, streak } = useUserStore();
  const [selectedHour, setSelectedHour] = useState<number>(reminderHour);
  const [selectedMinute, setSelectedMinute] = useState<number>(reminderMinute);
  const [isEnabled, setIsEnabled] = useState<boolean>(reminderEnabled);

  const handleSave = async () => {
    updateReminder(selectedHour, selectedMinute, isEnabled);

    if (isEnabled) {
      const scheduledId = await NotificationService.scheduleDailyReminder(selectedHour, selectedMinute, streak);
      if (scheduledId) {
        Alert.alert(
          'Đã đặt lịch nhắc học! ⏰',
          `Hàng ngày vào lúc ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}, EZ Ôn Thi sẽ gửi chuông nhắc bạn vào làm bài giữ chuỗi Streak!`,
          [{ text: 'Tuyệt vời', onPress: onClose }]
        );
      } else {
        Alert.alert('Cần cấp quyền thông báo', 'Vui lòng cho phép ứng dụng gửi thông báo trong Cài đặt của máy.');
        onClose();
      }
    } else {
      await NotificationService.cancelAll();
      Alert.alert('Đã tắt thông báo', 'Bạn có thể bật lại bất cứ lúc nào để không quên bài học.', [{ text: 'Đóng', onPress: onClose }]);
    }
  };

  const handleTestNow = async () => {
    await NotificationService.sendTestNotification();
    Alert.alert('Đã gửi thông báo thử nghiệm! 🔔', 'Kiểm tra thanh thông báo trên điện thoại của bạn ngay bây giờ nhé.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
            <View className="flex-row items-center space-x-2 gap-2">
              <View className="w-10 h-10 bg-indigo-500/20 rounded-xl items-center justify-center border border-indigo-500/30">
                <Bell size={20} color="#818cf8" />
              </View>
              <View>
                <Text className="text-lg font-bold text-white">Cài Đặt Giờ Nhắc Học</Text>
                <Text className="text-xs text-slate-400">Tự động nhắc bạn giữ chuỗi Streak mỗi ngày</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-800 rounded-full">
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Preset list */}
          <View className="my-4 space-y-2.5 gap-2.5">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Chọn khung giờ ôn bài tốt nhất:
            </Text>
            {PRESET_TIMES.map(t => {
              const isSelected = selectedHour === t.hour && selectedMinute === t.minute;
              return (
                <TouchableOpacity
                  key={`${t.hour}:${t.minute}`}
                  onPress={() => {
                    setSelectedHour(t.hour);
                    setSelectedMinute(t.minute);
                    setIsEnabled(true);
                  }}
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between p-3.5 rounded-2xl border ${
                    isSelected ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800/60 border-slate-700/60'
                  }`}
                >
                  <View className="flex-row items-center space-x-3 gap-3">
                    <Clock size={18} color={isSelected ? '#818cf8' : '#64748b'} />
                    <Text className={`font-medium text-sm ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                      {t.label}
                    </Text>
                  </View>
                  {isSelected && <Check size={18} color="#818cf8" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Test Notification Button */}
          <TouchableOpacity
            onPress={handleTestNow}
            activeOpacity={0.7}
            className="flex-row items-center justify-center space-x-2 gap-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700 mb-4"
          >
            <Sparkles size={16} color="#fbbf24" />
            <Text className="text-xs font-semibold text-amber-300">Bấm để thử nghiệm chuông thông báo ngay 🔔</Text>
          </TouchableOpacity>

          {/* Action buttons */}
          <View className="flex-row space-x-3 gap-3">
            <TouchableOpacity
              onPress={() => {
                setIsEnabled(false);
                handleSave();
              }}
              activeOpacity={0.7}
              className="flex-1 p-3.5 bg-slate-800 rounded-2xl items-center border border-slate-700"
            >
              <Text className="text-slate-400 font-semibold text-sm">Tắt nhắc nhở</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              className="flex-2 p-3.5 bg-indigo-600 rounded-2xl items-center shadow-lg shadow-indigo-500/25"
            >
              <Text className="text-white font-bold text-sm">Lưu cài đặt ⏰</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
