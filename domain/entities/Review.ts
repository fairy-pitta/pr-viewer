// domain/entities/Review.ts
import { ReviewState } from '@domain/value-objects/ReviewState';

export class ReviewId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Review ID cannot be empty');
    }
  }

  static create(value: string): ReviewId {
    return new ReviewId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ReviewId): boolean {
    return this.value === other.value;
  }
}

export class Reviewer {
  private constructor(
    public readonly login: string,
    public readonly avatarUrl?: string
  ) {
    if (!login || login.trim().length === 0) {
      throw new Error('Reviewer login cannot be empty');
    }
  }

  static create(login: string, avatarUrl?: string): Reviewer {
    return new Reviewer(login, avatarUrl);
  }

  equals(other: Reviewer): boolean {
    return this.login === other.login;
  }
}

export class Review {
  private constructor(
    public readonly id: ReviewId,
    public readonly reviewer: Reviewer,
    public readonly state: ReviewState,
    public readonly submittedAt: Date,
    public readonly body?: string
  ) {}

  static create(data: {
    id: string;
    reviewer: { login: string; avatarUrl?: string };
    state: ReviewState;
    submittedAt: Date;
    body?: string;
  }): Review {
    return new Review(
      ReviewId.create(data.id),
      Reviewer.create(data.reviewer.login, data.reviewer.avatarUrl),
      data.state,
      data.submittedAt,
      data.body
    );
  }

  isApproved(): boolean {
    return this.state.isApproved();
  }

  requiresChanges(): boolean {
    return this.state.requiresChanges();
  }

  isCommented(): boolean {
    return this.state.isCommented();
  }

  isDismissed(): boolean {
    return this.state.isDismissed();
  }

  isPending(): boolean {
    return this.state.isPending();
  }

  isNewerThan(date: Date): boolean {
    return this.submittedAt > date;
  }
}
