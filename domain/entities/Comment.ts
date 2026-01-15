// domain/entities/Comment.ts
import { CommentSource, type GitHubAuthor } from '../value-objects/CommentSource';

export class CommentId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Comment ID cannot be empty');
    }
  }

  static create(value: string): CommentId {
    return new CommentId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CommentId): boolean {
    return this.value === other.value;
  }
}

export class CommentAuthor {
  private constructor(
    public readonly login: string,
    public readonly type: 'User' | 'Bot',
    public readonly avatarUrl?: string
  ) {}

  static create(login: string, type: 'User' | 'Bot', avatarUrl?: string): CommentAuthor {
    return new CommentAuthor(login, type, avatarUrl);
  }

  isBot(): boolean {
    return this.type === 'Bot';
  }

  isHuman(): boolean {
    return this.type === 'User';
  }

  toGitHubAuthor(): GitHubAuthor {
    return {
      login: this.login,
      type: this.type,
    };
  }
}

export class CommentContent {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }
  }

  static create(value: string): CommentContent {
    return new CommentContent(value);
  }

  toString(): string {
    return this.value;
  }

  length(): number {
    return this.value.length;
  }
}

export class Comment {
  private constructor(
    public readonly id: CommentId,
    public readonly author: CommentAuthor,
    public readonly content: CommentContent,
    public readonly source: CommentSource,
    public readonly createdAt: Date,
    public readonly isResolved: boolean,
    public readonly url?: string
  ) {}

  static create(data: {
    id: string;
    author: { login: string; type: 'User' | 'Bot'; avatarUrl?: string };
    content: string;
    source: CommentSource;
    createdAt: Date;
    isResolved?: boolean;
    url?: string;
  }): Comment {
    return new Comment(
      CommentId.create(data.id),
      CommentAuthor.create(data.author.login, data.author.type, data.author.avatarUrl),
      CommentContent.create(data.content),
      data.source,
      data.createdAt,
      data.isResolved ?? false,
      data.url
    );
  }

  isFromBot(): boolean {
    return this.author.isBot();
  }

  isFromReviewer(): boolean {
    return this.author.isHuman() && !this.isFromBot();
  }

  isNewerThan(date: Date): boolean {
    return this.createdAt > date;
  }

  resolve(): Comment {
    return new Comment(
      this.id,
      this.author,
      this.content,
      this.source,
      this.createdAt,
      true,
      this.url
    );
  }

  unresolve(): Comment {
    return new Comment(
      this.id,
      this.author,
      this.content,
      this.source,
      this.createdAt,
      false,
      this.url
    );
  }
}
