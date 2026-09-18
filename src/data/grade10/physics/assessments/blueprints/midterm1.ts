import type { AssessmentBlueprint } from '@/types';

/**
 * Ma trận mặc định giữa học kỳ I: đo lường và phần chuyển động thẳng.
 * Nhà trường có thể thay đổi phạm vi theo tiến độ thực tế.
 */
export const physicsMidterm1Blueprint: AssessmentBlueprint = {
  id: 'phy10-blueprint-midterm1-v1',
  subjectId: 'physics',
  title: 'Ma trận Giữa học kỳ I – Vật lí 10',
  kind: 'midterm',
  focus: 'mixed',
  duration: 45,
  totalPoints: 10,
  scopeTopicIds: ['phy10-t0', 'phy10-t1'],
  topicWeights: { 'phy10-t0': 0.2, 'phy10-t1': 0.8 },
  outcomeIds: [
    'PHY10-M0-O01', 'PHY10-M0-O02', 'PHY10-M0-O03', 'PHY10-M0-O04',
    'PHY10-M0-O05', 'PHY10-M0-O06', 'PHY10-M0-O07', 'PHY10-M0-O08',
    'PHY10-M1-O01', 'PHY10-M1-O02', 'PHY10-M1-O03', 'PHY10-M1-O04',
    'PHY10-M1-O05', 'PHY10-M1-O06', 'PHY10-M1-O07', 'PHY10-M1-O08'
  ],
  competencyWeights: {
    physical_cognition: 0.525,
    physical_inquiry: 0.15,
    physical_application: 0.325
  },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
