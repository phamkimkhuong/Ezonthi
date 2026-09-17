import { AssessmentBlueprint, Question } from '@/types';

export type ExamQuestionEntry = { question: Question; index: number };

export type ExamSectionView = {
  id: string;
  title?: string;
  expectedItemCount?: number;
  points?: number;
  entries: ExamQuestionEntry[];
};

export const questionMatchesBlueprintSection = (
  question: Question,
  section: AssessmentBlueprint['sections'][number]
): boolean => {
  const competencyBySectionId: Record<string, Question['competency'][]> = {
    language: ['english_language_knowledge'],
    reading: ['english_reading'],
    listening: ['english_listening'],
    writing: ['english_writing'],
    speaking: ['english_speaking', 'english_interaction']
  };
  const expectedCompetencies = competencyBySectionId[section.id];
  if (expectedCompetencies && question.competency) {
    return expectedCompetencies.includes(question.competency);
  }
  if (section.responseType === 'multiple_choice') {
    return question.responseType === 'single_choice' || (!question.responseType && Boolean(question.options?.length));
  }
  return question.responseType === section.responseType;
};

/**
 * Blueprint quyết định cách trình bày đề, nhưng không được làm thất lạc câu hỏi.
 * Câu chưa ánh xạ được sẽ được giữ ở một phần dự phòng để lỗi metadata có thể nhìn thấy.
 */
export const buildExamSections = (
  questions: Question[],
  blueprint?: AssessmentBlueprint
): ExamSectionView[] => {
  const entries = questions.map((question, index) => ({ question, index }));
  if (!blueprint) return [{ id: 'all-questions', entries }];

  const assignedQuestionIds = new Set<string>();
  const sections: ExamSectionView[] = blueprint.sections.map(section => {
    const sectionEntries = entries.filter(entry => {
      if (assignedQuestionIds.has(entry.question.id)) return false;
      if (!questionMatchesBlueprintSection(entry.question, section)) return false;
      assignedQuestionIds.add(entry.question.id);
      return true;
    });

    return {
      id: section.id,
      title: section.title,
      expectedItemCount: section.itemCount,
      points: section.points,
      entries: sectionEntries
    };
  }).filter(section => section.entries.length > 0);

  const unmatchedEntries = entries.filter(entry => !assignedQuestionIds.has(entry.question.id));
  if (unmatchedEntries.length > 0) {
    sections.push({
      id: 'unmapped-questions',
      title: 'Phần bổ sung',
      expectedItemCount: unmatchedEntries.length,
      entries: unmatchedEntries
    });
  }

  return sections;
};

export const buildQuestionPointMap = (sections: ExamSectionView[]): Map<string, number> => {
  const pointsByQuestionId = new Map<string, number>();
  for (const section of sections) {
    if (section.entries.length === 0) continue;
    if (section.points === undefined) {
      for (const { question } of section.entries) {
        pointsByQuestionId.set(question.id, question.points ?? 1);
      }
      continue;
    }
    const pointsPerItem = section.points / section.entries.length;
    for (const { question } of section.entries) {
      pointsByQuestionId.set(question.id, pointsPerItem);
    }
  }
  return pointsByQuestionId;
};
