// domain/value-objects/Repository.ts
import { InvalidRepositoryError } from '@domain/errors/InvalidRepositoryError';

export class Repository {
  private constructor(
    public readonly owner: string,
    public readonly name: string
  ) {
    this.validate();
  }

  static create(owner: string, name: string): Repository {
    return new Repository(owner, name);
  }

  static fromString(fullName: string): Repository {
    const parts = fullName.split('/');
    if (parts.length !== 2) {
      throw new InvalidRepositoryError(`Invalid repository format: ${fullName}`);
    }
    return new Repository(parts[0], parts[1]);
  }

  toString(): string {
    return `${this.owner}/${this.name}`;
  }

  equals(other: Repository): boolean {
    return this.owner === other.owner && this.name === other.name;
  }

  private validate(): void {
    if (!this.owner || !this.name) {
      throw new InvalidRepositoryError('Repository owner and name are required');
    }
    if (this.owner.trim().length === 0 || this.name.trim().length === 0) {
      throw new InvalidRepositoryError('Repository owner and name cannot be empty');
    }
  }
}
