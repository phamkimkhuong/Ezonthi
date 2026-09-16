/**
 * ROADMAP THEORY JSON CONTRACT (Cloudflare R2)
 *
 * Hợp đồng dữ liệu chuẩn cho phần Lộ trình học (Chủ đề, Dạng bài, Lý thuyết, Phương pháp giải).
 * Được lưu trữ dưới dạng các file JSON độc lập trên Cloudflare R2 CDN và phục vụ đồng thời cho cả Web và Mobile.
 */

import type { GradeCode, SubjectCode } from './index';

export type RoadmapDifficulty = 'easy' | 'medium' | 'hard';
export type RoadmapExamFrequency = 'low' | 'medium' | 'high';
export type RoadmapTier = 1 | 2 | 3; // 1: Điểm 5-6 (Cơ bản), 2: Điểm 7-8 (Khá), 3: Điểm 9-10 (Vận dụng cao)

/**
 * Phân dạng con chi tiết của một dạng bài lớn kèm ví dụ và lưu ý
 */
export interface RoadmapSubType {
  id?: string;
  name: string;
  example: string;
  note?: string;
  recognitionSigns?: string[];
}

/**
 * Câu trắc nghiệm tự kiểm tra kiến thức lý thuyết trước khi chuyển sang luyện đề
 */
export interface RoadmapTheoryCheckpoint {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

/**
 * Chi tiết một Dạng bài & Lý thuyết phương pháp giải
 */
export interface RoadmapQuestionType {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  difficulty: RoadmapDifficulty;
  examFrequency: RoadmapExamFrequency;
  description: string;
  
  /** Dấu hiệu nhận biết dạng bài trong đề thi */
  recognitionSigns: string[];
  
  /** Các bước giải chuẩn mực (phương pháp giải) */
  solvingSteps: string[];
  
  /** Các bẫy đề thi và sai lầm học sinh hay mắc */
  commonMistakes: string[];
  
  /** Lý thuyết & định nghĩa cốt lõi */
  theory?: string[];
  
  /** Công thức trọng tâm cần nhớ (hỗ trợ định dạng LaTeX) */
  keyFormulas?: string[];
  
  /** Các phân dạng nhỏ */
  subTypes?: RoadmapSubType[];
  
  /** Bộ câu hỏi tự kiểm tra lý thuyết */
  theoryCheckpoints?: RoadmapTheoryCheckpoint[];
  
  /** ID câu hỏi mẫu đại diện trong kho bài tập (nếu có) */
  exampleQuestionId?: string;
}

/**
 * Chi tiết một Chủ đề (Chương học) trong lộ trình
 */
export interface RoadmapTopic {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  tier: RoadmapTier;
  description: string;
  estimatedMinutes: number;
  difficulty: RoadmapDifficulty;
  
  /** Danh sách ID các dạng bài trực thuộc chủ đề này */
  questionTypeIds: string[];
}

/**
 * Gói dữ liệu đầy đủ của 1 môn học theo từng khối lớp (File JSON lưu trên Cloudflare R2)
 * Ví dụ: `roadmap/grade9/math.json`
 */
export interface RoadmapSubjectBundle {
  schemaVersion: '1.0.0';
  contentVersion: string;
  updatedAt: string;
  
  grade: GradeCode;
  subject: SubjectCode;
  subjectName: string;
  
  /** Tên Icon vector (Lucide icon name: "Calculator", "Languages", "Atom"...) */
  icon: string;
  /** Mã màu nhận diện môn học (Hex code: "#6366f1", "#10b981"...) */
  themeColor: string;
  /** Huy hiệu hiển thị (ví dụ: "Tuyển sinh", "Bắt buộc", "GDPT 2018") */
  badge: string;
  
  /** Thống kê tổng quan */
  stats: {
    totalTopics: number;
    totalQuestionTypes: number;
    estimatedTotalMinutes: number;
  };
  
  /** Danh sách các chủ đề (chương học) */
  topics: RoadmapTopic[];
  
  /** Danh sách các dạng bài tập và lý thuyết chi tiết */
  questionTypes: RoadmapQuestionType[];
}

/**
 * Thông tin rút gọn của 1 môn trong mục lục
 */
export interface RoadmapCatalogSubject {
  id: SubjectCode;
  name: string;
  icon: string;
  color: string;
  badge: string;
  bundleUrl: string;
  contentVersion: string;
  totalTopics: number;
  totalQuestionTypes: number;
}

/**
 * Thông tin khối lớp trong mục lục
 */
export interface RoadmapCatalogGrade {
  id: GradeCode;
  name: string;
  subjects: RoadmapCatalogSubject[];
}

/**
 * File mục lục tổng quát của toàn bộ hệ thống (`roadmap/index.json`)
 * Giúp app tải nhanh danh mục mà không phải tải toàn bộ file chi tiết
 */
export interface RoadmapCatalogIndex {
  schemaVersion: '1.0.0';
  updatedAt: string;
  grades: RoadmapCatalogGrade[];
}
