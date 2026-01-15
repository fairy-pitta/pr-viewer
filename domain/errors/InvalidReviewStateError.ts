// domain/errors/InvalidReviewStateError.ts
import { DomainError } from './DomainError';

export class InvalidReviewStateError extends DomainError {
  constructor(public readonly value: string) {
    super(
      `Invalid review state: ${value}. Valid states are: APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED, PENDING`
    );
    this.name = 'InvalidReviewStateError';
  }
}
