import { ChatContent } from '../types.js';
import { fetchWithTimeout } from './aiControl.js';

export interface StreamUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  cachedContentTokenCount?: number;
  totalTokenCount: number;
}

export interface StreamResult {
  text: string;
  usage: StreamUsageMetadata;
}

/**
 * Phân tích các khối SSE từ stream của provider một cách an toàn và tối ưu bộ nhớ đệm
 */
async function forEachSseEvent(
  stream: any,
  onEvent: (event: { event?: string; data: string }) => void
): Promise<void> {
  let buffer = '';
  const decoder = new TextDecoder('utf-8');

  if (stream && typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';
        let currentEvent = '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed.startsWith('event:')) {
            currentEvent = trimmed.slice(6).trim();
          } else if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            onEvent({ event: currentEvent, data: dataStr });
            currentEvent = '';
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else if (stream && Symbol.asyncIterator in stream) {
    for await (const chunk of stream) {
      buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      let currentEvent = '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          onEvent({ event: currentEvent, data: dataStr });
          currentEvent = '';
        }
      }
    }
  }

  // Xử lý nốt phần buffer còn lại nếu có
  if (buffer.trim().startsWith('data:')) {
    onEvent({ data: buffer.trim().slice(5).trim() });
  }
}

/**
 * 1. Stream từ Groq AI (OpenAI compatible SSE)
 */
export async function streamGroqAiApi(
  apiKey: string,
  modelName: string,
  finalContents: ChatContent[] | undefined,
  finalSystemInstruction: string,
  temperature: number | undefined,
  image: { mimeType: string; data: string } | undefined,
  timeoutMs: number,
  onChunk: (text: string) => void
): Promise<StreamResult> {
  const messages: Array<{ role: string; content: any }> = [];

  if (finalSystemInstruction) {
    messages.push({ role: 'system', content: finalSystemInstruction });
  }

  if (finalContents && finalContents.length > 0) {
    finalContents.forEach(c => {
      const role = c.role === 'model' ? 'assistant' : 'user';
      const textParts = c.parts.filter(p => p.text).map(p => p.text).join('\n');
      const imageParts = c.parts.filter(p => p.inlineData);

      if (imageParts.length > 0) {
        const contentArray: any[] = [];
        if (textParts) contentArray.push({ type: 'text', text: textParts });
        imageParts.forEach(img => {
          contentArray.push({
            type: 'image_url',
            image_url: {
              url: `data:${img.inlineData!.mimeType};base64,${img.inlineData!.data}`
            }
          });
        });
        messages.push({ role, content: contentArray });
      } else {
        messages.push({ role, content: textParts });
      }
    });
  }

  if (messages.length === 1 && messages[0].role === 'system' && image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: 'Hãy hướng dẫn bài làm này theo các chỉ dẫn hệ thống ở trên.' },
        {
          type: 'image_url',
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
    stream: true,
    stream_options: { include_usage: true },
  };

  if (modelName.startsWith('qwen/qwen3.6')) {
    payload.reasoning_effort = 'default';
  } else if (modelName.startsWith('openai/gpt-oss')) {
    payload.reasoning = { effort: 'high' };
  }

  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  }, timeoutMs);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq AI stream returned ${response.status}: ${errText}`);
  }

  let accumulatedText = '';
  let usage: StreamUsageMetadata = {
    promptTokenCount: 0,
    candidatesTokenCount: 0,
    totalTokenCount: 0,
  };

  await forEachSseEvent(response.body, ({ data }) => {
    if (data === '[DONE]') return;
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        accumulatedText += delta;
        onChunk(delta);
      }
      if (json.usage) {
        usage = {
          promptTokenCount: json.usage.prompt_tokens || 0,
          candidatesTokenCount: json.usage.completion_tokens || 0,
          totalTokenCount: json.usage.total_tokens || 0,
        };
      }
    } catch {
      // Bỏ qua dòng json không hợp lệ
    }
  });

  if (!accumulatedText) {
    throw new Error('Groq AI stream returned empty text');
  }

  return { text: accumulatedText, usage };
}

/**
 * 2. Stream từ Google Gemini API (streamGenerateContent?alt=sse)
 */
export async function streamGeminiAiApi(
  apiKey: string,
  modelName: string,
  finalContents: ChatContent[] | undefined,
  finalSystemInstruction: string,
  temperature: number | undefined,
  cachedContentName: string | undefined,
  timeoutMs: number,
  onChunk: (text: string) => void
): Promise<StreamResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const reqPayload: any = {
    contents: finalContents,
    generationConfig: {
      temperature: typeof temperature === 'number' ? temperature : 0.7,
    },
  };

  if (cachedContentName) {
    reqPayload.cachedContent = cachedContentName;
  } else if (finalSystemInstruction) {
    reqPayload.systemInstruction = {
      parts: [{ text: finalSystemInstruction }],
    };
  }

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqPayload),
  }, timeoutMs);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini stream returned ${response.status}: ${errText}`);
  }

  let accumulatedText = '';
  let usage: StreamUsageMetadata = {
    promptTokenCount: 0,
    candidatesTokenCount: 0,
    cachedContentTokenCount: 0,
    totalTokenCount: 0,
  };

  await forEachSseEvent(response.body, ({ data }) => {
    try {
      const json = JSON.parse(data);
      const textChunk = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof textChunk === 'string' && textChunk.length > 0) {
        accumulatedText += textChunk;
        onChunk(textChunk);
      }
      if (json.usageMetadata) {
        usage = {
          promptTokenCount: json.usageMetadata.promptTokenCount || usage.promptTokenCount,
          candidatesTokenCount: json.usageMetadata.candidatesTokenCount || usage.candidatesTokenCount,
          cachedContentTokenCount: json.usageMetadata.cachedContentTokenCount || usage.cachedContentTokenCount,
          totalTokenCount: json.usageMetadata.totalTokenCount || usage.totalTokenCount,
        };
      }
    } catch {
      // Bỏ qua dòng json không hợp lệ
    }
  });

  if (!accumulatedText) {
    throw new Error(`Gemini stream model ${modelName} returned empty text`);
  }

  return { text: accumulatedText, usage };
}

/**
 * 3. Stream từ Mistral AI
 */
export async function streamMistralAiApi(
  apiKey: string,
  modelName: string,
  finalContents: ChatContent[] | undefined,
  finalSystemInstruction: string,
  temperature: number | undefined,
  image: { mimeType: string; data: string } | undefined,
  timeoutMs: number,
  onChunk: (text: string) => void
): Promise<StreamResult> {
  const messages: Array<{ role: string; content: any }> = [];

  if (finalSystemInstruction) {
    messages.push({ role: 'system', content: finalSystemInstruction });
  }

  if (finalContents && finalContents.length > 0) {
    finalContents.forEach(c => {
      const role = c.role === 'model' ? 'assistant' : 'user';
      const textParts = c.parts.filter(p => p.text).map(p => p.text).join('\n');
      const imageParts = c.parts.filter(p => p.inlineData);

      if (imageParts.length > 0) {
        const contentArray: any[] = [];
        if (textParts) contentArray.push({ type: 'text', text: textParts });
        imageParts.forEach(img => {
          contentArray.push({
            type: 'image_url',
            image_url: {
              url: `data:${img.inlineData!.mimeType};base64,${img.inlineData!.data}`
            }
          });
        });
        messages.push({ role, content: contentArray });
      } else {
        messages.push({ role, content: textParts });
      }
    });
  }

  if (messages.length === 1 && messages[0].role === 'system' && image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: 'Hãy hướng dẫn bài làm này theo các chỉ dẫn hệ thống ở trên.' },
        {
          type: 'image_url',
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
    stream: true,
  };

  const response = await fetchWithTimeout('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  }, timeoutMs);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Mistral AI stream returned ${response.status}: ${errText}`);
  }

  let accumulatedText = '';
  let usage: StreamUsageMetadata = {
    promptTokenCount: 0,
    candidatesTokenCount: 0,
    totalTokenCount: 0,
  };

  await forEachSseEvent(response.body, ({ data }) => {
    if (data === '[DONE]') return;
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        accumulatedText += delta;
        onChunk(delta);
      }
      if (json.usage) {
        usage = {
          promptTokenCount: json.usage.prompt_tokens || 0,
          candidatesTokenCount: json.usage.completion_tokens || 0,
          totalTokenCount: json.usage.total_tokens || 0,
        };
      }
    } catch {
      // Bỏ qua dòng json không hợp lệ
    }
  });

  if (!accumulatedText) {
    throw new Error('Mistral AI stream returned empty text');
  }

  return { text: accumulatedText, usage };
}
