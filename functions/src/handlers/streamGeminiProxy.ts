import { onRequest } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { createHash } from "crypto";
import { db } from "../config.js";
import { FALLBACK_MODELS } from "../services/gemini.js";
import {
  AiQuotaExceededError,
  AiRequestValidationError,
  estimateAiCostUsd,
  fetchWithTimeout,
  finalizeAiUsage,
  validateAiRequest,
} from "../services/aiControl.js";
import { recordProductMetric } from "../services/productMetrics.js";
import {
  DEFAULT_RAG_CONTENT_VERSION,
  RAG_CONTRACT_VERSION,
} from "../services/ragPolicy.js";
import { prepareAiContext } from "../services/aiContext.js";
import {
  streamGeminiAiApi,
  streamGroqAiApi,
  streamMistralAiApi,
  type StreamResult,
} from "../services/aiStreamProviders.js";

export const streamGeminiProxy = onRequest({
  cors: true,
  timeoutSeconds: 60,
  memory: "1GiB",
  maxInstances: 40,
}, async (req, res) => {
  // 1. Chỉ chấp nhận phương thức POST (CORS OPTIONS do middleware tự xử lý)
  if (req.method !== "POST") {
    res.status(405).json({ error: "method-not-allowed", message: "Chỉ hỗ trợ phương thức POST." });
    return;
  }

  // 2. Kiểm tra xác thực Bearer Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthenticated", message: "Yêu cầu đăng nhập để sử dụng tính năng AI." });
    return;
  }

  const idToken = authHeader.substring(7);
  let uid: string;
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    uid = decodedToken.uid;
  } catch (authError) {
    console.warn("Lỗi xác thực Firebase ID Token trong streamGeminiProxy:", authError);
    res.status(401).json({ error: "unauthenticated", message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
    return;
  }

  // 3. Kiểm tra API Key máy chủ
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "failed-precondition", message: "API Key chưa được cấu hình ở phía máy chủ." });
    return;
  }

  // 4. Validate payload yêu cầu
  let data;
  try {
    data = validateAiRequest(req.body);
  } catch (error) {
    if (error instanceof AiRequestValidationError) {
      res.status(400).json({ error: "invalid-argument", message: error.message });
      return;
    }
    res.status(400).json({ error: "invalid-argument", message: "Dữ liệu yêu cầu không hợp lệ." });
    return;
  }

  const requestStartedAt = Date.now();

  // 5. Thiết lập Header Server-Sent Events (SSE)
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const sendEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
    if (typeof (res as any).flush === "function") {
      (res as any).flush();
    }
  };

  // 6. Chuẩn bị ngữ cảnh AI (RAG, Profile, Scaffolding, Intent, Quota)
  let context;
  try {
    context = await prepareAiContext({
      uid,
      data,
      apiKey,
      requestStartedAt,
      isStreaming: true,
    });
  } catch (err) {
    if (err instanceof AiQuotaExceededError) {
      sendEvent("error", {
        code: "resource-exhausted",
        message: "Bạn đã dùng hết hạn mức AI hàng ngày.",
      });
      res.end();
      return;
    }
    console.error("Lỗi chuẩn bị ngữ cảnh AI cho stream:", err);
    sendEvent("error", {
      code: "internal",
      message: "Không thể khởi tạo ngữ cảnh gia sư AI.",
    });
    res.end();
    return;
  }

  const {
    taskType,
    quotaReservation,
    finalContents,
    finalSystemInstruction,
    ragProvenance,
    hasProviderBudget,
    providerTimeout,
  } = context;

  const { subjectId, temperature, image } = data;
  const instructionHash = createHash("md5").update(finalSystemInstruction).digest("hex");

  let hasEmittedChunk = false;
  let successResult: StreamResult | null = null;
  let selectedModel = "";
  let selectedProvider = "";
  let lastError: any = null;

  // Lắng nghe đóng kết nối từ phía client
  let isClientConnected = true;
  req.on("close", () => {
    isClientConnected = false;
  });

  const onChunkCallback = (chunkText: string) => {
    if (!isClientConnected) return;
    hasEmittedChunk = true;
    sendEvent("chunk", { text: chunkText });
  };

  // 7. Cascade Provider 1: Groq AI Streaming
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    const groqModels = ["qwen/qwen3.6-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
    for (const gModel of groqModels) {
      if (!hasProviderBudget() || !isClientConnected) break;
      try {
        console.log(`[Groq AI Stream] Kết nối model: ${gModel}...`);
        const result = await streamGroqAiApi(
          groqApiKey,
          gModel,
          finalContents,
          finalSystemInstruction,
          temperature,
          image,
          providerTimeout(),
          onChunkCallback
        );
        successResult = result;
        selectedModel = gModel;
        selectedProvider = "groq";
        console.log(`[Groq AI Stream] Thành công với model: ${gModel}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Groq AI Stream] Lỗi model ${gModel}:`, err.message || err);
        // Nếu đã lỡ stream chữ ra cho client, không thể fallback model khác
        if (hasEmittedChunk) break;
      }
    }
  }

  // 8. Cascade Provider 2: Gemini Streaming
  if (!successResult && !hasEmittedChunk && isClientConnected) {
    console.log("[Gemini Stream Fallback] Đang kết nối các model Gemini...");
    for (const model of FALLBACK_MODELS) {
      if (!hasProviderBudget() || !isClientConnected) break;

      // Xử lý Cached Content nếu có
      let cachedContentName = "";
      try {
        const cacheDocId = `${subjectId || "math"}_${model.replace(/\//g, "_")}`;
        const cacheDocRef = db.collection("users").doc(uid).collection("cached_contexts").doc(cacheDocId);
        const cacheDoc = await cacheDocRef.get();
        const now = new Date();

        if (cacheDoc.exists) {
          const cacheData = cacheDoc.data();
          const expiresAt = cacheData?.expiresAt
            ? new Date(cacheData.expiresAt.seconds ? cacheData.expiresAt.seconds * 1000 : cacheData.expiresAt)
            : new Date(0);

          if (
            cacheData?.hash === instructionHash &&
            cacheData?.model === model &&
            expiresAt > now
          ) {
            cachedContentName = cacheData.cacheName;
          }
        }

        if (!cachedContentName) {
          const fullModelName = model.startsWith("models/") ? model : `models/${model}`;
          const cacheCreateUrl = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${apiKey}`;

          const cacheResponse = await fetchWithTimeout(cacheCreateUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: fullModelName,
              contents: [{ role: "user", parts: [{ text: finalSystemInstruction }] }],
              ttl: "600s",
            }),
          }, providerTimeout(8_000));

          if (cacheResponse.ok) {
            const cacheResult = (await cacheResponse.json()) as any;
            if (cacheResult?.name) {
              cachedContentName = cacheResult.name;
              const expiresAtDate = cacheResult.expireTime
                ? new Date(cacheResult.expireTime)
                : new Date(Date.now() + 600 * 1000);

              await cacheDocRef.set({
                cacheName: cachedContentName,
                hash: instructionHash,
                model,
                expiresAt: expiresAtDate,
                createdAt: new Date(),
              });
            }
          }
        }
      } catch (cacheErr) {
        console.warn(`[Gemini Cache Warning] ${model}:`, cacheErr);
      }

      try {
        console.log(`[Gemini Stream] Kết nối model: ${model}...`);
        const result = await streamGeminiAiApi(
          apiKey,
          model,
          finalContents,
          finalSystemInstruction,
          temperature,
          cachedContentName,
          providerTimeout(),
          onChunkCallback
        );
        successResult = result;
        selectedModel = model;
        selectedProvider = "gemini";
        console.log(`[Gemini Stream] Thành công với model: ${model}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Stream] Lỗi model ${model}:`, err.message || err);
        if (hasEmittedChunk) break;
      }
    }
  }

  // 9. Cascade Provider 3: Mistral AI Streaming
  const mistralApiKey = process.env.MISTRAL_API_KEY;
  if (!successResult && !hasEmittedChunk && mistralApiKey && isClientConnected) {
    const mistralModels = ["mistral-medium-latest", "mistral-small-2603"];
    for (const mModel of mistralModels) {
      if (!hasProviderBudget() || !isClientConnected) break;
      try {
        console.log(`[Mistral AI Stream] Kết nối model: ${mModel}...`);
        const result = await streamMistralAiApi(
          mistralApiKey,
          mModel,
          finalContents,
          finalSystemInstruction,
          temperature,
          image,
          providerTimeout(),
          onChunkCallback
        );
        successResult = result;
        selectedModel = mModel;
        selectedProvider = "mistral";
        console.log(`[Mistral AI Stream] Thành công với model: ${mModel}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Mistral AI Stream] Lỗi model ${mModel}:`, err.message || err);
        if (hasEmittedChunk) break;
      }
    }
  }

  // 10. Xử lý kết quả hoặc lỗi cuối cùng
  if (!successResult) {
    if (!hasEmittedChunk) {
      await finalizeAiUsage(quotaReservation.requestId, {
        status: "failed",
        taskType,
        durationMs: Date.now() - requestStartedAt,
        errorCode: lastError instanceof Error ? lastError.name : "provider_failure",
        provenanceCount: ragProvenance.length,
      }).catch((logErr) => console.error("Lỗi finalizeAiUsage thất bại:", logErr));

      sendEvent("error", {
        code: "provider-exhausted",
        message: `Tất cả các model AI dự phòng đều đang bận hoặc hết hạn mức. Chi tiết: ${lastError?.message || "Không thể kết nối"}`,
      });
    } else {
      sendEvent("error", {
        code: "stream-interrupted",
        message: "Đường truyền AI bị gián đoạn giữa chừng. Bạn có thể gửi lại tin nhắn nhé!",
      });
    }
    res.end();
    return;
  }

  // 11. Ghi nhận Telemetry & Hoàn tất Stream
  try {
    await finalizeAiUsage(quotaReservation.requestId, {
      status: "succeeded",
      taskType,
      provider: selectedProvider,
      model: selectedModel,
      usage: successResult.usage,
      durationMs: Date.now() - requestStartedAt,
      provenanceCount: ragProvenance.length,
    });

    await recordProductMetric(uid, {
      ai: true,
      aiCostUsd: estimateAiCostUsd(
        selectedProvider,
        Number(successResult.usage.promptTokenCount) || 0,
        Number(successResult.usage.candidatesTokenCount) || 0
      ),
    });
  } catch (telemetryErr) {
    console.error("Lỗi ghi nhận telemetry AI sau khi stream hoàn tất:", telemetryErr);
  }

  sendEvent("done", {
    text: successResult.text,
    usage: {
      promptTokens: successResult.usage.promptTokenCount || 0,
      candidatesTokens: successResult.usage.candidatesTokenCount || 0,
      cachedTokens: successResult.usage.cachedContentTokenCount || 0,
      totalTokens: successResult.usage.totalTokenCount || 0,
    },
    requestId: quotaReservation.requestId,
    quota: {
      day: quotaReservation.day,
      remaining: quotaReservation.remaining,
    },
    rag: {
      contractVersion: RAG_CONTRACT_VERSION,
      contentVersion: data.ragVersion || DEFAULT_RAG_CONTENT_VERSION,
      provenance: ragProvenance,
    },
  });

  res.end();
});
