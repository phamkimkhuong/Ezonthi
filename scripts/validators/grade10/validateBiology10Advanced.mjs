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
const authoredDirectory = path.join(process.cwd(), 'src', 'data', 'grade10', 'biology', 'advanced', 'authored');
const authoredFiles = ['method.ts', 'molecule.ts', 'cell.ts', 'transport.ts', 'metabolism.ts', 'division.ts', 'microbe.ts', 'virus.ts'];
const normalizeStructure = value => String(value ?? '')
  .normalize('NFC')
  .toLowerCase()
  .replace(/-?\d+(?:[.,]\d+)?/g, '#')
  .replace(/\s+/g, ' ')
  .trim();
const collectStrings = (value, output = []) => {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) value.forEach(item => collectStrings(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collectStrings(item, output));
  return output;
};
const checkLatex = (owner, value) => {
  const opens = value.match(/\\\(/g)?.length ?? 0;
  const closes = value.match(/\\\)/g)?.length ?? 0;
  if (opens !== closes) errors.push(`${owner}: cặp \\( ... \\) không cân bằng.`);
  for (const match of value.matchAll(/\\\((.*?)\\\)|\\\[(.*?)\\\]|\$\$(.*?)\$\$|\$(.*?)\$/gs)) {
    const formula = match.slice(1).find(part => part !== undefined) ?? '';
    try {
      katex.renderToString(formula, { throwOnError: true, strict: false });
    } catch (error) {
      errors.push(`${owner}: KaTeX không đọc được “${formula}” (${error.message}).`);
    }
  }
};
const assertUnique = (items, key, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) errors.push(`${label} trùng ${key}: ${item[key]}.`);
    seen.add(item[key]);
  }
};

try {
  for (const fileName of authoredFiles) {
    const source = fs.readFileSync(path.join(authoredDirectory, fileName), 'utf8');
    const count = (source.match(/bioProblem\(topicId,/g) ?? []).length;
    if (count !== 18) errors.push(`${fileName}: cần 18 bài biên soạn, hiện có ${count}.`);
  }

  const { advancedBiology10Topics, advancedBiology10Questions, advancedBiology10Solutions } =
    await server.ssrLoadModule('/src/data/grade10/biology/advanced/index.ts');

  assertUnique(advancedBiology10Topics, 'id', 'Topic');
  assertUnique(advancedBiology10Questions, 'id', 'Question');
  assertUnique(advancedBiology10Solutions, 'questionId', 'Solution');

  if (advancedBiology10Topics.length !== 8) errors.push(`Cần 8 mảng, hiện có ${advancedBiology10Topics.length}.`);
  if (advancedBiology10Questions.length !== 144) errors.push(`Cần 144 câu, hiện có ${advancedBiology10Questions.length}.`);
  if (advancedBiology10Solutions.length !== 144) errors.push(`Cần 144 lời giải, hiện có ${advancedBiology10Solutions.length}.`);

  const topicIds = new Set(advancedBiology10Topics.map(topic => topic.id));
  const solutionByQuestionId = new Map(advancedBiology10Solutions.map(solution => [solution.questionId, solution]));
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const levelCounts = { hard: 0, very_hard: 0, extreme: 0 };
  const styleCounts = { compact: 0, extended: 0, olympiad: 0 };
  const structureOwners = new Map();
  const signatureOwners = new Map();
  let visualCount = 0;

  for (const topic of advancedBiology10Topics) {
    const count = advancedBiology10Questions.filter(question => question.topicId === topic.id).length;
    if (count !== 18) errors.push(`${topic.id}: cần 18 câu, hiện có ${count}.`);
  }

  for (const [index, question] of advancedBiology10Questions.entries()) {
    const expectedId = `bio10-adv-q${String(index + 1).padStart(3, '0')}`;
    if (question.id !== expectedId) errors.push(`Sai chuỗi ID tại vị trí ${index + 1}: ${question.id}.`);
    if (!topicIds.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
    if (question.subjectId !== 'biology') errors.push(`${question.id}: subjectId phải là biology.`);
    if (question.responseType !== 'single_choice') errors.push(`${question.id}: chỉ chấp nhận single_choice.`);
    if (question.sourceType !== 'manual') errors.push(`${question.id}: câu biên soạn mới phải dùng sourceType manual.`);
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: cần đúng bốn lựa chọn.`);
    if (new Set(question.options).size !== 4) errors.push(`${question.id}: có lựa chọn trùng văn bản.`);
    if (!Object.hasOwn(answerCounts, question.correctAnswer)) errors.push(`${question.id}: đáp án không thuộc A–D.`);
    else answerCounts[question.correctAnswer] += 1;
    if (!Object.hasOwn(levelCounts, question.advancedLevel)) errors.push(`${question.id}: mức độ không hợp lệ.`);
    else levelCounts[question.advancedLevel] += 1;
    if (!Object.hasOwn(styleCounts, question.problemLength)) errors.push(`${question.id}: độ dài bài không hợp lệ.`);
    else styleCounts[question.problemLength] += 1;
    if (!Array.isArray(question.tags) || question.tags.length < 2) errors.push(`${question.id}: cần ít nhất hai tag chuyên môn.`);

    const structure = normalizeStructure([question.stimulus?.title, question.stimulus?.content, question.content].filter(Boolean).join(' '));
    const owner = structureOwners.get(structure);
    if (owner) errors.push(`${question.id}: lặp cấu trúc với ${owner} sau khi loại số.`);
    else structureOwners.set(structure, question.id);
    const signature = `${question.topicId}|${[...question.tags].sort().join('|')}`;
    const signatureOwner = signatureOwners.get(signature);
    if (signatureOwner) errors.push(`${question.id}: lặp dấu vân tay nội dung với ${signatureOwner}.`);
    else signatureOwners.set(signature, question.id);

    if (question.stimulus?.dataTable || (question.stimulus?.media?.length ?? 0) > 0) visualCount += 1;

    const solution = solutionByQuestionId.get(question.id);
    if (!solution) {
      errors.push(`${question.id}: thiếu lời giải.`);
      continue;
    }
    if (solution.finalAnswer !== question.correctAnswer) errors.push(`${question.id}: đáp án và lời giải lệch nhau.`);
    if (!solution.recognition || solution.recognition.length < 120) errors.push(`${question.id}: nhận dạng quá ngắn.`);
    if (!solution.insight || solution.insight.length < 35) errors.push(`${question.id}: mấu chốt quá ngắn.`);
    if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length < 8) errors.push(`${question.id}: lời giải cần ít nhất tám bước/khối giải thích.`);
    if (!Array.isArray(solution.commonMistakes) || solution.commonMistakes.length !== 3) errors.push(`${question.id}: cần phân tích đúng ba phương án nhiễu.`);
    if (!Array.isArray(solution.reviewSuggestions) || solution.reviewSuggestions.length < 2) errors.push(`${question.id}: thiếu gợi ý ôn tập.`);

    collectStrings(question).forEach(value => checkLatex(question.id, value));
    collectStrings(solution).forEach(value => checkLatex(`${question.id}/solution`, value));
  }

  const expectedAnswers = { A: 36, B: 36, C: 36, D: 36 };
  const expectedLevels = { hard: 48, very_hard: 64, extreme: 32 };
  const expectedStyles = { compact: 48, extended: 64, olympiad: 32 };
  for (const key of Object.keys(expectedAnswers)) if (answerCounts[key] !== expectedAnswers[key]) errors.push(`Đáp án ${key}: cần ${expectedAnswers[key]}, hiện có ${answerCounts[key]}.`);
  for (const key of Object.keys(expectedLevels)) if (levelCounts[key] !== expectedLevels[key]) errors.push(`Mức ${key}: cần ${expectedLevels[key]}, hiện có ${levelCounts[key]}.`);
  for (const key of Object.keys(expectedStyles)) if (styleCounts[key] !== expectedStyles[key]) errors.push(`Kiểu ${key}: cần ${expectedStyles[key]}, hiện có ${styleCounts[key]}.`);
  if (visualCount < 32) errors.push(`Cần ít nhất 32 câu có bảng/hình, hiện có ${visualCount}.`);

  if (errors.length) {
    console.error(`Sinh học 10 nâng cao chưa hợp lệ (${errors.length} lỗi):`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    console.log(`Sinh học 10 nâng cao: ${advancedBiology10Questions.length} câu / ${advancedBiology10Topics.length} mảng.`);
    console.log(`Mức độ: ${levelCounts.hard} khó, ${levelCounts.very_hard} rất khó, ${levelCounts.extreme} cực khó.`);
    console.log(`Kiến trúc: ${styleCounts.compact} cô đọng, ${styleCounts.extended} tổng hợp, ${styleCounts.olympiad} Olympic; ${visualCount} câu có bảng/hình.`);
    console.log(`Đa dạng: ${structureOwners.size}/144 cấu trúc văn bản và ${signatureOwners.size}/144 dấu vân tay chuyên môn riêng.`);
    console.log(`Đáp án cân bằng: ${JSON.stringify(answerCounts)}.`);
    console.log('Toàn bộ câu hỏi chỉ dùng A–B–C–D và có lời giải bằng chứng–cơ chế–loại nhiễu.');
  }
} finally {
  await server.close();
}
