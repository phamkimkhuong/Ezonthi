import type { MobileQuestion } from './questionBank';
import { DataService, getSubjectsByGrade } from './dataService';
import type { GradeId } from '../stores';

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: number;
  gradeId?: GradeId;
  contentStatus: 'draft' | 'ready';
  durationMinutes: number; // Thời gian làm bài (phút)
  questions: MobileQuestion[];
  description: string;
}

export interface ExamResult {
  examId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score10: number; // Thang điểm 10 làm tròn 1 chữ số thập phân
  timeSpentSeconds: number;
  classification: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Trung bình' | 'Cần cố gắng';
  feedback: string;
}

export function getQuestionsBySubject(subjectId: string, gradeId: GradeId): MobileQuestion[] {
  const subject = DataService.getSubject(subjectId, gradeId);
  return subject?.topics.flatMap(topic => DataService.getQuestionsForTopic(topic.id, gradeId)) || [];
}

export function getQuestionsByTopicPrefix(prefix: string): MobileQuestion[] {
  return DataService.getAllQuestions().filter(q => q.topicId.startsWith(prefix));
}

/**
 * Danh sách Đề Thi Tuyển Sinh và Khảo Sát Năng Lực Chuẩn GDPT 2018 Phân Theo Cấp Lớp
 */
export const MOCK_EXAMS: Exam[] = [
  // ==================== LỚP 9 ÔN THI VÀO 10 ====================
  {
    id: 'exam-math9-01',
    title: 'Đề Thi Thử Vào 10 Môn Toán - Chuẩn Tuyển Sinh',
    subjectId: 'math',
    subjectName: 'Toán Vào 10',
    grade: 9,
    gradeId: 'grade9',
    contentStatus: 'ready',
    durationMinutes: 45,
    description: 'Cấu trúc ma trận chuẩn tuyển sinh vào 10: Rút gọn căn thức, hệ thức Vi-ét, phương trình bậc hai, hệ PT thực tế và góc đường tròn.',
    questions: getQuestionsByTopicPrefix('math9-'),
  },
  {
    id: 'exam-eng9-01',
    title: 'Đề Khảo Sát Năng Lực Tiếng Anh Vào 10',
    subjectId: 'english',
    subjectName: 'Tiếng Anh Vào 10',
    grade: 9,
    gradeId: 'grade9',
    contentStatus: 'ready',
    durationMinutes: 30,
    description: 'Bao quát ngữ pháp trọng tâm thi vào 10: Câu điều kiện loại 1, mệnh đề quan hệ, câu tường thuật, câu bị động và đọc hiểu.',
    questions: getQuestionsByTopicPrefix('eng9-'),
  },

  // ==================== LỚP 10 ====================
  {
    id: 'exam-math-01',
    title: 'Đề Khảo Sát Toán Học 10 - Học Kỳ I',
    subjectId: 'math',
    subjectName: 'Toán học 10',
    grade: 10,
    gradeId: 'grade10',
    contentStatus: 'ready',
    durationMinutes: 45,
    description: 'Trọng tâm GDPT 2018: Mệnh đề - tập hợp, bất phương trình bậc nhất hai ẩn, hàm số bậc hai parabol và vectơ.',
    questions: getQuestionsByTopicPrefix('math10-'),
  },
  {
    id: 'exam-eng-01',
    title: 'Đề Kiểm Tra Tiếng Anh 10 Global Success',
    subjectId: 'english',
    subjectName: 'Tiếng Anh 10',
    grade: 10,
    gradeId: 'grade10',
    contentStatus: 'ready',
    durationMinutes: 30,
    description: 'Bao quát ngữ pháp Unit 1-5: Hiện tại hoàn thành, câu điều kiện, bị động, thì tương lai và từ vựng lối sống gia đình.',
    questions: getQuestionsByTopicPrefix('eng10-'),
  },
  {
    id: 'exam-khtn-01',
    title: 'Đề Tổng Ôn Khoa Học Tự Nhiên (Lý - Hóa - Sinh)',
    subjectId: 'khtn',
    subjectName: 'Khoa Học Tự Nhiên',
    grade: 10,
    gradeId: 'grade10',
    contentStatus: 'ready',
    durationMinutes: 40,
    description: 'Tổng hợp kiến thức liên môn KHTN: Định luật Ôm, công suất điện, oxit, axit, bazơ, di truyền Men-đen và nguyên phân.',
    questions: [
      ...getQuestionsBySubject('physics', 'grade10').slice(0, 4),
      ...getQuestionsBySubject('chemistry', 'grade10').slice(0, 4),
      ...getQuestionsBySubject('biology', 'grade10').slice(0, 4),
    ],
  },
  {
    id: 'exam-history-01',
    title: 'Đề Kiểm Tra Kiến Thức Lịch Sử 10',
    subjectId: 'history',
    subjectName: 'Lịch Sử 10',
    grade: 10,
    gradeId: 'grade10',
    contentStatus: 'ready',
    durationMinutes: 25,
    description: 'Trọng tâm lịch sử thế giới và Việt Nam: Khái niệm lịch sử, các nền văn minh cổ đại phương Đông và văn minh Văn Lang - Âu Lạc.',
    questions: getQuestionsBySubject('history', 'grade10').slice(0, 8),
  },

  // ==================== LỚP 11 ====================
  {
    id: 'exam-math11-01',
    title: 'Đề Khảo Sát Toán 11 - Lượng Giác & Dãy Số',
    subjectId: 'math',
    subjectName: 'Toán học 11',
    grade: 11,
    gradeId: 'grade11',
    contentStatus: 'draft',
    durationMinutes: 45,
    description: 'Chuyên đề trọng tâm Toán 11: Hàm số lượng giác, phương trình lượng giác cơ bản, cấp số cộng và cấp số nhân.',
    questions: getQuestionsByTopicPrefix('math11-'),
  },
  {
    id: 'exam-eng11-01',
    title: 'Đề Ôn Tập Trọng Tâm Tiếng Anh 11',
    subjectId: 'english',
    subjectName: 'Tiếng Anh 11',
    grade: 11,
    gradeId: 'grade11',
    contentStatus: 'draft',
    durationMinutes: 30,
    description: 'Hệ thống ngữ pháp: Danh động từ, phân từ hoàn thành, câu chẻ nhấn mạnh và từ vựng thế hệ trẻ.',
    questions: getQuestionsByTopicPrefix('eng11-'),
  }
];

export function isExamAvailable(exam: Exam): boolean {
  if (exam.contentStatus !== 'ready' || !exam.gradeId || exam.grade !== Number(exam.gradeId.slice(5)) || exam.questions.length === 0) return false;
  const subjects = getSubjectsByGrade(exam.gradeId).filter(subject =>
    exam.subjectId === 'khtn' ? ['physics', 'chemistry', 'biology'].includes(subject.id) : subject.id === exam.subjectId
  );
  const questionIds = new Set(subjects.flatMap(subject => subject.topics.flatMap(topic =>
    DataService.getQuestionsForTopic(topic.id, exam.gradeId).map(q => q.id)
  )));
  return exam.questions.every(q => {
    const scope = DataService.getTopicScope(q.topicId);
    return !!scope && scope.gradeId === exam.gradeId && scope.subjectId === q.subjectId && questionIds.has(q.id);
  });
}

export function getExamById(id: string): Exam | undefined {
  return MOCK_EXAMS.find(exam => exam.id === id && isExamAvailable(exam));
}

export function getExamsByGrade(gradeId: GradeId): Exam[] {
  return MOCK_EXAMS.filter(exam => exam.gradeId === gradeId && isExamAvailable(exam));
}

export function evaluateExam(
  exam: Exam,
  userAnswers: Record<string, string>,
  timeSpentSeconds: number
): ExamResult {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  exam.questions.forEach((q) => {
    const selected = userAnswers[q.id];
    if (!selected) {
      unansweredCount++;
    } else if (selected === q.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const total = exam.questions.length;
  const rawScore = total > 0 ? (correctCount / total) * 10 : 0;
  const score10 = Math.round(rawScore * 10) / 10;

  let classification: ExamResult['classification'];
  let feedback = '';

  if (score10 >= 9.0) {
    classification = 'Xuất sắc';
    feedback = 'Tuyệt đỉnh! Em đã nắm rất vững kiến thức và kỹ năng giải đề. Tiếp tục giữ vững phong độ để tự tin đỗ trường chuyên/nguyện vọng 1 nhé!';
  } else if (score10 >= 8.0) {
    classification = 'Giỏi';
    feedback = 'Rất tốt! Em chỉ cần rà soát lại một vài lỗi sai nhỏ hoặc bẫy đề thi là có thể đạt điểm tuyệt đối.';
  } else if (score10 >= 6.5) {
    classification = 'Khá';
    feedback = 'Khá tốt! Em đã nắm được các câu nhận biết và thông hiểu. Hãy tập trung luyện thêm các câu vận dụng để nâng cao điểm số.';
  } else if (score10 >= 5.0) {
    classification = 'Trung bình';
    feedback = 'Em đã đạt mức cơ bản, nhưng cần ôn tập kỹ lại các công thức và định nghĩa cốt lõi để tránh mất điểm đáng tiếc.';
  } else {
    classification = 'Cần cố gắng';
    feedback = 'Điểm số chưa như kỳ vọng. Đừng nản lòng em nhé! Hãy mở Sổ Lỗi Sai để ôn lại các câu chưa đúng và làm lại đề này.';
  }

  return {
    examId: exam.id,
    totalQuestions: total,
    correctCount,
    wrongCount,
    unansweredCount,
    score10,
    timeSpentSeconds,
    classification,
    feedback
  };
}
