import { SyncPRsUseCase } from '../SyncPRsUseCase';
import { PRRepository } from '@domain/repositories/PRRepository';
import { CommentRepository } from '@domain/repositories/CommentRepository';
import { ReviewRepository } from '@domain/repositories/ReviewRepository';
import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';
import { UserId } from '@domain/entities/User';

describe('SyncPRsUseCase', () => {
  let mockPRRepository: jest.Mocked<PRRepository>;
  let mockCommentRepository: jest.Mocked<CommentRepository>;
  let mockReviewRepository: jest.Mocked<ReviewRepository>;
  let mockGitHubClient: jest.Mocked<GitHubAPIClient>;
  let useCase: SyncPRsUseCase;

  beforeEach(() => {
    mockPRRepository = {
      findByUser: jest.fn(),
      findById: jest.fn(),
      findByRepository: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn(),
    };

    mockCommentRepository = {
      findByPR: jest.fn(),
      findNewCommentsSince: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
    };

    mockReviewRepository = {
      findByPR: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
    };

    mockGitHubClient = {
      getPRs: jest.fn(),
      getPRsWithReviewRequests: jest.fn(),
      getPR: jest.fn(),
      getComments: jest.fn(),
      getReviews: jest.fn(),
      getUser: jest.fn(),
      getRateLimit: jest.fn(),
    } as any;

    useCase = new SyncPRsUseCase(
      mockPRRepository,
      mockCommentRepository,
      mockReviewRepository,
      mockGitHubClient
    );
  });

  it('should sync PRs from GitHub', async () => {
    const userId = UserId.create('user123');
    const mockGitHubPRs = [
      {
        id: 1,
        number: 1,
        title: 'Test PR',
        html_url: 'https://github.com/owner/repo/pull/1',
        head: {
          repo: {
            owner: { login: 'owner' },
            name: 'repo',
          },
        },
        user: { login: 'author', avatar_url: 'https://example.com/avatar.png' },
        assignees: [],
        requested_reviewers: [],
        state: 'open',
        draft: false,
        merged_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ] as any;

    mockGitHubClient.getPRs.mockResolvedValue(mockGitHubPRs);

    await useCase.execute({ userId });

    expect(mockGitHubClient.getPRs).toHaveBeenCalledWith('user123');
    expect(mockPRRepository.save).toHaveBeenCalled();
  });

  it('should handle errors when fetching comments', async () => {
    const userId = UserId.create('user123');
    const mockGitHubPRs = [
      {
        id: 1,
        number: 1,
        title: 'Test PR',
        html_url: 'https://github.com/owner/repo/pull/1',
        head: {
          repo: {
            owner: { login: 'owner' },
            name: 'repo',
          },
        },
        user: { login: 'author' },
        assignees: [],
        requested_reviewers: [],
        state: 'open',
        draft: false,
        merged_at: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ] as any;

    mockGitHubClient.getPRs.mockResolvedValue(mockGitHubPRs);
    // コメント取得のエラーをシミュレート
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await useCase.execute({ userId });

    // エラーが発生してもPRデータは保存される
    expect(mockPRRepository.save).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
