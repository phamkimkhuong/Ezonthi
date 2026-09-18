import type { MockExam } from '@/types';

const instructions = [
  'Thời gian làm bài 45 phút. Đề gồm 16 câu nhiều lựa chọn (4,0 điểm), 2 cụm Đúng/Sai (2,0 điểm) và 2 câu trả lời ngắn (4,0 điểm).',
  'Ở phần Đúng/Sai, mỗi ý được chấm độc lập 0,25 điểm; cần chọn đủ bốn ý trong mỗi cụm.',
  'Ghi rõ mốc thế năng và chiều dương khi cần; vận tốc và động lượng phải được xử lí có dấu.',
  'Sau khi nộp, hệ thống tự động chấm và hiển thị kết quả ngay lập tức.'
];

export const physicsMidterm2Exams: MockExam[] = [
  {
    id: 'phy10-midterm2-form-a', subjectId: 'physics', title: 'Giữa học kỳ II – Vật lí 10 (Mã A)', duration: 45,
    kind: 'midterm', focus: 'mixed', scopeTopicIds: ['phy10-t3', 'phy10-t4'], totalPoints: 10, formCode: 'A', instructions,
    questionIds: [
      'phy10-assess-mid2-a-q01', 'phy10-assess-mid2-a-q02', 'phy10-assess-mid2-a-q03', 'phy10-assess-mid2-a-q04',
      'phy10-assess-mid2-a-q05', 'phy10-assess-mid2-a-q06', 'phy10-assess-mid2-a-q07', 'phy10-assess-mid2-a-q08',
      'phy10-assess-mid2-a-q09', 'phy10-assess-mid2-a-q10', 'phy10-assess-mid2-a-q11', 'phy10-assess-mid2-a-q12',
      'phy10-assess-mid2-a-q13', 'phy10-assess-mid2-a-q14', 'phy10-assess-mid2-a-q15', 'phy10-assess-mid2-a-q16',
      'phy10-assess-mid2-a-q17', 'phy10-assess-mid2-a-q18', 'phy10-assess-mid2-a-q19', 'phy10-assess-mid2-a-q20'
    ],
    blueprintId: 'phy10-blueprint-midterm2-v1', assessmentVersion: '1.0.0', resultReleasePolicy: 'after_submit', createdAt: '2026-07-18T00:00:00.000Z'
  },
  {
    id: 'phy10-midterm2-form-b', subjectId: 'physics', title: 'Giữa học kỳ II – Vật lí 10 (Mã B)', duration: 45,
    kind: 'midterm', focus: 'mixed', scopeTopicIds: ['phy10-t3', 'phy10-t4'], totalPoints: 10, formCode: 'B', instructions,
    questionIds: [
      'phy10-assess-mid2-b-q01', 'phy10-assess-mid2-b-q02', 'phy10-assess-mid2-b-q03', 'phy10-assess-mid2-b-q04',
      'phy10-assess-mid2-b-q05', 'phy10-assess-mid2-b-q06', 'phy10-assess-mid2-b-q07', 'phy10-assess-mid2-b-q08',
      'phy10-assess-mid2-b-q09', 'phy10-assess-mid2-b-q10', 'phy10-assess-mid2-b-q11', 'phy10-assess-mid2-b-q12',
      'phy10-assess-mid2-b-q13', 'phy10-assess-mid2-b-q14', 'phy10-assess-mid2-b-q15', 'phy10-assess-mid2-b-q16',
      'phy10-assess-mid2-b-q17', 'phy10-assess-mid2-b-q18', 'phy10-assess-mid2-b-q19', 'phy10-assess-mid2-b-q20'
    ],
    blueprintId: 'phy10-blueprint-midterm2-v1', assessmentVersion: '1.0.0', resultReleasePolicy: 'after_submit', createdAt: '2026-07-18T00:00:00.000Z'
  }
];
