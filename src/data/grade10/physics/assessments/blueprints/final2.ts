import type { AssessmentBlueprint } from '@/types';

/** Ma trận mặc định cuối học kỳ II: năng lượng đến biến dạng vật rắn. */
export const physicsFinal2Blueprint: AssessmentBlueprint = {
  id: 'phy10-blueprint-final2-v1',
  subjectId: 'physics',
  title: 'Ma trận Cuối học kỳ II – Vật lí 10',
  kind: 'final',
  focus: 'mixed',
  duration: 45,
  totalPoints: 10,
  scopeTopicIds: ['phy10-t3', 'phy10-t4', 'phy10-t5', 'phy10-t6'],
  topicWeights: { 'phy10-t3': 0.25, 'phy10-t4': 0.2, 'phy10-t5': 0.275, 'phy10-t6': 0.275 },
  outcomeIds: [
    'PHY10-M3-O01', 'PHY10-M3-O02', 'PHY10-M3-O03', 'PHY10-M3-O04',
    'PHY10-M3-O05', 'PHY10-M3-O06', 'PHY10-M3-O07', 'PHY10-M3-O08',
    'PHY10-M4-O01', 'PHY10-M4-O02', 'PHY10-M4-O03', 'PHY10-M4-O04',
    'PHY10-M4-O05', 'PHY10-M4-O06',
    'PHY10-M5-O01', 'PHY10-M5-O02', 'PHY10-M5-O03', 'PHY10-M5-O04', 'PHY10-M5-O05',
    'PHY10-M6-O01', 'PHY10-M6-O02', 'PHY10-M6-O03', 'PHY10-M6-O04', 'PHY10-M6-O05'
  ],
  competencyWeights: {
    physical_cognition: 0.4125,
    physical_inquiry: 0.0125,
    physical_application: 0.575
  },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
