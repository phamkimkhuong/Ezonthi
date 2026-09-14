import path from 'node:path';
import { validateCourseDataV4 } from '../lib/courseDataV4Validator.mjs';

console.log('🔍 Kiểm tra Course Data Schema V4 cho Sinh học 11...');

const result = await validateCourseDataV4({
  courseDirectory: path.join(process.cwd(), 'src', 'data', 'grade11', 'biology'),
  courseId: 'grade11:biology',
  expectedLessonCount: 29,
  expectedCurriculumModuleCount: 5,
  expectedOfficialRequirementCount: 40,
  expectedOutcomeCount: 52,
  expectedQuestionTypeCount: 52,
  expectedPracticeTargetCount: 936,
  expectedAssessmentExamCount: 8,
  expectedAssessmentBlueprintCount: 4,
  expectedAssessmentQuestionCount: 192,
  expectedAssessmentSolutionCount: 192,
  expectedAssessmentQuestionTypeCount: 52,
  expectedTheoryLessonCount: 29,
  expectedTheoryQuestionTypeCount: 52
});

console.log('📊 Thống kê:', result.stats);
for (const warning of result.warnings) console.warn(`⚠️  ${warning}`);

if (result.errors.length > 0) {
  for (const error of result.errors) console.error(`❌ ${error}`);
  console.error(`Validation thất bại với ${result.errors.length} lỗi.`);
  process.exit(1);
}

console.log(`✅ Sinh học 11 đủ 5 chương hợp lệ; còn ${result.warnings.length} cảnh báo.`);
