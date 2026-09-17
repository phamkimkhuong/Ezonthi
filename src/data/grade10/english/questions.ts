import { Question } from '@/types';
import { g10EnglishDeepeningQuestions } from './skillsDeepening';
import { g10EnglishSkillQuestions } from './skillsExpansion';
import { g10EnglishAssessmentWritingQuestions } from './assessments/writingQuestions';
import { normalizeEnglishPracticeChoice } from './practiceChoiceNormalizer';

const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });

const moduleQuestions: Question[] = Object.values(modules).flatMap(
  (mod: any) => mod.questions || []
);

const difficultyToCognitiveLevel = (
  difficulty: Question['difficulty']
): NonNullable<Question['cognitiveLevel']> => (
  difficulty === 'easy' ? 'recognition' : difficulty === 'medium' ? 'understanding' : 'application'
);

const enrichedQuestions: Question[] = [
  ...moduleQuestions.map(question => ({
    ...question,
    responseType: question.responseType ?? 'single_choice' as const,
    outcomeIds: question.outcomeIds ?? [`eng10-lo-u${question.topicId.replace('eng10-t', '')}-language`],
    competency: question.competency ?? 'english_language_knowledge' as const,
    cognitiveLevel: question.cognitiveLevel ?? difficultyToCognitiveLevel(question.difficulty),
    estimatedSeconds: question.estimatedSeconds ?? 60,
    representationType: question.representationType ?? 'text' as const
  })),
  ...g10EnglishSkillQuestions,
  ...g10EnglishDeepeningQuestions,
  ...g10EnglishAssessmentWritingQuestions
];

export const g10EnglishQuestions: Question[] = enrichedQuestions.map(normalizeEnglishPracticeChoice);

export const g10EnglishDisplayAnswerByQuestionId = new Map(
  g10EnglishQuestions.map(question => [question.id, question.correctAnswer])
);
