import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createServer } from 'vite';

const root = process.cwd();
const dataDirectory = path.join(root, 'src', 'data', 'grade10', 'biology');
const modulesDirectory = path.join(dataDirectory, 'modules');

const readNodeValue = node => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.filter(element => !ts.isSpreadElement(element)).map(readNodeValue);
  }
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name.text ?? property.name.getText().replace(/["']/g, '');
      result[key] = readNodeValue(property.initializer);
    }
    return result;
  }
  return node.getText();
};

const readExportedArray = (filePath, exportName) => {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  let result;
  sourceFile.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText() !== exportName || !declaration.initializer) continue;
      if (ts.isArrayLiteralExpression(declaration.initializer)) result = readNodeValue(declaration.initializer);
    }
  });
  if (!result) throw new Error(`Không đọc được ${exportName} trong ${filePath}.`);
  return result;
};

const readFirstMatchingArray = (filePath, suffix) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(new RegExp(`export const (g10BiologyModule\\d+${suffix})`));
  if (!match) throw new Error(`Không tìm thấy export *${suffix} trong ${filePath}.`);
  return readExportedArray(filePath, match[1]);
};

const moduleDirs = fs.readdirSync(modulesDirectory)
  .filter(name => fs.statSync(path.join(modulesDirectory, name)).isDirectory())
  .sort();

const topics = [];
const questionTypes = [];
const questions = [];
const solutions = [];
const outcomes = [];
const misconceptions = [];
const practiceBlueprints = [];
const practiceMetadata = [];

for (const moduleName of moduleDirs) {
  const modulePath = path.join(modulesDirectory, moduleName);
  topics.push(...readFirstMatchingArray(path.join(modulePath, 'topics.ts'), 'Topics'));
  questionTypes.push(...readFirstMatchingArray(path.join(modulePath, 'questionTypes.ts'), 'QuestionTypes'));
  questions.push(...readFirstMatchingArray(path.join(modulePath, 'questions.ts'), 'Questions'));
  solutions.push(...readFirstMatchingArray(path.join(modulePath, 'solutions.ts'), 'Solutions'));
  outcomes.push(...readFirstMatchingArray(path.join(modulePath, 'learningPath.ts'), 'Outcomes'));
  misconceptions.push(...readFirstMatchingArray(path.join(modulePath, 'learningPath.ts'), 'Misconceptions'));
  const blueprintPath = path.join(modulePath, 'practiceBlueprint.ts');
  const metadataPath = path.join(modulePath, 'practiceMetadata.ts');
  if (fs.existsSync(blueprintPath)) practiceBlueprints.push(...readFirstMatchingArray(blueprintPath, 'PracticeBlueprints'));
  if (fs.existsSync(metadataPath)) practiceMetadata.push(...readFirstMatchingArray(metadataPath, 'PracticeMetadata'));
}

// Các module đã chuẩn hóa có thể tạo câu hỏi/metadata từ seed đã biên soạn.
// Nạp đúng dữ liệu runtime thay vì chỉ đọc array literal để validator nhìn thấy
// toàn bộ ngân hàng mà ứng dụng thực sự sử dụng.
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true }
});
try {
  const [questionModule, solutionModule, metadataModule] = await Promise.all([
    vite.ssrLoadModule('/src/data/grade10/biology/questions.ts'),
    vite.ssrLoadModule('/src/data/grade10/biology/solutions.ts'),
    vite.ssrLoadModule('/src/data/grade10/biology/practiceMetadata.ts')
  ]);
  questions.splice(0, questions.length, ...questionModule.g10BiologyQuestions);
  solutions.splice(0, solutions.length, ...solutionModule.g10BiologySolutions);
  practiceMetadata.splice(0, practiceMetadata.length, ...metadataModule.g10BiologyPracticeMetadata);
} finally {
  await vite.close();
}

const errors = [];
const warnings = [];
const topicById = new Map(topics.map(item => [item.id, item]));
const typeById = new Map(questionTypes.map(item => [item.id, item]));
const questionById = new Map(questions.map(item => [item.id, item]));
const solutionByQuestionId = new Map(solutions.map(item => [item.questionId, item]));
const outcomeById = new Map(outcomes.map(item => [item.id, item]));
const misconceptionById = new Map(misconceptions.map(item => [item.id, item]));
const blueprintByTypeId = new Map(practiceBlueprints.map(item => [item.questionTypeId, item]));
const metadataByQuestionId = new Map(practiceMetadata.map(item => [item.questionId, item]));

const LETTERS = ['A', 'B', 'C', 'D'];
const stableHash = value => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const getDisplayAnswer = question => {
  if (question.validatorType !== 'choice' || !LETTERS.includes(question.correctAnswer)) return question.correctAnswer;
  if (!Array.isArray(question.options) || question.options.length !== 4) return question.correctAnswer;
  return LETTERS[stableHash(`${question.id}:answer`) % LETTERS.length];
};

const duplicateKeys = (items, keyOf) => {
  const counts = new Map();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
};

const normalizeQuestionContent = content => String(content)
  .toLocaleLowerCase('vi')
  .replace(/\s+/g, ' ')
  .trim();

// Chặn kiểu mở rộng ngân hàng bằng cách giữ nguyên câu và chỉ thay số.
// Chỉ áp dụng cứng cho phần ngân hàng thích ứng mới để không làm hỏng dữ liệu
// lịch sử trước khi có thể biên tập lại từng câu một cách có chủ đích.
const normalizeNumericTemplate = content => normalizeQuestionContent(content)
  .replace(/\d+(?:[.,]\d+)?/g, '#')
  .replace(/\s+/g, ' ')
  .trim();

for (const [label, items, keyOf] of [
  ['Topic', topics, item => item.id],
  ['Question type', questionTypes, item => item.id],
  ['Question', questions, item => item.id],
  ['Solution', solutions, item => item.questionId],
  ['Outcome', outcomes, item => item.id],
  ['Misconception', misconceptions, item => item.id],
  ['Practice blueprint', practiceBlueprints, item => item.questionTypeId],
  ['Practice metadata', practiceMetadata, item => item.questionId]
]) {
  for (const key of duplicateKeys(items, keyOf)) errors.push(`${label} bị trùng: ${key}.`);
}

for (const content of duplicateKeys(questions, question => normalizeQuestionContent(question.content))) {
  errors.push(`Nội dung câu hỏi bị trùng: "${content.slice(0, 80)}".`);
}

const adaptiveQuestions = questions.filter(question => question.id.startsWith('bio10-adapt-'));
for (const template of duplicateKeys(adaptiveQuestions, question => normalizeNumericTemplate(question.content))) {
  errors.push(`Câu mở rộng chỉ khác dữ kiện số hoặc trùng khuôn: "${template.slice(0, 100)}".`);
}

const adaptiveVariantGroups = new Set(adaptiveQuestions.map(question => question.variantGroupId));
if (adaptiveVariantGroups.size !== adaptiveQuestions.length) {
  errors.push('Ngân hàng mở rộng có variantGroupId bị dùng lại; không thể xác nhận các câu là biến thể độc lập.');
}

let cyclicAnswerTypeCount = 0;

for (const type of questionTypes) {
  if (!topicById.has(type.topicId)) errors.push(`${type.id}: topicId không tồn tại.`);
  if (!questionById.has(type.exampleQuestionId)) errors.push(`${type.id}: exampleQuestionId không tồn tại.`);
  if (!Array.isArray(type.recognitionSigns) || type.recognitionSigns.length < 2) errors.push(`${type.id}: cần ít nhất 2 dấu hiệu nhận biết.`);
  if (!Array.isArray(type.solvingSteps) || type.solvingSteps.length < 3) errors.push(`${type.id}: cần ít nhất 3 bước giải.`);
  if (type.recognitionSigns?.some(sign => sign.includes('Nhận biết qua các thuật ngữ định nghĩa'))) {
    errors.push(`${type.id}: vẫn dùng hướng dẫn chung chung.`);
  }

  const typeQuestions = questions.filter(question => question.questionTypeId === type.id);
  const difficultyCounts = {
    easy: typeQuestions.filter(question => question.difficulty === 'easy').length,
    medium: typeQuestions.filter(question => question.difficulty === 'medium').length,
    hard: typeQuestions.filter(question => question.difficulty === 'hard').length
  };
  if (typeQuestions.length < 12) {
    warnings.push(`${type.id}: mới có ${typeQuestions.length}/12 câu tối thiểu.`);
  }
  if (typeQuestions.length >= 12 && (difficultyCounts.easy < 3 || difficultyCounts.medium < 5 || difficultyCounts.hard < 3)) {
    warnings.push(`${type.id}: phân tầng chưa đạt gợi ý 3 dễ – 5 trung bình – 3 khó.`);
  }

  if (typeQuestions.length >= 12) {
    const answerCounts = Object.fromEntries(
      ['A', 'B', 'C', 'D'].map(label => [
        label,
        typeQuestions.filter(question => question.correctAnswer === label).length
      ])
    );
    const [dominantAnswer, dominantCount] = Object.entries(answerCounts)
      .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0];
    const missingAnswers = Object.entries(answerCounts)
      .filter(([, count]) => count === 0)
      .map(([label]) => label);

    if (dominantCount / typeQuestions.length > 0.5) {
      warnings.push(`${type.id}: đáp án ${dominantAnswer} chiếm ${dominantCount}/${typeQuestions.length} câu; cần đảo vị trí phương án để tránh học sinh đoán mẫu.`);
    }
    if (missingAnswers.length > 0) {
      warnings.push(`${type.id}: chưa có đáp án đúng ở vị trí ${missingAnswers.join(', ')}.`);
    }

    const followsAbcdCycle = typeQuestions.every(
      (question, index) => question.correctAnswer === LETTERS[index % LETTERS.length]
    );
    if (followsAbcdCycle) cyclicAnswerTypeCount += 1;
  }
}

if (cyclicAnswerTypeCount > 0) {
  warnings.push(`${cyclicAnswerTypeCount}/${questionTypes.length} dạng có khóa đáp án nguồn theo chu kì ABCD; tầng hiển thị phải tiếp tục hoán vị ổn định.`);
}

for (const topic of topics) {
  const topicQuestions = questions.filter(question => question.topicId === topic.id && LETTERS.includes(question.correctAnswer));
  if (topicQuestions.length === 0) continue;
  const displayCounts = Object.fromEntries(LETTERS.map(letter => [
    letter,
    topicQuestions.filter(question => getDisplayAnswer(question) === letter).length
  ]));
  const [dominantAnswer, dominantCount] = Object.entries(displayCounts)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0];
  if (dominantCount / topicQuestions.length > 0.4) {
    errors.push(`${topic.id}: đáp án hiển thị ${dominantAnswer} chiếm ${dominantCount}/${topicQuestions.length} câu.`);
  }
}

const subtypeById = new Map();
for (const blueprint of practiceBlueprints) {
  if (!typeById.has(blueprint.questionTypeId)) errors.push(`${blueprint.questionTypeId}: blueprint trỏ tới dạng không tồn tại.`);
  if (!Array.isArray(blueprint.subTypes) || blueprint.subTypes.length === 0) {
    errors.push(`${blueprint.questionTypeId}: blueprint chưa có dạng con.`);
    continue;
  }
  for (const subtype of blueprint.subTypes) {
    if (!subtype.id) errors.push(`${blueprint.questionTypeId}: dạng con thiếu id.`);
    if (subtypeById.has(subtype.id)) errors.push(`Dạng con bị trùng: ${subtype.id}.`);
    subtypeById.set(subtype.id, { ...subtype, questionTypeId: blueprint.questionTypeId });
  }
}

for (const metadata of practiceMetadata) {
  const question = questionById.get(metadata.questionId);
  const subtype = subtypeById.get(metadata.subTypeId);
  if (!question) errors.push(`${metadata.questionId}: metadata không có câu hỏi tương ứng.`);
  if (!subtype) errors.push(`${metadata.questionId}: subTypeId không tồn tại (${metadata.subTypeId}).`);
  if (question && subtype && question.questionTypeId !== subtype.questionTypeId) {
    errors.push(`${metadata.questionId}: dạng con ${metadata.subTypeId} không thuộc ${question.questionTypeId}.`);
  }
}

for (const blueprint of practiceBlueprints) {
  const typeQuestions = questions.filter(question => question.questionTypeId === blueprint.questionTypeId);
  let hasReachedQuestionTarget = true;
  for (const question of typeQuestions) {
    if (!metadataByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu practice metadata.`);
  }
  for (const subtype of blueprint.subTypes ?? []) {
    const subtypeMetadata = practiceMetadata.filter(metadata => metadata.subTypeId === subtype.id);
    const currentCount = subtypeMetadata.length;
    const targetCount = Number(subtype.targetQuestionCount ?? 12);
    if (currentCount < targetCount) {
      hasReachedQuestionTarget = false;
      warnings.push(`${subtype.id}: hiện có ${currentCount}/${targetCount} câu mục tiêu.`);
    }
    if (currentCount >= targetCount && targetCount === 12) {
      const subtypeQuestions = subtypeMetadata
        .map(metadata => questionById.get(metadata.questionId))
        .filter(Boolean);
      const difficultyCounts = Object.fromEntries(['easy', 'medium', 'hard'].map(difficulty => [
        difficulty,
        subtypeQuestions.filter(question => question.difficulty === difficulty).length
      ]));
      if (difficultyCounts.easy !== 3 || difficultyCounts.medium !== 5 || difficultyCounts.hard !== 4) {
        errors.push(
          `${subtype.id}: phân bố độ khó phải là 3 dễ - 5 vừa - 4 khó; hiện có ` +
          `${difficultyCounts.easy} - ${difficultyCounts.medium} - ${difficultyCounts.hard}.`
        );
      }
    }
  }

  const typeMetadata = practiceMetadata.filter(metadata => {
    const subtype = subtypeById.get(metadata.subTypeId);
    return subtype?.questionTypeId === blueprint.questionTypeId;
  });
  const requiredRoles = blueprint.coverage?.requiredPracticeRoles ?? [];
  const presentRoles = new Set(typeMetadata.map(metadata => metadata.practiceRole));
  for (const role of requiredRoles) {
    if (!presentRoles.has(role)) errors.push(`${blueprint.questionTypeId}: thiếu practice role ${role}.`);
  }
  const requiredRepresentations = blueprint.coverage?.requiredRepresentations ?? [];
  const presentRepresentations = new Set(typeMetadata.map(metadata => metadata.representationType));
  for (const representation of requiredRepresentations) {
    if (!presentRepresentations.has(representation)) {
      const message = `${blueprint.questionTypeId}: thiếu representation ${representation}.`;
      if (hasReachedQuestionTarget) errors.push(message);
      else warnings.push(message);
    }
  }
  const masteryHoldoutCount = typeMetadata.filter(metadata => metadata.practiceRole === 'mastery_holdout').length;
  const requiredHoldoutCount = Number(blueprint.coverage?.masteryHoldoutCount ?? 0);
  if (masteryHoldoutCount < requiredHoldoutCount) {
    errors.push(`${blueprint.questionTypeId}: mới có ${masteryHoldoutCount}/${requiredHoldoutCount} câu mastery holdout.`);
  }
}

const validateMedia = (media, ownerId) => {
  if (!media.id || !media.type || !media.src) errors.push(`${ownerId}: media thiếu id/type/src.`);
  if (!media.alt?.trim()) errors.push(`${ownerId}/${media.id}: media thiếu alt text.`);
  if (!media.width || !media.height) warnings.push(`${ownerId}/${media.id}: nên khai báo width và height để tránh layout shift.`);
};

for (const question of questions) {
  const type = typeById.get(question.questionTypeId);
  if (question.subjectId !== 'biology') errors.push(`${question.id}: subjectId phải là biology.`);
  if (!topicById.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
  if (!type) errors.push(`${question.id}: questionTypeId không tồn tại.`);
  if (type && type.topicId !== question.topicId) errors.push(`${question.id}: topic lệch với question type.`);
  if (!solutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
  if (question.responseType !== 'single_choice') warnings.push(`${question.id}: kiểm tra responseType (${question.responseType}).`);
  if (!Array.isArray(question.outcomeIds) || question.outcomeIds.length === 0) errors.push(`${question.id}: thiếu outcomeIds.`);
  for (const outcomeId of question.outcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${question.id}: outcomeId không tồn tại (${outcomeId}).`);
  }
  if (!String(question.competency).startsWith('biological_')) errors.push(`${question.id}: competency chưa phải năng lực Sinh học.`);
  if (question.responseType === 'single_choice') {
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push(`${question.id}: câu một lựa chọn phải có đúng 4 phương án.`);
    } else {
      const optionLabels = question.options.map(option => String(option).match(/^([A-D])\./)?.[1]);
      if (optionLabels.some(label => !label) || new Set(optionLabels).size !== 4) {
        errors.push(`${question.id}: nhãn phương án phải là A, B, C, D và không trùng.`);
      }
      const normalizedOptionContents = question.options.map(option => String(option)
        .replace(/^[A-D]\.\s*/, '')
        .toLocaleLowerCase('vi')
        .replace(/\s+/g, ' ')
        .trim());
      if (new Set(normalizedOptionContents).size !== normalizedOptionContents.length) {
        errors.push(`${question.id}: có phương án trùng nội dung.`);
      }
      if (!optionLabels.includes(question.correctAnswer)) {
        errors.push(`${question.id}: correctAnswer không tồn tại trong options.`);
      }
    }
  }
  for (const media of question.media ?? []) validateMedia(media, question.id);
  for (const media of question.stimulus?.media ?? []) validateMedia(media, question.id);

  const table = question.stimulus?.dataTable;
  if (table) {
    if (!table.caption?.trim()) errors.push(`${question.id}: bảng dữ liệu thiếu caption.`);
    const columnKeys = new Set((table.columns ?? []).map(column => column.key));
    if (columnKeys.size === 0) errors.push(`${question.id}: bảng dữ liệu chưa có cột.`);
    for (const [rowIndex, row] of (table.rows ?? []).entries()) {
      for (const key of columnKeys) {
        if (!(key in row)) errors.push(`${question.id}: dòng ${rowIndex + 1} thiếu cột ${key}.`);
      }
    }
  }
}

for (const solution of solutions) {
  const question = questionById.get(solution.questionId);
  if (!question) errors.push(`${solution.id}: không có câu hỏi tương ứng.`);
  if (question && solution.finalAnswer !== question.correctAnswer) errors.push(`${solution.id}: đáp án lệch câu hỏi.`);
  if (!solution.recognition?.trim() || solution.recognition.trim().length < 20) {
    errors.push(`${solution.id}: phần nhận dạng dạng bài còn thiếu hoặc quá chung chung.`);
  }
  if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length < 2) errors.push(`${solution.id}: lời giải quá ngắn.`);
  if (solution.commonMistakes?.some(item => item.includes('dựa trên cảm tính'))) errors.push(`${solution.id}: lỗi sai vẫn còn chung chung.`);
  const serializedSolution = JSON.stringify(solution);
  if (/\b(undefined|null|todo|tbd)\b/i.test(serializedSolution)) {
    errors.push(`${solution.id}: lời giải còn placeholder hoặc dữ liệu sinh lỗi.`);
  }
}

for (const outcome of outcomes) {
  if (!topicById.has(outcome.topicId)) errors.push(`${outcome.id}: topicId không tồn tại.`);
  for (const prerequisiteId of outcome.prerequisiteOutcomeIds ?? []) {
    if (!outcomeById.has(prerequisiteId)) errors.push(`${outcome.id}: prerequisite không tồn tại (${prerequisiteId}).`);
    if (prerequisiteId === outcome.id) errors.push(`${outcome.id}: không thể tự làm prerequisite.`);
  }
  for (const typeId of outcome.questionTypeIds ?? []) {
    if (!typeById.has(typeId)) errors.push(`${outcome.id}: questionTypeId không tồn tại (${typeId}).`);
  }
  for (const misconceptionId of outcome.misconceptionIds ?? []) {
    const misconception = misconceptionById.get(misconceptionId);
    if (!misconception) errors.push(`${outcome.id}: misconception không tồn tại (${misconceptionId}).`);
    if (misconception && misconception.outcomeId !== outcome.id) errors.push(`${outcome.id}: misconception ${misconceptionId} trỏ sai outcome.`);
  }
  if (!Array.isArray(outcome.evidenceTypes) || outcome.evidenceTypes.length === 0) errors.push(`${outcome.id}: thiếu evidenceTypes.`);
  const directQuestionCount = questions.filter(question => (question.outcomeIds ?? []).includes(outcome.id)).length;
  if (directQuestionCount < 4) warnings.push(`${outcome.id}: mới có ${directQuestionCount} câu trực tiếp; chưa đủ kiểm tra ổn định.`);
}

const outcomesWithoutTypes = outcomes.filter(outcome => (outcome.questionTypeIds ?? []).length === 0);
if (outcomesWithoutTypes.length > 0) {
  warnings.push(`${outcomesWithoutTypes.length}/${outcomes.length} outcomes chưa có micro-type trực tiếp; cần bổ sung ở giai đoạn mở rộng ngân hàng.`);
}

for (const misconception of misconceptions) {
  if (!outcomeById.has(misconception.outcomeId)) errors.push(`${misconception.id}: outcomeId không tồn tại.`);
  if (!misconception.statement?.trim() || !misconception.correction?.trim()) errors.push(`${misconception.id}: thiếu phát biểu hoặc cách sửa.`);
}

for (const topic of topics) {
  const topicOutcomes = outcomes.filter(outcome => outcome.topicId === topic.id);
  if (topicOutcomes.length < 5) errors.push(`${topic.id}: mới có ${topicOutcomes.length} outcomes; cần ít nhất 5.`);
  const topicQuestions = questions.filter(question => question.topicId === topic.id);
  if (topicQuestions.length < 12) warnings.push(`${topic.id}: hiện mới có ${topicQuestions.length} câu; đây mới là dữ liệu khung.`);
}

console.log(`Sinh học 10: ${topics.length} module, ${outcomes.length} outcomes, ${misconceptions.length} misconceptions, ${questionTypes.length} nhóm dạng, ${subtypeById.size} dạng con đã blueprint, ${questions.length} câu, ${solutions.length} lời giải.`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

console.log('Dữ liệu Sinh học 10 hợp lệ.');
