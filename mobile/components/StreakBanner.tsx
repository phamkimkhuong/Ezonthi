import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Flame, Zap } from 'lucide-react-native';
import { useUserStore } from '../services/storageService';

interface StreakBannerProps {
  onPressReminder?: () => void;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({ onPressReminder }) => {
  const { streak, xp, reminderHour, reminderMinute, reminderEnabled } = useUserStore();

  const formattedTime = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

  return (
    <View className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 my-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3 gap-3">
          <View className="w-12 h-12 bg-amber-500/20 rounded-2xl items-center justify-center border border-amber-500/40">
            <Flame size={28} color="#f59e0b" fill="#f59e0b" />
          </View>
          <View>
            <View className="flex-row items-center space-x-1.5 gap-1.5">
              <Text className="text-xl font-bold text-white">{streak} Ngày</Text>
              <Text className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 font-semibold rounded-full">
                Chuỗi Streak 🔥
              </Text>
            </View>
            <Text className="text-xs text-slate-300 mt-0.5">
              Luyện đều mỗi ngày để không bị tắt lửa!
            </Text>
          </View>
        </View>

        <View className="items-end">
          <View className="flex-row items-center space-x-1 gap-1 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
            <Zap size={14} color="#818cf8" fill="#818cf8" />
            <Text className="text-xs font-bold text-indigo-300">{xp} XP</Text>
          </View>
        </View>
      </View>

      {/* Reminder pill */}
      <TouchableOpacity
        onPress={onPressReminder}
        activeOpacity={0.7}
        className="mt-3 pt-2.5 border-t border-amber-500/20 flex-row items-center justify-between"
      >
        <Text className="text-xs text-amber-200/80">
          ⏰ Nhắc học: <Text className="font-semibold text-amber-300">{reminderEnabled ? `${formattedTime} hàng ngày` : 'Đang tắt'}</Text>
        </Text>
        <Text className="text-xs text-amber-400 font-medium underline">
          Đổi giờ nhắc →
        </Text>
      </TouchableOpacity>
    </View>
  );
};
