// infrastructure/external/github/GitHubAPIClient.ts
import type {
  GitHubPR,
  GitHubComment,
  GitHubReview,
  GitHubUser,
  GitHubRateLimit,
} from './types';

export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly rateLimit?: GitHubRateLimit
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class GitHubAPIClient {
  private baseURL = 'https://api.github.com';

  constructor(private accessToken: string) {
    if (!accessToken) {
      throw new Error('GitHub access token is required');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'pr-viewer',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const rateLimit: GitHubRateLimit = {
      limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
      remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
      reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
    };

    if (!response.ok) {
      if (response.status === 403 && rateLimit.remaining === 0) {
        throw new GitHubAPIError(
          'GitHub API rate limit exceeded',
          response.status,
          rateLimit
        );
      }
      throw new GitHubAPIError(
        `GitHub API error: ${response.statusText}`,
        response.status,
        rateLimit
      );
    }

    return response.json();
  }

  private parseOwnerRepoFromRepositoryUrl(repositoryUrl: string): { owner: string; repo: string } | null {
    // expected: https://api.github.com/repos/{owner}/{repo}
    try {
      const u = new URL(repositoryUrl);
      const parts = u.pathname.split('/').filter(Boolean);
      const reposIdx = parts.indexOf('repos');
      if (reposIdx === -1) return null;
      const owner = parts[reposIdx + 1];
      const repo = parts[reposIdx + 2];
      if (!owner || !repo) return null;
      return { owner, repo };
    } catch {
      return null;
    }
  }

  private async hydratePRFromSearchItem(item: any): Promise<GitHubPR | null> {
    // Search API (/search/issues) returns "issue-like" objects; we must fetch PR details.
    const number: number | undefined = item?.number;
    const repositoryUrl: string | undefined = item?.repository_url;
    if (!number || !repositoryUrl) return null;
    const parsed = this.parseOwnerRepoFromRepositoryUrl(repositoryUrl);
    if (!parsed) return null;
    return await this.getPR(parsed.owner, parsed.repo, number);
  }

  async getPRs(userId: string): Promise<GitHubPR[]> {
    const allPRs: GitHubPR[] = [];
    const seenIds = new Set<string | number>();

    // Helper to add PRs without duplicates
    const addPRs = (prs: GitHubPR[]) => {
      for (const pr of prs) {
        if (!seenIds.has(pr.id)) {
          seenIds.add(pr.id);
          allPRs.push(pr);
        }
      }
    };

    // 1. PRs authored by user
    const authoredPRs = await this.searchPRs(`author:${userId}`);
    addPRs(authoredPRs);

    // 2. PRs where review is requested
    const reviewRequestedPRs = await this.searchPRs(`review-requested:${userId}`);
    addPRs(reviewRequestedPRs);

    // 3. PRs where user has commented
    const commentedPRs = await this.searchPRs(`commenter:${userId}`);
    addPRs(commentedPRs);

    // 4. PRs where user has reviewed
    const reviewedPRs = await this.searchPRs(`reviewed-by:${userId}`);
    addPRs(reviewedPRs);

    // 5. PRs assigned to user
    const assignedPRs = await this.searchPRs(`assignee:${userId}`);
    addPRs(assignedPRs);

    return allPRs;
  }

  private async searchPRs(query: string): Promise<GitHubPR[]> {
    const prs: GitHubPR[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const endpoint = `/search/issues?q=type:pr+${query}+state:open&page=${page}&per_page=${perPage}`;
      const response = await this.request<{ items: any[] }>(endpoint);

      if (response.items.length === 0) {
        break;
      }

      for (const item of response.items) {
        try {
          const pr = await this.hydratePRFromSearchItem(item);
          if (pr && (pr as any)?.head?.repo) {
            prs.push(pr);
          }
        } catch {
          // Skip items that fail to hydrate
        }
      }

      page++;

      if (response.items.length < perPage) {
        break;
      }
    }

    return prs;
  }

  async getPR(owner: string, repo: string, number: number): Promise<GitHubPR> {
    const endpoint = `/repos/${owner}/${repo}/pulls/${number}`;
    return this.request<GitHubPR>(endpoint);
  }

  async getComments(owner: string, repo: string, number: number): Promise<GitHubComment[]> {
    const comments: GitHubComment[] = [];

    // Issue comments
    const issueComments = await this.getIssueComments(owner, repo, number);
    comments.push(...issueComments);

    // Review comments
    const reviewComments = await this.getReviewComments(owner, repo, number);
    comments.push(...reviewComments);

    return comments;
  }

  private async getIssueComments(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubComment[]> {
    const comments: GitHubComment[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const endpoint = `/repos/${owner}/${repo}/issues/${number}/comments?page=${page}&per_page=${perPage}`;
      const response = await this.request<GitHubComment[]>(endpoint);

      if (response.length === 0) {
        break;
      }

      comments.push(...response);
      page++;

      if (response.length < perPage) {
        break;
      }
    }

    return comments;
  }

  private async getReviewComments(
    owner: string,
    repo: string,
    number: number
  ): Promise<GitHubComment[]> {
    const comments: GitHubComment[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const endpoint = `/repos/${owner}/${repo}/pulls/${number}/comments?page=${page}&per_page=${perPage}`;
      const response = await this.request<GitHubComment[]>(endpoint);

      if (response.length === 0) {
        break;
      }

      comments.push(...response);
      page++;

      if (response.length < perPage) {
        break;
      }
    }

    return comments;
  }

  async getReviews(owner: string, repo: string, number: number): Promise<GitHubReview[]> {
    const reviews: GitHubReview[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const endpoint = `/repos/${owner}/${repo}/pulls/${number}/reviews?page=${page}&per_page=${perPage}`;
      const response = await this.request<GitHubReview[]>(endpoint);

      if (response.length === 0) {
        break;
      }

      reviews.push(...response);
      page++;

      if (response.length < perPage) {
        break;
      }
    }

    return reviews;
  }

  async getUser(): Promise<GitHubUser> {
    const endpoint = '/user';
    return this.request<GitHubUser>(endpoint);
  }

  async getRateLimit(): Promise<GitHubRateLimit> {
    const endpoint = '/rate_limit';
    const response = await this.request<{ resources: { core: GitHubRateLimit } }>(endpoint);
    return response.resources.core;
  }
}
