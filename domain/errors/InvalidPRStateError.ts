// domain/errors/InvalidPRStateError.ts
import { DomainError } from './DomainError';

export class InvalidPRStateError extends DomainError {
  constructor(public readonly value: string) {
    super(`Invalid PR state: ${value}. Valid states are: open, draft, merged, closed`);
    this.name = 'InvalidPRStateError';
  }
}
