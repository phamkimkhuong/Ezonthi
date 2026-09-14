import { onCall } from 'firebase-functions/v2/https';
import { db } from '../config.js';
import { requireUser } from '../services/access.js';
import { trialPatch } from '../services/entitlements.js';

export const activatePremiumTrial = onCall({ cors: true }, async request => {
  const uid = requireUser(request);
  const ref = db.collection('users').doc(uid);
  return db.runTransaction(async transaction => {
    const user = await transaction.get(ref);
    const patch = trialPatch(user.data());
    transaction.set(ref, patch, { merge: true });
    return { success: true, premiumUntil: patch.premiumUntil };
  });
});
