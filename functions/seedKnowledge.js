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
  return [...new Set(combined)].slice(0, 40);
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
        }),
        signal: AbortSignal.timeout(20_000)
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

const readNodeValue = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  }
  if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(readNodeValue);
  }
  if (ts.isObjectLiteralExpression(node)) {
    const result = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = property.name.getText().replace(/["']/g, '');
      result[key] = readNodeValue(property.initializer);
    }
    return result;
  }
  if (ts.isPrefixUnaryExpression(node)) {
    const operand = readNodeValue(node.operand);
    if (node.operator === ts.SyntaxKind.MinusToken) {
      return -operand;
    }
    return operand;
  }
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map(span => span.literal.text).join('');
  }
  return node.getText().replace(/["']/g, '');
};

const readQuestionTypesFromTs = async (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const source = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
  const items = [];
  
  source.forEachChild(node => {
    if (!ts.isVariableStatement(node)) return;
    
    for (const declaration of node.declarationList.declarations) {
      const name = declaration.name.getText();
      if ((name.toLowerCase().includes('questiontype') || name.endsWith('Types')) && declaration.initializer) {
        const val = readNodeValue(declaration.initializer);
        if (Array.isArray(val)) {
          val.forEach(item => {
            if (item && typeof item === 'object' && item.id && item.name) {
              items.push(item);
            }
          });
        }
      }
    }
  });
  
  if (items.length > 0) return items;

  const transpiled = ts.transpileModule(fileContent, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
    fileName: filePath,
  }).outputText;
  if (/^\s*import\s/m.test(transpiled)) return null;
  const encoded = Buffer.from(transpiled).toString('base64');
  const loaded = await import(`data:text/javascript;base64,${encoded}#${encodeURIComponent(filePath)}`);
  const generated = Object.values(loaded).find(value => Array.isArray(value) && value.every(item => item && typeof item === 'object'));
  return Array.isArray(generated) ? generated.filter(item => item.id && item.name) : null;
};

async function run() {
  const apiKey = loadApiKey();
  console.log("Đã đọc thành công Gemini API Key.");

  const projectId = "on-thi-vao-10-7d87c";
  const serviceAccountPath = path.join(__dirname, "service-account.json");

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log(`[Emulator] Đang kết nối tới Firestore Emulator tại: ${process.env.FIRESTORE_EMULATOR_HOST}`);
    admin.initializeApp({ projectId });
  } else if (fs.existsSync(serviceAccountPath)) {
    console.log("[Production] Đang kết nối tới Firestore Production bằng Service Account (service-account.json)...");
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId
    });
  } else {
    console.log("[Production] Đang kết nối tới Firestore Production bằng Mặc định (Application Default Credentials - ADC)...");
    admin.initializeApp({ projectId });
  }

  const db = admin.firestore();
  const collectionRef = db.collection("knowledge_base");

  console.log("\n--- BẮT ĐẦU ĐỌC DỮ LIỆU TỪ SRC/DATA ---");
  
  const rawQuestionTypes = [];
  const contentVersion = process.env.RAG_CONTENT_VERSION || "2026.09";
  const gradeFilter = process.env.RAG_GRADE_FILTER || "";
  const subjectFilter = process.env.RAG_SUBJECT_FILTER || "";

  // 1. Grade 9
  const grade9Subjects = ['math', 'english'];
  for (const sub of grade9Subjects) {
    if ((gradeFilter && gradeFilter !== 'grade9') || (subjectFilter && subjectFilter !== sub)) continue;
    const jsonPath = path.resolve(root, `src/data/grade9/${sub}/questionTypes.json`);
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      rawQuestionTypes.push(...data.map(q => ({ ...q, subjectId: sub, grade: 'grade9' })));
      console.log(`[Loaded] Grade 9 ${sub}: ${data.length} dạng bài`);
    }
  }

  // 2. Grade 10 & 11 (Tất cả các môn: Toán, Anh, Hóa, Sinh, Lý, Sử)
  const grades = ['grade10', 'grade11'];
  const subjects = ['math', 'english', 'chemistry', 'biology', 'physics', 'history'];

  for (const grade of grades) {
    if (gradeFilter && gradeFilter !== grade) continue;
    for (const sub of subjects) {
      if (subjectFilter && subjectFilter !== sub) continue;
      const subDir = path.resolve(root, `src/data/${grade}/${sub}`);
      if (!fs.existsSync(subDir)) continue;

      const modulesDir = path.join(subDir, 'modules');
      if (fs.existsSync(modulesDir)) {
        const modules = fs.readdirSync(modulesDir);
        let count = 0;
        for (const mod of modules) {
          const qTypesPath = path.join(modulesDir, mod, 'questionTypes.ts');
          if (fs.existsSync(qTypesPath)) {
            const data = await readQuestionTypesFromTs(qTypesPath);
            if (data && Array.isArray(data)) {
              rawQuestionTypes.push(...data.map(q => ({ ...q, subjectId: sub, grade: grade })));
              count += data.length;
            }
          }
        }
        console.log(`[Loaded] ${grade} ${sub} (từ các module): ${count} dạng bài`);
      }
      
      // Quét thêm tệp đơn nếu có
      const qTypesPath = path.join(subDir, 'questionTypes.ts');
      if (fs.existsSync(qTypesPath)) {
        const data = await readQuestionTypesFromTs(qTypesPath);
        if (data && Array.isArray(data)) {
          rawQuestionTypes.push(...data.map(q => ({ ...q, subjectId: sub, grade: grade })));
          console.log(`[Loaded] ${grade} ${sub} (tệp đơn): ${data.length} dạng bài`);
        }
      }
    }
  }

  // Khử trùng lặp và loại bỏ hoàn toàn bất kỳ item không hợp lệ nào
  const seenIds = new Set();
  const allQuestionTypes = [];

  for (const q of rawQuestionTypes) {
    const scopedId = q && `${q.grade}:${q.subjectId}:${q.id}`;
    if (q && typeof q === 'object' && q.id && q.name && !seenIds.has(scopedId)) {
      seenIds.add(scopedId);
      allQuestionTypes.push(q);
    }
  }

  const subjectNameMap = {
    math: "Toán học",
    english: "Tiếng Anh",
    chemistry: "Hóa học",
    biology: "Sinh học",
    physics: "Vật lý",
    history: "Lịch sử"
  };

  console.log(`\nTổng số dạng bài tìm thấy: ${allQuestionTypes.length}`);

  if (process.env.RAG_DRY_RUN === '1') {
    console.log(`[Dry-run] Không ghi Firestore. Bộ lọc: grade=${gradeFilter || 'all'}, subject=${subjectFilter || 'all'}, version=${contentVersion}.`);
    return;
  }

  for (const qType of allQuestionTypes) {
    const subjectName = subjectNameMap[qType.subjectId] || qType.subjectId;
    const gradeLabel = qType.grade === "grade9" ? "Lớp 9" : qType.grade === "grade10" ? "Lớp 10" : "Lớp 11";
    console.log(`\nĐang xử lý dạng bài: "${qType.name}" (${subjectName} ${gradeLabel})...`);

    const oldDocId = `${qType.subjectId}_${qType.id}`;
    await collectionRef.doc(oldDocId).delete().catch(() => {});

    const saveChunk = async (chunkId, chunkType, chunkTitle, chunkContent) => {
      try {
        const currentHash = getContentHash(chunkContent);

        const docSnap = await collectionRef.doc(chunkId).get();
        if (docSnap.exists) {
          const existingData = docSnap.data();
          if (existingData && existingData.contentHash === currentHash) {
            await collectionRef.doc(chunkId).set({
              subjectId: qType.subjectId,
              grade: qType.grade,
              gradeId: qType.grade,
              contentVersion,
              status: "published",
              sourceId: `course:${qType.grade}:${qType.subjectId}`,
              sourceTitle: `${subjectName} ${gradeLabel} — dữ liệu khóa học nội bộ`,
              sourceLocator: `${qType.id}/${chunkType}`,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`  - Bỏ qua: Chunk [${chunkType}] đã tồn tại và không thay đổi (${chunkId})`);
            return;
          }
          console.log(`  - Cập nhật: Phát hiện thay đổi nội dung tại chunk [${chunkType}] (${chunkId}). Đang tạo lại embedding...`);
        }

        // Thêm delay 150ms giữa các request tạo embedding để tránh bị chạm trần 429 Rate Limit
        await new Promise(resolve => setTimeout(resolve, 150));

        const embedding = await getEmbedding(chunkContent, apiKey);
        if (!embedding || embedding.length === 0) {
          console.error(`  - Thất bại: Không nhận được vector embedding cho chunk [${chunkType}].`);
          return;
        }

        const cleanTextForKeywords = `${chunkTitle} ${qType.name}`;
        const keywords = extractKeywords(cleanTextForKeywords);

        await collectionRef.doc(chunkId).set({
          subjectId: qType.subjectId,
          grade: qType.grade,
          gradeId: qType.grade,
          contentVersion,
          status: "published",
          sourceId: `course:${qType.grade}:${qType.subjectId}`,
          sourceTitle: `${subjectName} ${gradeLabel} — dữ liệu khóa học nội bộ`,
          sourceLocator: `${qType.id}/${chunkType}`,
          parentId: qType.id,
          parentTitle: qType.name,
          chunkType: chunkType,
          difficulty: qType.difficulty || "medium",
          title: chunkTitle,
          content: chunkContent,
          contentHash: currentHash,
          keywords: keywords,
          embedding: admin.firestore.FieldValue.vector(embedding),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  - Thành công: Đã ghi chunk [${chunkType}] với ID: ${chunkId} (${keywords.length} keywords, difficulty: ${qType.difficulty || "medium"})`);
      } catch (err) {
        console.error(`  - Lỗi khi ghi chunk [${chunkType}] ${chunkId}:`, err.message);
      }
    };

    // Overview chunk
    const overviewContent = `DẠNG BÀI: ${qType.name} (Môn: ${subjectName} ${gradeLabel})
Mô tả chuyên đề: ${qType.description}

Dấu hiệu nhận biết dạng bài này:
${qType.recognitionSigns && qType.recognitionSigns.length > 0 ? qType.recognitionSigns.map(s => `- ${s}`).join("\n") : "- Không có"}`;
    
    await saveChunk(
      `${qType.grade}_${qType.subjectId}_${qType.id}_overview`,
      "overview",
      `[Tổng quan] ${qType.name}`,
      overviewContent
    );

    // Method chunk
    if (qType.solvingSteps && qType.solvingSteps.length > 0) {
      const methodContent = `PHƯƠNG PHÁP GIẢI DẠNG BÀI: ${qType.name} (Môn: ${subjectName} ${gradeLabel})
Các bước giải chi tiết:
${qType.solvingSteps.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}`;

      await saveChunk(
        `${qType.grade}_${qType.subjectId}_${qType.id}_method`,
        "method",
        `[Phương pháp giải] ${qType.name}`,
        methodContent
      );
    }

    // Mistakes chunk
    if (qType.commonMistakes && qType.commonMistakes.length > 0) {
      const mistakesContent = `CẢNH BÁO LỖI THƯỜNG GẶP của dạng bài: ${qType.name} (Môn: ${subjectName} ${gradeLabel})
Các lỗi học sinh dễ mắc sai lầm:
${qType.commonMistakes.map(s => `- ${s}`).join("\n")}`;

      await saveChunk(
        `${qType.grade}_${qType.subjectId}_${qType.id}_mistakes`,
        "mistakes",
        `[Cảnh báo lỗi sai] ${qType.name}`,
        mistakesContent
      );
    }

    // Examples chunk
    if (qType.subTypes && qType.subTypes.length > 0) {
      for (let idx = 0; idx < qType.subTypes.length; idx++) {
        const sub = qType.subTypes[idx];
        const exampleContent = `PHÂN DẠNG BÀI TẬP: ${sub.name} (Thuộc dạng bài lớn: ${qType.name})
Ví dụ mẫu: ${sub.example}
Hướng dẫn/Lưu ý đặc biệt: ${sub.note || "Không có"}`;

        await saveChunk(
          `${qType.grade}_${qType.subjectId}_${qType.id}_sub_${idx}`,
          "example",
          `[Ví dụ & Phân dạng] ${qType.name} -> ${sub.name}`,
          exampleContent
        );
      }
    }
  }

  console.log("\n Hoàn thành đồng bộ toàn bộ tri thức từ src/data lên Firestore!");
}

run().catch(console.error);
