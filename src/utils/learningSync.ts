import type { UserAttempt, UserMistake } from '../types';

export function dedupeAttempts(attempts: UserAttempt[]): UserAttempt[] {
  const byId = new Map<string, UserAttempt>();
  for (const attempt of attempts) {
    if (!attempt?.id) continue;
    const current = byId.get(attempt.id);
    if (!current) {
      byId.set(attempt.id, attempt);
      continue;
    }
    // Prefer an acknowledged copy; otherwise retain the first payload so a
    // retry cannot silently replace the original attempt with the same ID.
    if (current.synced === false && attempt.synced === true) byId.set(attempt.id, attempt);
  }
  return [...byId.values()];
}

export function pendingAttemptsForAccount(
  userId: string,
  localAttempts: UserAttempt[],
  guestAttempts: UserAttempt[]
): UserAttempt[] {
  return dedupeAttempts([
    ...localAttempts.filter(attempt => attempt.synced !== true),
    ...guestAttempts.map(attempt => ({ ...attempt, userId, synced: false })),
  ]);
}

/** Server copies win only after they exist remotely; unacknowledged local data survives. */
export function reconcileAttempts(localAttempts: UserAttempt[], remoteAttempts: UserAttempt[]): UserAttempt[] {
  const remote = new Map(remoteAttempts.map(attempt => [attempt.id, { ...attempt, synced: true }]));
  const pending = localAttempts.filter(attempt => attempt.synced !== true && !remote.has(attempt.id));
  return dedupeAttempts([...remote.values(), ...pending]);
}

export function mergeMistakes(...sources: UserMistake[][]): UserMistake[] {
  const byQuestion = new Map<string, UserMistake>();
  for (const mistake of sources.flat()) {
    if (!mistake?.questionId) continue;
    const current = byQuestion.get(mistake.questionId);
    if (!current || Date.parse(mistake.lastAttemptedAt || '') >= Date.parse(current.lastAttemptedAt || '')) {
      byQuestion.set(mistake.questionId, mistake);
    }
  }
  return [...byQuestion.values()];
}
