import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const dataDirectory = path.join(root, 'src', 'data', 'grade10', 'math');
const modulesDirectory = path.join(dataDirectory, 'modules');
const publicDirectory = path.join(root, 'public');

const readNodeValue = node => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isCallExpression(node)) {
    const callee = node.expression.getText();
    if (['mcq', 'short', 'tf'].includes(callee) && node.arguments[0]) return readNodeValue(node.arguments[0]);
    if (callee === 'ids' && node.arguments.length === 2) {
      const prefix = readNodeValue(node.arguments[0]);
      const count = readNodeValue(node.arguments[1]);
      return Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`);
    }
    if (callee === 'midtermIds' && node.arguments.length === 1) {
      const prefix = readNodeValue(node.arguments[0]);
      const ids = count => Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(2, '0')}`);
      return [
        ...ids(4),
        ...Array.from({ length: 8 }, (_, index) => `${prefix}${String(index + 11).padStart(2, '0')}`),
        `${prefix}05`, `${prefix}06`, `${prefix}19`, `${prefix}20`,
        `${prefix}07`, `${prefix}08`, `${prefix}09`, `${prefix}10`, `${prefix}21`, `${prefix}22`
      ];
    }
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.filter(item => !ts.isSpreadElement(item)).map(readNodeValue);
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name.getText().replace(/["']/g, '');
      result[key] = readNodeValue(property.initializer);
    }
    return result;
  }
  return node.getText();
};

const readExportedArray = (filePath, exportName) => {
  const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
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

const readFirstMatchingArray = (filePath, pattern) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(pattern);
  if (!match) throw new Error(`Không tìm thấy export phù hợp trong ${filePath}.`);
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
const blueprints = [];
const metadata = [];

for (const moduleName of moduleDirs) {
  const modulePath = path.join(modulesDirectory, moduleName);
  topics.push(...readFirstMatchingArray(path.join(modulePath, 'topics.ts'), /export const (g10MathModule\d+Topics)/));
  questionTypes.push(...readFirstMatchingArray(path.join(modulePath, 'questionTypes.ts'), /export const (g10MathModule\d+QuestionTypes)/));
  questions.push(...readFirstMatchingArray(path.join(modulePath, 'questions.ts'), /export const (g10MathModule\d+Questions)/));
  solutions.push(...readFirstMatchingArray(path.join(modulePath, 'solutions.ts'), /export const (g10MathModule\d+Solutions)/));
  outcomes.push(...readFirstMatchingArray(path.join(modulePath, 'learningPath.ts'), /export const (g10MathModule\d+Outcomes)/));
  misconceptions.push(...readFirstMatchingArray(path.join(modulePath, 'learningPath.ts'), /export const (g10MathModule\d+Misconceptions)/));
  blueprints.push(...readFirstMatchingArray(path.join(modulePath, 'practiceBlueprint.ts'), /export const (g10MathModule\d+PracticeBlueprints)/));
  metadata.push(...readFirstMatchingArray(path.join(modulePath, 'practiceMetadata.ts'), /export const (g10MathModule\d+PracticeMetadata)/));

  const practiceExpansionFile = path.join(modulePath, 'practiceExpansion.ts');
  if (fs.existsSync(practiceExpansionFile)) {
    const expansionSeeds = readExportedArray(practiceExpansionFile, 'g10MathPracticeExpansionSeeds');
    for (const seed of expansionSeeds) {
      const questionTypeId = seed.subTypeId.replace(/-st\d+$/, '');
      const topicId = questionTypes.find(item => item.id === questionTypeId)?.topicId;
      questions.push({
        id: seed.id,
        subjectId: 'math',
        topicId,
        questionTypeId,
        content: seed.content,
        responseType: 'short_answer',
        difficulty: seed.difficulty,
        sourceType: 'manual',
        correctAnswer: seed.correctAnswer,
        acceptedAnswers: [seed.correctAnswer],
        validatorType: 'number',
        ...(Array.isArray(seed.media) ? { media: seed.media } : {})
      });
      solutions.push({
        id: seed.id.replace('-q', '-s'),
        questionId: seed.id,
        recognition: `Dạng mở rộng ${seed.subTypeId}.`,
        detailedSteps: seed.reasoning.map((explanation, index) => ({
          order: index + 1,
          explanation
        })),
        finalAnswer: seed.correctAnswer,
        commonMistakes: ['Cần kiểm tra mô hình đếm.']
      });
      metadata.push({
        questionId: seed.id,
        subTypeId: seed.subTypeId,
        practiceRole: seed.practiceRole,
        representationType: seed.representationType,
        ...(seed.practiceRole === 'mastery_holdout' ? { isMasteryHoldout: true } : {})
      });
    }
  }

  const curriculumExpansionFile = path.join(modulePath, 'curriculumExpansion.ts');
  if (fs.existsSync(curriculumExpansionFile)) {
    const curriculumSeeds = readExportedArray(curriculumExpansionFile, 'specs');
    const difficultyOverrides = new Map(
      readExportedArray(curriculumExpansionFile, 'difficultyOverrides').map(item => [item.id, item.difficulty])
    );
    const subtypePositions = new Map();
    const roleCycle = ['guided', 'near_transfer', 'representation_switch', 'misconception_check', 'far_transfer', 'retention'];
    for (const seed of curriculumSeeds) {
      seed.difficulty = difficultyOverrides.get(seed.id) ?? seed.difficulty;
      const position = subtypePositions.get(seed.subTypeId) ?? 0;
      subtypePositions.set(seed.subTypeId, position + 1);
      const questionTypeId = seed.questionTypeId ?? seed.subTypeId.replace(/-st\d+$/, '');
      const topicId = questionTypes.find(item => item.id === questionTypeId)?.topicId;
      questions.push({
        id: seed.id,
        subjectId: 'math',
        topicId,
        questionTypeId,
        content: seed.content,
        responseType: 'single_choice',
        options: seed.options,
        correctAnswer: seed.correctAnswer,
        acceptedAnswers: [seed.correctAnswer],
        validatorType: 'choice',
        difficulty: seed.difficulty,
        sourceType: 'manual',
        ...(seed.mediaSrc ? { media: [{ id: `${seed.id}-media`, src: seed.mediaSrc, alt: seed.mediaAlt, width: 720, height: 420 }] } : {})
      });
      solutions.push({
        id: `${seed.id}-solution`,
        questionId: seed.id,
        recognition: questionTypeId,
        detailedSteps: [seed.reasoning],
        finalAnswer: `${seed.correctAnswer}. ${(seed.options ?? [])[seed.correctAnswer.charCodeAt(0) - 65]?.replace(/^[A-D]\.\s*/, '') ?? ''}`,
        commonMistakes: [seed.mistake]
      });
      metadata.push({
        questionId: seed.id,
        subTypeId: seed.subTypeId,
        practiceRole: position >= 10 ? 'mastery_holdout' : roleCycle[position % roleCycle.length],
        representationType: seed.representationType,
        ...(position >= 10 ? { isMasteryHoldout: true } : {})
      });
    }
  }
}

for (const question of questions) {
  if (question.questionTypeId === 'math10-qt13') question.topicId = 'math10-t9';
}

const assessmentQuestions = readExportedArray(path.join(dataDirectory, 'assessments', 'questions.ts'), 'g10MathAssessmentQuestions');
const assessmentSolutions = readExportedArray(path.join(dataDirectory, 'assessments', 'solutions.ts'), 'g10MathAssessmentSolutions');
const exams = readExportedArray(path.join(dataDirectory, 'assessments', 'exams.ts'), 'g10MathAssessmentExams');
const semester2DataFile = path.join(dataDirectory, 'assessments', 'semester2', 'data.ts');
const semester2Seeds = ['mid2A', 'mid2B', 'final2A', 'final2B'].flatMap(name => readExportedArray(semester2DataFile, name));
assessmentQuestions.push(...semester2Seeds);
assessmentSolutions.push(...semester2Seeds.map(item => ({
  questionId: item.id,
  recognition: item.questionTypeId,
  detailedSteps: [item.explanation, `Kết luận: ${item.correctAnswer ?? 'đánh giá từng phát biểu'}.`],
  commonMistakes: [item.mistake]
})));
const midtermExpansionFile = path.join(dataDirectory, 'assessments', 'midtermExpansion.ts');
const midtermExpansionSeeds = readExportedArray(midtermExpansionFile, 'g10MathMidtermExpansionSeeds');
assessmentQuestions.push(...midtermExpansionSeeds);
assessmentSolutions.push(...midtermExpansionSeeds.map(item => ({
  questionId: item.id,
  recognition: item.recognition,
  detailedSteps: item.analyses ?? item.reasoning,
  commonMistakes: [item.mistake]
})));
exams.push(...readExportedArray(path.join(dataDirectory, 'assessments', 'semester2', 'exams.ts'), 'g10MathSemester2AssessmentExams'));

const responseTypeOf = question => {
  if (question.responseType) return question.responseType;
  if (Array.isArray(question.options)) return 'single_choice';
  if (Array.isArray(question.statements)) return 'true_false_cluster';
  return 'short_answer';
};

const semester1MidtermQuestionIds = new Set([
  ...Array.from({ length: 10 }, (_, index) => `mock-math10-q${index + 1}`),
  ...Array.from({ length: 10 }, (_, index) => `mock-math10-q${index + 21}`),
  ...Array.from({ length: 24 }, (_, index) => `mock-math10-q${index + 75}`)
]);

for (const question of assessmentQuestions) {
  question.responseType = responseTypeOf(question);
  if (semester1MidtermQuestionIds.has(question.id) || question.id.startsWith('math10-assess-mid2-')) {
    question.points = question.responseType === 'single_choice' ? 0.25 : question.responseType === 'true_false_cluster' ? 1 : 0.5;
  }
}

const practiceChoices = readExportedArray(
  path.join(dataDirectory, 'practiceChoices.ts'),
  'g10MathPracticeChoices'
);
const legacyInputQuestionIds = new Set(
  questions
    .filter(question => !Array.isArray(question.options) || question.options.length === 0)
    .map(question => question.id)
);
const practiceChoiceByQuestionId = new Map(
  practiceChoices.map(choice => [choice.id, choice])
);

for (const question of questions) {
  const choice = practiceChoiceByQuestionId.get(question.id);
  if (!choice) continue;
  delete question.answerSchema;
  question.responseType = 'single_choice';
  question.options = choice.options;
  question.correctAnswer = choice.correctAnswer;
  question.acceptedAnswers = [choice.correctAnswer, choice.correctAnswer.toLowerCase()];
  question.validatorType = 'choice';
}

for (const solution of solutions) {
  const choice = practiceChoiceByQuestionId.get(solution.questionId);
  if (!choice) continue;
  const answerIndex = choice.correctAnswer.charCodeAt(0) - 65;
  solution.finalAnswer = choice.options[answerIndex];
}

const errors = [];
const warnings = [];
const mediaIds = new Set();
const duplicateKeys = (items, keyOf) => {
  const counts = new Map();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
};

for (const [label, items, keyOf] of [
  ['Topic', topics, item => item.id],
  ['Question type', questionTypes, item => item.id],
  ['Question', questions, item => item.id],
  ['Solution', solutions, item => item.questionId],
  ['Outcome', outcomes, item => item.id],
  ['Misconception', misconceptions, item => item.id],
  ['Practice blueprint', blueprints, item => item.questionTypeId],
  ['Practice metadata', metadata, item => item.questionId],
  ['Practice choice', practiceChoices, item => item.id],
  ['Assessment question', assessmentQuestions, item => item.id],
  ['Assessment solution', assessmentSolutions, item => item.questionId],
  ['Exam', exams, item => item.id]
]) {
  for (const key of duplicateKeys(items, keyOf)) errors.push(`${label} bị trùng: ${key}.`);
}

const topicById = new Map(topics.map(item => [item.id, item]));
const typeById = new Map(questionTypes.map(item => [item.id, item]));
const questionById = new Map(questions.map(item => [item.id, item]));
const solutionByQuestionId = new Map(solutions.map(item => [item.questionId, item]));
const outcomeById = new Map(outcomes.map(item => [item.id, item]));
const misconceptionById = new Map(misconceptions.map(item => [item.id, item]));
const metadataByQuestionId = new Map(metadata.map(item => [item.questionId, item]));

for (const content of duplicateKeys(questions, item => String(item.content).toLocaleLowerCase('vi').replace(/\s+/g, ' ').trim())) {
  errors.push(`Nội dung câu hỏi luyện tập bị trùng: "${content.slice(0, 90)}".`);
}

if (moduleDirs.length !== 8) errors.push(`Cần đúng 8 module cốt lõi, hiện có ${moduleDirs.length}.`);
if (topics.length !== 9) errors.push(`Cần đúng 9 topic theo hai tập SGK, hiện có ${topics.length}.`);
if (practiceChoices.length !== legacyInputQuestionIds.size) {
  errors.push(`Choice overlay có ${practiceChoices.length} mục nhưng dữ liệu gốc có ${legacyInputQuestionIds.size} câu nhập đáp án.`);
}
for (const questionId of legacyInputQuestionIds) {
  if (!practiceChoiceByQuestionId.has(questionId)) errors.push(`${questionId}: thiếu bộ phương án chuyển đổi A–B–C–D.`);
}
for (const choice of practiceChoices) {
  if (!legacyInputQuestionIds.has(choice.id)) errors.push(`${choice.id}: choice overlay không trỏ tới câu nhập đáp án gốc.`);
}

for (const type of questionTypes) {
  if (!topicById.has(type.topicId)) errors.push(`${type.id}: topicId không tồn tại.`);
  if (type.exampleQuestionId && !questionById.has(type.exampleQuestionId)) errors.push(`${type.id}: exampleQuestionId không tồn tại.`);
  if (!Array.isArray(type.recognitionSigns) || type.recognitionSigns.length < 2) errors.push(`${type.id}: cần ít nhất 2 dấu hiệu nhận biết.`);
  if (!Array.isArray(type.solvingSteps) || type.solvingSteps.length < 3) errors.push(`${type.id}: cần ít nhất 3 bước giải.`);
}

for (const question of questions) {
  if (!topicById.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
  if (!typeById.has(question.questionTypeId)) errors.push(`${question.id}: questionTypeId không tồn tại.`);
  if (!solutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
  if (!metadataByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu practice metadata.`);
  if (question.responseType !== 'single_choice' || question.validatorType !== 'choice') {
    errors.push(`${question.id}: câu luyện tập Toán 10 phải dùng lựa chọn A–B–C–D.`);
  }
  if (question.answerSchema !== undefined) errors.push(`${question.id}: còn answerSchema của ô nhập đáp án.`);
  const mediaItems = [
    ...(Array.isArray(question.stimulus?.media) ? question.stimulus.media : []),
    ...(Array.isArray(question.media) ? question.media : [])
  ];
  for (const media of mediaItems) {
    if (!media?.id?.trim()) errors.push(`${question.id}: media thiếu id.`);
    else if (mediaIds.has(media.id)) errors.push(`${question.id}: media id bị trùng ${media.id}.`);
    else mediaIds.add(media.id);
    if (!media?.alt?.trim()) errors.push(`${question.id}: media ${media?.id ?? '(không id)'} thiếu alt.`);
    if (!media?.src?.trim()) {
      errors.push(`${question.id}: media ${media?.id ?? '(không id)'} thiếu src.`);
    } else if (media.src.startsWith('/')) {
      const assetPath = path.resolve(publicDirectory, media.src.slice(1));
      if (!assetPath.startsWith(`${publicDirectory}${path.sep}`)) errors.push(`${question.id}: đường dẫn media nằm ngoài public.`);
      else if (!fs.existsSync(assetPath)) errors.push(`${question.id}: không tìm thấy media ${media.src}.`);
    }
    if (media.width !== undefined && (!Number.isFinite(media.width) || media.width <= 0)) errors.push(`${question.id}: media width không hợp lệ.`);
    if (media.height !== undefined && (!Number.isFinite(media.height) || media.height <= 0)) errors.push(`${question.id}: media height không hợp lệ.`);
  }
  if (question.validatorType === 'choice') {
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: câu lựa chọn phải có đúng 4 phương án.`);
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) errors.push(`${question.id}: đáp án lựa chọn phải là A, B, C hoặc D.`);
    const semanticOptions = (question.options ?? []).map(option => String(option)
      .replace(/^[A-D]\.\s*/, '')
      .replace(/\\(?:left|right)/g, '')
      .replace(/[{}\s$]/g, '')
      .replace(/,/g, '.')
      .toLocaleLowerCase('vi'));
    if (new Set(semanticOptions).size !== semanticOptions.length) errors.push(`${question.id}: phương án lựa chọn bị trùng về nội dung.`);
    if (Array.isArray(question.acceptedAnswers) && !question.acceptedAnswers.includes(question.correctAnswer)) {
      errors.push(`${question.id}: acceptedAnswers không chứa khóa ${question.correctAnswer}.`);
    }
    const labeledOptions = (question.options ?? []).every(option => /^[A-D]\.\s/.test(String(option)));
    if (labeledOptions) {
      for (const [index, option] of question.options.entries()) {
        const expectedLabel = String.fromCharCode(65 + index);
        if (!String(option).startsWith(`${expectedLabel}. `)) {
          errors.push(`${question.id}: nhãn phương án ở vị trí ${index + 1} phải là ${expectedLabel}.`);
        }
      }
    }
  }
}

for (const solution of solutions) {
  if (!questionById.has(solution.questionId)) errors.push(`${solution.questionId}: lời giải không có câu hỏi.`);
  if (!solution.recognition?.trim()) errors.push(`${solution.questionId}: thiếu phần nhận dạng.`);
  if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length === 0) errors.push(`${solution.questionId}: thiếu các bước giải.`);
  if (!Array.isArray(solution.commonMistakes) || solution.commonMistakes.length === 0) warnings.push(`${solution.questionId}: chưa nêu lỗi thường gặp.`);
  const question = questionById.get(solution.questionId);
  if (question?.validatorType === 'choice' && !String(solution.finalAnswer).startsWith(`${question.correctAnswer}.`)) {
    errors.push(`${solution.questionId}: lời giải không khớp khóa đáp án lựa chọn.`);
  }
}

const practiceAnswerCounts = { A: 0, B: 0, C: 0, D: 0 };
for (const question of questions) {
  if (Object.hasOwn(practiceAnswerCounts, question.correctAnswer)) {
    practiceAnswerCounts[question.correctAnswer] += 1;
  }
}
const answerCountValues = Object.values(practiceAnswerCounts);
if (Math.max(...answerCountValues) - Math.min(...answerCountValues) > 1) {
  errors.push(`Khóa đáp án luyện tập chưa cân bằng: ${JSON.stringify(practiceAnswerCounts)}.`);
}

const subtypeById = new Map();
for (const blueprint of blueprints) {
  if (!typeById.has(blueprint.questionTypeId)) errors.push(`${blueprint.questionTypeId}: blueprint trỏ tới dạng không tồn tại.`);
  for (const subtype of blueprint.subTypes ?? []) {
    if (!subtype.id) errors.push(`${blueprint.questionTypeId}: dạng con thiếu id.`);
    if (subtypeById.has(subtype.id)) errors.push(`Dạng con bị trùng: ${subtype.id}.`);
    subtypeById.set(subtype.id, { ...subtype, questionTypeId: blueprint.questionTypeId });
  }
}

for (const item of metadata) {
  const question = questionById.get(item.questionId);
  const subtype = subtypeById.get(item.subTypeId);
  if (!question) errors.push(`${item.questionId}: metadata không có câu hỏi.`);
  if (!subtype) errors.push(`${item.questionId}: subTypeId ${item.subTypeId} không tồn tại.`);
  if (question && subtype && question.questionTypeId !== subtype.questionTypeId) errors.push(`${item.questionId}: dạng con không thuộc question type của câu.`);
  if (item.practiceRole === 'mastery_holdout' && !item.isMasteryHoldout) errors.push(`${item.questionId}: mastery_holdout phải có isMasteryHoldout=true.`);
}

let completedSubtypeCount = 0;
const requiredRoles = ['guided', 'near_transfer', 'representation_switch', 'misconception_check', 'far_transfer', 'retention', 'mastery_holdout'];
for (const [subtypeId, subtype] of subtypeById) {
  const subtypeQuestions = metadata.filter(item => item.subTypeId === subtypeId);
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const item of subtypeQuestions) {
    const difficulty = questionById.get(item.questionId)?.difficulty;
    if (difficulty) counts[difficulty] += 1;
  }
  const holdouts = subtypeQuestions.filter(item => item.isMasteryHoldout).length;
  const target = subtype.targetQuestionCount ?? 12;
  if (subtypeQuestions.length < target) warnings.push(`${subtypeId}: ${subtypeQuestions.length}/${target} câu; phân tầng ${counts.easy} dễ – ${counts.medium} vừa – ${counts.hard} khó; holdout ${holdouts}/2.`);
  else {
    completedSubtypeCount += 1;
    if (counts.easy < 3 || counts.medium < 5 || counts.hard < 3) warnings.push(`${subtypeId}: đủ số lượng nhưng phân tầng chưa đạt tối thiểu 3 dễ – 5 vừa – 3 khó.`);
    if (holdouts < 2) warnings.push(`${subtypeId}: đủ số lượng nhưng mới có ${holdouts}/2 mastery holdout.`);
    const roles = new Set(subtypeQuestions.map(item => item.practiceRole));
    const missingRoles = requiredRoles.filter(role => !roles.has(role));
    if (missingRoles.length > 0) warnings.push(`${subtypeId}: thiếu vai trò luyện tập ${missingRoles.join(', ')}.`);
  }
}

for (const outcome of outcomes) {
  if (!topicById.has(outcome.topicId)) errors.push(`${outcome.id}: topicId không tồn tại.`);
  for (const typeId of outcome.questionTypeIds ?? []) if (!typeById.has(typeId)) errors.push(`${outcome.id}: questionTypeId ${typeId} không tồn tại.`);
  for (const prerequisiteId of outcome.prerequisiteOutcomeIds ?? []) if (!outcomeById.has(prerequisiteId)) errors.push(`${outcome.id}: prerequisite ${prerequisiteId} không tồn tại.`);
  for (const misconceptionId of outcome.misconceptionIds ?? []) if (!misconceptionById.has(misconceptionId)) errors.push(`${outcome.id}: misconception ${misconceptionId} không tồn tại.`);
  if ((outcome.questionTypeIds ?? []).length === 0) warnings.push(`${outcome.id}: chưa có dạng luyện tập ánh xạ.`);
}

for (const misconception of misconceptions) {
  if (!outcomeById.has(misconception.outcomeId)) errors.push(`${misconception.id}: outcomeId không tồn tại.`);
}

for (const topic of topics) {
  const topicTypeCount = questionTypes.filter(item => item.topicId === topic.id).length;
  const topicQuestionCount = questions.filter(item => item.topicId === topic.id).length;
  if (topicTypeCount === 0 || topicQuestionCount === 0) warnings.push(`${topic.id} (${topic.name}): ${topicTypeCount} dạng, ${topicQuestionCount} câu.`);
}

const assessmentQuestionById = new Map(assessmentQuestions.map(item => [item.id, item]));
const assessmentSolutionByQuestionId = new Map(assessmentSolutions.map(item => [item.questionId, item]));
const referencedAssessmentIds = new Set();
const assessmentBlueprintIds = new Set([
  'math10-blueprint-midterm1-auto-v2',
  'math10-blueprint-final1-auto-v2',
  'math10-blueprint-midterm2-auto-v2',
  'math10-blueprint-final2-v1'
]);
const officialPeriodicExams = [];
for (const exam of exams) {
  if (!Array.isArray(exam.questionIds) || exam.questionIds.length === 0) errors.push(`${exam.id}: đề chưa có câu hỏi.`);
  if (new Set(exam.questionIds ?? []).size !== (exam.questionIds ?? []).length) errors.push(`${exam.id}: có questionId bị lặp trong cùng đề.`);
  let calculatedPoints = 0;
  const responseCounts = { single_choice: 0, true_false_cluster: 0, short_answer: 0, constructed_response: 0 };
  const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
  for (const questionId of exam.questionIds ?? []) {
    referencedAssessmentIds.add(questionId);
    const question = assessmentQuestionById.get(questionId);
    if (!question) errors.push(`${exam.id}: questionId ${questionId} không tồn tại.`);
    else {
      calculatedPoints += question.points ?? 1;
      responseCounts[question.responseType] = (responseCounts[question.responseType] ?? 0) + 1;
      difficultyCounts[question.difficulty] = (difficultyCounts[question.difficulty] ?? 0) + 1;
      if (Array.isArray(exam.scopeTopicIds) && !exam.scopeTopicIds.includes(question.topicId)) errors.push(`${exam.id}: ${questionId} nằm ngoài scopeTopicIds.`);
    }
  }
  if (typeof exam.totalPoints === 'number' && Math.abs(calculatedPoints - exam.totalPoints) > 1e-9) errors.push(`${exam.id}: tổng points câu hỏi là ${calculatedPoints}, khác totalPoints=${exam.totalPoints}.`);
  if (['midterm', 'final'].includes(exam.kind)) {
    officialPeriodicExams.push({ exam, responseCounts, difficultyCounts });
    if (exam.duration !== 90) errors.push(`${exam.id}: đề định kỳ phải có thời lượng 90 phút.`);
    if ((exam.questionIds ?? []).length !== 22) errors.push(`${exam.id}: đề định kỳ chấm tự động phải có đúng 22 câu hiển thị.`);
    if (responseCounts.single_choice !== 12 || responseCounts.true_false_cluster !== 4 || responseCounts.short_answer !== 6) {
      errors.push(`${exam.id}: cấu trúc phải là 12 nhiều lựa chọn – 4 Đúng/Sai – 6 trả lời ngắn, hiện là ${responseCounts.single_choice}–${responseCounts.true_false_cluster}–${responseCounts.short_answer}.`);
    }
    if (responseCounts.constructed_response > 0) errors.push(`${exam.id}: không được chứa câu tự luận cần chấm thủ công/AI.`);
    if (!assessmentBlueprintIds.has(exam.blueprintId)) errors.push(`${exam.id}: thiếu blueprintId hợp lệ.`);
    if (!exam.parallelFormGroup) errors.push(`${exam.id}: thiếu parallelFormGroup để đối sánh mã A/B.`);
    if (difficultyCounts.easy < 4 || difficultyCounts.medium < 7 || difficultyCounts.hard < 2) {
      errors.push(`${exam.id}: phân tầng chưa đủ, hiện có ${difficultyCounts.easy} dễ – ${difficultyCounts.medium} vừa – ${difficultyCounts.hard} khó.`);
    }
  }
}

for (const groupId of new Set(officialPeriodicExams.map(item => item.exam.parallelFormGroup))) {
  const forms = officialPeriodicExams.filter(item => item.exam.parallelFormGroup === groupId);
  if (forms.length !== 2) {
    errors.push(`${groupId}: cần đúng hai mã đề song song A/B, hiện có ${forms.length}.`);
    continue;
  }
  const [first, second] = forms;
  for (const responseType of ['single_choice', 'true_false_cluster', 'short_answer']) {
    if (first.responseCounts[responseType] !== second.responseCounts[responseType]) errors.push(`${groupId}: hai mã đề lệch số câu ${responseType}.`);
  }
  for (const difficulty of ['easy', 'medium', 'hard']) {
    if (Math.abs(first.difficultyCounts[difficulty] - second.difficultyCounts[difficulty]) > 2) {
      errors.push(`${groupId}: hai mã đề lệch quá 2 câu ở mức ${difficulty}.`);
    }
  }
}

for (const question of assessmentQuestions) {
  if (!assessmentSolutionByQuestionId.has(question.id)) errors.push(`${question.id}: câu kiểm tra thiếu lời giải.`);
  if (!referencedAssessmentIds.has(question.id)) warnings.push(`${question.id}: chưa được đề nào sử dụng.`);
  if (question.points === undefined) warnings.push(`${question.id}: chưa khai báo points, runtime sẽ dùng trọng số mặc định.`);
}
for (const seed of midtermExpansionSeeds) {
  if (!seed.recognition?.trim()) errors.push(`${seed.id}: lời giải mở rộng thiếu dấu hiệu nhận biết.`);
  const reasoning = seed.analyses ?? seed.reasoning;
  if (!Array.isArray(reasoning) || reasoning.length < 2) errors.push(`${seed.id}: lời giải mở rộng cần ít nhất 2 bước phân tích.`);
  if (!seed.mistake?.trim() || !seed.review?.trim()) errors.push(`${seed.id}: lời giải mở rộng thiếu lỗi thường gặp hoặc gợi ý ôn tập.`);
}
if (!exams.some(exam => /học kỳ II/.test(exam.title))) warnings.push('Assessment: chưa có đề giữa kỳ II và cuối kỳ II.');

console.log(`Toán 10: ${topics.length} chủ đề, ${outcomes.length} outcomes, ${questionTypes.length} dạng lớn, ${subtypeById.size} dạng nhỏ, ${questions.length} câu luyện tập, ${assessmentQuestions.length} câu kiểm tra.`);
const expandedSubtypeCount = [...subtypeById.values()]
  .filter(subtype => (subtype.targetQuestionCount ?? 12) > 12)
  .length;
console.log(`Coverage: ${completedSubtypeCount}/${subtypeById.size} micro-type đạt target khai báo; ${expandedSubtypeCount} dạng có target trên 12 câu.`);
const mediaQuestionCount = questions.filter(question =>
  (Array.isArray(question.media) && question.media.length > 0)
  || (Array.isArray(question.stimulus?.media) && question.stimulus.media.length > 0)
).length;
console.log(`Học liệu trực quan: ${mediaQuestionCount} câu có media, ${mediaIds.size} media đã kiểm tra đường dẫn và mô tả thay thế.`);
if (warnings.length > 0) {
  console.log(`\nCẢNH BÁO (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}
if (errors.length > 0) {
  console.error(`\nLỖI (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('\nHợp đồng dữ liệu Toán 10 hợp lệ; các cảnh báo là backlog coverage cần tiếp tục bổ sung.');
