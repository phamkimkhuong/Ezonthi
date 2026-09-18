import type { AssessmentBlueprint } from '@/types';

/** Ma trận mặc định cuối học kỳ I: đo lường, động học và động lực học. */
export const physicsFinal1Blueprint: AssessmentBlueprint = {
  id: 'phy10-blueprint-final1-v1',
  subjectId: 'physics',
  title: 'Ma trận Cuối học kỳ I – Vật lí 10',
  kind: 'final',
  focus: 'mixed',
  duration: 45,
  totalPoints: 10,
  scopeTopicIds: ['phy10-t0', 'phy10-t1', 'phy10-t2'],
  topicWeights: { 'phy10-t0': 0.1, 'phy10-t1': 0.6, 'phy10-t2': 0.3 },
  outcomeIds: [
    'PHY10-M0-O01', 'PHY10-M0-O02', 'PHY10-M0-O03', 'PHY10-M0-O04',
    'PHY10-M0-O05', 'PHY10-M0-O06', 'PHY10-M0-O07', 'PHY10-M0-O08',
    'PHY10-M1-O01', 'PHY10-M1-O02', 'PHY10-M1-O03', 'PHY10-M1-O04',
    'PHY10-M1-O05', 'PHY10-M1-O06', 'PHY10-M1-O07', 'PHY10-M1-O08',
    'PHY10-M1-O09', 'PHY10-M1-O10', 'PHY10-M1-O11', 'PHY10-M1-O12',
    'PHY10-M2-O01', 'PHY10-M2-O02', 'PHY10-M2-O03', 'PHY10-M2-O04',
    'PHY10-M2-O05', 'PHY10-M2-O06', 'PHY10-M2-O07', 'PHY10-M2-O08',
    'PHY10-M2-O09', 'PHY10-M2-O10', 'PHY10-M2-O11', 'PHY10-M2-O12',
    'PHY10-M2-O13', 'PHY10-M2-O14'
  ],
  competencyWeights: {
    physical_cognition: 0.45,
    physical_inquiry: 0.025,
    physical_application: 0.525
  },
  difficultyWeights: { easy: 0.3, medium: 0.5, hard: 0.2 },
  sections: [
    { id: 'mcq', title: 'Phần I. Trắc nghiệm nhiều lựa chọn', itemCount: 16, points: 4, responseType: 'multiple_choice' },
    { id: 'tf', title: 'Phần II. Trắc nghiệm Đúng/Sai', itemCount: 2, points: 2, responseType: 'true_false_cluster' },
    { id: 'short', title: 'Phần III. Trả lời ngắn', itemCount: 2, points: 4, responseType: 'short_answer' }
  ]
};
