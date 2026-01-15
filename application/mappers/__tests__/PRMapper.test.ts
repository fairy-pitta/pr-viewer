import { PRMapper } from '../PRMapper';
import { PR } from '@domain/entities/PR';
import { PRState } from '@domain/value-objects/PRState';

describe('PRMapper', () => {
  const createMockPR = () => {
    return PR.create({
      id: 'pr-123',
      number: 123,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/123',
      repository: { owner: 'owner', name: 'repo' },
      author: { login: 'author', avatarUrl: 'https://example.com/avatar.png' },
      assignees: ['assignee1', 'assignee2'],
      reviewers: ['reviewer1'],
      status: PRState.OPEN,
      reviewStatus: {
        approved: 2,
        changesRequested: 1,
        commented: 0,
        pending: 0,
      } as any,
      comments: [],
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      lastSyncedAt: new Date('2024-01-03T00:00:00Z'),
    });
  };

  describe('toDTO', () => {
    it('should map PR to DTO correctly', () => {
      const pr = createMockPR();
      const dto = PRMapper.toDTO(pr);

      expect(dto.id).toBe('pr-123');
      expect(dto.number).toBe(123);
      expect(dto.title).toBe('Test PR');
      expect(dto.url).toBe('https://github.com/owner/repo/pull/123');
      expect(dto.repository.fullName).toBe('owner/repo');
      expect(dto.author.login).toBe('author');
      expect(dto.status).toBe('open');
      expect(dto.reviewStatus.approved).toBe(2);
      expect(dto.reviewStatus.changesRequested).toBe(1);
    });

    it('should map dates to ISO strings', () => {
      const pr = createMockPR();
      const dto = PRMapper.toDTO(pr);

      expect(dto.createdAt).toBe('2024-01-01T00:00:00.000Z');
      expect(dto.updatedAt).toBe('2024-01-02T00:00:00.000Z');
      expect(dto.lastSyncedAt).toBe('2024-01-03T00:00:00.000Z');
    });
  });

  describe('toDTOs', () => {
    it('should map array of PRs to DTOs', () => {
      const prs = [createMockPR(), createMockPR()];
      const dtos = PRMapper.toDTOs(prs);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe('pr-123');
      expect(dtos[1].id).toBe('pr-123');
    });
  });
});
