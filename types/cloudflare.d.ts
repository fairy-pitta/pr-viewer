// Cloudflare Workers types
declare namespace Cloudflare {
  interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>;
    put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: { expirationTtl?: number; expiration?: number }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: Array<{ name: string; expiration?: number }>; list_complete: boolean; cursor?: string }>;
  }
}

declare type KVNamespace = Cloudflare.KVNamespace;
