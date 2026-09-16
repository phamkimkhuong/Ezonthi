import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Sentry } from '../services/sentry';
import { NotificationService } from '../services/notificationService';
import { useUserStore } from '../services/storageService';
import { OfflineBanner } from '../components/OfflineBanner';
import '../global.css';

import { useNetInfo } from '@react-native-community/netinfo';
import { CloudSyncService } from '../services/cloudSyncService';

function RootLayout() {
  const router = useRouter();
  const netInfo = useNetInfo();
  const { reminderHour, reminderMinute, reminderEnabled, streak, setUser } = useUserStore();

  useEffect(() => {
    // Lắng nghe trạng thái đăng nhập Firebase Auth để đồng bộ vào Zustand Store
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        };
        setUser(profile);
        if (!firebaseUser.isAnonymous) {
          CloudSyncService.pullAndMergeFromCloud(profile);
        }
      }
    });

    return () => unsubscribeAuth();
  }, [setUser]);

  // Tự động đẩy dữ liệu lên Firestore khi có kết nối mạng
  useEffect(() => {
    if (netInfo.isConnected === true) {
      CloudSyncService.syncToCloud();
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
    // Xin quyền và đặt lịch thông báo hàng ngày khi mở app
    if (reminderEnabled) {
      NotificationService.scheduleDailyReminder(reminderHour, reminderMinute, streak);
    }

    // Lắng nghe khi học sinh bấm vào thông báo để mở thẳng màn hình
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        router.push(screen as any);
      }
    });

    return () => subscription.remove();
  }, [reminderHour, reminderMinute, reminderEnabled, streak]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0f172a',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="practice/[topicId]"
          options={{
            title: 'Luyện Tập Trắc Nghiệm',
            headerBackTitle: 'Quay lại',
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ai-chat"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="exam/[examId]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
