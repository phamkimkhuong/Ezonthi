export interface StringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}

// Serialize snapshots so an older slow write can never overwrite a newer ACK/draft.
export function createDurableStorage(storage: StringStorage) {
  let tail: Promise<void> = Promise.resolve();
  let failure: unknown;
  let readFailed = false;
  const enqueue = (operation: () => Promise<unknown>) => {
    tail = tail.then(operation).then(() => { failure = undefined; }, error => { failure = error; });
    return tail;
  };
  return {
    async getItem(key: string) {
      try {
        const raw = await storage.getItem(key);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.version !== 2 && !await storage.getItem(`${key}:before-v2`)) {
            await storage.setItem(`${key}:before-v2`, raw);
          }
        }
        return raw;
      } catch (error) { readFailed = true; throw error; }
    },
    setItem: (key: string, value: string) => enqueue(() => {
      if (readFailed) throw new Error('Không ghi đè dữ liệu cũ sau lỗi đọc/hydration.');
      return storage.setItem(key, value);
    }),
    removeItem: (key: string) => enqueue(() => {
      if (readFailed) throw new Error('Không xóa dữ liệu cũ sau lỗi đọc/hydration.');
      return storage.removeItem(key);
    }),
    async flush() {
      await tail;
      if (failure) throw failure;
    },
  };
}
