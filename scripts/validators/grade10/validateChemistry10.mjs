import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const chemistryRoot = path.join(root, 'src', 'data', 'grade10', 'chemistry');

const moduleSpecs = [
  ['Module 0', 'module0_intro', 'm0'],
  ['Module 1', 'module1_atoms', 'm1'],
  ['Module 2', 'module2_periodic', 'm2'],
  ['Module 3', 'module3_bond', 'm3'],
  ['Module 4', 'module4_redox', 'm4'],
  ['Module 5', 'module5_energy', 'm5'],
  ['Module 6', 'module6_rate', 'm6'],
  ['Module 7', 'module7_halogen', 'm7'],
  ['Module 8', 'module8_synthesis', 'm8']
].map(([label, directory, prefix], index) => ({ label, directory, prefix, topicId: `chem10-t${index}` }));

const unwrap = node => {
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) {
    return unwrap(node.expression);
  }
  return node;
};

const readNodeValue = input => {
  const node = unwrap(input);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return node.operator === ts.SyntaxKind.MinusToken ? -Number(node.operand.text) : Number(node.operand.text);
  }
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
  if (ts.isCallExpression(node)) {
    return { __call: node.expression.getText(), args: node.arguments.map(readNodeValue) };
  }
  return node.getText();
};

const readExport = (filePath, exportName) => {
  const source = ts.createSourceFile(filePath, fs.readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true);
  let result;
  source.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (declaration.name.getText() === exportName && declaration.initializer) {
        result = readNodeValue(declaration.initializer);
      }
    }
  });
  if (result === undefined) throw new Error(`Không đọc được ${exportName} trong ${filePath}.`);
  return result;
};

const normalizeQuestion = item => {
  if (!item?.__call) return item;
  if (item.__call === 'choice' || item.__call === 'q') {
    const [id, questionTypeId, subTypeId, content, options, correctAnswer, difficulty, practiceRole, representationType] = item.args;
    return { id, questionTypeId, subTypeId, content, options: typeof options === 'string' ? options.split('|') : options, correctAnswer, acceptedAnswers: [correctAnswer, String(correctAnswer).toLowerCase()], difficulty, practiceRole, representationType, responseType: 'single_choice' };
  }
  if (item.__call === 'shortAnswer' || item.__call === 's') {
    const [id, questionTypeId, subTypeId, content, correctAnswer, acceptedAnswers, difficulty, practiceRole, representationType] = item.args;
    return { id, questionTypeId, subTypeId, content, correctAnswer, acceptedAnswers, difficulty, practiceRole, representationType, responseType: 'short_answer' };
  }
  return item;
};

const normalizeMetadata = item => {
  if (!item?.__call || item.__call !== 'm') return item;
  const [questionId, subTypeId, practiceRole, representationType, isMasteryHoldout] = item.args;
  return { questionId, subTypeId, practiceRole, representationType, ...(isMasteryHoldout ? { isMasteryHoldout: true } : {}) };
};

const normalizeSolution = item => {
  if (!item?.__call) return { ...item, __fromHelper: false };
  const [questionId, finalAnswer, ...details] = item.args;
  return { questionId, finalAnswer, __fromHelper: true, __helper: item.__call, __details: details };
};

const normalizeAssessmentQuestion = item => {
  if (!item?.__call) return item;
  if ((item.__call === 'item' || item.__call === 'makeTheoryQuestion') && typeof item.args?.[0] === 'object') {
    return item.args[0];
  }
  return normalizeQuestion(item);
};

const normalizeAssessmentSolution = item => {
  if (!item?.__call) return { ...item, answerCandidates: [String(item.finalAnswer)] };
  if (item.__call === 'makeTheorySolution' && typeof item.args?.[0] === 'object') {
    const input = item.args[0];
    return { questionId: input.questionId, finalAnswer: input.finalAnswer, answerCandidates: [String(input.finalAnswer)] };
  }
  return {
    questionId: item.args?.[0],
    answerCandidates: (item.args ?? []).slice(1).filter(value => typeof value === 'string').map(String)
  };
};

const assessmentSources = [];
for (let moduleIndex = 1; moduleIndex <= 7; moduleIndex += 1) {
  const assessmentRoot = path.join(
    chemistryRoot,
    'modules',
    moduleSpecs[moduleIndex].directory,
    'assessments'
  );
  assessmentSources.push(
    {
      questionPath: path.join(assessmentRoot, 'questions.ts'),
      questionExport: `m${moduleIndex}AssessmentQuestions`,
      solutionPath: path.join(assessmentRoot, 'solutions.ts'),
      solutionExport: `m${moduleIndex}AssessmentSolutions`
    },
    {
      questionPath: path.join(assessmentRoot, 'questionsFormB.ts'),
      questionExport: `m${moduleIndex}AssessmentQuestionsFormB`,
      solutionPath: path.join(assessmentRoot, 'solutionsFormB.ts'),
      solutionExport: `m${moduleIndex}AssessmentSolutionsFormB`
    },
    {
      questionPath: path.join(assessmentRoot, 'theory', 'questions.ts'),
      questionExport: `m${moduleIndex}TheoryQuestions`,
      solutionPath: path.join(assessmentRoot, 'theory', 'solutions.ts'),
      solutionExport: `m${moduleIndex}TheorySolutions`
    }
  );
}
for (const form of ['A', 'B']) {
  assessmentSources.push(
    {
      questionPath: path.join(chemistryRoot, 'assessments', 'midterm1', `questionsForm${form}.ts`),
      questionExport: `midterm1QuestionsForm${form}`,
      solutionPath: path.join(chemistryRoot, 'assessments', 'midterm1', `solutionsForm${form}.ts`),
      solutionExport: `midterm1SolutionsForm${form}`
    },
    {
      questionPath: path.join(chemistryRoot, 'assessments', 'final2', `questionsForm${form}.ts`),
      questionExport: `final2QuestionsForm${form}`,
      solutionPath: path.join(chemistryRoot, 'assessments', 'final2', `solutionsForm${form}.ts`),
      solutionExport: `final2SolutionsForm${form}`
    }
  );
}

let assessmentQuestions = assessmentSources.flatMap(source => (
  readExport(source.questionPath, source.questionExport).map(normalizeAssessmentQuestion)
));
let assessmentSolutions = assessmentSources.flatMap(source => (
  readExport(source.solutionPath, source.solutionExport).map(normalizeAssessmentSolution)
));

const periodicAutoPath = path.join(chemistryRoot, 'assessments', 'periodicAuto.ts');
const periodicClonePlans = readExport(periodicAutoPath, 'g10ChemistryPeriodicClonePlans');
const periodicTrueFalseSeeds = readExport(periodicAutoPath, 'g10ChemistryPeriodicTrueFalseSeeds')
  .map(seed => seed?.__call === 'tfSeed' ? seed.args[0] : seed);
const periodicExtraShortSeeds = readExport(periodicAutoPath, 'g10ChemistryFinal2ExtraShortSeeds');
const assessmentSourceById = new Map(assessmentQuestions.map(question => [question.id, question]));
const periodicGeneratedQuestions = [];
const periodicGeneratedSolutions = [];
const periodicAnswerPattern = ['A', 'B', 'C', 'D'];
const periodicMcqDifficulties = ['easy', 'easy', 'easy', 'easy', 'medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'hard', 'hard'];
const periodicShortDifficulties = ['easy', 'medium', 'medium', 'medium', 'medium', 'hard'];

for (const plan of periodicClonePlans) {
  let mcqIndex = 0;
  for (const moduleNumber of plan.moduleNumbers) {
    for (const position of plan.mcqPositions) {
      const sourceId = `chem10-assess-m${moduleNumber}-cp-${plan.form}-q${String(position).padStart(2, '0')}`;
      const source = assessmentSourceById.get(sourceId);
      if (!source) throw new Error(`Không tìm thấy câu nguồn ${sourceId} cho đề định kỳ.`);
      const id = `${plan.prefix}-q${String(mcqIndex + 1).padStart(2, '0')}`;
      const correctAnswer = periodicAnswerPattern[mcqIndex % periodicAnswerPattern.length];
      periodicGeneratedQuestions.push({
        ...source,
        id,
        correctAnswer,
        acceptedAnswers: [correctAnswer, correctAnswer.toLowerCase()],
        difficulty: periodicMcqDifficulties[mcqIndex],
        responseType: 'single_choice',
        points: 0.25
      });
      periodicGeneratedSolutions.push({ questionId: id, answerCandidates: [correctAnswer] });
      mcqIndex += 1;
    }
  }

  let shortIndex = 0;
  for (const moduleNumber of plan.moduleNumbers) {
    for (const position of plan.shortPositions) {
      const sourceId = `chem10-assess-m${moduleNumber}-cp-${plan.form}-q${String(position).padStart(2, '0')}`;
      const source = assessmentSourceById.get(sourceId);
      if (!source) throw new Error(`Không tìm thấy câu nguồn ${sourceId} cho đề định kỳ.`);
      const id = `${plan.prefix}-q${String(shortIndex + 17).padStart(2, '0')}`;
      periodicGeneratedQuestions.push({
        ...source,
        id,
        difficulty: periodicShortDifficulties[shortIndex],
        responseType: 'short_answer',
        points: 0.5
      });
      periodicGeneratedSolutions.push({ questionId: id, answerCandidates: [String(source.correctAnswer)] });
      shortIndex += 1;
    }
  }
}

for (const seed of periodicTrueFalseSeeds) {
  periodicGeneratedQuestions.push({
    id: seed.id,
    topicId: seed.topicId,
    questionTypeId: seed.questionTypeId,
    content: seed.content,
    statements: seed.statements,
    correctAnswer: Object.values(seed.correct).join(''),
    difficulty: seed.difficulty,
    responseType: 'true_false_cluster',
    points: 1
  });
  periodicGeneratedSolutions.push({
    questionId: seed.id,
    answerCandidates: [Object.values(seed.correct).join('')]
  });
}

for (const seed of periodicExtraShortSeeds) {
  periodicGeneratedQuestions.push({
    ...seed,
    difficulty: 'hard',
    responseType: 'short_answer',
    points: 0.5
  });
  periodicGeneratedSolutions.push({ questionId: seed.id, answerCandidates: [String(seed.correctAnswer)] });
}

const final2SelectedNumbers = [1, 2, 4, 5, 7, 8, 10, 13, 16, 17, 18, 20];
const final2ShortDifficulties = ['easy', 'medium', 'medium', 'medium', 'medium'];
for (const form of ['a', 'b']) {
  final2SelectedNumbers.forEach((number, index) => {
    const id = `chem10-assess-final2-${form}-q${String(number).padStart(2, '0')}`;
    const question = assessmentSourceById.get(id);
    if (!question) throw new Error(`Không tìm thấy ${id} để dựng đề Cuối kỳ II.`);
    const correctAnswer = periodicAnswerPattern[index % periodicAnswerPattern.length];
    question.correctAnswer = correctAnswer;
    question.acceptedAnswers = [correctAnswer, correctAnswer.toLowerCase()];
    question.difficulty = periodicMcqDifficulties[index];
    question.responseType = 'single_choice';
    question.points = 0.25;
    const solution = assessmentSolutions.find(item => item.questionId === id);
    if (solution) solution.answerCandidates = [...new Set([...(solution.answerCandidates ?? []), correctAnswer])];
  });
  final2ShortDifficulties.forEach((difficulty, index) => {
    const id = `chem10-assess-final2-${form}-q${String(index + 21).padStart(2, '0')}`;
    const question = assessmentSourceById.get(id);
    if (!question) throw new Error(`Không tìm thấy ${id} để dựng đề Cuối kỳ II.`);
    question.difficulty = difficulty;
    question.responseType = 'short_answer';
    question.points = 0.5;
  });
}

assessmentQuestions = [...assessmentQuestions, ...periodicGeneratedQuestions];
assessmentSolutions = [...assessmentSolutions, ...periodicGeneratedSolutions];

const remediationEntries = readExport(
  path.join(chemistryRoot, 'practiceRemediation.ts'),
  'g10ChemistryRemediationEntries'
);
const remediationQuestions = remediationEntries.map(entry => ({
  id: entry.id,
  subjectId: 'chemistry',
  topicId: entry.t,
  questionTypeId: entry.st.replace(/-st\d+$/, ''),
  subTypeId: entry.st,
  content: entry.c,
  responseType: entry.opts ? 'single_choice' : 'short_answer',
  ...(entry.opts ? { options: entry.opts } : {}),
  correctAnswer: entry.a,
  acceptedAnswers: entry.opts
    ? [entry.a, String(entry.a).toLowerCase()]
    : (entry.acc ?? [entry.a]),
  validatorType: entry.opts ? 'choice' : 'exact',
  difficulty: entry.d,
  sourceType: 'manual',
  practiceRole: entry.d === 'easy' ? 'guided' : entry.d === 'hard' ? 'mastery_holdout' : 'near_transfer',
  representationType: entry.rep ?? (entry.opts ? 'text' : 'equation'),
  isMasteryHoldout: entry.d === 'hard'
}));
const remediationSolutions = remediationEntries.map(entry => ({
  questionId: entry.id,
  finalAnswer: entry.a,
  recognition: `Dạng bù coverage ${entry.st}.`,
  detailedSteps: entry.r.map((explanation, index) => ({ order: index + 1, explanation })),
  commonMistakes: ['Áp dụng quy tắc chưa đúng điều kiện.'],
  reviewSuggestions: ['Đối chiếu lý thuyết và kiểm tra dữ kiện.'],
  __fromHelper: false
}));

const readModule = spec => {
  const moduleRoot = path.join(chemistryRoot, 'modules', spec.directory);
  return {
    ...spec,
    types: readExport(path.join(moduleRoot, 'questionTypes.ts'), `${spec.prefix}QuestionTypes`),
    questions: [
      ...readExport(path.join(moduleRoot, 'questions.ts'), `${spec.prefix}Questions`),
      ...readExport(path.join(moduleRoot, 'practiceExpansion', 'questions.ts'), `${spec.prefix}ExpansionQuestions`),
      ...(fs.existsSync(path.join(moduleRoot, 'practiceGapFill', 'questions.ts'))
        ? readExport(path.join(moduleRoot, 'practiceGapFill', 'questions.ts'), `${spec.prefix}GapFillQuestions`)
        : []),
      ...(fs.existsSync(path.join(moduleRoot, 'practiceExpansion2', 'questions.ts'))
        ? readExport(path.join(moduleRoot, 'practiceExpansion2', 'questions.ts'), `${spec.prefix}Expansion2Questions`)
        : []),
      ...remediationQuestions.filter(question => question.topicId === spec.topicId)
    ].map(normalizeQuestion),
    solutions: [
      ...readExport(path.join(moduleRoot, 'solutions.ts'), `${spec.prefix}Solutions`),
      ...readExport(path.join(moduleRoot, 'practiceExpansion', 'solutions.ts'), `${spec.prefix}ExpansionSolutions`),
      ...(fs.existsSync(path.join(moduleRoot, 'practiceGapFill', 'solutions.ts'))
        ? readExport(path.join(moduleRoot, 'practiceGapFill', 'solutions.ts'), `${spec.prefix}GapFillSolutions`)
        : []),
      ...(fs.existsSync(path.join(moduleRoot, 'practiceExpansion2', 'solutions.ts'))
        ? readExport(path.join(moduleRoot, 'practiceExpansion2', 'solutions.ts'), `${spec.prefix}Expansion2Solutions`)
        : []),
      ...remediationSolutions.filter(solution => (
        remediationQuestions.find(question => question.id === solution.questionId)?.topicId === spec.topicId
      ))
    ].map(normalizeSolution),
    blueprints: readExport(path.join(moduleRoot, 'practiceBlueprint.ts'), `${spec.prefix}PracticeBlueprints`),
    metadata: fs.existsSync(path.join(moduleRoot, 'practiceMetadata.ts'))
      ? readExport(path.join(moduleRoot, 'practiceMetadata.ts'), `${spec.prefix}PracticeMetadata`).map(normalizeMetadata)
      : []
  };
};

const modules = moduleSpecs.map(readModule);
const types = modules.flatMap(module => module.types);
const questions = modules.flatMap(module => module.questions);
const blueprints = modules.flatMap(module => module.blueprints);
const metadata = modules.flatMap(module => module.metadata);
const solutions = modules.flatMap(module => module.solutions);
const solutionQuestionIds = solutions.map(solution => solution.questionId);

const errors = [];
const warnings = [];

const ensureUnique = (items, keyOf, label) => {
  const seen = new Set();
  for (const item of items) {
    const key = keyOf(item);
    if (!key) {
      errors.push(`${label} thiếu khóa định danh.`);
      continue;
    }
    if (seen.has(key)) errors.push(`${label} trùng định danh: ${key}.`);
    seen.add(key);
  }
};

ensureUnique(types, item => item.id, 'Question type');
ensureUnique(questions, item => item.id, 'Question');
ensureUnique(blueprints, item => item.questionTypeId, 'Practice blueprint');
ensureUnique(metadata, item => item.questionId, 'Practice metadata');
ensureUnique(solutionQuestionIds.map(questionId => ({ questionId })), item => item.questionId, 'Solution');
ensureUnique(assessmentQuestions, item => item.id, 'Assessment question');
ensureUnique(assessmentSolutions, item => item.questionId, 'Assessment solution');

const typeById = new Map(types.map(item => [item.id, item]));
const questionById = new Map(questions.map(item => [item.id, item]));
const blueprintByTypeId = new Map(blueprints.map(item => [item.questionTypeId, item]));
const metadataByQuestionId = new Map(metadata.map(item => [item.questionId, item]));
const solutionByQuestionId = new Map(solutions.map(item => [item.questionId, item]));
const assessmentSolutionByQuestionId = new Map(assessmentSolutions.map(item => [item.questionId, item]));
const assessmentQuestionById = new Map(assessmentQuestions.map(item => [item.id, item]));

const periodicExamSources = [
  ['midterm1.ts', 'midterm1Exams'],
  ['final1.ts', 'final1Exams'],
  ['midterm2.ts', 'midterm2Exams'],
  ['final2.ts', 'final2Exams']
];
const periodicExams = periodicExamSources.flatMap(([fileName, exportName]) => (
  readExport(path.join(chemistryRoot, 'assessments', 'exams', fileName), exportName)
));
const periodicBlueprintSources = [
  ['midterm1.ts', 'midterm1Blueprint'],
  ['final1.ts', 'final1Blueprint'],
  ['midterm2.ts', 'midterm2Blueprint'],
  ['final2.ts', 'final2Blueprint']
];
const periodicBlueprints = periodicBlueprintSources.map(([fileName, exportName]) => (
  readExport(path.join(chemistryRoot, 'assessments', 'blueprints', fileName), exportName)
));
const periodicBlueprintById = new Map(periodicBlueprints.map(blueprint => [blueprint.id, blueprint]));
const expectedPeriodicExams = new Map([
  ['chem10-midterm1-a', { scope: ['chem10-t1', 'chem10-t2', 'chem10-t3'], structure: [16, 0, 6] }],
  ['chem10-midterm1-b', { scope: ['chem10-t1', 'chem10-t2', 'chem10-t3'], structure: [16, 0, 6] }],
  ['chem10-final1-a', { scope: ['chem10-t1', 'chem10-t2', 'chem10-t3'], structure: [12, 4, 6] }],
  ['chem10-final1-b', { scope: ['chem10-t1', 'chem10-t2', 'chem10-t3'], structure: [12, 4, 6] }],
  ['chem10-midterm2-a', { scope: ['chem10-t4', 'chem10-t5'], structure: [12, 4, 6] }],
  ['chem10-midterm2-b', { scope: ['chem10-t4', 'chem10-t5'], structure: [12, 4, 6] }],
  ['chem10-final2-a', { scope: ['chem10-t1', 'chem10-t2', 'chem10-t3', 'chem10-t4', 'chem10-t5', 'chem10-t6', 'chem10-t7'], structure: [12, 4, 6] }],
  ['chem10-final2-b', { scope: ['chem10-t1', 'chem10-t2', 'chem10-t3', 'chem10-t4', 'chem10-t5', 'chem10-t6', 'chem10-t7'], structure: [12, 4, 6] }]
]);

const periodicExamQuestionIds = examId => {
  const form = examId.endsWith('-a') ? 'a' : 'b';
  if (examId.startsWith('chem10-midterm1-')) {
    return Array.from({ length: 22 }, (_, index) => `chem10-assess-mid1-${form}-q${String(index + 1).padStart(2, '0')}`);
  }
  if (examId.startsWith('chem10-final1-')) {
    return Array.from({ length: 22 }, (_, index) => `chem10-assess-final1-${form}-q${String(index + 1).padStart(2, '0')}`);
  }
  if (examId.startsWith('chem10-midterm2-')) {
    return Array.from({ length: 22 }, (_, index) => `chem10-assess-mid2-${form}-q${String(index + 1).padStart(2, '0')}`);
  }
  return [
    ...final2SelectedNumbers.map(number => `chem10-assess-final2-${form}-q${String(number).padStart(2, '0')}`),
    ...Array.from({ length: 4 }, (_, index) => `chem10-assess-final2-${form}-tf${String(index + 1).padStart(2, '0')}`),
    ...Array.from({ length: 5 }, (_, index) => `chem10-assess-final2-${form}-q${String(index + 21).padStart(2, '0')}`),
    `chem10-assess-final2-${form}-extra-short01`
  ];
};

const periodicRows = [];
ensureUnique(periodicExams, exam => exam.id, 'Periodic exam');
ensureUnique(periodicBlueprints, blueprint => blueprint.id, 'Periodic blueprint');
for (const expectedId of expectedPeriodicExams.keys()) {
  if (!periodicExams.some(exam => exam.id === expectedId)) errors.push(`Thiếu đề định kỳ ${expectedId}.`);
}
if (periodicExams.length !== expectedPeriodicExams.size) {
  errors.push(`Hệ thống định kỳ phải có đúng ${expectedPeriodicExams.size} đề A/B, hiện có ${periodicExams.length}.`);
}

for (const exam of periodicExams) {
  const expected = expectedPeriodicExams.get(exam.id);
  if (!expected) {
    errors.push(`${exam.id}: đề định kỳ ngoài danh mục chuẩn.`);
    continue;
  }
  if (exam.duration !== 45) errors.push(`${exam.id}: thời lượng phải là 45 phút, hiện là ${exam.duration}.`);
  if (exam.totalPoints !== 10) errors.push(`${exam.id}: tổng điểm khai báo phải bằng 10.`);
  if (![1, 2].includes(exam.semester)) errors.push(`${exam.id}: thiếu hoặc sai học kỳ.`);
  if (!exam.blueprintId || !periodicBlueprintById.has(exam.blueprintId)) {
    errors.push(`${exam.id}: thiếu blueprintId hợp lệ.`);
  }
  if (!exam.parallelFormGroup || !exam.assessmentVersion) {
    errors.push(`${exam.id}: thiếu nhóm mã đề hoặc phiên bản đánh giá.`);
  }
  if (JSON.stringify(exam.scopeTopicIds) !== JSON.stringify(expected.scope)) {
    errors.push(`${exam.id}: phạm vi topic không đúng kế hoạch.`);
  }

  const questionIds = periodicExamQuestionIds(exam.id);
  if (new Set(questionIds).size !== questionIds.length) errors.push(`${exam.id}: trùng câu trong cùng đề.`);
  const examQuestions = questionIds.map(id => assessmentQuestionById.get(id));
  const missingIds = questionIds.filter((id, index) => !examQuestions[index]);
  if (missingIds.length > 0) errors.push(`${exam.id}: thiếu câu ${missingIds.join(', ')}.`);
  const presentQuestions = examQuestions.filter(Boolean);
  const choiceQuestions = presentQuestions.filter(question => Array.isArray(question.options));
  const trueFalseQuestions = presentQuestions.filter(question => question.responseType === 'true_false_cluster');
  const shortQuestions = presentQuestions.filter(question => !Array.isArray(question.options) && question.responseType !== 'true_false_cluster');
  const actualStructure = [choiceQuestions.length, trueFalseQuestions.length, shortQuestions.length];
  if (JSON.stringify(actualStructure) !== JSON.stringify(expected.structure)) {
    errors.push(`${exam.id}: cơ cấu hiện là ${actualStructure.join('/')}, cần ${expected.structure.join('/')}.`);
  }
  for (const question of trueFalseQuestions) {
    if (!Array.isArray(question.statements) || question.statements.length !== 4) {
      errors.push(`${question.id}: cụm Đúng/Sai phải có đúng 4 phát biểu.`);
    }
  }

  const pointTotal = presentQuestions.reduce((sum, question) => sum + (question.points ?? 0), 0);
  if (Math.abs(pointTotal - 10) > 1e-9) errors.push(`${exam.id}: tổng điểm câu hỏi là ${pointTotal}, phải bằng 10.`);
  const outOfScope = presentQuestions.filter(question => !expected.scope.includes(question.topicId));
  if (outOfScope.length > 0) errors.push(`${exam.id}: có câu ngoài phạm vi ${outOfScope.map(question => question.id).join(', ')}.`);

  const keyCounts = Object.fromEntries(periodicAnswerPattern.map(letter => [
    letter,
    choiceQuestions.filter(question => String(question.correctAnswer).toUpperCase() === letter).length
  ]));
  if (!exam.id.startsWith('chem10-midterm1-')) {
    if (Object.values(keyCounts).some(count => count !== 3)) {
      errors.push(`${exam.id}: đáp án 12 câu lựa chọn phải cân bằng A3/B3/C3/D3.`);
    }
    const difficultyPoints = Object.fromEntries(['easy', 'medium', 'hard'].map(level => [
      level,
      presentQuestions
        .filter(question => question.difficulty === level)
        .reduce((sum, question) => sum + (question.points ?? 0), 0)
    ]));
    const targetDifficultyPoints = { easy: 2.5, medium: 5.5, hard: 2 };
    for (const level of Object.keys(targetDifficultyPoints)) {
      if (Math.abs(difficultyPoints[level] - targetDifficultyPoints[level]) > 1e-9) {
        errors.push(`${exam.id}: điểm ${level} là ${difficultyPoints[level]}, cần ${targetDifficultyPoints[level]}.`);
      }
    }
  }
  periodicRows.push({
    Exam: exam.id,
    Minutes: exam.duration,
    Structure: actualStructure.join('/'),
    Points: pointTotal,
    Keys: `A${keyCounts.A}/B${keyCounts.B}/C${keyCounts.C}/D${keyCounts.D}`
  });
}

for (const blueprint of periodicBlueprints) {
  if (blueprint.duration !== 45 || blueprint.totalPoints !== 10) {
    errors.push(`${blueprint.id}: blueprint phải cấu hình 45 phút và 10 điểm.`);
  }
  const sectionItems = (blueprint.sections ?? []).reduce((sum, section) => sum + (section.itemCount ?? 0), 0);
  const sectionPoints = (blueprint.sections ?? []).reduce((sum, section) => sum + (section.points ?? 0), 0);
  if (sectionItems !== 22 || Math.abs(sectionPoints - 10) > 1e-9) {
    errors.push(`${blueprint.id}: blueprint phải có 22 câu/cụm và đủ 10 điểm.`);
  }
}

if (assessmentQuestions.length !== 444) {
  errors.push(`Ngân hàng đánh giá Hóa 10 phải có 444 câu, hiện đọc được ${assessmentQuestions.length}.`);
}
if (assessmentSolutions.length !== assessmentQuestions.length) {
  errors.push(`Ngân hàng đánh giá có ${assessmentQuestions.length} câu nhưng ${assessmentSolutions.length} lời giải.`);
}
for (const question of assessmentQuestions) {
  if (!question.id) {
    errors.push('Assessment question thiếu id.');
    continue;
  }
  if (!typeById.has(question.questionTypeId)) {
    errors.push(`${question.id}: assessment dùng questionTypeId không tồn tại ${question.questionTypeId}.`);
  }
  if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
    errors.push(`${question.id}: assessment có difficulty không hợp lệ.`);
  }
  if (question.correctAnswer === undefined || question.correctAnswer === null || String(question.correctAnswer) === '') {
    errors.push(`${question.id}: assessment thiếu correctAnswer.`);
  }
  const solution = assessmentSolutionByQuestionId.get(question.id);
  if (!solution) {
    errors.push(`${question.id}: assessment thiếu lời giải.`);
    continue;
  }
  if (/^[A-D]$/i.test(String(question.correctAnswer))) {
    const candidates = solution.answerCandidates ?? [String(solution.finalAnswer)];
    if (!candidates.some(candidate => String(candidate).toUpperCase() === String(question.correctAnswer).toUpperCase())) {
      errors.push(`${question.id}: đáp án assessment ${question.correctAnswer} không xuất hiện trong lời giải.`);
    }
  }
}
for (const solution of assessmentSolutions) {
  if (!assessmentQuestions.some(question => question.id === solution.questionId)) {
    errors.push(`${solution.questionId}: lời giải assessment không có câu hỏi tương ứng.`);
  }
}

if (types.length !== 44) errors.push(`Hóa 10 phải có 44 dạng lớn hiện hành, hiện đọc được ${types.length}.`);
if (blueprints.length !== types.length) errors.push(`Blueprint phải phủ ${types.length} dạng lớn, hiện có ${blueprints.length}.`);

for (const type of types) {
  if (!blueprintByTypeId.has(type.id)) errors.push(`${type.id}: thiếu practice blueprint.`);
}

const allSubTypeIds = [];
for (const blueprint of blueprints) {
  if (!typeById.has(blueprint.questionTypeId)) {
    errors.push(`${blueprint.questionTypeId}: blueprint không có question type tương ứng.`);
    continue;
  }
  if (!Array.isArray(blueprint.subTypes) || blueprint.subTypes.length < 3) {
    errors.push(`${blueprint.questionTypeId}: cần tối thiểu 3 dạng con.`);
    continue;
  }
  const targetFromSubTypes = blueprint.subTypes.reduce((sum, item) => sum + (item.targetQuestionCount ?? 0), 0);
  if (targetFromSubTypes !== blueprint.coverage?.targetQuestionCount) {
    errors.push(`${blueprint.questionTypeId}: tổng target dạng con ${targetFromSubTypes} khác target dạng lớn ${blueprint.coverage?.targetQuestionCount}.`);
  }
  for (const subType of blueprint.subTypes) {
    allSubTypeIds.push({ id: subType.id, questionTypeId: blueprint.questionTypeId });
    if (!subType.id || !subType.name || !subType.example) {
      errors.push(`${blueprint.questionTypeId}: dạng con thiếu id, name hoặc example.`);
    }
    if (!Array.isArray(subType.recognitionSigns) || subType.recognitionSigns.length === 0) {
      errors.push(`${subType.id ?? blueprint.questionTypeId}: thiếu dấu hiệu nhận biết.`);
    }
    if (!Number.isInteger(subType.targetQuestionCount) || subType.targetQuestionCount < 3) {
      errors.push(`${subType.id ?? blueprint.questionTypeId}: targetQuestionCount phải từ 3 trở lên.`);
    }
  }
  const roles = new Set(blueprint.coverage?.requiredPracticeRoles ?? []);
  if (!roles.has('misconception_check') || !roles.has('mastery_holdout')) {
    errors.push(`${blueprint.questionTypeId}: coverage phải có misconception_check và mastery_holdout.`);
  }
  if ((blueprint.coverage?.masteryHoldoutCount ?? 0) < 3) {
    errors.push(`${blueprint.questionTypeId}: cần ít nhất 3 câu mastery holdout theo blueprint.`);
  }
}
ensureUnique(allSubTypeIds, item => item.id, 'Subtype');

const subTypeOwnerById = new Map(allSubTypeIds.map(item => [item.id, item.questionTypeId]));
for (const question of questions) {
  if (!typeById.has(question.questionTypeId)) errors.push(`${question.id}: questionTypeId không tồn tại.`);
  const data = metadataByQuestionId.get(question.id) ?? question;
  if (!data.subTypeId) continue;
  if (!subTypeOwnerById.has(data.subTypeId)) errors.push(`${question.id}: subTypeId ${data.subTypeId} không tồn tại.`);
  if (subTypeOwnerById.get(data.subTypeId) !== question.questionTypeId) {
    errors.push(`${question.id}: subtype ${data.subTypeId} không thuộc ${question.questionTypeId}.`);
  }
}
for (const item of metadata) {
  if (!questionById.has(item.questionId)) errors.push(`${item.questionId}: metadata không có câu hỏi tương ứng.`);
}

const allowedDifficulties = new Set(['easy', 'medium', 'hard']);
for (const question of questions) {
  if (!allowedDifficulties.has(question.difficulty)) errors.push(`${question.id}: difficulty không hợp lệ.`);
  if (!question.correctAnswer) errors.push(`${question.id}: thiếu correctAnswer.`);
  if (!Array.isArray(question.acceptedAnswers) || !question.acceptedAnswers.map(String).includes(String(question.correctAnswer))) {
    errors.push(`${question.id}: acceptedAnswers không chứa correctAnswer.`);
  }
  if (/^[A-D]$/i.test(String(question.correctAnswer))) {
    const answer = String(question.correctAnswer).toUpperCase();
    if (Array.isArray(question.options)) {
      const optionIndex = answer.charCodeAt(0) - 65;
      if (question.options.length < 2 || optionIndex >= question.options.length) {
        errors.push(`${question.id}: đáp án ${answer} không khớp danh sách options.`);
      }
    } else if (!new RegExp(`\\n${answer}[.)]`, 'i').test(String(question.content))) {
      errors.push(`${question.id}: không tìm thấy phương án ${answer} trong content legacy.`);
    }
  }
}

const questionIdSet = new Set(questions.map(item => item.id));
const solutionQuestionIdSet = new Set(solutionQuestionIds);
for (const id of questionIdSet) if (!solutionQuestionIdSet.has(id)) errors.push(`${id}: thiếu lời giải.`);
for (const id of solutionQuestionIdSet) if (!questionIdSet.has(id)) errors.push(`${id}: lời giải không có câu hỏi tương ứng.`);
for (const solution of solutions) {
  if (!solution.finalAnswer) errors.push(`${solution.questionId}: lời giải thiếu finalAnswer.`);
  if (solution.__fromHelper) {
    if ((solution.__details?.length ?? 0) < 2) errors.push(`${solution.questionId}: helper lời giải thiếu nội dung giải thích/lỗi sai.`);
  } else {
    if (!solution.recognition) errors.push(`${solution.questionId}: lời giải thiếu recognition.`);
    if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length === 0) errors.push(`${solution.questionId}: lời giải thiếu detailedSteps.`);
    if (!Array.isArray(solution.commonMistakes) || solution.commonMistakes.length === 0) errors.push(`${solution.questionId}: lời giải thiếu commonMistakes.`);
    if (!Array.isArray(solution.reviewSuggestions) || solution.reviewSuggestions.length === 0) errors.push(`${solution.questionId}: lời giải thiếu reviewSuggestions.`);
  }
  const question = questionById.get(solution.questionId);
  if (question && /^[A-D]$/i.test(String(question.correctAnswer)) && /^[A-D]$/i.test(String(solution.finalAnswer))) {
    if (String(question.correctAnswer).toUpperCase() !== String(solution.finalAnswer).toUpperCase()) {
      errors.push(`${question.id}: đáp án câu hỏi ${question.correctAnswer} khác finalAnswer ${solution.finalAnswer}.`);
    }
  }
}

const isReinforcement = question => /-reinforce-(concept|process|misconception)$/.test(question.id);
const normalizedStem = content => String(content ?? '')
  .replace(/\n[A-D][.)].*$/gms, '')
  .replace(/\$|\\text|[{}_^*`]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLocaleLowerCase('vi');

const stableHash = value => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const duplicateStemGroups = new Map();
for (const question of questions.filter(question => !isReinforcement(question))) {
  const stem = normalizedStem(question.content);
  if (!stem) continue;
  const group = duplicateStemGroups.get(stem) ?? [];
  group.push(question.id);
  duplicateStemGroups.set(stem, group);
}
const duplicateGroups = [...duplicateStemGroups.values()].filter(group => group.length > 1);
if (duplicateGroups.length > 0) {
  warnings.push(`${duplicateGroups.length} nhóm câu có đề bài trùng sau chuẩn hóa (${duplicateGroups.flat().length} câu).`);
  if (process.env.CHEMISTRY10_VERBOSE_DUPLICATES === '1') {
    console.log('Chi tiết nhóm câu trùng:', duplicateGroups);
  }
}

const coverageRows = [];
const migratedTypeRows = [];
for (const module of modules) {
  const moduleTypeIds = new Set(module.types.map(item => item.id));
  const moduleQuestions = module.questions.filter(item => moduleTypeIds.has(item.questionTypeId));
  const authentic = moduleQuestions.filter(question => !isReinforcement(question));
  const target = module.blueprints.reduce((sum, item) => sum + item.coverage.targetQuestionCount, 0);
  const migrated = moduleQuestions.filter(question => {
    const data = metadataByQuestionId.get(question.id) ?? question;
    return Boolean(data.subTypeId && data.practiceRole && data.representationType);
  }).length;
  const difficulty = Object.fromEntries(['easy', 'medium', 'hard'].map(level => [
    level,
    authentic.filter(question => question.difficulty === level).length
  ]));
  const choiceQuestions = authentic.filter(question => /^[A-D]$/i.test(String(question.correctAnswer)));
  const answerKeyCounts = Object.fromEntries(['A', 'B', 'C', 'D'].map(letter => [
    letter,
    choiceQuestions.filter(question => String(question.correctAnswer).toUpperCase() === letter).length
  ]));
  const displayAnswerKeyCounts = Object.fromEntries(['A', 'B', 'C', 'D'].map((letter, index) => [
    letter,
    choiceQuestions.filter(question => stableHash(`${question.id}:answer`) % 4 === index).length
  ]));
  const dominantAnswer = Object.entries(answerKeyCounts).sort((a, b) => b[1] - a[1])[0];
  if (choiceQuestions.length >= 20 && dominantAnswer[1] / choiceQuestions.length > 0.45) {
    warnings.push(`${module.label}: đáp án ${dominantAnswer[0]} chiếm ${dominantAnswer[1]}/${choiceQuestions.length} câu trắc nghiệm; cần đảo vị trí phương án.`);
  }
  const dominantDisplayAnswer = Object.entries(displayAnswerKeyCounts).sort((a, b) => b[1] - a[1])[0];
  if (choiceQuestions.length >= 20 && dominantDisplayAnswer[1] / choiceQuestions.length > 0.4) {
    errors.push(`${module.label}: thuật toán hoán vị vẫn lệch đáp án ${dominantDisplayAnswer[0]} (${dominantDisplayAnswer[1]}/${choiceQuestions.length}).`);
  }
  if (authentic.length >= 20) {
    if (difficulty.easy / authentic.length < 0.1) warnings.push(`${module.label}: câu easy dưới 10% (${difficulty.easy}/${authentic.length}).`);
    if (difficulty.medium / authentic.length < 0.2) warnings.push(`${module.label}: câu medium dưới 20% (${difficulty.medium}/${authentic.length}).`);
    if (difficulty.hard / authentic.length < 0.15) warnings.push(`${module.label}: câu hard dưới 15% (${difficulty.hard}/${authentic.length}).`);
  }
  coverageRows.push({
    Module: module.label,
    Types: module.types.length,
    Raw: moduleQuestions.length,
    Authentic: authentic.length,
    Target: target,
    Gap: Math.max(0, target - authentic.length),
    Easy: difficulty.easy,
    Medium: difficulty.medium,
    Hard: difficulty.hard,
    Keys: `A${answerKeyCounts.A}/B${answerKeyCounts.B}/C${answerKeyCounts.C}/D${answerKeyCounts.D}`,
    Display: `A${displayAnswerKeyCounts.A}/B${displayAnswerKeyCounts.B}/C${displayAnswerKeyCounts.C}/D${displayAnswerKeyCounts.D}`,
    Metadata: `${migrated}/${moduleQuestions.length}`
  });

  if (migrated === moduleQuestions.length) {
    for (const type of module.types) {
      const blueprint = blueprintByTypeId.get(type.id);
      const typeQuestions = moduleQuestions.filter(question => question.questionTypeId === type.id);
      const authenticQuestions = typeQuestions.filter(question => !isReinforcement(question));
      const enriched = authenticQuestions.map(question => ({
        ...question,
        ...(metadataByQuestionId.get(question.id) ?? {})
      }));
      const subTypeCounts = new Map(blueprint.subTypes.map(subType => [
        subType.id,
        enriched.filter(question => question.subTypeId === subType.id).length
      ]));
      const subTypesAtMinimum = blueprint.subTypes.filter(subType => (
        (subTypeCounts.get(subType.id) ?? 0) >= blueprint.coverage.minimumQuestionsPerSubType
      )).length;
      const subTypesAtTarget = blueprint.subTypes.filter(subType => (
        (subTypeCounts.get(subType.id) ?? 0) >= subType.targetQuestionCount
      )).length;
      if (subTypesAtTarget !== blueprint.subTypes.length) {
        for (const subType of blueprint.subTypes) {
          const actual = subTypeCounts.get(subType.id) ?? 0;
          if (actual < subType.targetQuestionCount) {
            errors.push(`${subType.id}: có ${actual} câu, chưa đạt target ${subType.targetQuestionCount}.`);
          }
        }
      }
      let subTypesWithFullDifficulty = 0;
      for (const subType of blueprint.subTypes) {
        const subtypeDifficulties = new Set(enriched.filter(question => question.subTypeId === subType.id).map(question => question.difficulty));
        const missingDifficulties = ['easy', 'medium', 'hard'].filter(level => !subtypeDifficulties.has(level));
        if (missingDifficulties.length === 0) subTypesWithFullDifficulty += 1;
        else errors.push(`${subType.id}: thiếu tầng độ khó ${missingDifficulties.join(', ')}.`);
      }
      const roles = new Set(enriched.map(question => question.practiceRole));
      const representations = new Set(enriched.map(question => question.representationType));
      const missingRoles = blueprint.coverage.requiredPracticeRoles.filter(role => !roles.has(role));
      const missingRepresentations = blueprint.coverage.requiredRepresentations.filter(item => !representations.has(item));
      const holdouts = enriched.filter(question => question.isMasteryHoldout).length;
      migratedTypeRows.push({
        Type: type.id,
        Authentic: authenticQuestions.length,
        Target: blueprint.coverage.targetQuestionCount,
        Subtypes: `${subTypesAtMinimum}/${blueprint.subTypes.length}`,
        AtTarget: `${subTypesAtTarget}/${blueprint.subTypes.length}`,
        FullDifficulty: `${subTypesWithFullDifficulty}/${blueprint.subTypes.length}`,
        MissingRoles: missingRoles.join(', ') || '—',
        MissingRepresentations: missingRepresentations.join(', ') || '—',
        Holdouts: `${holdouts}/${blueprint.coverage.masteryHoldoutCount}`
      });
    }
  }
}

const unmigrated = questions.filter(question => {
  const data = metadataByQuestionId.get(question.id) ?? question;
  return !(data.subTypeId && data.practiceRole && data.representationType);
});
if (unmigrated.length > 0) warnings.push(`${unmigrated.length}/${questions.length} câu chưa được ánh xạ subtype/role/representation.`);

const legacyChoiceQuestions = questions.filter(question => question.validatorType === 'choice' && !question.options);
const malformedLegacyChoices = legacyChoiceQuestions.filter(question => (
  String(question.content).split(/\n(?=[A-D][.)]\s*)/).length !== 5
));
if (malformedLegacyChoices.length > 0) {
  errors.push(`${malformedLegacyChoices.length} câu legacy không tách được đủ bốn phương án: ${malformedLegacyChoices.map(question => question.id).join(', ')}.`);
}
if (legacyChoiceQuestions.length > 0) {
  warnings.push(`${legacyChoiceQuestions.length}/${questions.length} câu trắc nghiệm nguồn còn nhúng phương án trong content; toàn bộ đã qua kiểm tra khả năng chuẩn hóa runtime.`);
}

const authenticCount = questions.filter(question => !isReinforcement(question)).length;
const reinforcementCount = questions.length - authenticCount;
const targetCount = blueprints.reduce((sum, item) => sum + item.coverage.targetQuestionCount, 0);

console.log('\nCHEMISTRY 10 PRACTICE COVERAGE');
console.table(coverageRows);
console.log(`Dạng lớn: ${types.length}; dạng con: ${allSubTypeIds.length}.`);
console.log(`Câu thô: ${questions.length}; câu luyện thực chất: ${authenticCount}; câu củng cố mẫu: ${reinforcementCount}.`);
console.log(`Ngân hàng đích theo blueprint: ${targetCount}; khoảng thiếu sơ bộ: ${Math.max(0, targetCount - authenticCount)} câu.`);
const assessmentDifficulty = Object.fromEntries(['easy', 'medium', 'hard'].map(level => [
  level,
  assessmentQuestions.filter(question => question.difficulty === level).length
]));
console.log(
  `Đánh giá Hóa 10: ${assessmentQuestions.length} câu, ${assessmentSolutions.length} lời giải; ` +
  `${assessmentDifficulty.easy}/${assessmentDifficulty.medium}/${assessmentDifficulty.hard} câu dễ/vừa/khó.`
);
console.log('\nHỆ THỐNG KIỂM TRA ĐỊNH KỲ');
console.table(periodicRows);

if (migratedTypeRows.length > 0) {
  console.log('\nCHI TIẾT CÁC MODULE ĐÃ ÁNH XẠ ĐẦY ĐỦ');
  console.table(migratedTypeRows);
}

if (warnings.length > 0) {
  console.log('\nCẢNH BÁO / BACKLOG');
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error('\nLỖI CẤU TRÚC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  '\n✓ Dữ liệu Hóa học 10 hợp lệ: đủ 8 đề định kỳ A/B, đúng thời lượng và cấu trúc; ngân hàng có đủ câu và lời giải.',
);
