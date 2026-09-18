import type {
  AssessmentBlueprint,
  GradeCode,
  LearningMisconception,
  LearningOutcome,
  MockExam,
  Question,
  QuestionType,
  Solution,
  SubjectCode,
  Topic
} from '@/types';
import type {
  CourseDataBundle,
  LegacySubjectDataInput,
  SubjectRuntimeData
} from './schema';
import { normalizeLegacySubjectData, toSubjectRuntimeData } from './schema';
import { loadRegisteredCourseBundle } from './courseRegistry';

// Interface cho cấu trúc bộ nhớ đệm (Cache) của từng môn học
export type SubjectDataCache = SubjectRuntimeData;

// Bộ nhớ đệm lưu trữ dữ liệu các môn đã nạp
const dataCache: Record<string, SubjectDataCache> = {};

// Hàm nạp động dữ liệu môn học
export const loadSubjectData = async (grade: GradeCode, subject: SubjectCode): Promise<SubjectDataCache> => {
  const cacheKey = `${grade}-${subject}`;
  if (dataCache[cacheKey]) {
    return dataCache[cacheKey];
  }

  const registeredCourse = await loadRegisteredCourseBundle(grade, subject);
  if (registeredCourse) {
    const registeredData = toSubjectRuntimeData(registeredCourse);
    dataCache[cacheKey] = registeredData;
    return registeredData;
  }

  let data: LegacySubjectDataInput;

  switch (grade) {
    case 'grade9':
      if (subject === 'math') {
        const [topics, questionTypes, questions, solutions, mockExams, mockSolutions, mathMockQuestions] = await Promise.all([
          import('./grade9/math/topics.json').then(m => m.default as Topic[]),
          import('./grade9/math/questionTypes.json').then(m => m.default as QuestionType[]),
          import('./grade9/math/questions.json').then(m => m.default as Question[]),
          import('./grade9/math/solutions.json').then(m => m.default as Solution[]),
          import('./grade9/mockExamsList.json').then(m => (m.default as MockExam[]).filter(e => e.subjectId === 'math')),
          import('./grade9/mockSolutionsList.json').then(m => m.default as Solution[]),
          import('./grade9/mathMockQuestions.json').then(m => m.default as Question[])
        ]);
        
        data = {
          topics,
          questionTypes,
          questions: [...questions, ...mathMockQuestions],
          solutions: [...solutions, ...mockSolutions],
          mockExams
        };
      } else if (subject === 'english') {
        const [topics, questionTypes, questions, solutions, mockExams, mockSolutions, englishMockQuestions] = await Promise.all([
          import('./grade9/english/topics.json').then(m => m.default as Topic[]),
          import('./grade9/english/questionTypes.json').then(m => m.default as QuestionType[]),
          import('./grade9/english/questions.json').then(m => m.default as Question[]),
          import('./grade9/english/solutions.json').then(m => m.default as Solution[]),
          import('./grade9/mockExamsList.json').then(m => (m.default as MockExam[]).filter(e => e.subjectId === 'english')),
          import('./grade9/mockSolutionsList.json').then(m => m.default as Solution[]),
          import('./grade9/englishMockQuestions.json').then(m => m.default as Question[])
        ]);

        data = {
          topics,
          questionTypes,
          questions: [...questions, ...englishMockQuestions],
          solutions: [...solutions, ...mockSolutions],
          mockExams
        };
      } else {
        data = { topics: [], questionTypes: [], questions: [], solutions: [], mockExams: [] };
      }
      break;

    case 'grade10':
      if (subject === 'math') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade10/math/topics'),
          import('./grade10/math/questionTypes'),
          import('./grade10/math/questions'),
          import('./grade10/math/solutions'),
          import('./grade10/math/learningPath'),
          import('./grade10/math/assessments')
        ]);
        data = {
          topics: topicsMod.g10MathTopics,
          questionTypes: qtMod.g10MathQuestionTypes,
          questions: [...qMod.g10MathQuestions, ...assessmentsMod.g10MathAssessmentQuestions],
          solutions: [...sMod.g10MathSolutions, ...assessmentsMod.g10MathAssessmentSolutions],
          mockExams: assessmentsMod.g10MathAssessmentExams,
          assessmentBlueprints: assessmentsMod.g10MathAssessmentBlueprints,
          learningOutcomes: learningPathMod.g10MathOutcomes,
          learningMisconceptions: learningPathMod.g10MathMisconceptions
        };
      } else if (subject === 'english') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade10/english/topics'),
          import('./grade10/english/questionTypes'),
          import('./grade10/english/questions'),
          import('./grade10/english/solutions'),
          import('./grade10/english/learningPath'),
          import('./grade10/english/assessments')
        ]);
        data = {
          topics: topicsMod.g10EnglishTopics,
          questionTypes: qtMod.g10EnglishQuestionTypes,
          questions: qMod.g10EnglishQuestions,
          solutions: sMod.g10EnglishSolutions,
          mockExams: assessmentsMod.g10EnglishAssessmentExams,
          assessmentBlueprints: assessmentsMod.g10EnglishAssessmentBlueprints,
          learningOutcomes: learningPathMod.g10EnglishOutcomes,
          learningMisconceptions: learningPathMod.g10EnglishMisconceptions
        };
      } else if (subject === 'chemistry') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade10/chemistry/topics'),
          import('./grade10/chemistry/questionTypes'),
          import('./grade10/chemistry/questions'),
          import('./grade10/chemistry/solutions'),
          import('./grade10/chemistry/learningPath'),
          import('./grade10/chemistry/assessments')
        ]);
        data = {
          topics: topicsMod.g10ChemistryTopics,
          questionTypes: qtMod.g10ChemistryQuestionTypes,
          questions: [...qMod.g10ChemistryQuestions, ...assessmentsMod.g10ChemistryAssessmentQuestions],
          solutions: [...sMod.g10ChemistrySolutions, ...assessmentsMod.g10ChemistryAssessmentSolutions],
          mockExams: assessmentsMod.g10ChemistryAssessmentExams,
          assessmentBlueprints: assessmentsMod.g10ChemistryAssessmentBlueprints,
          learningOutcomes: learningPathMod.g10ChemistryOutcomes,
          learningMisconceptions: learningPathMod.g10ChemistryMisconceptions
        };
      } else if (subject === 'biology') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade10/biology/topics'),
          import('./grade10/biology/questionTypes'),
          import('./grade10/biology/questions'),
          import('./grade10/biology/solutions'),
          import('./grade10/biology/learningPath'),
          import('./grade10/biology/assessments')
        ]);
        data = {
          topics: topicsMod.g10BiologyTopics,
          questionTypes: qtMod.g10BiologyQuestionTypes,
          questions: [...qMod.g10BiologyQuestions, ...assessmentsMod.g10BiologyAssessmentQuestions],
          solutions: [...sMod.g10BiologySolutions, ...assessmentsMod.g10BiologyAssessmentSolutions],
          mockExams: assessmentsMod.g10BiologyAssessmentExams,
          assessmentBlueprints: assessmentsMod.g10BiologyAssessmentBlueprints,
          learningOutcomes: learningPathMod.g10BiologyOutcomes,
          learningMisconceptions: learningPathMod.g10BiologyMisconceptions
        };
      } else if (subject === 'physics') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade10/physics/topics'),
          import('./grade10/physics/questionTypes'),
          import('./grade10/physics/questions'),
          import('./grade10/physics/solutions'),
          import('./grade10/physics/learningPath'),
          import('./grade10/physics/assessments')
        ]);
        data = {
          topics: topicsMod.g10PhysicsTopics,
          questionTypes: qtMod.g10PhysicsQuestionTypes,
          questions: [...qMod.g10PhysicsQuestions, ...assessmentsMod.g10PhysicsAssessmentQuestions],
          solutions: [...sMod.g10PhysicsSolutions, ...assessmentsMod.g10PhysicsAssessmentSolutions],
          mockExams: assessmentsMod.g10PhysicsAssessmentExams,
          assessmentBlueprints: assessmentsMod.g10PhysicsAssessmentBlueprints,
          learningOutcomes: learningPathMod.g10PhysicsOutcomes,
          learningMisconceptions: learningPathMod.g10PhysicsMisconceptions
        };
      } else if (subject === 'history') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade10/history/topics'),
          import('./grade10/history/questionTypes'),
          import('./grade10/history/questions'),
          import('./grade10/history/solutions'),
          import('./grade10/history/learningPath'),
          import('./grade10/history/assessments')
        ]);
        data = {
          topics: topicsMod.g10HistoryTopics,
          questionTypes: qtMod.g10HistoryQuestionTypes,
          questions: [...qMod.g10HistoryQuestions, ...assessmentsMod.g10HistoryAssessmentQuestions],
          solutions: [...sMod.g10HistorySolutions, ...assessmentsMod.g10HistoryAssessmentSolutions],
          mockExams: assessmentsMod.g10HistoryAssessmentExams,
          assessmentBlueprints: assessmentsMod.g10HistoryAssessmentBlueprints,
          learningOutcomes: learningPathMod.g10HistoryOutcomes,
          learningMisconceptions: learningPathMod.g10HistoryMisconceptions
        };
      } else {
        data = { topics: [], questionTypes: [], questions: [], solutions: [], mockExams: [] };
      }
      break;

    case 'grade11':
      if (subject === 'chemistry') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade11/chemistry/topics'),
          import('./grade11/chemistry/questionTypes'),
          import('./grade11/chemistry/questions'),
          import('./grade11/chemistry/solutions'),
          import('./grade11/chemistry/learningPath'),
          import('./grade11/chemistry/assessments')
        ]);
        data = {
          topics: topicsMod.g11ChemistryTopics,
          questionTypes: qtMod.g11ChemistryQuestionTypes,
          questions: [...qMod.g11ChemistryQuestions, ...assessmentsMod.g11ChemistryAssessmentQuestions],
          solutions: [...sMod.g11ChemistrySolutions, ...assessmentsMod.g11ChemistryAssessmentSolutions],
          mockExams: assessmentsMod.g11ChemistryAssessmentExams,
          assessmentBlueprints: assessmentsMod.g11ChemistryAssessmentBlueprints,
          learningOutcomes: learningPathMod.g11ChemistryOutcomes,
          learningMisconceptions: learningPathMod.g11ChemistryMisconceptions
        };
      } else if (subject === 'physics') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade11/physics/topics'),
          import('./grade11/physics/questionTypes'),
          import('./grade11/physics/questions'),
          import('./grade11/physics/solutions'),
          import('./grade11/physics/learningPath'),
          import('./grade11/physics/assessments')
        ]);
        data = {
          topics: topicsMod.g11PhysicsTopics,
          questionTypes: qtMod.g11PhysicsQuestionTypes,
          questions: [...qMod.g11PhysicsQuestions, ...assessmentsMod.g11PhysicsAssessmentQuestions],
          solutions: [...sMod.g11PhysicsSolutions, ...assessmentsMod.g11PhysicsAssessmentSolutions],
          mockExams: assessmentsMod.g11PhysicsAssessmentExams,
          assessmentBlueprints: assessmentsMod.g11PhysicsAssessmentBlueprints,
          learningOutcomes: learningPathMod.g11PhysicsOutcomes,
          learningMisconceptions: learningPathMod.g11PhysicsMisconceptions
        };
      } else if (subject === 'english') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade11/english/topics'),
          import('./grade11/english/questionTypes'),
          import('./grade11/english/questions'),
          import('./grade11/english/solutions'),
          import('./grade11/english/learningPath'),
          import('./grade11/english/assessments')
        ]);
        data = {
          topics: topicsMod.g11EnglishTopics,
          questionTypes: qtMod.g11EnglishQuestionTypes,
          questions: [...qMod.g11EnglishQuestions, ...assessmentsMod.g11EnglishAssessmentQuestions],
          solutions: [...sMod.g11EnglishSolutions, ...assessmentsMod.g11EnglishAssessmentSolutions],
          mockExams: assessmentsMod.g11EnglishAssessmentExams,
          assessmentBlueprints: assessmentsMod.g11EnglishAssessmentBlueprints,
          learningOutcomes: learningPathMod.g11EnglishOutcomes,
          learningMisconceptions: learningPathMod.g11EnglishMisconceptions
        };
      } else if (subject === 'biology') {
        const [topicsMod, qtMod, qMod, sMod, learningPathMod, assessmentsMod] = await Promise.all([
          import('./grade11/biology/topics'),
          import('./grade11/biology/questionTypes'),
          import('./grade11/biology/questions'),
          import('./grade11/biology/solutions'),
          import('./grade11/biology/learningPath'),
          import('./grade11/biology/assessments')
        ]);
        data = {
          topics: topicsMod.g11BiologyTopics,
          questionTypes: qtMod.g11BiologyQuestionTypes,
          questions: [...qMod.g11BiologyQuestions, ...assessmentsMod.g11BiologyAssessmentQuestions],
          solutions: [...sMod.g11BiologySolutions, ...assessmentsMod.g11BiologyAssessmentSolutions],
          mockExams: assessmentsMod.g11BiologyAssessmentExams,
          assessmentBlueprints: assessmentsMod.g11BiologyAssessmentBlueprints || [],
          learningOutcomes: learningPathMod.g11BiologyOutcomes,
          learningMisconceptions: learningPathMod.g11BiologyMisconceptions
        };
      } else {
        data = { topics: [], questionTypes: [], questions: [], solutions: [], mockExams: [] };
      }
      break;

    default:
      throw new Error(`Unsupported grade: ${grade}`);
  }

  const normalizedData = normalizeLegacySubjectData(data);
  dataCache[cacheKey] = normalizedData;
  return normalizedData;
};

// Đồng bộ hóa việc truy xuất thông tin từ bộ nhớ cache
export const getTopics = (grade: GradeCode, subject: SubjectCode): Topic[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.topics || [];
};

export const getQuestionTypes = (grade: GradeCode, subject: SubjectCode): QuestionType[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.questionTypes || [];
};

export const getQuestions = (grade: GradeCode, subject: SubjectCode): Question[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.questions || [];
};

/**
 * Ngân hàng chỉ dùng cho màn hình luyện tập.
 *
 * Tách các câu hỏi bài kiểm tra định kỳ để không lọt vào lộ trình luyện tập thông thường.
 */
export const getPracticeQuestions = (grade: GradeCode, subject: SubjectCode): Question[] => {
  const questions = getQuestions(grade, subject);

  if (grade === 'grade11' && subject === 'math') {
    return questions.filter(question => !question.id.startsWith('math11-assess-'));
  }

  if (grade === 'grade10' && subject === 'math') {
    return questions.filter(question => (
      !question.id.startsWith('mock-math10-')
      && !question.id.startsWith('math10-assess-')
    ));
  }

  if (grade === 'grade10' && subject === 'chemistry') {
    return questions.filter(question => (
      !question.id.startsWith('chem10-assess-')
      && !question.id.startsWith('chem10-theory-')
    ));
  }

  if (grade === 'grade10' && subject === 'biology') {
    return questions.filter(question => !question.id.startsWith('bio10-assess-'));
  }

  return questions;
};

export const getSolutions = (grade: GradeCode, subject: SubjectCode): Solution[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.solutions || [];
};

export const getMockExams = (grade: GradeCode, subject: SubjectCode): MockExam[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.mockExams || [];
};

export const getAssessmentBlueprints = (grade: GradeCode, subject: SubjectCode): AssessmentBlueprint[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.assessmentBlueprints || [];
};

export const getLearningOutcomes = (grade: GradeCode, subject: SubjectCode): LearningOutcome[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.learningOutcomes || [];
};

export const getLearningMisconceptions = (grade: GradeCode, subject: SubjectCode): LearningMisconception[] => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.learningMisconceptions || [];
};

export const getCourseBundle = (
  grade: GradeCode,
  subject: SubjectCode
): CourseDataBundle | undefined => {
  const cacheKey = `${grade}-${subject}`;
  return dataCache[cacheKey]?.courseBundle;
};

export const isSubjectDataLoaded = (grade: GradeCode, subject: SubjectCode): boolean => {
  return Boolean(dataCache[`${grade}-${subject}`]);
};

