import { render, screen } from '@testing-library/react';
import { PRCard } from '../PRCard';
import type { PRDTO } from '@application/dto/PRDTO';

describe('PRCard', () => {
  const mockPR: PRDTO = {
    id: 'pr-1',
    number: 1,
    title: 'Test PR',
    url: 'https://github.com/owner/repo/pull/1',
    repository: {
      owner: 'owner',
      name: 'repo',
      fullName: 'owner/repo',
    },
    author: {
      login: 'author',
      avatarUrl: 'https://example.com/avatar.png',
    },
    assignees: ['assignee1'],
    reviewers: ['reviewer1'],
    status: 'open',
    reviewStatus: {
      approved: 2,
      changesRequested: 0,
      commented: 1,
      pending: 0,
    },
    comments: {
      total: 5,
      unresolved: 2,
      lastCommentAt: '2024-01-02T00:00:00Z',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastSyncedAt: '2024-01-03T00:00:00Z',
  };

  it('should render PR card with title and status', () => {
    render(<PRCard pr={mockPR} />);

    expect(screen.getByText('Test PR')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('should render repository name and PR number', () => {
    render(<PRCard pr={mockPR} />);

    expect(screen.getByText('owner/repo')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should render review statistics', () => {
    render(<PRCard pr={mockPR} />);

    expect(screen.getByText(/承認: 2/)).toBeInTheDocument();
    expect(screen.getByText(/変更要求: 0/)).toBeInTheDocument();
    expect(screen.getByText(/コメント: 5/)).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    render(<PRCard pr={mockPR} onClick={onClick} />);

    const card = screen.getByText('Test PR').closest('div');
    card?.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
