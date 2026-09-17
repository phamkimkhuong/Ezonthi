import { Solution } from '@/types';
import { g10EnglishDeepeningSolutions } from './skillsDeepening';
import { g10EnglishSkillSolutions } from './skillsExpansion';
import { g10EnglishAssessmentWritingSolutions } from './assessments/writingQuestions';
import { g10EnglishDisplayAnswerByQuestionId } from './questions';
import { normalizeEnglishPracticeSolution } from './practiceChoiceNormalizer';

const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });

const sourceSolutions: Solution[] = [
  ...Object.values(modules).flatMap((mod: any) => mod.solutions || []),
  ...g10EnglishSkillSolutions,
  ...g10EnglishDeepeningSolutions,
  ...g10EnglishAssessmentWritingSolutions
];

export const g10EnglishSolutions: Solution[] = sourceSolutions.map(solution => (
  normalizeEnglishPracticeSolution(solution, g10EnglishDisplayAnswerByQuestionId.get(solution.questionId))
));
