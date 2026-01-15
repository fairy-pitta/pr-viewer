import { FilterPRsUseCase } from '../FilterPRsUseCase';
import { PRRepository } from '@domain/repositories/PRRepository';
import { UserId } from '@domain/entities/User';
import { PRState } from '@domain/value-objects/PRState';
import { Repository } from '@domain/value-objects/Repository';
import { PR } from '@domain/entities/PR';

describe('FilterPRsUseCase', () => {
  let mockRepository: jest.Mocked<PRRepository>;
  let useCase: FilterPRsUseCase;

  beforeEach(() => {
    mockRepository = {
      findByUser: jest.fn(),
      findById: jest.fn(),
      findByRepository: jest.fn(),
      save: jest.fn(),
      saveMany: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new FilterPRsUseCase(mockRepository);
  });

  const createMockPR = (title: string, status: PRState, repoOwner = 'owner', repoName = 'repo', assignees: string[] = []) => {
    return PR.create({
      id: `pr-${title}`,
      number: 1,
      title,
      url: `https://github.com/${repoOwner}/${repoName}/pull/1`,
      repository: { owner: repoOwner, name: repoName },
      author: { login: 'author' },
      assignees,
      reviewers: [],
      status,
      reviewStatus: { approved: 0, changesRequested: 0, commented: 0, pending: 0 } as any,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncedAt: new Date(),
    });
  };

  it('should filter by repository', async () => {
    const userId = UserId.create('user123');
    const repository = Repository.create('owner', 'repo1');
    const allPRs = [
      createMockPR('PR 1', PRState.OPEN, 'owner', 'repo1'),
      createMockPR('PR 2', PRState.OPEN, 'owner', 'repo2'),
    ];

    mockRepository.findByUser.mockResolvedValue(allPRs);

    const result = await useCase.execute({
      userId,
      repository,
    });

    expect(result).toHaveLength(1);
    expect(result[0].repository.fullName).toBe('owner/repo1');
  });

  it('should filter by status', async () => {
    const userId = UserId.create('user123');
    const allPRs = [
      createMockPR('PR 1', PRState.OPEN),
      createMockPR('PR 2', PRState.DRAFT),
      createMockPR('PR 3', PRState.OPEN),
    ];

    mockRepository.findByUser.mockResolvedValue(allPRs);

    const result = await useCase.execute({
      userId,
      status: PRState.OPEN,
    });

    expect(result).toHaveLength(2);
    expect(result.every(pr => pr.status === 'open')).toBe(true);
  });

  it('should filter by assignee', async () => {
    const userId = UserId.create('user123');
    const allPRs = [
      createMockPR('PR 1', PRState.OPEN, 'owner', 'repo', ['assignee1']),
      createMockPR('PR 2', PRState.OPEN, 'owner', 'repo', ['assignee2']),
      createMockPR('PR 3', PRState.OPEN, 'owner', 'repo', ['assignee1', 'assignee3']),
    ];

    mockRepository.findByUser.mockResolvedValue(allPRs);

    const result = await useCase.execute({
      userId,
      assignee: 'assignee1',
    });

    expect(result).toHaveLength(2);
    expect(result.every(pr => pr.assignees.includes('assignee1'))).toBe(true);
  });

  it('should filter by search term', async () => {
    const userId = UserId.create('user123');
    const allPRs = [
      createMockPR('Feature: Add login', PRState.OPEN),
      createMockPR('Bugfix: Fix button', PRState.OPEN),
      createMockPR('Refactor: Clean code', PRState.OPEN),
    ];

    mockRepository.findByUser.mockResolvedValue(allPRs);

    const result = await useCase.execute({
      userId,
      search: 'Feature',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Feature: Add login');
  });

  it('should combine multiple filters', async () => {
    const userId = UserId.create('user123');
    const repository = Repository.create('owner', 'repo1');
    const allPRs = [
      createMockPR('PR 1', PRState.OPEN, 'owner', 'repo1', ['assignee1']),
      createMockPR('PR 2', PRState.DRAFT, 'owner', 'repo1', ['assignee1']),
      createMockPR('PR 3', PRState.OPEN, 'owner', 'repo2', ['assignee1']),
    ];

    mockRepository.findByUser.mockResolvedValue(allPRs);

    const result = await useCase.execute({
      userId,
      repository,
      status: PRState.OPEN,
      assignee: 'assignee1',
    });

    expect(result).toHaveLength(1);
    expect(result[0].repository.fullName).toBe('owner/repo1');
    expect(result[0].status).toBe('open');
  });
});
