import * as Sentry from '@sentry/react-native';

const SENTRY_DSN =
  process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  // Giám sát hiệu năng và profiling
  tracesSampleRate: 0.2,
  _experiments: {
    profilesSampleRate: 0.2,
  },
  // Bỏ qua các lỗi rớt mạng tạm thời hoặc đóng DB không gây crash
  ignoreErrors: [
    'Database is closing/hidden',
    'Database is closing',
    /Database is closing\/hidden/i,
    'Network request failed',
    /Network request failed/i,
    'Failed to fetch',
    /Failed to fetch/i,
    'AbortError',
    /AbortError/i,
  ],
  environment: __DEV__ ? 'development' : 'production',
  initialScope: {
    tags: {
      platform_target: 'mobile_app',
    },
  },
});

export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
export { Sentry };
