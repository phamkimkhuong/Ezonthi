import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createServer } from 'vite';

// Phân tích tham số dòng lệnh CLI
const args = process.argv.slice(2);
const getArg = (prefix, defaultValue) => {
  const match = args.find(a => a.startsWith(`--${prefix}=`));
  if (match) return match.split('=')[1];
  if (args.includes(`--${prefix}`)) return true;
  return defaultValue;
};

const gradeArg = getArg('grade', 'all');
const subjectArg = getArg('subject', 'all');
const typeIdFilter = getArg('type', null);
const thresholdArg = Number(getArg('threshold', '3'));
const topArg = Number(getArg('top', '20'));
const isJsonOutput = args.includes('--json');
const isSummaryOnly = args.includes('--summary-only');
const saveReportPath = getArg('save-report', null);

const COURSE_CATALOG = {
  grade9: ['math', 'english'],
  grade10: ['math', 'english', 'physics', 'chemistry', 'biology', 'history'],
  grade11: ['math', 'english', 'physics', 'chemistry', 'biology'],
};

/**
 * Chuẩn hóa nội dung câu hỏi thành "Bộ khung cấu trúc" (Structural Skeleton).
 * Thay thế các giá trị số, khoảng đoạn, biểu thức LaTeX, biến số bằng token trừu tượng
 * để phát hiện các câu hỏi sao chép mẫu câu (isomorphic / cloned questions).
 */
export function extractStructuralSkeleton(rawContent) {
  if (!rawContent || typeof rawContent !== 'string') return '';

  let text = rawContent.trim();

  // 1. Chuẩn hóa khoảng trắng & xuống dòng
  text = text.replace(/[\r\n\t]+/g, ' ');
  text = text.replace(/\s+/g, ' ');

  // 2. Chuẩn hóa các ký hiệu toán học phổ biến trong LaTeX
  text = text.replace(/\\setminus|\\backslash|\\smallsetminus/g, '\\setminus');
  text = text.replace(/\\cap/g, '\\cap');
  text = text.replace(/\\cup/g, '\\cup');
  text = text.replace(/\\subset|\\subseteq/g, '\\subset');
  text = text.replace(/\\supset|\\supseteq/g, '\\supset');
  text = text.replace(/\\in/g, '\\in');
  text = text.replace(/\\notin/g, '\\notin');
  text = text.replace(/\\emptyset|\\varnothing/g, '\\varnothing');
  text = text.replace(/\\infty/g, '\\infty');
  text = text.replace(/\\pm|\\mp/g, '\\pm');
  text = text.replace(/\\times|\\cdot/g, '*');
  text = text.replace(/\\leq|\\le/g, '<=');
  text = text.replace(/\\geq|\\ge/g, '>=');
  text = text.replace(/\\neq|\\ne/g, '!=');

  // 3. Chuẩn hóa khoảng, đoạn số học trong LaTeX hoặc text thường:
  // Ví dụ: [-2; 3], (-\infty; 3), [0; 5], (1; 6], [-3; 5), [m; m + 2], [a; b]
  text = text.replace(/(\[|\()(?:\s*-\s*)?(?:\\infty|\d+(?:[.,]\d+)?|[a-zA-Z](?:\s*[+-]\s*\d+)?)\s*;\s*(?:\s*\+\s*)?(?:\\infty|\d+(?:[.,]\d+)?|[a-zA-Z](?:\s*[+-]\s*\d+)?)\s*(\]|\))/g, '<INTERVAL>');
  text = text.replace(/(\[|\()(?:\s*-\s*)?(?:\\infty|\d+(?:[.,]\d+)?|[a-zA-Z](?:\s*[+-]\s*\d+)?)\s*,\s*(?:\s*\+\s*)?(?:\\infty|\d+(?:[.,]\d+)?|[a-zA-Z](?:\s*[+-]\s*\d+)?)\s*(\]|\))/g, '<INTERVAL>');

  // 4. Chuẩn hóa tập hợp phần bù, hợp, giao
  text = text.replace(/C_{\\mathbb\{R\}}\s*(?:\{[^{}]*\}|\([^)]*\)|[A-Z])/g, '<COMPLEMENT_SET>');
  text = text.replace(/C_[A-Z]\s*(?:\{[^{}]*\}|\([^)]*\)|[A-Z])/g, '<COMPLEMENT_SET>');

  // 5. Chuẩn hóa các phép toán tập hợp: A \cap B, A \cup B, A \setminus B, B \setminus A, A \cap B \cap C
  text = text.replace(/[A-Z]\s*\\cap\s*[A-Z](?:\s*\\cap\s*[A-Z])*/g, '<SET_OP_CAP>');
  text = text.replace(/[A-Z]\s*\\cup\s*[A-Z](?:\s*\\cup\s*[A-Z])*/g, '<SET_OP_CUP>');
  text = text.replace(/[A-Z]\s*\\setminus\s*[A-Z]/g, '<SET_OP_DIFF>');

  // 6. Chuẩn hóa gán tập hợp: $A = <INTERVAL>$, $B = <INTERVAL>$, $X = \{...\}$
  text = text.replace(/\$?[A-Z]\s*=\s*(?:<INTERVAL>|\\{[^}]*\\}|\{[^}]*\})\$?/g, '<SET_DEF>');
  text = text.replace(/tập hợp\s+\$?[A-Z]\$? và \$?[A-Z]\$?/gi, 'tập hợp <SET_PAIR>');
  text = text.replace(/tập hợp\s+\$?[A-Z]\$?,\s*\$?[A-Z]\$? và \$?[A-Z]\$?/gi, 'tập hợp <SET_TRIPLE>');

  // 7. Chuẩn hóa tọa độ điểm, vectơ, đường thẳng, mặt phẳng
  text = text.replace(/\\vec\{[a-z]\}\s*=\s*\(\s*-?\d+(?:[.,]\d+)?\s*;\s*-?\d+(?:[.,]\d+)?\s*\)/g, '<VEC_DEF>');
  text = text.replace(/\\vec\{[a-z]\}\s*=\s*\(\s*-?\d+(?:[.,]\d+)?\s*;\s*-?\d+(?:[.,]\d+)?\s*;\s*-?\d+(?:[.,]\d+)?\s*\)/g, '<VEC_DEF>');
  text = text.replace(/[A-Z]\s*\(\s*-?\d+(?:[.,]\d+)?\s*;\s*-?\d+(?:[.,]\d+)?\s*\)/g, '<POINT_DEF>');
  text = text.replace(/[A-Z]\s*\(\s*-?\d+(?:[.,]\d+)?\s*;\s*-?\d+(?:[.,]\d+)?\s*;\s*-?\d+(?:[.,]\d+)?\s*\)/g, '<POINT_DEF>');

  // 8. Chuẩn hóa phương trình / hàm số
  text = text.replace(/f\(x\)\s*=\s*[^.,;?!\n$]+/g, '<FUNC_DEF>');
  text = text.replace(/y\s*=\s*[^.,;?!\n$]+/g, '<FUNC_DEF>');

  // 9. Chuẩn hóa số nguyên, số thực, phân số, phần trăm có đơn vị hoặc đứng riêng lẻ
  text = text.replace(/\b-?\d+(?:[.,]\d+)?(?:\s*(?:m\/s\^2|m\/s|km\/h|cm|dm|mm|km|m|kg|g|mg|mol|lit|lít|ml|mL|V|A|mA|J|kJ|cal|kcal|W|kW|Hz|kHz|s|giây|phút|giờ|độ|°C|%|cm\^3|m\^3|N|Pa|N\/m))\b/gi, '<VAL_UNIT>');
  text = text.replace(/\\frac\{[^{}]+\}\{[^{}]+\}/g, '<FRACTION>');
  text = text.replace(/\\sqrt\{[^{}]+\}/g, '<SQRT>');
  text = text.replace(/\b-?\d+(?:[.,]\d+)?\b/g, '<NUM>');

  // 10. Chuẩn hóa các cụm từ tiếng Việt mở đầu & kết thúc câu hỏi phổ biến
  text = text.replace(/\b(cho hai tập hợp|cho ba tập hợp|cho tập hợp|cho các tập hợp|cho hai tập|cho tập|cho)\b/gi, 'cho tập');
  text = text.replace(/\b(hãy xác định tập hợp|hãy tìm tập hợp|hãy tính|hãy xác định|hãy tìm|tìm tập hợp|xác định tập hợp|tìm tất cả các giá trị của|tìm tất cả các giá trị thực của|tìm giá trị của|tìm giá trị thực của|xác định|tìm|tính)\b/gi, 'xác định');
  text = text.replace(/\b(khi đó|kết quả là|giá trị của|tập hợp nào dưới đây là|mệnh đề nào sau đây đúng|khẳng định nào sau đây đúng|phát biểu nào sau đây đúng|chọn khẳng định đúng|chọn câu đúng|chọn phương án đúng)\b/gi, 'kết luận');

  // 11. Loại bỏ ký tự bao đóng LaTeX $ ... $ và dấu câu thừa
  text = text.replace(/\$+/g, '');
  text = text.replace(/[.,:;?!]+$/g, '');
  text = text.replace(/\s+/g, ' ').trim().toLowerCase();

  return text;
}

/**
 * Chạy kiểm tra đa dạng câu hỏi cho toàn bộ môn học hoặc theo filter.
 */
export async function auditQuestionDiversity() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });

  const report = {
    timestamp: new Date().toISOString(),
    filter: {
      grade: gradeArg,
      subject: subjectArg,
      typeId: typeIdFilter,
      threshold: thresholdArg,
    },
    totalQuestions: 0,
    totalQuestionTypes: 0,
    totalUniqueSkeletons: 0,
    overallDuplicationRate: 0,
    hotspotQuestionTypes: [],
    allSummary: [],
    bySubjectStats: {},
  };

  let globalQuestionCount = 0;
  let globalUniqueSkeletonCount = 0;

  try {
    const { loadSubjectData } = await server.ssrLoadModule('/src/data/index.ts');

    let grades = gradeArg === 'all' ? Object.keys(COURSE_CATALOG) : [`grade${gradeArg.replace('grade', '')}`];

    // Tự động suy luận grade và subject nếu người dùng chỉ truyền --type
    if (typeIdFilter && gradeArg === 'all' && subjectArg === 'all') {
      if (/^math10/i.test(typeIdFilter)) { grades = ['grade10']; }
      else if (/^math11/i.test(typeIdFilter)) { grades = ['grade11']; }
      else if (/^math9|^math-/i.test(typeIdFilter)) { grades = ['grade9']; }
      else if (/^chem10/i.test(typeIdFilter)) { grades = ['grade10']; }
      else if (/^chem11/i.test(typeIdFilter)) { grades = ['grade11']; }
      else if (/^phy10|^physics10/i.test(typeIdFilter)) { grades = ['grade10']; }
      else if (/^phy11|^physics11/i.test(typeIdFilter)) { grades = ['grade11']; }
      else if (/^eng10|^english10/i.test(typeIdFilter)) { grades = ['grade10']; }
      else if (/^eng11|^english11/i.test(typeIdFilter)) { grades = ['grade11']; }
      else if (/^eng9|^eng-/i.test(typeIdFilter)) { grades = ['grade9']; }
      else if (/^bio10|^biology10/i.test(typeIdFilter)) { grades = ['grade10']; }
      else if (/^bio11|^biology11/i.test(typeIdFilter)) { grades = ['grade11']; }
      else if (/^his10|^history10/i.test(typeIdFilter)) { grades = ['grade10']; }
    }

    for (const grade of grades) {
      if (!COURSE_CATALOG[grade]) continue;

      let subjects = subjectArg === 'all' ? COURSE_CATALOG[grade] : [subjectArg.toLowerCase()];
      if (typeIdFilter && subjectArg === 'all') {
        if (/^math/i.test(typeIdFilter)) subjects = ['math'];
        else if (/^chem/i.test(typeIdFilter)) subjects = ['chemistry'];
        else if (/^phy/i.test(typeIdFilter)) subjects = ['physics'];
        else if (/^eng/i.test(typeIdFilter)) subjects = ['english'];
        else if (/^bio/i.test(typeIdFilter)) subjects = ['biology'];
        else if (/^his/i.test(typeIdFilter)) subjects = ['history'];
      }

      for (const subject of subjects) {
        if (!COURSE_CATALOG[grade].includes(subject)) continue;

        let data;
        try {
          data = await loadSubjectData(grade, subject);
        } catch (err) {
          console.warn(`[WARN] Không thể nạp môn ${grade}/${subject}:`, err.message);
          continue;
        }

        if (!data || !Array.isArray(data.questions)) continue;

        const questions = data.questions;
        const questionTypes = data.questionTypes || [];
        const questionTypeMap = new Map(questionTypes.map(qt => [qt.id, qt]));

        const subjectKey = `${grade}:${subject}`;
        let subjectQuestions = 0;
        let subjectUniqueSkeletons = 0;

        // Nhóm câu hỏi theo questionTypeId
        const questionsByType = new Map();
        for (const q of questions) {
          const typeId = q.questionTypeId || 'unassigned';
          if (typeIdFilter && typeId !== typeIdFilter) continue;

          if (!questionsByType.has(typeId)) {
            questionsByType.set(typeId, []);
          }
          questionsByType.get(typeId).push(q);
        }

        // Phân tích từng dạng bài
        for (const [typeId, qList] of questionsByType.entries()) {
          const qtInfo = questionTypeMap.get(typeId);
          const qtName = qtInfo?.name || `[Dạng bài ${typeId}]`;

          // Nhóm các câu hỏi theo skeleton
          const skeletonGroups = new Map();
          for (const q of qList) {
            const skeleton = extractStructuralSkeleton(q.content);
            if (!skeletonGroups.has(skeleton)) {
              skeletonGroups.set(skeleton, []);
            }
            skeletonGroups.get(skeleton).push(q);
          }

          // Tìm các nhóm có số lượng câu trùng skeleton >= threshold
          const repeatedClusters = [];
          for (const [skeleton, groupedQuestions] of skeletonGroups.entries()) {
            if (groupedQuestions.length >= thresholdArg) {
              repeatedClusters.push({
                skeleton,
                count: groupedQuestions.length,
                questionIds: groupedQuestions.map(q => q.id),
                sampleContents: groupedQuestions.slice(0, 3).map(q => q.content),
              });
            }
          }

          // Sắp xếp các cụm trùng theo số lượng giảm dần
          repeatedClusters.sort((a, b) => b.count - a.count);

          const uniqueSkeletons = skeletonGroups.size;
          const maxRepetition = Math.max(0, ...Array.from(skeletonGroups.values()).map(g => g.length));
          const duplicationRate = qList.length > 0 ? ((qList.length - uniqueSkeletons) / qList.length) * 100 : 0;

          // Điểm đa dạng (Diversity Score) từ 0 đến 100
          const diversityScore = Math.max(0, Math.min(100, Math.round(100 - duplicationRate)));

          const typeSummary = {
            grade,
            subject,
            questionTypeId: typeId,
            questionTypeName: qtName,
            totalQuestions: qList.length,
            uniqueTemplates: uniqueSkeletons,
            duplicationRate: Number(duplicationRate.toFixed(1)),
            diversityScore,
            maxClusterSize: maxRepetition,
            repeatedClusters,
          };

          report.allSummary.push(typeSummary);
          subjectQuestions += qList.length;
          subjectUniqueSkeletons += uniqueSkeletons;
          globalQuestionCount += qList.length;
          globalUniqueSkeletonCount += uniqueSkeletons;

          if (repeatedClusters.length > 0) {
            report.hotspotQuestionTypes.push(typeSummary);
          }
        }

        if (subjectQuestions > 0) {
          const subDupRate = ((subjectQuestions - subjectUniqueSkeletons) / subjectQuestions) * 100;
          report.bySubjectStats[subjectKey] = {
            grade,
            subject,
            totalQuestions: subjectQuestions,
            uniqueTemplates: subjectUniqueSkeletons,
            duplicationRate: Number(subDupRate.toFixed(1)),
            diversityScore: Math.round(100 - subDupRate),
          };
        }
      }
    }

    report.totalQuestions = globalQuestionCount;
    report.totalUniqueSkeletons = globalUniqueSkeletonCount;
    report.totalQuestionTypes = report.allSummary.length;
    report.overallDuplicationRate = globalQuestionCount > 0
      ? Number((((globalQuestionCount - globalUniqueSkeletonCount) / globalQuestionCount) * 100).toFixed(1))
      : 0;
  } finally {
    await server.close();
  }

  // Sắp xếp các điểm nóng theo kích thước cụm trùng và tỷ lệ trùng giảm dần
  report.hotspotQuestionTypes.sort((a, b) => b.maxClusterSize - a.maxClusterSize || b.duplicationRate - a.duplicationRate);

  if (saveReportPath) {
    const resolvedPath = path.resolve(saveReportPath);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n💾 Báo cáo JSON đã được lưu vào: ${resolvedPath}`);
  }

  if (isJsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return report;
  }

  printPrettyReport(report);
  return report;
}

/**
 * In báo cáo trực quan, sắc nét dạng CLI Dashboard
 */
function printPrettyReport(report) {
  console.log('\n' + '='.repeat(85));
  console.log('🔍 BÁO CÁO KIỂM SOÁT ĐỘ ĐA DẠNG CÂU HỎI THEO DẠNG BÀI (QUESTION DIVERSITY AUDIT)');
  console.log('='.repeat(85));
  console.log(`📌 Phạm vi quét   : Khối [${report.filter.grade}] | Môn [${report.filter.subject}] | Dạng: [${report.filter.typeId || 'Tất cả'}]`);
  console.log(`📌 Ngưỡng cảnh báo: >= ${report.filter.threshold} câu cùng mẫu cấu trúc (isomorphic clones)`);
  console.log(`📊 Tổng câu hỏi   : \x1b[1m${report.totalQuestions}\x1b[0m câu (${report.totalUniqueSkeletons} mẫu cấu trúc độc lập)`);
  console.log(`📊 Tổng dạng bài  : \x1b[1m${report.totalQuestionTypes}\x1b[0m dạng bài tập`);
  console.log(`💥 Tỷ lệ lặp chung: \x1b[33m${report.overallDuplicationRate}%\x1b[0m`);
  console.log(`⚠️  Số điểm nóng  : \x1b[31m${report.hotspotQuestionTypes.length}\x1b[0m dạng bài vượt ngưỡng lặp`);
  console.log('-'.repeat(85));

  // Bảng thống kê theo từng môn
  console.log('\n📊 THỐNG KÊ TỔNG QUAN THEO TỪNG MÔN HỌC:');
  console.log('┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ Khối & Môn   │ Tổng số câu  │ Mẫu độc lập  │ Tỷ lệ lặp    │ Điểm đa dạng │');
  console.log('├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤');
  for (const [key, stats] of Object.entries(report.bySubjectStats)) {
    const name = `${stats.grade.replace('grade', 'Lớp ')} ${stats.subject}`.padEnd(12);
    const total = String(stats.totalQuestions).padStart(12);
    const uniq = String(stats.uniqueTemplates).padStart(12);
    const dup = `${stats.duplicationRate}%`.padStart(12);
    const score = `${stats.diversityScore}/100`.padStart(12);
    console.log(`│ ${name} │ ${total} │ ${uniq} │ ${dup} │ ${score} │`);
  }
  console.log('└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘');

  if (isSummaryOnly) {
    console.log('\n' + '='.repeat(85) + '\n');
    return;
  }

  if (report.hotspotQuestionTypes.length === 0) {
    console.log('\n✅ TUYỆT VỜI! Không phát hiện dạng bài nào có câu hỏi bị trùng lặp vượt ngưỡng.');
    console.log('='.repeat(85) + '\n');
    return;
  }

  const displayLimit = Math.min(report.hotspotQuestionTypes.length, topArg);
  console.log(`\n🚨 TOP ${displayLimit} DẠNG BÀI CÓ ĐỘ TRÙNG LẶP CAO NHẤT (CẦN ĐA DẠNG HÓA):`);

  for (let i = 0; i < displayLimit; i++) {
    const item = report.hotspotQuestionTypes[i];
    const badge = item.maxClusterSize >= 5 ? '🔴 [BÁO ĐỘNG ĐỎ]' : '🟡 [CẢNH BÁO]';
    console.log(`\n${i + 1}. ${badge} ${item.grade.toUpperCase()} - Môn: ${item.subject.toUpperCase()}`);
    console.log(`   🆔 Mã dạng: \x1b[36m${item.questionTypeId}\x1b[0m | Điểm đa dạng: \x1b[33m${item.diversityScore}/100\x1b[0m`);
    console.log(`   📖 Tên dạng: \x1b[1m${item.questionTypeName}\x1b[0m`);
    console.log(`   📈 Quy mô: ${item.totalQuestions} câu | ${item.uniqueTemplates} mẫu khác nhau | Tỷ lệ lặp khuôn: \x1b[31m${item.duplicationRate}%\x1b[0m`);
    console.log(`   🔍 Cụm trùng khuôn câu hỏi (Cụm lớn nhất: \x1b[31m${item.maxClusterSize} câu\x1b[0m):`);

    for (const cluster of item.repeatedClusters) {
      console.log(`     - 🔁 Mẫu: "\x1b[35m${cluster.skeleton}\x1b[0m" (\x1b[31m${cluster.count} câu sinh đôi\x1b[0m)`);
      console.log(`       Danh sách ID: ${cluster.questionIds.join(', ')}`);
      console.log(`       Ví dụ các câu lặp thực tế:`);
      for (const sample of cluster.sampleContents) {
        console.log(`         • ${sample}`);
      }
    }
  }

  if (report.hotspotQuestionTypes.length > topArg) {
    console.log(`\n... và còn ${report.hotspotQuestionTypes.length - topArg} dạng bài khác (Dùng thêm flag --top=50 hoặc --json để xem toàn bộ).`);
  }

  console.log('\n' + '='.repeat(85));
  console.log('💡 GỢI Ý ĐA DẠNG HÓA CÂU HỎI NHẰM NÂNG CAO TRẢI NGHIỆM HỌC TẬP:');
  console.log(' 1. Đa dạng hóa ngữ cảnh thực tế (STEM / Ứng dụng đời sống).');
  console.log(' 2. Đảo ngược yêu cầu: Cho trước kết quả/đáp số, yêu cầu tìm giả thiết hoặc tham số.');
  console.log(' 3. Kết hợp bài toán hình học / đồ thị / biểu đồ / trục số thay vì thuần biểu thức.');
  console.log(' 4. Lồng ghép câu hỏi nhiều bước suy luận (multi-step reasoning) hoặc đếm nghiệm nguyên.');
  console.log('='.repeat(85) + '\n');
}

// Chạy trực tiếp từ CLI
if (process.argv[1]?.endsWith('auditQuestionDiversity.mjs')) {
  auditQuestionDiversity().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });
}
