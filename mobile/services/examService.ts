import { QUESTION_BANK, MobileQuestion } from './questionBank';

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: number;
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

export function getQuestionsBySubject(subjectId: string): MobileQuestion[] {
  return Object.values(QUESTION_BANK).flat().filter((q) => q.subjectId === subjectId);
}

/**
 * Danh sách Đề Thi Tuyển Sinh Vào Lớp 10 Mẫu chuẩn GDPT 2018
 */
export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-math-01',
    title: 'Đề Thi Thử Vào 10 Môn Toán - Đề Số 1',
    subjectId: 'math',
    subjectName: 'Toán học',
    grade: 10,
    durationMinutes: 45,
    description: 'Cấu trúc ma trận chuẩn tuyển sinh vào 10: Rút gọn biểu thức, hàm số bậc nhất, hệ phương trình, tam giác đồng dạng và đường tròn.',
    questions: getQuestionsBySubject('math').slice(0, 10),
  },
  {
    id: 'exam-eng-01',
    title: 'Đề Khảo Sát Năng Lực Tiếng Anh Vào 10',
    subjectId: 'english',
    subjectName: 'Tiếng Anh',
    grade: 10,
    durationMinutes: 30,
    description: 'Bao quát ngữ pháp trọng tâm: Thì hiện tại hoàn thành, câu điều kiện, câu bị động, mệnh đề quan hệ và từ vựng thông dụng.',
    questions: getQuestionsBySubject('english').slice(0, 10),
  },
  {
    id: 'exam-khtn-01',
    title: 'Đề Tổng Ôn Khoa Học Tự Nhiên (Lý - Hóa - Sinh)',
    subjectId: 'khtn',
    subjectName: 'Khoa Học Tự Nhiên',
    grade: 10,
    durationMinutes: 40,
    description: 'Tổng hợp kiến thức liên môn KHTN: Định luật Ôm, công suất điện, oxit, axit, bazơ, di truyền Men-đen và nguyên phân.',
    questions: [
      ...getQuestionsBySubject('physics').slice(0, 4),
      ...getQuestionsBySubject('chemistry').slice(0, 4),
      ...getQuestionsBySubject('biology').slice(0, 4),
    ],
  },
  {
    id: 'exam-history-01',
    title: 'Đề Kiểm Tra Kiến Thức Lịch Sử Vào 10',
    subjectId: 'history',
    subjectName: 'Lịch Sử',
    grade: 10,
    durationMinutes: 25,
    description: 'Trọng tâm lịch sử Việt Nam thế kỉ XX: Phong trào dân tộc dân chủ (1919-1930) và các mốc son lịch sử hào hùng.',
    questions: getQuestionsBySubject('history').slice(0, 8),
  }
];

export function getExamById(id: string): Exam | undefined {
  return MOCK_EXAMS.find((e) => e.id === id);
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
