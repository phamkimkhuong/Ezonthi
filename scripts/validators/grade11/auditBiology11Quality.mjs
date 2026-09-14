import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.join(process.cwd(), 'src', 'data', 'grade11', 'biology');
const errors = [];

const loadLeaf = async filePath => {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove
    },
    fileName: filePath,
    reportDiagnostics: true
  });
  if ((transpiled.diagnostics ?? []).length > 0) {
    throw new Error(ts.formatDiagnosticsWithColorAndContext(transpiled.diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: name => name,
      getNewLine: () => '\n'
    }));
  }
  if (/^\s*import\s/m.test(transpiled.outputText)) {
    throw new Error(`${filePath}: audit chỉ đọc leaf data không có runtime import.`);
  }
  const encoded = Buffer.from(transpiled.outputText).toString('base64');
  return import(`data:text/javascript;base64,${encoded}#${encodeURIComponent(filePath)}`);
};

const arrayExport = (module, suffix) => {
  const found = Object.entries(module).find(
    ([name, value]) => name.endsWith(suffix) && Array.isArray(value)
  );
  if (!found) throw new Error(`Không tìm thấy array export *${suffix}.`);
  return found[1];
};

const moduleDirectories = fs.readdirSync(path.join(root, 'modules'))
  .map(name => path.join(root, 'modules', name))
  .filter(directory => fs.statSync(directory).isDirectory())
  .sort();

const practiceQuestions = [];
const practiceSolutions = [];
const theoryBlocks = [];

for (const directory of moduleDirectories) {
  const [questionModule, solutionModule, theoryModule] = await Promise.all([
    loadLeaf(path.join(directory, 'questions.ts')),
    loadLeaf(path.join(directory, 'solutions.ts')),
    loadLeaf(path.join(directory, 'theory.ts'))
  ]);
  practiceQuestions.push(...arrayExport(questionModule, 'Questions'));
  practiceSolutions.push(...arrayExport(solutionModule, 'Solutions'));
  theoryBlocks.push(...arrayExport(theoryModule, 'Theory'));
}

const assessmentModule = await loadLeaf(path.join(root, 'assessments.ts'));
const assessmentQuestions = arrayExport(assessmentModule, 'AssessmentQuestions');
const assessmentSolutions = arrayExport(assessmentModule, 'AssessmentSolutions');
const assessmentExams = arrayExport(assessmentModule, 'AssessmentExams');

const by = (items, keyOf) => items.reduce((map, item) => {
  const key = keyOf(item);
  map.set(key, [...(map.get(key) ?? []), item]);
  return map;
}, new Map());
const countBy = (items, keyOf) => items.reduce((counts, item) => {
  const key = keyOf(item);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});
const nearlyEqual = (left, right) => Math.abs(left - right) < 1e-9;

const questionsByType = by(practiceQuestions, question => question.questionTypeId);
for (const [questionTypeId, questions] of questionsByType) {
  if (questions.length !== 18) errors.push(`${questionTypeId}: phải có 18 câu.`);
  const difficulty = countBy(questions, question => question.difficulty);
  for (const level of ['easy', 'medium', 'hard']) {
    if (difficulty[level] !== 6) {
      errors.push(`${questionTypeId}: ${level} phải có 6 câu, hiện ${difficulty[level] ?? 0}.`);
    }
  }
  const answers = countBy(questions, question => question.correctAnswer);
  const answerCounts = ['A', 'B', 'C', 'D'].map(letter => answers[letter] ?? 0);
  if (Math.max(...answerCounts) - Math.min(...answerCounts) > 1) {
    errors.push(`${questionTypeId}: đáp án practice lệch ${JSON.stringify(answers)}.`);
  }
  const hardQuestions = questions.filter(question => question.difficulty === 'hard');
  if (hardQuestions.some(question => !/phân tích|giải thích|cơ chế|chuỗi/i.test(question.content))) {
    errors.push(`${questionTypeId}: câu hard còn hỏi nhận biết trực tiếp.`);
  }
  const supportsNonTextRepresentation = questions.some(
    question => question.representationType !== 'text'
  );
  if (
    supportsNonTextRepresentation &&
    hardQuestions.filter(question => question.representationType !== 'text').length < 3
  ) {
    errors.push(`${questionTypeId}: cần ít nhất 3 câu hard dùng biểu diễn/dữ liệu.`);
  }
}

const solutionByQuestionId = new Map(practiceSolutions.map(solution => [solution.questionId, solution]));
for (const question of practiceQuestions) {
  const solution = solutionByQuestionId.get(question.id);
  if (!solution) continue;
  if ((solution.detailedSteps?.length ?? 0) < 3) {
    errors.push(`${question.id}: lời giải practice cần 3 bước.`);
  }
  if ((solution.detailedSteps?.[1]?.explanation?.length ?? 0) < 35) {
    errors.push(`${question.id}: phần giải thích cơ chế quá ngắn.`);
  }
  const text = JSON.stringify(solution);
  if (/Phương án làm sai quan hệ logic|Đối chiếu:\s*[A-D]/i.test(text)) {
    errors.push(`${question.id}: lời giải còn dùng mẫu thô cứng bị cấm.`);
  }
}

for (const block of theoryBlocks) {
  for (const heading of ['**Khái niệm nền tảng**', '**Cơ chế cần hiểu**', '**Vận dụng**', '**Dễ nhầm**']) {
    if (!block.content.includes(heading)) errors.push(`${block.id}: thiếu mục ${heading}.`);
  }
  if ((block.keyPoints?.length ?? 0) < 4) errors.push(`${block.id}: thiếu 4 điểm ghi nhớ.`);
  if ((block.workedExamples?.length ?? 0) < 2) errors.push(`${block.id}: thiếu 2 ví dụ.`);
  if ((block.checkpoints?.length ?? 0) < 4) errors.push(`${block.id}: thiếu 4 câu tự kiểm tra.`);
}

const assessmentQuestionById = new Map(
  assessmentQuestions.map(question => [question.id, question])
);
for (const exam of assessmentExams) {
  const questions = exam.questionIds.map(id => assessmentQuestionById.get(id)).filter(Boolean);
  const responses = countBy(questions, question => question.responseType);
  const difficulty = countBy(questions, question => question.difficulty);
  const points = questions.reduce((total, question) => total + (question.points ?? 0), 0);
  if (questions.length !== 24) errors.push(`${exam.id}: phải có 24 câu.`);
  if (responses.single_choice !== 20 || responses.true_false_cluster !== 2 || responses.short_answer !== 2) {
    errors.push(`${exam.id}: cấu trúc 20 MCQ + 2 Đ/S + 2 trả lời ngắn chưa đúng.`);
  }
  if (difficulty.easy !== 6 || difficulty.medium !== 12 || difficulty.hard !== 6) {
    errors.push(`${exam.id}: phân bố độ khó phải là 6/12/6.`);
  }
  if (!nearlyEqual(points, 10)) errors.push(`${exam.id}: tổng điểm phải bằng 10.`);
  for (const question of questions.filter(item => item.responseType === 'single_choice')) {
    if (question.difficulty === 'medium' && !question.content.includes('Một học sinh nhận xét')) {
      errors.push(`${question.id}: câu medium chưa đặt trong nhiệm vụ sửa hiểu lầm.`);
    }
    if (question.difficulty === 'hard' && !question.content.includes('thẩm định kết luận')) {
      errors.push(`${question.id}: câu hard chưa yêu cầu thẩm định.`);
    }
  }
}

const assessmentAnswers = countBy(
  assessmentQuestions.filter(question => question.responseType === 'single_choice'),
  question => question.correctAnswer
);
const assessmentAnswerCounts = ['A', 'B', 'C', 'D'].map(letter => assessmentAnswers[letter] ?? 0);
if (Math.max(...assessmentAnswerCounts) - Math.min(...assessmentAnswerCounts) > 1) {
  errors.push(`Đáp án assessment mất cân bằng: ${JSON.stringify(assessmentAnswers)}.`);
}

const assessmentSolutionByQuestionId = new Map(
  assessmentSolutions.map(solution => [solution.questionId, solution])
);
for (const question of assessmentQuestions) {
  const solution = assessmentSolutionByQuestionId.get(question.id);
  if (!solution) {
    errors.push(`${question.id}: thiếu lời giải assessment.`);
    continue;
  }
  if (question.responseType === 'single_choice') {
    const elimination = solution.detailedSteps?.find(step => step.title === 'Đối chiếu từng nhiễu');
    if (!elimination || (elimination.explanation.match(/“/g)?.length ?? 0) < 3) {
      errors.push(`${question.id}: lời giải chưa đối chiếu đủ ba phương án nhiễu.`);
    }
  }
}

const allQuestionContents = [...practiceQuestions, ...assessmentQuestions]
  .map(question => question.content.replace(/\s+/g, ' ').trim());
if (new Set(allQuestionContents).size !== allQuestionContents.length) {
  errors.push('Ngân hàng còn nội dung câu hỏi trùng hoàn toàn.');
}

console.log('📊 Audit chất lượng Sinh học 11:', {
  practiceQuestions: practiceQuestions.length,
  practiceQuestionTypes: questionsByType.size,
  practiceSolutions: practiceSolutions.length,
  theoryBlocks: theoryBlocks.length,
  assessmentExams: assessmentExams.length,
  assessmentQuestions: assessmentQuestions.length,
  assessmentSolutions: assessmentSolutions.length,
  assessmentChoiceAnswers: assessmentAnswers
});

if (errors.length > 0) {
  for (const error of errors) console.error(`❌ ${error}`);
  console.error(`Audit thất bại với ${errors.length} lỗi.`);
  process.exit(1);
}

console.log('✅ Audit chất lượng Sinh học 11 đạt: độ khó, lời giải, biểu diễn và đề A/B đều qua ngưỡng.');
