import { logCustomEvent } from './firebase';

export type ProductEventName =
  | 'paywall_viewed'
  | 'checkout_started'
  | 'trial_activated'
  | 'learning_attempt_graded'
  | 'learning_session_completed';

const ALLOWED_PARAM_KEYS = new Set([
  'grade', 'subject', 'plan_id', 'price_vnd', 'correct', 'question_type_id', 'attempt_count', 'duration_seconds'
]);

export function trackProductEvent(name: ProductEventName, params: Record<string, string | number | boolean> = {}): void {
  const bounded = Object.fromEntries(Object.entries(params)
    .filter(([key]) => ALLOWED_PARAM_KEYS.has(key))
    .slice(0, 12)
    .map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 100) : value]));
  logCustomEvent(name, { ...bounded, metric_version: 'phase4-v1' });
}
