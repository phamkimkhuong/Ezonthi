import { COURSE_DATA_SCHEMA_VERSION } from './types';
import type {
  AssessmentBundle,
  CourseDataBundle,
  CourseModuleData,
  LegacySubjectDataInput,
  SubjectRuntimeData,
  TheoryBlock
} from './types';
import { subjectSchemaFor } from './subjectProfiles';

export const emptyAssessmentBundle = (): AssessmentBundle => ({
  exams: [],
  questions: [],
  solutions: [],
  blueprints: []
});

export const defineCourseModule = (
  module: Omit<
    CourseModuleData,
    'theory' | 'outcomes' | 'misconceptions' | 'practiceBlueprints' | 'assessments' | 'media'
  > &
    Partial<
      Pick<
        CourseModuleData,
        'theory' | 'outcomes' | 'misconceptions' | 'practiceBlueprints' | 'assessments' | 'media'
      >
    >
): CourseModuleData => ({
  ...module,
  theory: module.theory ?? [],
  outcomes: module.outcomes ?? [],
  misconceptions: module.misconceptions ?? [],
  practiceBlueprints: module.practiceBlueprints ?? [],
  assessments: module.assessments ?? emptyAssessmentBundle(),
  media: module.media ?? []
});

export const defineCourse = (
  course: Omit<CourseDataBundle, 'schemaVersion' | 'subjectSchema' | 'studentDataCompatibility'>
): CourseDataBundle => ({
  ...course,
  schemaVersion: COURSE_DATA_SCHEMA_VERSION,
  subjectSchema: subjectSchemaFor(course.course.subject),
  studentDataCompatibility: {
    studentDataVersion: 2,
    identityStrategy: 'stable-question-id',
    legacyRuntimeAdapter: true,
    preservesAttemptIds: true,
    preservesQuestionIds: true,
  },
});

const theoryBlockToParagraphs = (block: TheoryBlock): string[] => {
  const paragraphs = [
    `**${block.title}**\n${block.content}`,
    block.objectives.length > 0
      ? `**Mục tiêu cần đạt**\n${block.objectives.map(item => `• ${item}`).join('\n')}`
      : '',
    ...block.formulas.map(formula => {
      const variables = formula.variables
        .map(variable => {
          const unit = variable.unit ? `; đơn vị: ${variable.unit}` : '';
          const note = variable.note ? `; ${variable.note}` : '';
          return `• $${variable.symbol}$: ${variable.meaning}${unit}${note}`;
        })
        .join('\n');
      const conditions = formula.conditions.map(item => `• ${item}`).join('\n');
      const notes = (formula.notes ?? []).map(item => `• ${item}`).join('\n');
      return [
        `**${formula.label}**`,
        `$$${formula.expression}$$`,
        variables,
        conditions ? `**Điều kiện áp dụng**\n${conditions}` : '',
        notes ? `**Ghi chú**\n${notes}` : ''
      ]
        .filter(Boolean)
        .join('\n');
    }),
    block.keyPoints.length > 0
      ? `**Ghi nhớ nhanh**\n${block.keyPoints.map(item => `• ${item}`).join('\n')}`
      : '',
    ...block.workedExamples.map(example =>
      [
        `**Ví dụ: ${example.title}**`,
        example.problem,
        ...example.steps.map((step, index) => `**Bước ${index + 1}:** ${step}`),
        `**Kết luận:** ${example.answer}`
      ].join('\n')
    )
  ];

  return paragraphs.filter(Boolean);
};

export const toSubjectRuntimeData = (
  bundle: CourseDataBundle
): SubjectRuntimeData => {
  const moduleAssessments = bundle.modules.map(module => module.assessments);
  const assessmentQuestions = [
    ...moduleAssessments.flatMap(assessment => assessment.questions),
    ...bundle.assessments.questions
  ];
  const assessmentSolutions = [
    ...moduleAssessments.flatMap(assessment => assessment.solutions),
    ...bundle.assessments.solutions
  ];
  const hydratedQuestionTypes = bundle.modules.flatMap(module =>
    module.questionTypes.map(questionType => {
      const mappedTheory = module.theory
        .filter(block => block.questionTypeIds.includes(questionType.id))
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .flatMap(theoryBlockToParagraphs);
      const mappedCheckpoints = module.theory
        .filter(block => block.questionTypeIds.includes(questionType.id))
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .flatMap(block => block.checkpoints);

      return {
        ...questionType,
        theory:
          mappedTheory.length > 0
            ? mappedTheory
            : questionType.theory,
        theoryCheckpoints:
          mappedCheckpoints.length > 0
            ? mappedCheckpoints
            : questionType.theoryCheckpoints
      };
    })
  );

  return {
    topics: bundle.modules.flatMap(module => module.topics),
    questionTypes: hydratedQuestionTypes,
    questions: [
      ...bundle.modules.flatMap(module => module.practiceQuestions),
      ...assessmentQuestions
    ],
    solutions: [
      ...bundle.modules.flatMap(module => module.practiceSolutions),
      ...assessmentSolutions
    ],
    mockExams: [
      ...moduleAssessments.flatMap(assessment => assessment.exams),
      ...bundle.assessments.exams
    ],
    assessmentBlueprints: [
      ...moduleAssessments.flatMap(assessment => assessment.blueprints),
      ...bundle.assessments.blueprints
    ],
    learningOutcomes: bundle.modules.flatMap(module => module.outcomes),
    learningMisconceptions: bundle.modules.flatMap(module => module.misconceptions),
    courseBundle: bundle,
    dataContract: {
      schemaVersion: bundle.schemaVersion,
      studentDataVersion: bundle.studentDataCompatibility.studentDataVersion,
      identityStrategy: bundle.studentDataCompatibility.identityStrategy,
    },
  };
};

export const normalizeLegacySubjectData = (
  legacy: LegacySubjectDataInput
): SubjectRuntimeData => ({
  ...legacy,
  assessmentBlueprints: legacy.assessmentBlueprints ?? [],
  learningOutcomes: legacy.learningOutcomes ?? [],
  learningMisconceptions: legacy.learningMisconceptions ?? [],
  dataContract: {
    schemaVersion: COURSE_DATA_SCHEMA_VERSION,
    studentDataVersion: 2,
    identityStrategy: 'stable-question-id'
  }
});
