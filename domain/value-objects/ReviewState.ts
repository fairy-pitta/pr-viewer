// domain/value-objects/ReviewState.ts
import { InvalidReviewStateError } from '../errors/InvalidReviewStateError';

export class ReviewState {
  private constructor(private readonly value: string) {
    this.validate();
  }

  static readonly APPROVED = new ReviewState('APPROVED');
  static readonly CHANGES_REQUESTED = new ReviewState('CHANGES_REQUESTED');
  static readonly COMMENTED = new ReviewState('COMMENTED');
  static readonly DISMISSED = new ReviewState('DISMISSED');
  static readonly PENDING = new ReviewState('PENDING');

  static fromString(value: string): ReviewState {
    return new ReviewState(value);
  }

  isApproved(): boolean {
    return this.value === 'APPROVED';
  }

  requiresChanges(): boolean {
    return this.value === 'CHANGES_REQUESTED';
  }

  isCommented(): boolean {
    return this.value === 'COMMENTED';
  }

  isDismissed(): boolean {
    return this.value === 'DISMISSED';
  }

  isPending(): boolean {
    return this.value === 'PENDING';
  }

  equals(other: ReviewState): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private validate(): void {
    const validStates = ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED', 'DISMISSED', 'PENDING'];
    if (!validStates.includes(this.value)) {
      throw new InvalidReviewStateError(this.value);
    }
  }
}
