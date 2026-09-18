/**
 * VALIDATE ROADMAP SUBJECT BUNDLE
 *
 * Kiểm tra tính hợp lệ của file JSON Lộ trình học (Roadmap Subject Bundle)
 * theo chuẩn hợp đồng src/types/roadmapContract.ts.
 */

import fs from 'fs';
import path from 'path';

export function validateRoadmapBundle(data, filePath = 'memory') {
  const errors = [];
  const warnings = [];

  const prefix = `[${path.basename(filePath)}]`;

  // 1. Root fields
  if (data.schemaVersion !== '1.0.0') {
    errors.push(`${prefix} schemaVersion phải là '1.0.0', nhận được: ${data.schemaVersion}`);
  }
  if (!data.contentVersion || typeof data.contentVersion !== 'string') {
    errors.push(`${prefix} contentVersion là bắt buộc và phải là chuỗi (string)`);
  }
  if (!data.grade || typeof data.grade !== 'string') {
    errors.push(`${prefix} grade là bắt buộc (ví dụ: 'grade9')`);
  }
  if (!data.subject || typeof data.subject !== 'string') {
    errors.push(`${prefix} subject là bắt buộc (ví dụ: 'math')`);
  }
  if (!data.subjectName || typeof data.subjectName !== 'string') {
    errors.push(`${prefix} subjectName là bắt buộc`);
  }
  if (!data.icon || typeof data.icon !== 'string') {
    errors.push(`${prefix} icon là bắt buộc`);
  }
  if (!data.themeColor || !/^#[0-9a-fA-F]{6}$/.test(data.themeColor)) {
    warnings.push(`${prefix} themeColor nên là mã hex 6 ký tự (ví dụ: '#6366f1'), nhận được: ${data.themeColor}`);
  }
  if (!Array.isArray(data.topics)) {
    errors.push(`${prefix} topics phải là một mảng (Array)`);
  }
  if (!Array.isArray(data.questionTypes)) {
    errors.push(`${prefix} questionTypes phải là một mảng (Array)`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  const topicIdSet = new Set();
  const questionTypeIdSet = new Set();

  // 2. Validate Topics
  data.topics.forEach((topic, idx) => {
    const tLoc = `${prefix} Topic[${idx}] (id: ${topic.id || 'N/A'})`;
    if (!topic.id) errors.push(`${tLoc}: Thiếu id`);
    else if (topicIdSet.has(topic.id)) errors.push(`${tLoc}: Trùng lặp topic id "${topic.id}"`);
    else topicIdSet.add(topic.id);

    if (!topic.name) errors.push(`${tLoc}: Thiếu name`);
    if (!topic.slug) errors.push(`${tLoc}: Thiếu slug`);
    if (typeof topic.orderIndex !== 'number') errors.push(`${tLoc}: orderIndex phải là number`);
    if (![1, 2, 3].includes(topic.tier)) errors.push(`${tLoc}: tier phải là 1, 2 hoặc 3 (nhận được: ${topic.tier})`);
    if (!Array.isArray(topic.questionTypeIds)) errors.push(`${tLoc}: questionTypeIds phải là Array`);
  });

  // 3. Validate Question Types
  data.questionTypes.forEach((qt, idx) => {
    const qLoc = `${prefix} QuestionType[${idx}] (id: ${qt.id || 'N/A'})`;
    if (!qt.id) errors.push(`${qLoc}: Thiếu id`);
    else if (questionTypeIdSet.has(qt.id)) errors.push(`${qLoc}: Trùng lặp questionType id "${qt.id}"`);
    else questionTypeIdSet.add(qt.id);

    if (!qt.topicId) errors.push(`${qLoc}: Thiếu topicId`);
    else if (!topicIdSet.has(qt.topicId)) {
      errors.push(`${qLoc}: topicId "${qt.topicId}" không tồn tại trong danh sách topics`);
    }

    if (!qt.name) errors.push(`${qLoc}: Thiếu name`);
    if (!qt.slug) errors.push(`${qLoc}: Thiếu slug`);
    if (!['easy', 'medium', 'hard'].includes(qt.difficulty)) {
      errors.push(`${qLoc}: difficulty phải là 'easy' | 'medium' | 'hard'`);
    }
    if (!['low', 'medium', 'high'].includes(qt.examFrequency)) {
      errors.push(`${qLoc}: examFrequency phải là 'low' | 'medium' | 'high'`);
    }

    // Theory & method arrays
    if (!Array.isArray(qt.recognitionSigns)) errors.push(`${qLoc}: recognitionSigns phải là Array`);
    if (!Array.isArray(qt.solvingSteps)) errors.push(`${qLoc}: solvingSteps phải là Array`);
    if (!Array.isArray(qt.commonMistakes)) errors.push(`${qLoc}: commonMistakes phải là Array`);

    // Theory checkpoints
    if (qt.theoryCheckpoints) {
      if (!Array.isArray(qt.theoryCheckpoints)) {
        errors.push(`${qLoc}: theoryCheckpoints phải là Array`);
      } else {
        qt.theoryCheckpoints.forEach((cp, cpIdx) => {
          const cpLoc = `${qLoc} Checkpoint[${cpIdx}]`;
          if (!cp.id) errors.push(`${cpLoc}: Thiếu id`);
          if (!cp.question) errors.push(`${cpLoc}: Thiếu question`);
          if (!Array.isArray(cp.options) || cp.options.length !== 4) {
            errors.push(`${cpLoc}: options phải có đúng 4 phần tử [A, B, C, D]`);
          }
          if (!['A', 'B', 'C', 'D'].includes(cp.correctAnswer)) {
            errors.push(`${cpLoc}: correctAnswer phải là 'A', 'B', 'C' hoặc 'D'`);
          }
          if (!cp.explanation) errors.push(`${cpLoc}: Thiếu explanation`);
        });
      }
    }
  });

  // 4. Topic questionTypeIds bidirectional check
  data.topics.forEach((topic) => {
    (topic.questionTypeIds || []).forEach(qtId => {
      if (!questionTypeIdSet.has(qtId)) {
        errors.push(`${prefix} Topic "${topic.id}" chứa questionTypeId "${qtId}" nhưng không có trong questionTypes`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: {
      topicsCount: data.topics.length,
      questionTypesCount: data.questionTypes.length,
    },
  };
}

// CLI Execution if run directly
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const targetFile = process.argv[2] || path.resolve('scratch/grade9-math.sample.json');
  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Không tìm thấy file: ${targetFile}`);
    process.exit(1);
  }
  const content = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  const result = validateRoadmapBundle(content, targetFile);

  if (result.isValid) {
    console.log(`✅ File hợp lệ theo schema RoadmapSubjectBundle!`);
    console.log(`📊 Thống kê: ${result.summary.topicsCount} Topics, ${result.summary.questionTypesCount} Question Types.`);
    if (result.warnings.length > 0) {
      console.log(`⚠️ Cảnh báo (${result.warnings.length}):`);
      result.warnings.forEach(w => console.log(`   - ${w}`));
    }
    process.exit(0);
  } else {
    console.error(`❌ Phát hiện ${result.errors.length} lỗi trong file:`);
    result.errors.forEach(err => console.error(`   - ${err}`));
    process.exit(1);
  }
}
