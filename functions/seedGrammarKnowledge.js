import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import crypto from "crypto";
import ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

function getContentHash(content) {
  if (!content) return "";
  return crypto.createHash("md5").update(content).digest("hex");
}

function removeAccents(str) {
  if (!str) return "";
  return str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

function extractKeywords(text) {
  if (!text) return [];
  const cleanWithAccents = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, " ");
  const cleanNoAccents = removeAccents(cleanWithAccents);
  
  const wordsWithAccents = cleanWithAccents.split(/\s+/).filter(w => w.length >= 2);
  const wordsNoAccents = cleanNoAccents.split(/\s+/).filter(w => w.length >= 2);
  
  const combined = [...wordsWithAccents, ...wordsNoAccents];
  return [...new Set(combined)].slice(0, 50);
}

function loadApiKey() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) {
    throw new Error("Không tìm thấy file functions/.env để lấy API Key.");
  }
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/GEMINI_API_KEY\s*=\s*["']?(.*?)["']?(\s|$)/);
  if (!match || !match[1]) {
    throw new Error("Không tìm thấy biến GEMINI_API_KEY trong file functions/.env");
  }
  return match[1].trim();
}

async function getEmbedding(text, apiKey, retries = 5, delayMs = 3000) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: {
            parts: [{ text }]
          },
          outputDimensionality: 1536
        })
      });

      if (response.status === 429) {
        console.warn(`  [429 Rate Limit] Đang đợi ${delayMs / 1000}s trước khi thử lại lần ${attempt}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Lỗi tạo embedding: ${errText}`);
      }

      const data = await response.json();
      return data?.embedding?.values;
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      console.warn(`  [Lỗi kết nối] ${err.message}. Đang thử lại sau ${delayMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }
}

function formatBlockToText(block) {
  let text = `[${block.badgeTitle}] ${block.title}\n`;
  if (block.rows && block.rows.length > 0) {
    for (const row of block.rows) {
      let rowText = '';
      for (const seg of row.segments) {
        if (seg.box) {
          rowText += `[${seg.box.from} -> ${seg.box.to}${seg.box.note ? ` (${seg.box.note})` : ''}] `;
        } else if (seg.content) {
          rowText += seg.content + ' ';
        }
      }
      if (rowText.trim()) text += rowText.trim() + '\n';
    }
  }
  if (block.pillBoxes && block.pillBoxes.length > 0) {
    for (const box of block.pillBoxes) {
      text += `- ${box.from} -> ${box.to}${box.note ? ` (${box.note})` : ''}\n`;
    }
  }
  return text.trim();
}

function loadGrammarTopics() {
  const grammarFilePath = path.resolve(root, "src/data/english/grammar/englishGrammarData.ts");
  if (!fs.existsSync(grammarFilePath)) {
    throw new Error(`Không tìm thấy tệp ngữ pháp tại: ${grammarFilePath}`);
  }
  const fileContent = fs.readFileSync(grammarFilePath, "utf8");
  const jsCode = ts.transpileModule(fileContent, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  }).outputText;

  const moduleObj = { exports: {} };
  const fn = new Function("exports", "module", jsCode);
  fn(moduleObj.exports, moduleObj);

  return moduleObj.exports.ENGLISH_GRAMMAR_TOPICS;
}

async function run() {
  console.log("=== BẮT ĐẦU ĐỒNG BỘ TRI THỨC NGỮ PHÁP TIẾNG ANH LÊN VECTOR DB (RAG) ===");
  const apiKey = loadApiKey();
  console.log("✓ Đã đọc thành công Gemini API Key.");

  const projectId = "on-thi-vao-10-7d87c";
  const serviceAccountPath = path.join(__dirname, "service-account.json");

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`[Emulator] Đang kết nối tới Firestore Emulator tại: ${process.env.FIRESTORE_EMULATOR_HOST}`);
    admin.initializeApp({ projectId });
  } else if (fs.existsSync(serviceAccountPath)) {
    console.log("[Production] Đang kết nối tới Firestore Production bằng Service Account...");
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId
    });
  } else {
    console.log("[Production] Đang kết nối tới Firestore Production bằng ADC...");
    admin.initializeApp({ projectId });
  }

  const db = admin.firestore();
  const collectionRef = db.collection("knowledge_base");
  const contentVersion = process.env.RAG_CONTENT_VERSION || '2026.09';

  const topics = loadGrammarTopics();
  console.log(`✓ Đã nạp ${topics.length} Chủ điểm ngữ pháp từ mã nguồn.`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalUploaded = 0;

  for (const topic of topics) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Chủ điểm ${topic.topicNumber}: ${topic.title} (${topic.lessons.length} bài học)`);
    console.log(`------------------------------------------------------------`);

    for (const lesson of topic.lessons) {
      // Nhóm các block của bài học:
      // 1. Nhóm lý thuyết & công thức (rule / formula / highlight)
      const theoryBlocks = lesson.blocks.filter(b => b.type !== 'exception');
      // 2. Nhóm ngoại lệ & bẫy đề thi (exception)
      const exceptionBlocks = lesson.blocks.filter(b => b.type === 'exception');

      const chunksToProcess = [];

      // Tạo Chunk 1: Tổng quan & Công thức bài học
      if (theoryBlocks.length > 0) {
        const theoryContent = `CHUYÊN ĐỀ NGỮ PHÁP TIẾNG ANH (LỚP 9 & ÔN THI VÀO 10): ${topic.title}
BÀI HỌC: Bài ${lesson.lessonNumber} - ${lesson.title}
TRỌNG TÂM: CÔNG THỨC VÀ QUY TẮC NGỮ PHÁP CỐT LÕI

${theoryBlocks.map(b => formatBlockToText(b)).join("\n\n")}`;

        chunksToProcess.push({
          chunkId: `english_grammar_${lesson.id}_theory`,
          chunkType: "overview",
          title: `[Ngữ pháp ${lesson.lessonNumber}] ${lesson.title} - Công thức & Quy tắc`,
          content: theoryContent
        });
      }

      // Tạo Chunk 2: Ngoại lệ, Bẫy thi & Chú ý đặc biệt (nếu có)
      if (exceptionBlocks.length > 0) {
        const exceptionContent = `CHUYÊN ĐỀ NGỮ PHÁP TIẾNG ANH (LỚP 9 & ÔN THI VÀO 10): ${topic.title}
BÀI HỌC: Bài ${lesson.lessonNumber} - ${lesson.title}
CẢNH BÁO ĐẶC BIỆT: BẤT QUY TẮC, BẪY ĐỀ THI & LỖI HỌC SINH THƯỜNG GẶP

${exceptionBlocks.map(b => formatBlockToText(b)).join("\n\n")}`;

        chunksToProcess.push({
          chunkId: `english_grammar_${lesson.id}_trap`,
          chunkType: "mistakes",
          title: `[Bẫy thi & Ngoại lệ ${lesson.lessonNumber}] ${lesson.title}`,
          content: exceptionContent
        });
      }

      for (const chunk of chunksToProcess) {
        totalProcessed++;
        const currentHash = getContentHash(chunk.content);

        try {
          const docSnap = await collectionRef.doc(chunk.chunkId).get();
          if (docSnap.exists) {
            const existingData = docSnap.data();
            if (existingData && existingData.contentHash === currentHash) {
              await collectionRef.doc(chunk.chunkId).set({
                grade: 'grade9', gradeId: 'grade9', subjectId: 'english',
                contentVersion, status: 'published',
                sourceId: 'course:grade9:english',
                sourceTitle: 'Tiếng Anh Lớp 9 — dữ liệu ngữ pháp nội bộ',
                sourceLocator: `${lesson.id}/${chunk.chunkType}`,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
              console.log(`  - [Bỏ qua] Đã tồn tại & không đổi: ${chunk.title}`);
              totalSkipped++;
              continue;
            }
            console.log(`  - [Cập nhật] Nội dung thay đổi, đang tạo lại vector: ${chunk.title}`);
          } else {
            console.log(`  - [Mới] Đang tạo vector embedding: ${chunk.title}`);
          }

          // Delay nhỏ để bảo vệ quota rate limit
          await new Promise(resolve => setTimeout(resolve, 200));

          const embedding = await getEmbedding(chunk.content, apiKey);
          if (!embedding || embedding.length === 0) {
            console.error(`    ❌ Thất bại: Không nhận được vector cho: ${chunk.chunkId}`);
            continue;
          }

          const keywordSource = `${chunk.title} ${lesson.title} ${topic.title} ${chunk.content.substring(0, 300)}`;
          const keywords = extractKeywords(keywordSource);

          await collectionRef.doc(chunk.chunkId).set({
            subjectId: "english",
            grade: "grade9",
            gradeId: 'grade9',
            contentVersion,
            status: 'published',
            sourceId: 'course:grade9:english',
            sourceTitle: 'Tiếng Anh Lớp 9 — dữ liệu ngữ pháp nội bộ',
            sourceLocator: `${lesson.id}/${chunk.chunkType}`,
            parentId: lesson.id,
            parentTitle: `${topic.title} - ${lesson.title}`,
            chunkType: chunk.chunkType,
            difficulty: "medium",
            title: chunk.title,
            content: chunk.content,
            contentHash: currentHash,
            keywords: keywords,
            embedding: admin.firestore.FieldValue.vector(embedding),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          totalUploaded++;
          console.log(`    ✓ Đã lưu vector thành công (${keywords.length} từ khóa)`);
        } catch (err) {
          console.error(`    ❌ Lỗi khi xử lý ${chunk.chunkId}:`, err.message);
        }
      }
    }
  }

  console.log(`\n============================================================`);
  console.log(`🎉 HOÀN THÀNH ĐỒNG BỘ TRI THỨC NGỮ PHÁP TIẾNG ANH!`);
  console.log(`- Tổng số chunk phân tích: ${totalProcessed}`);
  console.log(`- Đã bỏ qua (không đổi): ${totalSkipped}`);
  console.log(`- Đã tạo vector & lưu mới: ${totalUploaded}`);
  console.log(`============================================================\n`);
}

run().catch(console.error);
