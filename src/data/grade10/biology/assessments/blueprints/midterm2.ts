import type { AssessmentBlueprint } from '@/types';

export const biologyMidterm2Blueprint: AssessmentBlueprint = {
  id: 'bio10-blueprint-midterm2-v1', subjectId: 'biology', title: 'Ma trận Giữa học kỳ II – Sinh học 10',
  kind: 'midterm', focus: 'mixed', duration: 45, totalPoints: 10,
  scopeTopicIds: ['bio10-t4', 'bio10-t5'], topicWeights: { 'bio10-t4': 0.5, 'bio10-t5': 0.5 },
  outcomeIds: [
    'BIO10-M4-O01', 'BIO10-M4-O02', 'BIO10-M4-O03', 'BIO10-M4-O04', 'BIO10-M4-O05', 'BIO10-M4-O06', 'BIO10-M4-O07',
    'BIO10-M5-O01', 'BIO10-M5-O02', 'BIO10-M5-O03', 'BIO10-M5-O04', 'BIO10-M5-O05', 'BIO10-M5-O06', 'BIO10-M5-O07', 'BIO10-M5-O08'
  ],
  competencyWeights: { biological_cognition: 0.4, biological_inquiry: 0.3, biological_application: 0.3 },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
