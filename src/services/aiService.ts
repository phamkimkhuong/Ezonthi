import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { Question, Solution, AiEvaluation } from '../types';
import { getSubjectName } from '../utils/subject';
import { logger } from '../utils/logger';

interface CallGeminiParams {
  prompt?: string;
  contents?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  systemInstruction?: string;
  useRag?: boolean;
  subjectId?: string;
  gradeId?: string;
  ragVersion?: string;
  image?: { data: string; mimeType: string };
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  skipDiagnosis?: boolean;
  topicName?: string;
  chatId?: string;
  taskType?: 'tutor' | 'proof_grading';
}

const normalizeAiEvaluation = (parsed: any): AiEvaluation => {
  if (!parsed || typeof parsed !== 'object') {
    return {
      isCorrect: false,
      score: 0,
      summaryFeedback: 'Đã hoàn thành chấm bài.',
      stepsEvaluation: []
    };
  }

  const keys = Object.keys(parsed);
  
  // Tự động tìm nhận xét tổng quan (Là String dài nhất ở root)
  const summaryFeedback = 
    parsed.summaryFeedback || 
    parsed.comment || 
    parsed.feedback || 
    keys.find(k => typeof parsed[k] === 'string' && parsed[k].length > 20) || 
    'Đã hoàn thành chấm bài.';

  // Tự động tìm mảng chứa các bước chấm điểm (Là Array duy nhất ở root)
  const stepsArray = 
    parsed.stepsEvaluation || 
    parsed.steps || 
    Object.values(parsed).find(val => Array.isArray(val)) || 
    [];

  // Chuẩn hóa từng phần tử trong mảng bước giải
  const stepsEvaluation = stepsArray.map((s: any, idx: number) => {
    if (!s || typeof s !== 'object') {
      return {
        stepOrder: idx + 1,
        title: `Bước ${idx + 1}`,
        status: 'incorrect' as const,
        feedback: String(s || 'Đã hoàn thành.')
      };
    }
    const sKeys = Object.keys(s);
    // Tên bước giải thường là String ngắn, nhận xét từng bước thường là String dài
    const title = s.title || s.step || s.name || sKeys.find(k => typeof s[k] === 'string' && s[k].length < 50) || `Bước ${idx + 1}`;
    const feedback = s.feedback || s.comment || s.desc || sKeys.find(k => typeof s[k] === 'string' && s[k].length >= 50) || 'Không có nhận xét chi tiết.';
    
    return {
      stepOrder: typeof s.stepOrder === 'number' ? s.stepOrder : (idx + 1),
      title,
      status: (['correct', 'incorrect', 'missing'].includes(s.status) ? s.status : 'incorrect') as any,
      studentContent: s.studentContent || '',
      feedback
    };
  });

  return {
    isCorrect: typeof parsed.isCorrect === 'boolean' ? parsed.isCorrect : (typeof parsed.score === 'number' ? parsed.score >= 5 : false),
    score: typeof parsed.score === 'number' ? parsed.score : 0,
    summaryFeedback,
    stepsEvaluation
  };
};

export const aiService = {
  async callGemini(params: CallGeminiParams): Promise<string> {
    try {
      const callGeminiProxy = httpsCallable<CallGeminiParams, { text: string }>(
        functions,
        'callGeminiProxy'
      );
      const result = await callGeminiProxy(params);
      console.log("[callGemini] Raw result:", result);
      console.log("[callGemini] result.data:", result.data);
      console.log("[callGemini] result.data.text:", result.data?.text);
      return result.data.text;
    } catch (err: any) {
      console.error("Lỗi khi gọi callGeminiProxy:", err);
      // Xử lý thông điệp thân thiện với người dùng
      const message = err.message || 'Không nhận được câu trả lời từ AI.';
      throw new Error(message, { cause: err });
    }
  },

  async gradeProofAttempt(
    question: Question,
    solution: Solution | undefined,
    studentAnswer: string,
    image?: { data: string; mimeType: string }
  ): Promise<AiEvaluation> {
    const isMath = question.subjectId === 'math';
    const isChemistry = question.subjectId === 'chemistry';
    const subjectName = getSubjectName(question.subjectId);

    const criteria = (isMath || isChemistry)
      ? `Nhiệm vụ chấm môn ${subjectName} tự luận:
1. Đọc và phân tích kỹ chữ viết tay hoặc văn bản trong bài làm của học sinh (đặc biệt đọc hiểu công thức toán học, ký hiệu hóa học, phương trình phản ứng hóa học từ ảnh).
2. So sánh từng bước giải của học sinh với các bước giải mẫu dưới đây:
${solution ? solution.detailedSteps.map(s => `- Bước ${s.order} (${s.title}): ${s.explanation}`).join('\n') : '- Đề bài không có bước giải mẫu cụ thể. Hãy tự phân tích các bước hợp lý.'}
3. Chỉ ra bước nào học sinh làm đúng (status: 'correct'), bước nào giải sai/tính nhầm/viết sai công thức hóa học (status: 'incorrect'), và bước nào làm thiếu/quên viết vào bài (status: 'missing'), đặc biệt chú ý đến:
   - Các công thức tính số mol, khối lượng, nồng độ (nếu có).
   - Việc viết và cân bằng phương trình phản ứng hóa học (đối với môn Hóa học).
   - Phần đặt Điều kiện xác định (ĐKXĐ) và đối chiếu kết quả (đối với môn Toán).
4. Đánh giá tính đúng đắn chung 'isCorrect' (chỉ true khi toàn bộ logic giải và kết quả cuối cùng đều đúng) và tính toán điểm số 'score' trên thang điểm 10 (mỗi bước giải đúng tương ứng một phần điểm).`
      : `Nhiệm vụ chấm môn Tiếng Anh:
1. Đọc và phân tích kỹ câu trả lời của học sinh.
2. Đánh giá xem câu trả lời có chính xác về ngữ pháp, cấu trúc câu và từ vựng theo yêu cầu đề bài không.
3. Tạo 1 bước đánh giá duy nhất với stepOrder: 1, title: "Ngữ pháp & Từ vựng", đánh giá status ('correct' hoặc 'incorrect') kèm nhận xét lỗi sai nếu có.`;

    const prompt = `Bạn là một giáo viên chấm thi môn ${subjectName} chuyên nghiệp tại Việt Nam, cực kỳ nghiêm khắc và chi tiết.
Hãy chấm bài làm của học sinh cho câu hỏi sau đây:

[ĐỀ BÀI]
${question.content}
Đáp án đúng chuẩn: ${question.correctAnswer}

[BÀI LÀM CỦA HỌC SINH]
- Văn bản nộp: ${studentAnswer || '(Không ghi đáp án bằng chữ)'}
${image ? '- Ảnh chụp bài làm đính kèm bên dưới.' : ''}

[YÊU CẦU CHẤM ĐIỂM]
${criteria}

[YÊU CẦU ĐẦU RA]
Bạn phải trả về kết quả dưới định dạng JSON chính xác theo Schema đã cho. Nhận xét bằng tiếng Việt, thân thiện nhưng khách quan và súc tích.`;

    const textResponse = await this.callGemini({
      prompt,
      image,
      taskType: 'proof_grading',
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          isCorrect: { type: 'BOOLEAN' },
          score: { type: 'NUMBER', description: 'Điểm số của học sinh trên thang 10 (ví dụ: 8.5)' },
          summaryFeedback: { type: 'STRING', description: 'Lời nhận xét tổng quan ngắn gọn (2-3 câu)' },
          stepsEvaluation: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                stepOrder: { type: 'INTEGER' },
                title: { type: 'STRING' },
                status: { 
                  type: 'STRING', 
                  enum: ['correct', 'incorrect', 'missing'] 
                },
                studentContent: { type: 'STRING', description: 'Nội dung học sinh viết tương ứng với bước này (nếu có)' },
                feedback: { type: 'STRING', description: 'Nhận xét chi tiết cho bước này, chỉ rõ lỗi sai hoặc lý do thiếu' }
              },
              required: ['stepOrder', 'title', 'status', 'feedback']
            }
          }
        },
        required: ['isCorrect', 'score', 'summaryFeedback', 'stepsEvaluation']
      },
      temperature: 0.1
    });
    
    const cleanJson = (str: string) => {
      return str.replace(/(?<!\\)\\([a-zA-Z]+)/g, (match, p1) => {
        if (p1 === 'n') {
          return match;
        }
        return '\\\\' + p1;
      });
    };

    try {
      const cleanedText = cleanJson(textResponse.trim());
      const parsed = JSON.parse(cleanedText);
      return normalizeAiEvaluation(parsed);
    } catch (err) {
      console.error("Lỗi parse JSON kết quả chấm của Gemini:", textResponse, err);
      try {
        const cleaned = cleanJson(textResponse.replace(/```json/g, '').replace(/```/g, '').trim());
        const parsed = JSON.parse(cleaned);
        return normalizeAiEvaluation(parsed);
      } catch {
        return {
          isCorrect: textResponse.toLowerCase().includes('"iscorrect": true') || textResponse.toLowerCase().includes('"iscorrect":true'),
          score: textResponse.toLowerCase().includes('"iscorrect": true') ? 10 : 5,
          summaryFeedback: textResponse.substring(0, 200) || 'Đã chấm bài làm.',
          stepsEvaluation: [
            {
              stepOrder: 1,
              title: "Đánh giá bài làm",
              status: textResponse.toLowerCase().includes('"iscorrect": true') ? 'correct' : 'incorrect',
              feedback: 'Đã hoàn thành phân tích bài làm.'
            }
          ]
        };
      }
    }
  },

  async diagnoseSession(chatHistory: Array<{ role: 'user' | 'model'; text: string }>, subjectId: string): Promise<void> {
    try {
      const diagnoseSessionFn = httpsCallable<{ chatHistory: typeof chatHistory; subjectId: string }, { success: boolean }>(
        functions,
        'diagnoseSession'
      );
      await diagnoseSessionFn({ chatHistory: chatHistory.slice(-20), subjectId });
      logger.debug(`[diagnoseSession] Session diagnosis triggered successfully for ${subjectId}`);
    } catch (err) {
      logger.error('Thực thi diagnoseSession', err);
    }
  }
};
