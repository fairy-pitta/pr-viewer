import { render, screen } from '@testing-library/react';
import { PRList } from '../PRList';
import type { PRDTO } from '@application/dto/PRDTO';

describe('PRList', () => {
  const mockPRs: PRDTO[] = [
    {
      id: 'pr-1',
      number: 1,
      title: 'PR 1',
      url: 'https://github.com/owner/repo/pull/1',
      repository: {
        owner: 'owner',
        name: 'repo',
        fullName: 'owner/repo',
      },
      author: {
        login: 'author',
      },
      assignees: [],
      reviewers: [],
      status: 'open',
      reviewStatus: {
        approved: 0,
        changesRequested: 0,
        commented: 0,
        pending: 0,
      },
      comments: {
        total: 0,
        unresolved: 0,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      lastSyncedAt: '2024-01-03T00:00:00Z',
    },
    {
      id: 'pr-2',
      number: 2,
      title: 'PR 2',
      url: 'https://github.com/owner/repo/pull/2',
      repository: {
        owner: 'owner',
        name: 'repo',
        fullName: 'owner/repo',
      },
      author: {
        login: 'author',
      },
      assignees: [],
      reviewers: [],
      status: 'draft',
      reviewStatus: {
        approved: 0,
        changesRequested: 0,
        commented: 0,
        pending: 0,
      },
      comments: {
        total: 0,
        unresolved: 0,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      lastSyncedAt: '2024-01-03T00:00:00Z',
    },
  ];

  it('should render list of PRs', () => {
    render(<PRList prs={mockPRs} />);

    expect(screen.getByText('PR 1')).toBeInTheDocument();
    expect(screen.getByText('PR 2')).toBeInTheDocument();
  });

  it('should render empty message when no PRs', () => {
    render(<PRList prs={[]} />);

    expect(screen.getByText('PRが見つかりません')).toBeInTheDocument();
  });

  it('should call onPRClick when PR is clicked', () => {
    const onPRClick = jest.fn();
    render(<PRList prs={mockPRs} onPRClick={onPRClick} />);

    const prCard = screen.getByText('PR 1').closest('div');
    prCard?.click();

    expect(onPRClick).toHaveBeenCalledWith(mockPRs[0]);
  });
});
