import { MobileQuestion, QUESTION_BANK } from './questionBank';
import type { GradeId } from '../stores/useUserStore';

export type { MobileQuestion };

export interface SubjectItem {
  id: string;
  name: string;
  grade: number;
  icon: string;
  color: string;
  badge: string;
  totalQuestions: number;
  topics: TopicItem[];
}

export interface TopicItem {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Only publish questions belonging to this exact topic and subject.
function questionsForTopic(topic: TopicItem): MobileQuestion[] {
  return (QUESTION_BANK[topic.id] || []).filter(q => q.topicId === topic.id && q.subjectId === topic.subjectId);
}

function withAvailableQuestions(subject: SubjectItem): SubjectItem {
  const topics = subject.topics.map(topic => ({ ...topic, questionCount: questionsForTopic(topic).length }));
  return { ...subject, topics, totalQuestions: topics.reduce((count, topic) => count + topic.questionCount, 0) };
}

// ==========================================
// 🎒 LỚP 9 - TRỌNG TÂM ÔN THI VÀO 10 THPT
// ==========================================
export const SUBJECTS_GRADE_9: SubjectItem[] = ([
  {
    id: 'math',
    name: 'Toán 9 (Vào 10)',
    grade: 9,
    icon: 'Calculator',
    color: '#6366f1',
    badge: 'Tuyển sinh',
    totalQuestions: 0,
    topics: [
      { id: 'math9-t1', subjectId: 'math', title: 'Đại số nền tảng & Căn thức', description: 'Rút gọn căn bậc hai, biến đổi biểu thức chứa căn, so sánh giá trị', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'math9-t2', subjectId: 'math', title: 'Phương trình & Hệ thức Vi-ét', description: 'Phương trình bậc hai một ẩn, định lý Vi-ét và các ứng dụng dấu', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math9-t3', subjectId: 'math', title: 'Hệ phương trình & Toán thực tế', description: 'Giải toán bằng cách lập hệ PT, bài toán năng suất, chuyển động', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math9-t4', subjectId: 'math', title: 'Hàm số bậc nhất & Đồ thị Parabol', description: 'Tọa độ giao điểm, tiếp xúc giữa đường thẳng và parabol y = ax²', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math9-t5', subjectId: 'math', title: 'Hình học đường tròn & Tứ giác nội tiếp', description: 'Góc nội tiếp, tiếp tuyến, chứng minh 4 điểm cùng thuộc đường tròn', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'math9-t6', subjectId: 'math', title: 'Thống kê & Xác suất cơ bản', description: 'Bảng tần số, tần số tương đối, xác suất thực nghiệm của biến cố', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
    ]
  },
  {
    id: 'english',
    name: 'Tiếng Anh 9 (Vào 10)',
    grade: 9,
    icon: 'Languages',
    color: '#10b981',
    badge: 'Bắt buộc',
    totalQuestions: 0,
    topics: [
      { id: 'eng9-t1', subjectId: 'english', title: 'Từ vựng & Ngữ pháp trọng tâm', description: 'Các thì quá khứ, hiện tại, câu bị động, câu điều kiện loại 1 & 2', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'eng9-t2', subjectId: 'english', title: 'Đọc hiểu văn bản tuyển sinh', description: 'Kỹ năng Skimming & Scanning, xác định ý chính và chi tiết văn bản', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'eng9-t3', subjectId: 'english', title: 'Viết lại câu & Biến đổi cấu trúc', description: 'Chuyển đổi câu gián tiếp, liên từ, câu ước với Wish và so sánh', questionCount: 0, estimatedMinutes: 20, difficulty: 'hard' },
    ]
  }
] satisfies SubjectItem[]).map(withAvailableQuestions);

// ==========================================
// 📘 LỚP 10 - CHƯƠNG TRÌNH MỚI GDPT 2018
// ==========================================
export const SUBJECTS_GRADE_10: SubjectItem[] = ([
  {
    id: 'math',
    name: 'Toán Học 10',
    grade: 10,
    icon: 'Calculator',
    color: '#6366f1',
    badge: 'Cốt lõi',
    totalQuestions: 0,
    topics: [
      { id: 'math10-t1', subjectId: 'math', title: 'Mệnh đề & Tập hợp', description: 'Giao, hợp, hiệu các khoảng đoạn số học', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'math10-t2', subjectId: 'math', title: 'Bất phương trình & Hệ BPT bậc nhất', description: 'Miền nghiệm và bài toán tối ưu thực tế', questionCount: 0, estimatedMinutes: 15, difficulty: 'medium' },
      { id: 'math10-t3', subjectId: 'math', title: 'Hàm số & Parabol bậc hai', description: 'Tọa độ đỉnh, trục đối xứng, GTLN/GTNN', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math10-t4', subjectId: 'math', title: 'Hệ thức lượng trong tam giác', description: 'Định lý sin, cos, công thức diện tích', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math10-t5', subjectId: 'math', title: 'Vectơ & Tích vô hướng', description: 'Phân tích vectơ, góc và tích vô hướng', questionCount: 0, estimatedMinutes: 20, difficulty: 'hard' },
      { id: 'math10-t6', subjectId: 'math', title: 'Quy tắc đếm, Hoán vị, Chỉnh hợp, Tổ hợp', description: 'Nhị thức Newton và bài toán đếm thực tế', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'math10-t7', subjectId: 'math', title: 'Thống kê & Xác suất cổ điển', description: 'Số đặc trưng đo xu thế và xác suất biến cố', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math10-t8', subjectId: 'math', title: 'Phương pháp tọa độ trong mặt phẳng Oxy', description: 'Đường thẳng, đường tròn, elip, hypebol', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
    ]
  },
  {
    id: 'physics',
    name: 'Vật Lý 10',
    grade: 10,
    icon: 'Atom',
    color: '#06b6d4',
    badge: 'STEM',
    totalQuestions: 0,
    topics: [
      { id: 'phy10-t1', subjectId: 'physics', title: 'Mô tả chuyển động & Vận tốc', description: 'Độ dịch chuyển, vận tốc, đồ thị d-t', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'phy10-t2', subjectId: 'physics', title: 'Chuyển động biến đổi & Rơi tự do', description: 'Gia tốc, phương trình vận tốc và quãng đường', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'phy10-t3', subjectId: 'physics', title: 'Ba định luật Newton & Lực cơ học', description: 'Lực ma sát, lực hấp dẫn, lực căng dây', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'phy10-t4', subjectId: 'physics', title: 'Năng lượng, Công & Công suất', description: 'Định luật bảo toàn cơ năng, thế năng', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'phy10-t5', subjectId: 'physics', title: 'Động lượng & Va chạm', description: 'Định luật bảo toàn động lượng, xung lượng', questionCount: 0, estimatedMinutes: 20, difficulty: 'hard' },
      { id: 'phy10-t6', subjectId: 'physics', title: 'Chuyển động tròn đều & Lực hướng tâm', description: 'Tốc độ góc, gia tốc hướng tâm, góc radian', questionCount: 0, estimatedMinutes: 15, difficulty: 'medium' },
    ]
  },
  {
    id: 'chemistry',
    name: 'Hóa Học 10',
    grade: 10,
    icon: 'FlaskConical',
    color: '#10b981',
    badge: 'Ứng dụng',
    totalQuestions: 0,
    topics: [
      { id: 'chem10-t1', subjectId: 'chemistry', title: 'Cấu tạo nguyên tử & Hạt cơ bản', description: 'Proton, neutron, electron, đồng vị', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'chem10-t2', subjectId: 'chemistry', title: 'Bảng tuần hoàn các nguyên tố', description: 'Ô, chu kỳ, nhóm, quy luật biến thiên', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'chem10-t3', subjectId: 'chemistry', title: 'Liên kết hóa học & Quy tắc Octet', description: 'Liên kết ion, cộng hóa trị, liên kết hydrogen', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'chem10-t4', subjectId: 'chemistry', title: 'Phản ứng Oxi hóa - Khử', description: 'Số oxi hóa, chất khử, chất oxi hóa, cân bằng e', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'chem10-t5', subjectId: 'chemistry', title: 'Năng lượng hóa học & Enthalpy', description: 'Biến thiên Enthalpy ΔH, phản ứng tỏa/thu nhiệt', questionCount: 0, estimatedMinutes: 20, difficulty: 'hard' },
      { id: 'chem10-t6', subjectId: 'chemistry', title: 'Tốc độ phản ứng & Yếu tố ảnh hưởng', description: 'Định luật tác dụng khối lượng, nồng độ, nhiệt độ', questionCount: 0, estimatedMinutes: 15, difficulty: 'medium' },
    ]
  },
  {
    id: 'biology',
    name: 'Sinh Học 10',
    grade: 10,
    icon: 'Dna',
    color: '#ec4899',
    badge: 'Tự nhiên',
    totalQuestions: 0,
    topics: [
      { id: 'bio10-t1', subjectId: 'biology', title: 'Thành phần hóa học của tế bào', description: 'Nước, Cacbohydrat, Lipid, Protein, Axit nucleic', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'bio10-t2', subjectId: 'biology', title: 'Cấu trúc tế bào nhân sơ & nhân thực', description: 'Màng sinh chất, nhân, bào quan, tế bào thực vật', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'bio10-t3', subjectId: 'biology', title: 'Trao đổi chất & Chuyển hóa năng lượng', description: 'Enzim, hô hấp tế bào, quang hợp', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'bio10-t4', subjectId: 'biology', title: 'Chu kỳ tế bào & Phân bào', description: 'Nguyên phân, giảm phân, phát sinh giao tử', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  },
  {
    id: 'english',
    name: 'Tiếng Anh 10',
    grade: 10,
    icon: 'Languages',
    color: '#f59e0b',
    badge: 'Hội nhập',
    totalQuestions: 0,
    topics: [
      { id: 'eng10-t1', subjectId: 'english', title: 'Family Life', description: 'Từ vựng gia đình, thì hiện tại đơn & tiếp diễn', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'eng10-t2', subjectId: 'english', title: 'Humans and the Environment', description: 'Từ vựng sinh thái, cấu trúc will vs be going to', questionCount: 0, estimatedMinutes: 15, difficulty: 'medium' },
      { id: 'eng10-t3', subjectId: 'english', title: 'Music and Arts', description: 'Từ vựng âm nhạc, câu ghép và liên từ', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'eng10-t4', subjectId: 'english', title: 'Inventions and Technology', description: 'Công nghệ hiện đại, thì hiện tại hoàn thành', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  },
  {
    id: 'history',
    name: 'Lịch Sử 10',
    grade: 10,
    icon: 'Landmark',
    color: '#8b5cf6',
    badge: 'Xã hội',
    totalQuestions: 0,
    topics: [
      { id: 'his10-t1', subjectId: 'history', title: 'Hiện thực & Nhận thức lịch sử', description: 'Khái niệm, phương pháp nghiên cứu và chức năng lịch sử', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'his10-t2', subjectId: 'history', title: 'Tri thức lịch sử & Cuộc sống', description: 'Bảo tồn di sản, phát triển du lịch văn hóa', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'his10-t3', subjectId: 'history', title: 'Văn minh thời Cổ - Trung đại', description: 'Ai Cập, Lưỡng Hà, Ấn Độ, Trung Hoa, Hy Lạp - La Mã', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'his10-t4', subjectId: 'history', title: 'Văn minh Văn Lang - Âu Lạc', description: 'Thời đại Hùng Vương, trống đồng Đông Sơn', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  }
] satisfies SubjectItem[]).map(withAvailableQuestions);

// ==========================================
// 📗 LỚP 11 - CHƯƠNG TRÌNH MỚI GDPT 2018
// ==========================================
export const SUBJECTS_GRADE_11: SubjectItem[] = ([
  {
    id: 'math',
    name: 'Toán Học 11',
    grade: 11,
    icon: 'Calculator',
    color: '#6366f1',
    badge: 'Cốt lõi',
    totalQuestions: 0,
    topics: [
      { id: 'math11-t1', subjectId: 'math', title: 'Hàm số lượng giác & Phương trình lượng giác', description: 'Công thức biến đổi, chu kỳ và đồ thị hàm lượng giác', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math11-t2', subjectId: 'math', title: 'Dãy số, Cấp số cộng & Cấp số nhân', description: 'Số hạng tổng quát, tính đơn điệu, tổng n số hạng đầu', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math11-t3', subjectId: 'math', title: 'Giới hạn & Hàm số liên tục', description: 'Giới hạn dãy số, giới hạn hàm số tại vô cực và điểm gián đoạn', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'math11-t4', subjectId: 'math', title: 'Đạo hàm & Ý nghĩa hình học', description: 'Quy tắc tính đạo hàm, tiếp tuyến của đồ thị hàm số', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'math11-t5', subjectId: 'math', title: 'Quan hệ song song & Vuông góc trong không gian', description: 'Đường thẳng và mặt phẳng song song, góc và khoảng cách', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'math11-t6', subjectId: 'math', title: 'Một số yếu tố thống kê & Xác suất', description: 'Biến cố hợp, biến cố giao, quy tắc cộng và nhân xác suất', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  },
  {
    id: 'physics',
    name: 'Vật Lý 11',
    grade: 11,
    icon: 'Atom',
    color: '#06b6d4',
    badge: 'STEM',
    totalQuestions: 0,
    topics: [
      { id: 'phy11-t1', subjectId: 'physics', title: 'Dao động cơ & Dao động điều hòa', description: 'Phương trình dao động, con lắc lò xo và con lắc đơn', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'phy11-t2', subjectId: 'physics', title: 'Sóng cơ & Sóng âm', description: 'Sự truyền sóng, giao thoa sóng, sóng dừng và đặc tính âm', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'phy11-t3', subjectId: 'physics', title: 'Điện trường & Điện thế', description: 'Định luật Coulomb, cường độ điện trường, thế năng điện trường', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'phy11-t4', subjectId: 'physics', title: 'Dòng điện không đổi & Mạch điện', description: 'Định luật Ohm cho toàn mạch, nguồn điện và công suất điện', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  },
  {
    id: 'chemistry',
    name: 'Hóa Học 11',
    grade: 11,
    icon: 'FlaskConical',
    color: '#10b981',
    badge: 'Ứng dụng',
    totalQuestions: 0,
    topics: [
      { id: 'chem11-t1', subjectId: 'chemistry', title: 'Cân bằng hóa học & pH', description: 'Hằng số cân bằng Kc, nguyên lý chuyển dịch Le Chatelier', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'chem11-t2', subjectId: 'chemistry', title: 'Nitrogen & Sulfur', description: 'Hợp chất của nitơ, ammonia, axit sunfuric và ứng dụng', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'chem11-t3', subjectId: 'chemistry', title: 'Đại cương hóa học hữu cơ', description: 'Phân tích nguyên tố, công thức phân tử, đồng phân', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'chem11-t4', subjectId: 'chemistry', title: 'Hydrocarbon (Alkane, Alkene, Arene)', description: 'Tính chất hóa học, phản ứng thế, phản ứng cộng và trùng hợp', questionCount: 0, estimatedMinutes: 25, difficulty: 'hard' },
    ]
  },
  {
    id: 'english',
    name: 'Tiếng Anh 11',
    grade: 11,
    icon: 'Languages',
    color: '#f59e0b',
    badge: 'Hội nhập',
    totalQuestions: 0,
    topics: [
      { id: 'eng11-t1', subjectId: 'english', title: 'A Long and Healthy Life', description: 'Sức khỏe & lối sống lành mạnh, thì quá khứ đơn & quá khứ hoàn thành', questionCount: 0, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'eng11-t2', subjectId: 'english', title: 'The Generation Gap', description: 'Khoảng cách thế hệ, động từ khuyết thiếu should, ought to, must', questionCount: 0, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'eng11-t3', subjectId: 'english', title: 'Cities of the Future', description: 'Đô thị tương lai, mệnh đề quan hệ rút gọn và động từ trạng thái', questionCount: 0, estimatedMinutes: 20, difficulty: 'hard' },
    ]
  }
] satisfies SubjectItem[]).map(withAvailableQuestions);

export const SUBJECTS_BY_GRADE: Record<GradeId, SubjectItem[]> = {
  grade9: SUBJECTS_GRADE_9,
  grade10: SUBJECTS_GRADE_10,
  grade11: SUBJECTS_GRADE_11,
};

export function getSubjectsByGrade(grade: GradeId = 'grade9'): SubjectItem[] {
  return SUBJECTS_BY_GRADE[grade] || [];
}

// Giữ lại hằng số mặc định cho các file import cũ
export const SUBJECTS: SubjectItem[] = SUBJECTS_GRADE_9;

export const DataService = {
  getSubjects(grade: GradeId = 'grade9'): SubjectItem[] {
    return getSubjectsByGrade(grade);
  },

  getSubject(id: string, grade: GradeId): SubjectItem | undefined {
    const list = getSubjectsByGrade(grade);
    return list.find(s => s.id === id);
  },

  getTopic(topicId: string, grade?: GradeId): TopicItem | undefined {
    const searchLists = grade ? [getSubjectsByGrade(grade)] : Object.values(SUBJECTS_BY_GRADE);
    for (const list of searchLists) {
      for (const s of list) {
        const topic = s.topics.find(t => t.id === topicId);
        if (topic) return topic;
      }
    }
    return undefined;
  },

  getTopicScope(topicId: string): { gradeId: GradeId; subjectId: string } | undefined {
    for (const gradeId of Object.keys(SUBJECTS_BY_GRADE) as GradeId[]) {
      const subject = getSubjectsByGrade(gradeId).find(s => s.topics.some(t => t.id === topicId));
      if (subject) return { gradeId, subjectId: subject.id };
    }
    return undefined;
  },

  getQuestionsForTopic(topicId: string, grade?: GradeId): MobileQuestion[] {
    const topic = this.getTopic(topicId, grade);
    return topic ? questionsForTopic(topic) : [];
  },

  getAllQuestions(): MobileQuestion[] {
    return Object.values(SUBJECTS_BY_GRADE).flatMap(subjects =>
      subjects.flatMap(subject => subject.topics.flatMap(questionsForTopic))
    );
  }
};
