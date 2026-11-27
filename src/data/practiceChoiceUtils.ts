import type { Question, Solution } from '@/types';

export interface ConvertedPracticeChoice {
  id: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

const DEFAULT_PROMPT_REWRITES: Array<[RegExp, string]> = [
  [/^Viết công thức tối giản của /i, 'Chọn công thức tối giản của '],
  [/\s*Chỉ nhập giá trị số\./gi, ''],
  [/\s*Chỉ nhập giá trị thập phân\./gi, ''],
  [/\s*Chỉ nhập số\./gi, ''],
  [/\s*Chỉ điền số\./gi, ''],
];

/**
 * Chuyển một câu hỏi luyện tập sang dạng trắc nghiệm 4 lựa chọn A–D và loại bỏ `answerSchema` cũ nếu có.
 */
export const applyConvertedPracticeChoice = (
  question: Question,
  choice: ConvertedPracticeChoice | undefined,
  extraRewrites: Array<[RegExp, string]> = DEFAULT_PROMPT_REWRITES
): Question => {
  if (!choice) return question;

  let nextContent = question.content;
  for (const [pattern, replacement] of extraRewrites) {
    nextContent = nextContent.replace(pattern, replacement);
  }

  const {
    answerSchema: _legacyAnswerSchema,
    ...baseQuestion
  } = question;
  void _legacyAnswerSchema;

  return {
    ...baseQuestion,
    content: nextContent.trim(),
    responseType: 'single_choice',
    options: choice.options,
    correctAnswer: choice.correctAnswer,
    acceptedAnswers: [choice.correctAnswer, choice.correctAnswer.toLowerCase()],
    validatorType: 'choice',
  };
};

/**
 * Đồng bộ `solution.finalAnswer` với phương án A–D đầy đủ sau khi chuẩn hóa câu hỏi.
 */
export const applyConvertedPracticeChoiceSolution = (
  solution: Solution,
  question: Question | undefined
): Solution => {
  if (!question?.options?.length || question.validatorType !== 'choice') return solution;
  const correctAnswer = Array.isArray(question.correctAnswer)
    ? question.correctAnswer[0]
    : question.correctAnswer;
  const answerIndex = String(correctAnswer).toUpperCase().charCodeAt(0) - 65;
  const finalAnswer = question.options[answerIndex];
  return finalAnswer ? { ...solution, finalAnswer } : solution;
};
