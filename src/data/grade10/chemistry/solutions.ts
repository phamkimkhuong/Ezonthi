import type { Solution } from '@/types';
import { applyConvertedPracticeChoiceSolution } from '@/data/practiceChoiceUtils';
import { g10ChemistryPracticeChoices } from './practiceChoices';
import { g10ChemistryDisplayAnswerByQuestionId, g10ChemistryQuestions } from './questions';
import { normalizeChemistryPracticeSolution } from './practiceChoiceNormalizer';
import { g10ChemistryRemediationSolutions } from './practiceRemediation';

const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });

const moduleSolutions: Solution[] = [
  ...Object.values(modules).flatMap((mod: any) => mod.solutions || []),
  ...g10ChemistryRemediationSolutions
];

const g10ChemistryConvertedChoiceIds = new Set(
  g10ChemistryPracticeChoices.map(choice => choice.id)
);
const g10ChemistryQuestionById = new Map(
  g10ChemistryQuestions.map(question => [question.id, question])
);

export const g10ChemistrySolutions: Solution[] = moduleSolutions.map(solution => (
  g10ChemistryConvertedChoiceIds.has(solution.questionId)
    ? applyConvertedPracticeChoiceSolution(solution, g10ChemistryQuestionById.get(solution.questionId))
    : normalizeChemistryPracticeSolution(solution, g10ChemistryDisplayAnswerByQuestionId.get(solution.questionId))
));
