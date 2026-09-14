import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface StoredChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

export interface ChatMessagePage {
  messages: StoredChatMessage[];
  nextCursor: number | null;
}

export const CHAT_HISTORY_LIMITS = {
  messageChars: 12_000,
  pageSize: 40,
  appendBatch: 10,
  legacyMigrationMessages: 400,
} as const;

const sessionRef = (uid: string, courseKey: string, sessionId: string) =>
  doc(db, 'users', uid, 'general_chats', courseKey, 'sessions', sessionId);

function validateMessages(messages: StoredChatMessage[]): StoredChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > CHAT_HISTORY_LIMITS.appendBatch) {
    throw new Error(`Mỗi lần chỉ được ghi 1–${CHAT_HISTORY_LIMITS.appendBatch} tin nhắn.`);
  }
  return messages.map(message => {
    if (!message || !['user', 'model'].includes(message.role) || typeof message.text !== 'string' ||
        message.text.length > CHAT_HISTORY_LIMITS.messageChars ||
        (message.imageUrl !== undefined && (typeof message.imageUrl !== 'string' || message.imageUrl.length > 2_000))) {
      throw new Error('Tin nhắn không hợp lệ hoặc vượt giới hạn.');
    }
    return { role: message.role, text: message.text, ...(message.imageUrl ? { imageUrl: message.imageUrl } : {}) };
  });
}

export async function appendChatMessages(
  uid: string,
  courseKey: string,
  sessionId: string,
  messages: StoredChatMessage[],
  metadata?: { title: string; subjectId: string; gradeId: string }
): Promise<void> {
  const safeMessages = validateMessages(messages);
  const targetSession = sessionRef(uid, courseKey, sessionId);
  const messageRefs = safeMessages.map(() => doc(collection(targetSession, 'messages')));
  await runTransaction(db, async transaction => {
    const session = await transaction.get(targetSession);
    const currentCount = Math.max(0, Number(session.data()?.messageCount) || 0);
    const now = new Date().toISOString();
    safeMessages.forEach((message, index) => {
      transaction.set(messageRefs[index], {
        ...message,
        sequence: currentCount + index + 1,
        createdAt: now,
      });
    });
    transaction.set(targetSession, {
      messageCount: currentCount + safeMessages.length,
      updatedAt: now,
      storageVersion: 2,
      ...(metadata && !session.exists ? {
        title: metadata.title.slice(0, 120),
        subjectId: metadata.subjectId,
        gradeId: metadata.gradeId,
        createdAt: now,
      } : {}),
    }, { merge: true });
  });
}

export async function loadChatMessagesPage(
  uid: string,
  courseKey: string,
  sessionId: string,
  cursor: number | null = null,
  requestedPageSize = CHAT_HISTORY_LIMITS.pageSize
): Promise<ChatMessagePage> {
  const pageSize = Math.max(1, Math.min(CHAT_HISTORY_LIMITS.pageSize, Math.round(requestedPageSize)));
  const messagesRef = collection(sessionRef(uid, courseKey, sessionId), 'messages');
  const constraints = [orderBy('sequence', 'desc'), ...(cursor === null ? [] : [startAfter(cursor)]), limit(pageSize)];
  const snapshot = await getDocs(query(messagesRef, ...constraints));
  const records = snapshot.docs.map(item => item.data() as StoredChatMessage & { sequence: number });
  return {
    messages: records.reverse().map(({ role, text, imageUrl }) => ({ role, text, ...(imageUrl ? { imageUrl } : {}) })),
    nextCursor: snapshot.size === pageSize ? Number(snapshot.docs[snapshot.docs.length - 1].data().sequence) : null,
  };
}

export async function migrateLegacyChatMessages(
  uid: string,
  courseKey: string,
  sessionId: string,
  legacyMessages: StoredChatMessage[]
): Promise<void> {
  const bounded = legacyMessages.slice(-CHAT_HISTORY_LIMITS.legacyMigrationMessages);
  const safeMessages = bounded.flatMap((_, index) => {
    if (index % CHAT_HISTORY_LIMITS.appendBatch !== 0) return [];
    return validateMessages(bounded.slice(index, index + CHAT_HISTORY_LIMITS.appendBatch));
  });
  const targetSession = sessionRef(uid, courseKey, sessionId);
  const messageRefs = safeMessages.map(() => doc(collection(targetSession, 'messages')));
  await runTransaction(db, async transaction => {
    const session = await transaction.get(targetSession);
    const currentCount = Math.max(0, Number(session.data()?.messageCount) || 0);
    const now = new Date().toISOString();
    safeMessages.forEach((message, index) => {
      transaction.set(messageRefs[index], {
        ...message,
        sequence: currentCount + index + 1,
        createdAt: now,
      });
    });
    transaction.set(targetSession, {
      messages: deleteField(),
      messageCount: currentCount + safeMessages.length,
      updatedAt: now,
      storageVersion: 2,
      legacyMigrationTruncated: legacyMessages.length > bounded.length,
    }, { merge: true });
  });
}

export async function deleteChatSession(uid: string, courseKey: string, sessionId: string): Promise<void> {
  const targetSession = sessionRef(uid, courseKey, sessionId);
  while (true) {
    const snapshot = await getDocs(query(collection(targetSession, 'messages'), limit(200)));
    if (snapshot.empty) break;
    const batch = writeBatch(db);
    snapshot.docs.forEach(message => batch.delete(message.ref));
    await batch.commit();
  }
  await deleteDoc(targetSession);
}
