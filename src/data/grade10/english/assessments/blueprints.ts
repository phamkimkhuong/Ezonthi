import type { AssessmentBlueprint } from '@/types';

interface EnglishAssessmentSpec {
  id: string;
  title: string;
  kind: 'midterm' | 'final';
  semester: 1 | 2;
  duration: number;
  scopeTopicIds: string[];
  languageItemCount: number;
}

const specs: EnglishAssessmentSpec[] = [
  { id: 'eng10-bp-midterm1', title: 'Blueprint giữa học kỳ I – Tiếng Anh 10 (Mã A/B)', kind: 'midterm', semester: 1, duration: 60, scopeTopicIds: ['eng10-t1', 'eng10-t2', 'eng10-t3'], languageItemCount: 30 },
  { id: 'eng10-bp-final1', title: 'Blueprint cuối học kỳ I – Tiếng Anh 10 (Mã A/B)', kind: 'final', semester: 1, duration: 60, scopeTopicIds: ['eng10-t1', 'eng10-t2', 'eng10-t3', 'eng10-t4', 'eng10-t5'], languageItemCount: 30 },
  { id: 'eng10-bp-midterm2', title: 'Blueprint giữa học kỳ II – Tiếng Anh 10 (Mã A/B)', kind: 'midterm', semester: 2, duration: 60, scopeTopicIds: ['eng10-t6', 'eng10-t7', 'eng10-t8'], languageItemCount: 30 },
  { id: 'eng10-bp-final2', title: 'Blueprint cuối học kỳ II – Tiếng Anh 10 (Mã A/B)', kind: 'final', semester: 2, duration: 60, scopeTopicIds: ['eng10-t6', 'eng10-t7', 'eng10-t8', 'eng10-t9', 'eng10-t10'], languageItemCount: 30 }
];

export const g10EnglishAssessmentBlueprints: AssessmentBlueprint[] = specs.map(spec => ({
  id: spec.id,
  subjectId: 'english',
  title: spec.title,
  kind: spec.kind,
  focus: 'mixed',
  difficultyBand: 'standard',
  targetScoreRange: { min: 0, max: 10 },
  semester: spec.semester,
  duration: spec.duration,
  totalPoints: 10,
  scopeTopicIds: spec.scopeTopicIds,
  outcomeIds: spec.scopeTopicIds.flatMap(topicId => {
    const unit = topicId.replace('eng10-t', '');
    return ['language', 'reading', 'writing'].map(skill => `eng10-lo-u${unit}-${skill}`);
  }),
  competencyWeights: {
    english_language_knowledge: 0.75,
    english_reading: 0.125,
    english_writing: 0.125
  },
  difficultyWeights: { easy: 0.35, medium: 0.4, hard: 0.25 },
  sections: [
    { id: 'language', title: 'Language: Grammar, Vocabulary & Pronunciation', itemCount: spec.languageItemCount, points: 7.5, responseType: 'multiple_choice' },
    { id: 'reading', title: 'Reading', itemCount: 5, points: 1.25, responseType: 'multiple_choice' },
    { id: 'writing', title: 'Writing: Sentence Transformation & Combination', itemCount: 5, points: 1.25, responseType: 'multiple_choice' }
  ]
}));
