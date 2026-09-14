import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';
import { premiumPatch } from './entitlements.js';
import { safeRecordId } from './learningState.js';
import { vietnamDayKey } from './aiControl.js';

export interface VerifiedPayment {
  orderCode: number;
  code: string;
  amount: number;
  currency: string;
  paymentLinkId: string;
  reference: string;
}

/** Called only after SDK signature verification; every read precedes every write. */
export async function settleVerifiedPayment(db: Firestore, payment: VerifiedPayment, now = Date.now()) {
  if (payment.code !== '00') return 'ignored';
  if (!Number.isSafeInteger(payment.orderCode) || payment.orderCode <= 0 ||
      !Number.isSafeInteger(payment.amount) || payment.amount <= 0 ||
      payment.currency !== 'VND' || typeof payment.paymentLinkId !== 'string' || !payment.paymentLinkId ||
      typeof payment.reference !== 'string' || !payment.reference) {
    throw new Error('Invalid verified payment data');
  }
  // Exact documented signed verification sample; never fulfil it as a real order.
  if (payment.orderCode === 123 && payment.amount === 3000 && payment.reference === 'TF230204212323' &&
      payment.paymentLinkId === '124c33293c43417ab7879e14c8d9eb18') return 'verification';
  const txRef = db.collection('transactions').doc(String(payment.orderCode));
  return db.runTransaction(async transaction => {
    const tx = await transaction.get(txRef);
    if (!tx.exists) throw new Error('Payment order not found');
    const order = tx.data()!;
    if (order.orderCode !== payment.orderCode || order.amount !== payment.amount ||
        order.paymentLinkId !== payment.paymentLinkId) throw new Error('Payment order mismatch');
    if (order.status === 'completed') return 'duplicate';
    if (order.status !== 'pending' || typeof order.userId !== 'string' || !order.userId ||
        !['plan_3m', 'plan_12m'].includes(order.planId)) throw new Error('Invalid order state');

    const userRef = db.collection('users').doc(order.userId);
    const user = await transaction.get(userRef);
    const userData = user.data();
    const metricDay = vietnamDayKey(new Date(now));
    const metricUserRef = db.collection('product_user_days').doc(`${metricDay}_${safeRecordId(order.userId).slice(0, 32)}`);
    const metricDailyRef = db.collection('product_metrics_daily').doc(metricDay);
    const metricUser = await transaction.get(metricUserRef);
    const days = order.planId === 'plan_3m' ? 90 : 365;
    const planName = order.planId === 'plan_3m' ? 'Gói 3 Tháng' : 'Gói 12 Tháng (VIP 1 Năm)';
    const commission = order.commissionAmount ?? 0;
    if (!Number.isSafeInteger(commission) || commission < 0 || commission > order.originalAmount) {
      throw new Error('Invalid commission');
    }
    transaction.update(txRef, {
      status: 'completed',
      commissionStatus: order.sellerUid ? 'credited' : null,
      paymentReference: payment.reference,
      paidAmount: payment.amount,
      updatedAt: new Date(now),
    });
    transaction.set(userRef, {
      ...premiumPatch(userData, days, now),
      trialConsumed: userData?.trialConsumed === true || userData?.trialActivated === true || Boolean(userData?.trialStartDate),
      trialActivated: false,
      premiumPlan: planName,
      planName,
      premiumUpdatedAt: new Date(now),
    }, { merge: true });
    transaction.set(metricUserRef, {
      uidHash: safeRecordId(order.userId), day: metricDay, active: true, conversion: true,
      learning: metricUser.data()?.learning === true,
      ai: metricUser.data()?.ai === true,
      attemptCount: Number(metricUser.data()?.attemptCount) || 0,
      correctAttemptCount: Number(metricUser.data()?.correctAttemptCount) || 0,
      masteredOutcomeCount: Number(metricUser.data()?.masteredOutcomeCount) || 0,
      aiCostUsd: Number(metricUser.data()?.aiCostUsd) || 0,
      updatedAt: new Date(now),
      expiresAt: Timestamp.fromMillis(now + 800 * 86_400_000),
    }, { merge: true });
    transaction.set(metricDailyRef, {
      day: metricDay,
      activeUsers: FieldValue.increment(metricUser.exists ? 0 : 1),
      premiumConversions: FieldValue.increment(metricUser.data()?.conversion === true ? 0 : 1),
      updatedAt: new Date(now),
    }, { merge: true });
    if (order.sellerUid && commission > 0) {
      transaction.set(db.collection('affiliateWallets').doc(order.sellerUid), {
        sellerUid: order.sellerUid,
        balance: FieldValue.increment(commission),
        totalEarned: FieldValue.increment(commission),
        updatedAt: new Date(now),
      }, { merge: true });
    }
    if (order.affiliateCode) {
      // A deleted code must not prevent fulfilment of an already paid order.
      transaction.set(db.collection('affiliateCodes').doc(order.affiliateCode), {
        usageCount: FieldValue.increment(1),
      }, { merge: true });
    }
    return 'completed';
  });
}
