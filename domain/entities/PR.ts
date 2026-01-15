// domain/entities/PR.ts
import { PRId } from '../value-objects/PRId';
import { PRState } from '../value-objects/PRState';
import { Repository } from '../value-objects/Repository';
import { UserMetadata } from '../value-objects/UserMetadata';
import { Comment } from './Comment';
import { Review } from './Review';

export class PRNumber {
  private constructor(private readonly value: number) {
    if (value <= 0) {
      throw new Error('PR number must be positive');
    }
  }

  static create(value: number): PRNumber {
    return new PRNumber(value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: PRNumber): boolean {
    return this.value === other.value;
  }
}

export class Title {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
  }

  static create(value: string): Title {
    return new Title(value);
  }

  toString(): string {
    return this.value;
  }
}

export class Author {
  private constructor(
    public readonly login: string,
    public readonly avatarUrl?: string
  ) {
    if (!login || login.trim().length === 0) {
      throw new Error('Author login cannot be empty');
    }
  }

  static create(login: string, avatarUrl?: string): Author {
    return new Author(login, avatarUrl);
  }

  equals(other: Author): boolean {
    return this.login === other.login;
  }
}

export class ReviewStatus {
  private constructor(
    public readonly approved: number,
    public readonly changesRequested: number,
    public readonly commented: number,
    public readonly pending: number
  ) {
    if (approved < 0 || changesRequested < 0 || commented < 0 || pending < 0) {
      throw new Error('Review counts cannot be negative');
    }
  }

  static create(data: {
    approved: number;
    changesRequested: number;
    commented: number;
    pending: number;
  }): ReviewStatus {
    return new ReviewStatus(
      data.approved,
      data.changesRequested,
      data.commented,
      data.pending
    );
  }

  static empty(): ReviewStatus {
    return new ReviewStatus(0, 0, 0, 0);
  }

  hasPendingReviews(): boolean {
    return this.pending > 0;
  }

  hasApprovals(): boolean {
    return this.approved > 0;
  }

  hasChangesRequested(): boolean {
    return this.changesRequested > 0;
  }

  total(): number {
    return this.approved + this.changesRequested + this.commented + this.pending;
  }
}

export class CommentCollection {
  private constructor(
    private readonly comments: Comment[],
    public readonly total: number,
    public readonly unresolved: number,
    public readonly lastCommentAt?: Date
  ) {}

  static create(comments: Comment[]): CommentCollection {
    const unresolved = comments.filter(c => !c.isResolved).length;
    const lastComment = comments.length > 0 
      ? comments.reduce((latest, current) => 
          current.createdAt > latest.createdAt ? current : latest
        )
      : undefined;

    return new CommentCollection(
      comments,
      comments.length,
      unresolved,
      lastComment?.createdAt
    );
  }

  static empty(): CommentCollection {
    return new CommentCollection([], 0, 0);
  }

  getComments(): Comment[] {
    return [...this.comments];
  }

  hasNewCommentsSince(since: Date): boolean {
    if (!this.lastCommentAt) return false;
    return this.lastCommentAt > since;
  }

  getCommentsBySource(source: string): Comment[] {
    return this.comments.filter(c => c.source.toString() === source);
  }

  addComment(comment: Comment): CommentCollection {
    const newComments = [...this.comments, comment];
    return CommentCollection.create(newComments);
  }
}

export class PR {
  private constructor(
    public readonly id: PRId,
    public readonly number: PRNumber,
    public readonly title: Title,
    public readonly url: string,
    public readonly repository: Repository,
    public readonly author: Author,
    public readonly assignees: string[],
    public readonly reviewers: string[],
    public readonly status: PRState,
    public readonly reviewStatus: ReviewStatus,
    public readonly comments: CommentCollection,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly lastSyncedAt: Date,
    private userMetadata?: UserMetadata
  ) {}

  static create(data: {
    id: string;
    number: number;
    title: string;
    url: string;
    repository: { owner: string; name: string };
    author: { login: string; avatarUrl?: string };
    assignees?: string[];
    reviewers?: string[];
    status: PRState;
    reviewStatus: ReviewStatus;
    comments: Comment[];
    createdAt: Date;
    updatedAt: Date;
    lastSyncedAt: Date;
    userMetadata?: UserMetadata;
  }): PR {
    return new PR(
      PRId.create(data.id),
      PRNumber.create(data.number),
      Title.create(data.title),
      data.url,
      Repository.create(data.repository.owner, data.repository.name),
      Author.create(data.author.login, data.author.avatarUrl),
      data.assignees ?? [],
      data.reviewers ?? [],
      data.status,
      data.reviewStatus,
      CommentCollection.create(data.comments),
      data.createdAt,
      data.updatedAt,
      data.lastSyncedAt,
      data.userMetadata
    );
  }

  needsReview(): boolean {
    return this.status.isOpen() && this.reviewStatus.hasPendingReviews();
  }

  hasNewComments(since: Date): boolean {
    return this.comments.hasNewCommentsSince(since);
  }

  updateUserMetadata(metadata: UserMetadata): PR {
    return new PR(
      this.id,
      this.number,
      this.title,
      this.url,
      this.repository,
      this.author,
      this.assignees,
      this.reviewers,
      this.status,
      this.reviewStatus,
      this.comments,
      this.createdAt,
      this.updatedAt,
      this.lastSyncedAt,
      metadata
    );
  }

  updateReviewStatus(reviewStatus: ReviewStatus): PR {
    return new PR(
      this.id,
      this.number,
      this.title,
      this.url,
      this.repository,
      this.author,
      this.assignees,
      this.reviewers,
      this.status,
      reviewStatus,
      this.comments,
      this.createdAt,
      this.updatedAt,
      this.lastSyncedAt,
      this.userMetadata
    );
  }

  updateComments(comments: Comment[]): PR {
    return new PR(
      this.id,
      this.number,
      this.title,
      this.url,
      this.repository,
      this.author,
      this.assignees,
      this.reviewers,
      this.status,
      this.reviewStatus,
      CommentCollection.create(comments),
      this.createdAt,
      this.updatedAt,
      this.lastSyncedAt,
      this.userMetadata
    );
  }

  updateLastSyncedAt(date: Date): PR {
    return new PR(
      this.id,
      this.number,
      this.title,
      this.url,
      this.repository,
      this.author,
      this.assignees,
      this.reviewers,
      this.status,
      this.reviewStatus,
      this.comments,
      this.createdAt,
      this.updatedAt,
      date,
      this.userMetadata
    );
  }

  getUserMetadata(): UserMetadata | undefined {
    return this.userMetadata;
  }
}
