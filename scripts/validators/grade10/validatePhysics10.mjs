import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const physicsRoot = path.join(root, 'src', 'data', 'grade10', 'physics');

const readNodeValue = node => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(readNodeValue);
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

const readExport = (filePath, exportName) => {
  const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
  let result;
  source.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText() === exportName && declaration.initializer) result = readNodeValue(declaration.initializer);
    }
  });
  if (result === undefined) throw new Error(`Không đọc được ${exportName} trong ${filePath}.`);
  return result;
};

const moduleSpecs = [
  {
    label: 'Module 0', directory: 'module0_intro', prefix: 'g10PhysicsModule0',
    expansionQuestionExport: 'g10PhysicsModule0ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule0ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule0Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule0Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule0GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule0GapFillSolutions',
    remediationSeedExport: 'g10PhysicsModule0RemediationSeeds',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 3 }
  },
  {
    label: 'Module 1', directory: 'module1_kinematics', prefix: 'g10PhysicsModule1',
    expansionQuestionExport: 'g10PhysicsModule1ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule1ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule1Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule1Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule1GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule1GapFillSolutions',
    remediationSeedExport: 'g10PhysicsModule1RemediationSeeds',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 3 }
  },
  {
    label: 'Module 2', directory: 'module2_dynamics', prefix: 'g10PhysicsModule2',
    expansionQuestionExport: 'g10PhysicsModule2ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule2ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule2Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule2Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule2GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule2GapFillSolutions',
    remediationSeedExport: 'g10PhysicsModule2RemediationSeeds',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 3 }
  },
  {
    label: 'Module 3', directory: 'module3_energy', prefix: 'g10PhysicsModule3',
    expansionQuestionExport: 'g10PhysicsModule3ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule3ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule3Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule3Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule3GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule3GapFillSolutions',
    remediationSeedExport: 'g10PhysicsModule3RemediationSeeds',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 4 }
  },
  {
    label: 'Module 4', directory: 'module4_momentum', prefix: 'g10PhysicsModule4',
    expansionQuestionExport: 'g10PhysicsModule4ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule4ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule4Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule4Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule4GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule4GapFillSolutions',
    remediationCompactExport: 'g10PhysicsModule4RemediationEntries',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 4 }
  },
  {
    label: 'Module 5', directory: 'module5_circular_motion', prefix: 'g10PhysicsModule5',
    expansionQuestionExport: 'g10PhysicsModule5ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule5ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule5Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule5Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule5GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule5GapFillSolutions',
    remediationCompactExport: 'g10PhysicsModule5RemediationEntries',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 4 }
  },
  {
    label: 'Module 6', directory: 'module6_solid_deformation', prefix: 'g10PhysicsModule6',
    expansionQuestionExport: 'g10PhysicsModule6ExpansionQuestions',
    expansionSolutionExport: 'g10PhysicsModule6ExpansionSolutions',
    expansion2QuestionExport: 'g10PhysicsModule6Expansion2Questions',
    expansion2SolutionExport: 'g10PhysicsModule6Expansion2Solutions',
    gapFillQuestionExport: 'g10PhysicsModule6GapFillQuestions',
    gapFillSolutionExport: 'g10PhysicsModule6GapFillSolutions',
    remediationCompactExport: 'g10PhysicsModule6RemediationEntries',
    minimumQuestions: 12, minimumDifficulty: { easy: 3, medium: 5, hard: 4 }
  }
];

const moduleData = moduleSpecs.map(spec => {
  const moduleRoot = path.join(physicsRoot, 'modules', spec.directory);
  const topics = readExport(path.join(moduleRoot, 'topics.ts'), `${spec.prefix}Topics`);
  const remediationSeeds = spec.remediationSeedExport
    ? readExport(path.join(moduleRoot, 'practiceRemediation.ts'), spec.remediationSeedExport)
    : spec.remediationCompactExport
      ? readExport(path.join(moduleRoot, 'practiceRemediation.ts'), spec.remediationCompactExport).map(entry => ({
          id: entry.id, subTypeId: entry.st, outcomeIds: [entry.o], content: entry.c,
          difficulty: entry.d, correctAnswer: entry.a, reasoning: entry.r,
          ...(entry.opts ? { options: entry.opts } : {}),
          ...(entry.acc ? { acceptedAnswers: entry.acc } : {}),
          ...(entry.rep ? { representationType: entry.rep } : {})
        }))
      : [];
  const remediationQuestions = remediationSeeds.map(seed => ({
    id: seed.id,
    subjectId: 'physics',
    topicId: topics[0]?.id,
    questionTypeId: seed.subTypeId.replace(/-st\d+$/, ''),
    subTypeId: seed.subTypeId,
    content: seed.content,
    responseType: Array.isArray(seed.options) ? 'single_choice' : 'short_answer',
    ...(Array.isArray(seed.options) ? { options: seed.options } : {}),
    correctAnswer: seed.correctAnswer,
    acceptedAnswers: Array.isArray(seed.options)
      ? [seed.correctAnswer, String(seed.correctAnswer).toLowerCase()]
      : (seed.acceptedAnswers ?? [seed.correctAnswer]),
    validatorType: Array.isArray(seed.options) ? 'choice' : 'exact',
    difficulty: seed.difficulty,
    sourceType: 'manual',
    outcomeIds: seed.outcomeIds,
    competency: seed.competency ?? (seed.difficulty === 'hard' ? 'physical_application' : 'physical_cognition'),
    cognitiveLevel: seed.cognitiveLevel ?? (seed.difficulty === 'easy' ? 'recognition' : seed.difficulty === 'hard' ? 'application' : 'understanding'),
    estimatedSeconds: seed.estimatedSeconds ?? (seed.difficulty === 'easy' ? 40 : seed.difficulty === 'hard' ? 85 : 60),
    practiceRole: seed.practiceRole ?? (seed.difficulty === 'easy' ? 'guided' : seed.difficulty === 'hard' ? 'mastery_holdout' : 'near_transfer'),
    representationType: seed.representationType ?? (Array.isArray(seed.options) ? 'text' : 'equation'),
    isMasteryHoldout: (seed.practiceRole ?? (seed.difficulty === 'hard' ? 'mastery_holdout' : 'near_transfer')) === 'mastery_holdout',
    ...(seed.stimulus && typeof seed.stimulus === 'object' ? { stimulus: seed.stimulus } : {})
  }));
  const remediationSolutions = remediationSeeds.map(seed => ({
    id: seed.id.replace('-q', '-s'),
    questionId: seed.id,
    recognition: `Dạng bù coverage ${seed.subTypeId}: xác định dữ kiện và quy tắc trước khi kết luận.`,
    detailedSteps: seed.reasoning.map((explanation, index) => ({
      order: index + 1,
      title: index === 0 ? 'Nhận dạng' : 'Giải',
      explanation
    })),
    finalAnswer: seed.correctAnswer,
    commonMistakes: ['Áp dụng quy tắc chưa đúng điều kiện.'],
    reviewSuggestions: ['Đối chiếu lý thuyết của dạng nhỏ.']
  }));
  return {
    label: spec.label,
    minimumQuestions: spec.minimumQuestions,
    minimumDifficulty: spec.minimumDifficulty,
    topics,
    types: readExport(path.join(moduleRoot, 'questionTypes.ts'), `${spec.prefix}QuestionTypes`),
    questions: [
      ...readExport(path.join(moduleRoot, 'questions.ts'), `${spec.prefix}Questions`),
      ...(spec.expansionQuestionExport
        ? readExport(path.join(moduleRoot, 'practiceExpansion', 'questions.ts'), spec.expansionQuestionExport)
        : []),
      ...(spec.expansion2QuestionExport
        ? readExport(path.join(moduleRoot, 'practiceExpansion2', 'questions.ts'), spec.expansion2QuestionExport)
        : []),
      ...(spec.gapFillQuestionExport
        ? readExport(path.join(moduleRoot, 'practiceGapFill', 'questions.ts'), spec.gapFillQuestionExport)
        : []),
      ...remediationQuestions
    ],
    solutions: [
      ...readExport(path.join(moduleRoot, 'solutions.ts'), `${spec.prefix}Solutions`),
      ...(spec.expansionSolutionExport
        ? readExport(path.join(moduleRoot, 'practiceExpansion', 'solutions.ts'), spec.expansionSolutionExport)
        : []),
      ...(spec.expansion2SolutionExport
        ? readExport(path.join(moduleRoot, 'practiceExpansion2', 'solutions.ts'), spec.expansion2SolutionExport)
        : []),
      ...(spec.gapFillSolutionExport
        ? readExport(path.join(moduleRoot, 'practiceGapFill', 'solutions.ts'), spec.gapFillSolutionExport)
        : []),
      ...remediationSolutions
    ],
    practiceBlueprints: readExport(
      path.join(moduleRoot, 'practiceBlueprint.ts'),
      `${spec.prefix}PracticeBlueprints`
    ),
    practiceMetadata: fs.existsSync(path.join(moduleRoot, 'practiceMetadata.ts'))
      ? readExport(path.join(moduleRoot, 'practiceMetadata.ts'), `${spec.prefix}PracticeMetadata`)
      : [],
    outcomes: readExport(path.join(moduleRoot, 'learningPath.ts'), `${spec.prefix}Outcomes`),
    misconceptions: readExport(path.join(moduleRoot, 'learningPath.ts'), `${spec.prefix}Misconceptions`)
  };
});

const assessmentQuestions = [
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm1', 'questionsFormA.ts'), 'physicsMidterm1QuestionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm1', 'questionsFormB.ts'), 'physicsMidterm1QuestionsFormB'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final1', 'questionsFormA.ts'), 'physicsFinal1QuestionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final1', 'questionsFormB.ts'), 'physicsFinal1QuestionsFormB'),
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm2', 'questionsFormA.ts'), 'physicsMidterm2QuestionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm2', 'questionsFormB.ts'), 'physicsMidterm2QuestionsFormB'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final2', 'questionsFormA.ts'), 'physicsFinal2QuestionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final2', 'questionsFormB.ts'), 'physicsFinal2QuestionsFormB')
];
const assessmentSolutions = [
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm1', 'solutionsFormA.ts'), 'physicsMidterm1SolutionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm1', 'solutionsFormB.ts'), 'physicsMidterm1SolutionsFormB'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final1', 'solutionsFormA.ts'), 'physicsFinal1SolutionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final1', 'solutionsFormB.ts'), 'physicsFinal1SolutionsFormB'),
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm2', 'solutionsFormA.ts'), 'physicsMidterm2SolutionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'midterm2', 'solutionsFormB.ts'), 'physicsMidterm2SolutionsFormB'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final2', 'solutionsFormA.ts'), 'physicsFinal2SolutionsFormA'),
  ...readExport(path.join(physicsRoot, 'assessments', 'final2', 'solutionsFormB.ts'), 'physicsFinal2SolutionsFormB')
];
const topics = moduleData.flatMap(module => module.topics);
const types = moduleData.flatMap(module => module.types);
const rawPracticeQuestions = moduleData.flatMap(module => module.questions);
const practiceBlueprints = moduleData.flatMap(module => module.practiceBlueprints);
const practiceMetadata = moduleData.flatMap(module => module.practiceMetadata);
const practiceMetadataByQuestionId = new Map(practiceMetadata.map(item => [item.questionId, item]));
const practiceQuestions = rawPracticeQuestions.map(question => {
  const metadata = practiceMetadataByQuestionId.get(question.id);
  return metadata ? { ...question, ...metadata, id: question.id } : question;
});
const questions = [...practiceQuestions, ...assessmentQuestions];
const solutions = [...moduleData.flatMap(module => module.solutions), ...assessmentSolutions];
const outcomes = moduleData.flatMap(module => module.outcomes);
const misconceptions = moduleData.flatMap(module => module.misconceptions);
const curriculum = readExport(path.join(physicsRoot, 'curriculum', 'blueprint.ts'), 'g10PhysicsCurriculumModules');
const exams = [
  ...readExport(path.join(physicsRoot, 'assessments', 'index.ts'), 'g10PhysicsAssessmentExams').filter(item => typeof item === 'object'),
  ...readExport(path.join(physicsRoot, 'assessments', 'exams', 'midterm1.ts'), 'physicsMidterm1Exams'),
  ...readExport(path.join(physicsRoot, 'assessments', 'exams', 'final1.ts'), 'physicsFinal1Exams'),
  ...readExport(path.join(physicsRoot, 'assessments', 'exams', 'midterm2.ts'), 'physicsMidterm2Exams'),
  ...readExport(path.join(physicsRoot, 'assessments', 'exams', 'final2.ts'), 'physicsFinal2Exams')
];
const assessmentBlueprints = [
  readExport(path.join(physicsRoot, 'assessments', 'blueprints', 'midterm1.ts'), 'physicsMidterm1Blueprint'),
  readExport(path.join(physicsRoot, 'assessments', 'blueprints', 'final1.ts'), 'physicsFinal1Blueprint'),
  readExport(path.join(physicsRoot, 'assessments', 'blueprints', 'midterm2.ts'), 'physicsMidterm2Blueprint'),
  readExport(path.join(physicsRoot, 'assessments', 'blueprints', 'final2.ts'), 'physicsFinal2Blueprint')
];

const errors = [];
const warnings = [];
const examAuditSummaries = [];
const practiceAuditSummaries = [];
const unique = (items, key, label) => {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) errors.push(`${label} trùng ${key}: ${item[key]}.`);
    seen.add(item[key]);
  }
};

unique(topics, 'id', 'Topic');
unique(types, 'id', 'Question type');
unique(practiceBlueprints, 'questionTypeId', 'Practice blueprint');
unique(practiceMetadata, 'questionId', 'Practice metadata');
unique(questions, 'id', 'Question');
unique(solutions, 'questionId', 'Solution');
unique(outcomes, 'id', 'Outcome');
unique(misconceptions, 'id', 'Misconception');
unique(curriculum, 'id', 'Curriculum module');
unique(assessmentBlueprints, 'id', 'Assessment blueprint');

const topicById = new Map(topics.map(item => [item.id, item]));
const typeById = new Map(types.map(item => [item.id, item]));
const practiceBlueprintByTypeId = new Map(practiceBlueprints.map(item => [item.questionTypeId, item]));
const questionById = new Map(questions.map(item => [item.id, item]));
const solutionByQuestionId = new Map(solutions.map(item => [item.questionId, item]));
const outcomeById = new Map(outcomes.map(item => [item.id, item]));
const misconceptionById = new Map(misconceptions.map(item => [item.id, item]));
const assessmentBlueprintById = new Map(assessmentBlueprints.map(item => [item.id, item]));
const moduleRuleByTopicId = new Map(moduleData.flatMap(module =>
  module.topics.map(topic => [topic.id, module])
));
const rawPracticeQuestionById = new Map(rawPracticeQuestions.map(question => [question.id, question]));

for (const module of moduleData) {
  const metadataIds = new Set(module.practiceMetadata.map(item => item.questionId));
  const migratedQuestionCount = module.questions.filter(question => question.subTypeId || metadataIds.has(question.id)).length;
  if (module.practiceMetadata.length > 0 && migratedQuestionCount !== module.questions.length) {
    errors.push(`${module.label}: metadata phải phủ toàn bộ câu khi đã migration, hiện ${migratedQuestionCount}/${module.questions.length}.`);
  }
}
for (const metadata of practiceMetadata) {
  if (!rawPracticeQuestionById.has(metadata.questionId)) errors.push(`${metadata.questionId}: practice metadata không có câu luyện tương ứng.`);
}

if (curriculum.length !== 7) errors.push(`Blueprint phải có 7 module cốt lõi, hiện có ${curriculum.length}.`);
const contentHours = curriculum.reduce((sum, module) => sum + module.officialHours, 0);
if (contentHours !== 62) errors.push(`Tổng tiết nội dung phải là 62, hiện là ${contentHours}.`);
const blueprintOutcomes = curriculum.flatMap(module => module.outcomes ?? []);
unique(blueprintOutcomes, 'id', 'Blueprint outcome');
if (blueprintOutcomes.length !== 58) errors.push(`Blueprint phải có 58 micro-outcome, hiện có ${blueprintOutcomes.length}.`);

for (const type of types) {
  if (!topicById.has(type.topicId)) errors.push(`${type.id}: topicId không tồn tại.`);
  const example = questionById.get(type.exampleQuestionId);
  if (!example) errors.push(`${type.id}: exampleQuestionId không tồn tại (${type.exampleQuestionId}).`);
  else if (example.questionTypeId !== type.id) errors.push(`${type.id}: câu mẫu thuộc ${example.questionTypeId}.`);
  if ((type.recognitionSigns ?? []).length < 2) errors.push(`${type.id}: cần ít nhất 2 dấu hiệu nhận biết.`);
  if ((type.solvingSteps ?? []).length < 3) errors.push(`${type.id}: cần ít nhất 3 bước giải.`);
  const typeQuestions = questions.filter(question => question.questionTypeId === type.id);
  const moduleRule = moduleRuleByTopicId.get(type.topicId);
  const minimumQuestions = moduleRule?.minimumQuestions ?? 12;
  const minimumDifficulty = moduleRule?.minimumDifficulty ?? { easy: 3, medium: 5, hard: 3 };
  if (typeQuestions.length < minimumQuestions) errors.push(`${type.id}: cần ít nhất ${minimumQuestions} câu, hiện có ${typeQuestions.length}.`);
  const distribution = {
    easy: typeQuestions.filter(question => question.difficulty === 'easy').length,
    medium: typeQuestions.filter(question => question.difficulty === 'medium').length,
    hard: typeQuestions.filter(question => question.difficulty === 'hard').length
  };
  if (distribution.easy < minimumDifficulty.easy || distribution.medium < minimumDifficulty.medium || distribution.hard < minimumDifficulty.hard) {
    errors.push(`${type.id}: phân tầng ${distribution.easy} dễ – ${distribution.medium} trung bình – ${distribution.hard} khó, chưa đạt ${minimumDifficulty.easy}–${minimumDifficulty.medium}–${minimumDifficulty.hard}.`);
  }
}

const validPracticeRoles = new Set([
  'guided', 'near_transfer', 'representation_switch', 'misconception_check',
  'far_transfer', 'retention', 'mastery_holdout'
]);
const validRepresentations = new Set(['text', 'equation', 'table', 'graph', 'diagram', 'experiment']);
const requiredCoverageRoles = ['guided', 'near_transfer', 'misconception_check', 'retention', 'mastery_holdout'];
let practiceTargetTotal = 0;
let subtypeTotal = 0;

for (const type of types) {
  const blueprint = practiceBlueprintByTypeId.get(type.id);
  if (!blueprint) {
    errors.push(`${type.id}: thiếu practice blueprint.`);
    continue;
  }

  const subtypes = blueprint.subTypes ?? [];
  const coverage = blueprint.coverage ?? {};
  subtypeTotal += subtypes.length;
  practiceTargetTotal += coverage.targetQuestionCount ?? 0;
  if (subtypes.length < 3) errors.push(`${type.id}: cần ít nhất 3 dạng con, hiện có ${subtypes.length}.`);

  const subtypeIds = new Set();
  for (const subtype of subtypes) {
    if (!subtype.id) errors.push(`${type.id}: subtype thiếu id.`);
    else if (subtypeIds.has(subtype.id)) errors.push(`${type.id}: subtype trùng id (${subtype.id}).`);
    else subtypeIds.add(subtype.id);
    if (subtype.id && !String(subtype.id).startsWith(`${type.id}-st`)) errors.push(`${type.id}: subtype id không theo namespace (${subtype.id}).`);
    if (String(subtype.name ?? '').trim().length < 5) errors.push(`${type.id}/${subtype.id}: tên dạng con quá ngắn.`);
    if (String(subtype.example ?? '').trim().length < 12) errors.push(`${type.id}/${subtype.id}: ví dụ dạng con quá ngắn.`);
    if (!(subtype.recognitionSigns ?? []).length) errors.push(`${type.id}/${subtype.id}: thiếu dấu hiệu nhận biết.`);
    if (!Number.isInteger(subtype.targetQuestionCount) || subtype.targetQuestionCount < 3) errors.push(`${type.id}/${subtype.id}: targetQuestionCount phải từ 3 trở lên.`);
  }

  const subtypeTargetTotal = subtypes.reduce((sum, subtype) => sum + (subtype.targetQuestionCount ?? 0), 0);
  if (subtypeTargetTotal !== coverage.targetQuestionCount) {
    errors.push(`${type.id}: tổng target các subtype là ${subtypeTargetTotal}, không khớp target ${coverage.targetQuestionCount}.`);
  }
  if (!Number.isInteger(coverage.minimumQuestionsPerSubType) || coverage.minimumQuestionsPerSubType < 3) {
    errors.push(`${type.id}: minimumQuestionsPerSubType phải từ 3 trở lên.`);
  }
  if ((coverage.targetQuestionCount ?? 0) < subtypes.length * (coverage.minimumQuestionsPerSubType ?? 0)) {
    errors.push(`${type.id}: targetQuestionCount không đủ phủ mức tối thiểu của các subtype.`);
  }
  if (!Number.isInteger(coverage.masteryHoldoutCount) || coverage.masteryHoldoutCount < 3) {
    errors.push(`${type.id}: masteryHoldoutCount phải từ 3 trở lên.`);
  }
  const roleSet = new Set(coverage.requiredPracticeRoles ?? []);
  for (const role of roleSet) if (!validPracticeRoles.has(role)) errors.push(`${type.id}: practice role không hợp lệ (${role}).`);
  for (const role of requiredCoverageRoles) if (!roleSet.has(role)) errors.push(`${type.id}: coverage thiếu vai trò bắt buộc ${role}.`);
  const representationSet = new Set(coverage.requiredRepresentations ?? []);
  for (const representation of representationSet) {
    if (!validRepresentations.has(representation)) errors.push(`${type.id}: representation không hợp lệ (${representation}).`);
  }
  if (!representationSet.has('text')) errors.push(`${type.id}: coverage phải có biểu diễn text.`);
}

for (const blueprint of practiceBlueprints) {
  if (!typeById.has(blueprint.questionTypeId)) errors.push(`${blueprint.questionTypeId}: practice blueprint không có question type tương ứng.`);
}

let questionsWithSubType = 0;
let questionsWithPracticeRole = 0;
let questionsWithRepresentation = 0;
let questionsMarkedHoldout = 0;
for (const question of practiceQuestions) {
  const blueprint = practiceBlueprintByTypeId.get(question.questionTypeId);
  const subtypeIds = new Set((blueprint?.subTypes ?? []).map(subtype => subtype.id));
  if (question.subTypeId) {
    questionsWithSubType += 1;
    if (!subtypeIds.has(question.subTypeId)) errors.push(`${question.id}: subTypeId không thuộc ${question.questionTypeId} (${question.subTypeId}).`);
  }
  if (question.practiceRole) {
    questionsWithPracticeRole += 1;
    if (!validPracticeRoles.has(question.practiceRole)) errors.push(`${question.id}: practiceRole không hợp lệ (${question.practiceRole}).`);
  }
  if (question.representationType) {
    questionsWithRepresentation += 1;
    if (!validRepresentations.has(question.representationType)) errors.push(`${question.id}: representationType không hợp lệ (${question.representationType}).`);
  }
  if (question.isMasteryHoldout) {
    questionsMarkedHoldout += 1;
    if (question.practiceRole && question.practiceRole !== 'mastery_holdout') errors.push(`${question.id}: isMasteryHoldout yêu cầu practiceRole mastery_holdout.`);
  }
}

for (const type of types) {
  const blueprint = practiceBlueprintByTypeId.get(type.id);
  const typeQuestions = practiceQuestions.filter(question => question.questionTypeId === type.id);
  const mappedQuestions = typeQuestions.filter(question => question.subTypeId);
  if (!mappedQuestions.length || !blueprint) continue;

  const coveredSubtypeIds = new Set(mappedQuestions.map(question => question.subTypeId));
  const missingSubtypeIds = (blueprint.subTypes ?? [])
    .map(subtype => subtype.id)
    .filter(subtypeId => !coveredSubtypeIds.has(subtypeId));
  const coveredRoles = new Set(mappedQuestions.map(question => question.practiceRole).filter(Boolean));
  const missingRoles = (blueprint.coverage?.requiredPracticeRoles ?? []).filter(role => !coveredRoles.has(role));
  const coveredRepresentations = new Set(mappedQuestions.map(question => question.representationType).filter(Boolean));
  const missingRepresentations = (blueprint.coverage?.requiredRepresentations ?? [])
    .filter(representation => !coveredRepresentations.has(representation));
  const holdoutCount = mappedQuestions.filter(question => question.isMasteryHoldout).length;
  const subtypeTargetRows = (blueprint.subTypes ?? []).map(subtype => {
    const subtypeQuestions = mappedQuestions.filter(question => question.subTypeId === subtype.id);
    return {
      id: subtype.id,
      actual: subtypeQuestions.length,
      target: subtype.targetQuestionCount,
      difficulties: new Set(subtypeQuestions.map(question => question.difficulty))
    };
  });
  const subtypesAtTarget = subtypeTargetRows.filter(row => row.actual >= row.target).length;
  const subtypesWithFullDifficulty = subtypeTargetRows.filter(
    row => ['easy', 'medium', 'hard'].every(level => row.difficulties.has(level))
  ).length;
  const subtypeQuestionDeficit = subtypeTargetRows.reduce(
    (sum, row) => sum + Math.max(0, row.target - row.actual),
    0
  );
  if (subtypeQuestionDeficit > 0) {
    warnings.push(
      `${type.id}: ${subtypesAtTarget}/${subtypeTargetRows.length} subtype đạt target; còn thiếu ${subtypeQuestionDeficit} câu theo dạng nhỏ.`
    );
  }
  const completedSubtypeTierGaps = subtypeTargetRows
    .filter(row => row.actual >= row.target)
    .map(row => ({
      id: row.id,
      missing: ['easy', 'medium', 'hard'].filter(level => !row.difficulties.has(level))
    }))
    .filter(row => row.missing.length);
  if (completedSubtypeTierGaps.length) {
    warnings.push(
      `${type.id}: subtype đã đủ số lượng nhưng thiếu tầng độ khó: ` +
      `${completedSubtypeTierGaps.map(row => `${row.id}(${row.missing.join('/')})`).join(', ')}.`
    );
  }
  practiceAuditSummaries.push(
    `${type.id}: ${mappedQuestions.length}/${blueprint.coverage.targetQuestionCount} câu hiện có/mục tiêu, ` +
    `${subtypesAtTarget}/${blueprint.subTypes.length} subtype đạt target, ` +
    `${subtypesWithFullDifficulty}/${blueprint.subTypes.length} subtype đủ dễ-vừa-khó, ` +
    `holdout ${holdoutCount}/${blueprint.coverage.masteryHoldoutCount}` +
    `${missingSubtypeIds.length ? `; thiếu subtype ${missingSubtypeIds.join(', ')}` : ''}` +
    `${missingRoles.length ? `; thiếu role ${missingRoles.join(', ')}` : ''}` +
    `${missingRepresentations.length ? `; thiếu biểu diễn ${missingRepresentations.join(', ')}` : ''}.`
  );
  if (process.env.PHYSICS10_VERBOSE_SUBTYPES === '1') {
    practiceAuditSummaries.push(
      `${type.id} chi tiết: ` +
      subtypeTargetRows.map(row =>
        `${row.id}=${row.actual}/${row.target}[${[...row.difficulties].join(',')}]`
      ).join('; ') + '.'
    );
  }
}

if (questionsWithSubType < practiceQuestions.length) {
  warnings.push(`Metadata migration: ${questionsWithSubType}/${practiceQuestions.length} câu luyện đã có subTypeId.`);
}
if (questionsWithPracticeRole < practiceQuestions.length) {
  warnings.push(`Metadata migration: ${questionsWithPracticeRole}/${practiceQuestions.length} câu luyện đã có practiceRole.`);
}
if (questionsWithRepresentation < practiceQuestions.length) {
  warnings.push(`Metadata migration: ${questionsWithRepresentation}/${practiceQuestions.length} câu luyện đã có representationType.`);
}

for (const question of questions) {
  const type = typeById.get(question.questionTypeId);
  if (question.subjectId !== 'physics') errors.push(`${question.id}: subjectId phải là physics.`);
  if (!topicById.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
  if (!type) errors.push(`${question.id}: questionTypeId không tồn tại.`);
  if (type && type.topicId !== question.topicId) errors.push(`${question.id}: topic lệch question type.`);
  if (!solutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
  if (!question.responseType) errors.push(`${question.id}: thiếu responseType.`);
  if (!(question.outcomeIds ?? []).length) errors.push(`${question.id}: thiếu outcomeIds.`);
  for (const outcomeId of question.outcomeIds ?? []) if (!outcomeById.has(outcomeId)) errors.push(`${question.id}: outcome không tồn tại (${outcomeId}).`);
  if (!String(question.competency).startsWith('physical_')) errors.push(`${question.id}: sai competency (${question.competency}).`);
  if (question.responseType === 'single_choice') {
    if (question.options?.length !== 4) errors.push(`${question.id}: MCQ phải có 4 phương án.`);
    const labels = (question.options ?? []).map(option => String(option).match(/^([A-D])\./)?.[1]);
    if (labels.some(label => !label) || new Set(labels).size !== 4) errors.push(`${question.id}: nhãn phương án phải là A–D.`);
    if (!labels.includes(question.correctAnswer)) errors.push(`${question.id}: correctAnswer không khớp options.`);
  }
  if (question.responseType === 'true_false_cluster') {
    const fields = question.answerSchema?.fields ?? [];
    if (fields.length !== 4) errors.push(`${question.id}: cụm Đúng/Sai phải có đúng 4 ý.`);
    if (question.answerSchema?.scoringMode !== 'per_field') errors.push(`${question.id}: cụm Đúng/Sai phải chấm độc lập từng ý.`);
    if (Object.keys(question.correctFinalAnswer ?? {}).length !== 4) errors.push(`${question.id}: thiếu đáp án cấu trúc cho 4 ý Đúng/Sai.`);
  }
  if (question.responseType === 'constructed_response') {
    if (question.validatorType !== 'manual' || question.answerSchema?.autoCheckMode !== 'manual') errors.push(`${question.id}: câu tự luận phải cấu hình chấm thủ công.`);
  }
}

for (const solution of solutions) {
  const question = questionById.get(solution.questionId);
  if (!question) errors.push(`${solution.id}: thiếu câu hỏi tương ứng.`);
  if (question && solution.finalAnswer !== question.correctAnswer) errors.push(`${solution.id}: đáp án lệch câu hỏi.`);
  if (String(solution.recognition).trim().length < 30) errors.push(`${solution.id}: nhận diện dạng bài quá ngắn.`);
  if ((solution.detailedSteps ?? []).length < 2) errors.push(`${solution.id}: cần ít nhất 2 bước giải.`);
  if (question?.responseType === 'constructed_response') {
    const rubricTotal = (solution.rubric ?? []).reduce((sum, criterion) => sum + criterion.points, 0);
    if (rubricTotal !== question.points) errors.push(`${solution.id}: tổng rubric là ${rubricTotal}, không khớp ${question.points} điểm.`);
  }
}

for (const outcome of outcomes) {
  if (!topicById.has(outcome.topicId)) errors.push(`${outcome.id}: topicId không tồn tại.`);
  for (const typeId of outcome.questionTypeIds ?? []) if (!typeById.has(typeId)) errors.push(`${outcome.id}: questionType không tồn tại (${typeId}).`);
  for (const prerequisiteId of outcome.prerequisiteOutcomeIds ?? []) if (!outcomeById.has(prerequisiteId)) errors.push(`${outcome.id}: prerequisite không tồn tại (${prerequisiteId}).`);
  for (const misconceptionId of outcome.misconceptionIds ?? []) {
    const misconception = misconceptionById.get(misconceptionId);
    if (!misconception) errors.push(`${outcome.id}: misconception không tồn tại (${misconceptionId}).`);
    else if (misconception.outcomeId !== outcome.id) errors.push(`${misconceptionId}: trỏ sai outcome.`);
  }
}

for (const exam of exams) {
  if (exam.subjectId !== 'physics') errors.push(`${exam.id}: subjectId phải là physics.`);
  if (exam.blueprintId && !assessmentBlueprintById.has(exam.blueprintId)) errors.push(`${exam.id}: blueprintId không tồn tại (${exam.blueprintId}).`);
  for (const questionId of exam.questionIds ?? []) if (!questionById.has(questionId)) errors.push(`${exam.id}: questionId không tồn tại (${questionId}).`);

  const blueprint = exam.blueprintId ? assessmentBlueprintById.get(exam.blueprintId) : undefined;
  if (!blueprint) continue;
  const examQuestions = (exam.questionIds ?? []).map(questionId => questionById.get(questionId)).filter(Boolean);
  const examPointTotal = examQuestions.reduce((sum, question) => sum + (question.points ?? 1), 0);
  if (examPointTotal !== blueprint.totalPoints) errors.push(`${exam.id}: tổng điểm câu hỏi là ${examPointTotal}, không khớp blueprint ${blueprint.totalPoints}.`);
  for (const question of examQuestions) {
    if (!blueprint.scopeTopicIds.includes(question.topicId)) errors.push(`${exam.id}/${question.id}: topic nằm ngoài phạm vi blueprint.`);
    for (const outcomeId of question.outcomeIds ?? []) if (!blueprint.outcomeIds.includes(outcomeId)) errors.push(`${exam.id}/${question.id}: outcome nằm ngoài phạm vi blueprint (${outcomeId}).`);
  }
  for (const section of blueprint.sections ?? []) {
    const sectionQuestions = examQuestions.filter(question => section.responseType === 'multiple_choice'
      ? question.responseType === 'single_choice'
      : question.responseType === section.responseType);
    const actualCount = sectionQuestions.length;
    const actualPoints = sectionQuestions.reduce((sum, question) => sum + (question.points ?? 1), 0);
    if (actualCount !== section.itemCount) errors.push(`${exam.id}/${section.id}: cần ${section.itemCount} câu, hiện có ${actualCount}.`);
    if (actualPoints !== section.points) errors.push(`${exam.id}/${section.id}: cần ${section.points} điểm, hiện có ${actualPoints}.`);
  }

  const normalizeContent = value => String(value ?? '')
    .toLocaleLowerCase('vi-VN')
    .replace(/\s+/g, ' ')
    .trim();
  const contentOwners = new Map();
  for (const question of examQuestions) {
    const normalizedContent = normalizeContent(question.content);
    const previousQuestionId = contentOwners.get(normalizedContent);
    if (previousQuestionId) errors.push(`${exam.id}: nội dung câu hỏi trùng hoàn toàn (${previousQuestionId} và ${question.id}).`);
    contentOwners.set(normalizedContent, question.id);
  }

  const estimatedSeconds = examQuestions.reduce((sum, question) => sum + (question.estimatedSeconds ?? 0), 0);
  const availableSeconds = exam.duration * 60;
  if (estimatedSeconds > availableSeconds) {
    warnings.push(`${exam.id}: tổng thời gian ước tính ${estimatedSeconds}s vượt thời lượng ${availableSeconds}s.`);
  }

  const difficultyCounts = Object.fromEntries(
    ['easy', 'medium', 'hard'].map(level => [level, examQuestions.filter(question => question.difficulty === level).length])
  );
  const difficultyShares = Object.fromEntries(
    Object.entries(difficultyCounts).map(([key, count]) => [key, examQuestions.length > 0 ? count / examQuestions.length : 0])
  );
  for (const [level, expectedShare] of Object.entries(blueprint.difficultyWeights ?? {})) {
    const actualShare = difficultyShares[level] ?? 0;
    if (Math.abs(actualShare - expectedShare) > 0.12) {
      warnings.push(`${exam.id}: tỉ lệ câu mức ${level} là ${(actualShare * 100).toFixed(1)}%, lệch ma trận ${(expectedShare * 100).toFixed(1)}%.`);
    }
  }

  const pointsBy = selector => examQuestions.reduce((result, question) => {
    const key = selector(question);
    if (key) result[key] = (result[key] ?? 0) + (question.points ?? 1);
    return result;
  }, {});
  const topicPoints = pointsBy(question => question.topicId);
  const competencyPoints = pointsBy(question => question.competency);
  for (const [topicId, expectedShare] of Object.entries(blueprint.topicWeights ?? {})) {
    const actualShare = examPointTotal > 0 ? (topicPoints[topicId] ?? 0) / examPointTotal : 0;
    if (Math.abs(actualShare - expectedShare) > 0.1) {
      warnings.push(`${exam.id}: trọng số điểm ${topicId} là ${(actualShare * 100).toFixed(1)}%, lệch ma trận ${(expectedShare * 100).toFixed(1)}%.`);
    }
  }
  for (const [competency, expectedShare] of Object.entries(blueprint.competencyWeights ?? {})) {
    const actualShare = examPointTotal > 0 ? (competencyPoints[competency] ?? 0) / examPointTotal : 0;
    if (Math.abs(actualShare - expectedShare) > 0.15) {
      warnings.push(`${exam.id}: trọng số điểm ${competency} là ${(actualShare * 100).toFixed(1)}%, lệch ma trận ${(expectedShare * 100).toFixed(1)}%.`);
    }
  }

  const coveredOutcomeIds = new Set(examQuestions.flatMap(question => question.outcomeIds ?? []));
  const outcomeCoverage = blueprint.outcomeIds.length > 0 ? coveredOutcomeIds.size / blueprint.outcomeIds.length : 1;
  if (outcomeCoverage < 0.6) {
    warnings.push(`${exam.id}: chỉ phủ ${coveredOutcomeIds.size}/${blueprint.outcomeIds.length} outcome trong phạm vi ma trận.`);
  }

  examAuditSummaries.push(
    `${exam.id}: ${difficultyCounts.easy}-${difficultyCounts.medium}-${difficultyCounts.hard} câu dễ/vừa/khó, ` +
    `${coveredOutcomeIds.size}/${blueprint.outcomeIds.length} outcome, ${estimatedSeconds}/${availableSeconds}s ước tính.`
  );
}

const examsByBlueprint = new Map();
for (const exam of exams.filter(item => item.blueprintId)) {
  const forms = examsByBlueprint.get(exam.blueprintId) ?? [];
  forms.push(exam);
  examsByBlueprint.set(exam.blueprintId, forms);
}
for (const [blueprintId, forms] of examsByBlueprint) {
  if (forms.length < 2) continue;
  const distributionSignature = exam => {
    const examQuestions = (exam.questionIds ?? []).map(questionId => questionById.get(questionId)).filter(Boolean);
    return ['easy', 'medium', 'hard']
      .map(level => examQuestions.filter(question => question.difficulty === level).length)
      .join('-');
  };
  const signatures = new Set(forms.map(distributionSignature));
  if (signatures.size > 1) warnings.push(`${blueprintId}: các mã đề chưa tương đương về phân bố độ khó (${[...signatures].join(' / ')}).`);
}

const isApproximatelyOne = value => Math.abs(value - 1) < 0.000001;
for (const blueprint of assessmentBlueprints) {
  if (blueprint.subjectId !== 'physics') errors.push(`${blueprint.id}: subjectId phải là physics.`);
  if (blueprint.duration !== 45) errors.push(`${blueprint.id}: đề định kỳ mặc định phải có thời lượng 45 phút.`);
  if (blueprint.totalPoints !== 10) errors.push(`${blueprint.id}: tổng điểm phải bằng 10.`);
  for (const topicId of blueprint.scopeTopicIds ?? []) if (!topicById.has(topicId)) errors.push(`${blueprint.id}: topic không tồn tại (${topicId}).`);
  for (const outcomeId of blueprint.outcomeIds ?? []) if (!outcomeById.has(outcomeId)) errors.push(`${blueprint.id}: outcome không tồn tại (${outcomeId}).`);

  const topicWeightTotal = Object.values(blueprint.topicWeights ?? {}).reduce((sum, value) => sum + value, 0);
  if (!isApproximatelyOne(topicWeightTotal)) errors.push(`${blueprint.id}: tổng topicWeights phải bằng 1, hiện là ${topicWeightTotal}.`);

  const competencyEntries = Object.entries(blueprint.competencyWeights ?? {});
  const competencyWeightTotal = competencyEntries.reduce((sum, [, value]) => sum + value, 0);
  if (!isApproximatelyOne(competencyWeightTotal)) errors.push(`${blueprint.id}: tổng competencyWeights phải bằng 1, hiện là ${competencyWeightTotal}.`);
  for (const [competency] of competencyEntries) if (!competency.startsWith('physical_')) errors.push(`${blueprint.id}: competency không thuộc Vật lí (${competency}).`);

  const difficultyWeightTotal = Object.values(blueprint.difficultyWeights ?? {}).reduce((sum, value) => sum + value, 0);
  if (!isApproximatelyOne(difficultyWeightTotal)) errors.push(`${blueprint.id}: tổng difficultyWeights phải bằng 1, hiện là ${difficultyWeightTotal}.`);

  const sectionPointTotal = (blueprint.sections ?? []).reduce((sum, section) => sum + section.points, 0);
  if (sectionPointTotal !== blueprint.totalPoints) errors.push(`${blueprint.id}: tổng điểm các phần là ${sectionPointTotal}, không khớp ${blueprint.totalPoints}.`);
  for (const section of blueprint.sections ?? []) {
    if (section.itemCount <= 0) errors.push(`${blueprint.id}/${section.id}: itemCount phải lớn hơn 0.`);
    if (section.points <= 0) errors.push(`${blueprint.id}/${section.id}: points phải lớn hơn 0.`);
  }
}

const practiceDifficultyCounts = Object.fromEntries(
  ['easy', 'medium', 'hard'].map(level => [
    level,
    practiceQuestions.filter(question => question.difficulty === level).length
  ])
);

console.log(`Vật lí 10: ${curriculum.length} module blueprint, ${assessmentBlueprints.length} ma trận đề, ${blueprintOutcomes.length} outcome toàn khóa.`);
console.log(`Đánh giá Vật lí 10: ${exams.length} đề, ${assessmentQuestions.length} câu riêng, ${assessmentSolutions.length} lời giải.`);
console.log(`Luyện tập Vật lí 10: ${practiceBlueprints.length} blueprint, ${subtypeTotal} dạng con, ${practiceQuestions.length}/${practiceTargetTotal} câu hiện có/mục tiêu.`);
console.log(`Độ khó luyện tập: ${practiceDifficultyCounts.easy} dễ, ${practiceDifficultyCounts.medium} vừa, ${practiceDifficultyCounts.hard} khó.`);
console.log(`Metadata luyện tập: ${questionsWithSubType} subtype, ${questionsWithPracticeRole} vai trò, ${questionsWithRepresentation} biểu diễn, ${questionsMarkedHoldout} holdout.`);
for (const summary of examAuditSummaries) console.log(`Audit ${summary}`);
for (const summary of practiceAuditSummaries) console.log(`Coverage ${summary}`);
for (const module of moduleData) {
  console.log(`${module.label}: ${module.types.length} micro-type, ${module.questions.length} câu, ${module.solutions.length} lời giải, ${module.practiceMetadata.length} metadata.`);
}
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
console.log('Dữ liệu nền tảng Vật lí 10 hợp lệ.');
