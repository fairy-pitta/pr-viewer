import { Comment, CommentId, CommentAuthor, CommentContent } from '../Comment';
import { CommentSource } from '@domain/value-objects/CommentSource';

describe('CommentId', () => {
  it('should create a valid comment ID', () => {
    const id = CommentId.create('comment-123');
    expect(id.toString()).toBe('comment-123');
  });

  it('should throw error for empty ID', () => {
    expect(() => CommentId.create('')).toThrow('Comment ID cannot be empty');
    expect(() => CommentId.create('   ')).toThrow('Comment ID cannot be empty');
  });

  it('should check equality correctly', () => {
    const id1 = CommentId.create('comment-123');
    const id2 = CommentId.create('comment-123');
    const id3 = CommentId.create('comment-456');

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});

describe('CommentAuthor', () => {
  it('should create a valid author', () => {
    const author = CommentAuthor.create('testuser', 'User', 'https://example.com/avatar.png');
    expect(author.login).toBe('testuser');
    expect(author.type).toBe('User');
    expect(author.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('should create bot author', () => {
    const author = CommentAuthor.create('bot', 'Bot');
    expect(author.isBot()).toBe(true);
    expect(author.isHuman()).toBe(false);
  });

  it('should create human author', () => {
    const author = CommentAuthor.create('user', 'User');
    expect(author.isBot()).toBe(false);
    expect(author.isHuman()).toBe(true);
  });

  it('should convert to GitHub author', () => {
    const author = CommentAuthor.create('testuser', 'User');
    const githubAuthor = author.toGitHubAuthor();
    expect(githubAuthor.login).toBe('testuser');
    expect(githubAuthor.type).toBe('User');
  });
});

describe('CommentContent', () => {
  it('should create a valid content', () => {
    const content = CommentContent.create('This is a comment');
    expect(content.toString()).toBe('This is a comment');
    expect(content.length()).toBe(17); // 'This is a comment'の文字数
  });

  it('should throw error for empty content', () => {
    expect(() => CommentContent.create('')).toThrow('Comment content cannot be empty');
    expect(() => CommentContent.create('   ')).toThrow('Comment content cannot be empty');
  });
});

describe('Comment', () => {
  const createMockComment = () => {
    return Comment.create({
      id: 'comment-1',
      author: { login: 'user1', type: 'User' },
      content: 'Test comment',
      source: CommentSource.ISSUE,
      createdAt: new Date('2024-01-01'),
      isResolved: false,
      url: 'https://github.com/owner/repo/issues/1#issuecomment-1',
    });
  };

  it('should create a valid comment', () => {
    const comment = createMockComment();
    expect(comment.id.toString()).toBe('comment-1');
    expect(comment.author.login).toBe('user1');
    expect(comment.content.toString()).toBe('Test comment');
    expect(comment.isResolved).toBe(false);
  });

  it('should check isFromBot correctly', () => {
    const botComment = Comment.create({
      id: 'comment-bot',
      author: { login: 'bot', type: 'Bot' },
      content: 'Bot comment',
      source: CommentSource.BOT,
      createdAt: new Date(),
    });
    expect(botComment.isFromBot()).toBe(true);

    const userComment = createMockComment();
    expect(userComment.isFromBot()).toBe(false);
  });

  it('should check isFromReviewer correctly', () => {
    const userComment = createMockComment();
    expect(userComment.isFromReviewer()).toBe(true);

    const botComment = Comment.create({
      id: 'comment-bot',
      author: { login: 'bot', type: 'Bot' },
      content: 'Bot comment',
      source: CommentSource.BOT,
      createdAt: new Date(),
    });
    expect(botComment.isFromReviewer()).toBe(false);
  });

  it('should check isNewerThan correctly', () => {
    const comment = Comment.create({
      id: 'comment-1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment',
      source: CommentSource.REVIEWER,
      createdAt: new Date('2024-01-02'),
    });

    expect(comment.isNewerThan(new Date('2024-01-01'))).toBe(true);
    expect(comment.isNewerThan(new Date('2024-01-03'))).toBe(false);
  });

  it('should resolve comment', () => {
    const comment = createMockComment();
    const resolvedComment = comment.resolve();

    expect(resolvedComment.isResolved).toBe(true);
    expect(comment.isResolved).toBe(false); // 元のオブジェクトは変更されていない
  });

  it('should unresolve comment', () => {
    const resolvedComment = Comment.create({
      id: 'comment-1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment',
      source: CommentSource.REVIEWER,
      createdAt: new Date(),
      isResolved: true,
    });
    const unresolvedComment = resolvedComment.unresolve();

    expect(unresolvedComment.isResolved).toBe(false);
    expect(resolvedComment.isResolved).toBe(true); // 元のオブジェクトは変更されていない
  });
});
