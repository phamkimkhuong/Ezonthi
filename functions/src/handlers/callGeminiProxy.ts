import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, DAILY_REQUEST_LIMIT } from "../config.js";
import { GeminiProxyRequest, ChatContent, ChatPart } from "../types.js";
import {
  getEmbedding,
  extractKeywords,
  rewriteQuery,
  removeAccents,
  FALLBACK_MODELS,
} from "../services/gemini.js";
import { hasActivePremium } from "../services/entitlements.js";
import { createHash } from "crypto";
import { callGroqAiApi, callMistralAiApi } from "../services/aiProviders.js";
import { determineScaffoldingLevel, getScaffoldingInstruction, detectUserIntent, getIntentOverrideInstruction } from "../services/scaffolding.js";
import { isRelevantToTopic, shouldRewriteQuery } from "../services/relevance.js";
import {
  AiQuotaExceededError,
  AiRequestValidationError,
  estimateAiCostUsd,
  fetchWithTimeout,
  finalizeAiUsage,
  recordAuxiliaryAiUsage,
  reserveAiQuota,
  validateAiRequest,
  type AiTaskType,
} from '../services/aiControl.js';
import {
  buildRagProvenance,
  candidateMatchesScope,
  DEFAULT_RAG_CONTENT_VERSION,
  RAG_CONTRACT_VERSION,
  type RagCandidate,
  type RagProvenance,
} from '../services/ragPolicy.js';
import { recordProductMetric } from '../services/productMetrics.js';

export const callGeminiProxy = onCall({
  cors: true,
  timeoutSeconds: 60,
  memory: '1GiB',
  maxInstances: 40,
}, async (request) => {
  // 1. Kiểm tra xác thực (chỉ cho phép user đã đăng nhập hệ thống của chúng ta)
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Yêu cầu đăng nhập để sử dụng tính năng AI.");
  }

  const uid = request.auth.uid;
  // Lấy API Key từ biến môi trường của server
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "API Key chưa được cấu hình ở phía máy chủ.");
  }

  let data: GeminiProxyRequest;
  try {
    data = validateAiRequest(request.data);
  } catch (error) {
    if (error instanceof AiRequestValidationError) throw new HttpsError('invalid-argument', error.message);
    throw error;
  }
  const {
    prompt,
    contents,
    systemInstruction,
    useRag,
    subjectId,
    gradeId,
    ragVersion = DEFAULT_RAG_CONTENT_VERSION,
    image,
    responseMimeType,
    responseSchema,
    temperature,
    topicName,
    chatId,
    taskType: requestedTaskType,
  } = data;
  const taskType: AiTaskType = requestedTaskType ?? (responseMimeType ? 'proof_grading' : 'tutor');
  const requestStartedAt = Date.now();
  const providerDeadlineAt = requestStartedAt + 52_000;
  const hasProviderBudget = () => Date.now() < providerDeadlineAt - 1_000;
  const providerTimeout = (cap = 15_000) => Math.max(1_000, Math.min(cap, providerDeadlineAt - Date.now()));

  // 1.15 Tải hồ sơ năng lực học sinh (Long-term Memory)
  let studentProfile: any = null;
  let profileInstruction = "";
  try {
    const profileDoc = await db.collection("student_profiles").doc(uid).get();
    if (profileDoc.exists) {
      studentProfile = profileDoc.data();
      const cleanSubjectId = subjectId || "math";
      const subProfile = studentProfile[cleanSubjectId] || {};

      let strengths: string[] = Array.isArray(subProfile.strengths) ? subProfile.strengths.map(String).slice(-50) : [];
      let weaknesses: string[] = Array.isArray(subProfile.weaknesses) ? subProfile.weaknesses.map(String).slice(-50) : [];
      let summary: string = String(subProfile.learningSummary || '').slice(0, 1_000);

      // Di trú nếu chưa có cấu trúc môn học mới
      if (!studentProfile[cleanSubjectId] && cleanSubjectId === "math") {
        if (studentProfile.strengths) strengths = Array.isArray(studentProfile.strengths) ? studentProfile.strengths.map(String).slice(-50) : [];
        if (studentProfile.weaknesses) weaknesses = Array.isArray(studentProfile.weaknesses) ? studentProfile.weaknesses.map(String).slice(-50) : [];
        if (studentProfile.learningSummary) summary = String(studentProfile.learningSummary).slice(0, 1_000);
      }

      // Lọc điểm mạnh/yếu theo độ liên quan ngữ nghĩa (Semantic/Keyword Relevance) của chuyên đề (Topic)
      if (topicName) {
        const originalStrengthsCount = strengths.length;
        const originalWeaknessesCount = weaknesses.length;

        strengths = strengths.filter(s => isRelevantToTopic(s, topicName));
        weaknesses = weaknesses.filter(w => isRelevantToTopic(w, topicName));

        console.log(`[Relevance Filter] Topic: "${topicName}". Strengths: ${originalStrengthsCount} -> ${strengths.length}, Weaknesses: ${originalWeaknessesCount} -> ${weaknesses.length}`);
      }

      const subjectNameMap: Record<string, string> = {
        math: "Toán học",
        english: "Tiếng Anh",
        chemistry: "Hóa học",
        biology: "Sinh học",
        physics: "Vật lý",
      };
      const subjectName = subjectNameMap[cleanSubjectId] || cleanSubjectId;

      if (strengths.length > 0 || weaknesses.length > 0 || summary) {
        profileInstruction = `\n\nHỒ SƠ NĂNG LỰC HỌC SINH MÔN ${subjectName.toUpperCase()} HIỆN TẠI:`;
        if (strengths.length > 0) {
          profileInstruction += `\n- Điểm mạnh: ${strengths.join(", ")}`;
        }
        if (weaknesses.length > 0) {
          profileInstruction += `\n- Điểm yếu / Lỗi sai thường gặp: ${weaknesses.join(", ")}`;
        }
        if (summary) {
          profileInstruction += `\n- Tóm tắt tiến trình học tập: ${summary}`;
        }
        profileInstruction += `\nLưu ý: Hãy khéo léo nhắc nhở học sinh sửa các lỗi sai thường gặp và tận dụng điểm mạnh của mình nếu chủ đề hội thoại liên quan. Tuyệt đối KHÔNG liệt kê trực tiếp toàn bộ hồ sơ này cho học sinh xem, chỉ dùng làm ngữ cảnh sư phạm ngầm để giảng dạy.`;
      }
    }
  } catch (err) {
    console.error("Lỗi khi tải hồ sơ học sinh:", err);
  }

  // 1.05 Kiểm tra xem người dùng có phải là Premium hay không
  let isPremium = false;
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      isPremium = hasActivePremium(userData);
    }
  } catch (err) {
    console.error("Lỗi khi tải thông tin user để check Premium:", err);
  }

  // 1.1 Giữ chỗ quota bằng transaction trước khi gọi bất kỳ provider nào.
  const dailyLimit = isPremium ? DAILY_REQUEST_LIMIT : 20;
  let quotaReservation;
  try {
    quotaReservation = await reserveAiQuota(uid, dailyLimit, taskType);
  } catch (error) {
    if (error instanceof AiQuotaExceededError) {
      throw new HttpsError('resource-exhausted', `Bạn đã dùng hết hạn mức AI hàng ngày (${dailyLimit} lượt).`);
    }
    console.error('Không thể giữ chỗ quota AI:', error);
    throw new HttpsError('unavailable', 'Chưa thể xác nhận hạn mức AI. Vui lòng thử lại.');
  }

  // 1.2 Thực hiện RAG (Retrieval-Augmented Generation) nếu được yêu cầu
  let ragContext = "";
  let queryText = "";
  const ragProvenance: RagProvenance[] = [];

  // Lấy câu hỏi hiện tại để phân tích
  if (contents && contents.length > 0) {
    for (let i = contents.length - 1; i >= 0; i--) {
      if (contents[i].role === "user") {
        const textParts = contents[i].parts?.filter(p => p.text).map(p => p.text) || [];
        queryText = textParts.join(" ");
        break;
      }
    }
  }
  if (!queryText && prompt) {
    queryText = prompt;
  }

  if (useRag && subjectId && queryText) {
    try {
      console.log(`[RAG] Analyzing query: "${queryText.substring(0, 50)}..."`);

      const cleanedText = queryText.trim().toLowerCase();
      // Stage 1 Fast Filter: Phát hiện nhanh câu chào hỏi/xã giao cực ngắn bằng Regex
      const socialRegex = /^(chào|helo|hello|hi|chào thầy|chào cô|xin chào|dạ|vâng|ok|oke|cảm ơn|cám ơn|thanks|thank you|em cảm ơn|dạ em cảm ơn|dạ vâng|vâng ạ|em hiểu rồi|dạ em hiểu rồi|dạ rõ rồi|ok ạ|dạ ok|dạ vâng ạ|ạ)[.!?;]*$/i;

      if (cleanedText.length < 15 && socialRegex.test(cleanedText)) {
        console.log(`[RAG] Fast-filter triggered: Query classified as conversational/social ("${cleanedText}"). Skipping RAG.`);
      } else {
        const chatHistory = contents ? contents.slice(0, -1) : [];
        let rewrittenQuery = queryText;

        if (shouldRewriteQuery(queryText, chatHistory)) {
          const rewriteStartedAt = Date.now();
          const rewriteResult = await rewriteQuery(chatHistory, queryText, apiKey);
          rewrittenQuery = rewriteResult.rewrittenQuery;
          console.log(`[RAG] LLM rewritten query (context dependent): "${rewrittenQuery}"`);

          if (rewriteResult.usageMetadata) {
            await recordAuxiliaryAiUsage(
              quotaReservation.requestId, uid, 'rewrite', 'gemini', 'gemini-3.1-flash-lite',
              rewriteResult.usageMetadata, Date.now() - rewriteStartedAt
            ).catch((err) => {
              console.error("Lỗi khi ghi log rewriteQuery:", err);
            });
          }
        } else {
          console.log(`[RAG] Bypassed query rewrite (context independent). Using original: "${rewrittenQuery}"`);
        }

        if (rewrittenQuery.toUpperCase() === "NONE") {
          console.log(`[RAG] Query classified as conversational/social by LLM. Skipping RAG.`);
        } else {
          console.log(`[RAG] Generating embedding for: "${rewrittenQuery.substring(0, 50)}..."`);
          const queryEmbedding = await getEmbedding(rewrittenQuery, apiKey);
          if (queryEmbedding) {
            console.log(`[RAG] Running Hybrid Search for query: "${rewrittenQuery}"`);

            // 1. Tạo Promise 1: Semantic Vector Search
            const vectorQuery = db.collection("knowledge_base")
              .where("gradeId", "==", gradeId)
              .where("subjectId", "==", subjectId)
              .where("contentVersion", "==", ragVersion)
              .where("status", "==", "published")
              .findNearest({
                vectorField: "embedding",
                queryVector: queryEmbedding,
                distanceMeasure: "COSINE",
                limit: 4,
                distanceThreshold: 0.4,
              });

            // 2. Tạo Promise 2: Keyword Search (array-contains-any)
            const queryKeywords = extractKeywords(rewrittenQuery);
            let keywordQueryPromise = Promise.resolve({ docs: [] } as any);

            if (queryKeywords.length > 0) {
              console.log(`[RAG] Keyword Search query tokens: ${JSON.stringify(queryKeywords)}`);
              keywordQueryPromise = db.collection("knowledge_base")
                .where("gradeId", "==", gradeId)
                .where("subjectId", "==", subjectId)
                .where("contentVersion", "==", ragVersion)
                .where("status", "==", "published")
                .where("keywords", "array-contains-any", queryKeywords)
                .limit(4)
                .get()
                .catch((err) => {
                  console.error("Lỗi khi truy vấn keyword search (sẽ bỏ qua):", err);
                  return { docs: [] };
                });
            }

            // Chạy song song cả hai truy vấn
            const [vectorSnap, keywordSnap] = await Promise.all([
              vectorQuery.get(),
              keywordQueryPromise,
            ]);

            const mergedDocsMap = new Map<string, any>();

            // Đọc kết quả từ Vector Search trước (độ ưu tiên cao hơn)
            vectorSnap.forEach((doc: any) => {
              const data = doc.data();
              const uniqueId = doc.id;
              const candidate = {
                id: uniqueId,
                gradeId: data.gradeId,
                subjectId: data.subjectId,
                contentVersion: data.contentVersion,
                status: data.status,
                sourceId: data.sourceId,
                sourceTitle: data.sourceTitle,
                sourceUrl: data.sourceUrl,
                sourceLocator: data.sourceLocator,
                title: data.title,
                parentTitle: data.parentTitle,
                content: data.content,
                chunkType: data.chunkType || "overview",
                difficulty: data.difficulty || "medium",
                source: "vector",
                score: 1.0, // Điểm cơ sở cho vector search
              };
              if (candidateMatchesScope(candidate, { gradeId: gradeId!, subjectId: subjectId!, contentVersion: ragVersion })) {
                mergedDocsMap.set(uniqueId, candidate);
              }
            });

            // Đọc kết quả từ Keyword Search
            keywordSnap.forEach((doc: any) => {
              const data = doc.data();
              const uniqueId = doc.id;
              // Nếu đã có trong map, đánh dấu là match cả hai, nếu chưa thì thêm mới
              if (mergedDocsMap.has(uniqueId)) {
                const docObj = mergedDocsMap.get(uniqueId);
                docObj.source += "+keyword";
                docObj.score += 0.5; // Điểm bonus nếu khớp cả hai
              } else {
                const candidate = {
                  id: uniqueId,
                  gradeId: data.gradeId,
                  subjectId: data.subjectId,
                  contentVersion: data.contentVersion,
                  status: data.status,
                  sourceId: data.sourceId,
                  sourceTitle: data.sourceTitle,
                  sourceUrl: data.sourceUrl,
                  sourceLocator: data.sourceLocator,
                  title: data.title,
                  parentTitle: data.parentTitle,
                  content: data.content,
                  chunkType: data.chunkType || "overview",
                  difficulty: data.difficulty || "medium",
                  source: "keyword",
                  score: 0.7, // Điểm cơ sở cho keyword search
                };
                if (candidateMatchesScope(candidate, { gradeId: gradeId!, subjectId: subjectId!, contentVersion: ragVersion })) {
                  mergedDocsMap.set(uniqueId, candidate);
                }
              }
            });

            const candidateDocs = Array.from(mergedDocsMap.values());

            // Thực hiện Reranking / Scoring trong bộ nhớ
            candidateDocs.forEach((doc) => {
              // 1. Khớp chuyên đề (Topic matching)
              if (topicName && doc.parentTitle) {
                const cleanTopic = removeAccents(topicName.toLowerCase()).trim();
                const cleanParentTitle = removeAccents(doc.parentTitle.toLowerCase()).trim();
                if (cleanParentTitle.includes(cleanTopic) || cleanTopic.includes(cleanParentTitle)) {
                  doc.score += 1.5; // Cộng điểm mạnh nếu trùng hoặc tương tự chuyên đề hiện tại
                }
              }

              // 2. Khớp ý định của học sinh (Intent matching dựa trên query)
              const cleanQuery = rewrittenQuery.toLowerCase();

              // Nếu hỏi về lỗi sai, cảnh báo -> Ưu tiên chunk 'mistakes'
              if (doc.chunkType === "mistakes" && (cleanQuery.includes("sai") || cleanQuery.includes("lỗi") || cleanQuery.includes("nhầm") || cleanQuery.includes("sửa") || cleanQuery.includes("cảnh báo"))) {
                doc.score += 1.0;
              }

              // Nếu hỏi về phương pháp/các bước -> Ưu tiên chunk 'method'
              if (doc.chunkType === "method" && (cleanQuery.includes("làm sao") || cleanQuery.includes("bước") || cleanQuery.includes("cách") || cleanQuery.includes("hướng dẫn") || cleanQuery.includes("phương pháp"))) {
                doc.score += 1.0;
              }

              // Nếu hỏi về ví dụ/mẫu -> Ưu tiên chunk 'example'
              if (doc.chunkType === "example" && (cleanQuery.includes("ví dụ") || cleanQuery.includes("mẫu") || cleanQuery.includes("đề bài") || cleanQuery.includes("phân dạng"))) {
                doc.score += 1.0;
              }

              // 3. Khớp tần suất từ khóa của câu hỏi với tiêu đề chunk (Keyword frequency matching)
              if (queryKeywords && queryKeywords.length > 0 && doc.title) {
                const titleKeywords = extractKeywords(doc.title);
                const matchingKeywordsCount = queryKeywords.filter(k => titleKeywords.includes(k)).length;
                if (matchingKeywordsCount > 0) {
                  doc.score += matchingKeywordsCount * 0.3; // Cộng thêm 0.3 điểm cho mỗi từ khóa trùng khớp trong tiêu đề
                }
              }
            });

            // Sắp xếp giảm dần theo score
            candidateDocs.sort((a, b) => b.score - a.score);

            // Lấy tối đa 2 tài liệu tối ưu nhất để tránh làm phình token context
            const mergedDocuments = candidateDocs.slice(0, 2);
            console.log(`[RAG] Reranked ${candidateDocs.length} candidates. Selected: ${mergedDocuments.map(d => `${d.id}(score:${d.score.toFixed(1)}, source:${d.source}, type:${d.chunkType})`).join(", ")}`);

            if (mergedDocuments.length > 0) {
              for (const document of mergedDocuments) {
                ragProvenance.push(buildRagProvenance(document as RagCandidate, document.source));
              }
              ragContext = `\n\nTÀI LIỆU THAM KHẢO ${RAG_CONTRACT_VERSION} — chỉ dùng các đoạn có provenance dưới đây:\n` + mergedDocuments.map((d, index) => `---
[Nguồn ${index + 1}: ${d.sourceTitle}; locator: ${d.sourceLocator}; phiên bản: ${d.contentVersion}]
[Chủ đề: ${d.parentTitle ? `${d.parentTitle} -> ${d.title}` : d.title}]
Nội dung: ${d.content}`).join("\n") + "\n---";
            } else {
              console.log("[RAG] No matching documents found through Hybrid search.");
            }
          }
        }
      }
    } catch (err) {
      console.error("Lỗi khi thực hiện RAG (sẽ tiếp tục chạy không RAG):", err);
    }
  }

  // 1.25 Session chỉ giữ metadata; nội dung nằm trong các document message cố định kích thước.
  let historySummary = "";
  let finalContents: ChatContent[] | undefined = contents?.slice(-8);
  try {
    if (chatId && gradeId && subjectId) {
      const chatDocRef = db.collection('users').doc(uid)
        .collection('general_chats').doc(`${gradeId}_${subjectId}`)
        .collection('sessions').doc(chatId);
      const chatDoc = await chatDocRef.get();
      const chatData = chatDoc.data() ?? {};
      historySummary = typeof chatData.historySummary === 'string' ? chatData.historySummary.slice(0, 1_000) : '';
      const messageCount = Math.max(0, Number(chatData.messageCount) || 0);
      const summarizedMessageCount = Math.max(0, Number(chatData.summarizedMessageCount) || 0);
      if (messageCount - summarizedMessageCount >= 10 && Date.now() - requestStartedAt < 25_000) {
        const recentSnapshot = await chatDocRef.collection('messages')
          .orderBy('sequence', 'desc').limit(12).get();
        const recentMessages = recentSnapshot.docs.reverse().map(document => document.data());
        const textToCompress = recentMessages.map(message =>
          `${message.role === 'user' ? 'Học sinh' : 'Gia sư'}: ${String(message.text ?? '').slice(0, 4_000)}`
        ).join('\n');
        if (textToCompress) {
          const summaryPrompt = `Tóm tắt hội thoại học tập sau trong một câu tiếng Việt dưới 30 từ, nêu điều đã hiểu và chỗ còn vướng.\n${historySummary ? `Tóm tắt trước: ${historySummary}\n` : ''}${textToCompress}`;
          const summaryStartedAt = Date.now();
          const summaryResponse = await fetchWithTimeout(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }] }) },
            15_000
          );
          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json() as any;
            const newSummary = String(summaryData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().slice(0, 1_000);
            if (newSummary) {
              historySummary = newSummary;
              await chatDocRef.set({ historySummary: newSummary, summarizedMessageCount: messageCount }, { merge: true });
              if (summaryData.usageMetadata) {
                await recordAuxiliaryAiUsage(
                  quotaReservation.requestId, uid, 'summary', 'gemini', 'gemini-3.1-flash-lite',
                  summaryData.usageMetadata, Date.now() - summaryStartedAt
                );
              }
            }
          }
        }
      }
    }
    console.log(`[Compression] Sending summary + ${finalContents?.length || 0} bounded messages.`);
  } catch (err) {
    console.error('Không thể cập nhật tóm tắt phiên; tiếp tục với cửa sổ hội thoại bị giới hạn:', err);
    finalContents = contents?.slice(-8);
  }

  // 1.3 Thiết lập cấu trúc contents & systemInstruction gửi đi
  if (!finalContents && prompt) {
    const parts: ChatPart[] = [{ text: prompt }];
    if (image && image.data && image.mimeType) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
    finalContents = [{ role: "user", parts }];
  } else if (image && image.data && image.mimeType && finalContents) {
    // Clone finalContents để tránh mutate data của client gửi lên
    finalContents = JSON.parse(JSON.stringify(finalContents)) as ChatContent[];
    let lastUserMsg: ChatContent | null = null;
    for (let i = finalContents.length - 1; i >= 0; i--) {
      if (finalContents[i].role === "user") {
        lastUserMsg = finalContents[i];
        break;
      }
    }
    if (lastUserMsg) {
      if (!lastUserMsg.parts) lastUserMsg.parts = [];
      lastUserMsg.parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
  }

  // Kết hợp System Instruction gốc với hồ sơ học sinh, tài liệu RAG và Tóm tắt lịch sử
  let finalSystemInstruction = systemInstruction || "";
  if (profileInstruction) {
    finalSystemInstruction += profileInstruction;
  }
  if (historySummary) {
    finalSystemInstruction += `\n\nTÓM TẮT TIẾN TRÌNH HỘI THOẠI TRƯỚC ĐÓ:\n- ${historySummary}\n`;
  }
  if (ragContext) {
    finalSystemInstruction += ragContext;
  }

  // Xác định và gắn cấp độ gợi ý động (Dynamic Scaffolding) dựa trên số lượt trao đổi
  const scaffoldingLevel = determineScaffoldingLevel(finalContents);
  const cleanSubjectForScaffolding = subjectId || "math";

  // Nhận diện ý định (Intent) của học sinh từ tin nhắn cuối
  const userIntent = detectUserIntent(finalContents);
  const intentOverride = getIntentOverrideInstruction(userIntent);

  if (intentOverride) {
    // Khi học sinh yêu cầu kiến thức tổng hợp → gắn instruction ghi đè Socratic
    finalSystemInstruction += intentOverride;
    // console.log(`[Intent Detection] Detected intent: "${userIntent}" → Applying knowledge-direct override (bypassing Socratic scaffolding level ${scaffoldingLevel})`);
  } else if (scaffoldingLevel > 0) {
    // Mặc định: giữ nguyên Scaffolding Socratic theo cấp độ
    const scaffoldingInstruction = getScaffoldingInstruction(scaffoldingLevel, cleanSubjectForScaffolding);
    finalSystemInstruction += scaffoldingInstruction;
    // console.log(`[Scaffolding] Subject: "${cleanSubjectForScaffolding}", Detected level: ${scaffoldingLevel}/3, Intent: "${userIntent}" (based on ${finalContents?.length || 0} messages)`);
  }

  // Thêm chỉ thị định dạng JSON bắt buộc nếu đây là Chat Tutor
  if (!responseMimeType) {
    finalSystemInstruction += `\n\n[ĐỊNH DẠNG ĐẦU RA BẮT BUỘC]
Bạn phải trả về phản hồi dưới dạng JSON khớp hoàn toàn với cấu trúc sau:
{
  "tutorResponse": "Lời giảng của thầy bằng tiếng Việt (Socratic gợi mở khi giải bài, hoặc cung cấp kiến thức trực tiếp khi học sinh yêu cầu tổng hợp)...",
  "newStrengths": ["...", "..."],
  "newWeaknesses": ["...", "..."],
  "learningSummary": "..."
}
Chú ý:
- [QUY TẮC TRÌNH BÀY & XUỐNG DÒNG BẮT BUỘC TRONG tutorResponse]:
  + TUYỆT ĐỐI KHÔNG viết thành một khối văn bản dài dính liền từ đầu đến cuối.
  + BẮT BUỘC xuống dòng rõ ràng (\\n\\n) giữa các đoạn văn để học sinh dễ đọc.
  + Khi giải thích nhiều ý, quy tắc hoặc phân tích: BẮT BUỘC tách thành danh sách đánh số (1., 2.) hoặc gạch đầu dòng (- ), MỖI Ý NẰM TRÊN MỘT DÒNG RIÊNG.
  + Dùng chữ in đậm **...** cho các từ khóa cốt lõi, công thức hoặc ví dụ quan trọng.
  + Câu hỏi gợi mở Socratic ở cuối BẮT BUỘC nằm ở một đoạn riêng biệt (bắt đầu bằng \\n\\n).
- Lời giảng trong "tutorResponse" phải tuân thủ phương pháp Socratic khi hướng dẫn giải bài, hoặc cung cấp kiến thức trực tiếp có cấu trúc khi học sinh yêu cầu tổng hợp kiến thức. Luôn dùng định dạng LaTeX inline đô la đơn ($...$).
- "newStrengths" và "newWeaknesses" chỉ ghi nhận các điểm mạnh/yếu mới bộc lộ trong lượt chat này của học sinh. Mỗi điểm từ 3-7 từ. Để trống mảng nếu không phát hiện điểm mới nào.
- "learningSummary" là câu tóm tắt tiến trình học lực hiện tại của học sinh môn này sau lượt chat (dưới 30 từ).`;
  }


  let responseText = "";
  let lastError: any = null;
  let successUsage: any = null;
  let selectedModel = "";
  let selectedProvider = "";

  const instructionHash = createHash("md5").update(finalSystemInstruction).digest("hex");

  const groqApiKey = process.env.GROQ_API_KEY;
  let groqSuccess = false;

  if (groqApiKey) {
    const groqModels = ["qwen/qwen3.6-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
    for (const gModel of groqModels) {
      if (!hasProviderBudget()) break;
      try {
        console.log(`[Groq AI] Thử kết nối model: ${gModel}...`);
        const result = await callGroqAiApi(
          groqApiKey,
          gModel,
          finalContents,
          finalSystemInstruction,
          temperature,
          responseMimeType,
          image,
          providerTimeout()
        );
        responseText = result.text;

        successUsage = {
          promptTokenCount: result.usage?.promptTokens || 0,
          candidatesTokenCount: result.usage?.candidatesTokens || 0,
          cachedContentTokenCount: 0,
          totalTokenCount: result.usage?.totalTokens || 0
        };

        selectedModel = gModel;
        selectedProvider = "groq";
        groqSuccess = true;
        console.log(`[Groq AI] Thành công sử dụng model: ${gModel}`);
        break;
      } catch (err: any) {
        console.warn(`[Groq AI] Thử model ${gModel} thất bại:`, err.message || err);
        lastError = err;
      }
    }
  }

  let geminiSuccess = false;

  // Nếu Groq AI không chạy được hoặc không cấu hình key, ta chạy fallback Gemini
  if (!groqSuccess) {
    console.log("[Fallback] Đang chuyển sang gọi các model Gemini...");
    // Chạy vòng lặp thử từng model
    for (const model of FALLBACK_MODELS) {
      if (!hasProviderBudget()) break;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      let cachedContentName = "";
      try {
        const cacheDocId = `${subjectId || "math"}_${model.replace(/\//g, "_")}`;
        const cacheDocRef = db.collection("users").doc(uid).collection("cached_contexts").doc(cacheDocId);
        const cacheDoc = await cacheDocRef.get();
        const now = new Date();

        if (cacheDoc.exists) {
          const cacheData = cacheDoc.data();
          const expiresAt = cacheData?.expiresAt ? new Date(cacheData.expiresAt.seconds ? cacheData.expiresAt.seconds * 1000 : cacheData.expiresAt) : new Date(0);

          if (
            cacheData?.hash === instructionHash &&
            cacheData?.model === model &&
            expiresAt > now
          ) {
            cachedContentName = cacheData.cacheName;
            console.log(`[Cache Hit] Reusing context cache: ${cachedContentName} for model ${model}`);
          }
        }

        if (!cachedContentName) {
          console.log(`[Cache Miss] Creating context cache for model ${model}...`);
          const fullModelName = model.startsWith("models/") ? model : `models/${model}`;
          const cacheCreateUrl = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${apiKey}`;

          const cacheResponse = await fetchWithTimeout(cacheCreateUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: fullModelName,
              contents: [
                {
                  role: "user",
                  parts: [{ text: finalSystemInstruction }]
                }
              ],
              ttl: "600s" // 10 minutes cache
            }),
          }, providerTimeout(8_000));

          if (cacheResponse.ok) {
            const cacheResult = await cacheResponse.json() as any;
            if (cacheResult?.name) {
              cachedContentName = cacheResult.name;
              const expiresAtDate = cacheResult.expireTime ? new Date(cacheResult.expireTime) : new Date(Date.now() + 600 * 1000);

              await cacheDocRef.set({
                cacheName: cachedContentName,
                hash: instructionHash,
                model: model,
                expiresAt: expiresAtDate,
                createdAt: new Date()
              });
              console.log(`[Cache Created] Cache ID: ${cachedContentName}, expires: ${expiresAtDate}`);
            }
          } else {
            const errText = await cacheResponse.text();
            console.warn(`[Cache Failure] Model ${model} does not support caching or error occurred:`, errText);
          }
        }
      } catch (cacheErr) {
        console.error(`[Cache Error] Failed to handle caching for ${model}:`, cacheErr);
      }

      const reqPayload: any = {
        contents: finalContents,
      };

      if (cachedContentName) {
        reqPayload.cachedContent = cachedContentName;
      } else if (finalSystemInstruction) {
        reqPayload.systemInstruction = {
          parts: [{ text: finalSystemInstruction }],
        };
      }

      reqPayload.generationConfig = {};
      if (typeof temperature === "number") {
        reqPayload.generationConfig.temperature = temperature;
      }

      if (responseMimeType) {
        reqPayload.generationConfig.responseMimeType = responseMimeType;
        if (responseSchema) {
          reqPayload.generationConfig.responseSchema = responseSchema;
        }
      } else {
        // Bắt buộc đầu ra JSON cấu trúc đối với Chat Tutor
        reqPayload.generationConfig.responseMimeType = "application/json";
        reqPayload.generationConfig.responseSchema = {
          type: "OBJECT",
          properties: {
            tutorResponse: {
              type: "STRING"
            },
            newStrengths: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            newWeaknesses: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            learningSummary: {
              type: "STRING"
            }
          },
          required: ["tutorResponse", "newStrengths", "newWeaknesses", "learningSummary"]
        };
      }

      try {
        const response = await fetchWithTimeout(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqPayload),
        }, providerTimeout());

        // Nếu gặp lỗi quá tần suất gọi (429), ghi log và tiếp tục thử model tiếp theo
        if (response.status === 429) {
          console.warn(`Model ${model} đã hết hạn mức (429). Đang tự động chuyển sang model dự phòng...`);
          lastError = new Error(`Model ${model} trả về lỗi quá hạn mức (429)`);
          continue;
        }

        if (!response.ok) {
          const errData = (await response.json().catch(() => ({}))) as any;
          const errMsg = errData?.error?.message || `HTTP error! status: ${response.status}`;
          lastError = new Error(`Lỗi từ ${model}: ${errMsg}`);
          continue;
        }

        const data = (await response.json()) as any;
        responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
          lastError = new Error(`Không nhận được văn bản trả lời từ ${model}`);
          continue;
        }

        // Lấy dữ liệu token tiêu thụ của model chạy thành công
        successUsage = data.usageMetadata;
        selectedModel = model;
        selectedProvider = "gemini";
        geminiSuccess = true;
        console.log(`Gọi thành công model: ${model}`);
        break; // Gọi thành công, thoát khỏi vòng lặp thử model
      } catch (err) {
        console.error(`Lỗi kết nối khi gọi model ${model}:`, err);
        lastError = err;
      }
    }
  }

  const mistralApiKey = process.env.MISTRAL_API_KEY;

  // Nếu Groq và Gemini đều thất bại và có Mistral API key, ta gọi thử Mistral cuối cùng
  if (!groqSuccess && !geminiSuccess && mistralApiKey) {
    const mistralModels = ["mistral-medium-latest", "mistral-small-2603"];
    for (const mModel of mistralModels) {
      if (!hasProviderBudget()) break;
      try {
        console.log(`[Mistral AI] Thử kết nối model: ${mModel}...`);
        const result = await callMistralAiApi(
          mistralApiKey,
          mModel,
          finalContents,
          finalSystemInstruction,
          temperature,
          responseMimeType,
          image,
          providerTimeout()
        );
        responseText = result.text;

        successUsage = {
          promptTokenCount: result.usage?.promptTokens || 0,
          candidatesTokenCount: result.usage?.candidatesTokens || 0,
          cachedContentTokenCount: 0,
          totalTokenCount: result.usage?.totalTokens || 0
        };

        selectedModel = mModel;
        selectedProvider = "mistral";
        console.log(`[Mistral AI] Thành công sử dụng model: ${mModel}`);
        break;
      } catch (err: any) {
        console.warn(`[Mistral AI] Thử model ${mModel} thất bại:`, err.message || err);
        lastError = err;
      }
    }
  }

  // Nếu duyệt qua toàn bộ danh sách mà vẫn không lấy được kết quả
  if (!responseText) {
    await finalizeAiUsage(quotaReservation.requestId, {
      status: 'failed', taskType, durationMs: Date.now() - requestStartedAt,
      errorCode: lastError instanceof Error ? lastError.name : 'provider_failure',
      provenanceCount: ragProvenance.length,
    }).catch(error => console.error('Không thể hoàn tất log AI thất bại:', error));
    throw new HttpsError(
      "internal",
      `Tất cả các model AI dự phòng đều đang bận hoặc hết hạn mức. Chi tiết lỗi cuối: ${lastError?.message}`
    );
  }

  // Nếu là cuộc gọi chat (không phải bài tự luận cần JSON từ frontend), bóc tách JSON và tự động cập nhật profile
  if (!responseMimeType) {
    try {
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
      }
      // Chuẩn hóa các dấu backslash đơn (chưa được escape) trước các lệnh LaTeX như \times, \frac để tránh bị JSON.parse chuyển đổi thành phím Tab, phím Form Feed...
      cleanJson = cleanJson.replace(/(?<!\\)\\([a-zA-Z]+)/g, (match, p1) => {
        if (p1 === 'n') {
          return match;
        }
        return '\\\\' + p1;
      });
      const parsed = JSON.parse(cleanJson);
      responseText = parsed.tutorResponse || responseText;

      if (uid) {
        const hasNewData = (parsed.newStrengths && parsed.newStrengths.length > 0) ||
          (parsed.newWeaknesses && parsed.newWeaknesses.length > 0) ||
          (parsed.learningSummary && parsed.learningSummary !== studentProfile?.[subjectId || "math"]?.learningSummary);

        if (hasNewData) {
          const cleanSubjectId = subjectId || "math";
          const subProfile = studentProfile?.[cleanSubjectId] || {};
          const oldStrengths = subProfile.strengths || [];
          const oldWeaknesses = subProfile.weaknesses || [];
          const oldSummary = subProfile.learningSummary || "";

          const mergeAndUnique = (oldArr: string[], newArr: any[]) => {
            const combined = [...oldArr, ...newArr.map((s) => String(s).trim().slice(0, 100))].filter(Boolean);
            return [...new Set(combined)].slice(-50);
          };

          const updatedStrengths = mergeAndUnique(oldStrengths, parsed.newStrengths || []);
          const updatedWeaknesses = mergeAndUnique(oldWeaknesses, parsed.newWeaknesses || []);
          const finalSummary = parsed.learningSummary || oldSummary;

          await db.collection("student_profiles").doc(uid).set({
            [cleanSubjectId]: {
              strengths: updatedStrengths,
              weaknesses: updatedWeaknesses,
              learningSummary: finalSummary,
              lastUpdated: new Date()
            },
            lastUpdated: new Date()
          }, { merge: true });

          console.log(`[Memory] Merged and updated student profile directly via Tutor Socratic response.`);
        }
      }
    } catch (parseErr) {
      console.error("Lỗi phân tích JSON từ phản hồi Tutor gộp:", responseText, parseErr);
    }
  }

  try {
    await finalizeAiUsage(quotaReservation.requestId, {
      status: 'succeeded', taskType, provider: selectedProvider, model: selectedModel,
      usage: successUsage, durationMs: Date.now() - requestStartedAt,
      provenanceCount: ragProvenance.length,
    });
    await recordProductMetric(uid, {
      ai: true,
      aiCostUsd: estimateAiCostUsd(
        selectedProvider,
        Number(successUsage?.promptTokenCount) || 0,
        Number(successUsage?.candidatesTokenCount) || 0
      ),
    });
  } catch (err) {
    console.error("Lỗi ghi telemetry AI:", err);
  }

  return {
    text: responseText,
    usage: successUsage ? {
      promptTokens: successUsage.promptTokenCount || 0,
      candidatesTokens: successUsage.candidatesTokenCount || 0,
      cachedTokens: successUsage.cachedContentTokenCount || 0,
      totalTokens: successUsage.totalTokenCount || 0,
    } : null,
    requestId: quotaReservation.requestId,
    quota: { day: quotaReservation.day, remaining: quotaReservation.remaining },
    rag: { contractVersion: RAG_CONTRACT_VERSION, contentVersion: ragVersion, provenance: ragProvenance },
  };
});
