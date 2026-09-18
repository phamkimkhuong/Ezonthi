import type { AssessmentBlueprint } from '@/types';

export const biologyFinal2Blueprint: AssessmentBlueprint = {
  id: 'bio10-blueprint-final2-v1', subjectId: 'biology', title: 'Ma trận Cuối học kỳ II – Sinh học 10', kind: 'final', focus: 'mixed', duration: 45, totalPoints: 10,
  scopeTopicIds: ['bio10-t4', 'bio10-t5', 'bio10-t6', 'bio10-t7'], topicWeights: { 'bio10-t4': 0.1, 'bio10-t5': 0.1, 'bio10-t6': 0.4, 'bio10-t7': 0.4 },
  outcomeIds: [
    'BIO10-M4-O03', 'BIO10-M4-O06', 'BIO10-M5-O03', 'BIO10-M5-O06',
    'BIO10-M6-O01', 'BIO10-M6-O02', 'BIO10-M6-O03', 'BIO10-M6-O04', 'BIO10-M6-O05', 'BIO10-M6-O06', 'BIO10-M6-O07', 'BIO10-M6-O08', 'BIO10-M6-O09',
    'BIO10-M7-O01', 'BIO10-M7-O02', 'BIO10-M7-O03', 'BIO10-M7-O04', 'BIO10-M7-O05', 'BIO10-M7-O06', 'BIO10-M7-O07'
  ],
  competencyWeights: { biological_cognition: 0.4, biological_inquiry: 0.3, biological_application: 0.3 }, difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
