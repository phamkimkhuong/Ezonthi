import { db, DAILY_REQUEST_LIMIT } from '../config.js';
import { GeminiProxyRequest, ChatContent, ChatPart } from '../types.js';
import { hasActivePremium } from './entitlements.js';
import {
  AiTaskType,
  fetchWithTimeout,
  recordAuxiliaryAiUsage,
  reserveAiQuota,
} from './aiControl.js';
import { isRelevantToTopic, shouldRewriteQuery } from './relevance.js';
import {
  extractKeywords,
  getEmbedding,
  removeAccents,
  rewriteQuery,
} from './gemini.js';
import {
  buildRagProvenance,
  candidateMatchesScope,
  DEFAULT_RAG_CONTENT_VERSION,
  RAG_CONTRACT_VERSION,
  type RagCandidate,
  type RagProvenance,
} from './ragPolicy.js';
import {
  determineScaffoldingLevel,
  detectUserIntent,
  getIntentOverrideInstruction,
  getScaffoldingInstruction,
} from './scaffolding.js';

export interface PrepareAiContextOptions {
  uid: string;
  data: GeminiProxyRequest;
  apiKey: string;
  requestStartedAt: number;
  isStreaming?: boolean;
}

export interface PreparedAiContext {
  uid: string;
  data: GeminiProxyRequest;
  taskType: AiTaskType;
  isPremium: boolean;
  quotaReservation: {
    requestId: string;
    day: string;
    used: number;
    remaining: number;
  };
  finalContents: ChatContent[];
  finalSystemInstruction: string;
  ragProvenance: RagProvenance[];
  studentProfile: any;
  providerDeadlineAt: number;
  hasProviderBudget: () => boolean;
  providerTimeout: (cap?: number) => number;
}

export async function prepareAiContext(options: PrepareAiContextOptions): Promise<PreparedAiContext> {
  const { uid, data, apiKey, requestStartedAt, isStreaming = false } = options;
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
    topicName,
    chatId,
    taskType: requestedTaskType,
  } = data;

  const taskType: AiTaskType = requestedTaskType ?? (responseMimeType ? 'proof_grading' : 'tutor');
  const providerDeadlineAt = requestStartedAt + 52_000;
  const hasProviderBudget = () => Date.now() < providerDeadlineAt - 1_000;
  const providerTimeout = (cap = 15_000) => Math.max(1_000, Math.min(cap, providerDeadlineAt - Date.now()));

  // 1. Tải hồ sơ năng lực học sinh (Long-term Memory)
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

  // 2. Kiểm tra xem người dùng có phải là Premium hay không
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

  // 3. Giữ chỗ quota bằng transaction trước khi gọi provider
  const dailyLimit = isPremium ? DAILY_REQUEST_LIMIT : 20;
  const quotaReservation = await reserveAiQuota(uid, dailyLimit, taskType);

  // 4. Thực hiện RAG (Retrieval-Augmented Generation) nếu được yêu cầu
  let ragContext = "";
  let queryText = "";
  const ragProvenance: RagProvenance[] = [];

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

            const [vectorSnap, keywordSnap] = await Promise.all([
              vectorQuery.get(),
              keywordQueryPromise,
            ]);

            const mergedDocsMap = new Map<string, any>();

            vectorSnap.forEach((doc: any) => {
              const d = doc.data();
              const uniqueId = doc.id;
              const candidate = {
                id: uniqueId,
                gradeId: d.gradeId,
                subjectId: d.subjectId,
                contentVersion: d.contentVersion,
                status: d.status,
                sourceId: d.sourceId,
                sourceTitle: d.sourceTitle,
                sourceUrl: d.sourceUrl,
                sourceLocator: d.sourceLocator,
                title: d.title,
                parentTitle: d.parentTitle,
                content: d.content,
                chunkType: d.chunkType || "overview",
                difficulty: d.difficulty || "medium",
                source: "vector",
                score: 1.0,
              };
              if (candidateMatchesScope(candidate, { gradeId: gradeId!, subjectId: subjectId!, contentVersion: ragVersion })) {
                mergedDocsMap.set(uniqueId, candidate);
              }
            });

            keywordSnap.forEach((doc: any) => {
              const d = doc.data();
              const uniqueId = doc.id;
              if (mergedDocsMap.has(uniqueId)) {
                const docObj = mergedDocsMap.get(uniqueId);
                docObj.source += "+keyword";
                docObj.score += 0.5;
              } else {
                const candidate = {
                  id: uniqueId,
                  gradeId: d.gradeId,
                  subjectId: d.subjectId,
                  contentVersion: d.contentVersion,
                  status: d.status,
                  sourceId: d.sourceId,
                  sourceTitle: d.sourceTitle,
                  sourceUrl: d.sourceUrl,
                  sourceLocator: d.sourceLocator,
                  title: d.title,
                  parentTitle: d.parentTitle,
                  content: d.content,
                  chunkType: d.chunkType || "overview",
                  difficulty: d.difficulty || "medium",
                  source: "keyword",
                  score: 0.7,
                };
                if (candidateMatchesScope(candidate, { gradeId: gradeId!, subjectId: subjectId!, contentVersion: ragVersion })) {
                  mergedDocsMap.set(uniqueId, candidate);
                }
              }
            });

            const candidateDocs = Array.from(mergedDocsMap.values());

            candidateDocs.forEach((candidateDoc) => {
              if (topicName && candidateDoc.parentTitle) {
                const cleanTopic = removeAccents(topicName.toLowerCase()).trim();
                const cleanParentTitle = removeAccents(candidateDoc.parentTitle.toLowerCase()).trim();
                if (cleanParentTitle.includes(cleanTopic) || cleanTopic.includes(cleanParentTitle)) {
                  candidateDoc.score += 1.5;
                }
              }

              const cleanQuery = rewrittenQuery.toLowerCase();
              if (candidateDoc.chunkType === "mistakes" && (cleanQuery.includes("sai") || cleanQuery.includes("lỗi") || cleanQuery.includes("nhầm") || cleanQuery.includes("sửa") || cleanQuery.includes("cảnh báo"))) {
                candidateDoc.score += 1.0;
              }
              if (candidateDoc.chunkType === "method" && (cleanQuery.includes("làm sao") || cleanQuery.includes("bước") || cleanQuery.includes("cách") || cleanQuery.includes("hướng dẫn") || cleanQuery.includes("phương pháp"))) {
                candidateDoc.score += 1.0;
              }
              if (candidateDoc.chunkType === "example" && (cleanQuery.includes("ví dụ") || cleanQuery.includes("mẫu") || cleanQuery.includes("đề bài") || cleanQuery.includes("phân dạng"))) {
                candidateDoc.score += 1.0;
              }
              if (queryKeywords && queryKeywords.length > 0 && candidateDoc.title) {
                const titleKeywords = extractKeywords(candidateDoc.title);
                const matchingKeywordsCount = queryKeywords.filter(k => titleKeywords.includes(k)).length;
                if (matchingKeywordsCount > 0) {
                  candidateDoc.score += matchingKeywordsCount * 0.3;
                }
              }
            });

            candidateDocs.sort((a, b) => b.score - a.score);
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

  // 5. Tóm tắt phiên hội thoại dài (Session compression)
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
  } catch (err) {
    console.error('Không thể cập nhật tóm tắt phiên; tiếp tục với cửa sổ hội thoại bị giới hạn:', err);
    finalContents = contents?.slice(-8);
  }

  // 6. Xử lý ảnh đính kèm
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

  // 7. Tổng hợp System Instruction
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

  // 8. Dynamic Scaffolding & Intent Detection
  const scaffoldingLevel = determineScaffoldingLevel(finalContents);
  const cleanSubjectForScaffolding = subjectId || "math";
  const userIntent = detectUserIntent(finalContents);
  const intentOverride = getIntentOverrideInstruction(userIntent);

  if (intentOverride) {
    finalSystemInstruction += intentOverride;
  } else if (scaffoldingLevel > 0) {
    const scaffoldingInstruction = getScaffoldingInstruction(scaffoldingLevel, cleanSubjectForScaffolding);
    finalSystemInstruction += scaffoldingInstruction;
  }

  // 9. Output Format Instructions
  if (isStreaming) {
    // Với Streaming SSE: Hướng dẫn xuất trực tiếp văn bản Markdown/LaTeX để client hiển thị gõ chữ ngay lập tức
    finalSystemInstruction += `\n\n[QUY TẮC PHẢN HỒI GIA SƯ TRỰC TIẾP]
- Xuất câu trả lời trực tiếp dưới dạng văn bản Markdown chuẩn (KHÔNG bọc trong đối tượng JSON).
- [QUY TẮC TRÌNH BÀY & XUỐNG DÒNG BẮT BUỘC]:
  + TUYỆT ĐỐI KHÔNG viết thành một khối văn bản dài dính liền từ đầu đến cuối.
  + BẮT BUỘC xuống dòng rõ ràng (\\n\\n) giữa các đoạn văn để học sinh dễ đọc.
  + Khi giải thích nhiều ý, quy tắc hoặc phân tích: BẮT BUỘC tách thành danh sách đánh số (1., 2.) hoặc gạch đầu dòng (- ), MỖI Ý NẰM TRÊN MỘT DÒNG RIÊNG.
  + Dùng chữ in đậm **...** cho các từ khóa cốt lõi, công thức hoặc ví dụ quan trọng.
  + Câu hỏi gợi mở Socratic ở cuối BẮT BUỘC nằm ở một đoạn riêng biệt (bắt đầu bằng \\n\\n).
- Lời giảng tuân thủ phương pháp Socratic khi hướng dẫn giải bài, hoặc cung cấp kiến thức trực tiếp có cấu trúc khi học sinh yêu cầu tổng hợp kiến thức. Luôn dùng định dạng LaTeX inline đô la đơn ($...$).`;
  } else if (!responseMimeType) {
    // Với Non-streaming: Giữ nguyên định dạng JSON phục vụ backward compatibility cho các client cũ
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

  return {
    uid,
    data,
    taskType,
    isPremium,
    quotaReservation,
    finalContents: finalContents || [],
    finalSystemInstruction,
    ragProvenance,
    studentProfile,
    providerDeadlineAt,
    hasProviderBudget,
    providerTimeout,
  };
}
