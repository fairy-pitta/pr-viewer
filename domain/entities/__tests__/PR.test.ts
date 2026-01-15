import { PR, PRNumber, Title, Author, ReviewStatus, CommentCollection } from '../PR';
import { PRId } from '@domain/value-objects/PRId';
import { PRState } from '@domain/value-objects/PRState';
import { Repository } from '@domain/value-objects/Repository';
import { Comment } from '../Comment';
import { Review } from '../Review';

describe('PRNumber', () => {
  it('should create a valid PR number', () => {
    const prNumber = PRNumber.create(123);
    expect(prNumber.toNumber()).toBe(123);
  });

  it('should throw error for non-positive numbers', () => {
    expect(() => PRNumber.create(0)).toThrow('PR number must be positive');
    expect(() => PRNumber.create(-1)).toThrow('PR number must be positive');
  });

  it('should check equality correctly', () => {
    const prNumber1 = PRNumber.create(123);
    const prNumber2 = PRNumber.create(123);
    const prNumber3 = PRNumber.create(456);

    expect(prNumber1.equals(prNumber2)).toBe(true);
    expect(prNumber1.equals(prNumber3)).toBe(false);
  });
});

describe('Title', () => {
  it('should create a valid title', () => {
    const title = Title.create('Test PR Title');
    expect(title.toString()).toBe('Test PR Title');
  });

  it('should throw error for empty title', () => {
    expect(() => Title.create('')).toThrow('Title cannot be empty');
    expect(() => Title.create('   ')).toThrow('Title cannot be empty');
  });
});

describe('Author', () => {
  it('should create a valid author', () => {
    const author = Author.create('testuser', 'https://example.com/avatar.png');
    expect(author.login).toBe('testuser');
    expect(author.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('should create author without avatar URL', () => {
    const author = Author.create('testuser');
    expect(author.login).toBe('testuser');
    expect(author.avatarUrl).toBeUndefined();
  });

  it('should throw error for empty login', () => {
    expect(() => Author.create('')).toThrow('Author login cannot be empty');
    expect(() => Author.create('   ')).toThrow('Author login cannot be empty');
  });

  it('should check equality correctly', () => {
    const author1 = Author.create('testuser');
    const author2 = Author.create('testuser');
    const author3 = Author.create('otheruser');

    expect(author1.equals(author2)).toBe(true);
    expect(author1.equals(author3)).toBe(false);
  });
});

describe('ReviewStatus', () => {
  it('should create a valid review status', () => {
    const status = ReviewStatus.create({
      approved: 2,
      changesRequested: 1,
      commented: 3,
      pending: 1,
    });

    expect(status.approved).toBe(2);
    expect(status.changesRequested).toBe(1);
    expect(status.commented).toBe(3);
    expect(status.pending).toBe(1);
  });

  it('should create empty review status', () => {
    const status = ReviewStatus.empty();
    expect(status.approved).toBe(0);
    expect(status.changesRequested).toBe(0);
    expect(status.commented).toBe(0);
    expect(status.pending).toBe(0);
  });

  it('should throw error for negative values', () => {
    expect(() => ReviewStatus.create({
      approved: -1,
      changesRequested: 0,
      commented: 0,
      pending: 0,
    })).toThrow('Review counts cannot be negative');
  });

  it('should check hasPendingReviews correctly', () => {
    const statusWithPending = ReviewStatus.create({
      approved: 0,
      changesRequested: 0,
      commented: 0,
      pending: 1,
    });
    expect(statusWithPending.hasPendingReviews()).toBe(true);

    const statusWithoutPending = ReviewStatus.create({
      approved: 1,
      changesRequested: 0,
      commented: 0,
      pending: 0,
    });
    expect(statusWithoutPending.hasPendingReviews()).toBe(false);
  });

  it('should check hasApprovals correctly', () => {
    const statusWithApprovals = ReviewStatus.create({
      approved: 1,
      changesRequested: 0,
      commented: 0,
      pending: 0,
    });
    expect(statusWithApprovals.hasApprovals()).toBe(true);

    const statusWithoutApprovals = ReviewStatus.create({
      approved: 0,
      changesRequested: 1,
      commented: 0,
      pending: 0,
    });
    expect(statusWithoutApprovals.hasApprovals()).toBe(false);
  });

  it('should check hasChangesRequested correctly', () => {
    const statusWithChanges = ReviewStatus.create({
      approved: 0,
      changesRequested: 1,
      commented: 0,
      pending: 0,
    });
    expect(statusWithChanges.hasChangesRequested()).toBe(true);

    const statusWithoutChanges = ReviewStatus.create({
      approved: 1,
      changesRequested: 0,
      commented: 0,
      pending: 0,
    });
    expect(statusWithoutChanges.hasChangesRequested()).toBe(false);
  });

  it('should calculate total correctly', () => {
    const status = ReviewStatus.create({
      approved: 2,
      changesRequested: 1,
      commented: 3,
      pending: 1,
    });
    expect(status.total()).toBe(7);
  });
});

describe('CommentCollection', () => {
  it('should create empty collection', () => {
    const collection = CommentCollection.empty();
    expect(collection.total).toBe(0);
    expect(collection.unresolved).toBe(0);
  });

  it('should create collection with comments', () => {
    const comment1 = Comment.create({
      id: '1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment 1',
      source: { toString: () => 'issue', equals: () => false } as any,
      createdAt: new Date('2024-01-01'),
    });
    const comment2 = Comment.create({
      id: '2',
      author: { login: 'user2', type: 'User' },
      content: 'Comment 2',
      source: { toString: () => 'review', equals: () => false } as any,
      createdAt: new Date('2024-01-02'),
      isResolved: true,
    });

    const collection = CommentCollection.create([comment1, comment2]);
    expect(collection.total).toBe(2);
    expect(collection.unresolved).toBe(1);
    expect(collection.lastCommentAt).toEqual(new Date('2024-01-02'));
  });

  it('should get comments correctly', () => {
    const comment = Comment.create({
      id: '1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment',
      source: { toString: () => 'issue', equals: () => false } as any,
      createdAt: new Date(),
    });

    const collection = CommentCollection.create([comment]);
    const comments = collection.getComments();
    expect(comments).toHaveLength(1);
    expect(comments[0]).toBe(comment);
  });

  it('should check hasNewCommentsSince correctly', () => {
    const comment = Comment.create({
      id: '1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment',
      source: { toString: () => 'issue', equals: () => false } as any,
      createdAt: new Date('2024-01-02'),
    });

    const collection = CommentCollection.create([comment]);
    expect(collection.hasNewCommentsSince(new Date('2024-01-01'))).toBe(true);
    expect(collection.hasNewCommentsSince(new Date('2024-01-03'))).toBe(false);
  });
});

describe('PR', () => {
  const createMockPR = () => {
    return PR.create({
      id: 'pr-123',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      repository: { owner: 'owner', name: 'repo' },
      author: { login: 'author', avatarUrl: 'https://example.com/avatar.png' },
      assignees: ['assignee1'],
      reviewers: ['reviewer1'],
      status: PRState.OPEN,
      reviewStatus: ReviewStatus.empty(),
      comments: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      lastSyncedAt: new Date('2024-01-03'),
    });
  };

  it('should create a valid PR', () => {
    const pr = createMockPR();
    expect(pr.number.toNumber()).toBe(123);
    expect(pr.title.toString()).toBe('Test PR');
    expect(pr.author.login).toBe('author');
    expect(pr.status).toBe(PRState.OPEN);
  });

  it('should check needsReview correctly', () => {
    const prWithoutReview = createMockPR();
    expect(prWithoutReview.needsReview()).toBe(false);

    const prWithPendingReview = PR.create({
      id: 'pr-123',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      repository: { owner: 'owner', name: 'repo' },
      author: { login: 'author' },
      assignees: [],
      reviewers: [],
      status: PRState.OPEN,
      reviewStatus: ReviewStatus.create({
        approved: 0,
        changesRequested: 0,
        commented: 0,
        pending: 1,
      }),
      comments: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      lastSyncedAt: new Date('2024-01-03'),
    });
    expect(prWithPendingReview.needsReview()).toBe(true);
  });

  it('should check hasNewComments correctly', () => {
    const comment = Comment.create({
      id: '1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment',
      source: { toString: () => 'issue', equals: () => false } as any,
      createdAt: new Date('2024-01-02'),
    });

    const pr = PR.create({
      id: 'pr-123',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      repository: { owner: 'owner', name: 'repo' },
      author: { login: 'author' },
      assignees: [],
      reviewers: [],
      status: PRState.OPEN,
      reviewStatus: ReviewStatus.empty(),
      comments: [comment],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      lastSyncedAt: new Date('2024-01-03'),
    });

    expect(pr.hasNewComments(new Date('2024-01-01'))).toBe(true);
    expect(pr.hasNewComments(new Date('2024-01-03'))).toBe(false);
  });

  it('should update review status', () => {
    const pr = createMockPR();
    const newReviewStatus = ReviewStatus.create({
      approved: 1,
      changesRequested: 0,
      commented: 0,
      pending: 0,
    });

    const updatedPR = pr.updateReviewStatus(newReviewStatus);
    expect(updatedPR.reviewStatus.approved).toBe(1);
    expect(pr.reviewStatus.approved).toBe(0); // 元のオブジェクトは変更されていない
  });

  it('should update comments', () => {
    const pr = createMockPR();
    const comment = Comment.create({
      id: '1',
      author: { login: 'user1', type: 'User' },
      content: 'Comment',
      source: { toString: () => 'issue', equals: () => false } as any,
      createdAt: new Date(),
    });

    const updatedPR = pr.updateComments([comment]);
    expect(updatedPR.comments.total).toBe(1);
    expect(pr.comments.total).toBe(0); // 元のオブジェクトは変更されていない
  });

  it('should update last synced at', () => {
    const pr = createMockPR();
    const newDate = new Date('2024-01-04');
    const updatedPR = pr.updateLastSyncedAt(newDate);

    expect(updatedPR.lastSyncedAt).toEqual(newDate);
    expect(pr.lastSyncedAt).not.toEqual(newDate); // 元のオブジェクトは変更されていない
  });
});
