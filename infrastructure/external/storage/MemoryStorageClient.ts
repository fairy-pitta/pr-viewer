// infrastructure/external/storage/MemoryStorageClient.ts

/**
 * サーバーサイド用のメモリストレージクライアント
 * IndexedDBの代替として使用
 */
export class MemoryStorageClient {
  private storage: Map<string, Map<string, any>> = new Map();

  async open(): Promise<void> {
    // メモリストレージは既に利用可能
  }

  async close(): Promise<void> {
    // クリーンアップは不要（メモリは自動的に解放される）
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    const store = this.storage.get(storeName);
    if (!store) {
      return null;
    }
    return store.get(key) || null;
  }

  async set<T>(storeName: string, key: string, value: T): Promise<void> {
    if (!this.storage.has(storeName)) {
      this.storage.set(storeName, new Map());
    }
    const store = this.storage.get(storeName)!;
    store.set(key, value);
  }

  async delete(storeName: string, key: string): Promise<void> {
    const store = this.storage.get(storeName);
    if (store) {
      store.delete(key);
    }
  }

  async getAll<T>(storeName: string, indexName?: string, indexValue?: string): Promise<T[]> {
    const store = this.storage.get(storeName);
    if (!store) {
      return [];
    }

    const values = Array.from(store.values()) as T[];

    // インデックスでのフィルタリング（簡易実装）
    if (indexName && indexValue) {
      return values.filter((item: any) => {
        if (typeof item === 'object' && item !== null) {
          return item[indexName] === indexValue;
        }
        return false;
      });
    }

    return values;
  }

  async clear(storeName: string): Promise<void> {
    this.storage.delete(storeName);
  }
}
