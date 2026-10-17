import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../config.js";
import { GeminiProxyRequest } from "../types.js";
import { FALLBACK_MODELS } from "../services/gemini.js";
import { createHash } from "crypto";
import { callGroqAiApi, callMistralAiApi } from "../services/aiProviders.js";
import {
  AiQuotaExceededError,
  AiRequestValidationError,
  estimateAiCostUsd,
  fetchWithTimeout,
  finalizeAiUsage,
  validateAiRequest,
} from '../services/aiControl.js';
import {
  DEFAULT_RAG_CONTENT_VERSION,
  RAG_CONTRACT_VERSION,
} from '../services/ragPolicy.js';
import { recordProductMetric } from '../services/productMetrics.js';
import { prepareAiContext } from '../services/aiContext.js';

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
  const requestStartedAt = Date.now();
  let context;
  try {
    context = await prepareAiContext({
      uid,
      data,
      apiKey,
      requestStartedAt,
      isStreaming: false,
    });
  } catch (error) {
    if (error instanceof AiQuotaExceededError) {
      throw new HttpsError('resource-exhausted', 'Bạn đã dùng hết hạn mức AI hàng ngày.');
    }
    console.error('Không thể giữ chỗ quota AI:', error);
    throw new HttpsError('unavailable', 'Chưa thể xác nhận hạn mức AI. Vui lòng thử lại.');
  }

  const {
    taskType,
    quotaReservation,
    finalContents,
    finalSystemInstruction,
    ragProvenance,
    studentProfile,
    hasProviderBudget,
    providerTimeout,
  } = context;

  const {
    subjectId,
    image,
    responseMimeType,
    responseSchema,
    temperature,
    ragVersion = DEFAULT_RAG_CONTENT_VERSION,
  } = data;

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
