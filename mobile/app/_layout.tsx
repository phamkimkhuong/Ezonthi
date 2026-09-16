import { useEffect, useState } from 'react';
import { AppState, View, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Sentry } from '../services/sentry';
import { NotificationService } from '../services/notificationService';
import { useUserStore } from '../stores';
import { useNetworkStatus } from '../hooks';
import { OfflineBanner } from '../components/OfflineBanner';
import '../global.css';

import { CloudSyncService } from '../services/cloudSyncService';
import { waitForLearningHydration } from '../stores/useUserStore';
import { VocabularyService } from '../services/vocabularyService';

function RootLayout() {
  const [authReady, setAuthReady] = useState(false);
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { reminderHour, reminderMinute, reminderEnabled, streak, setUser, isHydrated, activeScope } = useUserStore();

  useEffect(() => {
    let revision = 0;
    const unsubscribeAuth = onAuthStateChanged(auth, firebaseUser => {
      const current = ++revision;
      void (async () => {
        await waitForLearningHydration();
        try { await VocabularyService.migrateLegacyProgress(); }
        catch (error) { console.warn('Chưa chuyển được dữ liệu từ vựng cũ:', error); }
        if (current !== revision) return;
        setUser(firebaseUser ? {
          uid: firebaseUser.uid, email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
          photoURL: firebaseUser.photoURL, isAnonymous: firebaseUser.isAnonymous,
        } : null);
        setAuthReady(true);
      })().catch(error => { console.warn('Khởi tạo dữ liệu tài khoản chưa hoàn tất:', error); setAuthReady(true); });
    });
    return () => { revision++; unsubscribeAuth(); };
  }, [setUser]);

  useEffect(() => {
    if (!isHydrated || !isConnected || !isInternetReachable) return;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => { void CloudSyncService.syncToCloud(); }, 750);
    };
    const unsubscribe = useUserStore.subscribe((state, previous) => {
      if (state.activeScope !== previous.activeScope || state.attempts !== previous.attempts) schedule();
    });
    const foreground = AppState.addEventListener('change', state => { if (state === 'active') schedule(); });
    const retry = setInterval(schedule, 30_000);
    schedule();
    return () => { unsubscribe(); foreground.remove(); clearInterval(retry); if (debounce) clearTimeout(debounce); };
  }, [isConnected, isInternetReachable, isHydrated]);

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

  if (!isHydrated || !authReady) {
    return <SafeAreaProvider><OfflineBanner /><View className="flex-1 bg-slate-950 items-center justify-center"><Text className="text-slate-300">Đang khôi phục dữ liệu tài khoản…</Text></View></SafeAreaProvider>;
  }
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <OfflineBanner />
      <Stack key={activeScope}
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
