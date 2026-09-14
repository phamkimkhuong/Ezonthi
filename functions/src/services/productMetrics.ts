import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { db } from '../config.js';
import { safeRecordId } from './learningState.js';

function vietnamDayKey(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
}

export interface ProductMetricDelta {
  learning?: boolean;
  ai?: boolean;
  conversion?: boolean;
  attemptCount?: number;
  correctAttemptCount?: number;
  masteredOutcomeCount?: number;
  aiCostUsd?: number;
}

export async function recordProductMetric(uid: string, delta: ProductMetricDelta, now = new Date()): Promise<void> {
  const day = vietnamDayKey(now);
  const userDayRef = db.collection('product_user_days').doc(`${day}_${safeRecordId(uid).slice(0, 32)}`);
  const aggregateRef = db.collection('product_metrics_daily').doc(day);
  await db.runTransaction(async transaction => {
    const userDay = await transaction.get(userDayRef);
    const previous = userDay.data() ?? {};
    const firstActive = !userDay.exists;
    const firstLearning = delta.learning === true && previous.learning !== true;
    const firstAi = delta.ai === true && previous.ai !== true;
    const firstConversion = delta.conversion === true && previous.conversion !== true;
    const attemptCount = Math.max(0, Math.min(1_000, Math.round(delta.attemptCount ?? 0)));
    const correctAttemptCount = Math.max(0, Math.min(attemptCount, Math.round(delta.correctAttemptCount ?? 0)));
    const aiCostUsd = Math.max(0, Math.min(1_000, delta.aiCostUsd ?? 0));
    transaction.set(userDayRef, {
      uidHash: safeRecordId(uid), day, active: true,
      learning: previous.learning === true || delta.learning === true,
      ai: previous.ai === true || delta.ai === true,
      conversion: previous.conversion === true || delta.conversion === true,
      attemptCount: FieldValue.increment(attemptCount),
      correctAttemptCount: FieldValue.increment(correctAttemptCount),
      masteredOutcomeCount: Math.max(Number(previous.masteredOutcomeCount) || 0, Math.max(0, Math.round(delta.masteredOutcomeCount ?? 0))),
      aiCostUsd: FieldValue.increment(aiCostUsd),
      updatedAt: now,
      expiresAt: Timestamp.fromMillis(now.getTime() + 800 * 86_400_000),
    }, { merge: true });
    transaction.set(aggregateRef, {
      day,
      activeUsers: FieldValue.increment(firstActive ? 1 : 0),
      learningUsers: FieldValue.increment(firstLearning ? 1 : 0),
      aiUsers: FieldValue.increment(firstAi ? 1 : 0),
      premiumConversions: FieldValue.increment(firstConversion ? 1 : 0),
      attempts: FieldValue.increment(attemptCount),
      correctAttempts: FieldValue.increment(correctAttemptCount),
      aiCostUsd: FieldValue.increment(aiCostUsd),
      updatedAt: now,
    }, { merge: true });
  });
}

export interface ExpansionGateInput {
  observationDays: number;
  activeLearners: number;
  d7EligibleUsers: number;
  d7RetentionRate: number;
  gradedAttempts: number;
  correctAttemptRate: number;
  premiumConversionRate: number;
  aiCostPerLearningUserUsd: number;
}

export const EXPANSION_GATE_VERSION = 'phase4-v1';

export function evaluateExpansionGate(input: ExpansionGateInput) {
  const checks = {
    observationWindow: input.observationDays >= 28,
    sampleSize: input.activeLearners >= 200 && input.d7EligibleUsers >= 100 && input.gradedAttempts >= 1_000,
    retention: input.d7RetentionRate >= 0.20,
    learningOutcome: input.correctAttemptRate >= 0.60,
    conversion: input.premiumConversionRate >= 0.02,
    aiUnitCost: input.aiCostPerLearningUserUsd <= 0.10,
  };
  return { version: EXPANSION_GATE_VERSION, ready: Object.values(checks).every(Boolean), checks };
}
