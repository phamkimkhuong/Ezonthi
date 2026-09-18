/**
 * EXPORT ROADMAP TO CLOUDFLARE R2 BUNDLES
 *
 * Script trích xuất toàn bộ dữ liệu lộ trình học (Chủ đề, Dạng bài, Lý thuyết, Phương pháp giải)
 * từ Web codebase thành các gói JSON độc lập chuẩn RoadmapSubjectBundle cho Cloudflare R2 CDN.
 *
 * Cách chạy:
 *   node scripts/tools/exportRoadmapToR2.mjs
 *   npm run export:roadmap
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { validateRoadmapBundle } from '../validators/validateRoadmapBundle.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

const CONTENT_VERSION = '2026.09.1';

// Cấu hình thông tin hiển thị & nhận diện thương hiệu cho từng môn học
const SUBJECT_METADATA = {
  math: {
    name: 'Toán học',
    icon: 'Calculator',
    themeColor: '#6366f1',
    badge: 'Trọng tâm',
  },
  english: {
    name: 'Tiếng Anh',
    icon: 'Languages',
    themeColor: '#10b981',
    badge: 'Bắt buộc',
  },
  physics: {
    name: 'Vật lý',
    icon: 'Atom',
    themeColor: '#0ea5e9',
    badge: 'KHTN',
  },
  chemistry: {
    name: 'Hóa học',
    icon: 'FlaskConical',
    themeColor: '#14b8a6',
    badge: 'KHTN',
  },
  biology: {
    name: 'Sinh học',
    icon: 'Dna',
    themeColor: '#84cc16',
    badge: 'KHTN',
  },
  history: {
    name: 'Lịch sử',
    icon: 'Scroll',
    themeColor: '#f59e0b',
    badge: 'KHXH',
  },
};

const GRADE_METADATA = {
  grade9: {
    name: 'Lớp 9 (Ôn Thi Vào 10)',
    badge: 'Tuyển sinh',
    subjects: ['math', 'english'],
    formatSubjectName: (subject) => {
      if (subject === 'math') return 'Toán 9 (Vào 10)';
      if (subject === 'english') return 'Tiếng Anh 9 (Vào 10)';
      return `${SUBJECT_METADATA[subject]?.name || subject} 9`;
    },
  },
  grade10: {
    name: 'Lớp 10 (GDPT 2018)',
    badge: 'Chương trình mới',
    subjects: ['math', 'english', 'physics', 'chemistry', 'biology', 'history'],
    formatSubjectName: (subject) => `${SUBJECT_METADATA[subject]?.name || subject} 10`,
  },
  grade11: {
    name: 'Lớp 11 (GDPT 2018)',
    badge: 'Nâng cao',
    subjects: ['math', 'english', 'physics', 'chemistry', 'biology'],
    formatSubjectName: (subject) => `${SUBJECT_METADATA[subject]?.name || subject} 11`,
  },
};

async function main() {
  console.log('🚀 Bắt đầu trích xuất lộ trình học sang Cloudflare R2 Bundles...\n');
  const startTime = Date.now();

  // Khởi tạo môi trường Vite SSR module loader để import trực tiếp các TypeScript modules
  const server = await createServer({
    root,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true, hmr: false },
  });

  const outputDirs = [
    path.join(root, 'dist-roadmap/roadmap'),
  ];

  for (const dir of outputDirs) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const catalogGrades = [];
  let totalBundlesExported = 0;
  let grandTotalTopics = 0;
  let grandTotalQuestionTypes = 0;

  const contentSourceDir = path.join(root, 'content-sources/roadmap');
  const hasContentSource = fs.existsSync(contentSourceDir);
  if (hasContentSource) {
    console.log('📁 Sử dụng Kho dữ liệu nguồn biên tập: content-sources/roadmap/\n');
  }

  try {
    let loader = null;
    if (!hasContentSource) {
      loader = await server.ssrLoadModule('/src/data/index.ts');
    }

    for (const [gradeId, gradeConfig] of Object.entries(GRADE_METADATA)) {
      const gradeCatalogSubjects = [];

      for (const subjectId of gradeConfig.subjects) {
        const meta = SUBJECT_METADATA[subjectId] || {
          name: subjectId,
          icon: 'BookOpen',
          themeColor: '#6366f1',
          badge: 'Môn học',
        };

        const subjectDisplayName = gradeConfig.formatSubjectName(subjectId);

        let rawTopics = [];
        let rawQuestionTypes = [];

        // Ưu tiên nạp từ Kho dữ liệu nguồn độc lập (content-sources/roadmap)
        const sourceFilePath = path.join(contentSourceDir, gradeId, `${subjectId}.json`);
        if (hasContentSource && fs.existsSync(sourceFilePath)) {
          try {
            const rawBundle = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));
            rawTopics = rawBundle.topics || [];
            rawQuestionTypes = rawBundle.questionTypes || [];
          } catch (readErr) {
            console.warn(`⚠️ Lỗi đọc từ ${sourceFilePath}:`, readErr.message);
          }
        }

        // Fallback về data aggregator nếu không có trong content-sources
        if (rawTopics.length === 0 && rawQuestionTypes.length === 0) {
          if (!loader) {
            loader = await server.ssrLoadModule('/src/data/index.ts');
          }
          let rawData;
          try {
            rawData = await loader.loadSubjectData(gradeId, subjectId);
          } catch (loadErr) {
            console.warn(`⚠️ Không nạp được dữ liệu cho [${gradeId}:${subjectId}]:`, loadErr.message);
            continue;
          }
          rawTopics = rawData.topics || [];
          rawQuestionTypes = rawData.questionTypes || [];
        }

        if (rawTopics.length === 0 && rawQuestionTypes.length === 0) {
          console.warn(`⚠️ Bỏ qua [${gradeId}:${subjectId}] do không có dữ liệu Topics hoặc QuestionTypes.`);
          continue;
        }

        // 1. Chuẩn hóa QuestionTypes
        const processedQuestionTypes = rawQuestionTypes.map((qt) => {
          return {
            id: qt.id,
            topicId: qt.topicId,
            name: qt.name || 'Dạng bài chưa đặt tên',
            slug: qt.slug || qt.id,
            difficulty: ['easy', 'medium', 'hard'].includes(qt.difficulty) ? qt.difficulty : 'medium',
            examFrequency: ['low', 'medium', 'high'].includes(qt.examFrequency) ? qt.examFrequency : 'high',
            description: qt.description || `Lý thuyết và phương pháp giải dạng bài ${qt.name}`,
            recognitionSigns: Array.isArray(qt.recognitionSigns) ? qt.recognitionSigns : [],
            solvingSteps: Array.isArray(qt.solvingSteps) ? qt.solvingSteps : [],
            commonMistakes: Array.isArray(qt.commonMistakes) ? qt.commonMistakes : [],
            ...(qt.theory && Array.isArray(qt.theory) && qt.theory.length > 0 ? { theory: qt.theory } : {}),
            ...(qt.keyFormulas && Array.isArray(qt.keyFormulas) && qt.keyFormulas.length > 0 ? { keyFormulas: qt.keyFormulas } : {}),
            ...(qt.subTypes && Array.isArray(qt.subTypes) && qt.subTypes.length > 0 ? { subTypes: qt.subTypes } : {}),
            ...(qt.theoryCheckpoints && Array.isArray(qt.theoryCheckpoints) && qt.theoryCheckpoints.length > 0
              ? { theoryCheckpoints: qt.theoryCheckpoints }
              : {}),
            ...(qt.exampleQuestionId ? { exampleQuestionId: qt.exampleQuestionId } : {}),
          };
        });

        const qtIdsAvailable = new Set(processedQuestionTypes.map(qt => qt.id));

        // 2. Chuẩn hóa Topics
        const processedTopics = rawTopics.map((t, idx) => {
          // Lấy danh sách questionTypeIds trực thuộc
          let qTypeIds = t.questionTypeIds;
          if (!Array.isArray(qTypeIds) || qTypeIds.length === 0) {
            qTypeIds = processedQuestionTypes.filter(qt => qt.topicId === t.id).map(qt => qt.id);
          } else {
            // Lọc các questionTypeIds thực sự tồn tại trong bundle
            qTypeIds = qTypeIds.filter(id => qtIdsAvailable.has(id));
          }

          const tier = [1, 2, 3].includes(t.tier) ? t.tier : 1;
          const defaultMinutes = qTypeIds.length > 0 ? qTypeIds.length * 30 : 60;

          return {
            id: t.id,
            name: t.name,
            slug: t.slug || t.id,
            orderIndex: typeof t.orderIndex === 'number' ? t.orderIndex : idx + 1,
            tier,
            description: t.description || `Kiến thức trọng tâm và phương pháp giải ${t.name}`,
            estimatedMinutes: t.estimatedMinutes || defaultMinutes,
            difficulty: ['easy', 'medium', 'hard'].includes(t.difficulty)
              ? t.difficulty
              : (tier === 3 ? 'hard' : tier === 2 ? 'medium' : 'easy'),
            questionTypeIds: qTypeIds,
          };
        });

        // 3. Đảm bảo tính liên kết 2 chiều
        const validTopicIds = new Set(processedTopics.map(t => t.id));
        // Gán topicId mặc định nếu questionType trỏ tới topic không tồn tại
        const firstTopicId = processedTopics[0]?.id;
        for (const qt of processedQuestionTypes) {
          if (!validTopicIds.has(qt.topicId) && firstTopicId) {
            console.warn(`   [${gradeId}:${subjectId}] QuestionType "${qt.id}" trỏ topicId "${qt.topicId}" không tồn tại. Gán về "${firstTopicId}".`);
            qt.topicId = firstTopicId;
            const targetTopic = processedTopics.find(t => t.id === firstTopicId);
            if (targetTopic && !targetTopic.questionTypeIds.includes(qt.id)) {
              targetTopic.questionTypeIds.push(qt.id);
            }
          }
        }

        const totalMinutes = processedTopics.reduce((sum, t) => sum + t.estimatedMinutes, 0);

        // 4. Tạo RoadmapSubjectBundle
        const bundle = {
          schemaVersion: '1.0.0',
          contentVersion: CONTENT_VERSION,
          updatedAt: new Date().toISOString(),
          grade: gradeId,
          subject: subjectId,
          subjectName: subjectDisplayName,
          icon: meta.icon,
          themeColor: meta.themeColor,
          badge: gradeConfig.badge,
          stats: {
            totalTopics: processedTopics.length,
            totalQuestionTypes: processedQuestionTypes.length,
            estimatedTotalMinutes: totalMinutes,
          },
          topics: processedTopics,
          questionTypes: processedQuestionTypes,
        };

        // 5. Xác minh bundle qua validator
        const validation = validateRoadmapBundle(bundle, `${gradeId}/${subjectId}.json`);
        if (!validation.isValid) {
          console.error(`❌ Bundle [${gradeId}:${subjectId}] không vượt qua kiểm tra schema:`);
          validation.errors.forEach(err => console.error(`   ${err}`));
          throw new Error(`Schema validation failed for ${gradeId}/${subjectId}`);
        }

        // 6. Ghi file ra các thư mục đích
        const relativeBundlePath = `${gradeId}/${subjectId}.json`;
        const bundleJsonString = JSON.stringify(bundle, null, 2);

        for (const baseDir of outputDirs) {
          const targetSubDir = path.join(baseDir, gradeId);
          fs.mkdirSync(targetSubDir, { recursive: true });
          fs.writeFileSync(path.join(targetSubDir, `${subjectId}.json`), bundleJsonString, 'utf8');
        }

        console.log(`✅ [${gradeId}:${subjectId}] -> ${processedTopics.length} Topics, ${processedQuestionTypes.length} QuestionTypes (${(bundleJsonString.length / 1024).toFixed(1)} KB)`);

        totalBundlesExported++;
        grandTotalTopics += processedTopics.length;
        grandTotalQuestionTypes += processedQuestionTypes.length;

        // Thêm vào mục lục môn của khối lớp
        gradeCatalogSubjects.push({
          id: subjectId,
          name: subjectDisplayName,
          icon: meta.icon,
          color: meta.themeColor,
          badge: gradeConfig.badge,
          bundleUrl: `roadmap/${relativeBundlePath}`,
          contentVersion: CONTENT_VERSION,
          totalTopics: processedTopics.length,
          totalQuestionTypes: processedQuestionTypes.length,
        });
      }

      catalogGrades.push({
        id: gradeId,
        name: gradeConfig.name,
        subjects: gradeCatalogSubjects,
      });
    }

    // 7. Tạo và ghi file Mục lục tổng (roadmap/index.json)
    const catalogIndex = {
      schemaVersion: '1.0.0',
      updatedAt: new Date().toISOString(),
      grades: catalogGrades,
    };

    const indexJsonString = JSON.stringify(catalogIndex, null, 2);
    for (const baseDir of outputDirs) {
      fs.writeFileSync(path.join(baseDir, 'index.json'), indexJsonString, 'utf8');
    }

    const elapsedMs = Date.now() - startTime;
    console.log(`\n🎉 XUẤT THÀNH CÔNG ${totalBundlesExported} BUNDLE LỘ TRÌNH HỌC! (${elapsedMs}ms)`);
    console.log(`📊 Tổng quy mô: ${grandTotalTopics} Topics, ${grandTotalQuestionTypes} Question Types.`);
    console.log(`📁 Thư mục lưu trữ:`);
    outputDirs.forEach(dir => console.log(`   - ${path.relative(root, dir)}`));
    console.log(`🌐 Mục lục tổng: roadmap/index.json sẵn sàng đưa lên Cloudflare R2.`);
  } finally {
    await server.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Lỗi trong quá trình trích xuất roadmap:', err);
  process.exit(1);
});
