import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const advancedRoot = path.join(root, 'src', 'data', 'grade10', 'physics', 'advanced');

const readNodeValue = node => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(readNodeValue);
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name.text ?? property.name.getText().replace(/["']/g, '');
      value[key] = readNodeValue(property.initializer);
    }
    return value;
  }
  return node.getText();
};

const readVariable = (fileName, variableName) => {
  const filePath = path.join(advancedRoot, fileName);
  const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
  let result;
  source.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText() === variableName && declaration.initializer) {
        result = readNodeValue(declaration.initializer);
      }
    }
  });
  if (!Array.isArray(result)) throw new Error(`Không đọc được ${variableName} trong ${fileName}.`);
  return result;
};

const topics = readVariable('topics.ts', 'advancedPhysics10Topics');
const questions = readVariable('questions.ts', 'seeds');
const solutions = readVariable('solutions.ts', 'seeds');
const errors = [];

const assertUnique = (items, key, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) errors.push(`${label} trùng ${key}: ${item[key]}`);
    seen.add(item[key]);
  }
};

assertUnique(topics, 'id', 'Topic');
assertUnique(questions, 'id', 'Question');
assertUnique(solutions, 'questionId', 'Solution');

if (topics.length !== 7) errors.push(`Cần đúng 7 mảng chuyên đề, hiện có ${topics.length}.`);
if (questions.length !== 168) errors.push(`Ngân hàng cần 168 câu, hiện có ${questions.length}.`);
if (solutions.length !== questions.length) errors.push(`Số lời giải ${solutions.length} không khớp số câu ${questions.length}.`);

const topicIds = new Set(topics.map(topic => topic.id));
const solutionByQuestionId = new Map(solutions.map(solution => [solution.questionId, solution]));
const validLevels = new Set(['hard', 'very_hard', 'extreme']);
const validProblemLengths = new Set(['compact', 'extended', 'olympiad']);
const validAnswers = new Set(['A', 'B', 'C', 'D']);
const answerIndex = { A: 0, B: 1, C: 2, D: 3 };
const provenanceFields = ['source', 'sourceType', 'year', 'province', 'issuer', 'school'];

for (const topic of topics) {
  const count = questions.filter(question => question.topicId === topic.id).length;
  if (count !== 24) errors.push(`${topic.id}: cần 24 câu, hiện có ${count}.`);
}

for (const question of questions) {
  if (!topicIds.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
  if (!validLevels.has(question.level)) errors.push(`${question.id}: mức độ không hợp lệ (${question.level}).`);
  const problemLength = question.problemLength ?? 'compact';
  if (!validProblemLengths.has(problemLength)) errors.push(`${question.id}: kiểu độ dài không hợp lệ (${problemLength}).`);
  if (!Number.isFinite(question.minutes) || question.minutes < 4) errors.push(`${question.id}: thời gian ước tính quá thấp hoặc không hợp lệ.`);
  if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: phải có đúng 4 phương án.`);
  if (!validAnswers.has(question.answer)) errors.push(`${question.id}: đáp án phải là A–D.`);
  if (new Set(question.options).size !== 4) errors.push(`${question.id}: có phương án trùng.`);
  if (!String(question.options?.[answerIndex[question.answer]] ?? '').trim()) errors.push(`${question.id}: phương án đúng bị rỗng.`);
  const readablePromptLength = `${question.stimulus?.content ?? ''} ${question.content ?? ''}`.trim().length;
  if (readablePromptLength < 80) errors.push(`${question.id}: đề bài quá ngắn cho kho nâng cao.`);
  if (!Array.isArray(question.tags) || question.tags.length < 2) errors.push(`${question.id}: cần ít nhất 2 nhãn năng lực.`);
  if (problemLength !== 'compact') {
    const totalPromptLength = `${question.stimulus?.content ?? ''} ${question.content ?? ''}`.trim().length;
    const minimumLength = problemLength === 'olympiad' ? 450 : 350;
    if (totalPromptLength < minimumLength) errors.push(`${question.id}: bài ${problemLength} cần ít nhất ${minimumLength} ký tự dữ kiện, hiện có ${totalPromptLength}.`);
    const media = question.stimulus?.media ?? [];
    for (const item of media) {
      if (!String(item.alt ?? '').trim()) errors.push(`${question.id}: hình ${item.id} thiếu alt.`);
      const mediaPath = path.join(root, 'public', String(item.src ?? '').replace(/^\//, ''));
      if (!fs.existsSync(mediaPath)) errors.push(`${question.id}: thiếu tệp hình ${item.src}.`);
    }
  }
  for (const field of provenanceFields) {
    if (Object.hasOwn(question, field)) errors.push(`${question.id}: không lưu metadata nguồn (${field}).`);
  }

  const solution = solutionByQuestionId.get(question.id);
  if (!solution) {
    errors.push(`${question.id}: thiếu lời giải.`);
    continue;
  }
  if (solution.answer !== question.answer) errors.push(`${question.id}: đáp án câu hỏi và lời giải không khớp.`);
  if (String(solution.insight).trim().length < 45) errors.push(`${question.id}: mấu chốt lời giải quá ngắn.`);
  if (!Array.isArray(solution.steps) || solution.steps.length < 2) errors.push(`${question.id}: lời giải cần ít nhất 2 bước.`);
  if (problemLength !== 'compact' && Array.isArray(solution.steps) && solution.steps.length < 4) errors.push(`${question.id}: bài dài cần lời giải ít nhất 4 bước.`);
  if (!Array.isArray(solution.mistakes) || solution.mistakes.length < 2) errors.push(`${question.id}: cần ít nhất 2 bẫy sai.`);
  if (!Array.isArray(solution.review) || solution.review.length < 1) errors.push(`${question.id}: thiếu gợi ý ôn tập.`);
}

const distribution = Object.fromEntries(
  ['hard', 'very_hard', 'extreme'].map(level => [level, questions.filter(question => question.level === level).length])
);
if (distribution.extreme < 50) errors.push(`Cần ít nhất 50 câu cực khó, hiện có ${distribution.extreme}.`);
if (distribution.very_hard < 65) errors.push(`Cần ít nhất 65 câu rất khó, hiện có ${distribution.very_hard}.`);

const problemLengthDistribution = Object.fromEntries([...validProblemLengths].map(length => [length, questions.filter(question => (question.problemLength ?? 'compact') === length).length]));
if (problemLengthDistribution.extended !== 14) errors.push(`Cần 14 bài tổng hợp dài, hiện có ${problemLengthDistribution.extended}.`);
if (problemLengthDistribution.olympiad !== 14) errors.push(`Cần 14 bài Olympic, hiện có ${problemLengthDistribution.olympiad}.`);
const visualQuestionCount = questions.filter(question => (question.stimulus?.media?.length ?? 0) > 0 || question.stimulus?.dataTable).length;
if (visualQuestionCount < 12) errors.push(`Cần ít nhất 12 bài dài có sơ đồ hoặc bảng, hiện có ${visualQuestionCount}.`);

const displayedAnswerDistribution = Object.fromEntries([...validAnswers].map(answer => [answer, 0]));
for (const question of questions) {
  const sequence = Number(String(question.id).match(/q(\d+)$/)?.[1]);
  const displayedAnswer = [...validAnswers][(sequence - 1) % validAnswers.size];
  if (!Number.isInteger(sequence) || !displayedAnswer) errors.push(`${question.id}: không xác định được vị trí đáp án hiển thị.`);
  else displayedAnswerDistribution[displayedAnswer] += 1;
}
for (const answer of validAnswers) {
  if (displayedAnswerDistribution[answer] !== 42) {
    errors.push(`Đáp án hiển thị ${answer}: cần 42 câu, hiện có ${displayedAnswerDistribution[answer]}.`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log(`Vật lí 10 nâng cao hợp lệ: ${questions.length} câu / ${topics.length} mảng.`);
console.log(`Phân bố: ${distribution.hard} khó, ${distribution.very_hard} rất khó, ${distribution.extreme} cực khó.`);
console.log(`Kiến trúc: ${problemLengthDistribution.compact} cô đọng, ${problemLengthDistribution.extended} tổng hợp dài, ${problemLengthDistribution.olympiad} Olympic; ${visualQuestionCount} bài có sơ đồ/bảng.`);
console.log(`Đáp án hiển thị: ${Object.entries(displayedAnswerDistribution).map(([answer, count]) => `${answer}=${count}`).join(', ')}.`);
console.log('Toàn bộ câu có 4 lựa chọn A–D, lời giải khớp và không lưu metadata nguồn.');
