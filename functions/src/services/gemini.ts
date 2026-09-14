import { ChatContent } from "../types.js";
import { fetchWithTimeout } from './aiControl.js';

// Models prioritized by the user
export const FALLBACK_MODELS = [
  "gemini-3.5-flash",      // Priority 1
  "gemini-3-flash",        // Priority 2
  "gemini-3.1-flash-lite", // Priority 3
  "gemini-2.5-flash-lite", // Priority 4
  "gemini-2.5-flash",      // Priority 5
];

export async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: {
        parts: [{ text }],
      },
      outputDimensionality: 1536,
    }),
  }, 15_000);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to generate embedding: ${errText}`);
  }

  const data = (await response.json()) as any;
  return data?.embedding?.values;
}

export function removeAccents(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const cleanWithAccents = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, " ");
  const cleanNoAccents = removeAccents(cleanWithAccents);

  const wordsWithAccents = cleanWithAccents.split(/\s+/).filter((w) => w.length >= 2);
  const wordsNoAccents = cleanNoAccents.split(/\s+/).filter((w) => w.length >= 2);

  const combined = [...wordsWithAccents, ...wordsNoAccents];
  return [...new Set(combined)].slice(0, 30);
}

export async function summarizeHistory(
  historyToCompress: ChatContent[],
  apiKey: string
): Promise<string> {
  const textToCompress = historyToCompress
    .map((h) => {
      const roleName = h.role === "user" ? "Học sinh" : "Gia sư";
      const text = h.parts?.map((p) => p.text).join(" ") || "";
      return `${roleName}: ${text}`;
    })
    .join("\n");

  const prompt = `Bạn là một trợ lý AI hỗ trợ tóm tắt hội thoại học tập.
Hãy đọc lịch sử hội thoại ôn thi lớp 10 dưới đây và tóm tắt ngắn gọn trạng thái hiện tại của cuộc hội thoại trong đúng 1 CÂU DUY NHẤT.

Yêu cầu tóm tắt:
- Chỉ rõ học sinh đã nắm được kiến thức gì và hiện tại đang gặp khó khăn hay thắc mắc ở phần kiến thức cụ thể nào.
- Trả về duy nhất 1 câu tóm tắt bằng tiếng Việt, ngắn gọn (dưới 30 từ), không có lời dẫn hay giải thích gì thêm.

Hội thoại cần tóm tắt:
${textToCompress}

Câu tóm tắt duy nhất:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }, 15_000);

    if (!response.ok) {
      console.warn("LLM summarizeHistory trả về lỗi HTTP:", response.status);
      return "";
    }

    const data = (await response.json()) as any;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  } catch (err) {
    console.error("Lỗi khi tóm tắt lịch sử chat:", err);
    return "";
  }
}

export async function rewriteQuery(
  chatHistory: ChatContent[],
  currentMessage: string,
  apiKey: string
): Promise<{ rewrittenQuery: string; usageMetadata?: any }> {
  let historyText = "";
  if (chatHistory && chatHistory.length > 0) {
    historyText = chatHistory
      .map((h) => {
        const roleName = h.role === "user" ? "Học sinh" : "Gia sư";
        const text = h.parts?.map((p) => p.text).join(" ") || "";
        return `${roleName}: ${text}`;
      })
      .join("\n");
  }

  const prompt = `Bạn là một trợ lý AI phân tích ngữ cảnh hội thoại ôn thi lớp 10 môn Toán & Tiếng Anh.
Nhiệm vụ của bạn là: Đọc lịch sử trò chuyện và tin nhắn mới nhất của học sinh dưới đây, sau đó VIẾT LẠI tin nhắn mới nhất thành một câu truy vấn tìm kiếm tri thức (search query) độc lập, rõ ràng và đầy đủ ngữ cảnh để tra cứu tài liệu lý thuyết.

Yêu cầu:
- Câu truy vấn mới phải chứa đầy đủ từ khóa chuyên môn (ví dụ: tên thì ngữ pháp, tên định lý, dạng toán, công thức).
- Nếu tin nhắn mới nhất là câu chào hỏi, xã giao (ví dụ: "chào thầy", "em hiểu rồi", "cảm ơn ạ") hoặc KHÔNG chứa bất kỳ thắc mắc kiến thức nào cần tra cứu, hãy trả về chính xác từ khóa "NONE".
- Chỉ trả về duy nhất câu truy vấn được viết lại (hoặc "NONE"), tuyệt đối không giải thích, không thêm ký tự markdown hay từ ngữ thừa thãi.

Lịch sử trò chuyện:
${historyText || "(Không có lịch sử)"}

Tin nhắn mới nhất của học sinh: "${currentMessage}"

Câu truy vấn tìm kiếm tri thức được viết lại (hoặc "NONE"):`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
  try {
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    }, 15_000);

    if (!response.ok) {
      console.warn("LLM rewriteQuery trả về lỗi HTTP:", response.status);
      return { rewrittenQuery: currentMessage };
    }

    const data = (await response.json()) as any;
    const rewritten = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return {
      rewrittenQuery: rewritten || currentMessage,
      usageMetadata: data.usageMetadata
    };
  } catch (err) {
    console.error("Lỗi khi viết lại query với LLM:", err);
    return { rewrittenQuery: currentMessage };
  }
}
