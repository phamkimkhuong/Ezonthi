import { MobileQuestion, QUESTION_BANK } from './questionBank';

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

export const SUBJECTS: SubjectItem[] = [
  {
    id: 'math',
    name: 'Toán Học 10',
    grade: 10,
    icon: 'Calculator',
    color: '#6366f1',
    badge: 'Cốt lõi',
    totalQuestions: 928,
    topics: [
      { id: 'math10-t1', subjectId: 'math', title: 'Mệnh đề & Tập hợp', description: 'Giao, hợp, hiệu các khoảng đoạn số học', questionCount: 116, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'math10-t2', subjectId: 'math', title: 'Bất phương trình & Hệ BPT bậc nhất', description: 'Miền nghiệm và bài toán tối ưu thực tế', questionCount: 108, estimatedMinutes: 15, difficulty: 'medium' },
      { id: 'math10-t3', subjectId: 'math', title: 'Hàm số & Parabol bậc hai', description: 'Tọa độ đỉnh, trục đối xứng, GTLN/GTNN', questionCount: 114, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math10-t4', subjectId: 'math', title: 'Hệ thức lượng trong tam giác', description: 'Định lý sin, cos, công thức diện tích', questionCount: 120, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math10-t5', subjectId: 'math', title: 'Vectơ & Tích vô hướng', description: 'Phân tích vectơ, góc và tích vô hướng', questionCount: 115, estimatedMinutes: 20, difficulty: 'hard' },
      { id: 'math10-t6', subjectId: 'math', title: 'Quy tắc đếm, Hoán vị, Chỉnh hợp, Tổ hợp', description: 'Nhị thức Newton và bài toán đếm thực tế', questionCount: 141, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'math10-t7', subjectId: 'math', title: 'Thống kê & Xác suất cổ điển', description: 'Số đặc trưng đo xu thế và xác suất biến cố', questionCount: 102, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'math10-t8', subjectId: 'math', title: 'Phương pháp tọa độ trong mặt phẳng Oxy', description: 'Đường thẳng, đường tròn, elip, hypebol', questionCount: 142, estimatedMinutes: 25, difficulty: 'hard' },
    ]
  },
  {
    id: 'physics',
    name: 'Vật Lý 10',
    grade: 10,
    icon: 'Atom',
    color: '#06b6d4',
    badge: 'STEM',
    totalQuestions: 1697,
    topics: [
      { id: 'phy10-t1', subjectId: 'physics', title: 'Mô tả chuyển động & Vận tốc', description: 'Độ dịch chuyển, vận tốc, đồ thị d-t', questionCount: 295, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'phy10-t2', subjectId: 'physics', title: 'Chuyển động biến đổi & Rơi tự do', description: 'Gia tốc, phương trình vận tốc và quãng đường', questionCount: 311, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'phy10-t3', subjectId: 'physics', title: 'Ba định luật Newton & Lực cơ học', description: 'Lực ma sát, lực hấp dẫn, lực căng dây', questionCount: 213, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'phy10-t4', subjectId: 'physics', title: 'Năng lượng, Công & Công suất', description: 'Định luật bảo toàn cơ năng, thế năng', questionCount: 227, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'phy10-t5', subjectId: 'physics', title: 'Động lượng & Va chạm', description: 'Định luật bảo toàn động lượng, xung lượng', questionCount: 174, estimatedMinutes: 20, difficulty: 'hard' },
      { id: 'phy10-t6', subjectId: 'physics', title: 'Chuyển động tròn đều & Lực hướng tâm', description: 'Tốc độ góc, gia tốc hướng tâm, góc radian', questionCount: 155, estimatedMinutes: 15, difficulty: 'medium' },
    ]
  },
  {
    id: 'chemistry',
    name: 'Hóa Học 10',
    grade: 10,
    icon: 'FlaskConical',
    color: '#10b981',
    badge: 'Ứng dụng',
    totalQuestions: 1515,
    topics: [
      { id: 'chem10-t1', subjectId: 'chemistry', title: 'Cấu tạo nguyên tử & Hạt cơ bản', description: 'Proton, neutron, electron, đồng vị', questionCount: 180, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'chem10-t2', subjectId: 'chemistry', title: 'Bảng tuần hoàn các nguyên tố', description: 'Ô, chu kỳ, nhóm, quy luật biến thiên', questionCount: 210, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'chem10-t3', subjectId: 'chemistry', title: 'Liên kết hóa học & Quy tắc Octet', description: 'Liên kết ion, cộng hóa trị, liên kết hydrogen', questionCount: 240, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'chem10-t4', subjectId: 'chemistry', title: 'Phản ứng Oxi hóa - Khử', description: 'Số oxi hóa, chất khử, chất oxi hóa, cân bằng e', questionCount: 210, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'chem10-t5', subjectId: 'chemistry', title: 'Năng lượng hóa học & Enthalpy', description: 'Biến thiên Enthalpy $\\Delta H$, phản ứng tỏa/thu nhiệt', questionCount: 190, estimatedMinutes: 20, difficulty: 'hard' },
      { id: 'chem10-t6', subjectId: 'chemistry', title: 'Tốc độ phản ứng & Yếu tố ảnh hưởng', description: 'Định luật tác dụng khối lượng, nồng độ, nhiệt độ', questionCount: 185, estimatedMinutes: 15, difficulty: 'medium' },
    ]
  },
  {
    id: 'biology',
    name: 'Sinh Học 10',
    grade: 10,
    icon: 'Dna',
    color: '#ec4899',
    badge: 'Tự nhiên',
    totalQuestions: 1100,
    topics: [
      { id: 'bio10-t1', subjectId: 'biology', title: 'Thành phần hóa học của tế bào', description: 'Nước, Cacbohydrat, Lipid, Protein, Axit nucleic', questionCount: 160, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'bio10-t2', subjectId: 'biology', title: 'Cấu trúc tế bào nhân sơ & nhân thực', description: 'Màng sinh chất, nhân, bào quan, tế bào thực vật', questionCount: 190, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'bio10-t3', subjectId: 'biology', title: 'Trao đổi chất & Chuyển hóa năng lượng', description: 'Enzim, hô hấp tế bào, quang hợp', questionCount: 200, estimatedMinutes: 25, difficulty: 'hard' },
      { id: 'bio10-t4', subjectId: 'biology', title: 'Chu kỳ tế bào & Phân bào', description: 'Nguyên phân, giảm phân, phát sinh giao tử', questionCount: 180, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  },
  {
    id: 'english',
    name: 'Tiếng Anh 10',
    grade: 10,
    icon: 'Languages',
    color: '#f59e0b',
    badge: 'Hội nhập',
    totalQuestions: 860,
    topics: [
      { id: 'eng10-t1', subjectId: 'english', title: 'Family Life', description: 'Từ vựng gia đình, thì hiện tại đơn & tiếp diễn', questionCount: 215, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'eng10-t2', subjectId: 'english', title: 'Humans and the Environment', description: 'Từ vựng sinh thái, cấu trúc will vs be going to', questionCount: 205, estimatedMinutes: 15, difficulty: 'medium' },
      { id: 'eng10-t3', subjectId: 'english', title: 'Music and Arts', description: 'Từ vựng âm nhạc, câu ghép và liên từ', questionCount: 220, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'eng10-t4', subjectId: 'english', title: 'Inventions and Technology', description: 'Công nghệ hiện đại, thì hiện tại hoàn thành', questionCount: 220, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  },
  {
    id: 'history',
    name: 'Lịch Sử 10',
    grade: 10,
    icon: 'Landmark',
    color: '#8b5cf6',
    badge: 'Xã hội',
    totalQuestions: 750,
    topics: [
      { id: 'his10-t1', subjectId: 'history', title: 'Hiện thực & Nhận thức lịch sử', description: 'Khái niệm, phương pháp nghiên cứu và chức năng lịch sử', questionCount: 180, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'his10-t2', subjectId: 'history', title: 'Tri thức lịch sử & Cuộc sống', description: 'Bảo tồn di sản, phát triển du lịch văn hóa', questionCount: 190, estimatedMinutes: 15, difficulty: 'easy' },
      { id: 'his10-t3', subjectId: 'history', title: 'Văn minh thời Cổ - Trung đại', description: 'Ai Cập, Lưỡng Hà, Ấn Độ, Trung Hoa, Hy Lạp - La Mã', questionCount: 190, estimatedMinutes: 20, difficulty: 'medium' },
      { id: 'his10-t4', subjectId: 'history', title: 'Văn minh Văn Lang - Âu Lạc', description: 'Thời đại Hùng Vương, trống đồng Đông Sơn', questionCount: 190, estimatedMinutes: 20, difficulty: 'medium' },
    ]
  }
];

export const DataService = {
  getSubjects(): SubjectItem[] {
    return SUBJECTS;
  },

  getSubject(id: string): SubjectItem | undefined {
    return SUBJECTS.find(s => s.id === id);
  },

  getTopic(topicId: string): TopicItem | undefined {
    for (const s of SUBJECTS) {
      const topic = s.topics.find(t => t.id === topicId);
      if (topic) return topic;
    }
    return undefined;
  },

  getQuestionsForTopic(topicId: string): MobileQuestion[] {
    if (QUESTION_BANK[topicId] && QUESTION_BANK[topicId].length > 0) {
      return QUESTION_BANK[topicId];
    }
    // Fallback thông minh: Tìm subject chứa topic này để trả về câu hỏi đầu tiên của môn đó
    for (const s of SUBJECTS) {
      const topic = s.topics.find(t => t.id === topicId);
      if (topic && s.topics.length > 0) {
        const firstTopicId = s.topics[0].id;
        if (QUESTION_BANK[firstTopicId] && QUESTION_BANK[firstTopicId].length > 0) {
          return QUESTION_BANK[firstTopicId];
        }
      }
    }
    return QUESTION_BANK['math10-t1'] || [];
  },

  getAllQuestions(): MobileQuestion[] {
    return Object.values(QUESTION_BANK).flat();
  }
};
