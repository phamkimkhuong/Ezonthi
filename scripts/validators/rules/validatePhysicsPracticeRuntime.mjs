import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sourcePath = path.join(
  root,
  'src/features/practice-engine/utils/adaptivePracticeSequence.ts',
);
const source = fs.readFileSync(sourcePath, 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
  fileName: sourcePath,
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`;
const { buildAdaptivePracticeSequence } = await import(moduleUrl);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const makeQuestion = ({
  id,
  difficulty = 'easy',
  subTypeId = 'st-1',
  practiceRole = 'near_transfer',
  holdout = false,
}) => ({
  id,
  subjectId: 'physics',
  topicId: 'topic',
  questionTypeId: 'phy10-runtime-test',
  content: id,
  difficulty,
  sourceType: 'manual',
  correctAnswer: 'A',
  subTypeId,
  practiceRole: holdout ? 'mastery_holdout' : practiceRole,
  representationType: 'text',
  isMasteryHoldout: holdout,
});

const makeAttempt = (questionId, isCorrect = true, minute = 0) => ({
  id: `attempt-${questionId}-${minute}`,
  userId: 'runtime-test-user',
  questionId,
  questionTypeId: 'phy10-runtime-test',
  userAnswer: isCorrect ? 'A' : 'B',
  isCorrect,
  timeSpent: 30,
  createdAt: new Date(Date.UTC(2026, 0, 1, 0, minute)).toISOString(),
});

const learningPool = Array.from({ length: 10 }, (_, index) => makeQuestion({
  id: `learning-${index + 1}`,
  difficulty: index < 4 ? 'easy' : index < 8 ? 'medium' : 'hard',
  subTypeId: index % 2 === 0 ? 'st-1' : 'st-2',
  practiceRole: index < 2 ? 'guided' : 'near_transfer',
}));
const holdoutPool = [
  makeQuestion({ id: 'holdout-1', difficulty: 'medium', subTypeId: 'st-1', holdout: true }),
  makeQuestion({ id: 'holdout-2', difficulty: 'hard', subTypeId: 'st-2', holdout: true }),
];
const pool = [...learningPool, ...holdoutPool];

const firstSession = buildAdaptivePracticeSequence(pool, []);
assert(!firstSession.holdoutUnlocked, 'Holdout không được mở ở lượt học đầu.');
assert(firstSession.questions.length === learningPool.length, 'Holdout bị lộ trong ngân hàng học ban đầu.');
assert(firstSession.questions.every(question => !question.isMasteryHoldout), 'Có câu holdout xuất hiện khi đang khóa.');
assert(
  firstSession.questions.findIndex(question => question.difficulty === 'hard')
    > firstSession.questions.findLastIndex(question => question.difficulty === 'easy'),
  'Câu khó phải xuất hiện sau tầng câu dễ.',
);

const readyAttempts = learningPool.slice(0, 6).map((question, index) => makeAttempt(question.id, true, index));
const readySession = buildAdaptivePracticeSequence(pool, readyAttempts);
assert(readySession.holdoutUnlocked, 'Holdout phải mở khi đủ số câu, độ chính xác và dạng con.');
assert(readySession.visibleHoldoutCount === 2, 'Phải mở toàn bộ cụm holdout cùng lúc.');
const firstHoldoutIndex = readySession.questions.findIndex(question => question.isMasteryHoldout);
const lastUnseenLearningIndex = readySession.questions.findLastIndex(
  question => !question.isMasteryHoldout && !readyAttempts.some(attempt => attempt.questionId === question.id),
);
assert(firstHoldoutIndex > lastUnseenLearningIndex, 'Holdout không được chen trước câu học chưa làm.');

const lowAccuracyAttempts = learningPool.slice(0, 6).map((question, index) => (
  makeAttempt(question.id, index < 4, index)
));
const lowAccuracySession = buildAdaptivePracticeSequence(pool, lowAccuracyAttempts);
assert(!lowAccuracySession.holdoutUnlocked, 'Không được mở holdout khi độ chính xác dưới 70%.');

const subtypeSkewedPool = [
  ...Array.from({ length: 13 }, (_, index) => makeQuestion({ id: `skew-${index + 1}`, subTypeId: 'st-1' })),
  makeQuestion({ id: 'skew-14', subTypeId: 'st-2' }),
  makeQuestion({ id: 'skew-holdout', subTypeId: 'st-2', holdout: true }),
];
const subtypeSkewedAttempts = subtypeSkewedPool
  .slice(0, 9)
  .map((question, index) => makeAttempt(question.id, true, index));
const subtypeCoverageSession = buildAdaptivePracticeSequence(subtypeSkewedPool, subtypeSkewedAttempts);
assert(!subtypeCoverageSession.holdoutUnlocked, 'Không được mở holdout khi còn dạng con chưa trải qua.');

const resumedHoldoutSession = buildAdaptivePracticeSequence(pool, [makeAttempt('holdout-1', false)]);
assert(resumedHoldoutSession.holdoutUnlocked, 'Holdout đã bắt đầu phải được giữ mở ở phiên sau.');
assert(resumedHoldoutSession.visibleHoldoutCount === holdoutPool.length, 'Phiên holdout dở dang phải hiện đủ cụm kiểm tra.');

const attemptedFirstQuestionSession = buildAdaptivePracticeSequence(pool, [makeAttempt('learning-1', false)]);
assert(
  attemptedFirstQuestionSession.questions[0].id !== 'learning-1',
  'Câu chưa làm phải được ưu tiên trước câu đã làm.',
);

console.log('Runtime luyện tập Vật lí 10 hợp lệ: khóa/mở holdout, tăng độ khó và chống lặp phiên đều đạt.');
