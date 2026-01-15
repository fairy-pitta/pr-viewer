// infrastructure/external/storage/CloudflareKVClient.ts

export interface CloudflareKVConfig {
  // Cloudflare Workers環境では、KV名前空間が自動的に注入される
  // 型定義のみ
}

export class CloudflareKVClient {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async get(key: string): Promise<string | null> {
    return await this.kv.get(key);
  }

  async set(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    await this.kv.put(key, value, options);
  }

  async del(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    const data = await this.kv.get(`${key}:${field}`, 'text');
    return data;
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.kv.put(`${key}:${field}`, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    // Cloudflare KVは直接hgetallをサポートしていないため、
    // キーのリストを取得して個別に取得する必要がある
    // 簡略化のため、実装は省略
    throw new Error('hgetall not directly supported in Cloudflare KV');
  }

  async sadd(key: string, member: string): Promise<void> {
    // Cloudflare KVはSetを直接サポートしていないため、
    // JSON配列として保存する
    const existing = await this.kv.get(key);
    const set = existing ? JSON.parse(existing) : [];
    if (!set.includes(member)) {
      set.push(member);
      await this.kv.put(key, JSON.stringify(set));
    }
  }

  async smembers(key: string): Promise<string[]> {
    const data = await this.kv.get(key);
    return data ? JSON.parse(data) : [];
  }

  async srem(key: string, member: string): Promise<void> {
    const existing = await this.kv.get(key);
    if (existing) {
      const set = JSON.parse(existing);
      const filtered = set.filter((m: string) => m !== member);
      await this.kv.put(key, JSON.stringify(filtered));
    }
  }
}
