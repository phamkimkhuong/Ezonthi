import React from 'react';
import { View, Text } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export const OfflineBanner: React.FC = () => {
  const netInfo = useNetInfo();

  // Chỉ hiển thị khi chắc chắn mất kết nối (isConnected === false)
  if (netInfo.isConnected === null || netInfo.isConnected !== false) {
    return null;
  }

  return (
    <View className="bg-rose-600/95 border-b border-rose-700 px-4 py-1.5 flex-row items-center justify-center space-x-2 gap-2">
      <WifiOff size={13} color="#ffffff" />
      <Text className="text-white text-[11px] font-bold">
        Chế độ Ngoại Tuyến • Tiến độ luyện thi đang được lưu an toàn trong máy
      </Text>
    </View>
  );
};
