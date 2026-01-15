// infrastructure/repositories/GitHubReviewRepository.ts
import type { ReviewRepository } from '../../domain/repositories/ReviewRepository';
import { Review } from '../../domain/entities/Review';
import { PRId } from '../../domain/value-objects/PRId';
import { GitHubAPIClient } from '../external/github/GitHubAPIClient';
import { GitHubPRMapper } from '../external/github/GitHubPRMapper';

export class GitHubReviewRepository implements ReviewRepository {
  constructor(private githubClient: GitHubAPIClient) {}

  async findByPR(prId: PRId): Promise<Review[]> {
    // PR IDからリポジトリ情報を取得する必要がある
    // 簡略化のため、実装は省略
    throw new Error('findByPR requires repository information');
  }

  async save(prId: PRId, review: Review): Promise<void> {
    // GitHub APIは読み取り専用のため、保存は不要
  }

  async saveMany(prId: PRId, reviews: Review[]): Promise<void> {
    // GitHub APIは読み取り専用のため、保存は不要
  }

  async findByPRWithRepository(owner: string, repo: string, number: number): Promise<Review[]> {
    const githubReviews = await this.githubClient.getReviews(owner, repo, number);
    return githubReviews.map(r => GitHubPRMapper.toDomainReview(r));
  }
}
