// infrastructure/external/github/GitHubPRMapper.ts
import { PR } from '@domain/entities/PR';
import { Comment } from '@domain/entities/Comment';
import { Review } from '@domain/entities/Review';
import { PRState } from '@domain/value-objects/PRState';
import { CommentSource } from '@domain/value-objects/CommentSource';
import { ReviewState } from '@domain/value-objects/ReviewState';
import { ReviewStatus } from '@domain/entities/PR';
import type { GitHubPR, GitHubComment, GitHubReview } from './types';

export class GitHubPRMapper {
  static toDomainPR(
    githubPR: GitHubPR,
    comments: Comment[],
    reviews: Review[]
  ): PR {
    const state = githubPR.draft
      ? PRState.DRAFT
      : githubPR.state === 'closed'
      ? githubPR.merged_at
        ? PRState.MERGED
        : PRState.CLOSED
      : PRState.OPEN;

    const reviewStatus = ReviewStatus.create({
      approved: reviews.filter(r => r.isApproved()).length,
      changesRequested: reviews.filter(r => r.requiresChanges()).length,
      commented: reviews.filter(r => r.isCommented()).length,
      pending: githubPR.requested_reviewers.length - reviews.length,
    });

    return PR.create({
      id: githubPR.id.toString(),
      number: githubPR.number,
      title: githubPR.title,
      url: githubPR.html_url,
      repository: {
        owner: githubPR.head.repo.owner.login,
        name: githubPR.head.repo.name,
      },
      author: {
        login: githubPR.user.login,
        avatarUrl: githubPR.user.avatar_url,
      },
      assignees: githubPR.assignees.map(a => a.login),
      reviewers: githubPR.requested_reviewers.map(r => r.login),
      status: state,
      reviewStatus,
      comments,
      createdAt: new Date(githubPR.created_at),
      updatedAt: new Date(githubPR.updated_at),
      lastSyncedAt: new Date(),
    });
  }

  static toDomainComment(githubComment: GitHubComment): Comment {
    const source = CommentSource.fromAuthor({
      type: githubComment.user.type,
      login: githubComment.user.login,
    });

    return Comment.create({
      id: githubComment.id.toString(),
      author: {
        login: githubComment.user.login,
        type: githubComment.user.type,
        avatarUrl: githubComment.user.avatar_url,
      },
      content: githubComment.body,
      source,
      createdAt: new Date(githubComment.created_at),
      isResolved: false,
      url: githubComment.html_url,
    });
  }

  static toDomainReview(githubReview: GitHubReview): Review {
    const state = ReviewState.fromString(githubReview.state);

    return Review.create({
      id: githubReview.id.toString(),
      reviewer: {
        login: githubReview.user.login,
        avatarUrl: githubReview.user.avatar_url,
      },
      state,
      submittedAt: new Date(githubReview.submitted_at),
      body: githubReview.body,
    });
  }
}
