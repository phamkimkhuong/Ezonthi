import type {
  AssessmentBlueprint,
  GradeCode,
  LearningMisconception,
  LearningOutcome,
  MockExam,
  Question,
  QuestionType,
  QuestionTypePracticeBlueprint,
  Solution,
  SubjectCode,
  Topic
} from '@/types';

export const COURSE_DATA_SCHEMA_VERSION = 4 as const;

export type CourseDataSchemaVersion = typeof COURSE_DATA_SCHEMA_VERSION;
export type CourseId = `${GradeCode}:${SubjectCode}`;
export type CurriculumReviewStatus =
  | 'draft'
  | 'source_checked'
  | 'content_reviewed'
  | 'approved'
  | 'retired';

export interface SubjectSchemaProfile {
  kind: 'mathematics' | 'language' | 'science' | 'humanities';
  dimensions: string[];
  supportedEvidence: string[];
}

export interface StudentDataCompatibility {
  studentDataVersion: 2;
  identityStrategy: 'stable-question-id';
  legacyRuntimeAdapter: true;
  preservesAttemptIds: true;
  preservesQuestionIds: true;
}

export interface CourseManifest {
  id: CourseId;
  grade: GradeCode;
  subject: SubjectCode;
  title: string;
  academicYear: string;
  curriculumName: string;
  textbookSeries?: string;
  contentVersion: string;
  reviewStatus: CurriculumReviewStatus;
}

export interface CurriculumSource {
  id: string;
  title: string;
  authority: string;
  documentNumber?: string;
  issuedAt?: string;
  url: string;
  role: 'legal_basis' | 'official_program' | 'textbook' | 'assessment_guidance';
  lastVerifiedAt: string;
}

export interface CourseLesson {
  id: string;
  courseId: CourseId;
  moduleId: string;
  chapterNumber: number;
  lessonNumber: number;
  title: string;
  kind: 'content' | 'review' | 'practice';
  orderIndex: number;
  sourceIds: string[];
  reviewStatus: CurriculumReviewStatus;
}

export interface OfficialRequirement {
  id: string;
  courseId: CourseId;
  moduleId: string;
  lessonIds: string[];
  title: string;
  normalizedRequirement: string;
  actionVerbs: string[];
  evidenceTypes: LearningOutcome['evidenceTypes'];
  sourceLocators: string[];
  implementedOutcomeIds: string[];
  coverageStatus: 'not_started' | 'partial' | 'covered';
  coverageNotes?: string;
  reviewStatus: CurriculumReviewStatus;
}

export interface OutcomeManifestEntry {
  outcomeId: string;
  courseId: CourseId;
  moduleId: string;
  scope: LearningOutcome['scope'];
  scopeBasis:
    | 'official_required'
    | 'textbook_core'
    | 'supporting_prerequisite'
    | 'advanced';
  officialRequirementIds: string[];
  lessonIds: string[];
  reviewStatus: CurriculumReviewStatus;
  contentVersion: string;
  lastVerifiedAt: string;
}

export interface CurriculumBundle {
  sources: CurriculumSource[];
  lessons: CourseLesson[];
  officialRequirements: OfficialRequirement[];
  outcomeManifest: OutcomeManifestEntry[];
}

export interface ModuleManifest {
  id: string;
  courseId: CourseId;
  title: string;
  slug: string;
  orderIndex: number;
  scope: LearningOutcome['scope'];
  topicIds: string[];
  lessonIds: string[];
  prerequisiteModuleIds: string[];
  reviewStatus: CurriculumReviewStatus;
}

export interface CourseTopic extends Topic {
  courseId: CourseId;
  moduleId: string;
}

export interface CourseQuestionType extends QuestionType {
  courseId: CourseId;
  moduleId: string;
  lessonIds: string[];
  outcomeIds: string[];
}

export interface CourseQuestion extends Question {
  courseId: CourseId;
  moduleId: string;
  lessonId: string;
  responseType: NonNullable<Question['responseType']>;
  validatorType: NonNullable<Question['validatorType']>;
  outcomeIds: string[];
}

export interface CourseSolution extends Solution {
  courseId: CourseId;
  moduleId: string;
}

export interface TheoryFormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
  note?: string;
}

export interface TheoryFormula {
  id: string;
  label: string;
  expression: string;
  variables: TheoryFormulaVariable[];
  conditions: string[];
  notes?: string[];
}

export interface TheoryWorkedExample {
  id: string;
  title: string;
  problem: string;
  steps: string[];
  answer: string;
}

export interface TheoryCheckpoint {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface TheoryBlock {
  id: string;
  courseId: CourseId;
  moduleId: string;
  lessonIds: string[];
  outcomeIds: string[];
  questionTypeIds: string[];
  sourceIds: string[];
  title: string;
  objectives: string[];
  content: string;
  formulas: TheoryFormula[];
  keyPoints: string[];
  workedExamples: TheoryWorkedExample[];
  checkpoints: TheoryCheckpoint[];
  orderIndex: number;
  reviewStatus: CurriculumReviewStatus;
}

export interface LearningMedia {
  id: string;
  courseId: CourseId;
  moduleId?: string;
  lessonIds: string[];
  type: 'video' | 'simulation' | 'diagram' | 'document';
  title: string;
  url: string;
  description: string;
  durationSeconds?: number;
  isPublished: boolean;
  reviewStatus: CurriculumReviewStatus;
}

export interface AssessmentBundle {
  exams: MockExam[];
  questions: Question[];
  solutions: Solution[];
  blueprints: AssessmentBlueprint[];
}

export interface CourseModuleData {
  manifest: ModuleManifest;
  topics: CourseTopic[];
  lessons: CourseLesson[];
  theory: TheoryBlock[];
  outcomes: LearningOutcome[];
  misconceptions: LearningMisconception[];
  questionTypes: CourseQuestionType[];
  practiceQuestions: CourseQuestion[];
  practiceSolutions: CourseSolution[];
  practiceBlueprints: QuestionTypePracticeBlueprint[];
  assessments: AssessmentBundle;
  media: LearningMedia[];
}

export interface CourseDataBundle {
  schemaVersion: CourseDataSchemaVersion;
  subjectSchema: SubjectSchemaProfile;
  studentDataCompatibility: StudentDataCompatibility;
  course: CourseManifest;
  curriculum: CurriculumBundle;
  modules: CourseModuleData[];
  assessments: AssessmentBundle;
  media: LearningMedia[];
}

/**
 * Contract runtime cũ mà UI hiện đang sử dụng. Adapter V4 trả về contract này
 * để các khóa học mới không buộc dữ liệu lớp 9–10 phải di chuyển ngay.
 */
export interface SubjectRuntimeData {
  topics: Topic[];
  questionTypes: QuestionType[];
  questions: Question[];
  solutions: Solution[];
  mockExams: MockExam[];
  assessmentBlueprints: AssessmentBlueprint[];
  learningOutcomes: LearningOutcome[];
  learningMisconceptions: LearningMisconception[];
  courseBundle?: CourseDataBundle;
  dataContract?: {
    schemaVersion: CourseDataSchemaVersion;
    studentDataVersion: 2;
    identityStrategy: 'stable-question-id';
  };
}

export type LegacySubjectDataInput = Pick<
  SubjectRuntimeData,
  'topics' | 'questionTypes' | 'questions' | 'solutions' | 'mockExams'
> &
  Partial<
    Pick<
      SubjectRuntimeData,
      | 'assessmentBlueprints'
      | 'learningOutcomes'
      | 'learningMisconceptions'
      | 'courseBundle'
    >
  >;
