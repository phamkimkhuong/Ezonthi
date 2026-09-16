import {
  prepareBatch, canonicalPayload, acknowledgeBatch, mergeCanonical,
  type LearningAccount, type CanonicalRecord, type CanonicalMistake,
} from './accountLearningState';

export interface CanonicalAck {
  acknowledgedIds: string[];
  conflictIds: string[];
  rejectedCount: number;
  summary: { stats: { xpScore: number } };
}
export interface OutboxDependencies {
  scope: string;
  uid: string;
  isCurrent(): boolean;
  getAccount(): LearningAccount;
  update(update: (account: LearningAccount) => LearningAccount): void;
  flush(): Promise<void>;
  send(payload: { expectedUserId: string; operationId: string; attempts: NonNullable<ReturnType<typeof canonicalPayload>>[] }): Promise<CanonicalAck>;
  pull(): Promise<{ records: CanonicalRecord[]; xp: number; mistakes?: CanonicalMistake[] }>;
}

export async function runOutbox(dependencies: OutboxDependencies): Promise<boolean> {
  const d = dependencies;
  try {
    if (!d.isCurrent()) return false;
    for (let batches = 0; batches < 10 && d.isCurrent(); batches++) {
      d.update(prepareBatch);
      await d.flush(); // Persist operation ID and immutable batch BEFORE network.
      const account = d.getAccount();
      const batch = account.batch;
      if (!batch) break;
      const attempts = batch.attemptIds.map(id => account.attempts.find(a => a.id === id)!);
      if (attempts.some(a => !a || !canonicalPayload(a))) {
        d.update(current => acknowledgeBatch(current, batch.operationId, [], [], attempts.length));
        await d.flush();
        continue;
      }
      if (!d.isCurrent()) return false;
      const ack = await d.send({ expectedUserId: d.uid, operationId: batch.operationId,
        attempts: attempts.map(a => canonicalPayload(a)!),
      });
      if (!Array.isArray(ack.acknowledgedIds) || !Array.isArray(ack.conflictIds) ||
          !Number.isInteger(ack.rejectedCount) || !Number.isFinite(ack.summary?.stats?.xpScore)) {
        throw new Error('ACK không hợp lệ; batch được giữ nguyên để thử lại.');
      }
      // Only update the captured account. Never apply A's response to active account B.
      d.update(current => ({
        ...acknowledgeBatch(current, batch.operationId, ack.acknowledgedIds, ack.conflictIds, ack.rejectedCount),
        serverXp: ack.summary.stats.xpScore,
      }));
      await d.flush(); // Persist ACK before starting the next batch.
      if (d.getAccount().batch?.operationId === batch.operationId) return false; // Partial ACK: retry unchanged.
    }
    if (!d.isCurrent()) return false;
    const snapshot = await d.pull();
    d.update(account => ({
      ...mergeCanonical(account, snapshot.records, snapshot.xp, snapshot.mistakes),
      lastSyncedAt: new Date().toISOString(),
      syncError: account.attempts.some(a => a.syncStatus === 'blocked')
        ? 'Có bài bị từ chối hoặc xung đột. Bản trên máy vẫn được giữ.' : null,
    }));
    await d.flush();
    return !d.getAccount().attempts.some(a => a.syncStatus === 'pending' || a.syncStatus === 'blocked');
  } catch (error) {
    d.update(account => ({ ...account, syncError: error instanceof Error ? error.message : 'Đồng bộ chưa hoàn tất; bản trên máy vẫn được giữ.' }));
    return false;
  }
}
