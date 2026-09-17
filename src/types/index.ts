export type SubjectCode = 'math' | 'english' | 'physics' | 'chemistry' | 'biology' | 'history';
export type GradeCode = 'grade9' | 'grade10' | 'grade11' | 'grade12';

export type ValidatorType =
  | 'exact'
  | 'choice'
  | 'number'
  | 'multi-number'
  | 'text-includes'
  | 'manual'
  | 'coordinates';

export type AnswerFieldType =
  | 'number'
  | 'fraction'
  | 'expression'
  | 'text'
  | 'choice'
  | 'boolean';

export type AnswerSchemaType =
  | 'single-number'
  | 'equation-roots'
  | 'system-solution'
  | 'expression'
  | 'true-false-cluster'
  | 'proof-upload'
  | 'self-check';

export type AutoCheckMode =
  | 'exact'
  | 'numeric'
  | 'unordered-numeric'
  | 'keyed-numeric'
  | 'expression-loose'
  | 'manual';

export type AnswerScoringMode = 'all_or_nothing' | 'per_field';

export type StructuredAnswer = Record<string, string>;

export interface AnswerField {
  key: string;
  label: string;
  valueType: AnswerFieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}

export interface AnswerSchema {
  type: AnswerSchemaType;
  fields: AnswerField[];
  proofImageRequired: boolean;
  orderMatters?: boolean;
  autoCheckMode: AutoCheckMode;
  /** Mặc định cụm Đúng/Sai được chấm từng ý; các dạng còn lại chấm toàn câu. */
  scoringMode?: AnswerScoringMode;
  /** Trọng số tương đối theo key; hệ thống tự chuẩn hóa về tổng điểm câu. */
  fieldWeights?: Record<string, number>;
}

export interface ProofImage {
  id: string;
  storagePath: string;
  downloadUrl?: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Subject {
  id: string;
  code: SubjectCode;
  name: string;
  isEnabled: boolean;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  orderIndex: number;
  tier: 1 | 2 | 3; // Chặng học tập: 1 (điểm 5), 2 (điểm 7-8), 3 (điểm 9-10)
}

export type LearningScope = 'bridge' | 'core' | 'specialized' | 'advanced';
export type LearningEvidenceType =
  | 'recognition'
  | 'representation'
  | 'explanation'
  | 'calculation'
  | 'data'
  | 'experiment'
  | 'application'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'speaking'
  | 'interaction';

export type AssessmentKind =
  | 'diagnostic'
  | 'module_checkpoint'
  | 'midterm'
  | 'final'
  | 'full_course';

/** Trọng tâm đánh giá, tách biệt với phạm vi/thời điểm của bài kiểm tra. */
export type AssessmentFocus = 'mixed' | 'theory';
export type TheoryAssessmentScope = 'module' | 'comprehensive';
export type AssessmentDifficultyBand = 'foundation' | 'score8' | 'score9' | 'standard';
export type AssessmentSemester = 1 | 2;

export interface AssessmentTargetScoreRange {
  min: number;
  max: number;
}

export type AssessmentCompetency =
  | 'mathematical_reasoning'
  | 'mathematical_modeling'
  | 'mathematical_problem_solving'
  | 'physical_cognition'
  | 'physical_inquiry'
  | 'physical_application'
  | 'chemical_cognition'
  | 'chemical_inquiry'
  | 'chemical_application'
  | 'biological_cognition'
  | 'biological_inquiry'
  | 'biological_application'
  | 'english_language_knowledge'
  | 'english_reading'
  | 'english_listening'
  | 'english_writing'
  | 'english_speaking'
  | 'english_interaction';

export type AssessmentCognitiveLevel =
  | 'recognition'
  | 'understanding'
  | 'application';

export interface AssessmentBlueprintSection {
  id: string;
  title: string;
  itemCount: number;
  points: number;
  responseType: 'multiple_choice' | 'true_false_cluster' | 'short_answer' | 'constructed_response';
}

export interface AssessmentBlueprint {
  id: string;
  subjectId: SubjectCode;
  title: string;
  kind: AssessmentKind;
  focus?: AssessmentFocus;
  theoryScope?: TheoryAssessmentScope;
  difficultyBand?: AssessmentDifficultyBand;
  targetScoreRange?: AssessmentTargetScoreRange;
  semester?: AssessmentSemester;
  seriesOrder?: number;
  duration: number;
  totalPoints: number;
  scopeTopicIds: string[];
  /** Trọng số điểm theo chủ đề; tổng các giá trị phải bằng 1 khi được khai báo. */
  topicWeights?: Partial<Record<string, number>>;
  outcomeIds: string[];
  competencyWeights: Partial<Record<AssessmentCompetency, number>>;
  difficultyWeights: Record<'easy' | 'medium' | 'hard', number>;
  sections: AssessmentBlueprintSection[];
}

export interface LearningOutcome {
  id: string;
  topicId: string;
  title: string;
  description: string;
  scope: LearningScope;
  orderIndex: number;
  questionTypeIds: string[];
  prerequisiteOutcomeIds: string[];
  misconceptionIds: string[];
  evidenceTypes: LearningEvidenceType[];
  remediationOutcomeIds?: string[];
  estimatedMinutes?: number;
  isCritical?: boolean;
  textbook?: {
    bookId: string;
    bookName: string;
    pages: number[];
    lessonName?: string;
    sections?: string[];
  };
}

export interface LearningMisconception {
  id: string;
  outcomeId?: string;
  statement?: string;
  title?: string;
  description?: string;
  correction?: string;
  severity: 'normal' | 'critical';
  remediationOutcomeIds?: string[];
}

export interface LearningOutcomeStatus {
  outcome: LearningOutcome;
  masteryScore: number;
  state: 'not_started' | 'ready' | 'in_progress' | 'mastered' | 'blocked';
  unmetPrerequisites: LearningOutcome[];
}

export interface SubType {
  /** Mã ổn định để ánh xạ câu hỏi và theo dõi mức làm chủ theo dạng con. */
  id?: string;
  name: string;
  example: string;
  note?: string;
  /** Dấu hiệu ngắn giúp người mới nhận ra dạng con trước khi chọn công thức. */
  recognitionSigns?: string[];
  /** Số câu khuyến nghị trong toàn ngân hàng, không phải số câu bắt buộc một học sinh phải làm. */
  targetQuestionCount?: number;
}

export type PracticeRole =
  | 'guided'
  | 'near_transfer'
  | 'representation_switch'
  | 'misconception_check'
  | 'far_transfer'
  | 'retention'
  | 'mastery_holdout';

export type QuestionRepresentationType =
  | 'text'
  | 'equation'
  | 'table'
  | 'graph'
  | 'diagram'
  | 'experiment'
  | 'audio'
  | 'dialogue'
  | 'extended_response';

export interface QuestionTypePracticeCoverage {
  /** Quy mô ngân hàng đích; không dùng để ép mọi học sinh làm hết. */
  targetQuestionCount: number;
  /** Số câu tối thiểu cần có cho mỗi dạng con trước khi coi là đã phủ. */
  minimumQuestionsPerSubType: number;
  requiredPracticeRoles: PracticeRole[];
  requiredRepresentations: QuestionRepresentationType[];
  /** Số câu chưa từng hiện trong lượt học đầu, dùng kiểm tra làm chủ/duy trì. */
  masteryHoldoutCount: number;
}

/** Blueprint độc lập để kiểm kê ngân hàng mà không trộn dữ liệu thô vào aggregator. */
export interface QuestionTypePracticeBlueprint {
  questionTypeId: string;
  subTypes: SubType[];
  coverage: QuestionTypePracticeCoverage;
}

/** Metadata tách khỏi nội dung câu hỏi để migration theo module không làm phình file dữ liệu gốc. */
export interface QuestionPracticeMetadata {
  questionId: string;
  subTypeId: string;
  practiceRole: PracticeRole;
  representationType: QuestionRepresentationType;
  misconceptionId?: string;
  isMasteryHoldout?: boolean;
}

export interface QuestionTypeTheoryCheckpoint {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuestionType {
  id: string;
  topicId: string;
  name: string;
  slug: string;
  description: string;
  recognitionSigns: string[];
  solvingSteps: string[];
  commonMistakes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  examFrequency: 'low' | 'medium' | 'high';
  exampleQuestionId?: string; // ID câu hỏi dùng làm ví dụ mẫu trong tab "Ví dụ mẫu"
  subTypes?: SubType[]; // Phân dạng bài tập con chi tiết
  theory?: string[]; // Lý thuyết & Định nghĩa cơ bản của dạng bài
  theoryCheckpoints?: QuestionTypeTheoryCheckpoint[]; // Câu tự kiểm tra bắt buộc trước luyện tập
  practiceCoverage?: QuestionTypePracticeCoverage;
}

/** Kiểu học liệu trực quan đi kèm câu hỏi, đặc biệt dùng cho Sinh học. */
export type QuestionMediaType =
  | 'diagram'
  | 'microscope'
  | 'chart'
  | 'photo'
  | 'illustration';

export interface QuestionMedia {
  id: string;
  type: QuestionMediaType;
  src: string;
  /** Mô tả nội dung có ý nghĩa; bắt buộc để học sinh dùng trình đọc màn hình không mất dữ kiện. */
  alt: string;
  caption?: string;
  longDescription?: string;
  credit?: string;
  width?: number;
  height?: number;
}

export interface QuestionDataTableColumn {
  key: string;
  label: string;
  unit?: string;
}

export interface QuestionDataTable {
  caption: string;
  columns: QuestionDataTableColumn[];
  rows: Array<Record<string, string | number>>;
}

/** Ngữ liệu dùng để đặt dữ kiện trước câu hỏi: văn bản, hình ảnh và/hoặc bảng số liệu. */
export interface QuestionStimulus {
  id: string;
  title?: string;
  content?: string;
  /** Văn bản được Speech Synthesis đọc như một ngữ liệu nghe; không hiển thị trước khi nộp bài. */
  audioText?: string;
  audioLanguage?: string;
  audioPlaybackRate?: number;
  media?: QuestionMedia[];
  dataTable?: QuestionDataTable;
}

export type QuestionResponseType =
  | 'single_choice'
  | 'true_false_cluster'
  | 'short_answer'
  | 'constructed_response'
  | 'ordering'
  | 'labeling';


export interface Question {
  id: string;
  subjectId: SubjectCode;
  topicId: string;
  questionTypeId: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  content: string; // Hỗ trợ LaTeX
  responseType?: QuestionResponseType;
  media?: QuestionMedia[];
  stimulus?: QuestionStimulus;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceType: 'manual' | 'official_exam' | 'mock_exam';
  province?: string;
  year?: number;
  options?: string[]; // Dùng cho trắc nghiệm (Tiếng Anh)
  translation?: {
    content: string;
    options?: string[];
  };
  correctAnswer: string;
  acceptedAnswers?: string[];
  validatorType?: ValidatorType;
  answerSchema?: AnswerSchema;
  correctFinalAnswer?: StructuredAnswer;
  acceptedFinalAnswers?: StructuredAnswer[];
  /** Metadata dùng khi câu hỏi xuất hiện trong bài kiểm tra/thi thử. */
  points?: number;
  outcomeIds?: string[];
  competency?: AssessmentCompetency;
  cognitiveLevel?: AssessmentCognitiveLevel;
  estimatedSeconds?: number;
  variantGroupId?: string;
  /** Metadata luyện tập thích nghi; để trống với câu thi/kiểm tra hoặc dữ liệu cũ. */
  subTypeId?: string;
  practiceRole?: PracticeRole;
  representationType?: QuestionRepresentationType;
  misconceptionId?: string;
  isMasteryHoldout?: boolean;
}

export interface SolutionStep {
  order: number;
  title: string;
  explanation: string;
  formula?: string; // Ký hiệu toán học LaTeX
  result?: string;
  /** Số điểm tối đa của ý/bước khi dùng làm hướng dẫn chấm câu tự luận. */
  points?: number;
}

export interface AssessmentRubricCriterion {
  id: string;
  description: string;
  points: number;
  /** Bằng chứng tối thiểu cần xuất hiện trong bài làm để đạt điểm của tiêu chí. */
  evidence: string[];
  commonErrors?: string[];
}

export interface Solution {
  id: string;
  questionId: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  recognition: string;
  translation?: string; // Dịch nghĩa của câu hỏi tiếng Anh
  detailedSteps: SolutionStep[];
  finalAnswer: string;
  commonMistakes: string[];
  reviewSuggestions: string[]; // Khuyên học sinh ôn lại thẻ kiến thức nào
  /** Rubric tường minh cho câu cần giáo viên/AI chấm theo từng ý. */
  rubric?: AssessmentRubricCriterion[];
}

export interface StepEvaluation {
  stepOrder: number;
  title: string;
  status: 'correct' | 'incorrect' | 'missing';
  studentContent?: string;
  feedback: string;
}

export interface AiEvaluation {
  isCorrect: boolean;
  score: number;
  summaryFeedback: string;
  stepsEvaluation: StepEvaluation[];
}

export interface UserAttempt {
  id: string;
  userId: string;
  questionId: string;
  questionTypeId: string;
  userAnswer: string;
  finalAnswer?: StructuredAnswer;
  proofImages?: ProofImage[];
  gradingMode?: 'auto' | 'self-check' | 'manual';
  isCorrect: boolean;
  timeSpent: number; // đơn vị: giây
  createdAt: string; // ISO String
  teacherFeedback?: string;
  selectedSubTense?: string;
  aiEvaluation?: AiEvaluation;
  synced?: boolean;
  syncedAt?: string;
}

export interface TopicAttemptsDoc {
  questionTypeId: string;
  updatedAt: string;
  attempts: UserAttempt[];
}

export interface UserMistake {
  id: string;
  userId: string;
  questionId: string;
  questionTypeId: string;
  wrongAnswer: string;
  proofImages?: ProofImage[];
  reviewStatus: 'new' | 'reviewing' | 'fixed';
  reviewCount: number;
  nextReviewAt: string; // ISO String
  lastAttemptedAt: string; // ISO String
  teacherFeedback?: string;
}

export interface ActiveMistakesDoc {
  updatedAt: string;
  mistakes: UserMistake[];
}

export interface UserProgress {
  userId: string;
  masteryLevels: Record<string, number>;
  completedLessons: string[]; // Danh sách các bài/dạng bài đã hoàn thành
  readLessons?: string[]; // Danh sách các bài lý thuyết đã đọc
  passedCheckpoints?: string[]; // Danh sách các checkpoint lý thuyết đã vượt qua
  lastUpdatedAt: string;
}

export interface MockExam {
  id: string;
  subjectId: SubjectCode;
  title: string;
  duration: number; // đơn vị: phút
  questionIds: string[];
  createdAt: string;
  kind?: AssessmentKind;
  focus?: AssessmentFocus;
  theoryScope?: TheoryAssessmentScope;
  /** Mức mục tiêu của series; không dùng formCode để suy ra độ khó. */
  difficultyBand?: AssessmentDifficultyBand;
  targetScoreRange?: AssessmentTargetScoreRange;
  /** Các mã A/B cùng parallelFormGroup phải tương đương phạm vi và độ khó. */
  parallelFormGroup?: string;
  seriesOrder?: number;
  semester?: AssessmentSemester;
  scopeTopicIds?: string[];
  totalPoints?: number;
  formCode?: string;
  instructions?: string[];
  resultReleasePolicy?: 'immediate' | 'after_submit' | 'teacher_release';
  /** Truy vết đề về đúng ma trận và phiên bản dùng để biên soạn đề. */
  blueprintId?: string;
  assessmentVersion?: string;
}

export interface ExamResult {
  examId: string;
  sourceExamId?: string;
  score: number;
  earnedPoints?: number;
  maxPoints?: number;
  /** Tổng điểm tối đa của các câu đã được chấm tự động hoặc thủ công. */
  gradedMaxPoints?: number;
  /** Tổng điểm chưa được chấm vì cần giáo viên/AI đánh giá theo rubric. */
  pendingPoints?: number;
  gradedCount?: number;
  correctCount: number;
  totalCount: number;
  timeSpent: number; // đơn vị: giây
  completedAt: string;
  attempts: Record<string, {
    userAnswer: string;
    finalAnswer?: StructuredAnswer;
    proofImages?: ProofImage[];
    isCorrect: boolean;
    gradingStatus?: 'graded' | 'pending';
    earnedPoints?: number;
    maxPoints?: number;
    partResults?: Record<string, {
      isCorrect: boolean;
      earnedPoints: number;
      maxPoints: number;
    }>;
  }>;
}

export interface ExamSummaryItem {
  bestScore: number;
  lastScore: number;
  attemptsCount: number;
  lastCompletedAt: string;
  lastExamId: string;
  lastTimeSpent?: number;
}

export type ExamSummaryMap = Record<string, ExamSummaryItem>;

export interface ActiveExamSession {
  examId: string;
  sourceExamId: string;
  examTitle: string;
  subjectId: SubjectCode;
  grade: GradeCode;
  questionIds: string[];
  answers: Record<string, string>;
  finalAnswers: Record<string, StructuredAnswer>;
  timeLeft: number;
  timeSpent: number;
  lastSavedAt: string;
}

export interface SimulatedStudent {
  id: string;
  name: string;
  avatar: string;
  email: string;
  isPremium?: boolean;
  premiumUntil?: string | null;
  premiumPlan?: string;
  trialActivated?: boolean;
  completedCount?: number;
  lastActiveAt?: string;
  masteryLevels?: Record<string, number>;
  completedLessons?: string[];
  stats?: {
    totalStudySeconds: number;
    totalAttempts: number;
    correctAttempts: number;
    dailyActivity: Record<string, number>;
  };
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: 'bug' | 'feature' | 'question' | 'other';
  title: string;
  description: string;
  screenshotUrl?: string;
  status: 'pending' | 'resolved' | 'rejected';
  teacherResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateCode {
  code: string;
  sellerUid: string;
  sellerName: string;
  discountPercent: number;
  commissionPercent: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number | null;
  expiresAt?: string | null;
}

export interface AffiliateWallet {
  sellerUid: string;
  totalEarned: number;
  balance: number;
  pendingBalance: number;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface AffiliateValidationResult {
  valid: boolean;
  code?: string;
  sellerName?: string;
  discountPercent?: number;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}

export * from './roadmapContract';
