// domain/entities/User.ts

export class UserId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }

  static create(value: string): UserId {
    return new UserId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

export class User {
  private constructor(
    public readonly id: UserId,
    public readonly login: string,
    public readonly avatarUrl?: string,
    public readonly email?: string
  ) {}

  static create(data: {
    id: string;
    login: string;
    avatarUrl?: string;
    email?: string;
  }): User {
    return new User(
      UserId.create(data.id),
      data.login,
      data.avatarUrl,
      data.email
    );
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
