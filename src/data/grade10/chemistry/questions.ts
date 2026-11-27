import type { Question } from '@/types';
import { applyConvertedPracticeChoice } from '@/data/practiceChoiceUtils';
import { g10ChemistryPracticeChoices } from './practiceChoices';
import { g10ChemistryPracticeMetadata } from './practiceMetadata';
import { normalizeChemistryPracticeChoice } from './practiceChoiceNormalizer';
import { g10ChemistryRemediationQuestions } from './practiceRemediation';

const modules = import.meta.glob('./modules/module*/index.ts', { eager: true });

const moduleQuestions: Question[] = Object.values(modules).flatMap(
  (mod: any) => mod.questions || []
);

const practiceMetadataByQuestionId = new Map(
  g10ChemistryPracticeMetadata.map(metadata => [metadata.questionId, metadata])
);

/** Aggregator: chỉ gộp module và gắn metadata theo ID, không chứa dữ liệu thô. */
const enrichedQuestions: Question[] = [...moduleQuestions, ...g10ChemistryRemediationQuestions].map(question => {
  const metadata = practiceMetadataByQuestionId.get(question.id);
  return metadata ? { ...question, ...metadata, id: question.id } : question;
});

/** Câu hiển thị: chuẩn hóa options legacy và hoán vị ổn định theo ID để tránh học tủ vị trí đáp án. */
const g10ChemistryChoiceById = new Map(
  g10ChemistryPracticeChoices.map(choice => [choice.id, choice])
);

export const g10ChemistryQuestions: Question[] = enrichedQuestions.map(question => {
  const convertedChoice = g10ChemistryChoiceById.get(question.id);
  return convertedChoice
    ? applyConvertedPracticeChoice(question, convertedChoice)
    : normalizeChemistryPracticeChoice(question);
});

export const g10ChemistryDisplayAnswerByQuestionId = new Map(
  g10ChemistryQuestions.map(question => [question.id, question.correctAnswer])
);
