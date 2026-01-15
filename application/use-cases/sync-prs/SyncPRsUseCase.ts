// application/use-cases/sync-prs/SyncPRsUseCase.ts
import type { PRRepository } from '../../../domain/repositories/PRRepository';
import type { CommentRepository } from '../../../domain/repositories/CommentRepository';
import type { ReviewRepository } from '../../../domain/repositories/ReviewRepository';
import { PRStatusCalculator } from '../../../domain/services/PRStatusCalculator';
import { GitHubAPIClient } from '../../../infrastructure/external/github/GitHubAPIClient';
import { GitHubPRMapper } from '../../../infrastructure/external/github/GitHubPRMapper';
import { SyncPRsCommand } from './SyncPRsCommand';

export class SyncPRsUseCase {
  private statusCalculator = new PRStatusCalculator();

  constructor(
    private prRepository: PRRepository,
    private commentRepository: CommentRepository,
    private reviewRepository: ReviewRepository,
    private githubClient: GitHubAPIClient
  ) {}

  async execute(command: SyncPRsCommand): Promise<void> {
    // 1. GitHub APIからPRデータ取得
    const githubPRs = await this.githubClient.getPRs(command.userId.toString());

    // 2. 各PRのコメントとレビューを取得
    for (const githubPR of githubPRs) {
      const owner = githubPR.head.repo.owner.login;
      const repo = githubPR.head.repo.name;
      const number = githubPR.number;

      let comments: any[] = [];
      let reviews: any[] = [];

      try {
        // コメント取得
        if (this.commentRepository instanceof (await import('../../../infrastructure/repositories/GitHubCommentRepository')).GitHubCommentRepository) {
          comments = await (this.commentRepository as any).findByPRWithRepository(owner, repo, number);
        }

        // レビュー取得
        if (this.reviewRepository instanceof (await import('../../../infrastructure/repositories/GitHubReviewRepository')).GitHubReviewRepository) {
          reviews = await (this.reviewRepository as any).findByPRWithRepository(owner, repo, number);
        }
      } catch (error) {
        console.error(`Failed to fetch comments/reviews for PR ${number}:`, error);
        // エラーが発生してもPRデータは保存する
      }

      // 3. ドメインモデルに変換
      const domainComments = comments.map(c => GitHubPRMapper.toDomainComment(c));
      const domainReviews = reviews.map(r => GitHubPRMapper.toDomainReview(r));
      const pr = GitHubPRMapper.toDomainPR(githubPR, domainComments, domainReviews);

      // 4. レビュー状態を計算（ドメインサービス）
      const reviewStatus = this.statusCalculator.calculateReviewStatus(pr, domainReviews);
      const updatedPR = pr.updateReviewStatus(reviewStatus);

      // 5. 保存
      await this.prRepository.save(updatedPR);
    }
  }
}
