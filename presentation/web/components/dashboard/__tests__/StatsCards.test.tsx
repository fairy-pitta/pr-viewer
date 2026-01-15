import { render, screen } from '@testing-library/react';
import { StatsCards } from '../StatsCards';
import type { PRDTO } from '@application/dto/PRDTO';

describe('StatsCards', () => {
  const createMockPR = (status: string): PRDTO => ({
    id: `pr-${status}`,
    number: 1,
    title: `PR ${status}`,
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
    status,
    reviewStatus: {
      approved: status === 'open' ? 1 : 0,
      changesRequested: 0,
      commented: 0,
      pending: status === 'open' ? 1 : 0,
    },
    comments: {
      total: 0,
      unresolved: 0,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastSyncedAt: '2024-01-03T00:00:00Z',
  });

  it('should render statistics correctly', () => {
    const prs: PRDTO[] = [
      createMockPR('open'),
      createMockPR('open'),
      createMockPR('draft'),
      createMockPR('merged'),
    ];

    render(<StatsCards prs={prs} />);

    expect(screen.getByText('4')).toBeInTheDocument(); // 合計
    expect(screen.getByText('2')).toBeInTheDocument(); // Open (2つ)
    expect(screen.getByText('1')).toBeInTheDocument(); // Draft (1つ)
    expect(screen.getByText('1')).toBeInTheDocument(); // Merged (1つ)
  });

  it('should show needs review count', () => {
    const prs: PRDTO[] = [
      createMockPR('open'),
      createMockPR('open'),
    ];

    render(<StatsCards prs={prs} />);

    // レビュー待ちは2つ（両方ともpending > 0）
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render empty stats when no PRs', () => {
    render(<StatsCards prs={[]} />);

    expect(screen.getByText('0')).toBeInTheDocument(); // 合計
  });
});
