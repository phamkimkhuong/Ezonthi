import type { AssessmentBlueprint } from '@/types';

/**
 * Ma trận mặc định cho Giữa học kỳ I. Phạm vi có thể đổi theo kế hoạch dạy học
 * của trường; bản v1 giả định học sinh đã hoàn thành Module 0 và Module 1.
 */
export const biologyMidterm1Blueprint: AssessmentBlueprint = {
  id: 'bio10-blueprint-midterm1-v1',
  subjectId: 'biology',
  title: 'Ma trận Giữa học kỳ I – Sinh học 10',
  kind: 'midterm',
  focus: 'mixed',
  duration: 45,
  totalPoints: 10,
  scopeTopicIds: ['bio10-t0', 'bio10-t1'],
  topicWeights: { 'bio10-t0': 0.3, 'bio10-t1': 0.7 },
  outcomeIds: [
    'BIO10-M0-O01', 'BIO10-M0-O02', 'BIO10-M0-O03', 'BIO10-M0-O04', 'BIO10-M0-O05', 'BIO10-M0-O06',
    'BIO10-M1-O01', 'BIO10-M1-O02', 'BIO10-M1-O03', 'BIO10-M1-O04', 'BIO10-M1-O05', 'BIO10-M1-O06',
    'BIO10-M1-O07', 'BIO10-M1-O08'
  ],
  competencyWeights: {
    biological_cognition: 0.4,
    biological_inquiry: 0.3,
    biological_application: 0.3
  },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
