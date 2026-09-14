import { createServer } from 'vite';

const moduleDirectories = [
  'module1_trigonometry',
  'module2_sequences',
  'module3_grouped_data',
  'module4_parallelism',
  'module5_limits',
  'module6_exponential_log',
  'module7_perpendicularity',
  'module8_probability_rules',
  'module9_derivatives',
 ];

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
});

const fail = message => { throw new Error(message); };

const semanticOption = value => String(value)
  .replace(/^[A-D]\.\s*/, '')
  .replace(/\\(?:left|right)/g, '')
  .replace(/[{}\s$]/g, '')
  .replace(/,/g, '.')
  .toLocaleLowerCase('vi');

const numericValueOf = value => {
  const text = String(value).replace(/\$/g, '').trim();
  const latexFraction = text.match(/^\\frac\{(-?\d+(?:[.,]\d+)?)\}\{(-?\d+(?:[.,]\d+)?)\}$/);
  if (latexFraction) {
    const denominator = Number(latexFraction[2].replace(',', '.'));
    return denominator === 0 ? null : Number(latexFraction[1].replace(',', '.')) / denominator;
  }
  const fraction = text.match(/^(-?\d+(?:[.,]\d+)?)\s*\/\s*(-?\d+(?:[.,]\d+)?)$/);
  if (fraction) {
    const denominator = Number(fraction[2].replace(',', '.'));
    return denominator === 0 ? null : Number(fraction[1].replace(',', '.')) / denominator;
  }
  return /^-?\d+(?:[.,]\d+)?$/.test(text) ? Number(text.replace(',', '.')) : null;
};

try {
  const dataModule = await server.ssrLoadModule('/src/data/index.ts');
  const rawQuestions = [];
  for (const [index, directory] of moduleDirectories.entries()) {
    const module = await server.ssrLoadModule(
      `/src/data/grade11/math/modules/${directory}/index.ts`
    );
    rawQuestions.push(...module[`g11MathModule${index + 1}`].practiceQuestions);
  }
  await dataModule.loadSubjectData('grade11', 'math');
  const allQuestions = dataModule.getQuestions('grade11', 'math');
  const practiceQuestions = dataModule.getPracticeQuestions('grade11', 'math');
  const solutions = dataModule.getSolutions('grade11', 'math');
  const exams = dataModule.getMockExams('grade11', 'math');
  const blueprints = dataModule.getAssessmentBlueprints('grade11', 'math');
  const questionById = new Map(allQuestions.map(question => [question.id, question]));
  const solutionByQuestionId = new Map(solutions.map(solution => [solution.questionId, solution]));
  const blueprintById = new Map(blueprints.map(blueprint => [blueprint.id, blueprint]));
  const originalShortIds = new Set(
    rawQuestions.filter(question => question.responseType === 'short_answer').map(question => question.id)
  );

  if (rawQuestions.length !== 792 || originalShortIds.size !== 174) {
    fail(`Nguồn cần 792 câu và 174 câu nhập, hiện là ${rawQuestions.length}/${originalShortIds.size}.`);
  }
  if (allQuestions.length !== 921 || practiceQuestions.length !== 792) {
    fail(`Runtime cần 921 câu tổng và 792 câu luyện, hiện là ${allQuestions.length}/${practiceQuestions.length}.`);
  }
  if (solutions.length !== 921 || exams.length !== 13 || blueprints.length !== 13) {
    fail('Thiếu lời giải, đề hoặc blueprint ở runtime Toán 11.');
  }

  const responseCounts = { single_choice: 0, true_false_cluster: 0, short_answer: 0 };
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const suspicious = [];
  for (const question of practiceQuestions) {
    responseCounts[question.responseType] = (responseCounts[question.responseType] ?? 0) + 1;
    const solution = solutionByQuestionId.get(question.id);
    if (!solution) fail(`${question.id}: thiếu lời giải runtime.`);
    if (question.responseType === 'single_choice') {
      if (question.validatorType !== 'choice' || !Array.isArray(question.options) || question.options.length !== 4) {
        fail(`${question.id}: câu lựa chọn không có đúng 4 phương án.`);
      }
      if (question.answerSchema !== undefined) fail(`${question.id}: còn answerSchema.`);
      if (!Object.hasOwn(answerCounts, question.correctAnswer)) fail(`${question.id}: khóa đáp án không hợp lệ.`);
      answerCounts[question.correctAnswer] += 1;
      const semanticOptions = question.options.map(semanticOption);
      if (new Set(semanticOptions).size !== 4) fail(`${question.id}: phương án trùng nội dung.`);
      if (solution.finalAnswer !== question.correctAnswer) fail(`${question.id}: lời giải lệch khóa đáp án.`);
      if (question.options.some(option => /\b(?:undefined|NaN|null)\b/i.test(String(option)))) {
        suspicious.push(`${question.id}: có giá trị rác.`);
      }
      const numericOptions = question.options.map(numericValueOf);
      const lowerContent = question.content.toLocaleLowerCase('vi');
      if (lowerContent.includes('xác suất') && numericOptions.every(value => value !== null)) {
        if (numericOptions.some(value => value < 0 || value > 1)) suspicious.push(`${question.id}: xác suất ngoài [0;1].`);
      }
      if (/bao nhiêu|số (?:cách|phần tử|nghiệm|điểm)/.test(lowerContent)) {
        if (numericOptions.every(value => value !== null) && numericOptions.some(value => value < 0)) {
          suspicious.push(`${question.id}: phương án số lượng âm.`);
        }
      }
    } else if (question.responseType === 'true_false_cluster') {
      if (solution.finalAnswer !== question.correctAnswer) fail(`${question.id}: lời giải Đúng/Sai lệch đáp án.`);
    } else {
      fail(`${question.id}: phần luyện tập còn responseType ${question.responseType}.`);
    }
  }
  if (responseCounts.single_choice !== 778 || responseCounts.true_false_cluster !== 14 || responseCounts.short_answer !== 0) {
    fail(`Phân bố practice sai: ${JSON.stringify(responseCounts)}.`);
  }
  if (JSON.stringify(answerCounts) !== JSON.stringify({ A: 195, B: 195, C: 194, D: 194 })) {
    fail(`Khóa practice chưa cân bằng: ${JSON.stringify(answerCounts)}.`);
  }
  if (practiceQuestions.filter(question => originalShortIds.has(question.id)).length !== 174) {
    fail('Không giữ đủ 174 câu đã chuyển đổi trong practice.');
  }
  if (suspicious.length > 0) fail(suspicious.join('\n'));

  const assessmentQuestions = allQuestions.filter(question => question.id.startsWith('math11-assess-'));
  if (assessmentQuestions.length !== 129) fail(`Assessment bank có ${assessmentQuestions.length}/129 câu.`);
  if (practiceQuestions.some(question => question.id.startsWith('math11-assess-'))) {
    fail('Câu assessment còn lọt vào PracticeEngine.');
  }
  const assessmentResponseCounts = { single_choice: 0, short_answer: 0, true_false_cluster: 0 };
  for (const question of assessmentQuestions) {
    assessmentResponseCounts[question.responseType] += 1;
    const solution = solutionByQuestionId.get(question.id);
    if (!solution || solution.finalAnswer !== question.correctAnswer) {
      fail(`${question.id}: snapshot assessment thiếu hoặc lệch lời giải.`);
    }
  }
  if (JSON.stringify(assessmentResponseCounts) !== JSON.stringify({ single_choice: 100, short_answer: 26, true_false_cluster: 3 })) {
    fail(`Cấu trúc assessment bank sai: ${JSON.stringify(assessmentResponseCounts)}.`);
  }

  for (const exam of exams) {
    if (exam.questionIds.some(id => !id.startsWith('math11-assess-'))) {
      fail(`${exam.id}: còn tham chiếu practice ID.`);
    }
    const blueprint = blueprintById.get(exam.blueprintId);
    if (!blueprint) fail(`${exam.id}: thiếu blueprint.`);
    const examQuestions = exam.questionIds.map(id => questionById.get(id));
    if (examQuestions.some(question => !question)) fail(`${exam.id}: thiếu câu hỏi.`);
    const actual = examQuestions.reduce((counts, question) => {
      const type = question.responseType === 'single_choice' ? 'multiple_choice' : question.responseType;
      counts[type] = (counts[type] ?? 0) + 1;
      return counts;
    }, {});
    const expected = blueprint.sections.reduce((counts, section) => {
      counts[section.responseType] = (counts[section.responseType] ?? 0) + section.itemCount;
      return counts;
    }, {});
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      fail(`${exam.id}: cấu trúc ${JSON.stringify(actual)} lệch blueprint ${JSON.stringify(expected)}.`);
    }
  }

  const convertedSamples = [];
  for (const questionTypeId of [...new Set(practiceQuestions.map(question => question.questionTypeId))]) {
    const sample = practiceQuestions.find(
      question => question.questionTypeId === questionTypeId && originalShortIds.has(question.id)
    );
    if (sample) convertedSamples.push(sample);
  }
  console.log('Runtime hợp lệ: 792 practice + 129 assessment = 921 câu.');
  console.log(`Practice: ${JSON.stringify(responseCounts)}; khóa ${JSON.stringify(answerCounts)}.`);
  console.log(`Assessment: ${JSON.stringify(assessmentResponseCounts)}; ${exams.length} đề độc lập.`);
  console.log('Mẫu câu chuyển đổi theo 33 dạng:');
  for (const question of convertedSamples) {
    console.log(`- ${question.id} | ${question.questionTypeId} | ${question.options.join(' / ')}`);
  }
} finally {
  await server.close();
}
