import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createServer as createViteServer } from 'vite';
import { validateCourseDataV4 } from '../lib/courseDataV4Validator.mjs';

console.log('🔍 Kiểm tra Course Data Schema V4 cho Tiếng Anh 11...');

const result = await validateCourseDataV4({
  courseDirectory: path.join(process.cwd(), 'src', 'data', 'grade11', 'english'),
  courseId: 'grade11:english',
  expectedLessonCount: 84,
  expectedCurriculumModuleCount: 10,
  expectedOfficialRequirementCount: 10,
  expectedOutcomeCount: 60,
  expectedQuestionTypeCount: 60,
  expectedPracticeTargetCount: 720,
  expectedTheoryLessonCount: 50,
  expectedTheoryQuestionTypeCount: 60,
  expectedAssessmentExamCount: 8,
  expectedAssessmentBlueprintCount: 4,
  expectedAssessmentQuestionCount: 0,
  expectedAssessmentSolutionCount: 0,
  expectedAssessmentQuestionTypeCount: 0,
  allowPartialCoverage: false
});

const errors = [...result.errors];
const warnings = [...result.warnings];

const questionFiles = [
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module1_healthy_life', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module2_generation_gap', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module3_future_cities', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module4_asean_vietnam', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module5_global_warming', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module6_heritage', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module7_education_options', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module8_independence', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module9_social_issues', 'questions.ts'),
  path.join(process.cwd(), 'src', 'data', 'grade11', 'english', 'modules', 'module10_ecosystem', 'questions.ts')
];

const loadLeafQuestions = async filePath => {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove
    },
    fileName: filePath
  });
  const encoded = Buffer.from(transpiled.outputText).toString('base64');
  const loaded = await import(`data:text/javascript;base64,${encoded}#${encodeURIComponent(filePath)}`);
  return Object.entries(loaded).find(
    ([name, value]) => name.endsWith('Questions') && Array.isArray(value)
  )?.[1] ?? [];
};

const questions = (
  await Promise.all(questionFiles.map(loadLeafQuestions))
).flat();

let runtimeSolutions = [];
const viteServer = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent'
});
try {
  const runtimeModule = await viteServer.ssrLoadModule(
    '/src/data/grade11/english/solutions.ts'
  );
  runtimeSolutions = runtimeModule.g11EnglishSolutions ?? [];
} catch (error) {
  errors.push(`Không tải được lời giải runtime: ${error instanceof Error ? error.message : String(error)}.`);
} finally {
  await viteServer.close();
}

if (runtimeSolutions.length !== 720) {
  errors.push(`Runtime phải có 720 lời giải chi tiết, hiện có ${runtimeSolutions.length}.`);
}
const shallowRuntimeSolutions = runtimeSolutions.filter(
  solution => solution.detailedSteps?.length < 3
);
if (shallowRuntimeSolutions.length > 0) {
  errors.push(`${shallowRuntimeSolutions.length} lời giải runtime có ít hơn 3 bước.`);
}
const untranslatedRuntimeSolutions = runtimeSolutions.filter(
  solution => !solution.translation?.trim()
);
if (untranslatedRuntimeSolutions.length > 0) {
  errors.push(`${untranslatedRuntimeSolutions.length} lời giải runtime thiếu dịch nghĩa/yêu cầu.`);
}
const repeatedRecognitionSolutions = runtimeSolutions.filter(
  solution =>
    solution.recognition?.trim() === solution.detailedSteps?.[0]?.explanation?.trim()
);
if (repeatedRecognitionSolutions.length > 0) {
  errors.push(`${repeatedRecognitionSolutions.length} lời giải lặp nguyên văn recognition ở bước 1.`);
}
const incompleteOptionAnalyses = runtimeSolutions.filter(solution => {
  const finalStep = solution.detailedSteps?.at(-1);
  return (
    !finalStep?.result?.startsWith(`${solution.finalAnswer}.`) ||
    !['A.', 'B.', 'C.', 'D.'].every(letter => finalStep.explanation.includes(letter))
  );
});
if (incompleteOptionAnalyses.length > 0) {
  errors.push(`${incompleteOptionAnalyses.length} lời giải chưa phân tích đủ A/B/C/D hoặc thiếu đáp án đầy đủ.`);
}
const uniqueEvidenceCount = new Set(
  runtimeSolutions.map(solution => solution.detailedSteps?.[1]?.explanation?.trim())
).size;
const uniqueFinalAnalysisCount = new Set(
  runtimeSolutions.map(solution => solution.detailedSteps?.at(-1)?.explanation?.trim())
).size;
if (uniqueEvidenceCount !== runtimeSolutions.length) {
  errors.push(`Bước bằng chứng/quy tắc chỉ có ${uniqueEvidenceCount}/${runtimeSolutions.length} nội dung riêng.`);
}
if (uniqueFinalAnalysisCount !== runtimeSolutions.length) {
  errors.push(`Phân tích A/B/C/D chỉ có ${uniqueFinalAnalysisCount}/${runtimeSolutions.length} nội dung riêng.`);
}
const runtimeSolutionByQuestionId = new Map(
  runtimeSolutions.map(solution => [solution.questionId, solution])
);
const readingWithoutEvidence = questions.filter(question => {
  if (!question.questionTypeId.includes('reading')) return false;
  return !runtimeSolutionByQuestionId
    .get(question.id)
    ?.detailedSteps?.[1]?.explanation?.includes('Đoạn ');
});
if (readingWithoutEvidence.length > 0) {
  errors.push(`${readingWithoutEvidence.length} lời giải Reading thiếu dẫn chứng theo đoạn: ${readingWithoutEvidence.map(question => question.id).join(', ')}.`);
}
const languageWithoutFormula = questions.filter(question => {
  if (!/(grammar|pron)/i.test(question.questionTypeId)) return false;
  return !runtimeSolutionByQuestionId.get(question.id)?.detailedSteps?.[1]?.formula;
});
if (languageWithoutFormula.length > 0) {
  errors.push(`${languageWithoutFormula.length} lời giải Grammar/Pronunciation thiếu quy tắc.`);
}

const assessmentFile = path.join(
  process.cwd(), 'src', 'data', 'grade11', 'english', 'assessments.ts'
);
const assessmentSource = fs.readFileSync(assessmentFile, 'utf8');
const assessmentTranspiled = ts.transpileModule(assessmentSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2023,
    importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove
  },
  fileName: assessmentFile
});
const assessmentEncoded = Buffer.from(assessmentTranspiled.outputText).toString('base64');
const assessmentModule = await import(
  `data:text/javascript;base64,${assessmentEncoded}#${encodeURIComponent(assessmentFile)}`
);
const assessmentExams = Object.entries(assessmentModule).find(
  ([name, value]) => name.endsWith('Exams') && Array.isArray(value)
)?.[1] ?? [];

if (questions.length !== 720) {
  errors.push(`Ngân hàng Unit 1–10 phải có 720 câu, hiện có ${questions.length}.`);
}
if (questions.some(question => /speaking|listening/i.test(question.questionTypeId))) {
  errors.push('Ngân hàng core không được chứa questionType Speaking/Listening.');
}
if (questions.some(question => question.stimulus?.audioText)) {
  errors.push('Ngân hàng core không được chứa audioText; Listening phải nằm trong chuyên đề mở rộng.');
}

const questionById = new Map(questions.map(question => [question.id, question]));
for (const exam of assessmentExams) {
  const examQuestions = exam.questionIds.map(questionId => questionById.get(questionId)).filter(Boolean);
  if (exam.duration !== 60 || examQuestions.length !== 40) {
    errors.push(`${exam.id}: đề phải có 40 câu trong 60 phút.`);
    continue;
  }
  const answerCounts = examQuestions.reduce((counts, question) => {
    counts[question.correctAnswer] = (counts[question.correctAnswer] ?? 0) + 1;
    return counts;
  }, {});
  for (const answer of ['A', 'B', 'C', 'D']) {
    if (answerCounts[answer] !== 10) {
      errors.push(`${exam.id}: đáp án ${answer} phải xuất hiện 10 lần, hiện có ${answerCounts[answer] ?? 0}.`);
    }
  }
  const readingCount = examQuestions.filter(question =>
    question.questionTypeId.includes('reading')
  ).length;
  const writingCount = examQuestions.filter(question =>
    question.questionTypeId.includes('writing')
  ).length;
  if (readingCount !== 8 || writingCount !== 8) {
    errors.push(`${exam.id}: phải có 8 câu Reading và 8 câu Writing gián tiếp.`);
  }
  const difficultyCounts = examQuestions.reduce((counts, question) => {
    counts[question.difficulty] = (counts[question.difficulty] ?? 0) + 1;
    return counts;
  }, {});
  const expectedDifficulty = { easy: 14, medium: 16, hard: 10 };
  for (const [difficulty, expectedCount] of Object.entries(expectedDifficulty)) {
    if (difficultyCounts[difficulty] !== expectedCount) {
      errors.push(
        `${exam.id}: mức ${difficulty} phải có ${expectedCount} câu, hiện có ${difficultyCounts[difficulty] ?? 0}.`
      );
    }
  }
  if (examQuestions.some(question =>
    /speaking|listening/i.test(question.questionTypeId) || question.stimulus?.audioText
  )) {
    errors.push(`${exam.id}: không được chứa Listening hoặc Speaking.`);
  }
}

const examsByParallelGroup = assessmentExams.reduce((groups, exam) => {
  const forms = groups.get(exam.parallelFormGroup) ?? [];
  forms.push(exam);
  groups.set(exam.parallelFormGroup, forms);
  return groups;
}, new Map());
for (const [groupId, forms] of examsByParallelGroup) {
  if (forms.length !== 2) {
    errors.push(`${groupId}: phải có đúng hai mã đề A/B.`);
    continue;
  }
  const firstIds = new Set(forms[0].questionIds);
  const sharedIds = forms[1].questionIds.filter(questionId => firstIds.has(questionId));
  if (sharedIds.length > 0) {
    errors.push(`${groupId}: hai mã đề trùng ${sharedIds.length} câu.`);
  }
}

const uniquePassages = new Map();
for (const question of questions) {
  if (question.stimulus?.content) {
    uniquePassages.set(question.stimulus.id, question.stimulus.content);
  }
}
if (uniquePassages.size !== 30) {
  errors.push(`Unit 1–10 phải có 30 bài đọc nguyên bản, hiện có ${uniquePassages.size}.`);
}
for (const [stimulusId, content] of uniquePassages) {
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount < 250 || wordCount > 280) {
    errors.push(`${stimulusId}: bài đọc phải dài 250–280 từ, hiện có ${wordCount} từ.`);
  }
}

console.log('📊 Thống kê:', result.stats);

for (const warning of warnings) {
  console.warn(`⚠️  ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`❌ ${error}`);
  }
  console.error(`Validation thất bại với ${errors.length} lỗi.`);
  process.exit(1);
}

console.log(`✅ Tiếng Anh 11 hợp lệ với đủ 10 Unit; còn ${warnings.length} cảnh báo.`);
