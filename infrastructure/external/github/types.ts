// infrastructure/external/github/types.ts

export interface GitHubPR {
  id: string;
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  draft: boolean;
  user: {
    login: string;
    avatar_url?: string;
  };
  head: {
    repo: {
      owner: {
        login: string;
      };
      name: string;
    };
  };
  assignees: Array<{
    login: string;
  }>;
  requested_reviewers: Array<{
    login: string;
  }>;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
}

export interface GitHubComment {
  id: string;
  user: {
    login: string;
    type: 'User' | 'Bot';
    avatar_url?: string;
  };
  body: string;
  created_at: string;
  html_url?: string;
}

export interface GitHubReview {
  id: string;
  user: {
    login: string;
    avatar_url?: string;
  };
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  submitted_at: string;
  body?: string;
}

export interface GitHubUser {
  id: string;
  login: string;
  avatar_url?: string;
  email?: string;
}

export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
}
