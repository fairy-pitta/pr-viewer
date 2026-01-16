// application/use-cases/sync-prs/SyncPRsUseCase.ts
import type { CommentRepository } from '@domain/repositories/CommentRepository';
import type { ReviewRepository } from '@domain/repositories/ReviewRepository';
import { PR } from '@domain/entities/PR';
import { PRStatusCalculator } from '@domain/services/PRStatusCalculator';
import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';
import { GitHubPRMapper } from '@infrastructure/external/github/GitHubPRMapper';
import { SyncPRsCommand } from './SyncPRsCommand';

export class SyncPRsUseCase {
  private statusCalculator = new PRStatusCalculator();

  constructor(
    private commentRepository: CommentRepository,
    private reviewRepository: ReviewRepository,
    private githubClient: GitHubAPIClient
  ) {}

  async execute(command: SyncPRsCommand): Promise<PR[]> {
    // 1. GitHub APIからPRデータ取得
    const githubPRs = await this.githubClient.getPRs(command.userId.toString());
    const results: PR[] = [];

    // 2. 各PRのコメントとレビューを取得
    for (const githubPR of githubPRs) {
      try {
        const owner = (githubPR as any).head.repo.owner.login;
        const repo = (githubPR as any).head.repo.name;
        const number = githubPR.number;

        let comments: any[] = [];
        let reviews: any[] = [];

        try {
          // コメント取得
          if (this.commentRepository instanceof (await import('@infrastructure/repositories/GitHubCommentRepository')).GitHubCommentRepository) {
            comments = await (this.commentRepository as any).findByPRWithRepository(owner, repo, number);
          }

          // レビュー取得
          if (this.reviewRepository instanceof (await import('@infrastructure/repositories/GitHubReviewRepository')).GitHubReviewRepository) {
            reviews = await (this.reviewRepository as any).findByPRWithRepository(owner, repo, number);
          }
        } catch (error) {
          console.error(`Failed to fetch comments/reviews for PR ${number}:`, error);
        }

        // 3. ドメインモデルに変換
        const pr = GitHubPRMapper.toDomainPR(githubPR as any, comments, reviews);

        // 4. レビュー状態を計算（ドメインサービス）
        const reviewStatus = this.statusCalculator.calculateReviewStatus(pr, reviews);
        const updatedPR = pr.updateReviewStatus(reviewStatus);

        results.push(updatedPR);
      } catch (error) {
        console.error(`Failed to process PR ${githubPR.number}:`, error);
      }
    }

    return results;
  }
}
