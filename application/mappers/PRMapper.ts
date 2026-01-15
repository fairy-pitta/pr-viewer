// application/mappers/PRMapper.ts
import { PR } from '@domain/entities/PR';
import type { PRDTO } from '@application/dto/PRDTO';
import { CommentAnalyzer } from '@domain/services/CommentAnalyzer';

export class PRMapper {
  private static commentAnalyzer = new CommentAnalyzer();

  static toDTO(pr: PR): PRDTO {
    const userMetadata = pr.getUserMetadata();
    const commentStats = this.commentAnalyzer.analyzeComments(pr.comments.getComments());
    const bySource: Record<string, number> = {};
    
    commentStats.bySource.forEach((count, source) => {
      bySource[source] = count;
    });

    return {
      id: pr.id.toString(),
      number: pr.number.toNumber(),
      title: pr.title.toString(),
      url: pr.url,
      repository: {
        owner: pr.repository.owner,
        name: pr.repository.name,
        fullName: pr.repository.toString(),
      },
      author: {
        login: pr.author.login,
        avatarUrl: pr.author.avatarUrl,
      },
      assignees: pr.assignees,
      reviewers: pr.reviewers,
      status: pr.status.toString(),
      reviewStatus: {
        approved: pr.reviewStatus.approved,
        changesRequested: pr.reviewStatus.changesRequested,
        commented: pr.reviewStatus.commented,
        pending: pr.reviewStatus.pending,
      },
      comments: {
        total: pr.comments.total,
        unresolved: pr.comments.unresolved,
        lastCommentAt: pr.comments.lastCommentAt?.toISOString(),
        bySource: Object.keys(bySource).length > 0 ? bySource : undefined,
      },
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
      lastSyncedAt: pr.lastSyncedAt.toISOString(),
      userMetadata: userMetadata
        ? {
            notes: userMetadata.notes,
            tags: userMetadata.tags,
            priority: userMetadata.priority,
            customStatus: userMetadata.customStatus,
          }
        : undefined,
    };
  }

  static toDTOs(prs: PR[]): PRDTO[] {
    return prs.map(pr => this.toDTO(pr));
  }
}
