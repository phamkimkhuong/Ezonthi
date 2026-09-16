export interface StringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}

// Serialize snapshots so an older slow write can never overwrite a newer ACK/draft.
export function createDurableStorage(storage: StringStorage) {
  let tail: Promise<void> = Promise.resolve();
  let failure: unknown;
  const enqueue = (operation: () => Promise<unknown>) => {
    tail = tail.then(operation).then(() => { failure = undefined; }, error => { failure = error; });
    return tail;
  };
  return {
    getItem: (key: string) => storage.getItem(key),
    setItem: (key: string, value: string) => enqueue(() => storage.setItem(key, value)),
    removeItem: (key: string) => enqueue(() => storage.removeItem(key)),
    async flush() {
      await tail;
      if (failure) throw failure;
    },
  };
}
