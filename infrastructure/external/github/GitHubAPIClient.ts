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

  async getPRs(userId: string): Promise<GitHubPR[]> {
    const prs: GitHubPR[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const endpoint = `/search/issues?q=type:pr+author:${userId}+state:open&page=${page}&per_page=${perPage}`;
      const response = await this.request<{ items: GitHubPR[] }>(endpoint);

      if (response.items.length === 0) {
        break;
      }

      prs.push(...response.items);
      page++;

      if (response.items.length < perPage) {
        break;
      }
    }

    // レビューリクエストされているPRも取得
    const reviewRequestedPRs = await this.getPRsWithReviewRequests(userId);
    const reviewRequestedIds = new Set(reviewRequestedPRs.map(pr => pr.id));
    
    // 重複を除去
    const uniquePRs = prs.filter(pr => !reviewRequestedIds.has(pr.id));
    return [...uniquePRs, ...reviewRequestedPRs];
  }

  async getPRsWithReviewRequests(userId: string): Promise<GitHubPR[]> {
    const prs: GitHubPR[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const endpoint = `/search/issues?q=type:pr+review-requested:${userId}+state:open&page=${page}&per_page=${perPage}`;
      const response = await this.request<{ items: GitHubPR[] }>(endpoint);

      if (response.items.length === 0) {
        break;
      }

      prs.push(...response.items);
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
