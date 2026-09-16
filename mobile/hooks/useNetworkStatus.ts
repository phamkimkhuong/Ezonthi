import { useNetInfo } from '@react-native-community/netinfo';

/**
 * Custom hook kiểm tra tình trạng kết nối Internet của thiết bị
 */
export function useNetworkStatus() {
  const netInfo = useNetInfo();

  return {
    isConnected: netInfo.isConnected ?? true,
    isInternetReachable: netInfo.isInternetReachable ?? true,
    isOffline: netInfo.isConnected === false,
    connectionType: netInfo.type,
  };
}
