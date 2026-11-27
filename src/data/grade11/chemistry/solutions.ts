import type { Solution } from '@/types';
import { applyConvertedPracticeChoiceSolution } from '@/data/practiceChoiceUtils';
import { g11ChemistryPracticeChoices } from './practiceChoices';
import { g11ChemistryQuestions } from './questions';

const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });

const rawSolutions: Solution[] = Object.values(modules).flatMap(
  (mod: any) => mod.solutions || []
);

const g11ChemistryConvertedChoiceIds = new Set(
  g11ChemistryPracticeChoices.map(choice => choice.id)
);
const g11ChemistryQuestionById = new Map(
  g11ChemistryQuestions.map(question => [question.id, question])
);

export const g11ChemistrySolutions: Solution[] = rawSolutions.map(solution => (
  g11ChemistryConvertedChoiceIds.has(solution.questionId)
    ? applyConvertedPracticeChoiceSolution(solution, g11ChemistryQuestionById.get(solution.questionId))
    : solution
));
