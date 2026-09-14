import path from 'node:path';
import { validateCourseDataV4 } from '../lib/courseDataV4Validator.mjs';

console.log('🔍 Kiểm tra Course Data Schema V4 cho Vật lí 11...');

const result = await validateCourseDataV4({
  courseDirectory: path.join(process.cwd(), 'src', 'data', 'grade11', 'physics'),
  courseId: 'grade11:physics',
  expectedLessonCount: 26,
  expectedCurriculumModuleCount: 4,
  expectedOfficialRequirementCount: 30,
  expectedOutcomeCount: 31,
  expectedQuestionTypeCount: 31,
  expectedPracticeTargetCount: 564,
  expectedAssessmentExamCount: 16,
  expectedAssessmentBlueprintCount: 8,
  expectedAssessmentQuestionCount: 140,
  expectedAssessmentSolutionCount: 140,
  expectedAssessmentQuestionTypeCount: 31,
  expectedTheoryLessonCount: 26,
  expectedTheoryQuestionTypeCount: 31
});

console.log('📊 Thống kê:', result.stats);

for (const warning of result.warnings) {
  console.warn(`⚠️  ${warning}`);
}

if (result.errors.length > 0) {
  for (const error of result.errors) {
    console.error(`❌ ${error}`);
  }
  console.error(`Validation thất bại với ${result.errors.length} lỗi.`);
  process.exit(1);
}

console.log(`✅ Schema hợp lệ; còn ${result.warnings.length} cảnh báo về độ phủ nội dung.`);
