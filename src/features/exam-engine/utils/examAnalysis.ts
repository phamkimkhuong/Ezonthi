import { ExamResult, Question, QuestionType, Topic } from '@/types';

export interface QuestionTypeAnalysisItem {
  typeId: string;
  name: string;
  total: number;
  correct: number;
  earned: number;
  maximum: number;
  percent: number;
}

export interface TopicAnalysisItem {
  topicId: string;
  title: string;
  orderIndex: number;
  total: number;
  correct: number;
  earned: number;
  maximum: number;
  percent: number;
}

/**
 * Phân tích kết quả bài thi theo dạng bài (QuestionType)
 */
export const calculateExamAnalysis = (
  examQuestions: Question[],
  examResult: ExamResult | null,
  subjectQuestionTypes: QuestionType[]
): QuestionTypeAnalysisItem[] => {
  if (!examResult) return [];

  const analysis: Record<string, { name: string; total: number; correct: number; earned: number; maximum: number }> = {};

  examQuestions.forEach(q => {
    if (examResult.attempts[q.id]?.gradingStatus === 'pending') return;
    const type = subjectQuestionTypes.find(t => t.id === q.questionTypeId);
    const typeName = type?.name || 'Dạng bài khác';
    const typeId = q.questionTypeId;

    if (!analysis[typeId]) {
      analysis[typeId] = {
        name: typeName,
        total: 0,
        correct: 0,
        earned: 0,
        maximum: 0
      };
    }

    analysis[typeId].total += 1;
    analysis[typeId].earned += examResult.attempts[q.id]?.earnedPoints ?? 0;
    analysis[typeId].maximum += examResult.attempts[q.id]?.maxPoints ?? q.points ?? 1;
    if (examResult.attempts[q.id]?.isCorrect) {
      analysis[typeId].correct += 1;
    }
  });

  return Object.entries(analysis).map(([typeId, data]) => ({
    typeId,
    ...data,
    percent: data.maximum > 0 ? Math.round((data.earned / data.maximum) * 100) : 0
  }));
};

/**
 * Phân tích kết quả bài thi theo chuyên đề (Topic)
 */
export const calculateTopicAnalysis = (
  examQuestions: Question[],
  examResult: ExamResult | null,
  subjectTopics: Topic[]
): TopicAnalysisItem[] => {
  if (!examResult) return [];

  const analysis: Record<string, { title: string; orderIndex: number; total: number; correct: number; earned: number; maximum: number }> = {};

  examQuestions.forEach(question => {
    if (examResult.attempts[question.id]?.gradingStatus === 'pending') return;
    const topic = subjectTopics.find(item => item.id === question.topicId);
    if (!analysis[question.topicId]) {
      analysis[question.topicId] = {
        title: topic?.name ?? question.topicId,
        orderIndex: topic?.orderIndex ?? Number.MAX_SAFE_INTEGER,
        total: 0,
        correct: 0,
        earned: 0,
        maximum: 0
      };
    }
    analysis[question.topicId].total += 1;
    analysis[question.topicId].earned += examResult.attempts[question.id]?.earnedPoints ?? 0;
    analysis[question.topicId].maximum += examResult.attempts[question.id]?.maxPoints ?? question.points ?? 1;
    if (examResult.attempts[question.id]?.isCorrect) {
      analysis[question.topicId].correct += 1;
    }
  });

  return Object.entries(analysis)
    .map(([topicId, data]) => ({
      topicId,
      ...data,
      percent: data.maximum > 0 ? Math.round((data.earned / data.maximum) * 100) : 0
    }))
    .sort((a, b) => a.orderIndex - b.orderIndex);
};
