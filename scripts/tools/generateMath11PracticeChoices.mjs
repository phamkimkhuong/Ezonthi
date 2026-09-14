import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
const outputPath = path.join(root, 'src', 'data', 'grade11', 'math', 'practiceChoices.ts');
const assessmentOutputPath = path.join(root, 'src', 'data', 'grade11', 'math', 'assessments.ts');
const modules = [
  ['/src/data/grade11/math/modules/module1_trigonometry/index.ts', 'g11MathModule1'],
  ['/src/data/grade11/math/modules/module2_sequences/index.ts', 'g11MathModule2'],
  ['/src/data/grade11/math/modules/module3_grouped_data/index.ts', 'g11MathModule3'],
  ['/src/data/grade11/math/modules/module4_parallelism/index.ts', 'g11MathModule4'],
  ['/src/data/grade11/math/modules/module5_limits/index.ts', 'g11MathModule5'],
  ['/src/data/grade11/math/modules/module6_exponential_log/index.ts', 'g11MathModule6'],
  ['/src/data/grade11/math/modules/module7_perpendicularity/index.ts', 'g11MathModule7'],
  ['/src/data/grade11/math/modules/module8_probability_rules/index.ts', 'g11MathModule8'],
  ['/src/data/grade11/math/modules/module9_derivatives/index.ts', 'g11MathModule9'],
];
const answerOrder = ['A', 'B', 'C', 'D'];
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
    .replace(/\{,\}/g, '.')
    .replace(/(\d),(?=\d)/g, '$1 ')
    .replace(/10\^\{?(-?\d+)\}?/g, '')
    .match(/-?\d+(?:\.\d+)?/g) ?? []
).map(Number).filter(Number.isFinite);

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
  if (!/(?:;|\\infty)/.test(text)) return null;
  const index = text.search(/^\s*[\[(]/);
  if (index < 0) return null;
  return `${text.slice(0, index)}${text[index] === '[' ? '(' : '['}${text.slice(index + 1)}`;
};

const toggleLastBoundary = value => {
  const text = String(value);
  if (!/^\s*[\[(]/.test(text) || !/(?:;|\\infty)/.test(text)) return null;
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
    const isCountQuestion = /bao nhiêu|số (?:cách|phần tử|nghiệm|điểm)/.test(lowerContext);

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


const textDistractors = (question, answer) => {
  const result = [];
  const text = String(answer).trim();
  const lower = text.toLocaleLowerCase('vi');
  const mathSegments = [...question.content.matchAll(/\$([^$]+)\$/g)]
    .map(match => match[1])
    .join(' ');
  if (/^[A-Z]{1,3}$/.test(text)) {
    const letters = [...new Set(mathSegments.match(/[A-Z]/g) ?? [])];
    if (text.length === 1) {
      for (const letter of letters) result.push(letter);
    }
    for (let left = 0; left < letters.length; left += 1) {
      for (let right = left + 1; right < letters.length; right += 1) {
        result.push(letters[left] + letters[right]);
      }
    }
    if (text.length > 1) {
      for (const letter of letters) result.push(letter);
    }
  }
  if (/^-?pi$/i.test(text)) {
    result.push('2pi', 'pi/2', '-pi');
  }
  if (lower.includes('song song')) {
    result.push('vuông góc', 'cắt nhau', 'chéo nhau');
  }
  if (lower.includes('vuông góc')) {
    result.push('song song', 'cắt nhau nhưng không vuông góc', 'chéo nhau');
  }
  if (lower === 'hình bình hành') {
    result.push('hình thang', 'hình chữ nhật', 'hình thoi');
  }
  if (/^(có|không)$/iu.test(text)) {
    result.push(/^có$/iu.test(text) ? 'Không' : 'Có');
    result.push('Không đủ dữ kiện để kết luận');
    result.push('Chỉ đúng trong một trường hợp đặc biệt');
  }
  result.push('Không xác định', 'Không tồn tại', '0', '1', '-1');
  return result;
};

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

const displayValue = value => {
  const text = String(value).trim();
  if (text.includes('$')) return text;
  const fraction = text.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fraction) return `$\\frac{${fraction[1]}}{${fraction[2]}}$`;
  const normalized = text
    .replace(/sqrt(\d+)/g, '\\sqrt{$1}')
    .replace(/pi/g, '\\pi')
    .replace(/\btan(?=\d|[a-z])/gi, '\\tan ')
    .replace(/\bsin(?=\d|[a-z])/gi, '\\sin ')
    .replace(/\bcos(?=\d|[a-z])/gi, '\\cos ');
  if (/\\|[=+\-*/^()]|\d[a-z]|[a-z]\d/i.test(normalized)) return `$${normalized}$`;
  return normalized;
};

const buildDistractors = (question, solution) => {
  const correct = String(question.correctAnswer).trim();
  const lowerContent = question.content.toLocaleLowerCase('vi');
  const isCountQuestion = /bao nhiêu|số (?:cách|phần tử|nghiệm|điểm)/.test(lowerContent);
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
        ...textDistractors(question, correct),
      ]
    : [
        ...exactDistractors(correct),
        ...numericDistractors(question, solution, correct),
        ...textDistractors(question, correct),
      ];
  const selected = [];
  const seen = new Set(protectedKeys);

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const candidateNumeric = numericValueOf(candidate);
    const text = displayValue(candidate);
    if (isCountQuestion && candidateNumeric !== null && candidateNumeric < 0) continue;
    if (correct.includes('/') && /(?:^|\D)0\s*\/|\/\s*0(?:\D|$)/.test(text)) continue;
    if (
      isProbabilityQuestion
      && candidateNumeric !== null
      && (candidateNumeric < 0 || candidateNumeric > 1)
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

const assessmentQuestionId = id => id.replace(/^math11-q/, 'math11-assess-q');
const assessmentSolutionId = id => id.replace(/^math11-s/, 'math11-assess-s');
const rawPracticeQuestionId = id => id.replace(/^math11-assess-q/, 'math11-q');

try {
  const questions = [];
  const solutions = [];
  for (const [modulePath, exportName] of modules) {
    const module = await server.ssrLoadModule(modulePath);
    questions.push(...module[exportName].practiceQuestions);
    solutions.push(...module[exportName].practiceSolutions);
  }
  const assessmentModule = await server.ssrLoadModule('/src/data/grade11/math/assessments.ts');
  const exams = assessmentModule.g11MathAssessmentExams;
  const solutionByQuestionId = new Map(solutions.map(solution => [solution.questionId, solution]));
  const choiceQuestions = questions.filter(question => question.responseType !== 'true_false_cluster');
  if (questions.length !== 792 || choiceQuestions.length !== 778) {
    throw new Error(`Quy mô không đúng: ${questions.length} câu, ${choiceQuestions.length} câu cần lựa chọn.`);
  }

  const entries = choiceQuestions.map((question, index) => {
    const correctAnswer = answerOrder[index % answerOrder.length];
    let optionValues;
    if (question.responseType === 'single_choice') {
      const oldIndex = String(question.correctAnswer).charCodeAt(0) - 65;
      const correctOption = question.options?.[oldIndex];
      if (!correctOption || question.options.length !== 4) {
        throw new Error(`${question.id}: dữ liệu lựa chọn gốc không hợp lệ.`);
      }
      optionValues = question.options.filter((_, optionIndex) => optionIndex !== oldIndex);
      optionValues.splice(correctAnswer.charCodeAt(0) - 65, 0, correctOption);
    } else {
      optionValues = buildDistractors(question, solutionByQuestionId.get(question.id));
      optionValues.splice(
        correctAnswer.charCodeAt(0) - 65,
        0,
        displayValue(question.correctAnswer)
      );
    }
    return { id: question.id, correctAnswer, options: optionValues };
  });

  const keyCounts = Object.fromEntries(
    answerOrder.map(key => [key, entries.filter(entry => entry.correctAnswer === key).length])
  );
  const choiceFile = [
    "import type { Math11PracticeChoice } from './practiceChoiceNormalizer';",
    '',
    '/**',
    ' * Phương án chuẩn hóa cho toàn bộ câu lựa chọn Toán 11.',
    ' * Tệp được tạo bằng `npm run generate:math11-choices`; không sửa thủ công.',
    ' */',
    `export const g11MathPracticeChoices: Math11PracticeChoice[] = ${JSON.stringify(entries, null, 2)};`,
    '',
  ].join('\n');
  fs.writeFileSync(outputPath, choiceFile, 'utf8');

  const referencedRawIds = new Set(
    exams.flatMap(exam => exam.questionIds.map(rawPracticeQuestionId))
  );
  const assessmentQuestions = questions
    .filter(question => referencedRawIds.has(question.id))
    .map(question => ({
      ...question,
      id: assessmentQuestionId(question.id),
      sourceType: 'mock_exam',
    }));
  const assessmentSolutions = solutions
    .filter(solution => referencedRawIds.has(solution.questionId))
    .map(solution => ({
      ...solution,
      id: assessmentSolutionId(solution.id),
      questionId: assessmentQuestionId(solution.questionId),
    }));
  if (assessmentQuestions.length !== 129 || assessmentSolutions.length !== 129) {
    throw new Error(
      `Assessment snapshot không đúng: ${assessmentQuestions.length} câu, ${assessmentSolutions.length} lời giải.`
    );
  }
  const generatedAssessmentBank = [
    '// <generated-assessment-bank>',
    `export const g11MathAssessmentQuestions: CourseQuestion[] = ${JSON.stringify(assessmentQuestions, null, 2)};`,
    '',
    `export const g11MathAssessmentSolutions: CourseSolution[] = ${JSON.stringify(assessmentSolutions, null, 2)};`,
    '// </generated-assessment-bank>',
  ].join('\n');
  const assessmentSource = fs.readFileSync(assessmentOutputPath, 'utf8');
  const assessmentMarkerPattern =
    /\/\/ <generated-assessment-bank>[\s\S]*?\/\/ <\/generated-assessment-bank>/;
  if (!assessmentMarkerPattern.test(assessmentSource)) {
    throw new Error('Không tìm thấy marker generated-assessment-bank trong assessments.ts.');
  }
  const nextAssessmentSource = assessmentSource.replace(
    assessmentMarkerPattern,
    generatedAssessmentBank
  );
  fs.writeFileSync(assessmentOutputPath, nextAssessmentSource, 'utf8');

  console.log(`Đã tạo ${entries.length} bộ lựa chọn tại ${outputPath}.`);
  console.log(`Phân bố khóa: ${JSON.stringify(keyCounts)}.`);
  console.log(`Đã tạo snapshot ${assessmentQuestions.length} câu assessment tại ${assessmentOutputPath}.`);
} finally {
  await server.close();
}
