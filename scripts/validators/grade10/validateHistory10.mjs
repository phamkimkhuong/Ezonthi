import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

const errors = [];
const duplicateValues = values => {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
};

try {
  const [questionModule, solutionModule, typeModule, pathModule, assessmentModule] =
    await Promise.all([
      server.ssrLoadModule('/src/data/grade10/history/questions.ts'),
      server.ssrLoadModule('/src/data/grade10/history/solutions.ts'),
      server.ssrLoadModule('/src/data/grade10/history/questionTypes.ts'),
      server.ssrLoadModule('/src/data/grade10/history/learningPath.ts'),
      server.ssrLoadModule('/src/data/grade10/history/assessments/index.ts')
    ]);

  const questions = questionModule.g10HistoryQuestions;
  const solutions = solutionModule.g10HistorySolutions;
  const questionTypes = typeModule.g10HistoryQuestionTypes;
  const outcomes = pathModule.g10HistoryOutcomes;
  const misconceptions = pathModule.g10HistoryMisconceptions;
  const assessmentQuestions = assessmentModule.g10HistoryAssessmentQuestions;
  const assessmentSolutions = assessmentModule.g10HistoryAssessmentSolutions;
  const exams = assessmentModule.g10HistoryAssessmentExams;
  const blueprints = assessmentModule.g10HistoryAssessmentBlueprints;

  if (questionTypes.length !== 14) errors.push(`Cần 14 dạng bài, hiện có ${questionTypes.length}.`);
  if (questions.length < 350) errors.push(`Cần ít nhất 350 câu luyện tập, hiện có ${questions.length}.`);
  if (solutions.length !== questions.length) errors.push('Số lời giải luyện tập không khớp số câu hỏi.');
  if (outcomes.length !== 14) errors.push(`Cần 14 chuẩn đầu ra, hiện có ${outcomes.length}.`);
  if (misconceptions.length !== 14) errors.push(`Cần 14 ngộ nhận, hiện có ${misconceptions.length}.`);
  if (assessmentQuestions.length !== 192) errors.push(`Cần 192 câu kiểm tra, hiện có ${assessmentQuestions.length}.`);
  if (assessmentSolutions.length !== 192) errors.push(`Cần 192 lời giải kiểm tra, hiện có ${assessmentSolutions.length}.`);
  if (exams.length !== 8) errors.push(`Cần 8 mã đề, hiện có ${exams.length}.`);
  if (blueprints.length !== 4) errors.push(`Cần 4 ma trận đề, hiện có ${blueprints.length}.`);

  const allQuestions = [...questions, ...assessmentQuestions];
  const allSolutions = [...solutions, ...assessmentSolutions];
  const questionIds = new Set(allQuestions.map(question => question.id));
  const solutionIds = new Set(allSolutions.map(solution => solution.questionId));
  const duplicateQuestionIds = duplicateValues(allQuestions.map(question => question.id));
  const duplicateSolutionQuestionIds = duplicateValues(allSolutions.map(solution => solution.questionId));
  if (duplicateQuestionIds.length) errors.push(`Trùng mã câu hỏi: ${duplicateQuestionIds.join(', ')}.`);
  if (duplicateSolutionQuestionIds.length) errors.push(`Trùng lời giải: ${duplicateSolutionQuestionIds.join(', ')}.`);

  for (const question of allQuestions) {
    if (question.responseType !== 'single_choice') errors.push(`${question.id}: responseType không hợp lệ.`);
    if (question.validatorType !== 'choice') errors.push(`${question.id}: validatorType không hợp lệ.`);
    if (question.options?.length !== 4) errors.push(`${question.id}: không có đúng 4 phương án.`);
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) errors.push(`${question.id}: đáp án không hợp lệ.`);
    if (!solutionIds.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
  }

  for (const type of questionTypes) {
    const typeQuestions = questions.filter(question => question.questionTypeId === type.id);
    if (typeQuestions.length < 24) errors.push(`${type.id}: chỉ có ${typeQuestions.length}/24 câu.`);
    if ((type.theory?.length ?? 0) < 7) errors.push(`${type.id}: lý thuyết chưa đủ 7 thẻ.`);
    if ((type.subTypes?.length ?? 0) !== 3) errors.push(`${type.id}: chưa đủ 3 dạng con.`);
    if ((type.theoryCheckpoints?.length ?? 0) < 2) errors.push(`${type.id}: thiếu checkpoint lý thuyết.`);
    for (const subType of type.subTypes ?? []) {
      const count = typeQuestions.filter(question => question.subTypeId === subType.id).length;
      if (count < 7) errors.push(`${subType.id}: chỉ có ${count}/7 câu.`);
    }
  }

  const answerCounts = Object.fromEntries(
    ['A', 'B', 'C', 'D'].map(answer => [answer, questions.filter(question => question.correctAnswer === answer).length])
  );
  if (Math.max(...Object.values(answerCounts)) - Math.min(...Object.values(answerCounts)) > 2) {
    errors.push(`Đáp án mất cân bằng: ${JSON.stringify(answerCounts)}.`);
  }

  for (const exam of exams) {
    if (exam.duration !== 45) errors.push(`${exam.id}: thời lượng không phải 45 phút.`);
    if (exam.questionIds.length !== 24) errors.push(`${exam.id}: không có đúng 24 câu.`);
    for (const questionId of exam.questionIds) {
      if (!questionIds.has(questionId)) errors.push(`${exam.id}: không tìm thấy ${questionId}.`);
    }
  }

  const stats = {
    practiceQuestions: questions.length,
    assessmentQuestions: assessmentQuestions.length,
    solutions: allSolutions.length,
    outcomes: outcomes.length,
    misconceptions: misconceptions.length,
    exams: exams.length,
    blueprints: blueprints.length,
    answerCounts,
    difficulty: Object.fromEntries(
      ['easy', 'medium', 'hard'].map(level => [level, questions.filter(question => question.difficulty === level).length])
    )
  };

  console.log('📊 Thống kê Lịch sử 10:', stats);
  if (errors.length) {
    for (const error of errors) console.error(`❌ ${error}`);
    process.exitCode = 1;
  } else {
    console.log('✅ Dữ liệu Lịch sử 10 hợp lệ.');
  }
} finally {
  await server.close();
}
