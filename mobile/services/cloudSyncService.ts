import { collection, doc, getDoc, getDocs, query, orderBy, documentId, limit, startAfter, type QueryDocumentSnapshot, type QuerySnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';
import { useUserStore, type UserProfile } from '../stores';
import { flushLearningStorage, waitForLearningHydration } from '../stores/useUserStore';
import { accountScope, emptyAccount, type CanonicalRecord, type CanonicalMistake } from './accountLearningState';
import { runOutbox, type CanonicalAck } from './outboxDriver';

let running: Promise<boolean> | null = null;
let nextRetryAt = 0;
let failures = 0;
let retryScope = '';

export const CloudSyncService = {
  async syncToCloud(force = false): Promise<boolean> {
    await waitForLearningHydration();
    const user = useUserStore.getState().user;
    if (!user?.uid || user.isAnonymous || auth.currentUser?.uid !== user.uid) return false;
    const scope = accountScope(user.uid);
    if (scope !== retryScope) { retryScope = scope; nextRetryAt = 0; failures = 0; }
    if (running) return running;
    if (!force && Date.now() < nextRetryAt) return false;
    const uid = user.uid;
    const send = httpsCallable<any, CanonicalAck>(functions, 'syncLearningData', { timeout: 125_000 });
    running = runOutbox({
      scope, uid,
      isCurrent: () => useUserStore.getState().activeScope === scope && auth.currentUser?.uid === uid,
      getAccount: () => useUserStore.getState().accounts[scope] || emptyAccount(),
      update: update => useUserStore.getState().updateAccount(scope, update),
      flush: flushLearningStorage,
      send: async payload => (await send(payload)).data,
      pull: async () => {
        const records: CanonicalRecord[] = [];
        let cursor: QueryDocumentSnapshot | undefined;
        do {
          if (auth.currentUser?.uid !== uid) throw new Error('Tài khoản đã thay đổi.');
          const base = collection(db, 'users', uid, 'learning_attempts');
          const page: QuerySnapshot = await getDocs(query(base, orderBy(documentId()), ...(cursor ? [startAfter(cursor)] : []), limit(200)));
          records.push(...page.docs.map(item => item.data() as CanonicalRecord));
          cursor = page.size === 200 ? page.docs.at(-1) : undefined;
        } while (cursor);
        const mistakes: CanonicalMistake[] = [];
        cursor = undefined;
        do {
          if (auth.currentUser?.uid !== uid) throw new Error('Tài khoản đã thay đổi.');
          const base = collection(db, 'users', uid, 'learning_mistakes');
          const page: QuerySnapshot = await getDocs(query(base, orderBy(documentId()), ...(cursor ? [startAfter(cursor)] : []), limit(200)));
          mistakes.push(...page.docs.map(item => item.data() as CanonicalMistake));
          cursor = page.size === 200 ? page.docs.at(-1) : undefined;
        } while (cursor);
        const userDoc = await getDoc(doc(db, 'users', uid));
        return { records, mistakes, xp: Number(userDoc.data()?.stats?.xpScore) || 0 };
      },
    }).then(ok => {
      if (ok) { failures = 0; nextRetryAt = Date.now() + 30_000; }
      else { failures++; nextRetryAt = Date.now() + Math.min(120_000, 2_000 * 2 ** Math.min(failures, 6)); }
      return ok;
    }).finally(() => { running = null; });
    return running;
  },

  async pullAndMergeFromCloud(user: UserProfile): Promise<boolean> {
    if (useUserStore.getState().user?.uid !== user.uid) return false;
    return this.syncToCloud(true);
  },
};
