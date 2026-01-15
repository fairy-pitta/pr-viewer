// infrastructure/repositories/GitHubCommentRepository.ts
import type { CommentRepository } from '@domain/repositories/CommentRepository';
import { Comment } from '@domain/entities/Comment';
import { PRId } from '@domain/value-objects/PRId';
import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';
import { GitHubPRMapper } from '@infrastructure/external/github/GitHubPRMapper';
import { Repository } from '@domain/value-objects/Repository';

export class GitHubCommentRepository implements CommentRepository {
  constructor(private githubClient: GitHubAPIClient) {}

  async findByPR(prId: PRId): Promise<Comment[]> {
    // PR IDからリポジトリ情報を取得する必要がある
    // 簡略化のため、実装は省略
    throw new Error('findByPR requires repository information');
  }

  async findNewCommentsSince(prId: PRId, since: Date): Promise<Comment[]> {
    const comments = await this.findByPR(prId);
    return comments.filter(c => c.isNewerThan(since));
  }

  async save(prId: PRId, comment: Comment): Promise<void> {
    // GitHub APIは読み取り専用のため、保存は不要
    // ローカルキャッシュが必要な場合は別のリポジトリを使用
  }

  async saveMany(prId: PRId, comments: Comment[]): Promise<void> {
    // GitHub APIは読み取り専用のため、保存は不要
  }

  async findByPRWithRepository(owner: string, repo: string, number: number): Promise<Comment[]> {
    const githubComments = await this.githubClient.getComments(owner, repo, number);
    return githubComments.map(c => GitHubPRMapper.toDomainComment(c));
  }
}
