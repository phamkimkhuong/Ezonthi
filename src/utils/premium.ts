/** A flag alone never grants Premium; permanent grants require an explicit server marker. */
export function hasActivePremium(data: Record<string, unknown> | undefined | null, now = Date.now()): boolean {
  if (!data || (data.isPremium !== true && data.role !== 'premium')) return false;
  if (data.premiumPermanent === true && data.premiumUntil === null) return true;
  if (typeof data.premiumUntil !== 'string') return false;
  const expiry = Date.parse(data.premiumUntil);
  return Number.isFinite(expiry) && expiry > now;
}
