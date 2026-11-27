import type { Question } from '@/types';
import { applyConvertedPracticeChoice } from '@/data/practiceChoiceUtils';
import { g11ChemistryPracticeChoices } from './practiceChoices';

const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });

const rawQuestions: Question[] = Object.values(modules).flatMap(
  (mod: any) => mod.questions || []
);

const g11ChemistryChoiceById = new Map(
  g11ChemistryPracticeChoices.map(choice => [choice.id, choice])
);

export const g11ChemistryQuestions: Question[] = rawQuestions.map(question =>
  applyConvertedPracticeChoice(question, g11ChemistryChoiceById.get(question.id))
);
