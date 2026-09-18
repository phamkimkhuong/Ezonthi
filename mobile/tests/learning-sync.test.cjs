const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createStore } = require('zustand/vanilla');
const middleware = require('zustand/middleware');

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values, failWrites: false,
    async getItem(key) { return values.get(key) || null; },
    async setItem(key, value) { if (this.failWrites) throw new Error('disk full'); values.set(key, value); },
    async removeItem(key) { values.delete(key); },
  };
}

async function environment(storage = memoryStorage()) {
  const cache = new Map();
  function load(file) {
    const filename = path.resolve(__dirname, '..', file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = fs.readFileSync(filename, 'utf8');
    const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    new Function('require', 'exports', 'module', javascript)(dependency => {
      if (dependency === 'zustand') return { create: () => initializer => createStore(initializer) };
      if (dependency === 'zustand/middleware') return middleware;
      if (dependency === '@react-native-async-storage/async-storage') return storage;
      if (dependency === '../utils/haptics') return { triggerHaptic() {} };
      if (dependency === '../utils/speech') return { speakWord() {} };
      assert.ok(dependency.startsWith('.'), `Unexpected dependency: ${dependency}`);
      const target = path.resolve(path.dirname(filename), dependency);
      return load(path.relative(path.resolve(__dirname, '..'), fs.existsSync(`${target}.ts`) ? `${target}.ts` : `${target}/index.ts`));
    }, module.exports, module);
    return module.exports;
  }
  const storeModule = load('stores/useUserStore.ts');
  await storeModule.waitForLearningHydration();
  return { storage, storeModule, store: storeModule.useUserStore,
    domain: load('services/accountLearningState.ts'),
    driver: load('services/outboxDriver.ts'), exams: load('services/examService.ts'),
    vocabulary: load('services/vocabularyService.ts').VocabularyService,
  };
}
const profile = uid => ({ uid, email: `${uid}@example.test`, displayName: uid });
const answer = (env, id = 'attempt_one') => env.store.getState().recordAttempt('math9-t1-q1', 'math9-t1', 'math', true, 'A', 10, id);

function dependencies(env, uid, send, records = []) {
  const scope = `user:${uid}`;
  return {
    scope, uid,
    isCurrent: () => env.store.getState().activeScope === scope,
    getAccount: () => env.store.getState().accounts[scope],
    update: update => env.store.getState().updateAccount(scope, update),
    flush: env.storeModule.flushLearningStorage,
    send, pull: async () => ({ records, xp: 15 }),
  };
}

test('A → logout → B → A isolates attempts and preserves A pending data after restart', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  await answer(env);
  env.store.getState().setUser(null);
  assert.equal(env.store.getState().attempts.length, 0);
  env.store.getState().setUser(profile('B'));
  assert.equal(env.store.getState().xp, 0);
  assert.equal(env.store.getState().attempts.length, 0);
  await env.storeModule.flushLearningStorage();
  const restored = await environment(env.storage);
  assert.equal(restored.store.getState().user, null);
  restored.store.getState().setUser(profile('A'));
  assert.equal(restored.store.getState().attempts[0].id, 'attempt_one');
  assert.equal(restored.store.getState().attempts[0].syncStatus, 'pending');
});

test('guest import is consumed once; repeated auth callbacks and another login cannot import it again', async () => {
  const env = await environment();
  await answer(env, 'guest_answer');
  env.store.getState().setUser(profile('A'));
  env.store.getState().setUser(profile('A'));
  assert.equal(env.store.getState().attempts.length, 1);
  assert.equal(env.store.getState().accounts.guest.attempts.length, 0);
  env.store.getState().setUser(null);
  env.store.getState().setUser(profile('B'));
  assert.equal(env.store.getState().attempts.length, 0);
  assert.equal(env.store.getState().accounts['user:A'].attempts.length, 1);
});

test('legacy learning data belongs to persisted owner, is backed up, and client XP is not trusted', async () => {
  const legacy = JSON.stringify({ state: { user: profile('A'), xp: 999999, selectedGrade: 'grade10', attempts: [{
    id: 'old_attempt', questionId: 'math9-t1-q1', topicId: 'math9-t1', subjectId: 'math',
    isCorrect: true, selectedAnswer: 'A', answeredAt: new Date().toISOString(),
  }] }, version: 0 });
  const env = await environment(memoryStorage({ 'ezonthi-user-storage': legacy }));
  env.store.getState().setUser(profile('B'));
  assert.equal(env.store.getState().attempts.length, 0);
  assert.equal(env.storage.values.get('ezonthi-user-storage:before-v2'), legacy);
  env.store.getState().setUser(profile('A'));
  assert.equal(env.store.getState().attempts[0].id, 'old_attempt');
  assert.notEqual(env.store.getState().xp, 999999);
});

test('commit followed by lost response retries the identical batch after restart and ACKs only once', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  await answer(env);
  let firstPayload;
  const server = new Map();
  const uncertain = dependencies(env, 'A', async payload => {
    firstPayload = structuredClone(payload);
    for (const attempt of payload.attempts) server.set(attempt.id, attempt);
    throw new Error('response lost after commit');
  });
  assert.equal(await env.driver.runOutbox(uncertain), false);
  await env.storeModule.flushLearningStorage();
  const restored = await environment(env.storage);
  restored.store.getState().setUser(profile('A'));
  const records = firstPayload.attempts.map(a => ({ ...a, questionTypeId: 'mobile-v1-math9-t1', isCorrect: true, ingestedAt: new Date().toISOString() }));
  const retry = dependencies(restored, 'A', async payload => {
    assert.deepEqual(payload, firstPayload);
    assert.equal(payload.expectedUserId, 'A');
    for (const attempt of payload.attempts) server.set(attempt.id, attempt);
    return { acknowledgedIds: payload.attempts.map(a => a.id), conflictIds: [], rejectedCount: 0, summary: { stats: { xpScore: 15 } } };
  }, records);
  assert.equal(await restored.driver.runOutbox(retry), true);
  assert.equal(server.size, 1);
  assert.equal(restored.store.getState().attempts[0].syncStatus, 'acknowledged');
  assert.equal(restored.store.getState().xp, 15);
});

test('a delayed ACK for A updates only A when account B becomes active', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  await answer(env);
  let release;
  const response = new Promise(resolve => { release = resolve; });
  let started;
  const requestStarted = new Promise(resolve => { started = resolve; });
  const pending = env.driver.runOutbox(dependencies(env, 'A', payload => { started(payload); return response; }));
  const payload = await requestStarted;
  env.store.getState().setUser(profile('B'));
  release({ acknowledgedIds: payload.attempts.map(a => a.id), conflictIds: [], rejectedCount: 0, summary: { stats: { xpScore: 15 } } });
  await pending;
  assert.equal(env.store.getState().activeScope, 'user:B');
  assert.equal(env.store.getState().xp, 0);
  assert.equal(env.store.getState().attempts.length, 0);
  assert.equal(env.store.getState().accounts['user:A'].attempts[0].syncStatus, 'acknowledged');
});

test('invalid ACK and partial ACK retain original operation and unacknowledged attempts', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  await answer(env, 'one'); await answer(env, 'two');
  await env.driver.runOutbox(dependencies(env, 'A', async () => ({})));
  const original = structuredClone(env.store.getState().accounts['user:A'].batch);
  assert.equal(await env.driver.runOutbox(dependencies(env, 'A', async () => ({
    acknowledgedIds: ['one', 'not-sent'], conflictIds: [], rejectedCount: 0, summary: { stats: { xpScore: 15 } },
  }))), false);
  assert.deepEqual(env.store.getState().accounts['user:A'].batch, original);
  assert.equal(env.store.getState().attempts.find(a => a.id === 'two').syncStatus, 'pending');
});

test('canonical reviewed result replaces stale acknowledged local answer; pending attempts survive pull', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A')); await answer(env);
  env.store.getState().updateAccount('user:A', account => ({ ...account,
    attempts: [{ ...account.attempts[0], syncStatus: 'acknowledged' }, { ...account.attempts[0], id: 'new_pending' }],
  }));
  const record = { id: 'attempt_one', questionId: 'mobile-v1-math9-t1-q1', questionTypeId: 'mobile-v1-math9-t1',
    userAnswer: 'A', createdAt: new Date().toISOString(), reviewedAt: new Date().toISOString(),
    isCorrect: false, timeSpent: 5, gradingStatus: 'graded', teacherFeedback: 'Server corrected result',
  };
  env.store.getState().updateAccount('user:A', account => env.domain.mergeCanonical(account, [record], 0));
  assert.equal(env.store.getState().attempts.find(a => a.id === 'attempt_one').isCorrect, false);
  assert.equal(env.store.getState().attempts.find(a => a.id === 'new_pending').syncStatus, 'pending');
});

test('disk write failure never sends a batch, preserves memory pending and allows saving retry', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A')); await answer(env);
  env.storage.failWrites = true;
  let sends = 0;
  assert.equal(await env.driver.runOutbox(dependencies(env, 'A', async () => { sends++; return {}; })), false);
  assert.equal(sends, 0);
  assert.equal(env.store.getState().attempts[0].syncStatus, 'pending');
  assert.ok(env.store.getState().storageError);
  env.storage.failWrites = false;
  await env.storeModule.retryLearningStorage();
  assert.equal(env.store.getState().storageError, null);
});

test('malformed persisted data cannot be overwritten after hydration fails', async () => {
  const raw = '{broken json';
  const env = await environment(memoryStorage({ 'ezonthi-user-storage': raw }));
  env.store.getState().setUser(profile('A'));
  await assert.rejects(env.storeModule.flushLearningStorage());
  assert.equal(env.storage.values.get('ezonthi-user-storage'), raw);
});

test('exam draft restores answers, index, snapshot and wall-clock deadline only for its owner', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  const exam = env.exams.getExamById('exam-math9-01');
  const now = Date.now();
  const draft = { sessionId: 'stable_session', exam, startedAt: now, deadlineAt: now + 60_000,
    answers: { [exam.questions[0].id]: 'D' }, currentIndex: 3 };
  await Promise.all([
    env.store.getState().saveExamDraft('user:A', draft),
    env.store.getState().saveExamDraft('user:A', { ...draft, answers: { ...draft.answers, [exam.questions[1].id]: 'B' } }),
  ]);
  const restored = await environment(env.storage);
  restored.store.getState().setUser(profile('B'));
  assert.equal(restored.store.getState().accounts['user:B'].examDrafts[exam.id], undefined);
  restored.store.getState().setUser(profile('A'));
  const loaded = restored.store.getState().accounts['user:A'].examDrafts[exam.id];
  assert.equal(Object.keys(loaded.answers).length, 2);
  assert.equal(loaded.currentIndex, 3);
  assert.equal(restored.domain.remainingExamSeconds(loaded, now + 30_000), 30);
  assert.equal(restored.domain.remainingExamSeconds(loaded, now + 120_000), 0);
  assert.deepEqual(loaded.exam, exam);
});

test('exam submission stores all attempts and result atomically; duplicate submission/restart cannot repeat IDs', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  const exam = env.exams.getExamById('exam-math9-01');
  const now = Date.now();
  const draft = { sessionId: 'stable_session', exam, startedAt: now - 30_000, deadlineAt: now + 60_000,
    answers: { [exam.questions[0].id]: 'A' }, currentIndex: 0,
    submittedAt: now, result: env.exams.evaluateExam(exam, { [exam.questions[0].id]: 'A' }, 30) };
  await env.store.getState().submitExamDraft('user:A', draft);
  await env.store.getState().submitExamDraft('user:A', draft);
  const restored = await environment(env.storage);
  restored.store.getState().setUser(profile('A'));
  await restored.store.getState().submitExamDraft('user:A', draft);
  assert.equal(restored.store.getState().attempts.length, exam.questions.length);
  assert.equal(new Set(restored.store.getState().attempts.map(a => a.id)).size, exam.questions.length);
  assert.deepEqual(restored.store.getState().accounts['user:A'].examDrafts[exam.id].result, draft.result);
});

test('stale UI scope cannot write into the next account and reset never erases pending/drafts', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A')); await answer(env);
  env.store.getState().setUser(profile('B'));
  await assert.rejects(env.store.getState().recordAttempt('math9-t1-q1', 'math9-t1', 'math', true, 'A', 10, 'stale_A', 0, 'user:A'));
  assert.equal(env.store.getState().attempts.length, 0);
  env.store.getState().setUser(profile('A'));
  env.store.getState().resetProgress();
  assert.equal(env.store.getState().attempts[0].syncStatus, 'pending');
});


test('vocabulary ownership and concurrent toggles survive account changes', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  await Promise.all([env.vocabulary.toggleMasteredWord('word1'), env.vocabulary.toggleMasteredWord('word2')]);
  await env.vocabulary.toggleStarredWord('word1');
  await env.vocabulary.saveQuizHighScore('unit1', 80);
  env.store.getState().setUser(null);
  env.store.getState().setUser(profile('B'));
  assert.deepEqual(await env.vocabulary.getMasteredWordIds(), []);
  assert.deepEqual(await env.vocabulary.getStarredWordIds(), []);
  assert.deepEqual(await env.vocabulary.getQuizHighScores(), {});
  env.store.getState().setUser(profile('A'));
  assert.deepEqual((await env.vocabulary.getMasteredWordIds()).sort(), ['word1', 'word2']);
  assert.equal((await env.vocabulary.getQuizHighScores()).unit1, 80);
});

test('canonical mistakes supply server review schedule; a fresh pending answer takes precedence', async () => {
  const env = await environment();
  env.store.getState().setUser(profile('A'));
  const record = { id: 'wrong_server', questionId: 'mobile-v1-math9-t1-q1', questionTypeId: 'mobile-v1-math9-t1',
    userAnswer: 'D', createdAt: '2026-09-15T01:00:00.000Z', timeSpent: 10, isCorrect: false, gradingStatus: 'graded' };
  const mistake = { id: 'server_mistake', questionId: record.questionId, wrongAnswer: 'D', reviewStatus: 'reviewing',
    reviewCount: 3, lastAttemptedAt: record.createdAt, nextReviewAt: '2026-09-22T01:00:00.000Z' };
  env.store.getState().updateAccount('user:A', account => env.domain.mergeCanonical(account, [record], 0, [mistake]));
  assert.equal(env.store.getState().mistakes[0].nextReviewAt, mistake.nextReviewAt);
  assert.equal(env.store.getState().mistakes[0].reviewCount, 3);
  await answer(env, 'new_correct');
  assert.equal(env.store.getState().mistakes.length, 0);
});


test('legacy vocabulary imports only to its recorded owner and cannot leak through empty-account fallback', async () => {
  const env = await environment(memoryStorage({
    'ezonthi-user-storage': JSON.stringify({ version: 0, state: { user: profile('A'), attempts: [] } }),
    '@ez_vocab_mastered_ids': JSON.stringify(['old_word']),
    '@ez_vocab_starred_ids': JSON.stringify(['old_star']),
    '@ez_vocab_quiz_scores': JSON.stringify({ unit1: 90 }),
  }));
  await env.vocabulary.migrateLegacyProgress();
  env.store.getState().setUser(profile('B'));
  await env.vocabulary.migrateLegacyProgress();
  assert.deepEqual(await env.vocabulary.getMasteredWordIds(), []);
  env.store.getState().setUser(profile('A'));
  assert.deepEqual(await env.vocabulary.getMasteredWordIds(), ['old_word']);
  assert.deepEqual(await env.vocabulary.getStarredWordIds(), ['old_star']);
  assert.equal((await env.vocabulary.getQuizHighScores()).unit1, 90);
});


test('guest login retains both drafts when the same exam already has an account session', async () => {
  const env = await environment();
  const exam = env.exams.getExamById('exam-math9-01');
  const target = env.domain.emptyAccount();
  const guest = env.domain.emptyAccount();
  const first = { sessionId: 'account_session', exam, startedAt: 1, deadlineAt: 1000, answers: {}, currentIndex: 0 };
  const second = { ...first, sessionId: 'guest_session', answers: { [exam.questions[0].id]: 'A' } };
  target.examDrafts[exam.id] = first;
  guest.examDrafts[exam.id] = second;
  const merged = env.domain.importGuest(target, guest);
  assert.equal(merged.examDrafts[exam.id].sessionId, 'guest_session');
  assert.equal(merged.examDraftArchive.account_session.sessionId, 'account_session');
});
