import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  browserPopupRedirectResolver,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import type { Analytics } from 'firebase/analytics';
import type { FirebasePerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: "AIzaSyC--Q8dDklMtRVrTkgczovpDPma28jq8xI",
  authDomain: "ezonthi.com",
  projectId: "on-thi-vao-10-7d87c",
  storageBucket: "on-thi-vao-10-7d87c.firebasestorage.app",
  messagingSenderId: "326319018998",
  appId: "1:326319018998:web:02bdb2d1afd36e218dedd7",
  measurementId: "G-DNGBNS5HRX"
};

// Khởi tạo Firebase
export const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với multi-tier persistence (IndexedDB -> LocalStorage -> SessionStorage)
// Giúp tự động fallback nếu IndexedDB bị trình duyệt đóng hoặc ẩn.
let authInstance: ReturnType<typeof getAuth>;
try {
  authInstance = initializeAuth(app, {
    persistence: [
      indexedDBLocalPersistence,
      browserLocalPersistence,
      browserSessionPersistence
    ],
    popupRedirectResolver: browserPopupRedirectResolver
  });
} catch {
  authInstance = getAuth(app);
}
export const auth = authInstance;

// Tự động hấp thụ và triệt tiêu lỗi transient IndexedDB của trình duyệt (Database is closing/hidden)
// ngăn chặn lỗi này làm vỡ unhandled rejection hoặc làm kẹt promise auth của React SPA.
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = reason?.message || String(reason || '');
    if (
      msg.includes('Database is closing') ||
      msg.includes('The database connection is closing') ||
      (reason?.name === 'InvalidStateError' && msg.includes('closing'))
    ) {
      event.preventDefault();
      console.warn('[Firebase Auth] Đã hấp thụ lỗi IndexedDB closing/hidden từ trình duyệt:', msg);
    }
  });
}

// Khởi tạo Firebase Storage để lưu ảnh bài làm tự luận
export const firebaseStorage = getStorage(app);

// Khởi tạo Functions để gọi Backend AI Proxy
export const functions = getFunctions(app);

// Khởi tạo Firestore với Offline Persistence (bộ nhớ đệm đa tab cục bộ)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Telemetry được nạp sau khi giao diện đã tương tác được. Không đưa Analytics/
// Performance vào đường tải quan trọng của trang public hoặc màn hình Auth.
export let analytics: Analytics | null = null;
export let performance: FirebasePerformance | null = null;
let analyticsApi: typeof import('firebase/analytics') | null = null;
let telemetryPromise: Promise<void> | null = null;
let pendingAnalyticsUserId: string | null = null;

const applyAnalyticsUser = () => {
  if (!analytics || !analyticsApi) return;
  analyticsApi.setUserId(analytics, pendingAnalyticsUserId);
  if (pendingAnalyticsUserId) {
    analyticsApi.setUserProperties(analytics, { role: 'student' });
  }
};

export const initializeFirebaseTelemetry = (): Promise<void> => {
  if (telemetryPromise) return telemetryPromise;

  telemetryPromise = (async () => {
    if (typeof window === 'undefined') return;

    const [analyticsModule, performanceModule] = await Promise.all([
      import('firebase/analytics'),
      import('firebase/performance')
    ]);

    analyticsApi = analyticsModule;

    try {
      if (await analyticsModule.isSupported()) {
        analytics = analyticsModule.getAnalytics(app);
        applyAnalyticsUser();
      }
    } catch (error) {
      console.warn('Firebase Analytics chưa hỗ trợ hoặc bị chặn trên trình duyệt hiện tại:', error);
    }

    try {
      performance = performanceModule.getPerformance(app);
    } catch (error) {
      console.warn('Firebase Performance Monitoring chưa hỗ trợ hoặc bị chặn trên trình duyệt hiện tại:', error);
    }
  })();

  return telemetryPromise;
};

// Helper định danh học sinh
export const setAnalyticsUser = (userId: string | null) => {
  pendingAnalyticsUserId = userId;
  applyAnalyticsUser();
};

// Helper ghi nhận sự kiện chuyển đổi tùy chỉnh
export const logCustomEvent = (eventName: string, params?: Record<string, any>) => {
  if (analytics && analyticsApi) {
    analyticsApi.logEvent(analytics, eventName, params);
  }
};
