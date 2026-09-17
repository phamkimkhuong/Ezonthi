import { MockExam } from '@/types';

const integratedInstructions = [
  'Đề gồm 40 câu trắc nghiệm khách quan gồm Language, Reading và Writing (Viết lại câu & Nối câu).',
  'Mỗi câu hỏi có 4 lựa chọn (A, B, C, D) với duy nhất một đáp án đúng.',
  'Hệ thống tự động chấm điểm 100% và công bố kết quả ngay khi nộp bài.'
];

export const g10EnglishAssessmentExams: MockExam[] = [
  {
    id: 'eng10-midterm1-a',
    subjectId: 'english',
    title: 'Giữa học kỳ I – Tiếng Anh 10 (Mã A)',
    duration: 60,
    kind: 'midterm',
    semester: 1,
    scopeTopicIds: ['eng10-t1', 'eng10-t2', 'eng10-t3'],
    totalPoints: 10,
    formCode: 'A',
    parallelFormGroup: 'eng10-midterm1',
    blueprintId: 'eng10-bp-midterm1',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Đề kiểm tra Language, Reading và Writing trong phạm vi Unit 1–3.'
    ],
    questionIds: [
      'eng10-q1', 'eng10-q5', 'eng10-q203', 'eng10-q51', 'eng10-q168', 'eng10-q76', 'eng10-q93',
      'eng10-q207', 'eng10-q9', 'eng10-q172', 'eng10-q11', 'eng10-q126', 'eng10-q130', 'eng10-q16',
      'eng10-q133', 'eng10-q137', 'eng10-q56', 'eng10-q175', 'eng10-q79', 'eng10-q102', 'eng10-q21',
      'eng10-q140', 'eng10-q143', 'eng10-q26', 'eng10-q146', 'eng10-q151', 'eng10-q92', 'eng10-q94',
      'eng10-q96', 'eng10-q178',
      'eng10-skill-u1-r1', 'eng10-skill-u1-r2', 'eng10-skill-u1-r3', 'eng10-skill-u1-r4', 'eng10-skill-u1-r5',
      'eng10-exam-m1a-w1', 'eng10-exam-m1a-w2', 'eng10-exam-m1a-w3', 'eng10-exam-m1a-w4', 'eng10-exam-m1a-w5'
    ],
    createdAt: '2026-07-16T00:00:00.000Z'
  },
  {
    id: 'eng10-final1-a',
    subjectId: 'english',
    title: 'Cuối học kỳ I – Tiếng Anh 10 (Mã A)',
    duration: 60,
    kind: 'final',
    semester: 1,
    scopeTopicIds: ['eng10-t1', 'eng10-t2', 'eng10-t3', 'eng10-t4', 'eng10-t5'],
    totalPoints: 10,
    formCode: 'A',
    parallelFormGroup: 'eng10-final1',
    blueprintId: 'eng10-bp-final1',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Đề kiểm tra Language, Reading và Writing trong phạm vi Unit 1–5.'
    ],
    questionIds: [
      'eng10-q2', 'eng10-q6', 'eng10-q7', 'eng10-q10', 'eng10-q204', 'eng10-q52', 'eng10-q169',
      'eng10-q12', 'eng10-q127', 'eng10-q131', 'eng10-q17', 'eng10-q134', 'eng10-q57', 'eng10-q176',
      'eng10-q22', 'eng10-q141', 'eng10-q144', 'eng10-q27', 'eng10-q147', 'eng10-q62', 'eng10-q183',
      'eng10-q37', 'eng10-q31', 'eng10-q205', 'eng10-q66', 'eng10-q189', 'eng10-q60', 'eng10-q80',
      'eng10-q81', 'eng10-q180',
      'eng10-skill-u5-r1', 'eng10-skill-u5-r2', 'eng10-skill-u5-r3', 'eng10-skill-u5-r4', 'eng10-skill-u5-r5',
      'eng10-exam-f1a-w1', 'eng10-exam-f1a-w2', 'eng10-exam-f1a-w3', 'eng10-exam-f1a-w4', 'eng10-exam-f1a-w5'
    ],
    createdAt: '2026-07-16T00:00:00.000Z'
  },
  {
    id: 'eng10-midterm2-a',
    subjectId: 'english',
    title: 'Giữa học kỳ II – Tiếng Anh 10 (Mã A)',
    duration: 60,
    kind: 'midterm',
    semester: 2,
    scopeTopicIds: ['eng10-t6', 'eng10-t7', 'eng10-t8'],
    totalPoints: 10,
    formCode: 'A',
    parallelFormGroup: 'eng10-midterm2',
    blueprintId: 'eng10-bp-midterm2',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Đề kiểm tra Language, Reading và Writing trong phạm vi Unit 6–8.'
    ],
    questionIds: [
      'eng10-q229', 'eng10-q232', 'eng10-q238', 'eng10-q241', 'eng10-q244', 'eng10-q250', 'eng10-q253',
      'eng10-q256', 'eng10-q230', 'eng10-q235', 'eng10-q265', 'eng10-q268', 'eng10-q274', 'eng10-q277',
      'eng10-q280', 'eng10-q286', 'eng10-q289', 'eng10-q292', 'eng10-q290', 'eng10-q271', 'eng10-q301',
      'eng10-q304', 'eng10-q310', 'eng10-q313', 'eng10-q316', 'eng10-q322', 'eng10-q325', 'eng10-q326',
      'eng10-q246', 'eng10-q263',
      'eng10-skill-u6-r1', 'eng10-skill-u6-r2', 'eng10-skill-u6-r3', 'eng10-skill-u6-r4', 'eng10-skill-u6-r5',
      'eng10-exam-m2a-w1', 'eng10-exam-m2a-w2', 'eng10-exam-m2a-w3', 'eng10-exam-m2a-w4', 'eng10-exam-m2a-w5'
    ],
    createdAt: '2026-07-16T00:00:00.000Z'
  },
  {
    id: 'eng10-final2-a',
    subjectId: 'english',
    title: 'Cuối học kỳ II – Tiếng Anh 10 (Mã A)',
    duration: 60,
    kind: 'final',
    semester: 2,
    scopeTopicIds: ['eng10-t6', 'eng10-t7', 'eng10-t8', 'eng10-t9', 'eng10-t10'],
    totalPoints: 10,
    formCode: 'A',
    parallelFormGroup: 'eng10-final2',
    blueprintId: 'eng10-bp-final2',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Đề kiểm tra Language, Reading và Writing trong phạm vi Unit 6–10.'
    ],
    questionIds: [
      'eng10-q231', 'eng10-q233', 'eng10-q239', 'eng10-q242', 'eng10-q245', 'eng10-q254', 'eng10-q257',
      'eng10-q266', 'eng10-q269', 'eng10-q275', 'eng10-q278', 'eng10-q281', 'eng10-q291', 'eng10-q293',
      'eng10-q302', 'eng10-q305', 'eng10-q311', 'eng10-q314', 'eng10-q317', 'eng10-q327', 'eng10-q329',
      'eng10-q337', 'eng10-q340', 'eng10-q346', 'eng10-q349', 'eng10-q352', 'eng10-q373', 'eng10-q376',
      'eng10-q377', 'eng10-q382',
      'eng10-skill-u10-r1', 'eng10-skill-u10-r2', 'eng10-skill-u10-r3', 'eng10-skill-u10-r4', 'eng10-skill-u10-r5',
      'eng10-exam-f2a-w1', 'eng10-exam-f2a-w2', 'eng10-exam-f2a-w3', 'eng10-exam-f2a-w4', 'eng10-exam-f2a-w5'
    ],
    createdAt: '2026-07-16T00:00:00.000Z'
  },
  {
    id: 'eng10-midterm1-b',
    subjectId: 'english',
    title: 'Giữa học kỳ I – Tiếng Anh 10 (Mã B)',
    duration: 60,
    kind: 'midterm',
    semester: 1,
    scopeTopicIds: ['eng10-t1', 'eng10-t2', 'eng10-t3'],
    totalPoints: 10,
    formCode: 'B',
    parallelFormGroup: 'eng10-midterm1',
    blueprintId: 'eng10-bp-midterm1',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Mã B dùng ngữ liệu và câu Language khác mã A, nhưng giữ nguyên phạm vi Unit 1–3 và cấu trúc năng lực.'
    ],
    questionIds: [
      'eng10-q3', 'eng10-q4', 'eng10-q8', 'eng10-q53', 'eng10-q95', 'eng10-q97', 'eng10-q170',
      'eng10-q171', 'eng10-q173', 'eng10-q208', 'eng10-q13', 'eng10-q14', 'eng10-q15', 'eng10-q18',
      'eng10-q19', 'eng10-q103', 'eng10-q128', 'eng10-q129', 'eng10-q132', 'eng10-q138', 'eng10-q23',
      'eng10-q24', 'eng10-q25', 'eng10-q28', 'eng10-q111', 'eng10-q142', 'eng10-q223', 'eng10-q224',
      'eng10-q219', 'eng10-q179',
      'eng10-deep-u2-r1', 'eng10-deep-u2-r2', 'eng10-deep-u2-r3', 'eng10-deep-u2-r4', 'eng10-deep-u2-r5',
      'eng10-exam-m1b-w1', 'eng10-exam-m1b-w2', 'eng10-exam-m1b-w3', 'eng10-exam-m1b-w4', 'eng10-exam-m1b-w5'
    ],
    createdAt: '2026-07-29T00:00:00.000Z'
  },
  {
    id: 'eng10-final1-b',
    subjectId: 'english',
    title: 'Cuối học kỳ I – Tiếng Anh 10 (Mã B)',
    duration: 60,
    kind: 'final',
    semester: 1,
    scopeTopicIds: ['eng10-t1', 'eng10-t2', 'eng10-t3', 'eng10-t4', 'eng10-t5'],
    totalPoints: 10,
    formCode: 'B',
    parallelFormGroup: 'eng10-final1',
    blueprintId: 'eng10-bp-final1',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Mã B dùng ngữ liệu và câu Language khác mã A, nhưng giữ nguyên phạm vi Unit 1–5 và cấu trúc năng lực.'
    ],
    questionIds: [
      'eng10-q54', 'eng10-q55', 'eng10-q77', 'eng10-q78', 'eng10-q91', 'eng10-q174', 'eng10-q217',
      'eng10-q20', 'eng10-q58', 'eng10-q59', 'eng10-q135', 'eng10-q136', 'eng10-q177', 'eng10-q139',
      'eng10-q29', 'eng10-q30', 'eng10-q63', 'eng10-q150', 'eng10-q184', 'eng10-q185', 'eng10-q153',
      'eng10-q68', 'eng10-q69', 'eng10-q70', 'eng10-q32', 'eng10-q33', 'eng10-q109', 'eng10-q148',
      'eng10-q181', 'eng10-q209',
      'eng10-deep-u4-r1', 'eng10-deep-u4-r2', 'eng10-deep-u4-r3', 'eng10-deep-u4-r4', 'eng10-deep-u4-r5',
      'eng10-exam-f1b-w1', 'eng10-exam-f1b-w2', 'eng10-exam-f1b-w3', 'eng10-exam-f1b-w4', 'eng10-exam-f1b-w5'
    ],
    createdAt: '2026-07-29T00:00:00.000Z'
  },
  {
    id: 'eng10-midterm2-b',
    subjectId: 'english',
    title: 'Giữa học kỳ II – Tiếng Anh 10 (Mã B)',
    duration: 60,
    kind: 'midterm',
    semester: 2,
    scopeTopicIds: ['eng10-t6', 'eng10-t7', 'eng10-t8'],
    totalPoints: 10,
    formCode: 'B',
    parallelFormGroup: 'eng10-midterm2',
    blueprintId: 'eng10-bp-midterm2',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Mã B dùng ngữ liệu và câu Language khác mã A, nhưng giữ nguyên phạm vi Unit 6–8 và cấu trúc năng lực.'
    ],
    questionIds: [
      'eng10-q243', 'eng10-q255', 'eng10-q234', 'eng10-q236', 'eng10-q237', 'eng10-deep-u6-g1', 'eng10-deep-u6-g2',
      'eng10-q248', 'eng10-q240', 'eng10-q251', 'eng10-q267', 'eng10-q279', 'eng10-q270', 'eng10-q272',
      'eng10-q273', 'eng10-deep-u7-g1', 'eng10-deep-u7-g2', 'eng10-q284', 'eng10-q276', 'eng10-q287', 'eng10-q303',
      'eng10-q315', 'eng10-q306', 'eng10-q308', 'eng10-q309', 'eng10-deep-u8-g1', 'eng10-q247', 'eng10-q249',
      'eng10-q264', 'eng10-q299',
      'eng10-deep-u7-r1', 'eng10-deep-u7-r2', 'eng10-deep-u7-r3', 'eng10-deep-u7-r4', 'eng10-deep-u7-r5',
      'eng10-exam-m2b-w1', 'eng10-exam-m2b-w2', 'eng10-exam-m2b-w3', 'eng10-exam-m2b-w4', 'eng10-exam-m2b-w5'
    ],
    createdAt: '2026-07-29T00:00:00.000Z'
  },
  {
    id: 'eng10-final2-b',
    subjectId: 'english',
    title: 'Cuối học kỳ II – Tiếng Anh 10 (Mã B)',
    duration: 60,
    kind: 'final',
    semester: 2,
    scopeTopicIds: ['eng10-t6', 'eng10-t7', 'eng10-t8', 'eng10-t9', 'eng10-t10'],
    totalPoints: 10,
    formCode: 'B',
    parallelFormGroup: 'eng10-final2',
    blueprintId: 'eng10-bp-final2',
    assessmentVersion: '2026.3',
    resultReleasePolicy: 'after_submit',
    instructions: [
      ...integratedInstructions,
      'Mã B dùng ngữ liệu và câu Language khác mã A, nhưng giữ nguyên phạm vi Unit 6–10 và cấu trúc năng lực.'
    ],
    questionIds: [
      'eng10-deep-u6-g3', 'eng10-deep-u6-g4', 'eng10-q259', 'eng10-q260', 'eng10-q261', 'eng10-q252', 'eng10-q262',
      'eng10-deep-u7-g3', 'eng10-deep-u7-g4', 'eng10-q295', 'eng10-q296', 'eng10-q297', 'eng10-q288', 'eng10-q298',
      'eng10-deep-u8-g2', 'eng10-deep-u8-g3', 'eng10-q331', 'eng10-q332', 'eng10-q333', 'eng10-q324', 'eng10-q334',
      'eng10-q338', 'eng10-q339', 'eng10-q350', 'eng10-deep-u9-g1', 'eng10-q342', 'eng10-q374', 'eng10-q378',
      'eng10-q379', 'eng10-q383',
      'eng10-deep-u9-r1', 'eng10-deep-u9-r2', 'eng10-deep-u9-r3', 'eng10-deep-u9-r4', 'eng10-deep-u9-r5',
      'eng10-exam-f2b-w1', 'eng10-exam-f2b-w2', 'eng10-exam-f2b-w3', 'eng10-exam-f2b-w4', 'eng10-exam-f2b-w5'
    ],
    createdAt: '2026-07-29T00:00:00.000Z'
  }
];
