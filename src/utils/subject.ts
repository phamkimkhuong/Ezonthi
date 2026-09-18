import type { SubjectCode, GradeCode } from '../types';

export const getSubjectFromQuestionTypeId = (questionTypeId?: string): SubjectCode | null => {
  if (!questionTypeId) return null;
  // Hỗ trợ bóc tách tiền tố khối lớp (VD: g10-chem -> chem) để so khớp chính xác
  const id = questionTypeId.replace(/^g\d+-/, '');
  if (id.startsWith('math')) return 'math';
  if (id.startsWith('eng')) return 'english';
  if (id.startsWith('chem')) return 'chemistry';
  if (id.startsWith('bio')) return 'biology';
  if (id.startsWith('phy')) return 'physics';
  if (id.startsWith('his')) return 'history';
  return null;
};

export const getGradeCodeFromQuestionTypeId = (questionTypeId?: string): GradeCode | null => {
  if (!questionTypeId) return null;

  // 1. Kiểm tra tiền tố g10-, g11-, g9-
  const prefixMatch = questionTypeId.match(/^g(\d+)[-_]/i);
  if (prefixMatch) {
    const g = `grade${prefixMatch[1]}` as GradeCode;
    if (g === 'grade9' || g === 'grade10' || g === 'grade11' || g === 'grade12') {
      return g;
    }
  }

  // 2. Kiểm tra các ID có gắn số khối như math10-, eng10-, chem10-, phy10-, bio10-, his10-, math11-, ...
  const typeMatch = questionTypeId.match(/^(?:math|eng|chem|phy|bio|his|physics|chemistry|biology|history)(\d+)[-_]/i);
  if (typeMatch) {
    const g = `grade${typeMatch[1]}` as GradeCode;
    if (g === 'grade9' || g === 'grade10' || g === 'grade11' || g === 'grade12') {
      return g;
    }
  }

  // 3. ID môn Toán và Tiếng Anh Lớp 9 dạng math-qt1, eng-qt1, ...
  if (questionTypeId.startsWith('math-') || questionTypeId.startsWith('eng-')) {
    return 'grade9';
  }

  return null;
};

export const getGradeFromQuestionTypeId = (questionTypeId?: string): string => {
  if (!questionTypeId) return 'Lớp 9';

  // 1. Kiểm tra tiền tố g10-, g11-
  const prefixMatch = questionTypeId.match(/^g(\d+)[-_]/i);
  if (prefixMatch) {
    return `Lớp ${prefixMatch[1]}`;
  }

  // 2. Kiểm tra các ID có gắn số khối như math10-, eng10-, chem10-, phy10-, bio10-, his10-, math11-, ...
  const typeMatch = questionTypeId.match(/^(?:math|eng|chem|phy|bio|his|physics|chemistry|biology|history)(\d+)[-_]/i);
  if (typeMatch) {
    return `Lớp ${typeMatch[1]}`;
  }

  return 'Lớp 9';
};

export const getSubjectName = (subject: SubjectCode): string => {
  switch (subject) {
    case 'math': return 'Toán học';
    case 'english': return 'Tiếng Anh';
    case 'chemistry': return 'Hóa học';
    case 'physics': return 'Vật lý';
    case 'biology': return 'Sinh học';
    case 'history': return 'Lịch sử';
    default: return 'Môn học';
  }
};

export const getSubjectIcon = (subject: SubjectCode): string => {
  switch (subject) {
    case 'math': return '📐';
    case 'english': return '🗣️';
    case 'chemistry': return '⚗️';
    case 'physics': return '⚛️';
    case 'biology': return '🧬';
    case 'history': return '📜';
    default: return '📚';
  }
};

/**
 * Danh sách 12 dạng bài cuối của các module 1 - 6 trong Vật lý 10 yêu cầu tài khoản Premium
 * Riêng Module 0 (Mở đầu, an toàn & đo lường) hoàn toàn MIỄN PHÍ.
 * Các Module từ 1 đến 6 lấy đúng 2 dạng bài cuối cùng mang tính thực hành, vận dụng cao.
 */
export const PHYSICS_10_PREMIUM_QUESTION_TYPE_IDS = new Set([

  // Module 1: Động học (11 dạng) -> 2 dạng cuối
  'phy10-qt17', // Chuyển động ném
  'phy10-qt18', // Thực hành động học và xử lí dữ liệu

  // Module 2: Động lực học (12 dạng) -> 2 dạng cuối
  'phy10-qt29', // Moment lực và cân bằng vật rắn
  'phy10-qt30', // Khối lượng riêng và áp suất chất lỏng

  // Module 3: Công, năng lượng và công suất (8 dạng) -> 2 dạng cuối
  'phy10-qt37', // Bảo toàn cơ năng
  'phy10-qt38', // Năng lượng trong thực tiễn và dữ liệu

  // Module 4: Động lượng (8 dạng) -> 2 dạng cuối
  'phy10-qt45', // Năng lượng trong va chạm
  'phy10-qt46', // Thực hành và dữ liệu va chạm

  // Module 5: Chuyển động tròn (7 dạng) -> 2 dạng cuối
  'phy10-qt52', // Ứng dụng động lực học chuyển động tròn
  'phy10-qt53', // Thực hành và dữ liệu chuyển động tròn

  // Module 6: Biến dạng của vật rắn (6 dạng) -> 2 dạng cuối
  'phy10-qt58', // Thực hành xác định độ cứng lò xo
  'phy10-qt59', // Ứng dụng lò xo và giới hạn an toàn
]);

/**
 * Danh sách 16 dạng bài cuối của các module 1 - 8 trong Hóa học 10 yêu cầu tài khoản Premium
 * Riêng Module 0 (Nhập môn Hóa học & Cầu nối) hoàn toàn MIỄN PHÍ.
 * Các Module từ 1 đến 8 lấy đúng 2 dạng bài cuối cùng mang tính thực hành, vận dụng cao.
 */
export const CHEMISTRY_10_PREMIUM_QUESTION_TYPE_IDS = new Set([
  // Module 1: Cấu tạo nguyên tử (7 dạng) -> 2 dạng cuối
  'chem10-qt6', // Cấu hình electron & Sơ đồ ô orbital (H10-A06)
  'chem10-qt7', // Cấu hình electron & Tính chất hóa học nguyên tố (H10-A07)

  // Module 2: Bảng tuần hoàn (5 dạng) -> 2 dạng cuối
  'chem10-qt11', // Độ âm điện & Tính Kim loại–Phi kim
  'chem10-qt12', // Oxide, Hydroxide & Định luật tuần hoàn

  // Module 3: Liên kết hóa học (5 dạng) -> 2 dạng cuối
  'chem10-qt16', // Độ phân cực liên kết & Phân tử
  'chem10-qt17', // Tương tác Van der Waals & Liên kết Hydrogen

  // Module 4: Phản ứng oxi hóa – khử (4 dạng) -> 2 dạng cuối
  'chem10-qt20', // Chất Oxi hóa & Chất khử
  'chem10-qt21', // Cân bằng bằng Phương pháp Electron

  // Module 5: Năng lượng hóa học (4 dạng) -> 2 dạng cuối
  'chem10-qt24', // Enthalpy Tạo thành & ΔH Phản ứng
  'chem10-qt25', // Năng lượng Liên kết & ΔH

  // Module 6: Tốc độ phản ứng (4 dạng) -> 2 dạng cuối
  'chem10-qt28', // Va chạm & Yếu tố Ảnh hưởng
  'chem10-qt29', // Xúc tác & Thiết kế Thí nghiệm

  // Module 7: Halogen (5 dạng) -> 2 dạng cuối
  'chem10-qt33', // Hydrogen Halide & Acid
  'chem10-qt34', // Nhận biết Ion Halide

  // Module 8: Tổng hợp & Đánh giá năng lực (4 dạng) -> 2 dạng cuối
  'chem10-qt37', // Đọc Dữ liệu & Thiết kế Thí nghiệm
  'chem10-qt38', // Đánh giá Tổng hợp Cuối khóa
]);

/**
 * Danh sách 20 dạng bài kề cuối của 10 chuyên đề trong Tiếng Anh 10 yêu cầu tài khoản Premium
 * Với mỗi chuyên đề:
 * - 2 dạng bài kề cuối (Phát âm/Trọng âm và Đọc hiểu tích hợp) là Premium 👑
 * - Dạng bài cuối cùng (Vận dụng ngôn ngữ theo ngữ cảnh) và các dạng đầu (Ngữ pháp, Từ vựng) là Miễn phí.
 * (Ví dụ chuyên đề 6 dạng: 1, 2, 3, 4, 5, 6 thì dạng 4 và 5 là Premium; chuyên đề 5 dạng: 1, 2, 3, 4, 5 thì dạng 3 và 4 là Premium)
 */
export const ENGLISH_10_PREMIUM_QUESTION_TYPE_IDS = new Set([
  // Unit 1: Family Life -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt14', // Phát âm cụm phụ âm /br/, /kr/, /tr/
  'eng10-skill-qt-u1-reading', // Đọc hiểu tích hợp – Unit 1

  // Unit 2: Humans and the Environment -> 2 dạng kề cuối (dạng 4 và 5)
  'eng10-qt15', // Phát âm cụm phụ âm /kl/, /pl/, /gr/, /pr/
  'eng10-skill-qt-u2-reading', // Đọc hiểu tích hợp – Unit 2

  // Unit 3: Music -> 2 dạng kề cuối (dạng 4 và 5)
  'eng10-qt16', // Trọng âm của từ 2 âm tiết
  'eng10-skill-qt-u3-reading', // Đọc hiểu tích hợp – Unit 3

  // Unit 4: For a Better Community -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt17', // Trọng âm của từ 3 âm tiết
  'eng10-skill-qt-u4-reading', // Đọc hiểu tích hợp – Unit 4

  // Unit 5: Inventions -> 2 dạng kề cuối (dạng 4 và 5)
  'eng10-qt18', // Trọng âm của danh từ ghép và cụm danh từ
  'eng10-skill-qt-u5-reading', // Đọc hiểu tích hợp – Unit 5

  // Unit 6: Gender Equality -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt21', // Trọng âm tính từ và động từ ba âm tiết
  'eng10-skill-qt-u6-reading', // Đọc hiểu tích hợp – Unit 6

  // Unit 7: Viet Nam and International Organisations -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt24', // Trọng âm từ có hơn ba âm tiết
  'eng10-skill-qt-u7-reading', // Đọc hiểu tích hợp – Unit 7

  // Unit 8: New Ways to Learn -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt27', // Trọng âm câu: content words và structure words
  'eng10-skill-qt-u8-reading', // Đọc hiểu tích hợp – Unit 8

  // Unit 9: Protecting the Environment -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt30', // Nhịp điệu tự nhiên trong câu
  'eng10-skill-qt-u9-reading', // Đọc hiểu tích hợp – Unit 9

  // Unit 10: Ecotourism -> 2 dạng kề cuối (dạng 3 và 4)
  'eng10-qt33', // Ngữ điệu câu trần thuật và câu hỏi
  'eng10-skill-qt-u10-reading', // Đọc hiểu tích hợp – Unit 10
]);

/**
 * Danh sách 14 dạng bài cuối của các module 1 - 7 trong Sinh học 10 yêu cầu tài khoản Premium
 * Riêng Module 0 (Mở đầu & Các cấp độ tổ chức) hoàn toàn MIỄN PHÍ.
 * Các Module từ 1 đến 7 lấy đúng 2 dạng bài cuối cùng mang tính thực hành, vận dụng cao (tương tự Lý và Hóa).
 */
export const BIOLOGY_10_PREMIUM_QUESTION_TYPE_IDS = new Set([
  // Module 1: Thành phần hóa học của tế bào (8 dạng) -> 2 dạng cuối
  'bio10-qt19', // Dinh dưỡng và ứng dụng phân tử sinh học
  'bio10-qt20', // Thực hành nhận biết phân tử sinh học

  // Module 2: Cấu trúc tế bào (8 dạng) -> 2 dạng cuối
  'bio10-qt26', // So sánh các kiểu tế bào
  'bio10-qt27', // Kính hiển vi và nhận diện ảnh tế bào

  // Module 3: Trao đổi chất & Truyền tin tế bào (5 dạng) -> 2 dạng cuối
  'bio10-qt30', // Thực hành tính thấm và co nguyên sinh
  'bio10-qt31', // Truyền tin tế bào và vận dụng

  // Module 4: Chuyển hóa vật chất & năng lượng (5 dạng) -> 2 dạng cuối
  'bio10-qt34', // Tổng hợp chất và tích lũy năng lượng
  'bio10-qt35', // Hô hấp, lên men và quan hệ chuyển hóa

  // Module 5: Chu kỳ tế bào & Phân bào (4 dạng) -> 2 dạng cuối
  'bio10-qt37', // Giảm phân và sinh sản hữu tính
  'bio10-qt38', // Quan sát phân bào và công nghệ tế bào

  // Module 6: Sinh học vi sinh vật & Công nghệ vi sinh (4 dạng) -> 2 dạng cuối
  'bio10-qt40', // Chuyển hóa, sinh trưởng và kiểm soát
  'bio10-qt41', // Ứng dụng và dự án lên men

  // Module 7: Virus và ứng dụng (4 dạng) -> 2 dạng cuối
  'bio10-qt43', // Lây truyền, phòng chống và biến thể
  'bio10-qt44', // Ứng dụng virus và truyền thông khoa học
]);

/**
 * Kiểm tra xem một dạng bài có yêu cầu tài khoản Premium hay không.
 * - Riêng Vật lý 10: Khóa đúng 2 dạng bài cuối của các Module 1-6 (Module 0 miễn phí).
 * - Riêng Hóa học 10: Khóa đúng 2 dạng bài cuối của các Module 1-8 (Module 0 miễn phí).
 * - Riêng Tiếng Anh 10: Khóa đúng 2 dạng bài kề cuối của các Unit 1-10 (Đọc hiểu & Ngữ âm).
 * - Riêng Sinh học 10: Khóa đúng 2 dạng bài cuối của các Module 1-7 (Module 0 miễn phí).
 * - Các môn học khác: Khóa theo chuyên đề Tier 3.
 */
export const isQuestionTypePremiumLocked = (
  questionTypeId: string,
  topicTier: number = 1,
  subject?: string,
  grade?: string
): boolean => {
  // 1. Với Vật lý 10: Khóa đúng 2 dạng cuối của các module 1-6
  if ((subject === 'physics' || questionTypeId.startsWith('phy10-')) && (grade === 'grade10' || !grade)) {
    return PHYSICS_10_PREMIUM_QUESTION_TYPE_IDS.has(questionTypeId);
  }

  // 2. Với Hóa học 10: Khóa đúng 2 dạng cuối của các module 1-8 (không áp dụng cơ chế Tier 3)
  if ((subject === 'chemistry' || questionTypeId.startsWith('chem10-')) && (grade === 'grade10' || !grade)) {
    return CHEMISTRY_10_PREMIUM_QUESTION_TYPE_IDS.has(questionTypeId);
  }

  // 3. Với Tiếng Anh 10: Khóa đúng 2 dạng kề cuối của các Unit 1-10 (không áp dụng cơ chế Tier 3)
  if ((subject === 'english' || questionTypeId.startsWith('eng10-')) && (grade === 'grade10' || !grade)) {
    return ENGLISH_10_PREMIUM_QUESTION_TYPE_IDS.has(questionTypeId);
  }

  // 4. Với Sinh học 10: Khóa đúng 2 dạng cuối của các module 1-7 (không áp dụng cơ chế Tier 3)
  if ((subject === 'biology' || questionTypeId.startsWith('bio10-')) && (grade === 'grade10' || !grade)) {
    return BIOLOGY_10_PREMIUM_QUESTION_TYPE_IDS.has(questionTypeId);
  }

  // 5. Với các môn học khác: Khóa theo Tier 3
  return topicTier === 3;
};




