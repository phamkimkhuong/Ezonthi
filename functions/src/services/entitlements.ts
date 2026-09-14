import { HttpsError } from 'firebase-functions/v2/https';

type Entitlement = Record<string, unknown> | undefined;
const DAY = 86_400_000;

import { hasActivePremium } from '../generated/premium.js';
export { hasActivePremium };

export function premiumPatch(data: Entitlement, durationDays: number, now: number) {
  if (hasActivePremium(data, now) && data?.premiumPermanent === true) {
    return { isPremium: true, premiumPermanent: true, premiumUntil: null };
  }
  const expiry = typeof data?.premiumUntil === 'string' ? Date.parse(data.premiumUntil) : NaN;
  return {
    isPremium: true,
    premiumPermanent: false,
    premiumUntil: new Date(Math.max(now, hasActivePremium(data, now) && Number.isFinite(expiry) ? expiry : now) + durationDays * DAY).toISOString(),
  };
}

export function trialPatch(data: Entitlement, now = Date.now()) {
  if (hasActivePremium(data, now)) throw new HttpsError('failed-precondition', 'Tài khoản đang có Premium.');
  if (data?.trialConsumed === true || data?.trialActivated === true || data?.trialStartDate) {
    throw new HttpsError('already-exists', 'Tài khoản đã sử dụng gói dùng thử.');
  }
  return {
    ...premiumPatch(undefined, 30, now),
    trialConsumed: true,
    trialActivated: true,
    trialStartDate: new Date(now).toISOString(),
    premiumPlan: 'Gói Dùng Thử (Trial 30 ngày)',
    planName: 'Gói Dùng Thử (Trial 30 ngày)',
    premiumUpdatedAt: new Date(now),
  };
}
