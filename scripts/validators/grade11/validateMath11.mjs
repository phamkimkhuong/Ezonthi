import path from 'node:path';
import { validateCourseDataV4 } from '../lib/courseDataV4Validator.mjs';

console.log('🔍 Kiểm tra Course Data Schema V4 cho Toán 11...');

const result = await validateCourseDataV4({
  courseDirectory: path.join(process.cwd(), 'src', 'data', 'grade11', 'math'),
  courseId: 'grade11:math',
  expectedLessonCount: 33,
  expectedCurriculumModuleCount: 9,
  expectedOfficialRequirementCount: 33,
  expectedOutcomeCount: 33,
  expectedQuestionTypeCount: 33,
  expectedPracticeTargetCount: 792,
  expectedTheoryLessonCount: 33,
  expectedTheoryQuestionTypeCount: 33,
  expectedAssessmentExamCount: 13,
  expectedAssessmentBlueprintCount: 13,
  expectedAssessmentQuestionCount: 129,
  expectedAssessmentSolutionCount: 129,
  expectedAssessmentQuestionTypeCount: 33,
  allowPartialCoverage: true
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

console.log(`✅ Schema hợp lệ; còn ${result.warnings.length} cảnh báo thuộc backlog triển khai.`);
