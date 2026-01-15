import { GetPRsUseCase } from '../GetPRsUseCase';
import { PRRepository } from '@domain/repositories/PRRepository';
import { UserId } from '@domain/entities/User';
import { PR } from '@domain/entities/PR';
import { PRState } from '@domain/value-objects/PRState';

describe('GetPRsUseCase', () => {
  let mockRepository: jest.Mocked<PRRepository>;
  let useCase: GetPRsUseCase;

  beforeEach(() => {
    mockRepository = {
      findByUser: jest.fn(),
      findById: jest.fn(),
      findByRepository: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetPRsUseCase(mockRepository);
  });

  it('should get PRs for user', async () => {
    const userId = UserId.create('user123');
    const mockPRs = [
      PR.create({
        id: 'pr-1',
        number: 1,
        title: 'PR 1',
        url: 'https://github.com/owner/repo/pull/1',
        repository: { owner: 'owner', name: 'repo' },
        author: { login: 'author' },
        assignees: [],
        reviewers: [],
        status: PRState.OPEN,
        reviewStatus: { approved: 0, changesRequested: 0, commented: 0, pending: 0 } as any,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncedAt: new Date(),
      }),
    ];

    mockRepository.findByUser.mockResolvedValue(mockPRs);

    const result = await useCase.execute({ userId });

    expect(mockRepository.findByUser).toHaveBeenCalledWith(userId);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pr-1');
    expect(result[0].title).toBe('PR 1');
  });

  it('should return empty array when no PRs found', async () => {
    const userId = UserId.create('user123');
    mockRepository.findByUser.mockResolvedValue([]);

    const result = await useCase.execute({ userId });

    expect(result).toHaveLength(0);
  });

  it('should handle repository errors', async () => {
    const userId = UserId.create('user123');
    const error = new Error('Repository error');
    mockRepository.findByUser.mockRejectedValue(error);

    await expect(useCase.execute({ userId })).rejects.toThrow('Repository error');
  });
});
