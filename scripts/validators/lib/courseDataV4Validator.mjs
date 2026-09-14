import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const loadTypeScriptModule = async filePath => {
  const source = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2023,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove
    },
    fileName: filePath,
    reportDiagnostics: true
  });
  const diagnostics = transpiled.diagnostics ?? [];
  if (diagnostics.length > 0) {
    const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: fileName => fileName,
      getNewLine: () => '\n'
    });
    throw new Error(message);
  }
  if (/^\s*import\s/m.test(transpiled.outputText)) {
    throw new Error(`${filePath}: leaf data file không được có runtime import.`);
  }
  const encoded = Buffer.from(transpiled.outputText).toString('base64');
  return import(`data:text/javascript;base64,${encoded}#${encodeURIComponent(filePath)}`);
};

const arrayExport = (module, suffix, filePath) => {
  const entry = Object.entries(module).find(
    ([name, value]) => name.endsWith(suffix) && Array.isArray(value)
  );
  if (!entry) throw new Error(`${filePath}: không tìm thấy array export *${suffix}.`);
  return entry[1];
};

const objectExport = (module, suffix, filePath) => {
  const entry = Object.entries(module).find(
    ([name, value]) =>
      name.endsWith(suffix) &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
  );
  if (!entry) throw new Error(`${filePath}: không tìm thấy object export *${suffix}.`);
  return entry[1];
};

const duplicates = (items, keyOf) => {
  const counts = new Map();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].filter(([, count]) => count > 1).map(([key]) => key);
};

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

export const validateCourseDataV4 = async ({
  courseDirectory,
  courseId,
  expectedLessonCount,
  expectedCurriculumModuleCount,
  expectedOfficialRequirementCount,
  expectedOutcomeCount,
  expectedQuestionTypeCount,
  expectedPracticeTargetCount,
  expectedTheoryLessonCount,
  expectedTheoryQuestionTypeCount,
  expectedAssessmentExamCount,
  expectedAssessmentBlueprintCount,
  expectedAssessmentQuestionCount,
  expectedAssessmentSolutionCount,
  expectedAssessmentQuestionTypeCount,
  allowPartialCoverage = false
}) => {
  const errors = [];
  const warnings = [];
  const reportCoverageIssue = message => {
    if (!allowPartialCoverage) errors.push(message);
  };
  const absoluteCourseDirectory = path.resolve(courseDirectory);
  const curriculumDirectory = path.join(absoluteCourseDirectory, 'curriculum');
  const modulesDirectory = path.join(absoluteCourseDirectory, 'modules');

  for (const requiredPath of [
    path.join(absoluteCourseDirectory, 'course.ts'),
    path.join(curriculumDirectory, 'sources.ts'),
    path.join(curriculumDirectory, 'textbookMap.ts'),
    path.join(curriculumDirectory, 'officialRequirements.ts'),
    path.join(curriculumDirectory, 'outcomeManifest.ts'),
    modulesDirectory
  ]) {
    if (!fs.existsSync(requiredPath)) errors.push(`Thiếu ${path.relative(process.cwd(), requiredPath)}.`);
  }
  if (errors.length > 0) return { errors, warnings, stats: {} };

  const sourcesPath = path.join(curriculumDirectory, 'sources.ts');
  const lessonsPath = path.join(curriculumDirectory, 'textbookMap.ts');
  const requirementsPath = path.join(curriculumDirectory, 'officialRequirements.ts');
  const outcomeManifestPath = path.join(curriculumDirectory, 'outcomeManifest.ts');

  const [sourcesModule, lessonsModule, requirementsModule, outcomeManifestModule] =
    await Promise.all([
      loadTypeScriptModule(sourcesPath),
      loadTypeScriptModule(lessonsPath),
      loadTypeScriptModule(requirementsPath),
      loadTypeScriptModule(outcomeManifestPath)
    ]);

  const sources = arrayExport(sourcesModule, 'CurriculumSources', sourcesPath);
  const lessons = arrayExport(lessonsModule, 'TextbookLessons', lessonsPath);
  const officialRequirements = arrayExport(
    requirementsModule,
    'OfficialRequirements',
    requirementsPath
  );
  const outcomeManifest = arrayExport(
    outcomeManifestModule,
    'OutcomeManifest',
    outcomeManifestPath
  );

  const moduleDirectories = fs
    .readdirSync(modulesDirectory)
    .map(name => path.join(modulesDirectory, name))
    .filter(directory => fs.statSync(directory).isDirectory())
    .sort();

  const manifests = [];
  const topics = [];
  const questionTypes = [];
  const questions = [];
  const solutions = [];
  const outcomes = [];
  const misconceptions = [];
  const theory = [];
  const practiceBlueprints = [];
  const assessmentExams = [];
  const assessmentQuestions = [];
  const assessmentSolutions = [];
  const assessmentBlueprints = [];

  for (const moduleDirectory of moduleDirectories) {
    const requiredModuleFiles = [
      'index.ts',
      'manifest.ts',
      'topics.ts',
      'lessons.ts',
      'theory.ts',
      'learningPath.ts',
      'questionTypes.ts',
      'questions.ts',
      'solutions.ts',
      'practiceBlueprint.ts'
    ];
    for (const fileName of requiredModuleFiles) {
      if (!fs.existsSync(path.join(moduleDirectory, fileName))) {
        errors.push(`${path.basename(moduleDirectory)}: thiếu ${fileName}.`);
      }
    }
    if (errors.length > 0) continue;

    const [
      manifestModule,
      topicsModule,
      theoryModule,
      learningPathModule,
      questionTypesModule,
      questionsModule,
      solutionsModule,
      practiceBlueprintModule
    ] = await Promise.all([
      loadTypeScriptModule(path.join(moduleDirectory, 'manifest.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'topics.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'theory.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'learningPath.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'questionTypes.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'questions.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'solutions.ts')),
      loadTypeScriptModule(path.join(moduleDirectory, 'practiceBlueprint.ts'))
    ]);

    manifests.push(
      objectExport(manifestModule, 'Manifest', path.join(moduleDirectory, 'manifest.ts'))
    );
    topics.push(...arrayExport(topicsModule, 'Topics', path.join(moduleDirectory, 'topics.ts')));
    theory.push(...arrayExport(theoryModule, 'Theory', path.join(moduleDirectory, 'theory.ts')));
    outcomes.push(
      ...arrayExport(learningPathModule, 'Outcomes', path.join(moduleDirectory, 'learningPath.ts'))
    );
    misconceptions.push(
      ...arrayExport(
        learningPathModule,
        'Misconceptions',
        path.join(moduleDirectory, 'learningPath.ts')
      )
    );
    questionTypes.push(
      ...arrayExport(
        questionTypesModule,
        'QuestionTypes',
        path.join(moduleDirectory, 'questionTypes.ts')
      )
    );
    questions.push(
      ...arrayExport(questionsModule, 'Questions', path.join(moduleDirectory, 'questions.ts'))
    );
    solutions.push(
      ...arrayExport(solutionsModule, 'Solutions', path.join(moduleDirectory, 'solutions.ts'))
    );
    const expansionPath = path.join(moduleDirectory, 'questionsExpansion.ts');
    if (fs.existsSync(expansionPath)) {
      const expansionModule = await loadTypeScriptModule(expansionPath);
      questions.push(...arrayExport(expansionModule, 'ExpansionQuestions', expansionPath));
      solutions.push(...arrayExport(expansionModule, 'ExpansionSolutions', expansionPath));
    }
    practiceBlueprints.push(
      ...arrayExport(
        practiceBlueprintModule,
        'PracticeBlueprints',
        path.join(moduleDirectory, 'practiceBlueprint.ts')
      )
    );
  }

  const assessmentsPath = path.join(absoluteCourseDirectory, 'assessments.ts');
  if (fs.existsSync(assessmentsPath)) {
    const assessmentsModule = await loadTypeScriptModule(assessmentsPath);
    assessmentExams.push(
      ...arrayExport(assessmentsModule, 'AssessmentExams', assessmentsPath)
    );
    assessmentQuestions.push(
      ...arrayExport(assessmentsModule, 'AssessmentQuestions', assessmentsPath)
    );
    assessmentSolutions.push(
      ...arrayExport(assessmentsModule, 'AssessmentSolutions', assessmentsPath)
    );
    assessmentBlueprints.push(
      ...arrayExport(assessmentsModule, 'AssessmentBlueprints', assessmentsPath)
    );
  }

  const allQuestions = [...questions, ...assessmentQuestions];
  const allSolutions = [...solutions, ...assessmentSolutions];

  if (
    expectedAssessmentExamCount !== undefined &&
    assessmentExams.length !== expectedAssessmentExamCount
  ) {
    errors.push(
      `Phải có ${expectedAssessmentExamCount} đề kiểm tra, hiện có ${assessmentExams.length}.`
    );
  }
  if (
    expectedAssessmentBlueprintCount !== undefined &&
    assessmentBlueprints.length !== expectedAssessmentBlueprintCount
  ) {
    errors.push(
      `Phải có ${expectedAssessmentBlueprintCount} ma trận kiểm tra, hiện có ${assessmentBlueprints.length}.`
    );
  }
  if (
    expectedAssessmentQuestionCount !== undefined &&
    assessmentQuestions.length !== expectedAssessmentQuestionCount
  ) {
    errors.push(
      `Phải có ${expectedAssessmentQuestionCount} câu đánh giá, hiện có ${assessmentQuestions.length}.`
    );
  }
  if (
    expectedAssessmentSolutionCount !== undefined &&
    assessmentSolutions.length !== expectedAssessmentSolutionCount
  ) {
    errors.push(
      `Phải có ${expectedAssessmentSolutionCount} lời giải đánh giá, hiện có ${assessmentSolutions.length}.`
    );
  }
  const assessmentQuestionTypeCount = new Set(
    assessmentQuestions.map(question => question.questionTypeId)
  ).size;
  if (
    expectedAssessmentQuestionTypeCount !== undefined &&
    assessmentQuestionTypeCount !== expectedAssessmentQuestionTypeCount
  ) {
    errors.push(
      `Câu đánh giá phải phủ ${expectedAssessmentQuestionTypeCount} dạng bài, hiện phủ ${assessmentQuestionTypeCount}.`
    );
  }

  for (const [label, items, keyOf] of [
    ['Nguồn', sources, item => item.id],
    ['Bài học', lessons, item => item.id],
    ['Yêu cầu chính thức', officialRequirements, item => item.id],
    ['Outcome manifest', outcomeManifest, item => item.outcomeId],
    ['Module', manifests, item => item.id],
    ['Topic', topics, item => item.id],
    ['Dạng bài', questionTypes, item => item.id],
    ['Câu hỏi', allQuestions, item => item.id],
    ['Nội dung câu hỏi luyện tập', questions, item => item.content.replace(/\s+/g, ' ').trim()],
    ['Nội dung câu hỏi đánh giá', assessmentQuestions, item => item.content.replace(/\s+/g, ' ').trim()],
    ['Lời giải', allSolutions, item => item.questionId],
    ['Outcome', outcomes, item => item.id],
    ['Misconception', misconceptions, item => item.id],
    ['Theory block', theory, item => item.id],
    ['Practice blueprint', practiceBlueprints, item => item.questionTypeId],
    ['Đề kiểm tra', assessmentExams, item => item.id],
    ['Ma trận kiểm tra', assessmentBlueprints, item => item.id]
  ]) {
    for (const duplicate of duplicates(items, keyOf)) {
      errors.push(`${label} bị trùng: ${duplicate}.`);
    }
  }

  if (lessons.length !== expectedLessonCount) {
    errors.push(`Mục lục phải có ${expectedLessonCount} bài, hiện có ${lessons.length}.`);
  }
  if (
    expectedOfficialRequirementCount !== undefined &&
    officialRequirements.length !== expectedOfficialRequirementCount
  ) {
    errors.push(
      `Phải có ${expectedOfficialRequirementCount} yêu cầu chính thức, hiện có ${officialRequirements.length}.`
    );
  }
  const curriculumModuleIds = new Set(lessons.map(item => item.moduleId));
  if (curriculumModuleIds.size !== expectedCurriculumModuleCount) {
    errors.push(
      `Mục lục phải có ${expectedCurriculumModuleCount} module/chương, hiện có ${curriculumModuleIds.size}.`
    );
  }
  for (const [index, lesson] of [...lessons].sort((a, b) => a.orderIndex - b.orderIndex).entries()) {
    if (lesson.orderIndex !== index + 1 || lesson.lessonNumber !== index + 1) {
      errors.push(`${lesson.id}: lessonNumber/orderIndex không liên tục.`);
    }
    if (lesson.courseId !== courseId) errors.push(`${lesson.id}: courseId không khớp.`);
    if (!Array.isArray(lesson.sourceIds) || lesson.sourceIds.length === 0) {
      errors.push(`${lesson.id}: thiếu sourceIds.`);
    }
  }

  const sourceById = new Map(sources.map(item => [item.id, item]));
  const lessonById = new Map(lessons.map(item => [item.id, item]));
  const manifestById = new Map(manifests.map(item => [item.id, item]));
  const topicById = new Map(topics.map(item => [item.id, item]));
  const typeById = new Map(questionTypes.map(item => [item.id, item]));
  const questionById = new Map(allQuestions.map(item => [item.id, item]));
  const solutionByQuestionId = new Map(allSolutions.map(item => [item.questionId, item]));
  const outcomeById = new Map(outcomes.map(item => [item.id, item]));
  const misconceptionById = new Map(misconceptions.map(item => [item.id, item]));
  const requirementById = new Map(officialRequirements.map(item => [item.id, item]));
  const outcomeManifestById = new Map(outcomeManifest.map(item => [item.outcomeId, item]));
  const blueprintByTypeId = new Map(practiceBlueprints.map(item => [item.questionTypeId, item]));
  const assessmentBlueprintById = new Map(
    assessmentBlueprints.map(item => [item.id, item])
  );
  const sameMembers = (left = [], right = []) =>
    left.length === right.length && left.every(item => right.includes(item));

  for (const lesson of lessons) {
    for (const sourceId of lesson.sourceIds) {
      if (!sourceById.has(sourceId)) errors.push(`${lesson.id}: source ${sourceId} không tồn tại.`);
    }
  }

  for (const manifest of manifests) {
    if (manifest.courseId !== courseId) errors.push(`${manifest.id}: courseId không khớp.`);
    for (const lessonId of manifest.lessonIds ?? []) {
      const mappedLesson = lessonById.get(lessonId);
      if (!mappedLesson) errors.push(`${manifest.id}: lesson ${lessonId} không tồn tại.`);
      else if (mappedLesson.moduleId !== manifest.id) {
        errors.push(`${manifest.id}: không sở hữu lesson ${lessonId}.`);
      }
    }
    for (const topicId of manifest.topicIds ?? []) {
      if (!topicById.has(topicId)) errors.push(`${manifest.id}: topic ${topicId} không tồn tại.`);
    }
  }

  for (const moduleId of curriculumModuleIds) {
    if (!manifestById.has(moduleId)) {
      warnings.push(`${moduleId}: đã có trong mục lục nhưng chưa có module dữ liệu.`);
    }
  }

  for (const requirement of officialRequirements) {
    if (requirement.courseId !== courseId) errors.push(`${requirement.id}: courseId không khớp.`);
    if (!manifestById.has(requirement.moduleId)) {
      if (requirement.coverageStatus === 'not_started') {
        warnings.push(
          `${requirement.id}: module ${requirement.moduleId} chưa triển khai; requirement đang ở trạng thái not_started.`
        );
      } else {
        errors.push(`${requirement.id}: moduleId ${requirement.moduleId} không tồn tại.`);
      }
    }
    if (!Array.isArray(requirement.sourceLocators) || requirement.sourceLocators.length === 0) {
      errors.push(`${requirement.id}: thiếu sourceLocators.`);
    }
    for (const lessonId of requirement.lessonIds ?? []) {
      const mappedLesson = lessonById.get(lessonId);
      if (!mappedLesson) errors.push(`${requirement.id}: lesson ${lessonId} không tồn tại.`);
      else if (mappedLesson.moduleId !== requirement.moduleId) {
        errors.push(`${requirement.id}: lesson ${lessonId} thuộc module khác.`);
      }
    }
    for (const outcomeId of requirement.implementedOutcomeIds ?? []) {
      if (!outcomeById.has(outcomeId)) errors.push(`${requirement.id}: outcome ${outcomeId} không tồn tại.`);
    }
  }

  for (const lesson of lessons) {
    if (!officialRequirements.some(requirement => requirement.lessonIds?.includes(lesson.id))) {
      errors.push(`${lesson.id}: chưa được yêu cầu chính thức nào bao phủ.`);
    }
  }

  if (expectedOutcomeCount !== undefined && outcomes.length !== expectedOutcomeCount) {
    errors.push(`Phải có ${expectedOutcomeCount} outcome, hiện có ${outcomes.length}.`);
  }
  for (const outcome of outcomes) {
    const mappedTopic = topicById.get(outcome.topicId);
    if (!mappedTopic) errors.push(`${outcome.id}: topicId không tồn tại.`);
    if (!outcomeManifestById.has(outcome.id)) errors.push(`${outcome.id}: thiếu outcome manifest.`);
    if (!Array.isArray(outcome.questionTypeIds) || outcome.questionTypeIds.length === 0) {
      errors.push(`${outcome.id}: chưa được gắn với dạng bài nào.`);
    }
    for (const prerequisiteId of outcome.prerequisiteOutcomeIds ?? []) {
      if (!outcomeById.has(prerequisiteId)) {
        errors.push(`${outcome.id}: prerequisite ${prerequisiteId} không tồn tại.`);
      }
    }
    for (const misconceptionId of outcome.misconceptionIds ?? []) {
      if (!misconceptionById.has(misconceptionId)) {
        errors.push(`${outcome.id}: misconception ${misconceptionId} không tồn tại.`);
      }
    }
    for (const questionTypeId of outcome.questionTypeIds ?? []) {
      if (!typeById.has(questionTypeId)) {
        errors.push(`${outcome.id}: questionType ${questionTypeId} không tồn tại.`);
      }
    }
  }

  for (const entry of outcomeManifest) {
    const runtimeOutcome = outcomeById.get(entry.outcomeId);
    if (!runtimeOutcome) {
      errors.push(`${entry.outcomeId}: manifest không có outcome runtime.`);
    } else {
      const runtimeTopic = topicById.get(runtimeOutcome.topicId);
      if (runtimeTopic?.moduleId !== entry.moduleId) {
        errors.push(`${entry.outcomeId}: moduleId trong manifest không khớp learning path.`);
      }
      if (runtimeOutcome.scope !== entry.scope) {
        errors.push(`${entry.outcomeId}: scope trong manifest không khớp learning path.`);
      }
    }
    for (const requirementId of entry.officialRequirementIds ?? []) {
      const requirement = requirementById.get(requirementId);
      if (!requirement) errors.push(`${entry.outcomeId}: requirement ${requirementId} không tồn tại.`);
      else if (!(requirement.implementedOutcomeIds ?? []).includes(entry.outcomeId)) {
        errors.push(`${entry.outcomeId}: mapping hai chiều với ${requirementId} chưa đồng bộ.`);
      }
    }
    for (const lessonId of entry.lessonIds ?? []) {
      const mappedLesson = lessonById.get(lessonId);
      if (!mappedLesson) errors.push(`${entry.outcomeId}: lesson ${lessonId} không tồn tại.`);
      else if (mappedLesson.moduleId !== entry.moduleId) {
        errors.push(`${entry.outcomeId}: lesson ${lessonId} thuộc module khác.`);
      }
    }
  }

  if (
    expectedQuestionTypeCount !== undefined &&
    questionTypes.length !== expectedQuestionTypeCount
  ) {
    errors.push(
      `Phải có ${expectedQuestionTypeCount} dạng bài, hiện có ${questionTypes.length}.`
    );
  }
  const coverageGaps = [];
  for (const type of questionTypes) {
    if (type.courseId !== courseId) errors.push(`${type.id}: courseId không khớp.`);
    if (!manifestById.has(type.moduleId)) errors.push(`${type.id}: moduleId không tồn tại.`);
    const mappedTopic = topicById.get(type.topicId);
    if (!mappedTopic) errors.push(`${type.id}: topicId không tồn tại.`);
    else if (mappedTopic.moduleId !== type.moduleId) {
      errors.push(`${type.id}: topic ${type.topicId} thuộc module khác.`);
    }
    if (!blueprintByTypeId.has(type.id)) errors.push(`${type.id}: thiếu practice blueprint.`);
    if (!Array.isArray(type.solvingSteps) || type.solvingSteps.length < 3) {
      errors.push(`${type.id}: cần ít nhất 3 bước giải.`);
    }
    if (!Array.isArray(type.outcomeIds) || type.outcomeIds.length === 0) {
      errors.push(`${type.id}: chưa được gắn với outcome nào.`);
    }
    for (const lessonId of type.lessonIds ?? []) {
      const mappedLesson = lessonById.get(lessonId);
      if (!mappedLesson) errors.push(`${type.id}: lesson ${lessonId} không tồn tại.`);
      else if (mappedLesson.moduleId !== type.moduleId) {
        errors.push(`${type.id}: lesson ${lessonId} thuộc module khác.`);
      }
    }
    for (const outcomeId of type.outcomeIds ?? []) {
      const mappedOutcome = outcomeById.get(outcomeId);
      if (!mappedOutcome) {
        errors.push(`${type.id}: outcome ${outcomeId} không tồn tại.`);
      } else {
        if (!mappedOutcome.questionTypeIds?.includes(type.id)) {
          errors.push(`${type.id}: mapping hai chiều với ${outcomeId} chưa đồng bộ.`);
        }
        if (topicById.get(mappedOutcome.topicId)?.moduleId !== type.moduleId) {
          errors.push(`${type.id}: outcome ${outcomeId} thuộc module khác.`);
        }
      }
    }
    const blueprint = blueprintByTypeId.get(type.id);
    const typeQuestions = questions.filter(question => question.questionTypeId === type.id);
    if (blueprint) {
      const typeSubTypes = type.subTypes ?? [];
      const blueprintSubTypes = blueprint.subTypes ?? [];
      if (!sameMembers(typeSubTypes.map(item => item.id), blueprintSubTypes.map(item => item.id))) {
        errors.push(`${type.id}: danh sách subtype giữa dạng bài và blueprint không khớp.`);
      }
      for (const subType of typeSubTypes) {
        const blueprintSubType = blueprintSubTypes.find(item => item.id === subType.id);
        if (
          blueprintSubType &&
          (blueprintSubType.name !== subType.name ||
            blueprintSubType.targetQuestionCount !== subType.targetQuestionCount)
        ) {
          errors.push(`${type.id}: subtype ${subType.id} không đồng bộ với blueprint.`);
        }
      }
      const coverage = type.practiceCoverage;
      if (!coverage) {
        errors.push(`${type.id}: thiếu practiceCoverage.`);
      } else if (
        coverage.targetQuestionCount !== blueprint.coverage.targetQuestionCount ||
        coverage.minimumQuestionsPerSubType !== blueprint.coverage.minimumQuestionsPerSubType ||
        coverage.masteryHoldoutCount !== blueprint.coverage.masteryHoldoutCount ||
        !sameMembers(
          coverage.requiredPracticeRoles,
          blueprint.coverage.requiredPracticeRoles
        ) ||
        !sameMembers(
          coverage.requiredRepresentations,
          blueprint.coverage.requiredRepresentations
        )
      ) {
        errors.push(`${type.id}: practiceCoverage không đồng bộ với blueprint.`);
      }
      const subTypeTarget = blueprintSubTypes.reduce(
        (total, item) => total + (item.targetQuestionCount ?? 0),
        0
      );
      if (subTypeTarget !== blueprint.coverage.targetQuestionCount) {
        errors.push(
          `${type.id}: tổng chỉ tiêu subtype ${subTypeTarget} không bằng chỉ tiêu dạng bài ${blueprint.coverage.targetQuestionCount}.`
        );
      }
      if (typeQuestions.length < blueprint.coverage.targetQuestionCount) {
        coverageGaps.push({
          questionTypeId: type.id,
          current: typeQuestions.length,
          target: blueprint.coverage.targetQuestionCount
        });
      }
      if (typeQuestions.length > 0) {
        for (const subType of blueprintSubTypes) {
          const subTypeQuestionCount = typeQuestions.filter(
            question => question.subTypeId === subType.id
          ).length;
          if (subTypeQuestionCount < blueprint.coverage.minimumQuestionsPerSubType) {
            reportCoverageIssue(
              `${type.id}: subtype ${subType.id} mới có ${subTypeQuestionCount}/${blueprint.coverage.minimumQuestionsPerSubType} câu tối thiểu.`
            );
          }
          if (
            subType.targetQuestionCount !== undefined &&
            subTypeQuestionCount !== subType.targetQuestionCount
          ) {
            reportCoverageIssue(
              `${type.id}: subtype ${subType.id} phải có ${subType.targetQuestionCount} câu, hiện có ${subTypeQuestionCount}.`
            );
          }
        }
        for (const requiredRole of blueprint.coverage.requiredPracticeRoles) {
          if (!typeQuestions.some(question => question.practiceRole === requiredRole)) {
            reportCoverageIssue(`${type.id}: ngân hàng thiếu practiceRole ${requiredRole}.`);
          }
        }
        for (const requiredRepresentation of blueprint.coverage.requiredRepresentations) {
          if (
            !typeQuestions.some(
              question => question.representationType === requiredRepresentation
            )
          ) {
            reportCoverageIssue(
              `${type.id}: ngân hàng thiếu representationType ${requiredRepresentation}.`
            );
          }
        }
        const holdoutCount = typeQuestions.filter(
          question => question.isMasteryHoldout === true
        ).length;
        if (holdoutCount !== blueprint.coverage.masteryHoldoutCount) {
          reportCoverageIssue(
            `${type.id}: phải có ${blueprint.coverage.masteryHoldoutCount} mastery holdout, hiện có ${holdoutCount}.`
          );
        }
      }
    }
  }

  for (const blueprint of practiceBlueprints) {
    if (!typeById.has(blueprint.questionTypeId)) {
      errors.push(`${blueprint.questionTypeId}: blueprint không có dạng bài tương ứng.`);
    }
  }

  const totalPracticeTarget = practiceBlueprints.reduce(
    (total, blueprint) => total + (blueprint.coverage?.targetQuestionCount ?? 0),
    0
  );
  if (
    expectedPracticeTargetCount !== undefined &&
    totalPracticeTarget !== expectedPracticeTargetCount
  ) {
    errors.push(
      `Chỉ tiêu ngân hàng phải là ${expectedPracticeTargetCount} câu, hiện là ${totalPracticeTarget}.`
    );
  }
  if (coverageGaps.length > 0) {
    const currentQuestionCount = coverageGaps.reduce((total, gap) => total + gap.current, 0);
    const targetQuestionCount = coverageGaps.reduce((total, gap) => total + gap.target, 0);
    warnings.push(
      `Độ phủ practice: ${coverageGaps.length}/${questionTypes.length} dạng chưa đủ, hiện có ${currentQuestionCount}/${targetQuestionCount} câu trong các dạng này.`
    );
  }

  for (const question of questions) {
    if (question.courseId !== courseId) errors.push(`${question.id}: courseId không khớp.`);
    if (!manifestById.has(question.moduleId)) errors.push(`${question.id}: moduleId không tồn tại.`);
    const mappedLesson = lessonById.get(question.lessonId);
    if (!mappedLesson) errors.push(`${question.id}: lessonId không tồn tại.`);
    else if (mappedLesson.moduleId !== question.moduleId) {
      errors.push(`${question.id}: lessonId thuộc module khác.`);
    }
    const mappedTopic = topicById.get(question.topicId);
    if (!mappedTopic) errors.push(`${question.id}: topicId không tồn tại.`);
    else if (mappedTopic.moduleId !== question.moduleId) {
      errors.push(`${question.id}: topicId thuộc module khác.`);
    }
    const mappedType = typeById.get(question.questionTypeId);
    if (!mappedType) {
      errors.push(`${question.id}: questionTypeId không tồn tại.`);
    } else {
      if (mappedType.moduleId !== question.moduleId) {
        errors.push(`${question.id}: questionTypeId thuộc module khác.`);
      }
      if (!mappedType.lessonIds?.includes(question.lessonId)) {
        errors.push(`${question.id}: lessonId không nằm trong phạm vi của dạng bài.`);
      }
      if (mappedType.topicId !== question.topicId) {
        errors.push(`${question.id}: topicId không khớp dạng bài.`);
      }
      if (!(mappedType.subTypes ?? []).some(subType => subType.id === question.subTypeId)) {
        errors.push(`${question.id}: subTypeId không thuộc dạng bài.`);
      }
    }
    if (!solutionByQuestionId.has(question.id)) errors.push(`${question.id}: thiếu lời giải.`);
    if (!Array.isArray(question.outcomeIds) || question.outcomeIds.length === 0) {
      errors.push(`${question.id}: thiếu outcomeIds.`);
    }
    for (const outcomeId of question.outcomeIds ?? []) {
      if (!outcomeById.has(outcomeId)) {
        errors.push(`${question.id}: outcome ${outcomeId} không tồn tại.`);
      } else if (mappedType && !mappedType.outcomeIds?.includes(outcomeId)) {
        errors.push(`${question.id}: outcome ${outcomeId} không thuộc dạng bài.`);
      }
    }
    if (!question.practiceRole) errors.push(`${question.id}: thiếu practiceRole.`);
    if (!question.representationType) errors.push(`${question.id}: thiếu representationType.`);
    if (question.misconceptionId && !misconceptionById.has(question.misconceptionId)) {
      errors.push(`${question.id}: misconceptionId không tồn tại.`);
    }
    if (question.validatorType === 'choice') {
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        errors.push(`${question.id}: câu choice phải có đúng 4 phương án.`);
      } else {
        if (question.options.some(option => !isNonEmptyString(option))) {
          errors.push(`${question.id}: phương án lựa chọn không được rỗng.`);
        }
        if (new Set(question.options).size !== question.options.length) {
          errors.push(`${question.id}: có phương án lựa chọn bị trùng.`);
        }
      }
      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        errors.push(`${question.id}: đáp án choice phải chuẩn hóa về A/B/C/D.`);
      }
    }
  }

  for (const solution of allSolutions) {
    const question = questionById.get(solution.questionId);
    if (!question) errors.push(`${solution.questionId}: lời giải không có câu hỏi.`);
    if (solution.courseId !== courseId) errors.push(`${solution.questionId}: courseId không khớp.`);
    if (question && solution.finalAnswer !== question.correctAnswer) {
      errors.push(`${solution.questionId}: finalAnswer không khớp correctAnswer.`);
    }
    if (!Array.isArray(solution.detailedSteps) || solution.detailedSteps.length < 2) {
      errors.push(`${solution.questionId}: lời giải cần ít nhất 2 bước.`);
    } else if (
      solution.detailedSteps.some(
        step => !isNonEmptyString(step.title) || !isNonEmptyString(step.explanation)
      )
    ) {
      errors.push(`${solution.questionId}: bước giải có tiêu đề hoặc nội dung rỗng.`);
    }
    if (!isNonEmptyString(solution.recognition)) {
      errors.push(`${solution.questionId}: thiếu hướng nhận dạng.`);
    }
    if (!Array.isArray(solution.commonMistakes) || solution.commonMistakes.length === 0) {
      errors.push(`${solution.questionId}: thiếu lỗi sai thường gặp.`);
    }
    if (!Array.isArray(solution.reviewSuggestions) || solution.reviewSuggestions.length === 0) {
      errors.push(`${solution.questionId}: thiếu gợi ý ôn tập.`);
    }
  }

  const nearlyEqual = (left, right) => Math.abs(left - right) < 1e-9;
  const weightTotal = weights =>
    Object.values(weights ?? {}).reduce((total, value) => total + value, 0);
  const assessmentResponseType = responseType =>
    responseType === 'single_choice' ? 'multiple_choice' : responseType;

  for (const blueprint of assessmentBlueprints) {
    if (blueprint.subjectId !== courseId.split(':')[1]) {
      errors.push(`${blueprint.id}: subjectId không khớp.`);
    }
    if (!Number.isFinite(blueprint.duration) || blueprint.duration <= 0) {
      errors.push(`${blueprint.id}: thời lượng phải lớn hơn 0.`);
    }
    if (!Number.isFinite(blueprint.totalPoints) || blueprint.totalPoints <= 0) {
      errors.push(`${blueprint.id}: tổng điểm phải lớn hơn 0.`);
    }
    if (!Array.isArray(blueprint.scopeTopicIds) || blueprint.scopeTopicIds.length === 0) {
      errors.push(`${blueprint.id}: thiếu phạm vi topic.`);
    }
    for (const topicId of blueprint.scopeTopicIds ?? []) {
      if (!topicById.has(topicId)) errors.push(`${blueprint.id}: topic ${topicId} không tồn tại.`);
    }
    if (
      blueprint.topicWeights &&
      !nearlyEqual(weightTotal(blueprint.topicWeights), 1)
    ) {
      errors.push(`${blueprint.id}: tổng topicWeights phải bằng 1.`);
    }
    for (const topicId of Object.keys(blueprint.topicWeights ?? {})) {
      if (!blueprint.scopeTopicIds?.includes(topicId)) {
        errors.push(`${blueprint.id}: topicWeights chứa topic ngoài phạm vi ${topicId}.`);
      }
    }
    if (!Array.isArray(blueprint.outcomeIds) || blueprint.outcomeIds.length === 0) {
      errors.push(`${blueprint.id}: thiếu outcomeIds.`);
    }
    for (const outcomeId of blueprint.outcomeIds ?? []) {
      const outcome = outcomeById.get(outcomeId);
      if (!outcome) {
        errors.push(`${blueprint.id}: outcome ${outcomeId} không tồn tại.`);
      } else if (!blueprint.scopeTopicIds?.includes(outcome.topicId)) {
        errors.push(`${blueprint.id}: outcome ${outcomeId} nằm ngoài phạm vi topic.`);
      }
    }
    if (!nearlyEqual(weightTotal(blueprint.competencyWeights), 1)) {
      errors.push(`${blueprint.id}: tổng competencyWeights phải bằng 1.`);
    }
    if (!nearlyEqual(weightTotal(blueprint.difficultyWeights), 1)) {
      errors.push(`${blueprint.id}: tổng difficultyWeights phải bằng 1.`);
    }
    if (!Array.isArray(blueprint.sections) || blueprint.sections.length === 0) {
      errors.push(`${blueprint.id}: thiếu cấu trúc phần thi.`);
    } else {
      const sectionItemCount = blueprint.sections.reduce(
        (total, section) => total + section.itemCount,
        0
      );
      const sectionPoints = blueprint.sections.reduce(
        (total, section) => total + section.points,
        0
      );
      if (!Number.isInteger(sectionItemCount) || sectionItemCount <= 0) {
        errors.push(`${blueprint.id}: tổng số câu trong sections không hợp lệ.`);
      }
      if (!nearlyEqual(sectionPoints, blueprint.totalPoints)) {
        errors.push(`${blueprint.id}: tổng điểm sections không bằng totalPoints.`);
      }
      for (const section of blueprint.sections) {
        if (!isNonEmptyString(section.id) || !isNonEmptyString(section.title)) {
          errors.push(`${blueprint.id}: section thiếu id hoặc tiêu đề.`);
        }
        if (!Number.isInteger(section.itemCount) || section.itemCount <= 0) {
          errors.push(`${blueprint.id}/${section.id}: itemCount phải là số nguyên dương.`);
        }
        if (!Number.isFinite(section.points) || section.points <= 0) {
          errors.push(`${blueprint.id}/${section.id}: points phải lớn hơn 0.`);
        }
      }
    }
  }

  for (const exam of assessmentExams) {
    const blueprint = assessmentBlueprintById.get(exam.blueprintId);
    if (!blueprint) {
      errors.push(`${exam.id}: blueprintId ${exam.blueprintId ?? '(trống)'} không tồn tại.`);
      continue;
    }
    if (exam.subjectId !== blueprint.subjectId) {
      errors.push(`${exam.id}: subjectId không khớp ma trận.`);
    }
    if (
      exam.kind !== blueprint.kind ||
      exam.duration !== blueprint.duration ||
      exam.semester !== blueprint.semester
    ) {
      errors.push(`${exam.id}: kind, duration hoặc semester không khớp ma trận.`);
    }
    if (!sameMembers(exam.scopeTopicIds ?? [], blueprint.scopeTopicIds ?? [])) {
      errors.push(`${exam.id}: scopeTopicIds không khớp ma trận.`);
    }
    if (!Array.isArray(exam.questionIds) || exam.questionIds.length === 0) {
      errors.push(`${exam.id}: đề chưa có câu hỏi.`);
      continue;
    }
    for (const duplicate of duplicates(exam.questionIds, item => item)) {
      errors.push(`${exam.id}: câu hỏi bị lặp ${duplicate}.`);
    }
    const examQuestions = exam.questionIds
      .map(questionId => {
        const question = questionById.get(questionId);
        if (!question) errors.push(`${exam.id}: câu hỏi ${questionId} không tồn tại.`);
        return question;
      })
      .filter(Boolean);
    if (examQuestions.length !== exam.questionIds.length) continue;

    const expectedItemCount = blueprint.sections.reduce(
      (total, section) => total + section.itemCount,
      0
    );
    if (examQuestions.length !== expectedItemCount) {
      errors.push(
        `${exam.id}: có ${examQuestions.length} câu, ma trận yêu cầu ${expectedItemCount}.`
      );
    }
    const examPoints = examQuestions.reduce(
      (total, question) => total + (question.points ?? 1),
      0
    );
    if (
      !nearlyEqual(examPoints, blueprint.totalPoints) ||
      !nearlyEqual(exam.totalPoints ?? examPoints, blueprint.totalPoints)
    ) {
      errors.push(`${exam.id}: tổng điểm câu hỏi hoặc totalPoints không khớp ma trận.`);
    }

    const actualResponseCounts = examQuestions.reduce((counts, question) => {
      const responseType = assessmentResponseType(question.responseType ?? 'single_choice');
      counts[responseType] = (counts[responseType] ?? 0) + 1;
      return counts;
    }, {});
    const expectedResponseCounts = blueprint.sections.reduce((counts, section) => {
      counts[section.responseType] =
        (counts[section.responseType] ?? 0) + section.itemCount;
      return counts;
    }, {});
    for (const responseType of new Set([
      ...Object.keys(actualResponseCounts),
      ...Object.keys(expectedResponseCounts)
    ])) {
      if ((actualResponseCounts[responseType] ?? 0) !== (expectedResponseCounts[responseType] ?? 0)) {
        errors.push(
          `${exam.id}: số câu ${responseType} không khớp ma trận ` +
            `(${actualResponseCounts[responseType] ?? 0}/${expectedResponseCounts[responseType] ?? 0}).`
        );
      }
    }

    const actualDifficultyCounts = examQuestions.reduce((counts, question) => {
      counts[question.difficulty] = (counts[question.difficulty] ?? 0) + 1;
      return counts;
    }, {});
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const actualWeight =
        (actualDifficultyCounts[difficulty] ?? 0) / examQuestions.length;
      if (!nearlyEqual(actualWeight, blueprint.difficultyWeights[difficulty])) {
        errors.push(
          `${exam.id}: tỉ lệ ${difficulty} là ${actualWeight}, ` +
            `ma trận yêu cầu ${blueprint.difficultyWeights[difficulty]}.`
        );
      }
    }

    const topicPoints = examQuestions.reduce((counts, question) => {
      counts[question.topicId] =
        (counts[question.topicId] ?? 0) + (question.points ?? 1);
      return counts;
    }, {});
    for (const question of examQuestions) {
      if (!blueprint.scopeTopicIds.includes(question.topicId)) {
        errors.push(`${exam.id}: câu ${question.id} nằm ngoài phạm vi topic.`);
      }
      for (const outcomeId of question.outcomeIds ?? []) {
        if (!blueprint.outcomeIds.includes(outcomeId)) {
          errors.push(`${exam.id}: câu ${question.id} có outcome ngoài ma trận ${outcomeId}.`);
        }
      }
    }
    for (const [topicId, expectedWeight] of Object.entries(blueprint.topicWeights ?? {})) {
      const actualWeight = (topicPoints[topicId] ?? 0) / examPoints;
      if (!nearlyEqual(actualWeight, expectedWeight)) {
        errors.push(
          `${exam.id}: trọng số ${topicId} là ${actualWeight}, ma trận yêu cầu ${expectedWeight}.`
        );
      }
    }
  }

  const parallelFormGroups = new Map();
  for (const exam of assessmentExams) {
    if (!exam.parallelFormGroup) continue;
    const group = parallelFormGroups.get(exam.parallelFormGroup) ?? [];
    group.push(exam);
    parallelFormGroups.set(exam.parallelFormGroup, group);
  }
  for (const [groupId, exams] of parallelFormGroups) {
    if (exams.length < 2) {
      errors.push(`${groupId}: nhóm form song song phải có ít nhất hai đề.`);
    }
    if (new Set(exams.map(exam => exam.blueprintId)).size !== 1) {
      errors.push(`${groupId}: các form song song không dùng chung một blueprint.`);
    }
    const formCodes = new Set();
    for (const exam of exams) {
      if (!isNonEmptyString(exam.formCode)) {
        errors.push(`${exam.id}: thuộc nhóm form song song ${groupId} nhưng thiếu formCode.`);
      } else if (formCodes.has(exam.formCode)) {
        errors.push(`${groupId}: formCode ${exam.formCode} bị lặp.`);
      }
      formCodes.add(exam.formCode);
    }
    for (let firstIndex = 0; firstIndex < exams.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < exams.length; secondIndex += 1) {
        const first = exams[firstIndex];
        const second = exams[secondIndex];
        const secondQuestionIds = new Set(second.questionIds ?? []);
        const overlap = (first.questionIds ?? []).filter(questionId =>
          secondQuestionIds.has(questionId)
        );
        if (overlap.length > 0) {
          errors.push(
            `${groupId}: ${first.formCode}/${second.formCode} dùng chung ${overlap.length} câu hỏi.`
          );
        }
      }
    }
  }

  for (const [label, items] of [
    ['Công thức lý thuyết', theory.flatMap(block => block.formulas ?? [])],
    ['Ví dụ lý thuyết', theory.flatMap(block => block.workedExamples ?? [])],
    ['Câu tự kiểm tra lý thuyết', theory.flatMap(block => block.checkpoints ?? [])]
  ]) {
    for (const duplicate of duplicates(items, item => item.id)) {
      errors.push(`${label} bị trùng: ${duplicate}.`);
    }
  }

  for (const block of theory) {
    if (block.courseId !== courseId) errors.push(`${block.id}: courseId không khớp.`);
    if (!manifestById.has(block.moduleId)) errors.push(`${block.id}: moduleId không tồn tại.`);
    if (!isNonEmptyString(block.title)) errors.push(`${block.id}: tiêu đề lý thuyết rỗng.`);
    if (!isNonEmptyString(block.content)) errors.push(`${block.id}: nội dung lý thuyết rỗng.`);
    for (const [field, label] of [
      ['lessonIds', 'bài học'],
      ['outcomeIds', 'outcome'],
      ['questionTypeIds', 'dạng bài'],
      ['sourceIds', 'nguồn'],
      ['objectives', 'mục tiêu'],
      ['keyPoints', 'điểm ghi nhớ'],
      ['workedExamples', 'ví dụ có lời giải'],
      ['checkpoints', 'câu tự kiểm tra']
    ]) {
      if (!Array.isArray(block[field]) || block[field].length === 0) {
        errors.push(`${block.id}: thiếu ${label}.`);
      }
    }
    for (const lessonId of block.lessonIds ?? []) {
      const lesson = lessonById.get(lessonId);
      if (!lesson) errors.push(`${block.id}: lesson ${lessonId} không tồn tại.`);
      else if (lesson.moduleId !== block.moduleId) {
        errors.push(`${block.id}: lesson ${lessonId} thuộc module khác.`);
      }
    }
    for (const sourceId of block.sourceIds ?? []) {
      if (!sourceById.has(sourceId)) errors.push(`${block.id}: source ${sourceId} không tồn tại.`);
    }
    for (const outcomeId of block.outcomeIds ?? []) {
      const outcome = outcomeById.get(outcomeId);
      if (!outcome) {
        errors.push(`${block.id}: outcome ${outcomeId} không tồn tại.`);
      } else if (topicById.get(outcome.topicId)?.moduleId !== block.moduleId) {
        errors.push(`${block.id}: outcome ${outcomeId} thuộc module khác.`);
      }
    }
    for (const questionTypeId of block.questionTypeIds ?? []) {
      const questionType = typeById.get(questionTypeId);
      if (!questionType) {
        errors.push(`${block.id}: questionType ${questionTypeId} không tồn tại.`);
      } else {
        if (questionType.moduleId !== block.moduleId) {
          errors.push(`${block.id}: questionType ${questionTypeId} thuộc module khác.`);
        }
        if (!(block.outcomeIds ?? []).some(outcomeId => questionType.outcomeIds?.includes(outcomeId))) {
          errors.push(`${block.id}: không có outcome chung với questionType ${questionTypeId}.`);
        }
      }
    }
    for (const formula of block.formulas ?? []) {
      if (!isNonEmptyString(formula.label) || !isNonEmptyString(formula.expression)) {
        errors.push(`${block.id}/${formula.id}: công thức thiếu nhãn hoặc biểu thức.`);
      }
      if (!Array.isArray(formula.variables) || formula.variables.length === 0) {
        errors.push(`${block.id}/${formula.id}: công thức thiếu giải thích biến.`);
      } else if (
        formula.variables.some(
          variable => !isNonEmptyString(variable.symbol) || !isNonEmptyString(variable.meaning)
        )
      ) {
        errors.push(`${block.id}/${formula.id}: biến có kí hiệu hoặc ý nghĩa rỗng.`);
      }
      if (!Array.isArray(formula.conditions) || formula.conditions.length === 0) {
        errors.push(`${block.id}/${formula.id}: công thức thiếu điều kiện áp dụng.`);
      }
    }
    for (const example of block.workedExamples ?? []) {
      if (
        !isNonEmptyString(example.title) ||
        !isNonEmptyString(example.problem) ||
        !isNonEmptyString(example.answer)
      ) {
        errors.push(`${block.id}/${example.id}: ví dụ thiếu tiêu đề, đề bài hoặc đáp án.`);
      }
      if (!Array.isArray(example.steps) || example.steps.length < 2) {
        errors.push(`${block.id}/${example.id}: ví dụ cần ít nhất 2 bước giải.`);
      }
    }
    for (const checkpoint of block.checkpoints ?? []) {
      if (!isNonEmptyString(checkpoint.question) || !isNonEmptyString(checkpoint.explanation)) {
        errors.push(`${block.id}/${checkpoint.id}: câu tự kiểm tra thiếu câu hỏi hoặc giải thích.`);
      }
      if (!Array.isArray(checkpoint.options) || checkpoint.options.length !== 4) {
        errors.push(`${block.id}/${checkpoint.id}: câu tự kiểm tra phải có đúng 4 lựa chọn.`);
      }
      if (!['A', 'B', 'C', 'D'].includes(checkpoint.correctAnswer)) {
        errors.push(`${block.id}/${checkpoint.id}: đáp án phải là A/B/C/D.`);
      }
    }
  }

  const theoryLessonIds = new Set(theory.flatMap(block => block.lessonIds ?? []));
  const theoryQuestionTypeIds = new Set(theory.flatMap(block => block.questionTypeIds ?? []));
  if (
    expectedTheoryLessonCount !== undefined &&
    theoryLessonIds.size !== expectedTheoryLessonCount
  ) {
    errors.push(
      `Lý thuyết phải bao phủ ${expectedTheoryLessonCount} bài, hiện bao phủ ${theoryLessonIds.size}.`
    );
  }
  if (
    expectedTheoryQuestionTypeCount !== undefined &&
    theoryQuestionTypeIds.size !== expectedTheoryQuestionTypeCount
  ) {
    errors.push(
      `Lý thuyết phải bao phủ ${expectedTheoryQuestionTypeCount} dạng bài, hiện bao phủ ${theoryQuestionTypeIds.size}.`
    );
  }
  const missingTheoryTypeCount = questionTypes.filter(
    questionType => !theoryQuestionTypeIds.has(questionType.id)
  ).length;
  if (missingTheoryTypeCount > 0) {
    warnings.push(
      `Độ phủ lý thuyết: ${missingTheoryTypeCount}/${questionTypes.length} dạng bài chưa có TheoryBlock.`
    );
  }

  const videosPath = path.join(absoluteCourseDirectory, 'videos.ts');
  if (fs.existsSync(videosPath) && fs.readFileSync(videosPath, 'utf8').includes('dQw4w9WgXcQ')) {
    errors.push('videos.ts còn chứa YouTube placeholder dQw4w9WgXcQ.');
  }

  return {
    errors,
    warnings,
    stats: {
      sources: sources.length,
      curriculumLessons: lessons.length,
      implementedModules: manifests.length,
      officialRequirements: officialRequirements.length,
      outcomes: outcomes.length,
      questionTypes: questionTypes.length,
      coveredQuestionTypes: questionTypes.filter(type => {
        const blueprint = blueprintByTypeId.get(type.id);
        if (!blueprint) return false;
        return (
          questions.filter(question => question.questionTypeId === type.id).length >=
          blueprint.coverage.targetQuestionCount
        );
      }).length,
      practiceTarget: totalPracticeTarget,
      practiceQuestions: questions.length,
      solutions: solutions.length,
      practiceQuestionTypesAt24: questionTypes.filter(
        type => questions.filter(question => question.questionTypeId === type.id).length >= 24
      ).length,
      practiceDifficulty: questions.reduce((counts, question) => {
        const key = question.difficulty ?? 'unspecified';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
      practiceResponseTypes: questions.reduce((counts, question) => {
        const key = question.responseType ?? 'unspecified';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
      assessmentExams: assessmentExams.length,
      assessmentBlueprints: assessmentBlueprints.length,
      assessmentQuestions: assessmentQuestions.length,
      assessmentSolutions: assessmentSolutions.length,
      assessmentQuestionTypesCovered: assessmentQuestionTypeCount,
      assessmentDifficulty: assessmentQuestions.reduce((counts, question) => {
        const key = question.difficulty ?? 'unspecified';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
      assessmentResponseTypes: assessmentQuestions.reduce((counts, question) => {
        const key = question.responseType ?? 'unspecified';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
      assessmentChoiceAnswers: assessmentQuestions.reduce((counts, question) => {
        if (question.responseType !== 'single_choice') return counts;
        counts[question.correctAnswer] = (counts[question.correctAnswer] ?? 0) + 1;
        return counts;
      }, {}),
      assessmentParallelFormGroups: parallelFormGroups.size,
      theoryBlocks: theory.length,
      theoryWorkedExamples: theory.flatMap(block => block.workedExamples ?? []).length,
      theoryCheckpoints: theory.flatMap(block => block.checkpoints ?? []).length,
      theoryBlocksWith3Examples: theory.filter(
        block => (block.workedExamples?.length ?? 0) >= 3
      ).length,
      theoryBlocksWith4Checkpoints: theory.filter(
        block => (block.checkpoints?.length ?? 0) >= 4
      ).length,
      theoryLessonsCovered: theoryLessonIds.size,
      theoryQuestionTypesCovered: theoryQuestionTypeIds.size
    }
  };
};
