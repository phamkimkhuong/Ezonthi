import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
});

const fail = message => {
  throw new Error(message);
};

try {
  const [{ g10MathQuestions }, { g10MathSolutions }, dataModule, choiceModule] =
    await Promise.all([
      server.ssrLoadModule('/src/data/grade10/math/questions.ts'),
      server.ssrLoadModule('/src/data/grade10/math/solutions.ts'),
      server.ssrLoadModule('/src/data/index.ts'),
      server.ssrLoadModule('/src/data/grade10/math/practiceChoices.ts'),
    ]);

  await dataModule.loadSubjectData('grade10', 'math');
  const practiceQuestions = dataModule.getPracticeQuestions('grade10', 'math');
  const runtimeQuestions = dataModule.getQuestions('grade10', 'math');
  const solutionByQuestionId = new Map(
    g10MathSolutions.map(solution => [solution.questionId, solution])
  );
  const convertedIds = new Set(
    choiceModule.g10MathPracticeChoices.map(choice => choice.id)
  );

  if (g10MathQuestions.length !== 966) fail(`Cần 966 câu luyện, nhận ${g10MathQuestions.length}.`);
  if (practiceQuestions.length !== 966) fail(`PracticeEngine nhận ${practiceQuestions.length}/966 câu.`);
  if (runtimeQuestions.length !== 1152) fail(`Runtime cần 1152 câu gồm assessment, nhận ${runtimeQuestions.length}.`);
  if (convertedIds.size !== 427) fail(`Cần 427 câu chuyển đổi, nhận ${convertedIds.size}.`);

  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const suspicious = [];
  for (const question of g10MathQuestions) {
    if (question.responseType !== 'single_choice' || question.validatorType !== 'choice') {
      fail(`${question.id}: chưa phải câu lựa chọn.`);
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      fail(`${question.id}: không có đúng 4 phương án.`);
    }
    if (question.answerSchema !== undefined) fail(`${question.id}: còn answerSchema.`);
    answerCounts[question.correctAnswer] += 1;

    const optionBodies = question.options.map(option =>
      String(option).replace(/^[A-D]\.\s*/, '').trim()
    );
    if (optionBodies.some(option => /\b(?:undefined|NaN|null)\b/i.test(option))) {
      suspicious.push(`${question.id}: có giá trị rác trong phương án.`);
    }
    const solution = solutionByQuestionId.get(question.id);
    if (!solution || !String(solution.finalAnswer).startsWith(`${question.correctAnswer}.`)) {
      fail(`${question.id}: lời giải không đồng bộ với khóa đáp án.`);
    }

    const lowerContent = question.content.toLocaleLowerCase('vi');
    const plainNumbers = optionBodies.map(option =>
      /^-?\d+(?:[.,]\d+)?$/.test(option)
        ? Number(option.replace(',', '.'))
        : null
    );
    if (
      lowerContent.includes('xác suất')
      && plainNumbers.every(value => value !== null)
      && plainNumbers.some(value => value < 0 || value > 1)
    ) {
      suspicious.push(`${question.id}: phương án xác suất nằm ngoài [0; 1].`);
    }
    if (
      /bao nhiêu (?:cách|lựa chọn)|số cách|số phần tử/.test(lowerContent)
      && plainNumbers.every(value => value !== null)
      && plainNumbers.some(value => value < 0)
    ) {
      suspicious.push(`${question.id}: phương án số lượng là số âm.`);
    }
  }

  if (runtimeQuestions.filter(question =>
    question.id.startsWith('mock-math10-') || question.id.startsWith('math10-assess-')
  ).length !== 186) {
    fail('Runtime không giữ đủ 186 câu kiểm tra/thi thử.');
  }
  if (practiceQuestions.some(question =>
    question.id.startsWith('mock-math10-') || question.id.startsWith('math10-assess-')
  )) {
    fail('Câu kiểm tra/thi thử còn lọt vào PracticeEngine.');
  }
  if (suspicious.length > 0) fail(suspicious.join('\n'));

  const sampleGroups = new Map();
  for (const question of g10MathQuestions) {
    if (!convertedIds.has(question.id)) continue;
    const key = `${question.topicId}:${question.difficulty}`;
    if (!sampleGroups.has(key)) sampleGroups.set(key, question);
  }

  console.log(`Runtime hợp lệ: 966 câu luyện + 186 câu kiểm tra = ${runtimeQuestions.length} câu.`);
  console.log(`Khóa đáp án 966 câu: ${JSON.stringify(answerCounts)}.`);
  console.log('Mẫu câu đã chuyển đổi theo chủ đề và độ khó:');
  for (const question of sampleGroups.values()) {
    console.log(`- ${question.id} | ${question.topicId} | ${question.difficulty} | ${question.options.join(' / ')}`);
  }
} finally {
  await server.close();
}
