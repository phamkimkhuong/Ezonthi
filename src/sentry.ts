import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  ignoreErrors: [
    'Database is closing/hidden',
    'Database is closing',
    /Database is closing\/hidden/i,
    'Error invoking postMessage: Java object is gone',
    /Error invoking postMessage/i,
    /Java object is gone/i,
    'zaloJSV2 is not defined',
    /zaloJSV2/i,
    "undefined is not an object (evaluating 'window.webkit.messageHandlers')",
    /window\.webkit\.messageHandlers/i,
    /messageHandlers/i,
    'INTERNAL ASSERTION FAILED: Pending promise was never set',
    'INTERNAL ASSERTION FAILED',
    /INTERNAL ASSERTION FAILED/i,
    'e.Tc.get is not a function or its return value is not iterable',
    /is not a function or its return value is not iterable/i,
    'INTERNAL UNHANDLED ERROR',
    /INTERNAL UNHANDLED ERROR/i,
    'Load failed',
    /Load failed/i,
    'Failed to fetch',
    /Failed to fetch/i,
    'AbortError: Fetch is aborted',
    'Fetch is aborted',
    /Fetch is aborted/i,
    /AbortError/i,
    // Bot / CefSharp scanner noise (Microsoft Outlook SafeLinks / Security crawlers)
    /Object Not Found Matching Id/i,
    /MethodName:update/i,
  ],
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 0.2, // Tỷ lệ mẫu theo dõi hiệu năng (20%)
  replaysSessionSampleRate: 0.1, // Tỷ lệ xem lại phiên học (10%)
  replaysOnErrorSampleRate: 1.0, // Tự động ghi lại video phiên làm việc khi xảy ra lỗi (100%)
});

export const captureException = Sentry.captureException;
