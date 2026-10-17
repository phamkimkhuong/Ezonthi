import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key),
    clear: () => memory.clear(),
    key: index => [...memory.keys()][index] ?? null,
    get length() { return memory.size; },
  };
  const [{ dedupeAttempts, pendingAttemptsForAccount, reconcileAttempts }, { storageService, pruneAttempts, MAX_LOCAL_SYNCED_ATTEMPTS }] = await Promise.all([
    server.ssrLoadModule('/src/utils/learningSync.ts'),
    server.ssrLoadModule('/src/services/storage.ts'),
  ]);
  const make = (id, patch = {}) => ({
    id, userId: 'guest', questionId: `q-${id}`, questionTypeId: 'type', userAnswer: 'A',
    isCorrect: true, timeSpent: 3, createdAt: '2026-09-12T00:00:00Z', synced: false, ...patch,
  });

  const offline = make('offline');
  assert.deepEqual(reconcileAttempts([offline], []), [offline], 'offline hydration must retain pending');

  const guest = make('guest-answer');
  const upload = pendingAttemptsForAccount('signed-in', [], [guest]);
  assert.equal(upload.length, 1);
  assert.equal(upload[0].userId, 'signed-in');
  assert.equal(guest.userId, 'guest', 'guest source must not be mutated before acknowledgement');

  const remote = upload.map(item => ({ ...item, synced: true }));
  const afterLogin = reconcileAttempts(upload, remote);
  assert.equal(afterLogin.length, 1);
  assert.equal(afterLogin[0].synced, true);

  const newDevice = reconcileAttempts([], remote);
  assert.deepEqual(newDevice, remote, 'new device must hydrate canonical attempts');

  assert.equal(dedupeAttempts([make('retry'), make('retry')]).length, 1, 'local retry must be idempotent');
  const stillPending = reconcileAttempts([make('failure')], remote);
  assert.ok(stillPending.some(item => item.id === 'failure' && item.synced === false), 'failed upload must survive remote merge');

  storageService.resetData();
  storageService.saveAttempt('student', make('pending', { userId: 'student' }));
  storageService.saveAttemptsLocal('student', [make('remote', { userId: 'student', synced: true })]);
  assert.equal(storageService.getPendingAttemptsLocal('student').some(item => item.id === 'pending'), true, 'full hydration must preserve pending');
  storageService.saveTopicAttemptsLocal('student', 'type', [make('topic-remote', { userId: 'student', synced: true })]);
  assert.equal(storageService.getPendingAttemptsLocal('student').some(item => item.id === 'pending'), true, 'topic hydration must preserve pending');

  // Test pruning: 250 synced attempts + 5 pending attempts
  const bulkSynced = Array.from({ length: 250 }, (_, i) => make(`sync_${i}`, {
    userId: 'student',
    synced: true,
    createdAt: new Date(Date.now() - (250 - i) * 60000).toISOString()
  }));
  const bulkPending = Array.from({ length: 5 }, (_, i) => make(`pending_${i}`, {
    userId: 'student',
    synced: false,
    createdAt: new Date(Date.now() + i * 1000).toISOString()
  }));

  const pruned = pruneAttempts([...bulkSynced, ...bulkPending], MAX_LOCAL_SYNCED_ATTEMPTS);
  assert.equal(pruned.length, MAX_LOCAL_SYNCED_ATTEMPTS + 5, 'Must keep exactly maxSynced + all pending');
  assert.equal(pruned.filter(a => a.synced === false).length, 5, 'All pending attempts must be preserved');
  assert.equal(pruned.filter(a => a.synced === true).length, MAX_LOCAL_SYNCED_ATTEMPTS, 'Synced attempts must be pruned to maxSynced');
  // Newest synced attempt must be kept, oldest synced attempt must be dropped
  assert.equal(pruned.some(a => a.id === 'sync_249'), true, 'Newest synced attempt must be kept');
  assert.equal(pruned.some(a => a.id === 'sync_0'), false, 'Oldest synced attempt must be pruned');

  // Test storageService auto-pruning integration
  storageService.saveAttemptsLocal('student', bulkSynced);
  assert.equal(storageService.getAttempts('student').filter(a => a.synced === true).length, MAX_LOCAL_SYNCED_ATTEMPTS, 'saveAttemptsLocal must prune to maxSynced');

  console.log('Learning sync adapter passed: offline, guest login, new device, retry, failure, and LocalStorage 200-item pruning cases.');
} finally {
  await server.close();
}
