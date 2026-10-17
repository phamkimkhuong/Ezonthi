/**
 * Utility helper để chuẩn hóa và tìm kiếm văn bản tiếng Việt
 * Hỗ trợ tìm kiếm không dấu, có dấu, chữ hoa, chữ thường
 */

export const normalizeSearchText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Kiểm tra xem chuỗi target có khớp với query tìm kiếm không
 */
export const matchesSearchKeyword = (target: string, query: string): boolean => {
  if (!query || !query.trim()) return true;
  const cleanTarget = normalizeSearchText(target);
  const cleanQuery = normalizeSearchText(query);
  return cleanTarget.includes(cleanQuery);
};
