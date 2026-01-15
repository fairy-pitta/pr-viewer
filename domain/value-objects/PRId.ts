// domain/value-objects/PRId.ts

export class PRId {
  private constructor(private readonly value: string) {
    this.validate();
  }

  static create(value: string): PRId {
    return new PRId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PRId): boolean {
    return this.value === other.value;
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('PR ID cannot be empty');
    }
  }
}
