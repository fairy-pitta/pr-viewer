// infrastructure/external/storage/IndexedDBClient.ts

export interface IndexedDBConfig {
  dbName: string;
  version: number;
}

export class IndexedDBClient {
  private db: IDBDatabase | null = null;

  constructor(private config: IndexedDBConfig) {}

  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // PRsストア
        if (!db.objectStoreNames.contains('prs')) {
          const prsStore = db.createObjectStore('prs', { keyPath: 'id' });
          prsStore.createIndex('userId', 'userId', { unique: false });
          prsStore.createIndex('repository', 'repository', { unique: false });
        }

        // Commentsストア
        if (!db.objectStoreNames.contains('comments')) {
          const commentsStore = db.createObjectStore('comments', { keyPath: 'id' });
          commentsStore.createIndex('prId', 'prId', { unique: false });
        }

        // Reviewsストア
        if (!db.objectStoreNames.contains('reviews')) {
          const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id' });
          reviewsStore.createIndex('prId', 'prId', { unique: false });
        }
      };
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async set<T>(storeName: string, key: string, value: T): Promise<void> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...value, id: key });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAll<T>(storeName: string, indexName?: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const source = indexName ? store.index(indexName) : store;
      const request = query ? source.getAll(query) : source.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) {
      await this.open();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
