// domain/services/CommentAnalyzer.ts
import { Comment } from '../entities/Comment';
import { CommentSource } from '../value-objects/CommentSource';

export class CommentStatistics {
  private constructor(
    public readonly total: number,
    public readonly unresolved: number,
    public readonly bySource: Map<string, number>
  ) {}

  static create(total: number, unresolved: number, bySource: Map<string, number>): CommentStatistics {
    return new CommentStatistics(total, unresolved, bySource);
  }

  getCountBySource(source: string): number {
    return this.bySource.get(source) ?? 0;
  }
}

export class CommentAnalyzer {
  analyzeComments(comments: Comment[]): CommentStatistics {
    const total = comments.length;
    const unresolved = comments.filter(c => !c.isResolved).length;
    const bySource = this.groupBySource(comments);

    return CommentStatistics.create(total, unresolved, bySource);
  }

  private groupBySource(comments: Comment[]): Map<string, number> {
    const map = new Map<string, number>();

    for (const comment of comments) {
      const source = comment.source.toString();
      const current = map.get(source) ?? 0;
      map.set(source, current + 1);
    }

    return map;
  }

  getCommentsBySource(comments: Comment[], source: CommentSource): Comment[] {
    return comments.filter(c => c.source.equals(source));
  }

  getBotComments(comments: Comment[]): Comment[] {
    return comments.filter(c => c.isFromBot());
  }

  getReviewerComments(comments: Comment[]): Comment[] {
    return comments.filter(c => c.isFromReviewer());
  }

  getNewCommentsSince(comments: Comment[], since: Date): Comment[] {
    return comments.filter(c => c.isNewerThan(since));
  }
}
