import type { MockExam } from '@/types';

const instructions = [
  'Thời gian 45 phút. Đề gồm 16 câu nhiều lựa chọn (4,0 điểm), 2 cụm Đúng/Sai (2,0 điểm) và 2 câu trả lời ngắn (4,0 điểm).',
  'Đọc kĩ bảng số liệu enzyme và sơ đồ phân bào; không đồng nhất số nhiễm sắc thể với lượng DNA.',
  'Sau khi nộp, hệ thống tự động chấm và hiển thị kết quả ngay lập tức.'
];
export const biologyMidterm2Exams: MockExam[] = [
  { id: 'bio10-midterm2-form-a', subjectId: 'biology', title: 'Giữa học kỳ II – Sinh học 10 (Mã A)', duration: 45, kind: 'midterm', focus: 'mixed', scopeTopicIds: ['bio10-t4', 'bio10-t5'], totalPoints: 10, formCode: 'A', instructions, questionIds: [
    'bio10-assess-mid2-a-q01', 'bio10-assess-mid2-a-q02', 'bio10-assess-mid2-a-q03', 'bio10-assess-mid2-a-q04', 'bio10-assess-mid2-a-q05', 'bio10-assess-mid2-a-q06', 'bio10-assess-mid2-a-q07',
    'bio10-assess-mid2-a-q08', 'bio10-assess-mid2-a-q09', 'bio10-assess-mid2-a-q10', 'bio10-assess-mid2-a-q11', 'bio10-assess-mid2-a-q12', 'bio10-assess-mid2-a-q13', 'bio10-assess-mid2-a-q14',
    'bio10-assess-mid2-a-q15', 'bio10-assess-mid2-a-q16', 'bio10-assess-mid2-a-q17', 'bio10-assess-mid2-a-q18', 'bio10-assess-mid2-a-q19', 'bio10-assess-mid2-a-q20'
  ], blueprintId: 'bio10-blueprint-midterm2-v1', assessmentVersion: '1.0.0', resultReleasePolicy: 'after_submit', createdAt: '2026-07-17T00:00:00.000Z' },
  { id: 'bio10-midterm2-form-b', subjectId: 'biology', title: 'Giữa học kỳ II – Sinh học 10 (Mã B)', duration: 45, kind: 'midterm', focus: 'mixed', scopeTopicIds: ['bio10-t4', 'bio10-t5'], totalPoints: 10, formCode: 'B', instructions, questionIds: [
    'bio10-assess-mid2-b-q01', 'bio10-assess-mid2-b-q02', 'bio10-assess-mid2-b-q03', 'bio10-assess-mid2-b-q04', 'bio10-assess-mid2-b-q05', 'bio10-assess-mid2-b-q06', 'bio10-assess-mid2-b-q07',
    'bio10-assess-mid2-b-q08', 'bio10-assess-mid2-b-q09', 'bio10-assess-mid2-b-q10', 'bio10-assess-mid2-b-q11', 'bio10-assess-mid2-b-q12', 'bio10-assess-mid2-b-q13', 'bio10-assess-mid2-b-q14',
    'bio10-assess-mid2-b-q15', 'bio10-assess-mid2-b-q16', 'bio10-assess-mid2-b-q17', 'bio10-assess-mid2-b-q18', 'bio10-assess-mid2-b-q19', 'bio10-assess-mid2-b-q20'
  ], blueprintId: 'bio10-blueprint-midterm2-v1', assessmentVersion: '1.0.0', resultReleasePolicy: 'after_submit', createdAt: '2026-07-17T00:00:00.000Z' }
];
