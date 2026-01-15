// domain/value-objects/PRState.ts
import { InvalidPRStateError } from '../errors/InvalidPRStateError';

export class PRState {
  private constructor(private readonly value: string) {
    this.validate();
  }

  static readonly OPEN = new PRState('open');
  static readonly DRAFT = new PRState('draft');
  static readonly MERGED = new PRState('merged');
  static readonly CLOSED = new PRState('closed');

  static fromString(value: string): PRState {
    return new PRState(value);
  }

  isOpen(): boolean {
    return this.value === 'open';
  }

  isDraft(): boolean {
    return this.value === 'draft';
  }

  isMerged(): boolean {
    return this.value === 'merged';
  }

  isClosed(): boolean {
    return this.value === 'closed';
  }

  equals(other: PRState): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private validate(): void {
    const validStates = ['open', 'draft', 'merged', 'closed'];
    if (!validStates.includes(this.value)) {
      throw new InvalidPRStateError(this.value);
    }
  }
}
