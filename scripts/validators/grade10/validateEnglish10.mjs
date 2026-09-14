import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const dataDirectory = path.join(root, 'src', 'data', 'grade10', 'english');

const readNodeValue = node => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements
      .filter(element => !ts.isSpreadElement(element))
      .map(readNodeValue);
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

const readExportedArray = (fileName, exportName) => {
  const filePath = path.join(dataDirectory, fileName);
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
      if (ts.isArrayLiteralExpression(declaration.initializer)) {
        result = readNodeValue(declaration.initializer);
      }
    }
  });
  if (!result) throw new Error(`Không đọc được ${exportName} trong ${fileName}.`);
  return result;
};

const readComputedModuleExports = fileName => {
  const filePath = path.join(dataDirectory, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true
    },
    fileName: filePath
  }).outputText;
  const module = { exports: {} };
  const evaluator = new Function('exports', 'module', 'require', compiled);
  evaluator(module.exports, module, specifier => {
    throw new Error(`${fileName}: import runtime không được hỗ trợ (${specifier}).`);
  });
  return module.exports;
};

const modulesDir = path.join(dataDirectory, 'modules');
const moduleDirs = fs.readdirSync(modulesDir).filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());

const topics = [];
const questionTypes = [];
const questions = [];
const solutions = [];

for (const dir of moduleDirs) {
  const dirPath = path.join(modulesDir, dir);
  const topicsFilePath = path.join(dirPath, 'topics.ts');
  if (!fs.existsSync(topicsFilePath)) continue;
  
  const topicsFile = fs.readFileSync(topicsFilePath, 'utf8');
  const exportTopicsMatch = topicsFile.match(/export const (g10EnglishModule\d+\w*Topics)/);
  if (!exportTopicsMatch) continue;
  
  const topicsExport = exportTopicsMatch[1];
  const prefix = topicsExport.replace('Topics', '');
  
  const moduleTopics = readExportedArray(path.join('modules', dir, 'topics.ts'), `${prefix}Topics`);
  const moduleQuestionTypes = readExportedArray(path.join('modules', dir, 'questionTypes.ts'), `${prefix}QuestionTypes`);
  const moduleQuestions = readExportedArray(path.join('modules', dir, 'questions.ts'), `${prefix}Questions`);
  const moduleSolutions = readExportedArray(path.join('modules', dir, 'solutions.ts'), `${prefix}Solutions`);

  topics.push(...moduleTopics);
  questionTypes.push(...moduleQuestionTypes);
  questions.push(...moduleQuestions);
  solutions.push(...moduleSolutions);
}

const listeningExtension = readComputedModuleExports('listeningExtension.ts');
topics.push(...listeningExtension.g10EnglishListeningExtensionTopics);

for (const question of questions) {
  const unit = question.topicId.replace('eng10-t', '');
  question.responseType ??= 'single_choice';
  question.outcomeIds ??= [`eng10-lo-u${unit}-language`];
  question.competency ??= 'english_language_knowledge';
  question.cognitiveLevel ??= question.difficulty === 'easy'
    ? 'recognition'
    : question.difficulty === 'medium'
      ? 'understanding'
      : 'application';
  question.representationType ??= 'text';
}

const skillExpansion = readComputedModuleExports('skillsExpansion.ts');
questionTypes.push(...skillExpansion.g10EnglishSkillQuestionTypes);
questions.push(...skillExpansion.g10EnglishSkillQuestions);
solutions.push(...skillExpansion.g10EnglishSkillSolutions);

const skillsDeepening = readComputedModuleExports('skillsDeepening.ts');
questionTypes.push(...skillsDeepening.g10EnglishDeepeningQuestionTypes);
questions.push(...skillsDeepening.g10EnglishDeepeningQuestions);
solutions.push(...skillsDeepening.g10EnglishDeepeningSolutions);
const deepeningStats = skillsDeepening.g10EnglishDeepeningStats;

const learningPath = readComputedModuleExports('learningPath.ts');
const learningOutcomes = learningPath.g10EnglishOutcomes;
const learningMisconceptions = learningPath.g10EnglishMisconceptions;
const assessmentBlueprints = readComputedModuleExports(path.join('assessments', 'blueprints.ts'))
  .g10EnglishAssessmentBlueprints;

const assessmentExams = readExportedArray(
  path.join('assessments', 'exams.ts'),
  'g10EnglishAssessmentExams'
);

const errors = [];
const warnings = [];
const topicById = new Map(topics.map(topic => [topic.id, topic]));
const typeById = new Map(questionTypes.map(type => [type.id, type]));
const questionById = new Map(questions.map(question => [question.id, question]));
const solutionByQuestionId = new Map(solutions.map(solution => [solution.questionId, solution]));

const findDuplicates = (items, getKey) => {
  const counts = new Map();
  for (const item of items) counts.set(getKey(item), (counts.get(getKey(item)) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
};

const stableHash = value => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

for (const id of findDuplicates(topics, topic => topic.id)) errors.push(`Topic ID trùng: ${id}`);
for (const id of findDuplicates(questionTypes, type => type.id)) errors.push(`Question type ID trùng: ${id}`);
for (const id of findDuplicates(questions, question => question.id)) errors.push(`Question ID trùng: ${id}`);
for (const id of findDuplicates(solutions, solution => solution.questionId)) errors.push(`Một câu có nhiều lời giải: ${id}`);
for (const id of findDuplicates(assessmentExams, exam => exam.id)) errors.push(`Assessment ID trùng: ${id}`);
if (assessmentExams.length !== 8) errors.push(`Cần 8 đề A/B, hiện có ${assessmentExams.length}.`);

for (const type of questionTypes) {
  if (!topicById.has(type.topicId)) errors.push(`${type.id}: topicId không tồn tại (${type.topicId}).`);
  const example = questionById.get(type.exampleQuestionId);
  if (!example) {
    errors.push(`${type.id}: exampleQuestionId không tồn tại (${type.exampleQuestionId}).`);
  } else if (example.questionTypeId !== type.id) {
    errors.push(`${type.id}: câu mẫu ${example.id} thuộc ${example.questionTypeId}.`);
  }
}

for (const question of questions) {
  const type = typeById.get(question.questionTypeId);
  const solution = solutionByQuestionId.get(question.id);
  if (!topicById.has(question.topicId)) errors.push(`${question.id}: topicId không tồn tại.`);
  if (!type) errors.push(`${question.id}: questionTypeId không tồn tại (${question.questionTypeId}).`);
  if (type && type.topicId !== question.topicId) {
    errors.push(`${question.id}: topic ${question.topicId} lệch với ${type.id} (${type.topicId}).`);
  }
  if (question.subjectId !== 'english') errors.push(`${question.id}: subjectId phải là english.`);
  if (question.validatorType === 'choice') {
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push(`${question.id}: câu choice phải có đúng 4 phương án.`);
    } else {
      const optionLetters = question.options.map(option => option.match(/^([A-D])\.\s/)?.[1]);
      if (optionLetters.join('') !== 'ABCD') errors.push(`${question.id}: phương án phải theo thứ tự A–D.`);
      if (new Set(question.options).size !== question.options.length) errors.push(`${question.id}: có phương án trùng.`);
    }
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
      errors.push(`${question.id}: correctAnswer không hợp lệ (${question.correctAnswer}).`);
    }
  } else if (question.validatorType === 'manual') {
    if (question.responseType !== 'constructed_response') {
      errors.push(`${question.id}: câu manual phải dùng constructed_response.`);
    }
    if (question.answerSchema?.autoCheckMode !== 'manual') {
      errors.push(`${question.id}: câu manual thiếu answerSchema chấm rubric.`);
    }
  } else {
    warnings.push(`${question.id}: validatorType ${question.validatorType} chưa được audit chuyên biệt.`);
  }
  if (!solution) {
    errors.push(`${question.id}: thiếu lời giải.`);
  } else {
    if (question.validatorType !== 'manual' && solution.finalAnswer !== question.correctAnswer) {
      errors.push(`${question.id}: đáp án câu hỏi ${question.correctAnswer} lệch lời giải ${solution.finalAnswer}.`);
    }
    if (!solution.recognition) errors.push(`${question.id}: lời giải thiếu recognition.`);
    if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length === 0) {
      errors.push(`${question.id}: lời giải thiếu detailedSteps.`);
    }
    if (question.validatorType === 'manual' && (!Array.isArray(solution.rubric) || solution.rubric.length < 3)) {
      errors.push(`${question.id}: câu tự luận/nói thiếu rubric tối thiểu 3 tiêu chí.`);
    }
  }

  if (['eng10-qt14', 'eng10-qt15'].includes(question.questionTypeId)) {
    if (/underlined part/i.test(question.content)) {
      errors.push(`${question.id}: đề nhắc phần gạch chân nhưng dữ liệu không biểu diễn phần gạch chân.`);
    }
    if (!/initial consonant cluster/i.test(question.content)) {
      errors.push(`${question.id}: đề phát âm phải nêu rõ đang xét cụm phụ âm đầu.`);
    }
  }
}

for (const solution of solutions) {
  if (!questionById.has(solution.questionId)) errors.push(`${solution.id}: lời giải không có câu hỏi tương ứng.`);
}

for (const exam of assessmentExams) {
  if (exam.subjectId !== 'english') errors.push(`${exam.id}: subjectId phải là english.`);
  if (!['midterm', 'final'].includes(exam.kind)) {
    errors.push(`${exam.id}: giai đoạn hiện tại chỉ cho phép đề giữa kỳ hoặc cuối kỳ.`);
  }
  if (!Array.isArray(exam.questionIds) || exam.questionIds.length < 24) {
    errors.push(`${exam.id}: cần tối thiểu 24 câu hỏi.`);
    continue;
  }
  const duplicateQuestionIds = findDuplicates(exam.questionIds, id => id);
  for (const questionId of duplicateQuestionIds) errors.push(`${exam.id}: lặp câu ${questionId}.`);

  const examQuestions = exam.questionIds.map(questionId => questionById.get(questionId));
  for (let index = 0; index < examQuestions.length; index += 1) {
    const question = examQuestions[index];
    const questionId = exam.questionIds[index];
    if (!question) {
      errors.push(`${exam.id}: questionId không tồn tại (${questionId}).`);
      continue;
    }
    if (!exam.scopeTopicIds.includes(question.topicId)) {
      errors.push(`${exam.id}: ${questionId} thuộc ${question.topicId}, ngoài phạm vi đề.`);
    }
  }

  for (const topicId of exam.scopeTopicIds) {
    if (!topicById.has(topicId)) errors.push(`${exam.id}: scopeTopicId không tồn tại (${topicId}).`);
    if (!examQuestions.some(question => question?.topicId === topicId)) {
      errors.push(`${exam.id}: không có câu nào thuộc ${topicId}.`);
    }
  }

  const validExamQuestions = examQuestions.filter(Boolean);
  const requiredCompetencies = ['english_reading', 'english_writing'];
  for (const competency of requiredCompetencies) {
    if (!validExamQuestions.some(question => question.competency === competency)) {
      errors.push(`${exam.id}: thiếu thành phần ${competency}.`);
    }
  }
  const forbiddenCompetencies = ['english_listening', 'english_speaking', 'english_interaction'];
  for (const competency of forbiddenCompetencies) {
    if (validExamQuestions.some(question => question.competency === competency)) {
      errors.push(`${exam.id}: đề giữa kỳ/cuối kỳ không được chứa ${competency}.`);
    }
  }
  if (!['A', 'B'].includes(exam.formCode)) errors.push(`${exam.id}: formCode phải là A hoặc B.`);
  if (!exam.parallelFormGroup) errors.push(`${exam.id}: thiếu parallelFormGroup.`);
  if (!assessmentBlueprints.some(blueprint => blueprint.id === exam.blueprintId)) {
    errors.push(`${exam.id}: blueprintId không tồn tại (${exam.blueprintId}).`);
  }
  const blueprint = assessmentBlueprints.find(item => item.id === exam.blueprintId);
  if (blueprint) {
    const competencyBySectionId = {
      language: ['english_language_knowledge'],
      reading: ['english_reading'],
      listening: ['english_listening'],
      writing: ['english_writing'],
      speaking: ['english_speaking', 'english_interaction']
    };
    for (const section of blueprint.sections) {
      const competencies = competencyBySectionId[section.id];
      if (!competencies) continue;
      const actualCount = validExamQuestions.filter(question => competencies.includes(question.competency)).length;
      if (actualCount !== section.itemCount) {
        errors.push(`${exam.id}: phần ${section.id} có ${actualCount}/${section.itemCount} câu theo blueprint.`);
      }
    }
  }
  const hardRatio = validExamQuestions.filter(question => question.difficulty === 'hard').length / validExamQuestions.length;
  if (hardRatio < 0.1 || hardRatio > 0.25) {
    warnings.push(`${exam.id}: tỷ lệ hard ${(hardRatio * 100).toFixed(1)}% nằm ngoài khoảng khuyến nghị 10–25%.`);
  }
}

const questionTypeCounts = new Map(questionTypes.map(type => [
  type.id,
  questions.filter(question => question.questionTypeId === type.id).length
]));
for (const [typeId, count] of questionTypeCounts) {
  const type = typeById.get(typeId);
  const targetCount = type?.practiceCoverage?.targetQuestionCount ?? 12;
  if (count < targetCount) errors.push(`${typeId} mới có ${count}/${targetCount} câu theo target.`);
  if (!type?.practiceCoverage && count > 15) {
    warnings.push(`${typeId} có ${count} câu; nên kiểm tra lại phạm vi micro-type (mục tiêu 12–15).`);
  }

  const questionsOfType = questions.filter(question => question.questionTypeId === typeId);
  const mediumCount = questionsOfType.filter(question => question.difficulty === 'medium').length;
  const hardCountForType = questionsOfType.filter(question => question.difficulty === 'hard').length;
  const isSkillType = typeId.startsWith('eng10-skill-qt-') || typeId.startsWith('eng10-deep-qt-');
  if (mediumCount < (isSkillType ? 1 : 3)) warnings.push(`${typeId} chỉ có ${mediumCount} câu medium; độ chuyển tiếp còn mỏng.`);
  if (hardCountForType < (isSkillType ? 1 : 3)) errors.push(`${typeId} thiếu câu hard phân hóa.`);

  const subtypeIds = (type?.subTypes ?? []).map(subtype => subtype.id).filter(Boolean);
  const taggedQuestions = questionsOfType.filter(question => question.subTypeId);
  if (isSkillType) {
    for (const subtypeId of subtypeIds) {
      if (!taggedQuestions.some(question => question.subTypeId === subtypeId)) {
        errors.push(`${typeId}: dạng con ${subtypeId} chưa có câu hỏi.`);
      }
    }
    if (taggedQuestions.length !== questionsOfType.length) {
      errors.push(`${typeId}: ${questionsOfType.length - taggedQuestions.length} câu thiếu subTypeId.`);
    }
  }
}

const examsByParallelGroup = new Map();
for (const exam of assessmentExams) {
  if (!exam.parallelFormGroup) continue;
  const group = examsByParallelGroup.get(exam.parallelFormGroup) ?? [];
  group.push(exam);
  examsByParallelGroup.set(exam.parallelFormGroup, group);
}
if (examsByParallelGroup.size !== 4) {
  errors.push(`Cần 4 nhóm đề song song A/B, hiện có ${examsByParallelGroup.size}.`);
}
for (const [groupId, forms] of examsByParallelGroup) {
  const formCodes = forms.map(form => form.formCode).sort().join('');
  if (forms.length !== 2 || formCodes !== 'AB') {
    errors.push(`${groupId}: cần đúng hai mã A/B.`);
    continue;
  }
  const [formA, formB] = forms.sort((left, right) => left.formCode.localeCompare(right.formCode));
  if (formA.duration !== formB.duration) errors.push(`${groupId}: thời lượng A/B không bằng nhau.`);
  if (formA.questionIds.length !== formB.questionIds.length) errors.push(`${groupId}: số câu A/B không bằng nhau.`);
  if ([...formA.scopeTopicIds].sort().join('|') !== [...formB.scopeTopicIds].sort().join('|')) {
    errors.push(`${groupId}: phạm vi Unit của A/B không tương đương.`);
  }
  const overlap = formA.questionIds.filter(questionId => formB.questionIds.includes(questionId));
  if (overlap.length > 0) {
    errors.push(`${groupId}: mã A/B còn trùng ${overlap.length} câu (${overlap.slice(0, 3).join(', ')}).`);
  }
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const countFor = form => form.questionIds
      .map(questionId => questionById.get(questionId))
      .filter(question => question?.difficulty === difficulty).length;
    const difference = Math.abs(countFor(formA) - countFor(formB));
    if (difference > 6) {
      errors.push(`${groupId}: chênh ${difference} câu ${difficulty} giữa mã A/B.`);
    } else if (difference > 4) {
      warnings.push(`${groupId}: chênh ${difference} câu ${difficulty} giữa mã A/B; nên hiệu chỉnh ở vòng biên tập sau.`);
    }
  }
}

if (learningOutcomes.length !== 40) errors.push(`Learning path cần 40 outcomes gồm Listening tự chọn và không gồm Speaking, hiện có ${learningOutcomes.length}.`);
if (learningMisconceptions.length !== 20) errors.push(`Learning path cần 20 misconceptions, hiện có ${learningMisconceptions.length}.`);
if (deepeningStats.unitCount !== 10) errors.push(`Skills deepening cần phủ 10 Unit, hiện có ${deepeningStats.unitCount}.`);
if (deepeningStats.questionCountPerUnit !== 20) {
  errors.push(`Skills deepening cần 20 hoạt động/Unit sau khi loại Speaking, hiện có ${deepeningStats.questionCountPerUnit}.`);
}
const speakingQuestions = questions.filter(question => (
  question.competency === 'english_speaking'
  || question.competency === 'english_interaction'
  || question.questionTypeId.includes('-speaking')
));
if (speakingQuestions.length > 0) {
  errors.push(`Không được xuất bài Speaking/Interaction lên English 10, còn ${speakingQuestions.length} câu.`);
}
if (questionTypes.some(type => type.id.includes('-speaking'))) {
  errors.push('Không được xuất question type Speaking lên English 10.');
}
if (learningOutcomes.some(outcome => outcome.id.includes('-speaking'))) {
  errors.push('Không được xuất learning outcome Speaking lên English 10.');
}
const listeningExtensionTopicId = 'eng10-listening-extension';
const listeningQuestions = questions.filter(question => question.competency === 'english_listening');
const nonListeningQuestionsInExtension = questions.filter(question => (
  question.topicId === listeningExtensionTopicId
  && question.competency !== 'english_listening'
));
if (!topicById.has(listeningExtensionTopicId)) {
  errors.push('Thiếu chuyên đề Listening mở rộng.');
}
if (listeningQuestions.some(question => question.topicId !== listeningExtensionTopicId)) {
  errors.push('Mọi câu Listening phải được tách khỏi Unit và đưa vào chuyên đề mở rộng.');
}
if (nonListeningQuestionsInExtension.length > 0) {
  errors.push(`Chuyên đề Listening chứa ${nonListeningQuestionsInExtension.length} câu không phải bài nghe.`);
}
const listeningTypes = questionTypes.filter(type => type.id.includes('-listening'));
if (listeningTypes.some(type => type.topicId !== listeningExtensionTopicId)) {
  errors.push('Mọi question type Listening phải thuộc chuyên đề mở rộng.');
}
const outcomeById = new Map(learningOutcomes.map(outcome => [outcome.id, outcome]));
const misconceptionById = new Map(learningMisconceptions.map(item => [item.id, item]));
for (const outcome of learningOutcomes) {
  if (!topicById.has(outcome.topicId)) errors.push(`${outcome.id}: topicId không tồn tại.`);
  for (const typeId of outcome.questionTypeIds) {
    if (!typeById.has(typeId)) errors.push(`${outcome.id}: questionTypeId không tồn tại (${typeId}).`);
  }
  for (const prerequisiteId of outcome.prerequisiteOutcomeIds) {
    if (!outcomeById.has(prerequisiteId)) errors.push(`${outcome.id}: prerequisite không tồn tại (${prerequisiteId}).`);
  }
  for (const misconceptionId of outcome.misconceptionIds) {
    if (!misconceptionById.has(misconceptionId)) errors.push(`${outcome.id}: misconception không tồn tại (${misconceptionId}).`);
  }
}
const listeningOutcomes = learningOutcomes.filter(outcome => outcome.id.includes('-listening'));
if (listeningOutcomes.length !== 10) {
  errors.push(`Chuyên đề Listening cần 10 outcomes theo Unit, hiện có ${listeningOutcomes.length}.`);
}
if (listeningOutcomes.some(outcome => (
  outcome.topicId !== listeningExtensionTopicId || outcome.isCritical !== false
))) {
  errors.push('Listening phải là outcome tự chọn, không critical và thuộc chuyên đề mở rộng.');
}

if (assessmentBlueprints.length !== 4) errors.push(`Cần 4 assessment blueprints, hiện có ${assessmentBlueprints.length}.`);
for (const blueprint of assessmentBlueprints) {
  const competencyTotal = Object.values(blueprint.competencyWeights).reduce((sum, value) => sum + value, 0);
  if (Math.abs(competencyTotal - 1) > 1e-6) errors.push(`${blueprint.id}: competencyWeights không bằng 1.`);
  const pointTotal = blueprint.sections.reduce((sum, section) => sum + section.points, 0);
  if (Math.abs(pointTotal - blueprint.totalPoints) > 1e-6) errors.push(`${blueprint.id}: tổng điểm sections không bằng totalPoints.`);
  for (const outcomeId of blueprint.outcomeIds) {
    if (!outcomeById.has(outcomeId)) errors.push(`${blueprint.id}: outcomeId không tồn tại (${outcomeId}).`);
  }
  if (blueprint.sections.some(section => ['listening', 'speaking'].includes(section.id))) {
    errors.push(`${blueprint.id}: đề giữa kỳ/cuối kỳ không được có section Listening/Speaking.`);
  }
  if (
    blueprint.competencyWeights.english_listening
    || blueprint.competencyWeights.english_speaking
    || blueprint.competencyWeights.english_interaction
  ) {
    errors.push(`${blueprint.id}: competencyWeights không được chứa Listening/Speaking.`);
  }
  if (blueprint.outcomeIds.some(outcomeId => outcomeId.includes('-listening') || outcomeId.includes('-speaking'))) {
    errors.push(`${blueprint.id}: outcomeIds không được chứa Listening/Speaking.`);
  }
  if (blueprint.scopeTopicIds.includes(listeningExtensionTopicId)) {
    errors.push(`${blueprint.id}: chuyên đề Listening tự chọn không thuộc phạm vi thi định kỳ.`);
  }
}

const uniqueReadingStimuli = new Map();
const uniqueListeningStimuli = new Map();
for (const question of questions) {
  if (question.competency === 'english_reading' && question.stimulus?.content) {
    uniqueReadingStimuli.set(question.stimulus.id, question.stimulus.content);
  }
  if (question.competency === 'english_listening' && question.stimulus?.audioText) {
    uniqueListeningStimuli.set(question.stimulus.id, question.stimulus.audioText);
  }
}
for (const [id, passage] of uniqueReadingStimuli) {
  const wordCount = passage.trim().split(/\s+/).length;
  if (wordCount < 140) warnings.push(`${id}: bài đọc mới có ${wordCount} từ; nên mở rộng dần về chuẩn lớp 10.`);
}
for (const [id, script] of uniqueListeningStimuli) {
  const wordCount = script.trim().split(/\s+/).length;
  if (wordCount < 90) warnings.push(`${id}: bài nghe mới có ${wordCount} từ; nên mở rộng dần về chuẩn lớp 10.`);
}

const hardCount = questions.filter(question => question.difficulty === 'hard').length;
if (hardCount < Math.ceil(questions.length * 0.1)) {
  warnings.push(`Chỉ có ${hardCount}/${questions.length} câu hard; độ phân hóa còn thấp.`);
}
if (topics.length !== 11) warnings.push(`Cần 10 Unit và 1 chuyên đề Listening mở rộng, hiện có ${topics.length} topics.`);

const choiceQuestions = questions.filter(question => question.validatorType === 'choice');
const sourceAnswerDistribution = Object.fromEntries(
  ['A', 'B', 'C', 'D'].map(letter => [letter, choiceQuestions.filter(question => question.correctAnswer === letter).length])
);
const displayAnswerDistribution = Object.fromEntries(
  ['A', 'B', 'C', 'D'].map((letter, index) => [
    letter,
    choiceQuestions.filter(question => stableHash(`${question.id}:answer`) % 4 === index).length
  ])
);

const fullCorpus = [
  ...questionTypes.flatMap(type => [type.description, ...(type.theory ?? [])]),
  ...questions.flatMap(question => [
    question.content,
    question.stimulus?.content,
    question.stimulus?.audioText,
    ...(question.options ?? [])
  ]),
  ...solutions.flatMap(solution => [
    solution.recognition,
    ...(solution.detailedSteps ?? []).flatMap(step => [step.title, step.explanation, step.result]),
    ...(solution.commonMistakes ?? []),
    ...(solution.reviewSuggestions ?? [])
  ])
].filter(Boolean).join('\n');

for (const forbiddenText of ['brainwinner', 'kreal', 'green living lifestyle', 'for searching information']) {
  if (fullCorpus.toLowerCase().includes(forbiddenText)) {
    errors.push(`Còn cụm nội dung cần biên tập: "${forbiddenText}".`);
  }
}

if (warnings.length > 0) {
  console.warn(`English 10 validation warnings (${warnings.length}):`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}
if (errors.length > 0) {
  console.error(`English 10 validation failed (${errors.length} lỗi):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `English 10 validation passed: ${topics.length} topics, ${questionTypes.length} types, `
  + `${questions.length} questions, ${solutions.length} solutions, ${assessmentExams.length} assessments, `
  + `${assessmentBlueprints.length} blueprints.`
);
const difficultyCounts = ['easy', 'medium', 'hard']
  .map(level => `${level}=${questions.filter(question => question.difficulty === level).length}`)
  .join(', ');
const countsByType = [...questionTypeCounts.values()];
console.log(
  `Distribution: ${difficultyCounts}; `
  + `questions/type=${Math.min(...countsByType)}–${Math.max(...countsByType)}.`
);
const competencyCounts = [
  'english_language_knowledge',
  'english_reading',
  'english_listening',
  'english_writing'
].map(competency => `${competency.replace('english_', '')}=${questions.filter(question => question.competency === competency).length}`);
console.log(`Competencies: ${competencyCounts.join(', ')}.`);
console.log(
  `Learning path: ${learningOutcomes.length} outcomes, ${learningMisconceptions.length} misconceptions; `
  + `${uniqueReadingStimuli.size} reading passages, ${uniqueListeningStimuli.size} listening scripts.`
);
console.log(
  `Answer positions source A/B/C/D=${Object.values(sourceAnswerDistribution).join('/')}; `
  + `display=${Object.values(displayAnswerDistribution).join('/')}.`
);
