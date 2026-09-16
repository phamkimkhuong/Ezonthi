import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '../hooks';
import { useUserStore } from '../stores';
import { retryLearningStorage } from '../stores/useUserStore';
import { CloudSyncService } from '../services/cloudSyncService';

export const OfflineBanner: React.FC = () => {
  const { isOffline, isInternetReachable } = useNetworkStatus();
  const { user, activeScope, accounts, storageError, isHydrated } = useUserStore();
  const account = accounts[activeScope];
  const pending = account?.attempts.filter(a => a.syncStatus === 'pending').length || 0;
  const blocked = account?.attempts.filter(a => a.syncStatus === 'blocked').length || 0;
  if (!isHydrated || (!storageError && !account?.syncError && !isOffline && !pending && !blocked)) return null;
  const message = storageError || account?.syncError || (blocked
    ? `${blocked} bài chưa được server chấp nhận. Bản trên máy vẫn được giữ.`
    : isOffline || !isInternetReachable
    ? `Ngoại tuyến • ${pending} bài chờ đồng bộ. Bản nháp được lưu trên thiết bị.`
    : user && !user.isAnonymous
    ? `${pending} bài chờ server xác nhận.`
    : `${pending} bài lưu trên thiết bị. Đăng nhập để đồng bộ.`);
  const retry = async () => {
    try { await retryLearningStorage(); await CloudSyncService.syncToCloud(true); }
    catch { Alert.alert('Chưa ghi được bộ nhớ', 'Giữ ứng dụng mở; dữ liệu cũ chưa bị ghi đè. Vui lòng kiểm tra bộ nhớ thiết bị và thử lại.'); }
  };
  return (
    <View className="bg-amber-950 border-b border-amber-700 px-4 py-2 flex-row items-center gap-2">
      <WifiOff size={16} color="#fbbf24" />
      <Text className="flex-1 text-amber-100 text-xs">{message}</Text>
      <TouchableOpacity onPress={() => { void retry(); }} accessibilityRole="button" className="p-2">
        <Text className="text-amber-200 font-bold text-xs">{storageError ? 'Thử lưu' : 'Thử lại'}</Text>
      </TouchableOpacity>
    </View>
  );
};
