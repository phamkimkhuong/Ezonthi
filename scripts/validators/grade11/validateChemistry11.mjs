import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const modulesDirectory = path.join(root, 'src', 'data', 'grade11', 'chemistry', 'modules');
const curriculumDirectory = path.join(root, 'src', 'data', 'grade11', 'chemistry', 'curriculum');
const assessmentsDirectory = path.join(root, 'src', 'data', 'grade11', 'chemistry', 'assessments');

const readNodeValue = (node, constants = new Map()) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isIdentifier(node) && constants.has(node.text)) return readNodeValue(constants.get(node.text), constants);
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements
      .filter(item => !ts.isSpreadElement(item))
      .map(item => readNodeValue(item, constants));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const property of node.properties) {
      if (ts.isPropertyAssignment(property)) {
        const key = property.name.getText().replace(/["']/g, '');
        result[key] = readNodeValue(property.initializer, constants);
      } else if (ts.isShorthandPropertyAssignment(property)) {
        result[property.name.text] = readNodeValue(property.name, constants);
      }
    }
    return result;
  }
  return node.getText();
};

const readExportedArray = (filePath, exportName) => {
  const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
  const constants = new Map();
  let result;
  sourceFile.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        constants.set(declaration.name.text, declaration.initializer);
      }
    }
  });
  sourceFile.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText() !== exportName || !declaration.initializer) continue;
      if (ts.isArrayLiteralExpression(declaration.initializer)) {
        result = readNodeValue(declaration.initializer, constants);
      }
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
  .filter(name =>
    fs.statSync(path.join(modulesDirectory, name)).isDirectory()
    && fs.existsSync(path.join(modulesDirectory, name, 'index.ts'))
  )
  .sort();

const topics = [];
const questionTypes = [];
const questions = [];
const solutions = [];
const outcomes = [];
const misconceptions = [];
const assessmentQuestions = [];
const assessmentSolutions = [];
const checkpointQuestions = [];
const checkpointSolutions = [];
const checkpointExams = [];
const checkpointBlueprints = [];
const theoryResourceSpecs = [];
const theoryCheckpointSpecs = [];
const practiceExpansionSpecs = [];

for (const moduleName of moduleDirs) {
  const modulePath = path.join(modulesDirectory, moduleName);
  topics.push(...readFirstMatchingArray(path.join(modulePath, 'topics.ts'), /export const (g11Chemistry\w+Topics)/));
  questionTypes.push(...readFirstMatchingArray(path.join(modulePath, 'questionTypes.ts'), /export const (g11Chemistry\w+QuestionTypes)/));
  questions.push(...readFirstMatchingArray(path.join(modulePath, 'questions.ts'), /export const (g11Chemistry\w+Questions)/));
  solutions.push(...readFirstMatchingArray(path.join(modulePath, 'solutions.ts'), /export const (g11Chemistry\w+Solutions)/));
  const practiceExpansionPath = path.join(modulePath, 'practiceExpansion.ts');
  if (fs.existsSync(practiceExpansionPath)) {
    const moduleExpansionSpecs = readExportedArray(practiceExpansionPath, 'specs');
    practiceExpansionSpecs.push(...moduleExpansionSpecs);
    questions.push(...moduleExpansionSpecs.map(spec => ({
      id: spec.id,
      subjectId: 'chemistry',
      topicId: spec.topicId,
      questionTypeId: spec.questionTypeId,
      content: spec.content,
      responseType: spec.responseType,
      options: spec.options,
      correctAnswer: spec.correctAnswer,
      acceptedAnswers: spec.acceptedAnswers,
      difficulty: spec.difficulty,
      sourceType: 'manual',
      validatorType: spec.validatorType,
      outcomeIds: spec.outcomeIds,
      subTypeId: spec.subTypeId,
      practiceRole: spec.practiceRole,
      representationType: spec.representationType,
      isMasteryHoldout: spec.isMasteryHoldout,
      estimatedSeconds: spec.estimatedSeconds
    })));
    solutions.push(...moduleExpansionSpecs.map(spec => ({
      id: `${spec.id}-solution`,
      questionId: spec.id,
      recognition: spec.solution?.recognition,
      detailedSteps: (spec.solution?.reasoning ?? []).map((explanation, index) => ({
        order: index + 1,
        title: `Bước ${index + 1}`,
        explanation
      })),
      finalAnswer: spec.correctAnswer,
      commonMistakes: [spec.solution?.commonMistake],
      reviewSuggestions: [spec.solution?.reviewSuggestion]
    })));
  }
  outcomes.push(...readFirstMatchingArray(path.join(modulePath, 'learningPath.ts'), /export const (g11Chemistry\w+Outcomes)/));
  misconceptions.push(...readFirstMatchingArray(path.join(modulePath, 'learningPath.ts'), /export const (g11Chemistry\w+Misconceptions)/));
  const theoryResourcesPath = path.join(modulePath, 'theoryResources.ts');
  if (fs.existsSync(theoryResourcesPath)) {
    theoryResourceSpecs.push(...readExportedArray(theoryResourcesPath, 'specs'));
  }
  const theoryCheckpointsPath = path.join(modulePath, 'theoryCheckpoints.ts');
  if (fs.existsSync(theoryCheckpointsPath)) {
    theoryCheckpointSpecs.push(...readExportedArray(theoryCheckpointsPath, 'specs'));
  }
  const theoryDirectory = path.join(modulePath, 'assessments', 'theory');
  if (fs.existsSync(theoryDirectory)) {
    assessmentQuestions.push(...readFirstMatchingArray(path.join(theoryDirectory, 'questions.ts'), /export const (m\d+TheoryQuestions)/));
    assessmentSolutions.push(...readFirstMatchingArray(path.join(theoryDirectory, 'solutions.ts'), /export const (m\d+TheorySolutions)/));
  }
  const checkpointDirectory = path.join(modulePath, 'assessments', 'checkpoint');
  if (fs.existsSync(checkpointDirectory)) {
    for (const tierName of fs.readdirSync(checkpointDirectory)) {
      const tierDirectory = path.join(checkpointDirectory, tierName);
      if (!fs.statSync(tierDirectory).isDirectory()) continue;
      checkpointQuestions.push(...readFirstMatchingArray(path.join(tierDirectory, 'questions.ts'), /export const (m\d+\w+CheckpointQuestions)/));
      checkpointSolutions.push(...readFirstMatchingArray(path.join(tierDirectory, 'solutions.ts'), /export const (m\d+\w+CheckpointSolutions)/));
    }
    checkpointExams.push(...readFirstMatchingArray(path.join(checkpointDirectory, 'exams.ts'), /export const (m\d+CheckpointExams)/));
    checkpointBlueprints.push(...readFirstMatchingArray(path.join(checkpointDirectory, 'blueprints.ts'), /export const (m\d+CheckpointBlueprints)/));
  }
}

const assessmentExams = readExportedArray(
  path.join(assessmentsDirectory, 'theory', 'exams.ts'),
  'g11ChemistryTheoryExams'
);
const assessmentBlueprints = readExportedArray(
  path.join(assessmentsDirectory, 'theory', 'blueprints.ts'),
  'g11ChemistryTheoryBlueprints'
);
const semesterExams = readExportedArray(
  path.join(assessmentsDirectory, 'semester', 'exams.ts'),
  'g11ChemistrySemesterExams'
);
const semesterQuestions = readExportedArray(
  path.join(assessmentsDirectory, 'semester', 'questions.ts'),
  'g11ChemistrySemesterQuestions'
);
const semesterSolutions = readExportedArray(
  path.join(assessmentsDirectory, 'semester', 'solutions.ts'),
  'g11ChemistrySemesterSolutions'
);
const semesterBlueprints = readExportedArray(
  path.join(assessmentsDirectory, 'semester', 'blueprints.ts'),
  'g11ChemistrySemesterBlueprints'
);
const textbookLessons = readExportedArray(
  path.join(curriculumDirectory, 'textbookMap.ts'),
  'g11ChemistryTextbookLessons'
);
const officialRequirements = readExportedArray(
  path.join(curriculumDirectory, 'officialRequirements.ts'),
  'g11ChemistryOfficialRequirements'
);
const outcomeManifest = readExportedArray(
  path.join(curriculumDirectory, 'outcomeManifest.ts'),
  'g11ChemistryOutcomeManifest'
);

const errors = [];
const warnings = [];
const duplicateKeys = (items, keyOf) => {
  const counts = new Map();
  for (const item of items) counts.set(keyOf(item), (counts.get(keyOf(item)) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
};
const groupBy = (items, keyOf) => {
  const groups = new Map();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
};

for (const [label, items, keyOf] of [
  ['Topic', topics, item => item.id],
  ['Question type', questionTypes, item => item.id],
  ['Question', questions, item => item.id],
  ['Solution', solutions, item => item.questionId],
  ['Outcome', outcomes, item => item.id],
  ['Misconception', misconceptions, item => item.id],
  ['Textbook lesson', textbookLessons, item => item.id],
  ['Official requirement', officialRequirements, item => item.id],
  ['Outcome manifest', outcomeManifest, item => item.outcomeId]
]) {
  for (const key of duplicateKeys(items, keyOf)) errors.push(`${label} bị trùng: ${key}.`);
}

const topicById = new Map(topics.map(item => [item.id, item]));
const typeById = new Map(questionTypes.map(item => [item.id, item]));
const questionById = new Map(questions.map(item => [item.id, item]));
const solutionByQuestionId = new Map(solutions.map(item => [item.questionId, item]));
const outcomeById = new Map(outcomes.map(item => [item.id, item]));
const misconceptionById = new Map(misconceptions.map(item => [item.id, item]));
const textbookLessonById = new Map(textbookLessons.map(item => [item.id, item]));
const officialRequirementById = new Map(officialRequirements.map(item => [item.id, item]));
const outcomeManifestById = new Map(outcomeManifest.map(item => [item.outcomeId, item]));
const assessmentQuestionById = new Map(assessmentQuestions.map(item => [item.id, item]));
const assessmentSolutionByQuestionId = new Map(assessmentSolutions.map(item => [item.questionId, item]));
const assessmentBlueprintById = new Map(assessmentBlueprints.map(item => [item.id, item]));
const checkpointQuestionById = new Map(checkpointQuestions.map(item => [item.id, item]));
const checkpointSolutionByQuestionId = new Map(checkpointSolutions.map(item => [item.questionId, item]));
const checkpointBlueprintById = new Map(checkpointBlueprints.map(item => [item.id, item]));
const semesterQuestionById = new Map(semesterQuestions.map(item => [item.id, item]));
const semesterSolutionByQuestionId = new Map(semesterSolutions.map(item => [item.questionId, item]));
const semesterBlueprintById = new Map(semesterBlueprints.map(item => [item.id, item]));
const practiceExpansionSpecsByType = groupBy(practiceExpansionSpecs, item => item.questionTypeId);

if (textbookLessons.length !== 25) {
  errors.push(`Mục lục Kết nối tri thức phải có 25 bài, hiện có ${textbookLessons.length}.`);
}
const reviewLessons = textbookLessons.filter(item => item.kind === 'review');
if (reviewLessons.length !== 6) {
  errors.push(`Mục lục phải có 6 bài ôn tập chương, hiện có ${reviewLessons.length}.`);
}
const textbookChapters = new Set(textbookLessons.map(item => item.chapterId));
if (textbookChapters.size !== 6) {
  errors.push(`Mục lục phải có 6 chương, hiện có ${textbookChapters.size}.`);
}
for (const [index, lesson] of [...textbookLessons].sort((a, b) => a.orderIndex - b.orderIndex).entries()) {
  if (lesson.orderIndex !== index + 1) errors.push(`${lesson.id}: orderIndex không liên tục.`);
  if (lesson.lessonNumber !== lesson.orderIndex) errors.push(`${lesson.id}: lessonNumber phải khớp orderIndex.`);
}

for (const requirement of officialRequirements) {
  if (!Array.isArray(requirement.sourceLocators) || requirement.sourceLocators.length === 0) {
    errors.push(`${requirement.id}: thiếu vị trí đối chiếu trong nguồn chung.`);
  }
  for (const lessonId of requirement.textbookLessonIds ?? []) {
    if (!textbookLessonById.has(lessonId)) errors.push(`${requirement.id}: bài SGK ${lessonId} không tồn tại.`);
    if (textbookLessonById.get(lessonId)?.kind === 'review') {
      errors.push(`${requirement.id}: không được gắn yêu cầu mới vào bài ôn tập ${lessonId}.`);
    }
  }
  for (const outcomeId of requirement.implementedOutcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${requirement.id}: outcome đã triển khai ${outcomeId} không tồn tại.`);
  }
  if (requirement.coverageStatus === 'covered' && requirement.implementedOutcomeIds?.length === 0) {
    errors.push(`${requirement.id}: đánh dấu covered nhưng chưa có outcome.`);
  }
  if (requirement.coverageStatus === 'not_started' && requirement.implementedOutcomeIds?.length > 0) {
    errors.push(`${requirement.id}: đánh dấu not_started nhưng đã có outcome.`);
  }
}

for (const outcome of outcomes) {
  const manifest = outcomeManifestById.get(outcome.id);
  if (!manifest) {
    errors.push(`${outcome.id}: thiếu curriculum outcome manifest.`);
    continue;
  }
  if (manifest.scope !== outcome.scope) errors.push(`${outcome.id}: scope trong manifest không khớp learning path.`);
}

for (const manifest of outcomeManifest) {
  if (!outcomeById.has(manifest.outcomeId)) errors.push(`${manifest.outcomeId}: manifest không có outcome runtime tương ứng.`);
  for (const requirementId of manifest.officialRequirementIds ?? []) {
    const requirement = officialRequirementById.get(requirementId);
    if (!requirement) {
      errors.push(`${manifest.outcomeId}: official requirement ${requirementId} không tồn tại.`);
    } else if (!(requirement.implementedOutcomeIds ?? []).includes(manifest.outcomeId)) {
      errors.push(`${manifest.outcomeId}: mapping hai chiều với ${requirementId} chưa đồng bộ.`);
    }
  }
  for (const lessonId of manifest.textbookLessonIds ?? []) {
    const lesson = textbookLessonById.get(lessonId);
    if (!lesson) {
      errors.push(`${manifest.outcomeId}: bài SGK ${lessonId} không tồn tại.`);
    } else if (lesson.kind === 'review') {
      errors.push(`${manifest.outcomeId}: bài ôn tập ${lessonId} không được sở hữu outcome mới.`);
    }
  }
  if (manifest.scope !== 'bridge' && manifest.textbookLessonIds?.length === 0) {
    errors.push(`${manifest.outcomeId}: outcome cốt lõi phải được ánh xạ tới bài SGK.`);
  }
}

for (const type of questionTypes) {
  if (!topicById.has(type.topicId)) errors.push(`${type.id}: topicId không tồn tại.`);
  if (!Array.isArray(type.recognitionSigns) || type.recognitionSigns.length === 0) errors.push(`${type.id}: thiếu dấu hiệu nhận biết.`);
  if (!Array.isArray(type.solvingSteps) || type.solvingSteps.length < 3) errors.push(`${type.id}: cần ít nhất 3 bước giải.`);
  if (type.exampleQuestionId && !questionById.has(type.exampleQuestionId)) errors.push(`${type.id}: exampleQuestionId không tồn tại.`);
  const subtypeIds = (type.subTypes ?? []).map(item => item.id);
  if (new Set(subtypeIds).size !== subtypeIds.length) errors.push(`${type.id}: subtype bị trùng.`);

  if (type.practiceCoverage) {
    const typeQuestions = questions.filter(item => item.questionTypeId === type.id);
    const typeExpansionSpecs = practiceExpansionSpecsByType.get(type.id) ?? [];
    const effectiveTarget = type.practiceCoverage.targetQuestionCount + typeExpansionSpecs.length;
    if (typeQuestions.length !== effectiveTarget) {
      errors.push(`${type.id}: có ${typeQuestions.length}/${effectiveTarget} câu theo blueprint mở rộng.`);
    }
    for (const subtype of type.subTypes ?? []) {
      const count = typeQuestions.filter(item => item.subTypeId === subtype.id).length;
      if (count < type.practiceCoverage.minimumQuestionsPerSubType) {
        errors.push(`${type.id}/${subtype.id}: mới có ${count} câu.`);
      }
    }
    for (const role of type.practiceCoverage.requiredPracticeRoles) {
      if (!typeQuestions.some(item => item.practiceRole === role)) errors.push(`${type.id}: thiếu vai trò ${role}.`);
    }
    for (const representation of type.practiceCoverage.requiredRepresentations) {
      if (!typeQuestions.some(item => item.representationType === representation)) errors.push(`${type.id}: thiếu biểu diễn ${representation}.`);
    }
    const holdouts = typeQuestions.filter(item => item.isMasteryHoldout).length;
    if (holdouts < type.practiceCoverage.masteryHoldoutCount) errors.push(`${type.id}: chỉ có ${holdouts} mastery holdout.`);
    const difficulty = Object.fromEntries(['easy', 'medium', 'hard'].map(level => [level, typeQuestions.filter(item => item.difficulty === level).length]));
    if (difficulty.easy < 3 || difficulty.medium < 4 || difficulty.hard < 3) {
      errors.push(`${type.id}: phân bố độ khó chưa đạt tối thiểu 3 dễ, 4 vừa, 3 khó.`);
    }
  }
}

for (const duplicate of duplicateKeys(practiceExpansionSpecs, item => item.id)) {
  errors.push(`Practice expansion spec bị trùng: ${duplicate}.`);
}
for (const [questionTypeId, specs] of practiceExpansionSpecsByType) {
  const type = typeById.get(questionTypeId);
  if (!type) {
    errors.push(`${questionTypeId}: gói mở rộng không có dạng bài tương ứng.`);
    continue;
  }
  if (specs.length !== 6) errors.push(`${questionTypeId}: gói mở rộng phải có 6 câu, hiện có ${specs.length}.`);
  const subtypeCounts = (type.subTypes ?? []).map(subType =>
    specs.filter(spec => spec.subTypeId === subType.id).length
  );
  if (subtypeCounts.some(count => count !== 2)) {
    errors.push(`${questionTypeId}: mỗi dạng con phải có đúng 2 câu mở rộng.`);
  }
  const responseCounts = Object.fromEntries(
    ['single_choice', 'short_answer'].map(responseType => [
      responseType,
      specs.filter(spec => spec.responseType === responseType).length
    ])
  );
  if (responseCounts.single_choice < 3 || responseCounts.short_answer < 2) {
    errors.push(`${questionTypeId}: cần ít nhất 3 MCQ và 2 câu trả lời ngắn trong gói mở rộng.`);
  }
  const difficultyCounts = Object.fromEntries(
    ['medium', 'hard'].map(difficulty => [
      difficulty,
      specs.filter(spec => spec.difficulty === difficulty).length
    ])
  );
  if (difficultyCounts.medium < 2 || difficultyCounts.hard < 4) {
    errors.push(`${questionTypeId}: gói mở rộng cần ít nhất 2 câu vừa và 4 câu khó.`);
  }
  if (specs.filter(spec => spec.isMasteryHoldout).length < 2) {
    errors.push(`${questionTypeId}: gói mở rộng cần ít nhất 2 mastery holdout.`);
  }
}

const validateTheoryChecks = (spec, sourceLabel) => {
  if (!Array.isArray(spec.checks) || spec.checks.length !== 2) {
    errors.push(`${spec.id}: phải có đúng 2 checkpoint lí thuyết trong ${sourceLabel}.`);
  }
  for (const [index, check] of (spec.checks ?? []).entries()) {
    if (!check.question?.trim() || !check.explanation?.trim()) {
      errors.push(`${spec.id}/checkpoint-${index + 1}: thiếu câu hỏi hoặc giải thích.`);
    }
    if (!Array.isArray(check.options) || check.options.length !== 4) {
      errors.push(`${spec.id}/checkpoint-${index + 1}: phải có đúng 4 phương án.`);
    }
    if (!['A', 'B', 'C', 'D'].includes(check.correctAnswer)) {
      errors.push(`${spec.id}/checkpoint-${index + 1}: đáp án phải là A/B/C/D.`);
    }
  }
};

for (const duplicate of duplicateKeys(theoryResourceSpecs, item => item.id)) {
  errors.push(`Theory resource spec bị trùng: ${duplicate}.`);
}
for (const duplicate of duplicateKeys(theoryCheckpointSpecs, item => item.id)) {
  errors.push(`Theory checkpoint spec bị trùng: ${duplicate}.`);
}
for (const spec of theoryResourceSpecs) {
  if (!typeById.has(spec.id)) errors.push(`${spec.id}: gói lý thuyết không có dạng bài tương ứng.`);
  if (!spec.principle?.trim()) errors.push(`${spec.id}: thiếu phần mở rộng kiến thức.`);
  if (!Array.isArray(spec.method) || spec.method.length < 3) {
    errors.push(`${spec.id}: quy trình lí thuyết cần ít nhất 3 bước.`);
  }
  if (
    !spec.example?.problem?.trim() ||
    !Array.isArray(spec.example?.steps) ||
    spec.example.steps.length < 2 ||
    !spec.example?.answer?.trim()
  ) {
    errors.push(`${spec.id}: tình huống mẫu phải có đề, ít nhất 2 bước và kết luận.`);
  }
  validateTheoryChecks(spec, 'gói học liệu mở rộng');
}
for (const spec of theoryCheckpointSpecs) {
  if (!typeById.has(spec.id)) errors.push(`${spec.id}: gói checkpoint không có dạng bài tương ứng.`);
  validateTheoryChecks(spec, 'gói checkpoint');
}
const enrichedTheoryTypeIds = new Set(theoryResourceSpecs.map(item => item.id));
if (theoryResourceSpecs.length !== 72) {
  errors.push(`Chương 2–6 phải có 72 gói lý thuyết mở rộng, hiện có ${theoryResourceSpecs.length}.`);
}
for (const type of questionTypes.filter(item =>
  ['chem11-t2', 'chem11-t3', 'chem11-t4', 'chem11-t5', 'chem11-t6'].includes(item.topicId)
)) {
  if (!enrichedTheoryTypeIds.has(type.id)) {
    errors.push(`${type.id}: Chương 2–6 thiếu gói lý thuyết mở rộng.`);
  }
}
const existingTheoryCheckpointTypeIds = new Set(theoryCheckpointSpecs.map(item => item.id));
if (theoryCheckpointSpecs.length !== 14) {
  errors.push(`Chương 1 phải có 14 gói checkpoint, hiện có ${theoryCheckpointSpecs.length}.`);
}
for (const type of questionTypes.filter(item => item.topicId === 'chem11-t1')) {
  if (!existingTheoryCheckpointTypeIds.has(type.id)) {
    errors.push(`${type.id}: Chương 1 thiếu gói checkpoint lý thuyết.`);
  }
}
const allTheoryCheckpointTypeIds = new Set([
  ...enrichedTheoryTypeIds,
  ...existingTheoryCheckpointTypeIds
]);
for (const type of questionTypes.filter(item =>
  ['chem11-t1', 'chem11-t2', 'chem11-t3', 'chem11-t4', 'chem11-t5', 'chem11-t6'].includes(item.topicId)
)) {
  if (!allTheoryCheckpointTypeIds.has(type.id)) {
    errors.push(`${type.id}: thiếu checkpoint lý thuyết trong phạm vi Chương 1–6.`);
  }
}

for (const question of questions) {
  if (!topicById.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
  if (!typeById.has(question.questionTypeId)) errors.push(`${question.id}: questionTypeId không tồn tại.`);
  if (!solutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
  for (const outcomeId of question.outcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${question.id}: outcome ${outcomeId} không tồn tại.`);
    if (!outcomeManifestById.has(outcomeId)) errors.push(`${question.id}: outcome ${outcomeId} chưa có curriculum manifest.`);
  }
  if (!Array.isArray(question.outcomeIds) || question.outcomeIds.length === 0) errors.push(`${question.id}: thiếu outcomeIds.`);
  if (question.misconceptionId && !misconceptionById.has(question.misconceptionId)) errors.push(`${question.id}: misconception không tồn tại.`);
  if (question.validatorType === 'choice') {
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: phải có đúng 4 phương án.`);
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) errors.push(`${question.id}: đáp án phải là A/B/C/D.`);
    if (new Set(question.options ?? []).size !== (question.options ?? []).length) errors.push(`${question.id}: phương án bị trùng.`);
  }
}

for (const solution of solutions) {
  const question = questionById.get(solution.questionId);
  if (!question) errors.push(`${solution.questionId}: lời giải không có câu hỏi.`);
  if (!solution.recognition?.trim()) errors.push(`${solution.questionId}: thiếu phần nhận dạng dạng bài.`);
  if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length < 2) errors.push(`${solution.questionId}: cần ít nhất 2 bước giải.`);
  if (question && solution.finalAnswer !== question.correctAnswer) errors.push(`${solution.questionId}: finalAnswer không khớp correctAnswer.`);
}

for (const [label, items, keyOf] of [
  ['Assessment question', assessmentQuestions, item => item.id],
  ['Assessment solution', assessmentSolutions, item => item.questionId],
  ['Assessment exam', assessmentExams, item => item.id],
  ['Assessment blueprint', assessmentBlueprints, item => item.id]
]) {
  for (const key of duplicateKeys(items, keyOf)) errors.push(`${label} bị trùng: ${key}.`);
}

for (const question of assessmentQuestions) {
  if (questionById.has(question.id)) errors.push(`${question.id}: ID câu kiểm tra trùng ngân hàng luyện tập.`);
  if (!topicById.has(question.topicId)) errors.push(`${question.id}: topicId kiểm tra không tồn tại.`);
  if (!typeById.has(question.questionTypeId)) errors.push(`${question.id}: questionTypeId kiểm tra không tồn tại.`);
  if (!assessmentSolutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải kiểm tra.`);
  if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: câu lý thuyết phải có đúng 4 phương án.`);
  if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) errors.push(`${question.id}: đáp án phải là A/B/C/D.`);
  if (!Array.isArray(question.outcomeIds) || question.outcomeIds.length === 0) errors.push(`${question.id}: thiếu outcomeIds.`);
  for (const outcomeId of question.outcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${question.id}: outcome ${outcomeId} không tồn tại.`);
  }
}

for (const solution of assessmentSolutions) {
  const question = assessmentQuestionById.get(solution.questionId);
  if (!question) errors.push(`${solution.questionId}: lời giải kiểm tra không có câu hỏi.`);
  if (!solution.recognition?.trim()) errors.push(`${solution.questionId}: thiếu phần nhận dạng kiến thức.`);
  if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length < 3) errors.push(`${solution.questionId}: lời giải lý thuyết phải có đủ nhận dạng, nguyên tắc và đối chiếu.`);
  if (question && solution.finalAnswer !== question.correctAnswer) errors.push(`${solution.questionId}: finalAnswer không khớp correctAnswer.`);
}

for (const blueprint of assessmentBlueprints) {
  if (blueprint.focus !== 'theory' || blueprint.theoryScope !== 'module') {
    errors.push(`${blueprint.id}: ma trận tab Lý thuyết phải có focus=theory và theoryScope=module.`);
  }
  const sectionItems = (blueprint.sections ?? []).reduce((sum, section) => sum + section.itemCount, 0);
  const sectionPoints = (blueprint.sections ?? []).reduce((sum, section) => sum + section.points, 0);
  if (sectionItems !== 8 || sectionPoints !== blueprint.totalPoints) errors.push(`${blueprint.id}: số câu/điểm section không khớp.`);
  const difficultySum = Object.values(blueprint.difficultyWeights ?? {}).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(difficultySum - 1) > 1e-9) errors.push(`${blueprint.id}: tổng difficultyWeights phải bằng 1.`);
  for (const outcomeId of blueprint.outcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${blueprint.id}: outcome ${outcomeId} không tồn tại.`);
  }
}

for (const exam of assessmentExams) {
  const blueprint = assessmentBlueprintById.get(exam.blueprintId);
  if (!blueprint) errors.push(`${exam.id}: blueprintId không tồn tại.`);
  if (exam.questionIds.length !== 8 || new Set(exam.questionIds).size !== 8) errors.push(`${exam.id}: phải có đúng 8 câu không trùng.`);
  if (exam.totalPoints !== 8) errors.push(`${exam.id}: tổng điểm tab lý thuyết phải là 8.`);
  if (exam.difficultyBand !== 'standard') errors.push(`${exam.id}: đề lý thuyết hiện tại phải thuộc band standard.`);
  for (const questionId of exam.questionIds) {
    if (!assessmentQuestionById.has(questionId)) errors.push(`${exam.id}: questionId ${questionId} không tồn tại.`);
  }
}

const parallelGroups = groupBy(assessmentExams, exam => exam.parallelFormGroup);
for (const [groupId, forms] of parallelGroups) {
  if (!groupId || forms.length !== 2) {
    errors.push(`${groupId ?? 'không có group'}: mỗi nhóm đề song song phải có đúng 2 mã A/B.`);
    continue;
  }
  const formCodes = [...forms.map(form => form.formCode)].sort().join('');
  if (formCodes !== 'AB') errors.push(`${groupId}: nhóm song song phải gồm mã A và B.`);
  const signatures = forms.map(form => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const questionId of form.questionIds) counts[assessmentQuestionById.get(questionId)?.difficulty] += 1;
    return JSON.stringify({ topics: [...(form.scopeTopicIds ?? [])].sort(), counts, totalPoints: form.totalPoints });
  });
  if (new Set(signatures).size !== 1) errors.push(`${groupId}: mã A/B chưa tương đương phạm vi hoặc độ khó.`);
}

for (let moduleNumber = 1; moduleNumber <= 6; moduleNumber += 1) {
  const moduleQuestions = assessmentQuestions.filter(question => question.topicId === `chem11-t${moduleNumber}`);
  const moduleExams = assessmentExams.filter(exam => exam.scopeTopicIds?.includes(`chem11-t${moduleNumber}`));
  if (moduleQuestions.length !== 12) errors.push(`Chương ${moduleNumber}: cần 12 câu lý thuyết, hiện có ${moduleQuestions.length}.`);
  if (moduleExams.length !== 2) errors.push(`Chương ${moduleNumber}: cần 2 mã đề lý thuyết, hiện có ${moduleExams.length}.`);
}

if (assessmentQuestions.length !== 72 || assessmentSolutions.length !== 72) {
  errors.push(`Tab Lý thuyết phải có 72 câu/lời giải, hiện có ${assessmentQuestions.length}/${assessmentSolutions.length}.`);
}
if (assessmentExams.length !== 12 || assessmentBlueprints.length !== 6) {
  errors.push(`Tab Lý thuyết phải có 12 đề và 6 ma trận, hiện có ${assessmentExams.length}/${assessmentBlueprints.length}.`);
}

for (const [label, items, keyOf] of [
  ['Checkpoint question', checkpointQuestions, item => item.id],
  ['Checkpoint solution', checkpointSolutions, item => item.questionId],
  ['Checkpoint exam', checkpointExams, item => item.id],
  ['Checkpoint blueprint', checkpointBlueprints, item => item.id]
]) {
  for (const key of duplicateKeys(items, keyOf)) errors.push(`${label} bị trùng: ${key}.`);
}

for (const question of checkpointQuestions) {
  if (questionById.has(question.id) || assessmentQuestionById.has(question.id)) {
    errors.push(`${question.id}: ID câu chuyên đề trùng ngân hàng khác.`);
  }
  if (!topicById.has(question.topicId) || !/^chem11-t[1-6]$/.test(question.topicId)) {
    errors.push(`${question.id}: topicId checkpoint không hợp lệ.`);
  }
  if (!typeById.has(question.questionTypeId)) errors.push(`${question.id}: questionTypeId không tồn tại.`);
  if (!checkpointSolutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
  for (const outcomeId of question.outcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${question.id}: outcome ${outcomeId} không tồn tại.`);
  }
  if (question.responseType === 'single_choice') {
    if (question.points !== 0.5 || question.options?.length !== 4) errors.push(`${question.id}: MCQ phải có 4 phương án và 0,5 điểm.`);
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) errors.push(`${question.id}: đáp án MCQ phải là A/B/C/D.`);
  } else if (question.responseType === 'short_answer') {
    if (question.points !== 1.5 || !['number', 'exact'].includes(question.validatorType)) {
      errors.push(`${question.id}: trả lời ngắn phải có 1,5 điểm và validator number/exact.`);
    }
  } else {
    errors.push(`${question.id}: responseType không đúng blueprint Chương 1.`);
  }
}

for (const solution of checkpointSolutions) {
  const question = checkpointQuestionById.get(solution.questionId);
  if (!question) errors.push(`${solution.questionId}: lời giải checkpoint không có câu hỏi.`);
  if (!solution.recognition?.trim() || solution.detailedSteps?.length < 3) errors.push(`${solution.questionId}: lời giải thiếu nhận dạng/nguyên tắc/các bước.`);
  if (question && solution.finalAnswer !== question.correctAnswer) errors.push(`${solution.questionId}: finalAnswer không khớp.`);
}

for (const blueprint of checkpointBlueprints) {
  if (blueprint.kind !== 'module_checkpoint' || blueprint.focus !== 'mixed') errors.push(`${blueprint.id}: sai kind/focus.`);
  if (blueprint.totalPoints !== 10 || blueprint.sections?.reduce((sum, section) => sum + section.points, 0) !== 10) {
    errors.push(`${blueprint.id}: tổng điểm phải bằng 10.`);
  }
  const itemCount = blueprint.sections?.reduce((sum, section) => sum + section.itemCount, 0);
  if (itemCount !== 12) errors.push(`${blueprint.id}: phải có 12 câu.`);
  const difficultySum = Object.values(blueprint.difficultyWeights ?? {}).reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(difficultySum - 1) > 1e-9) errors.push(`${blueprint.id}: tổng difficultyWeights phải bằng 1.`);
}

for (const exam of checkpointExams) {
  const blueprint = checkpointBlueprintById.get(exam.blueprintId);
  if (!blueprint) errors.push(`${exam.id}: blueprintId không tồn tại.`);
  if (exam.questionIds?.length !== 12 || new Set(exam.questionIds).size !== 12) errors.push(`${exam.id}: phải có đúng 12 câu không trùng.`);
  const examQuestions = exam.questionIds.map(id => checkpointQuestionById.get(id)).filter(Boolean);
  const totalPoints = examQuestions.reduce((sum, question) => sum + question.points, 0);
  const mcqCount = examQuestions.filter(question => question.responseType === 'single_choice').length;
  const shortCount = examQuestions.filter(question => question.responseType === 'short_answer').length;
  if (Math.abs(totalPoints - 10) > 1e-9 || mcqCount !== 8 || shortCount !== 4) {
    errors.push(`${exam.id}: cấu trúc thực tế phải là 8 MCQ + 4 trả lời ngắn = 10 điểm.`);
  }
  if (blueprint && exam.difficultyBand !== blueprint.difficultyBand) errors.push(`${exam.id}: difficultyBand không khớp blueprint.`);
  const mcqAnswerCounts = Object.fromEntries(
    ['A', 'B', 'C', 'D'].map(answer => [
      answer,
      examQuestions.filter(question => question.responseType === 'single_choice' && question.correctAnswer === answer).length
    ])
  );
  const usedAnswerCount = Object.values(mcqAnswerCounts).filter(count => count > 0).length;
  const largestAnswerCount = Math.max(...Object.values(mcqAnswerCounts));
  if (usedAnswerCount < 3 || largestAnswerCount > 4) {
    errors.push(`${exam.id}: khóa đáp án MCQ bị lệch ${JSON.stringify(mcqAnswerCounts)}.`);
  }
  if (blueprint) {
    for (const level of ['easy', 'medium', 'hard']) {
      const actualWeight = examQuestions.filter(question => question.difficulty === level).length / examQuestions.length;
      if (Math.abs(actualWeight - blueprint.difficultyWeights[level]) > 1e-9) {
        errors.push(`${exam.id}: phân bố ${level} không khớp blueprint.`);
      }
    }
    const blueprintOutcomes = new Set(blueprint.outcomeIds ?? []);
    for (const question of examQuestions) {
      for (const outcomeId of question.outcomeIds ?? []) {
        if (!blueprintOutcomes.has(outcomeId)) errors.push(`${exam.id}: outcome ${outcomeId} chưa có trong blueprint.`);
      }
    }
  }
}

const checkpointParallelGroups = groupBy(checkpointExams, exam => exam.parallelFormGroup);
for (const [groupId, forms] of checkpointParallelGroups) {
  if (!groupId || forms.length !== 2 || [...forms.map(form => form.formCode)].sort().join('') !== 'AB') {
    errors.push(`${groupId ?? 'không có group'}: checkpoint phải có đúng mã A/B.`);
    continue;
  }
  const signatures = forms.map(form => {
    const formQuestions = form.questionIds.map(id => checkpointQuestionById.get(id));
    const difficulty = Object.fromEntries(['easy', 'medium', 'hard'].map(level => [level, formQuestions.filter(item => item?.difficulty === level).length]));
    const response = Object.fromEntries(['single_choice', 'short_answer'].map(type => [type, formQuestions.filter(item => item?.responseType === type).length]));
    return JSON.stringify({ difficulty, response, totalPoints: formQuestions.reduce((sum, item) => sum + (item?.points ?? 0), 0) });
  });
  if (new Set(signatures).size !== 1) errors.push(`${groupId}: mã A/B chưa tương đương độ khó và cấu trúc.`);
}

const checkpointTopicIds = [...new Set(checkpointExams.flatMap(exam => exam.scopeTopicIds ?? []))].sort();
for (const topicId of checkpointTopicIds) {
  const topicQuestions = checkpointQuestions.filter(question => question.topicId === topicId);
  const topicSolutions = checkpointSolutions.filter(solution => checkpointQuestionById.get(solution.questionId)?.topicId === topicId);
  const topicExams = checkpointExams.filter(exam => exam.scopeTopicIds?.includes(topicId));
  const topicBlueprints = checkpointBlueprints.filter(blueprint => blueprint.scopeTopicIds?.includes(topicId));
  if (topicQuestions.length !== 72 || topicSolutions.length !== 72) {
    errors.push(`${topicId}: phải có 72 câu/lời giải checkpoint, hiện có ${topicQuestions.length}/${topicSolutions.length}.`);
  }
  if (topicExams.length !== 6 || topicBlueprints.length !== 3) {
    errors.push(`${topicId}: phải có 6 đề và 3 ma trận checkpoint, hiện có ${topicExams.length}/${topicBlueprints.length}.`);
  }
}

for (const [label, items, keyOf] of [
  ['Semester question', semesterQuestions, item => item.id],
  ['Semester solution', semesterSolutions, item => item.questionId],
  ['Semester exam', semesterExams, item => item.id],
  ['Semester blueprint', semesterBlueprints, item => item.id]
]) {
  for (const key of duplicateKeys(items, keyOf)) errors.push(`${label} bị trùng: ${key}.`);
}

if (
  semesterQuestions.length !== 128
  || semesterSolutions.length !== 128
  || semesterExams.length !== 8
  || semesterBlueprints.length !== 4
) {
  errors.push(
    `Kiểm tra học kỳ phải có 128 câu/lời giải, 8 mã đề và 4 ma trận, hiện có `
    + `${semesterQuestions.length}/${semesterSolutions.length}/${semesterExams.length}/${semesterBlueprints.length}.`
  );
}

const normalizeQuestionFingerprint = question => JSON.stringify({
  content: String(question.content ?? '').replace(/\s+/g, ' ').trim().toLowerCase(),
  options: (question.options ?? []).map(option =>
    String(option.text ?? option).replace(/\s+/g, ' ').trim().toLowerCase()
  )
});
const nonSemesterFingerprintById = new Map(
  [...questions, ...assessmentQuestions, ...checkpointQuestions]
    .map(question => [normalizeQuestionFingerprint(question), question.id])
);
const semesterFingerprintCounts = new Map();

for (const question of semesterQuestions) {
  const fingerprint = normalizeQuestionFingerprint(question);
  semesterFingerprintCounts.set(fingerprint, (semesterFingerprintCounts.get(fingerprint) ?? 0) + 1);
  if (questionById.has(question.id) || assessmentQuestionById.has(question.id) || checkpointQuestionById.has(question.id)) {
    errors.push(`${question.id}: ID câu học kỳ trùng ngân hàng khác.`);
  }
  if (Object.hasOwn(question, 'sourceIds')) errors.push(`${question.id}: không dùng sourceIds trong dữ liệu câu hỏi.`);
  if (!topicById.has(question.topicId) || !/^chem11-t[1-6]$/.test(question.topicId)) {
    errors.push(`${question.id}: topicId học kỳ không hợp lệ.`);
  }
  if (!typeById.has(question.questionTypeId)) {
    errors.push(`${question.id}: questionTypeId ${question.questionTypeId} không tồn tại.`);
  }
  if (!semesterSolutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải học kỳ.`);
  for (const outcomeId of question.outcomeIds ?? []) {
    const outcome = outcomeById.get(outcomeId);
    if (!outcome) {
      errors.push(`${question.id}: outcome ${outcomeId} không tồn tại.`);
      continue;
    }
    if (outcome.topicId !== question.topicId) {
      errors.push(`${question.id}: outcome ${outcomeId} không cùng topic với câu hỏi.`);
    }
    if (!outcome.questionTypeIds?.includes(question.questionTypeId)) {
      errors.push(`${question.id}: dạng ${question.questionTypeId} không được khai báo cho outcome ${outcomeId}.`);
    }
  }
  for (const misconceptionId of question.misconceptionIds ?? []) {
    if (!misconceptionById.has(misconceptionId)) errors.push(`${question.id}: misconception ${misconceptionId} không tồn tại.`);
  }
  if (question.responseType === 'single_choice') {
    if (question.points !== 0.5 || question.options?.length !== 4) {
      errors.push(`${question.id}: MCQ học kỳ phải có 4 phương án và 0,5 điểm.`);
    }
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
      errors.push(`${question.id}: đáp án MCQ phải là A/B/C/D.`);
    }
  } else if (question.responseType === 'short_answer') {
    if (question.points !== 1.5 || !['number', 'exact'].includes(question.validatorType)) {
      errors.push(`${question.id}: trả lời ngắn học kỳ phải có 1,5 điểm và validator number/exact.`);
    }
  } else {
    errors.push(`${question.id}: responseType không thuộc cấu trúc đề học kỳ.`);
  }
  const reusedQuestionId = nonSemesterFingerprintById.get(fingerprint);
  if (reusedQuestionId) {
    errors.push(`${question.id}: nội dung trùng nguyên văn với ${reusedQuestionId}, không còn là câu độc lập.`);
  }
}

for (const [fingerprint, count] of semesterFingerprintCounts) {
  if (count > 1) {
    const duplicateIds = semesterQuestions
      .filter(question => normalizeQuestionFingerprint(question) === fingerprint)
      .map(question => question.id);
    errors.push(`Câu học kỳ trùng nội dung nội bộ: ${duplicateIds.join(', ')}.`);
  }
}

for (const solution of semesterSolutions) {
  const question = semesterQuestionById.get(solution.questionId);
  if (!question) errors.push(`${solution.questionId}: lời giải học kỳ không có câu hỏi.`);
  if (!solution.recognition?.trim() || solution.detailedSteps?.length < 3) {
    errors.push(`${solution.questionId}: lời giải học kỳ thiếu nhận dạng/nguyên tắc/các bước.`);
  }
  if (question && solution.finalAnswer !== question.correctAnswer) {
    errors.push(`${solution.questionId}: finalAnswer không khớp correctAnswer.`);
  }
}

const expectedSemesterGroups = new Map([
  ['chem11-midterm1', { kind: 'midterm', semester: 1, topics: ['chem11-t1', 'chem11-t2'] }],
  ['chem11-final1', { kind: 'final', semester: 1, topics: ['chem11-t1', 'chem11-t2', 'chem11-t3'] }],
  ['chem11-midterm2', { kind: 'midterm', semester: 2, topics: ['chem11-t4', 'chem11-t5'] }],
  ['chem11-final2', { kind: 'final', semester: 2, topics: ['chem11-t4', 'chem11-t5', 'chem11-t6'] }]
]);
const semesterQuestionUsage = new Map(semesterQuestions.map(question => [question.id, 0]));

for (const blueprint of semesterBlueprints) {
  if (!['midterm', 'final'].includes(blueprint.kind) || blueprint.focus !== 'mixed') {
    errors.push(`${blueprint.id}: ma trận học kỳ phải có kind midterm/final và focus=mixed.`);
  }
  if (![1, 2].includes(blueprint.semester) || blueprint.difficultyBand !== 'standard') {
    errors.push(`${blueprint.id}: semester hoặc difficultyBand không hợp lệ.`);
  }
  const itemCount = (blueprint.sections ?? []).reduce((sum, section) => sum + section.itemCount, 0);
  const sectionPoints = (blueprint.sections ?? []).reduce((sum, section) => sum + section.points, 0);
  const mcqSection = blueprint.sections?.find(section => section.id === 'mcq');
  const shortSection = blueprint.sections?.find(section => section.id === 'short');
  if (
    itemCount !== 16
    || Math.abs(sectionPoints - 10) > 1e-9
    || blueprint.totalPoints !== 10
    || mcqSection?.itemCount !== 14
    || mcqSection?.points !== 7
    || shortSection?.itemCount !== 2
    || shortSection?.points !== 3
  ) {
    errors.push(`${blueprint.id}: cấu trúc phải là 14 MCQ (7 điểm) + 2 trả lời ngắn (3 điểm).`);
  }
  for (const [weightName, weights] of [
    ['topicWeights', blueprint.topicWeights],
    ['difficultyWeights', blueprint.difficultyWeights],
    ['competencyWeights', blueprint.competencyWeights]
  ]) {
    const sum = Object.values(weights ?? {}).reduce((total, weight) => total + weight, 0);
    if (Math.abs(sum - 1) > 1e-9) errors.push(`${blueprint.id}: tổng ${weightName} phải bằng 1.`);
  }
  for (const topicId of blueprint.scopeTopicIds ?? []) {
    if (!topicById.has(topicId)) errors.push(`${blueprint.id}: scope topic ${topicId} không tồn tại.`);
  }
  for (const outcomeId of blueprint.outcomeIds ?? []) {
    if (!outcomeById.has(outcomeId)) errors.push(`${blueprint.id}: outcome ${outcomeId} không tồn tại.`);
  }
}

for (const exam of semesterExams) {
  const blueprint = semesterBlueprintById.get(exam.blueprintId);
  const expected = expectedSemesterGroups.get(exam.parallelFormGroup);
  if (!expected) errors.push(`${exam.id}: parallelFormGroup không thuộc 4 đợt kiểm tra đã khóa.`);
  if (!blueprint) errors.push(`${exam.id}: blueprintId không tồn tại.`);
  if (exam.questionIds?.length !== 16 || new Set(exam.questionIds).size !== 16) {
    errors.push(`${exam.id}: phải có đúng 16 câu không trùng.`);
  }
  if (
    !['midterm', 'final'].includes(exam.kind)
    || ![1, 2].includes(exam.semester)
    || exam.totalPoints !== 10
    || exam.difficultyBand !== 'standard'
  ) {
    errors.push(`${exam.id}: metadata kind/semester/điểm/difficultyBand không hợp lệ.`);
  }
  if (expected) {
    if (exam.kind !== expected.kind || exam.semester !== expected.semester) {
      errors.push(`${exam.id}: kind hoặc học kỳ không khớp đợt kiểm tra.`);
    }
    if (JSON.stringify([...(exam.scopeTopicIds ?? [])].sort()) !== JSON.stringify([...expected.topics].sort())) {
      errors.push(`${exam.id}: phạm vi chương không khớp đợt kiểm tra.`);
    }
  }
  if (blueprint) {
    if (
      blueprint.kind !== exam.kind
      || blueprint.semester !== exam.semester
      || blueprint.difficultyBand !== exam.difficultyBand
      || blueprint.duration !== exam.duration
    ) {
      errors.push(`${exam.id}: metadata đề không khớp ma trận.`);
    }
  }

  const examQuestions = exam.questionIds.map(id => semesterQuestionById.get(id)).filter(Boolean);
  for (const questionId of exam.questionIds) {
    if (semesterQuestionUsage.has(questionId)) {
      semesterQuestionUsage.set(questionId, semesterQuestionUsage.get(questionId) + 1);
    }
  }
  if (examQuestions.length !== exam.questionIds.length) {
    const missingIds = exam.questionIds.filter(id => !semesterQuestionById.has(id));
    errors.push(`${exam.id}: questionId không tồn tại: ${missingIds.join(', ')}.`);
  }
  const totalPoints = examQuestions.reduce((sum, question) => sum + question.points, 0);
  const mcqQuestions = examQuestions.filter(question => question.responseType === 'single_choice');
  const shortQuestions = examQuestions.filter(question => question.responseType === 'short_answer');
  if (Math.abs(totalPoints - 10) > 1e-9 || mcqQuestions.length !== 14 || shortQuestions.length !== 2) {
    errors.push(`${exam.id}: cấu trúc thực tế phải là 14 MCQ + 2 trả lời ngắn = 10 điểm.`);
  }
  for (const question of examQuestions) {
    if (!exam.scopeTopicIds?.includes(question.topicId)) {
      errors.push(`${exam.id}: câu ${question.id} nằm ngoài phạm vi ${question.topicId}.`);
    }
  }

  const answerCounts = Object.fromEntries(
    ['A', 'B', 'C', 'D'].map(answer => [
      answer,
      mcqQuestions.filter(question => question.correctAnswer === answer).length
    ])
  );
  const usedAnswerCount = Object.values(answerCounts).filter(count => count > 0).length;
  const largestAnswerCount = Math.max(...Object.values(answerCounts));
  if (usedAnswerCount < 3 || largestAnswerCount > 6) {
    errors.push(`${exam.id}: khóa đáp án MCQ bị lệch ${JSON.stringify(answerCounts)}.`);
  }

  if (blueprint) {
    const blueprintOutcomes = new Set(blueprint.outcomeIds ?? []);
    for (const question of examQuestions) {
      for (const outcomeId of question.outcomeIds ?? []) {
        if (!blueprintOutcomes.has(outcomeId)) errors.push(`${exam.id}: outcome ${outcomeId} chưa có trong blueprint.`);
      }
    }
    for (const level of ['easy', 'medium', 'hard']) {
      const actualWeight = examQuestions.filter(question => question.difficulty === level).length / examQuestions.length;
      if (Math.abs(actualWeight - (blueprint.difficultyWeights?.[level] ?? 0)) > 1e-9) {
        errors.push(`${exam.id}: phân bố ${level} không khớp blueprint.`);
      }
    }
    for (const topicId of exam.scopeTopicIds ?? []) {
      const actualPoints = examQuestions
        .filter(question => question.topicId === topicId)
        .reduce((sum, question) => sum + question.points, 0);
      const actualWeight = actualPoints / totalPoints;
      if (Math.abs(actualWeight - (blueprint.topicWeights?.[topicId] ?? 0)) > 1e-9) {
        errors.push(`${exam.id}: tỷ trọng ${topicId} không khớp blueprint.`);
      }
    }
    for (const competency of ['chemical_cognition', 'chemical_inquiry', 'chemical_application']) {
      const actualPoints = examQuestions
        .filter(question => question.competency === competency)
        .reduce((sum, question) => sum + question.points, 0);
      const actualWeight = actualPoints / totalPoints;
      if (Math.abs(actualWeight - (blueprint.competencyWeights?.[competency] ?? 0)) > 1e-9) {
        errors.push(`${exam.id}: tỷ trọng năng lực ${competency} không khớp blueprint.`);
      }
    }
    if (
      exam.parallelFormGroup === 'chem11-final2'
      && !examQuestions.some(question => question.outcomeIds?.some(outcomeId => outcomeId.startsWith('chem11-cax-')))
    ) {
      errors.push(`${exam.id}: đề cuối kỳ II chưa có nội dung carboxylic acid.`);
    }
  }
}

for (const [questionId, usageCount] of semesterQuestionUsage) {
  if (usageCount !== 1) errors.push(`${questionId}: phải được dùng đúng một lần trong đề học kỳ, hiện dùng ${usageCount} lần.`);
}

const semesterParallelGroups = groupBy(semesterExams, exam => exam.parallelFormGroup);
if (semesterParallelGroups.size !== expectedSemesterGroups.size) {
  errors.push(`Phải có đúng ${expectedSemesterGroups.size} nhóm đề học kỳ, hiện có ${semesterParallelGroups.size}.`);
}
for (const [groupId, expected] of expectedSemesterGroups) {
  const forms = semesterParallelGroups.get(groupId) ?? [];
  if (forms.length !== 2 || [...forms.map(form => form.formCode)].sort().join('') !== 'AB') {
    errors.push(`${groupId}: phải có đúng hai mã A/B.`);
    continue;
  }
  const signatures = forms.map(form => {
    const formQuestions = form.questionIds.map(id => semesterQuestionById.get(id)).filter(Boolean);
    const difficulty = Object.fromEntries(
      ['easy', 'medium', 'hard'].map(level => [
        level,
        formQuestions.filter(question => question.difficulty === level).length
      ])
    );
    const response = Object.fromEntries(
      ['single_choice', 'short_answer'].map(type => [
        type,
        formQuestions.filter(question => question.responseType === type).length
      ])
    );
    const topicPoints = Object.fromEntries(
      expected.topics.map(topicId => [
        topicId,
        formQuestions
          .filter(question => question.topicId === topicId)
          .reduce((sum, question) => sum + question.points, 0)
      ])
    );
    return JSON.stringify({
      difficulty,
      response,
      topicPoints,
      totalPoints: formQuestions.reduce((sum, question) => sum + question.points, 0)
    });
  });
  if (new Set(signatures).size !== 1) {
    errors.push(`${groupId}: mã A/B chưa tương đương về chương, độ khó, dạng trả lời hoặc tổng điểm.`);
  }
}

for (const outcome of outcomes) {
  if (!topicById.has(outcome.topicId)) errors.push(`${outcome.id}: topicId không tồn tại.`);
  for (const typeId of outcome.questionTypeIds ?? []) if (!typeById.has(typeId)) errors.push(`${outcome.id}: question type ${typeId} không tồn tại.`);
  for (const prerequisiteId of outcome.prerequisiteOutcomeIds ?? []) if (!outcomeById.has(prerequisiteId)) errors.push(`${outcome.id}: prerequisite ${prerequisiteId} không tồn tại.`);
  for (const misconceptionId of outcome.misconceptionIds ?? []) if (!misconceptionById.has(misconceptionId)) errors.push(`${outcome.id}: misconception ${misconceptionId} không tồn tại.`);
}

const coreQuestions = questions.filter(item => item.topicId === 'chem11-t1');
const answerDistribution = Object.fromEntries(['A', 'B', 'C', 'D'].map(key => [key, coreQuestions.filter(item => item.correctAnswer === key).length]));
const maxAnswers = Math.max(...Object.values(answerDistribution));
if (maxAnswers > Math.ceil(coreQuestions.length * 0.4)) warnings.push(`Khóa đáp án lệch: ${JSON.stringify(answerDistribution)}.`);

console.log(`Hóa học 11 giai đoạn 1: ${topics.length} topic, ${outcomes.length} outcomes, ${questionTypes.length} dạng, ${questions.length} câu, ${solutions.length} lời giải.`);
console.log(`Curriculum registry: ${textbookChapters.size} chương, ${textbookLessons.length} bài, ${officialRequirements.length} yêu cầu đã chuẩn hóa, ${outcomeManifest.length} outcome manifest.`);
console.log(`Module 1: ${coreQuestions.length} câu; phân bố đáp án ${JSON.stringify(answerDistribution)}.`);
console.log(`Assessment lý thuyết: ${assessmentQuestions.length} câu, ${assessmentSolutions.length} lời giải, ${assessmentExams.length} đề, ${assessmentBlueprints.length} ma trận.`);
console.log(`Học liệu lý thuyết Chương 1–6: ${theoryCheckpointSpecs.length} dạng dùng lý thuyết chuyên sâu, ${theoryResourceSpecs.length} dạng có học liệu mở rộng, ${[...theoryCheckpointSpecs, ...theoryResourceSpecs].reduce((sum, item) => sum + (item.checks?.length ?? 0), 0)} checkpoint.`);
console.log(`Luyện tập mở rộng: ${practiceExpansionSpecsByType.size} dạng trọng tâm, ${practiceExpansionSpecs.length} câu mới (${practiceExpansionSpecs.filter(item => item.responseType === 'short_answer').length} trả lời ngắn).`);
console.log(`Checkpoint ${checkpointTopicIds.length} chương: ${checkpointQuestions.length} câu, ${checkpointSolutions.length} lời giải, ${checkpointExams.length} đề, ${checkpointBlueprints.length} ma trận.`);
console.log(`Kiểm tra học kỳ: ${semesterQuestions.length} câu, ${semesterSolutions.length} lời giải, ${semesterExams.length} mã đề, ${semesterBlueprints.length} ma trận.`);

if (warnings.length) {
  console.log('CẢNH BÁO');
  for (const warning of warnings) console.log(`- ${warning}`);
}
if (errors.length) {
  console.error('LỖI');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('✓ Dữ liệu Hóa học 11 giai đoạn 1 hợp lệ.');
