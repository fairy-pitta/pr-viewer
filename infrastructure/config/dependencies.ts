// infrastructure/config/dependencies.ts
import type { PRRepository } from '@domain/repositories/PRRepository';
import type { CommentRepository } from '@domain/repositories/CommentRepository';
import type { ReviewRepository } from '@domain/repositories/ReviewRepository';
import { VercelKVPRRepository } from '@infrastructure/repositories/VercelKVPRRepository';
import { IndexedDBPRRepository } from '@infrastructure/repositories/IndexedDBPRRepository';
import { GitHubCommentRepository } from '@infrastructure/repositories/GitHubCommentRepository';
import { GitHubReviewRepository } from '@infrastructure/repositories/GitHubReviewRepository';
import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';
import { VercelKVClient } from '@infrastructure/external/storage/VercelKVClient';
import { CloudflareKVClient } from '@infrastructure/external/storage/CloudflareKVClient';
import { IndexedDBClient } from '@infrastructure/external/storage/IndexedDBClient';
import { BrowserNotificationService } from '@infrastructure/notifications/BrowserNotificationService';
import { PWAPushNotificationService } from '@infrastructure/notifications/PWAPushNotificationService';

export interface Dependencies {
  prRepository: PRRepository;
  commentRepository: CommentRepository;
  reviewRepository: ReviewRepository;
  githubClient: GitHubAPIClient;
  notificationService: BrowserNotificationService | PWAPushNotificationService;
}

export interface DependencyConfig {
  githubAccessToken: string;
  vercelKV?: {
    url: string;
    token: string;
  };
  cloudflareKV?: KVNamespace; // Cloudflare Workers環境で注入される
  indexedDB?: {
    dbName: string;
    version: number;
  };
  serviceWorkerRegistration?: ServiceWorkerRegistration;
}

export class DependencyContainer {
  private dependencies: Dependencies | null = null;

  async initialize(config: DependencyConfig): Promise<Dependencies> {
    // GitHub APIクライアント
    const githubClient = new GitHubAPIClient(config.githubAccessToken);

    // ストレージクライアント
    let prRepository: PRRepository;
    
    if (config.cloudflareKV) {
      const kvClient = new CloudflareKVClient(config.cloudflareKV);
      prRepository = new VercelKVPRRepository(kvClient as any); // 同じインターフェース
    } else if (config.vercelKV) {
      const kvClient = new VercelKVClient(config.vercelKV);
      prRepository = new VercelKVPRRepository(kvClient);
    } else if (config.indexedDB) {
      const dbClient = new IndexedDBClient(config.indexedDB);
      await dbClient.open();
      prRepository = new IndexedDBPRRepository(dbClient);
    } else {
      throw new Error('Either Vercel KV, Cloudflare KV, or IndexedDB configuration is required');
    }

    // リポジトリ
    const commentRepository = new GitHubCommentRepository(githubClient);
    const reviewRepository = new GitHubReviewRepository(githubClient);

    // 通知サービス
    let notificationService: BrowserNotificationService | PWAPushNotificationService;
    if (config.serviceWorkerRegistration) {
      notificationService = new PWAPushNotificationService(config.serviceWorkerRegistration);
    } else {
      notificationService = new BrowserNotificationService();
    }

    this.dependencies = {
      prRepository,
      commentRepository,
      reviewRepository,
      githubClient,
      notificationService,
    };

    return this.dependencies;
  }

  getDependencies(): Dependencies {
    if (!this.dependencies) {
      throw new Error('Dependencies not initialized. Call initialize() first.');
    }
    return this.dependencies;
  }
}

// シングルトンインスタンス
export const dependencyContainer = new DependencyContainer();
