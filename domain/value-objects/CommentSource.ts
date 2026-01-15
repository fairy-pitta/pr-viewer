// domain/value-objects/CommentSource.ts

export interface GitHubAuthor {
  type: 'User' | 'Bot';
  login: string;
}

export class CommentSource {
  private constructor(private readonly value: string) {}

  static readonly REVIEWER = new CommentSource('reviewer');
  static readonly BOT = new CommentSource('bot');
  static readonly COPILOT = new CommentSource('copilot');
  static readonly CODERABBIT = new CommentSource('coderabbit');
  static readonly OTHER = new CommentSource('other');

  static fromAuthor(author: GitHubAuthor): CommentSource {
    if (author.type === 'Bot') {
      const login = author.login.toLowerCase();
      if (login.includes('copilot')) return CommentSource.COPILOT;
      if (login.includes('coderabbit')) return CommentSource.CODERABBIT;
      return CommentSource.BOT;
    }
    return CommentSource.REVIEWER;
  }

  equals(other: CommentSource): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isBot(): boolean {
    return (
      this.equals(CommentSource.BOT) ||
      this.equals(CommentSource.COPILOT) ||
      this.equals(CommentSource.CODERABBIT) ||
      this.equals(CommentSource.OTHER)
    );
  }

  isReviewer(): boolean {
    return this.equals(CommentSource.REVIEWER);
  }
}
