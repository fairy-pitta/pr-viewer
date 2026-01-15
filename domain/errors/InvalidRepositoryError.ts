// domain/errors/InvalidRepositoryError.ts
import { DomainError } from './DomainError';

export class InvalidRepositoryError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRepositoryError';
  }
}
