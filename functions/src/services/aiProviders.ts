import { ChatContent } from "../types.js";
import { fetchWithTimeout } from './aiControl.js';


export async function callGroqAiApi(
  apiKey: string,
  modelName: string,
  finalContents: ChatContent[] | undefined,
  finalSystemInstruction: string,
  temperature: number | undefined,
  responseMimeType: string | undefined,
  image: { mimeType: string; data: string } | undefined,
  timeoutMs = 15_000
): Promise<{ text: string; usage: any }> {
  const messages: Array<{ role: string; content: any }> = [];

  // 1. System instruction
  if (finalSystemInstruction) {
    messages.push({
      role: "system",
      content: finalSystemInstruction
    });
  }

  // 2. Chat history (contents)
  if (finalContents && finalContents.length > 0) {
    finalContents.forEach(c => {
      const role = c.role === "model" ? "assistant" : "user";
      const textParts = c.parts.filter(p => p.text).map(p => p.text).join("\n");
      const imageParts = c.parts.filter(p => p.inlineData);
      
      if (imageParts.length > 0) {
        const contentArray: any[] = [];
        if (textParts) {
          contentArray.push({ type: "text", text: textParts });
        }
        imageParts.forEach(img => {
          contentArray.push({
            type: "image_url",
            image_url: {
              url: `data:${img.inlineData!.mimeType};base64,${img.inlineData!.data}`
            }
          });
        });
        messages.push({
          role,
          content: contentArray
        });
      } else {
        messages.push({
          role,
          content: textParts
        });
      }
    });
  }

  // 3. Fallback for direct grading (only system message + image)
  if (messages.length === 1 && messages[0].role === "system" && image) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: "Hãy chấm bài làm này theo các chỉ dẫn hệ thống ở trên." },
        {
          type: "image_url",
          image_url: {
            url: `data:${image.mimeType};base64,${image.data}`
          }
        }
      ]
    });
  }

  const payload: any = {
    model: modelName,
    messages,
    temperature: temperature ?? 0.7,
  };

  // Cấu hình mở khóa thinking và tăng mức độ suy nghĩ theo yêu cầu của user
  if (modelName.startsWith("qwen/qwen3.6")) {
    payload.reasoning_effort = "default";
  } else if (modelName.startsWith("openai/gpt-oss")) {
    payload.reasoning = { effort: "high" };
  }

  const isJsonRequired = responseMimeType === "application/json" || !responseMimeType;
  if (isJsonRequired) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  }, timeoutMs);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq AI API returned ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as any;
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from Groq AI API");
  }

  return {
    text,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      candidatesTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
}

export async function callMistralAiApi(
  apiKey: string,
  modelName: string,
  finalContents: ChatContent[] | undefined,
  finalSystemInstruction: string,
  temperature: number | undefined,
  responseMimeType: string | undefined,
  image: { mimeType: string; data: string } | undefined,
  timeoutMs = 15_000
): Promise<{ text: string; usage: any }> {
  const messages: Array<{ role: string; content: any }> = [];

  // 1. System instruction
  if (finalSystemInstruction) {
    messages.push({
      role: "system",
      content: finalSystemInstruction
    });
  }

  // 2. Chat history (contents)
  if (finalContents && finalContents.length > 0) {
    finalContents.forEach(c => {
      const role = c.role === "model" ? "assistant" : "user";
      const textParts = c.parts.filter(p => p.text).map(p => p.text).join("\n");
      const imageParts = c.parts.filter(p => p.inlineData);
      
      if (imageParts.length > 0) {
        const contentArray: any[] = [];
        if (textParts) {
          contentArray.push({ type: "text", text: textParts });
        }
        imageParts.forEach(img => {
          contentArray.push({
            type: "image_url",
            image_url: {
              url: `data:${img.inlineData!.mimeType};base64,${img.inlineData!.data}`
            }
          });
        });
        messages.push({
          role,
          content: contentArray
        });
      } else {
        messages.push({
          role,
          content: textParts
        });
      }
    });
  }

  // 3. Fallback for direct grading (only system message + image)
  if (messages.length === 1 && messages[0].role === "system" && image) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: "Hãy chấm bài làm này theo các chỉ dẫn hệ thống ở trên." },
        {
          type: "image_url",
          image_url: {
            url: `data:${image.mimeType};base64,${image.data}`
          }
        }
      ]
    });
  }

  const payload: any = {
    model: modelName,
    messages,
    temperature: temperature ?? 0.7,
  };

  const isJsonRequired = responseMimeType === "application/json" || !responseMimeType;
  if (isJsonRequired) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetchWithTimeout("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  }, timeoutMs);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mistral AI API returned ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as any;
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from Mistral AI API");
  }

  return {
    text,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      candidatesTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0
    }
  };
}
