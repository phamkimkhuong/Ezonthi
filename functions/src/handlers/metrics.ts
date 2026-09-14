import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db } from '../config.js';
import { evaluateExpansionGate } from '../services/productMetrics.js';
import { vietnamDayKey } from '../services/aiControl.js';

const dayAtOffset = (offset: number, now = new Date()): string =>
  vietnamDayKey(new Date(now.getTime() + offset * 86_400_000));

const loadUserHashes = async (day: string): Promise<Set<string>> => {
  const snapshot = await db.collection('product_user_days').where('day', '==', day).get();
  return new Set(snapshot.docs.map(document => String(document.data().uidHash ?? '')).filter(Boolean));
};

const retention = (cohort: Set<string>, current: Set<string>) => {
  const retained = [...cohort].filter(uid => current.has(uid)).length;
  return { eligibleUsers: cohort.size, retainedUsers: retained, rate: cohort.size > 0 ? retained / cohort.size : 0 };
};

export async function computeProductMetricsSnapshot(now = new Date()) {
  const day = vietnamDayKey(now);
  const [todayUsers, d1Users, d7Users, recent] = await Promise.all([
    loadUserHashes(day),
    loadUserHashes(dayAtOffset(-1, now)),
    loadUserHashes(dayAtOffset(-7, now)),
    db.collection('product_metrics_daily').orderBy('day', 'desc').limit(28).get(),
  ]);
  const d1 = retention(d1Users, todayUsers);
  const d7 = retention(d7Users, todayUsers);
  const rows = recent.docs.map(document => document.data());
  const totals = rows.reduce((sum, row) => ({
    activeLearnerDays: sum.activeLearnerDays + (Number(row.learningUsers) || 0),
    attempts: sum.attempts + (Number(row.attempts) || 0),
    correctAttempts: sum.correctAttempts + (Number(row.correctAttempts) || 0),
    conversions: sum.conversions + (Number(row.premiumConversions) || 0),
    aiCostUsd: sum.aiCostUsd + (Number(row.aiCostUsd) || 0),
  }), { activeLearnerDays: 0, attempts: 0, correctAttempts: 0, conversions: 0, aiCostUsd: 0 });
  const gate = evaluateExpansionGate({
    observationDays: rows.length,
    activeLearners: totals.activeLearnerDays,
    d7EligibleUsers: d7.eligibleUsers,
    d7RetentionRate: d7.rate,
    gradedAttempts: totals.attempts,
    correctAttemptRate: totals.attempts > 0 ? totals.correctAttempts / totals.attempts : 0,
    premiumConversionRate: totals.activeLearnerDays > 0 ? totals.conversions / totals.activeLearnerDays : 0,
    aiCostPerLearningUserUsd: totals.activeLearnerDays > 0 ? totals.aiCostUsd / totals.activeLearnerDays : 0,
  });
  const snapshot = {
    day,
    retention: { d1, d7 },
    rolling28Days: totals,
    expansionGate: gate,
    definitionsVersion: 'phase4-v1',
    computedAt: now,
  };
  await db.collection('product_metrics_daily').doc(day).set(snapshot, { merge: true });
  return snapshot;
}

export const refreshProductMetricsDaily = onSchedule({
  schedule: '30 0 * * *',
  timeZone: 'Asia/Ho_Chi_Minh',
  timeoutSeconds: 120,
  memory: '512MiB',
  retryCount: 2,
}, async () => {
  await computeProductMetricsSnapshot();
});
