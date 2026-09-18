import type { AssessmentBlueprint } from '@/types';

/** Ma trận mặc định giữa học kỳ II: năng lượng và động lượng. */
export const physicsMidterm2Blueprint: AssessmentBlueprint = {
  id: 'phy10-blueprint-midterm2-v1',
  subjectId: 'physics',
  title: 'Ma trận Giữa học kỳ II – Vật lí 10',
  kind: 'midterm',
  focus: 'mixed',
  duration: 45,
  totalPoints: 10,
  scopeTopicIds: ['phy10-t3', 'phy10-t4'],
  topicWeights: { 'phy10-t3': 0.55, 'phy10-t4': 0.45 },
  outcomeIds: [
    'PHY10-M3-O01', 'PHY10-M3-O02', 'PHY10-M3-O03', 'PHY10-M3-O04',
    'PHY10-M3-O05', 'PHY10-M3-O06', 'PHY10-M3-O07', 'PHY10-M3-O08',
    'PHY10-M4-O01', 'PHY10-M4-O02', 'PHY10-M4-O03', 'PHY10-M4-O04',
    'PHY10-M4-O05', 'PHY10-M4-O06'
  ],
  competencyWeights: {
    physical_cognition: 0.425,
    physical_inquiry: 0,
    physical_application: 0.575
  },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
