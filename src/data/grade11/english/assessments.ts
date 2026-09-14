import type { AssessmentBlueprint, MockExam, Question, Solution } from '@/types';

const topics = (units: number[]) => units.map(unit => `eng11-topic-u${unit}`);
const outcomes = (units: number[]) => units.flatMap(unit =>
  ['pronunciation', 'vocabulary', 'grammar', 'reading', 'writing', 'communication']
    .map(kind => `eng11-out-u${unit}-${kind}`)
);
const sections = [
  { id: 'language', title: 'Language and Communication', itemCount: 24, points: 6, responseType: 'multiple_choice' as const },
  { id: 'reading', title: 'Reading', itemCount: 8, points: 2, responseType: 'multiple_choice' as const },
  { id: 'writing', title: 'Indirect Writing', itemCount: 8, points: 2, responseType: 'multiple_choice' as const }
];

export const g11EnglishAssessmentBlueprints: AssessmentBlueprint[] = [
  {
    id: 'eng11-bp-midterm1', subjectId: 'english',
    title: 'Blueprint giữa học kỳ I – Tiếng Anh 11 (Mã A/B)',
    kind: 'midterm', focus: 'mixed', difficultyBand: 'standard',
    targetScoreRange: { min: 0, max: 10 }, semester: 1, duration: 60,
    totalPoints: 10, scopeTopicIds: topics([1, 2, 3]), outcomeIds: outcomes([1, 2, 3]),
    competencyWeights: { english_language_knowledge: 0.6, english_reading: 0.2, english_writing: 0.2 },
    difficultyWeights: { easy: 0.35, medium: 0.4, hard: 0.25 }, sections
  },
  {
    id: 'eng11-bp-final1', subjectId: 'english',
    title: 'Blueprint cuối học kỳ I – Tiếng Anh 11 (Mã A/B)',
    kind: 'final', focus: 'mixed', difficultyBand: 'standard',
    targetScoreRange: { min: 0, max: 10 }, semester: 1, duration: 60,
    totalPoints: 10, scopeTopicIds: topics([1, 2, 3, 4, 5]), outcomeIds: outcomes([1, 2, 3, 4, 5]),
    competencyWeights: { english_language_knowledge: 0.6, english_reading: 0.2, english_writing: 0.2 },
    difficultyWeights: { easy: 0.35, medium: 0.4, hard: 0.25 }, sections
  },
  {
    id: 'eng11-bp-midterm2', subjectId: 'english',
    title: 'Blueprint giữa học kỳ II – Tiếng Anh 11 (Mã A/B)',
    kind: 'midterm', focus: 'mixed', difficultyBand: 'standard',
    targetScoreRange: { min: 0, max: 10 }, semester: 2, duration: 60,
    totalPoints: 10, scopeTopicIds: topics([6, 7, 8]), outcomeIds: outcomes([6, 7, 8]),
    competencyWeights: { english_language_knowledge: 0.6, english_reading: 0.2, english_writing: 0.2 },
    difficultyWeights: { easy: 0.35, medium: 0.4, hard: 0.25 }, sections
  },
  {
    id: 'eng11-bp-final2', subjectId: 'english',
    title: 'Blueprint cuối học kỳ II – Tiếng Anh 11 (Mã A/B)',
    kind: 'final', focus: 'mixed', difficultyBand: 'standard',
    targetScoreRange: { min: 0, max: 10 }, semester: 2, duration: 60,
    totalPoints: 10, scopeTopicIds: topics([6, 7, 8, 9, 10]), outcomeIds: outcomes([6, 7, 8, 9, 10]),
    competencyWeights: { english_language_knowledge: 0.6, english_reading: 0.2, english_writing: 0.2 },
    difficultyWeights: { easy: 0.35, medium: 0.4, hard: 0.25 }, sections
  }
];

const instructions = [
  'Đề gồm 40 câu trắc nghiệm, mỗi câu 0,25 điểm; thời gian làm bài 60 phút.',
  'Đề kiểm tra Language, Communication, Reading và Writing gián tiếp; không có Listening hoặc Speaking.',
  'Mỗi câu chỉ có một đáp án đúng; đáp án và lời giải hiển thị sau khi nộp bài.'
];

export const g11EnglishAssessmentExams: MockExam[] = [
  {
    id: 'eng11-midterm1-a', subjectId: 'english',
    title: 'Giữa học kỳ I – Tiếng Anh 11 (Mã A)', duration: 60,
    kind: 'midterm', semester: 1, scopeTopicIds: topics([1, 2, 3]),
    totalPoints: 10, formCode: 'A', parallelFormGroup: 'eng11-midterm1',
    blueprintId: 'eng11-bp-midterm1', assessmentVersion: '2026.4',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u2-comm-01', 'eng11-q-u1-pron-09', 'eng11-q-u1-comm-09', 'eng11-q-u1-comm-01',
      'eng11-q-u1-comm-12', 'eng11-q-u3-vocab-11', 'eng11-q-u3-reading-01', 'eng11-q-u3-writing-07',
      'eng11-q-u2-grammar-07', 'eng11-q-u3-comm-04', 'eng11-q-u1-comm-08', 'eng11-q-u2-writing-02',
      'eng11-q-u1-comm-11', 'eng11-q-u3-comm-06', 'eng11-q-u2-comm-05', 'eng11-q-u3-grammar-10',
      'eng11-q-u2-grammar-06', 'eng11-q-u3-writing-02', 'eng11-q-u3-grammar-11', 'eng11-q-u1-comm-04',
      'eng11-q-u3-reading-07', 'eng11-q-u2-grammar-11', 'eng11-q-u2-writing-09', 'eng11-q-u2-pron-08',
      'eng11-q-u2-grammar-09', 'eng11-q-u1-pron-11', 'eng11-q-u1-grammar-10', 'eng11-q-u3-writing-12',
      'eng11-q-u3-reading-04', 'eng11-q-u1-writing-03', 'eng11-q-u3-vocab-07', 'eng11-q-u1-vocab-06',
      'eng11-q-u3-grammar-12', 'eng11-q-u3-writing-04', 'eng11-q-u3-writing-08', 'eng11-q-u1-reading-06',
      'eng11-q-u1-reading-03', 'eng11-q-u3-reading-03', 'eng11-q-u1-reading-04', 'eng11-q-u2-reading-03'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-midterm1-b', subjectId: 'english',
    title: 'Giữa học kỳ I – Tiếng Anh 11 (Mã B)', duration: 60,
    kind: 'midterm', semester: 1, scopeTopicIds: topics([1, 2, 3]),
    totalPoints: 10, formCode: 'B', parallelFormGroup: 'eng11-midterm1',
    blueprintId: 'eng11-bp-midterm1', assessmentVersion: '2026.4',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u1-pron-04', 'eng11-q-u3-comm-05', 'eng11-q-u2-reading-12', 'eng11-q-u1-writing-05',
      'eng11-q-u2-grammar-12', 'eng11-q-u2-pron-06', 'eng11-q-u2-grammar-01', 'eng11-q-u2-comm-12',
      'eng11-q-u3-vocab-09', 'eng11-q-u1-grammar-08', 'eng11-q-u3-grammar-01', 'eng11-q-u3-pron-05',
      'eng11-q-u3-comm-12', 'eng11-q-u3-pron-01', 'eng11-q-u3-grammar-09', 'eng11-q-u3-grammar-03',
      'eng11-q-u3-pron-07', 'eng11-q-u1-comm-02', 'eng11-q-u2-reading-06', 'eng11-q-u2-pron-05',
      'eng11-q-u2-grammar-08', 'eng11-q-u1-writing-09', 'eng11-q-u2-reading-01', 'eng11-q-u1-comm-03',
      'eng11-q-u1-pron-06', 'eng11-q-u1-pron-08', 'eng11-q-u3-pron-11', 'eng11-q-u2-writing-06',
      'eng11-q-u3-comm-09', 'eng11-q-u1-pron-12', 'eng11-q-u3-reading-02', 'eng11-q-u1-writing-11',
      'eng11-q-u2-reading-02', 'eng11-q-u3-writing-03', 'eng11-q-u2-reading-04', 'eng11-q-u3-reading-12',
      'eng11-q-u1-writing-02', 'eng11-q-u2-reading-11', 'eng11-q-u3-writing-10', 'eng11-q-u1-writing-04'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-final1-a', subjectId: 'english',
    title: 'Cuối học kỳ I – Tiếng Anh 11 (Mã A)', duration: 60,
    kind: 'final', semester: 1, scopeTopicIds: topics([1, 2, 3, 4, 5]),
    totalPoints: 10, formCode: 'A', parallelFormGroup: 'eng11-final1',
    blueprintId: 'eng11-bp-final1', assessmentVersion: '2026.4',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u3-reading-01', 'eng11-q-u5-communication-06', 'eng11-q-u2-reading-04', 'eng11-q-u1-writing-01',
      'eng11-q-u1-pron-06', 'eng11-q-u3-comm-09', 'eng11-q-u2-pron-05', 'eng11-q-u2-comm-12',
      'eng11-q-u3-vocab-03', 'eng11-q-u3-comm-05', 'eng11-q-u1-vocab-10', 'eng11-q-u3-comm-03',
      'eng11-q-u1-reading-07', 'eng11-q-u4-writing-08', 'eng11-q-u2-pron-08', 'eng11-q-u4-pron-02',
      'eng11-q-u3-reading-06', 'eng11-q-u5-writing-02', 'eng11-q-u3-grammar-09', 'eng11-q-u5-grammar-01',
      'eng11-q-u3-comm-06', 'eng11-q-u2-pron-02', 'eng11-q-u3-pron-07', 'eng11-q-u4-writing-09',
      'eng11-q-u1-reading-08', 'eng11-q-u2-grammar-08', 'eng11-q-u5-writing-11', 'eng11-q-u2-comm-04',
      'eng11-q-u3-reading-08', 'eng11-q-u2-writing-12', 'eng11-q-u2-writing-02', 'eng11-q-u5-grammar-03',
      'eng11-q-u4-pron-03', 'eng11-q-u5-reading-02', 'eng11-q-u1-vocab-11', 'eng11-q-u3-reading-12',
      'eng11-q-u2-comm-11', 'eng11-q-u5-pronunciation-11', 'eng11-q-u1-pron-10', 'eng11-q-u4-writing-12'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-final1-b', subjectId: 'english',
    title: 'Cuối học kỳ I – Tiếng Anh 11 (Mã B)', duration: 60,
    kind: 'final', semester: 1, scopeTopicIds: topics([1, 2, 3, 4, 5]),
    totalPoints: 10, formCode: 'B', parallelFormGroup: 'eng11-final1',
    blueprintId: 'eng11-bp-final1', assessmentVersion: '2026.4',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u1-grammar-09', 'eng11-q-u1-reading-10', 'eng11-q-u1-vocab-06', 'eng11-q-u5-communication-04',
      'eng11-q-u1-grammar-12', 'eng11-q-u4-comm-05', 'eng11-q-u5-grammar-12', 'eng11-q-u5-reading-04',
      'eng11-q-u4-comm-12', 'eng11-q-u2-vocab-04', 'eng11-q-u4-comm-07', 'eng11-q-u1-pron-11',
      'eng11-q-u4-comm-09', 'eng11-q-u5-communication-11', 'eng11-q-u5-grammar-09', 'eng11-q-u4-writing-02',
      'eng11-q-u1-vocab-09', 'eng11-q-u1-vocab-12', 'eng11-q-u5-vocabulary-11', 'eng11-q-u1-comm-06',
      'eng11-q-u2-pron-11', 'eng11-q-u5-communication-09', 'eng11-q-u1-pron-02', 'eng11-q-u2-pron-10',
      'eng11-q-u1-writing-06', 'eng11-q-u4-reading-03', 'eng11-q-u4-reading-06', 'eng11-q-u3-writing-01',
      'eng11-q-u1-pron-08', 'eng11-q-u4-writing-01', 'eng11-q-u2-vocab-03', 'eng11-q-u3-pron-05',
      'eng11-q-u4-writing-07', 'eng11-q-u3-reading-05', 'eng11-q-u3-reading-04', 'eng11-q-u5-writing-03',
      'eng11-q-u4-writing-03', 'eng11-q-u1-writing-04', 'eng11-q-u1-reading-02', 'eng11-q-u4-reading-08'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-midterm2-a', subjectId: 'english',
    title: 'Giữa học kỳ II – Tiếng Anh 11 (Mã A)', duration: 60,
    kind: 'midterm', semester: 2, scopeTopicIds: topics([6, 7, 8]),
    totalPoints: 10, formCode: 'A', parallelFormGroup: 'eng11-midterm2',
    blueprintId: 'eng11-bp-midterm2', assessmentVersion: '2026.5',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u8-grammar-02', 'eng11-q-u8-reading-08', 'eng11-q-u8-writing-03', 'eng11-q-u8-writing-09',
      'eng11-q-u8-vocabulary-07', 'eng11-q-u7-reading-06', 'eng11-q-u7-reading-05', 'eng11-q-u8-writing-07',
      'eng11-q-u8-pronunciation-09', 'eng11-q-u7-writing-09', 'eng11-q-u8-communication-12', 'eng11-q-u8-communication-03',
      'eng11-q-u7-writing-04', 'eng11-q-u8-writing-06', 'eng11-q-u7-vocabulary-04', 'eng11-q-u7-pronunciation-07',
      'eng11-q-u6-pronunciation-12', 'eng11-q-u6-vocabulary-10', 'eng11-q-u8-vocabulary-02', 'eng11-q-u7-writing-05',
      'eng11-q-u6-reading-11', 'eng11-q-u7-vocabulary-10', 'eng11-q-u8-communication-02', 'eng11-q-u6-pronunciation-10',
      'eng11-q-u6-reading-05', 'eng11-q-u8-vocabulary-08', 'eng11-q-u7-communication-01', 'eng11-q-u6-vocabulary-06',
      'eng11-q-u6-vocabulary-08', 'eng11-q-u7-pronunciation-04', 'eng11-q-u6-grammar-01', 'eng11-q-u7-writing-01',
      'eng11-q-u7-vocabulary-06', 'eng11-q-u7-vocabulary-11', 'eng11-q-u7-grammar-03', 'eng11-q-u7-reading-04',
      'eng11-q-u6-pronunciation-11', 'eng11-q-u8-pronunciation-11', 'eng11-q-u8-reading-01', 'eng11-q-u6-reading-12'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-midterm2-b', subjectId: 'english',
    title: 'Giữa học kỳ II – Tiếng Anh 11 (Mã B)', duration: 60,
    kind: 'midterm', semester: 2, scopeTopicIds: topics([6, 7, 8]),
    totalPoints: 10, formCode: 'B', parallelFormGroup: 'eng11-midterm2',
    blueprintId: 'eng11-bp-midterm2', assessmentVersion: '2026.5',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u6-writing-07', 'eng11-q-u7-reading-02', 'eng11-q-u7-grammar-12', 'eng11-q-u6-vocabulary-02',
      'eng11-q-u6-reading-01', 'eng11-q-u6-vocabulary-01', 'eng11-q-u7-reading-09', 'eng11-q-u6-vocabulary-03',
      'eng11-q-u8-vocabulary-05', 'eng11-q-u6-reading-09', 'eng11-q-u6-grammar-10', 'eng11-q-u8-communication-11',
      'eng11-q-u6-reading-08', 'eng11-q-u6-writing-04', 'eng11-q-u8-writing-05', 'eng11-q-u6-pronunciation-08',
      'eng11-q-u8-communication-06', 'eng11-q-u8-reading-03', 'eng11-q-u7-writing-08', 'eng11-q-u8-communication-08',
      'eng11-q-u6-pronunciation-05', 'eng11-q-u8-pronunciation-07', 'eng11-q-u6-reading-06', 'eng11-q-u6-pronunciation-09',
      'eng11-q-u7-reading-08', 'eng11-q-u6-vocabulary-04', 'eng11-q-u6-grammar-05', 'eng11-q-u8-vocabulary-12',
      'eng11-q-u8-writing-04', 'eng11-q-u6-pronunciation-03', 'eng11-q-u6-grammar-11', 'eng11-q-u6-vocabulary-11',
      'eng11-q-u7-grammar-02', 'eng11-q-u8-pronunciation-01', 'eng11-q-u6-writing-02', 'eng11-q-u7-pronunciation-03',
      'eng11-q-u6-writing-10', 'eng11-q-u8-grammar-11', 'eng11-q-u7-communication-10', 'eng11-q-u8-writing-10'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-final2-a', subjectId: 'english',
    title: 'Cuối học kỳ II – Tiếng Anh 11 (Mã A)', duration: 60,
    kind: 'final', semester: 2, scopeTopicIds: topics([6, 7, 8, 9, 10]),
    totalPoints: 10, formCode: 'A', parallelFormGroup: 'eng11-final2',
    blueprintId: 'eng11-bp-final2', assessmentVersion: '2026.6',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u6-pronunciation-01', 'eng11-q-u7-reading-03', 'eng11-q-u6-writing-04', 'eng11-q-u6-reading-02',
      'eng11-q-u8-writing-02', 'eng11-q-u10-communication-04', 'eng11-q-u7-vocabulary-01', 'eng11-q-u9-writing-03',
      'eng11-q-u10-pronunciation-03', 'eng11-q-u9-communication-01', 'eng11-q-u9-grammar-02', 'eng11-q-u9-reading-04',
      'eng11-q-u8-writing-08', 'eng11-q-u10-vocabulary-02', 'eng11-q-u8-grammar-07', 'eng11-q-u10-grammar-01',
      'eng11-q-u7-communication-06', 'eng11-q-u6-grammar-05', 'eng11-q-u9-vocabulary-08', 'eng11-q-u9-reading-07',
      'eng11-q-u10-writing-07', 'eng11-q-u10-grammar-08', 'eng11-q-u7-pronunciation-09', 'eng11-q-u9-reading-06',
      'eng11-q-u8-communication-05', 'eng11-q-u7-vocabulary-08', 'eng11-q-u6-communication-11', 'eng11-q-u10-writing-06',
      'eng11-q-u8-communication-12', 'eng11-q-u7-writing-11', 'eng11-q-u6-vocabulary-10', 'eng11-q-u9-vocabulary-09',
      'eng11-q-u9-grammar-10', 'eng11-q-u9-pronunciation-11', 'eng11-q-u10-reading-05', 'eng11-q-u9-communication-12',
      'eng11-q-u10-reading-11', 'eng11-q-u10-reading-10', 'eng11-q-u10-communication-12', 'eng11-q-u9-writing-05'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  },
  {
    id: 'eng11-final2-b', subjectId: 'english',
    title: 'Cuối học kỳ II – Tiếng Anh 11 (Mã B)', duration: 60,
    kind: 'final', semester: 2, scopeTopicIds: topics([6, 7, 8, 9, 10]),
    totalPoints: 10, formCode: 'B', parallelFormGroup: 'eng11-final2',
    blueprintId: 'eng11-bp-final2', assessmentVersion: '2026.6',
    resultReleasePolicy: 'after_submit', instructions,
    questionIds: [
      'eng11-q-u7-reading-04', 'eng11-q-u6-vocabulary-01', 'eng11-q-u6-reading-03', 'eng11-q-u6-grammar-02',
      'eng11-q-u8-communication-03', 'eng11-q-u7-writing-02', 'eng11-q-u8-grammar-04', 'eng11-q-u7-grammar-01',
      'eng11-q-u8-vocabulary-02', 'eng11-q-u10-vocabulary-03', 'eng11-q-u8-reading-01', 'eng11-q-u10-writing-04',
      'eng11-q-u10-writing-01', 'eng11-q-u6-reading-08', 'eng11-q-u9-pronunciation-02', 'eng11-q-u7-grammar-07',
      'eng11-q-u9-communication-07', 'eng11-q-u6-communication-05', 'eng11-q-u7-communication-08', 'eng11-q-u8-reading-06',
      'eng11-q-u9-writing-06', 'eng11-q-u9-writing-08', 'eng11-q-u10-reading-07', 'eng11-q-u7-reading-05',
      'eng11-q-u10-pronunciation-08', 'eng11-q-u6-writing-11', 'eng11-q-u10-communication-06', 'eng11-q-u8-vocabulary-09',
      'eng11-q-u9-grammar-05', 'eng11-q-u7-vocabulary-10', 'eng11-q-u8-pronunciation-11', 'eng11-q-u6-writing-12',
      'eng11-q-u8-grammar-10', 'eng11-q-u10-pronunciation-09', 'eng11-q-u7-pronunciation-12', 'eng11-q-u9-vocabulary-11',
      'eng11-q-u10-vocabulary-12', 'eng11-q-u9-reading-10', 'eng11-q-u10-writing-09', 'eng11-q-u10-grammar-11'
    ],
    createdAt: '2026-07-30T00:00:00.000Z'
  }
];

// Đề tái sử dụng câu core đã được kiểm định; đáp án/lời giải lấy từ ngân hàng module.
export const g11EnglishAssessmentQuestions: Question[] = [];
export const g11EnglishAssessmentSolutions: Solution[] = [];

export const g11EnglishAssessmentPlan = {
  status: 'interim-core-bank' as const,
  currentVersions: ['2026.4', '2026.6'],
  currentExamCount: 8,
  currentItemModel: 'Các đề dùng lại câu core đã qua validator và lấy lời giải từ module.',
  targetVersion: '2027.1',
  targetIndependentQuestionCount: 320,
  releaseGates: [
    'Mỗi kỳ có đúng hai mã A/B, 40 câu và không trùng câu giữa hai mã.',
    'Mỗi đề giữ tỷ lệ 24 Language/Communication, 8 Reading và 8 Indirect Writing.',
    'Đáp án A/B/C/D cân bằng 10/10/10/10; độ khó 14 easy, 16 medium, 10 hard.',
    'Toàn bộ câu có lời giải độc lập, dẫn chứng đọc hiểu và qua biên tập chéo.'
  ]
} as const;
