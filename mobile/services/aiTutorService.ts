import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { buildAiTutorSystemInstruction, SubjectCode, SUBJECT_NAME_MAP } from './aiTutorPrompts';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
}

export interface QuestionContext {
  questionId?: string;
  questionText?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  subjectId?: string;
  subjectName?: string;
  topicName?: string;
}

/**
 * Chuẩn hóa mã môn học theo quy chuẩn hệ thống (Web & Cloud Function)
 */
export function normalizeSubjectCode(raw?: string): SubjectCode {
  if (!raw) return 'math';
  const lower = raw.toLowerCase().trim();
  if (lower === 'math' || lower === 'toan' || lower.includes('toán')) return 'math';
  if (lower === 'english' || lower === 'tieng-anh' || lower.includes('anh')) return 'english';
  if (lower === 'chemistry' || lower === 'hoa-hoc' || lower.includes('hóa')) return 'chemistry';
  if (lower === 'physics' || lower === 'vat-ly' || lower.includes('lý')) return 'physics';
  if (lower === 'biology' || lower === 'sinh-hoc' || lower.includes('sinh')) return 'biology';
  if (lower === 'history' || lower === 'lich-su' || lower.includes('sử')) return 'history';
  return 'math';
}

/**
 * Phản hồi thông minh offline/fallback khi mạng yếu hoặc chưa kết nối
 */
const generateLocalFallback = (prompt: string, context?: QuestionContext, subjectCode: SubjectCode = 'math'): string => {
  const pLower = prompt.toLowerCase();
  const subName = SUBJECT_NAME_MAP[subjectCode] || 'Toán học';

  if (context?.questionText) {
    if (pLower.includes('gợi ý') || pLower.includes('bước 1') || pLower.includes('làm sao')) {
      return `Chào em! Thầy EZ hướng dẫn em phương pháp tiếp cận câu hỏi môn **${subName}** này nhé:\n\n**"${context.questionText}"**\n\n💡 **Gợi ý bước 1:**\n- Trước hết, hãy xác định từ khóa cốt lõi và dữ kiện đề bài đã cho.\n- Nhớ lại định lý / công thức trọng tâm của chuyên đề **${context.topicName || 'này'}**.\n\nEm hãy thử đối chiếu các dữ kiện để loại trừ phương án sai rõ ràng nhất trước nhé!`;
    }

    if (pLower.includes('giải thích') || pLower.includes('vì sao') || pLower.includes('tại sao')) {
      const explain = context.explanation ? `\n\n📌 **Phân tích bản chất:**\n${context.explanation}` : '';
      return `Thầy giải thích cho em nhé! 🎓\n\nTrong bài tập này, điểm mấu chốt nằm ở kiến thức nền tảng của môn ${subName}.${explain}\n\nEm đã nắm rõ logic suy luận này chưa, hay cần thầy lấy thêm một ví dụ tương tự?`;
    }

    if (pLower.includes('lý thuyết') || pLower.includes('công thức')) {
      return `📚 **Kiến thức trọng tâm ${context.topicName || subName}:**\n\n- Đọc kỹ định nghĩa, điều kiện áp dụng và phạm vi kiến thức.\n- Chú ý các bẫy thường gặp về đơn vị và dấu.\n- Đối với dạng bài này, cách làm tối ưu là viết rõ giả thiết và kết luận trước khi tính toán.`;
    }
  }

  return `Chào em! Thầy EZ là Gia sư AI chuyên biệt môn **${subName}** đồng hành cùng em ôn thi vào 10. Em hãy gửi câu hỏi hoặc chọn các gợi ý bên dưới để thầy trợ giúp phương pháp giải nhé! 💪`;
};

/**
 * Gửi tin nhắn đến AI Gia Sư (Cloud Function callGeminiProxy)
 * Kế thừa 100% hợp đồng API, System Prompt và RAG Hybrid Search từ Web
 */
export async function askAiTutor(
  prompt: string,
  context?: QuestionContext,
  chatHistory: ChatMessage[] = [],
  gradeId = 'grade9'
): Promise<string> {
  const subjectCode = normalizeSubjectCode(context?.subjectId);

  try {
    // 1. Tạo System Instruction chuẩn mực kế thừa từ Web
    const systemInstruction = buildAiTutorSystemInstruction(subjectCode, gradeId);

    // 2. Định dạng ngữ cảnh câu hỏi nếu có
    let contextPrompt = '';
    if (context?.questionText) {
      contextPrompt = `[NGỮ CẢNH BÀI TẬP]:
Môn học: ${context.subjectName || SUBJECT_NAME_MAP[subjectCode]}
Chuyên đề: ${context.topicName || 'Chung'}
Đề bài: "${context.questionText}"
${context.options && context.options.length > 0 ? `Các phương án lựa chọn:\n${context.options.map((opt, idx) => `  ${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}` : ''}
${context.explanation ? `Lời giải tham khảo: "${context.explanation}"` : ''}
---
Học sinh hỏi: "${prompt}"`;
    }

    // 3. Chuẩn hóa lịch sử hội thoại
    const contents = chatHistory.slice(-8).map((msg) => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: contextPrompt || prompt }]
    });

    // 4. Gọi Firebase Callable Function giống hệt Web App
    const callGeminiProxy = httpsCallable<any, { text: string }>(functions, 'callGeminiProxy');
    const result = await callGeminiProxy({
      contents,
      systemInstruction,
      useRag: true,
      subjectId: subjectCode,
      gradeId,
      ragVersion: '2026.09',
      taskType: 'tutor',
      temperature: 0.7,
      topicName: context?.topicName
    });

    if (result.data?.text) {
      return result.data.text;
    }

    return generateLocalFallback(prompt, context, subjectCode);
  } catch (error: any) {
    console.warn('[AI Tutor] Gặp sự cố kết nối Cloud Function, dùng fallback an toàn:', error?.message || error);
    return generateLocalFallback(prompt, context, subjectCode);
  }
}
