import type { GradeCode, SubjectCode } from '@/types';

export const AVAILABLE_SUBJECTS_BY_GRADE: Record<GradeCode, SubjectCode[]> = {
  grade9: ['math', 'english'],
  grade10: ['math', 'english', 'physics', 'chemistry', 'biology', 'history'],
  grade11: ['chemistry', 'physics', 'math', 'english', 'biology'],
  grade12: []
};

export type CourseSection =
  | 'dashboard'
  | 'roadmap'
  | 'practice'
  | 'question-types'
  | 'advanced'
  | 'ai-tutor'
  | 'mistakes'
  | 'exam'
  | 'vocabulary'
  | 'grammar';

export interface CourseRouteContext {
  grade: GradeCode;
  subject: SubjectCode;
  section: CourseSection;
  detailId?: string;
}

const courseSections = new Set<CourseSection>([
  'dashboard', 'roadmap', 'practice', 'question-types', 'advanced',
  'ai-tutor', 'mistakes', 'exam', 'vocabulary', 'grammar'
]);

export const isCourseContext = (
  grade: string | undefined,
  subject: string | undefined
): grade is GradeCode => {
  if (!grade || !subject || !(grade in AVAILABLE_SUBJECTS_BY_GRADE)) return false;
  return AVAILABLE_SUBJECTS_BY_GRADE[grade as GradeCode].includes(subject as SubjectCode);
};

export const buildCoursePath = (
  grade: GradeCode,
  subject: SubjectCode,
  section: CourseSection = 'dashboard',
  detailId?: string
): string => {
  const suffix = detailId ? `/${encodeURIComponent(detailId)}` : '';
  return `/app/${grade}/${subject}/${section}${suffix}`;
};

export const parseCoursePath = (pathname: string): CourseRouteContext | null => {
  const [prefix, grade, subject, rawSection = 'dashboard', detailId] = pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/');
  if (prefix !== 'app' || !isCourseContext(grade, subject)) return null;
  if (!courseSections.has(rawSection as CourseSection)) return null;
  return {
    grade: grade as GradeCode,
    subject: subject as SubjectCode,
    section: rawSection as CourseSection,
    detailId: detailId ? decodeURIComponent(detailId) : undefined
  };
};

export const changeCourseContext = (
  pathname: string,
  grade: GradeCode,
  subject: SubjectCode
): string => {
  const current = parseCoursePath(pathname);
  if (!current) return buildCoursePath(grade, subject, 'roadmap');
  const supportsAdvanced = grade === 'grade10' && ['math', 'physics', 'chemistry', 'biology'].includes(subject);
  const supportsVocabulary = grade === 'grade10' && subject === 'english';
  const supportsGrammar = subject === 'english';
  const section = current.section === 'advanced' && !supportsAdvanced
    ? 'roadmap'
    : current.section === 'vocabulary' && !supportsVocabulary
      ? 'roadmap'
      : current.section === 'grammar' && !supportsGrammar
        ? 'roadmap'
        : current.section;
  const keepDetail = section === current.section ? current.detailId : undefined;
  return buildCoursePath(grade, subject, section, keepDetail);
};

export const COURSE_ROUTES = {
  dashboard: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'dashboard'),
  roadmap: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'roadmap'),
  practice: (grade: GradeCode, subject: SubjectCode, questionTypeId?: string) =>
    buildCoursePath(grade, subject, 'practice', questionTypeId),
  questionType: (grade: GradeCode, subject: SubjectCode, questionTypeId: string) =>
    buildCoursePath(grade, subject, 'question-types', questionTypeId),
  advanced: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'advanced'),
  aiTutor: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'ai-tutor'),
  mistakes: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'mistakes'),
  exam: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'exam'),
  vocabulary: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'vocabulary'),
  grammar: (grade: GradeCode, subject: SubjectCode) => buildCoursePath(grade, subject, 'grammar')
} as const;
