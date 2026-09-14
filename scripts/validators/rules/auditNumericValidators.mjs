import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const failures = [];
let audited = 0;
try {
  const [{ loadSubjectData }, validator] = await Promise.all([
    server.ssrLoadModule('/src/data/index.ts'),
    server.ssrLoadModule('/src/utils/answerValidator.ts'),
  ]);
  const courses = { grade9: ['math', 'english'], grade10: ['math', 'english', 'physics', 'chemistry', 'biology', 'history'], grade11: ['math', 'english', 'physics', 'chemistry', 'biology'] };
  for (const [grade, subjects] of Object.entries(courses)) for (const subject of subjects) {
    const data = await loadSubjectData(grade, subject);
    for (const question of data.questions) {
      const numeric = question.validatorType === 'number' || question.validatorType === 'multi-number' ||
        ['numeric', 'keyed-numeric', 'unordered-numeric'].includes(question.answerSchema?.autoCheckMode) ||
        question.answerSchema?.fields?.some(field => field.valueType === 'number' || field.valueType === 'fraction');
      if (!numeric) continue;
      audited++;
      const validInputs = question.answerSchema
        ? [question.correctFinalAnswer, ...(question.acceptedFinalAnswers ?? [])].filter(Boolean)
        : [question.correctAnswer, ...(question.acceptedAnswers ?? [])].filter(Boolean);
      if (!validInputs.length || !validInputs.some(answer => validator.validateAnswer(question, answer))) {
        failures.push(`${question.id}: no declared numeric answer validates`);
        continue;
      }
      if (!question.answerSchema && question.validatorType === 'number') {
        const candidate = validInputs.find(answer => validator.parseStrictNumber(answer) !== null);
        if (candidate) {
          for (const malicious of [`sqrt(${candidate})`, `${candidate}+0`, `${candidate} abc`, `${candidate};999`]) {
            if (validator.validateAnswer(question, malicious)) failures.push(`${question.id}: accepted ${JSON.stringify(malicious)}`);
          }
        }
      }
      if (question.validatorType === 'multi-number') {
        const lexemes = String(question.correctAnswer || '').match(/[+-]?\d+(?:[.,]\d+)?(?:\/[+-]?\d+(?:[.,]\d+)?)?/g) ?? [];
        if (lexemes.length >= 2) {
          const expression = `${lexemes[0]}+${lexemes[1]}`;
          if (validator.validateAnswer(question, expression)) failures.push(`${question.id}: accepted expression ${expression}`);
        }
        for (const answer of question.acceptedAnswers ?? []) {
          if (/^\s*[+-]?\d+(?:[.,]\d+)?\s+[+-]?\d/.test(answer)) {
            const compact = answer.replace(/\s+/g, '');
            if (validator.validateAnswer(question, compact)) failures.push(`${question.id}: collapsed ${JSON.stringify(answer)} into ${compact}`);
          }
        }
      }
    }
  }
  for (const [input, expected] of [['.5', .5], ['1e-3', .001], ['3/4', .75], ['-2,5', -2.5]]) {
    if (validator.parseStrictNumber(input) !== expected) failures.push(`strict parser mismatch: ${input}`);
  }
  for (const input of ['sqrt(2)', '2+3', '2 meters', '1/0', '2;3']) {
    if (validator.parseStrictNumber(input) !== null) failures.push(`strict parser accepted: ${input}`);
  }
} finally {
  await server.close();
}

if (failures.length) {
  console.error(`Numeric audit failed (${failures.length}/${audited} questions):`);
  console.error(failures.slice(0, 50).join('\n'));
  process.exit(1);
}
console.log(`Numeric audit passed: ${audited} questions and strict parser edge cases.`);
