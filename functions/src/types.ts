export interface ChatPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatContent {
  role: "user" | "model";
  parts: ChatPart[];
}

export interface GeminiProxyRequest {
  prompt?: string;
  contents?: ChatContent[];
  systemInstruction?: string;
  useRag?: boolean;
  subjectId?: string;
  gradeId?: string;
  ragVersion?: string;
  image?: {
    mimeType: string;
    data: string;
  };
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  skipDiagnosis?: boolean;
  topicName?: string;
  chatId?: string;
  taskType?: "tutor" | "proof_grading" | "rewrite" | "summary" | "diagnose" | "consolidate";
}

export interface Transaction {
  orderCode: number;
  userId: string;
  email: string;
  amount: number;
  status: "pending" | "completed" | "cancelled";
  paymentLinkId: string;
  checkoutUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  strengths: string[];
  weaknesses: string[];
  learningSummary: string;
  lastUpdated?: Date;
}
