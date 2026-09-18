const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const backend = import(pathToFileURL(path.resolve(__dirname, '../../functions/lib/services/learningState.js')).href);

test('built backend grades all 66 mobile questions independently of client correctness', async () => {
  const { getLearningCatalog, canonicalizeAttempt } = await backend;
  const entries = Object.values(getLearningCatalog()).filter(q => q.id.startsWith('mobile-v1-'));
  assert.equal(entries.length, 66);
  for (const q of entries) for (const letter of ['A', 'B', 'C', 'D']) {
    const result = canonicalizeAttempt('A', { id: `test_${q.id}_${letter}`, questionId: q.id,
      userAnswer: letter, isCorrect: letter !== q.correctAnswer, createdAt: '2026-09-16T01:00:00.000Z' });
    assert.equal(result.isCorrect, letter === q.correctAnswer, `${q.id}: ${letter}`);
    assert.equal(result.questionTypeId, q.questionTypeId);
  }
  assert.equal(getLearningCatalog()['mobile-v1-math9-t3-q2'].correctAnswer, 'D');
});

test('canonical hash stays stable on retry, separates owners and rejects unknown scope', async () => {
  const { canonicalizeAttempt } = await backend;
  const raw = { id: 'stable_retry', questionId: 'mobile-v1-math9-t3-q2', userAnswer: 'D',
    createdAt: '2026-09-16T01:00:00.000Z', timeSpent: 900 };
  const first = canonicalizeAttempt('A', raw);
  const retry = canonicalizeAttempt('A', { ...raw, isCorrect: false, xp: 999999 }, Date.now() + 5000);
  assert.equal(first.contentHash, retry.contentHash);
  assert.notEqual(first.contentHash, canonicalizeAttempt('B', raw).contentHash);
  assert.equal(first.timeSpent, 600);
  assert.equal(canonicalizeAttempt('A', { ...raw, questionId: 'mobile-v1-unknown' }), null);
});
