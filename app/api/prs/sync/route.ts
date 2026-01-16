import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

import type { PRDTO, ReviewerInfo } from '@application/dto/PRDTO';

// Inlined GitHub API client to avoid import issues on Cloudflare Pages
async function githubRequest<T>(
  token: string,
  endpoint: string
): Promise<T> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'pr-viewer',
    },
  });

  if (!response.ok) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    if (response.status === 403 && remaining === '0') {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

async function getPR(token: string, owner: string, repo: string, number: number): Promise<any> {
  return githubRequest(token, `/repos/${owner}/${repo}/pulls/${number}`);
}

async function searchPRs(token: string, query: string): Promise<any[]> {
  const prs: any[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const endpoint = `/search/issues?q=type:pr+${query}+state:open&page=${page}&per_page=${perPage}`;
    const response = await githubRequest<{ items: any[] }>(token, endpoint);

    if (response.items.length === 0) break;

    for (const item of response.items) {
      try {
        const repoUrl = item.repository_url;
        if (!repoUrl) continue;

        const parts = new URL(repoUrl).pathname.split('/').filter(Boolean);
        const reposIdx = parts.indexOf('repos');
        if (reposIdx === -1) continue;

        const owner = parts[reposIdx + 1];
        const repo = parts[reposIdx + 2];
        if (!owner || !repo) continue;

        const pr = await getPR(token, owner, repo, item.number);
        if (pr?.head?.repo) {
          prs.push(pr);
        }
      } catch {
        // Skip items that fail to hydrate
      }
    }

    page++;
    if (response.items.length < perPage) break;
  }

  return prs;
}

async function getAllPRs(token: string, userId: string): Promise<any[]> {
  const allPRs: any[] = [];
  const seenIds = new Set<string | number>();

  const addPRs = (prs: any[]) => {
    for (const pr of prs) {
      if (!seenIds.has(pr.id)) {
        seenIds.add(pr.id);
        allPRs.push(pr);
      }
    }
  };

  // Fetch PRs from different sources
  const queries = [
    `author:${userId}`,
    `review-requested:${userId}`,
    `commenter:${userId}`,
    `reviewed-by:${userId}`,
    `assignee:${userId}`,
  ];

  for (const query of queries) {
    try {
      const prs = await searchPRs(token, query);
      addPRs(prs);
    } catch (e) {
      console.error(`Failed to search PRs with query ${query}:`, e);
    }
  }

  return allPRs;
}

async function getComments(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  const comments: any[] = [];

  // Issue comments
  let page = 1;
  while (true) {
    const response = await githubRequest<any[]>(
      token,
      `/repos/${owner}/${repo}/issues/${number}/comments?page=${page}&per_page=100`
    );
    if (response.length === 0) break;
    comments.push(...response);
    page++;
    if (response.length < 100) break;
  }

  // Review comments
  page = 1;
  while (true) {
    const response = await githubRequest<any[]>(
      token,
      `/repos/${owner}/${repo}/pulls/${number}/comments?page=${page}&per_page=100`
    );
    if (response.length === 0) break;
    comments.push(...response);
    page++;
    if (response.length < 100) break;
  }

  return comments;
}

async function getReviews(token: string, owner: string, repo: string, number: number): Promise<any[]> {
  const reviews: any[] = [];
  let page = 1;

  while (true) {
    const response = await githubRequest<any[]>(
      token,
      `/repos/${owner}/${repo}/pulls/${number}/reviews?page=${page}&per_page=100`
    );
    if (response.length === 0) break;
    reviews.push(...response);
    page++;
    if (response.length < 100) break;
  }

  return reviews;
}

// Inlined helper functions
function isBot(login: string): boolean {
  const botPatterns = ['[bot]', 'copilot', 'coderabbit', 'dependabot', 'renovate', 'github-actions'];
  const lowerLogin = login.toLowerCase();
  return botPatterns.some(pattern => lowerLogin.includes(pattern));
}

function getCommentSource(author: { type: string; login: string }): string {
  if (author.type === 'Bot') {
    const login = author.login.toLowerCase();
    if (login.includes('copilot')) return 'copilot';
    if (login.includes('coderabbit')) return 'coderabbit';
    return 'bot';
  }
  return 'reviewer';
}

function isReviewApproved(state: string): boolean {
  return state === 'APPROVED';
}

function isReviewChangesRequested(state: string): boolean {
  return state === 'CHANGES_REQUESTED';
}

function isReviewCommented(state: string): boolean {
  return state === 'COMMENTED';
}

interface SimpleReview {
  reviewer: { login: string; avatarUrl?: string };
  state: string;
  submittedAt: Date;
}

function determineAction(
  pr: { author: { login: string }; reviewers?: string[]; comments?: { unresolved: number } },
  reviews: SimpleReview[],
  currentUserId: string
): PRDTO['actionNeeded'] {
  const isAuthor = pr.author.login === currentUserId;
  const isRequestedReviewer = pr.reviewers?.includes(currentUserId);

  // Get latest review per user
  const latestReviewByUser = new Map<string, SimpleReview>();
  for (const review of reviews) {
    const existing = latestReviewByUser.get(review.reviewer.login);
    if (!existing || review.submittedAt > existing.submittedAt) {
      latestReviewByUser.set(review.reviewer.login, review);
    }
  }

  const hasChangesRequested = Array.from(latestReviewByUser.values()).some(r => isReviewChangesRequested(r.state));
  const hasApprovals = Array.from(latestReviewByUser.values()).some(r => isReviewApproved(r.state));
  const hasUnresolvedComments = (pr.comments?.unresolved ?? 0) > 0;

  if (isAuthor) {
    if (hasChangesRequested) return 'address_feedback';
    if (hasUnresolvedComments) return 'respond_comments';
    if (hasApprovals && !hasChangesRequested) return 'ready_to_merge';
    return 'waiting';
  }

  if (isRequestedReviewer) {
    return 'review';
  }

  return 'none';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || process.env.GITHUB_ACCESS_TOKEN || '';

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub access token is required' },
        { status: 401 }
      );
    }

    const githubPRs = await getAllPRs(token, userId);
    const prDTOs: PRDTO[] = [];

    for (const githubPR of githubPRs) {
      try {
        const owner = githubPR.head?.repo?.owner?.login;
        const repo = githubPR.head?.repo?.name;
        const number = githubPR.number;

        if (!owner || !repo) continue;

        // Fetch comments and reviews
        let rawComments: any[] = [];
        let rawReviews: any[] = [];

        try {
          rawComments = await getComments(token, owner, repo, number);
          rawReviews = await getReviews(token, owner, repo, number);
        } catch (e) {
          console.error(`Failed to fetch details for PR #${number}:`, e);
        }

        // Map reviews to simple objects
        const reviews: SimpleReview[] = rawReviews.map(r => ({
          reviewer: {
            login: r.user.login,
            avatarUrl: r.user.avatar_url,
          },
          state: r.state,
          submittedAt: new Date(r.submitted_at),
        }));

        // Analyze comments by source
        const bySource: Record<string, number> = {};
        for (const comment of rawComments) {
          const source = getCommentSource({ type: comment.user.type, login: comment.user.login });
          bySource[source] = (bySource[source] ?? 0) + 1;
        }

        // Get latest review state per reviewer
        const latestReviewByUser = new Map<string, SimpleReview>();
        for (const review of reviews) {
          const existing = latestReviewByUser.get(review.reviewer.login);
          if (!existing || review.submittedAt > existing.submittedAt) {
            latestReviewByUser.set(review.reviewer.login, review);
          }
        }

        // Build reviewer lists
        const approvedBy: ReviewerInfo[] = [];
        const changesRequestedBy: ReviewerInfo[] = [];

        for (const [login, review] of latestReviewByUser) {
          const info: ReviewerInfo = {
            login,
            avatarUrl: review.reviewer.avatarUrl,
            isBot: isBot(login),
          };
          if (isReviewApproved(review.state)) {
            approvedBy.push(info);
          } else if (isReviewChangesRequested(review.state)) {
            changesRequestedBy.push(info);
          }
        }

        // Calculate counts
        const approved = approvedBy.length;
        const changesRequested = changesRequestedBy.length;
        const commented = Array.from(latestReviewByUser.values()).filter(r => isReviewCommented(r.state)).length;
        const requestedCount = githubPR.requested_reviewers?.length ?? 0;
        const pending = Math.max(0, requestedCount);

        // Comments are not tracked for resolution via this API
        const unresolvedCount = 0;

        const dto: PRDTO = {
          id: githubPR.id.toString(),
          number: githubPR.number,
          title: githubPR.title,
          url: githubPR.html_url,
          repository: {
            owner,
            name: repo,
            fullName: `${owner}/${repo}`,
          },
          author: {
            login: githubPR.user.login,
            avatarUrl: githubPR.user.avatar_url,
          },
          assignees: (githubPR.assignees || []).map((a: any) => a.login),
          reviewers: (githubPR.requested_reviewers || []).map((r: any) => r.login),
          status: githubPR.draft ? 'draft' : githubPR.state,
          reviewStatus: {
            approved,
            changesRequested,
            commented,
            pending,
            approvedBy,
            changesRequestedBy,
          },
          comments: {
            total: rawComments.length,
            unresolved: unresolvedCount,
            lastCommentAt: rawComments.length > 0
              ? rawComments.reduce((latest, c) => {
                  const date = new Date(c.created_at);
                  return date > latest ? date : latest;
                }, new Date(rawComments[0].created_at)).toISOString()
              : undefined,
            bySource: Object.keys(bySource).length > 0 ? bySource : undefined,
          },
          actionNeeded: determineAction(
            {
              author: { login: githubPR.user.login },
              reviewers: (githubPR.requested_reviewers || []).map((r: any) => r.login),
              comments: { unresolved: unresolvedCount },
            },
            reviews,
            userId
          ),
          createdAt: githubPR.created_at,
          updatedAt: githubPR.updated_at,
          lastSyncedAt: new Date().toISOString(),
        };

        prDTOs.push(dto);
      } catch (error) {
        console.error(`Failed to process PR ${githubPR.number}:`, error);
      }
    }

    // Sort by updatedAt descending
    prDTOs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ success: true, prs: prDTOs });
  } catch (error) {
    console.error('Error syncing PRs:', error);
    return NextResponse.json(
      { error: 'Failed to sync PRs', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
