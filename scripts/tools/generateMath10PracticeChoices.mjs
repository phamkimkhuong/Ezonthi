import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
const outputPath = path.join(root, 'src', 'data', 'grade10', 'math', 'practiceChoices.ts');
const modules = [
  ['module1_logic_sets', 'g10MathModule1Questions', 'g10MathModule1Solutions'],
  ['module2_inequalities', 'g10MathModule2Questions', 'g10MathModule2Solutions'],
  ['module3_functions', 'g10MathModule3Questions', 'g10MathModule3Solutions'],
  ['module4_trigonometry', 'g10MathModule4Questions', 'g10MathModule4Solutions'],
  ['module5_vectors', 'g10MathModule5Questions', 'g10MathModule5Solutions'],
  ['module6_combinatorics', 'g10MathModule6Questions', 'g10MathModule6Solutions'],
  ['module7_statistics_probability', 'g10MathModule7Questions', 'g10MathModule7Solutions'],
  ['module8_coordinate_geometry', 'g10MathModule8Questions', 'g10MathModule8Solutions'],
];
const answerOrder = ['D', 'A', 'B', 'C'];

const semanticKey = value => String(value)
  .toLocaleLowerCase('vi')
  .replace(/\\(?:left|right)/g, '')
  .replace(/\\cup|\bu\b/g, '∪')
  .replace(/\\cap/g, '∩')
  .replace(/hoac/g, 'hoặc')
  .replace(/[{}\s$]/g, '')
  .replace(/,/g, '.');

const formatNumber = value => {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round((value + Number.EPSILON) * 1e6) / 1e6;
  return Object.is(rounded, -0) ? '0' : String(rounded);
};

const extractNumbers = value => (
  String(value)
    .replace(/10\^\{?(-?\d+)\}?/g, '')
    .match(/-?\d+(?:[.,]\d+)?/g) ?? []
).map(token => Number(token.replace(',', '.'))).filter(Number.isFinite);

const solutionText = solution => [
  ...(solution?.detailedSteps ?? []).flatMap(step => [
    typeof step === 'string' ? step : step?.explanation,
    typeof step === 'string' ? undefined : step?.result,
  ]),
  ...(solution?.commonMistakes ?? []),
].filter(Boolean).join(' ');

const mutateNumberInText = (value, which, delta) => {
  let currentIndex = 0;
  return String(value).replace(/-?\d+(?:[.,]\d+)?/g, token => {
    const index = currentIndex++;
    if (index !== which) return token;
    const numeric = Number(token.replace(',', '.'));
    const mutated = formatNumber(numeric + delta);
    return token.includes(',') ? mutated.replace('.', ',') : mutated;
  });
};

const toggleFirstBoundary = value => {
  const text = String(value);
  const index = text.search(/^\s*[\[(]/);
  if (index < 0) return null;
  return `${text.slice(0, index)}${text[index] === '[' ? '(' : '['}${text.slice(index + 1)}`;
};

const toggleLastBoundary = value => {
  const text = String(value);
  if (!/^\s*[\[(]/.test(text)) return null;
  const match = text.match(/[\])]\s*$/);
  if (!match || match.index === undefined) return null;
  const index = match.index;
  return `${text.slice(0, index)}${text[index] === ']' ? ')' : ']'}${text.slice(index + 1)}`;
};

const exactDistractors = answer => {
  const result = [];
  const text = String(answer);
  const push = value => {
    if (value && value !== text) result.push(value);
  };

  push(toggleFirstBoundary(text));
  push(toggleLastBoundary(text));
  if (text.includes('\\cup')) push(text.replace('\\cup', '\\cap'));
  if (text.includes(' hoặc ')) push(text.replace(' hoặc ', ' và '));
  if (text.includes(' <= ')) push(text.replace(' <= ', ' < '));
  if (text.includes(' >= ')) push(text.replace(' >= ', ' > '));
  if (text.includes(' < ')) push(text.replace(' < ', ' <= '));
  if (text.includes(' > ')) push(text.replace(' > ', ' >= '));
  if (text.includes(' + ')) push(text.replace(' + ', ' - '));
  if (text.includes(' - ')) push(text.replace(' - ', ' + '));
  const sumEquation = text.match(/^(.+?)\s*=\s*(.+?)\s*\+\s*(.+)$/);
  if (sumEquation && !/\d/.test(text)) {
    const [, left, firstTerm, secondTerm] = sumEquation;
    push(`${left} = ${secondTerm} - ${firstTerm}`);
    push(`${left} = ${firstTerm}`);
    push(`${left} = ${secondTerm}`);
  }
  if (/^\{.+\}$/.test(text)) {
    push('\\varnothing');
    push(text.slice(1, -1));
  }
  if (/^có$/iu.test(text)) {
    push('Không');
    push('Chỉ thỏa mãn một phần các điều kiện');
    push('Không đủ dữ kiện để kết luận');
  }
  if (/^không$/iu.test(text)) {
    push('Có');
    push('Chỉ thỏa mãn một phần các điều kiện');
    push('Không đủ dữ kiện để kết luận');
  }

  const numberCount = extractNumbers(text).length;
  for (let index = 0; index < numberCount; index += 1) {
    push(mutateNumberInText(text, index, 1));
    push(mutateNumberInText(text, index, -1));
    push(mutateNumberInText(text, index, 2));
  }

  if (text.includes(',')) {
    const parts = text.split(',').map(part => part.trim());
    if (parts.length > 1) push([...parts].reverse().join(', '));
  }

  return result;
};

const numericDistractors = (question, solution, answer) => {
  const result = [];
  const text = String(answer);
  const fractionMatch = text.match(/^(-?\d+)\/(-?\d+)$/);
  const numeric = Number(text.replace(',', '.'));
  const combinedText = `${question.content} ${solutionText(solution)}`;
  const contextNumbers = extractNumbers(combinedText);

  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    result.push(
      `${numerator + 1}/${denominator}`,
      `${numerator}/${denominator + 1}`,
      `${-numerator}/${denominator}`,
      `${denominator}/${numerator}`,
    );
  }

  if (Number.isFinite(numeric)) {
    const decimals = text.includes('.') ? text.split('.')[1].length : 0;
    const step = decimals > 0 ? 10 ** (-decimals) : 1;
    const lowerContext = question.content.toLocaleLowerCase('vi');
    const isCountQuestion = /bao nhiêu (?:cách|lựa chọn)|số cách|số phần tử/.test(lowerContext);

    if (lowerContext.includes('làm tròn')) {
      const source = extractNumbers(question.content)[0];
      if (
        Number.isFinite(source)
        && Math.abs(source - numeric) <= Math.max(1, Math.abs(numeric) * 2)
      ) {
        const factor = 10 ** decimals;
        result.push(
          formatNumber(Math.trunc(source * factor) / factor),
          formatNumber(numeric + step),
          formatNumber(numeric - step),
        );
      }
    }

    if (lowerContext.includes('xác suất')) {
      result.push(
        formatNumber(1 - numeric),
        formatNumber(numeric / 2),
        formatNumber(Math.min(1, numeric * 2)),
      );
    }

    const operands = extractNumbers(question.content).slice(0, 8);
    if (!lowerContext.includes('xác suất') && !isCountQuestion) {
      result.push(
        formatNumber(numeric + step),
        formatNumber(numeric - step),
        formatNumber(numeric + 2 * step),
        formatNumber(numeric - 2 * step),
      );
    }
    for (let left = 0; left < operands.length; left += 1) {
      for (let right = left + 1; right < operands.length; right += 1) {
        result.push(
          formatNumber(operands[left] + operands[right]),
          formatNumber(Math.abs(operands[left] - operands[right])),
          formatNumber(operands[left] * operands[right]),
        );
      }
    }
    for (const value of contextNumbers) result.push(formatNumber(value));

    result.push(
      formatNumber(numeric + step),
      formatNumber(numeric - step),
      formatNumber(numeric * 2),
      formatNumber(numeric / 2),
      formatNumber(-numeric),
      '0',
      '1',
    );
  }

  return result;
};

const displayValue = value => {
  const text = String(value).trim();
  if (text.includes('$')) return text;
  if (/\\(?:infty|cup|cap|vec|frac|mathbb)/.test(text)) return `$${text}$`;
  return text;
};

const buildDistractors = (question, solution) => {
  const correct = String(question.correctAnswer).trim();
  const lowerContent = question.content.toLocaleLowerCase('vi');
  const isCountQuestion = /bao nhiêu (?:cách|lựa chọn)|số cách|số phần tử/.test(lowerContent);
  const isProbabilityQuestion = lowerContent.includes('xác suất');
  const protectedKeys = new Set(
    [correct, ...(question.acceptedAnswers ?? [])].map(semanticKey)
  );
  const isPlainNumber =
    /^-?\d+(?:[.,]\d+)?$/.test(correct) ||
    /^-?\d+\s*\/\s*-?\d+$/.test(correct);
  const candidates = isPlainNumber
    ? [
        ...numericDistractors(question, solution, correct),
        ...exactDistractors(correct),
      ]
    : [
        ...exactDistractors(correct),
        ...numericDistractors(question, solution, correct),
      ];
  const selected = [];
  const seen = new Set(protectedKeys);

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const text = displayValue(candidate);
    const plainNumeric = /^-?\d+(?:[.,]\d+)?$/.test(text)
      ? Number(text.replace(',', '.'))
      : null;
    if (isCountQuestion && plainNumeric !== null && plainNumeric < 0) continue;
    if (correct.includes('/') && /(?:^|\D)0\s*\/|\/\s*0(?:\D|$)/.test(text)) continue;
    if (
      isProbabilityQuestion
      && plainNumeric !== null
      && (plainNumeric < 0 || plainNumeric > 1)
    ) continue;
    const key = semanticKey(text);
    if (!text || seen.has(key)) continue;
    seen.add(key);
    selected.push(text);
    if (selected.length === 3) break;
  }

  if (selected.length !== 3) {
    throw new Error(`${question.id}: không tạo đủ ba phương án nhiễu.`);
  }
  return selected;
};

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true },
});

try {
  const questions = [];
  const solutions = [];
  for (const [directory, questionExport, solutionExport] of modules) {
    const questionModule = await server.ssrLoadModule(
      `/src/data/grade10/math/modules/${directory}/questions.ts`
    );
    const solutionModule = await server.ssrLoadModule(
      `/src/data/grade10/math/modules/${directory}/solutions.ts`
    );
    questions.push(...questionModule[questionExport]);
    solutions.push(...solutionModule[solutionExport]);
  }

  const solutionByQuestionId = new Map(solutions.map(solution => [solution.questionId, solution]));
  const inputQuestions = questions.filter(question => !question.options?.length);
  const entries = inputQuestions.map((question, index) => {
    const correctAnswer = answerOrder[index % answerOrder.length];
    const distractors = buildDistractors(question, solutionByQuestionId.get(question.id));
    const optionValues = [...distractors];
    optionValues.splice(correctAnswer.charCodeAt(0) - 65, 0, displayValue(question.correctAnswer));
    return {
      id: question.id,
      correctAnswer,
      options: optionValues.map((value, optionIndex) => (
        `${String.fromCharCode(65 + optionIndex)}. ${value}`
      )),
    };
  });

  const keyCounts = Object.fromEntries(
    ['A', 'B', 'C', 'D'].map(key => [
      key,
      entries.filter(entry => entry.correctAnswer === key).length,
    ])
  );
  const fileContent = [
    "import type { Math10PracticeChoice } from './practiceChoiceNormalizer';",
    '',
    '/**',
    ' * Phương án lựa chọn cho các câu Toán 10 trước đây dùng ô nhập đáp án.',
    ' * Tệp được tạo bằng `npm run generate:math10-choices`; không sửa thủ công.',
    ' */',
    `export const g10MathPracticeChoices: Math10PracticeChoice[] = ${JSON.stringify(entries, null, 2)};`,
    '',
  ].join('\n');
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`Đã tạo ${entries.length} bộ phương án tại ${outputPath}.`);
  console.log(`Phân bố khóa mới: ${JSON.stringify(keyCounts)}.`);
} finally {
  await server.close();
}
