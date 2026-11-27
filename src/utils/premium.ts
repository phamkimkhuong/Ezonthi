/**
 * Công tắc tổng cho toàn bộ cơ chế thương mại hóa (Khóa Premium + Dùng thử 30 ngày + Góc Đối Tác/Affiliate + Gói trả phí).
 * Khi đặt là `false`: mở miễn phí 100% toàn bộ dạng bài, ẩn hoàn toàn luồng mua gói / trial / affiliate và đồng bộ sang Cloud Functions sau khi build.
 * Khi cần thu phí trở lại: chỉ cần đổi về `true` rồi build lại client & functions.
 */
export const MONETIZATION_ENABLED = false;

/** A flag alone never grants Premium; permanent grants require an explicit server marker. */
export function hasActivePremium(data: Record<string, unknown> | undefined | null, now = Date.now()): boolean {
  if (!MONETIZATION_ENABLED) return false;
  if (!data || (data.isPremium !== true && data.role !== 'premium')) return false;
  if (data.premiumPermanent === true && data.premiumUntil === null) return true;
  if (typeof data.premiumUntil !== 'string') return false;
  const expiry = Date.parse(data.premiumUntil);
  return Number.isFinite(expiry) && expiry > now;
}
