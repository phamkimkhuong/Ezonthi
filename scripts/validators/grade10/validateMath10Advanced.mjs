import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true }
});

const errors = [];
const wordCount = value => String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
const authoredTopicFiles = [
  'algebra.ts',
  'functions.ts',
  'inequalities.ts',
  'numberTheory.ts',
  'combinatorics.ts',
  'geometry.ts',
  'coordinate.ts',
  'modeling.ts'
];
const authoredDirectory = path.join(process.cwd(), 'src', 'data', 'grade10', 'math', 'advanced', 'authored');
const suspiciousBareLatexCommand = /(?:dfrac|frac|sqrt|alpha|beta|gamma|delta|theta|cdot|times|leq|geq|infty|binom|equiv|pmod|vec|overline|begin|end|sum|lfloor|rfloor|mid|cap|le)/;
const collectStrings = (value, result = []) => {
  if (typeof value === 'string') result.push(value);
  else if (Array.isArray(value)) value.forEach(item => collectStrings(item, result));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectStrings(item, result));
  return result;
};
const validateRuntimeMath = (owner, value) => {
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) {
    errors.push(`${owner}: chuỗi chứa ký tự điều khiển, có thể do JavaScript nuốt lệnh LaTeX.`);
  }
  const openingDelimiters = value.match(/\\\(/g)?.length ?? 0;
  const closingDelimiters = value.match(/\\\)/g)?.length ?? 0;
  if (openingDelimiters !== closingDelimiters) {
    errors.push(`${owner}: cặp dấu LaTeX \\( ... \\) không cân bằng.`);
  }
  const delimitedFormulas = value.matchAll(/\\\((.*?)\\\)|\\\[(.*?)\\\]|\$\$(.*?)\$\$|\$(.*?)\$/gs);
  for (const match of delimitedFormulas) {
    const formula = match.slice(1).find(part => part !== undefined) ?? '';
    const formulaWithoutEscapedCommands = formula.replace(/\\[A-Za-z]+/g, '');
    if (suspiciousBareLatexCommand.test(formulaWithoutEscapedCommands)) {
      errors.push(`${owner}: phát hiện lệnh LaTeX mất dấu gạch chéo trong "${formula.slice(0, 100)}".`);
    }
    try {
      katex.renderToString(formula, { throwOnError: true, strict: false });
    } catch (error) {
      errors.push(`${owner}: KaTeX không đọc được "${formula.slice(0, 100)}" (${error.message}).`);
    }
  }
};
const normalizeStructure = value => value
  .normalize('NFC')
  .toLowerCase()
  .replace(/-?\d+(?:[.,]\d+)?/g, '#')
  .replace(/\s+/g, ' ')
  .trim();
const assertUnique = (items, key, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) errors.push(`${label} trùng ${key}: ${item[key]}`);
    seen.add(item[key]);
  }
};

try {
  for (const fileName of authoredTopicFiles) {
    const source = fs.readFileSync(path.join(authoredDirectory, fileName), 'utf8');
    for (const match of source.matchAll(/\\+/g)) {
      if (match[0].length % 2 !== 0) {
        const line = source.slice(0, match.index).split(/\r?\n/).length;
        errors.push(`${fileName}:${line}: dấu gạch chéo LaTeX trong chuỗi TypeScript chưa được escape.`);
      }
    }
  }

  const { advancedMath10Topics, advancedMath10Questions, advancedMath10Solutions } =
    await server.ssrLoadModule('/src/data/grade10/math/advanced/index.ts');

  assertUnique(advancedMath10Topics, 'id', 'Topic');
  assertUnique(advancedMath10Questions, 'id', 'Question');
  assertUnique(advancedMath10Solutions, 'questionId', 'Solution');

  if (advancedMath10Topics.length !== 8) errors.push(`Cần 8 mảng, hiện có ${advancedMath10Topics.length}.`);
  if (advancedMath10Questions.length !== 192) errors.push(`Cần 192 câu, hiện có ${advancedMath10Questions.length}.`);
  if (advancedMath10Solutions.length !== 192) errors.push(`Cần 192 lời giải, hiện có ${advancedMath10Solutions.length}.`);

  const topicIds = new Set(advancedMath10Topics.map(topic => topic.id));
  const solutionByQuestionId = new Map(advancedMath10Solutions.map(solution => [solution.questionId, solution]));
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const levelCounts = { hard: 0, very_hard: 0, extreme: 0 };
  const styleCounts = { compact: 0, extended: 0, olympiad: 0 };
  const solutionStats = {
    hard: { count: 0, steps: 0, words: 0 },
    very_hard: { count: 0, steps: 0, words: 0 },
    extreme: { count: 0, steps: 0, words: 0 }
  };
  const mistakeSetOwners = new Map();
  let visualCount = 0;
  const structureOwners = new Map();

  for (const topic of advancedMath10Topics) {
    const count = advancedMath10Questions.filter(question => question.topicId === topic.id).length;
    if (count !== 24) errors.push(`${topic.id}: cần 24 câu, hiện có ${count}.`);
  }

  for (const [index, question] of advancedMath10Questions.entries()) {
    const expectedId = `math10-adv-q${String(index + 1).padStart(3, '0')}`;
    if (question.id !== expectedId) errors.push(`Sai chuỗi ID tại vị trí ${index + 1}: ${question.id}.`);
    if (!topicIds.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
    if (question.subjectId !== 'math') errors.push(`${question.id}: subjectId phải là math.`);
    if (question.responseType !== 'single_choice') errors.push(`${question.id}: chỉ chấp nhận single_choice.`);
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: cần đúng 4 lựa chọn.`);
    if (new Set(question.options).size !== 4) errors.push(`${question.id}: có lựa chọn trùng văn bản.`);
    if (!Object.hasOwn(answerCounts, question.correctAnswer)) errors.push(`${question.id}: đáp án không thuộc A–D.`);
    else answerCounts[question.correctAnswer] += 1;
    if (!Object.hasOwn(levelCounts, question.advancedLevel)) errors.push(`${question.id}: mức độ không hợp lệ.`);
    else levelCounts[question.advancedLevel] += 1;
    if (!Object.hasOwn(styleCounts, question.problemLength)) errors.push(`${question.id}: phong cách bài không hợp lệ.`);
    else styleCounts[question.problemLength] += 1;
    if (!Number.isFinite(question.estimatedMinutes) || question.estimatedMinutes < 6) errors.push(`${question.id}: thời gian ước lượng không hợp lệ.`);

    const structureSource = [question.stimulus?.title, question.stimulus?.content, question.content]
      .filter(Boolean)
      .join(' ');
    const structure = normalizeStructure(structureSource);
    const previousOwner = structureOwners.get(structure);
    if (previousOwner) errors.push(`${question.id}: lặp cấu trúc với ${previousOwner} sau khi loại tham số số học.`);
    else structureOwners.set(structure, question.id);

    if (question.problemLength === 'olympiad' && !question.tags.includes('Olympic')) {
      errors.push(`${question.id}: bài Olympic phải được biên soạn và gắn nhãn riêng, không được nâng nhãn tự động.`);
    }

    const solution = solutionByQuestionId.get(question.id);
    if (!solution) {
      errors.push(`${question.id}: thiếu lời giải.`);
      continue;
    }
    if (solution.finalAnswer !== question.correctAnswer) errors.push(`${question.id}: đáp án câu hỏi và lời giải lệch nhau.`);
    if (!solution.recognition || solution.recognition.length < 100) errors.push(`${question.id}: phần nhận dạng chưa đủ rõ.`);
    if (solution.recognition.trim() === solution.insight?.trim()) errors.push(`${question.id}: nhận dạng đang lặp nguyên văn mấu chốt.`);
    if (!solution.insight || solution.insight.length < 30) errors.push(`${question.id}: mấu chốt quá ngắn.`);
    const minimumSteps = { hard: 6, very_hard: 7, extreme: 7 }[question.advancedLevel];
    if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length < minimumSteps) {
      errors.push(`${question.id}: mức ${question.advancedLevel} cần ít nhất ${minimumSteps} bước giải.`);
    }
    const explanationWords = solution.detailedSteps.reduce((total, step) => total + wordCount(step.explanation), 0);
    const minimumWords = { hard: 120, very_hard: 150, extreme: 160 }[question.advancedLevel];
    if (explanationWords < minimumWords) errors.push(`${question.id}: lời giải chỉ có ${explanationWords} từ, cần ít nhất ${minimumWords}.`);
    if (solution.detailedSteps.some(step => /^Bước\s+\d+$/i.test(step.title))) {
      errors.push(`${question.id}: tiêu đề bước còn chung chung, chưa mô tả thao tác.`);
    }
    if (!Array.isArray(solution.commonMistakes) || solution.commonMistakes.length < 3) errors.push(`${question.id}: cần ít nhất 3 bẫy sai riêng.`);
    if (!Array.isArray(solution.reviewSuggestions) || solution.reviewSuggestions.length === 0) errors.push(`${question.id}: thiếu gợi ý ôn tập.`);
    if (solution.reviewSuggestions.some(item => !item.startsWith('Ôn lại '))) errors.push(`${question.id}: gợi ý ôn tập chưa thành chỉ dẫn rõ ràng.`);

    const mistakeKey = solution.commonMistakes.join('|');
    const mistakeOwner = mistakeSetOwners.get(mistakeKey);
    if (mistakeOwner) errors.push(`${question.id}: bộ bẫy sai lặp nguyên văn với ${mistakeOwner}.`);
    else mistakeSetOwners.set(mistakeKey, question.id);

    solutionStats[question.advancedLevel].count += 1;
    solutionStats[question.advancedLevel].steps += solution.detailedSteps.length;
    solutionStats[question.advancedLevel].words += explanationWords;

    collectStrings(question).forEach(value => validateRuntimeMath(question.id, value));
    collectStrings(solution).forEach(value => validateRuntimeMath(`${question.id}/solution`, value));

    const media = question.stimulus?.media ?? [];
    if (media.length > 0 || question.stimulus?.dataTable) visualCount += 1;
    for (const item of media) {
      if (!item.alt || item.alt.length < 12) errors.push(`${question.id}: media thiếu alt có nghĩa.`);
      const filePath = path.join(process.cwd(), 'public', item.src.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) errors.push(`${question.id}: thiếu file ${item.src}.`);
    }
  }

  const expectedAnswers = { A: 48, B: 48, C: 48, D: 48 };
  const expectedLevels = { hard: 48, very_hard: 80, extreme: 64 };
  const expectedStyles = { compact: 96, extended: 64, olympiad: 32 };
  for (const key of Object.keys(expectedAnswers)) if (answerCounts[key] !== expectedAnswers[key]) errors.push(`Đáp án ${key}: cần ${expectedAnswers[key]}, hiện có ${answerCounts[key]}.`);
  for (const key of Object.keys(expectedLevels)) if (levelCounts[key] !== expectedLevels[key]) errors.push(`Mức ${key}: cần ${expectedLevels[key]}, hiện có ${levelCounts[key]}.`);
  for (const key of Object.keys(expectedStyles)) if (styleCounts[key] !== expectedStyles[key]) errors.push(`Kiểu ${key}: cần ${expectedStyles[key]}, hiện có ${styleCounts[key]}.`);
  if (visualCount < 32) errors.push(`Cần ít nhất 32 câu có hình/bảng, hiện có ${visualCount}.`);

  if (errors.length) {
    console.error(`Toán 10 nâng cao chưa hợp lệ (${errors.length} lỗi):`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`Toán 10 nâng cao: ${advancedMath10Questions.length} câu / ${advancedMath10Topics.length} mảng.`);
    console.log(`Mức độ: ${levelCounts.hard} khó, ${levelCounts.very_hard} rất khó, ${levelCounts.extreme} cực khó.`);
    console.log(`Kiến trúc: ${styleCounts.compact} cô đọng, ${styleCounts.extended} tổng hợp, ${styleCounts.olympiad} Olympic; ${visualCount} câu có hình/bảng.`);
    console.log(`Đa dạng: ${structureOwners.size}/${advancedMath10Questions.length} cấu trúc độc lập sau khi loại các con số.`);
    console.log(`Đáp án: ${JSON.stringify(answerCounts)}.`);
    for (const [level, stats] of Object.entries(solutionStats)) {
      console.log(`Lời giải ${level}: trung bình ${(stats.steps / stats.count).toFixed(1)} bước, ${Math.round(stats.words / stats.count)} từ.`);
    }
    console.log(`Bẫy sai: ${mistakeSetOwners.size}/${advancedMath10Questions.length} bộ riêng theo câu.`);
    console.log('Toàn bộ câu hỏi A–D, lời giải và học liệu Toán 10 nâng cao hợp lệ.');
  }
} finally {
  await server.close();
}
