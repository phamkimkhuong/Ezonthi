/**
 * Cloudflare R2 Service cho Mobile
 * Đồng bộ lưu trữ tĩnh miễn phí băng thông (Free Egress) từ Cloudflare R2:
 * 1. Kho ảnh chụp trang Sách Giáo Khoa (SGK) bổ trợ câu hỏi (Toán, Hóa, Sinh, Lý).
 * 2. Từ điển từ vựng Tiếng Anh tra cứu nhanh (vocabulary-english.json).
 */

export const R2Service = {
  /**
   * Lấy URL gốc của Cloudflare R2 CDN
   */
  getBaseUrl(): string {
    return process.env.EXPO_PUBLIC_R2_PUBLIC_URL;
  },

  /**
   * Lấy URL ảnh trang Sách Giáo Khoa
   * @param subject Môn học (hóa: chemistry, sinh: biology, lý: physics, toán: math)
   * @param page Số trang SGK
   */
  getTextbookPageUrl(subject: string, page: number): string {
    const baseUrl = this.getBaseUrl();
    const folder = subject.toLowerCase().includes('sinh') ? 'biology' : 'chemistry';
    return `${baseUrl}/${folder}/page_${page}.png`;
  },

  /**
   * Lấy URL dữ liệu từ điển Tiếng Anh
   */
  getVocabularyDataUrl(): string {
    return (
      process.env.EXPO_PUBLIC_R2_VOCABULARY_URL ||
      `${this.getBaseUrl()}/vocabulary-english.json`
    );
  }
};
