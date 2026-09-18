import type { AssessmentBlueprint } from '@/types';

/** Cuối HKI v1: tích lũy Module 0–3, trọng tâm cấu trúc tế bào và vận chuyển qua màng. */
export const biologyFinal1Blueprint: AssessmentBlueprint = {
  id: 'bio10-blueprint-final1-v1', subjectId: 'biology', title: 'Ma trận Cuối học kỳ I – Sinh học 10',
  kind: 'final', focus: 'mixed', duration: 45, totalPoints: 10,
  scopeTopicIds: ['bio10-t0', 'bio10-t1', 'bio10-t2', 'bio10-t3'],
  topicWeights: { 'bio10-t0': 0.1, 'bio10-t1': 0.15, 'bio10-t2': 0.35, 'bio10-t3': 0.4 },
  outcomeIds: [
    'BIO10-M0-O04', 'BIO10-M0-O06', 'BIO10-M1-O02', 'BIO10-M1-O04', 'BIO10-M1-O05', 'BIO10-M1-O06',
    'BIO10-M2-O01', 'BIO10-M2-O02', 'BIO10-M2-O03', 'BIO10-M2-O04', 'BIO10-M2-O05', 'BIO10-M2-O06', 'BIO10-M2-O07', 'BIO10-M2-O08',
    'BIO10-M3-O01', 'BIO10-M3-O02', 'BIO10-M3-O03', 'BIO10-M3-O04', 'BIO10-M3-O05', 'BIO10-M3-O06', 'BIO10-M3-O07'
  ],
  competencyWeights: { biological_cognition: 0.4, biological_inquiry: 0.3, biological_application: 0.3 },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
