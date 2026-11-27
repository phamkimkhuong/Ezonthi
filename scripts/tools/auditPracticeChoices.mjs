import { createServer } from 'vite';
import {
  ANSWER_LETTERS,
  countDecimals,
  semanticKey,
  stripOptionPrefix,
} from './practiceChoiceHelpers.mjs';

const DEFAULT_TARGETS = [
  ['grade10', 'physics'],
  ['grade10', 'chemistry'],
  ['grade11', 'chemistry'],
];

const parseTargets = () => {
  const arg = process.argv.find(item => item.startsWith('--course='));
  if (!arg) return DEFAULT_TARGETS;
  return arg
    .slice('--course='.length)
    .split(',')
    .map(pair => pair.split(':').map(part => part.trim()))
    .filter(([g, s]) => g && s);
};

const targets = parseTargets();
const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true },
});

const failures = [];

try {
  const dataModule = await server.ssrLoadModule('/src/data/index.ts');

  for (const [grade, subject] of targets) {
    const dataset = await dataModule.loadSubjectData(grade, subject);
    const practiceQuestions = dataModule.getPracticeQuestions(grade, subject);
    const solutionByQuestionId = new Map(
      dataset.solutions.map(solution => [solution.questionId, solution])
    );

    const keyCounts = Object.fromEntries(ANSWER_LETTERS.map(letter => [letter, 0]));

    for (const question of practiceQuestions) {
      if (
        !Array.isArray(question.options)
        || question.options.length !== 4
        || question.validatorType !== 'choice'
        || !['choice', 'single_choice'].includes(question.responseType ?? 'single_choice')
        || question.answerSchema
      ) {
        failures.push(`${grade}/${subject} ${question.id}: chưa chuẩn A–D (${question.responseType}/${question.validatorType})`);
        continue;
      }

      const answerLetter = String(Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer).trim().toUpperCase();
      if (!/^[A-D]$/.test(answerLetter)) {
        failures.push(`${grade}/${subject} ${question.id}: correctAnswer không phải A–D (${question.correctAnswer})`);
        continue;
      }
      keyCounts[answerLetter] += 1;

      const prefixesOk = question.options.every((option, index) =>
        option.startsWith(`${ANSWER_LETTERS[index]}. `)
      );
      if (!prefixesOk) {
        failures.push(`${grade}/${subject} ${question.id}: sai tiền tố A.–D.: ${JSON.stringify(question.options)}`);
      }

      const stripped = question.options.map(stripOptionPrefix);
      if (stripped.some(text => !text || /\b(?:NaN|undefined|null)\b/.test(text))) {
        failures.push(`${grade}/${subject} ${question.id}: phương án rỗng hoặc lỗi trị: ${JSON.stringify(question.options)}`);
      }
      if (new Set(stripped.map(semanticKey)).size !== 4) {
        failures.push(`${grade}/${subject} ${question.id}: trùng ngữ nghĩa giữa các phương án: ${JSON.stringify(question.options)}`);
      }

      // Check excessive decimal noise relative to correct option.
      const correctVal = stripped[answerLetter.charCodeAt(0) - 65];
      const corrDec = countDecimals(correctVal);
      if (corrDec < 4 && stripped.some(val => countDecimals(val) >= 5)) {
        failures.push(`${grade}/${subject} ${question.id}: nhiễu có quá nhiều chữ số thập phân: ${JSON.stringify(stripped)}`);
      }

      if (/nhập\s+(?:giá trị|số|đáp|kết quả)|chỉ nhập|chỉ điền/i.test(question.content)) {
        failures.push(`${grade}/${subject} ${question.id}: còn sót chỉ dẫn nhập số: ${question.content}`);
      }

      const solution = solutionByQuestionId.get(question.id);
      if (solution) {
        const finalAns = String(solution.finalAnswer ?? '').trim();
        const validFinal = finalAns === answerLetter || finalAns.startsWith(`${answerLetter}.`);
        if (!validFinal) {
          failures.push(`${grade}/${subject} ${question.id}: solution.finalAnswer (${finalAns}) không khớp ${answerLetter}`);
        }
      }
    }

    console.log(`[${grade}/${subject}] Audited ${practiceQuestions.length} practice MCQs. Keys: ${JSON.stringify(keyCounts)}`);
  }
} finally {
  await server.close();
}

if (failures.length > 0) {
  console.error(`Audit thất bại (${failures.length} lỗi):`);
  console.error(failures.slice(0, 50).join('\n'));
  process.exit(1);
}

console.log('Tất cả khóa học đạt chuẩn trắc nghiệm A–D.');
