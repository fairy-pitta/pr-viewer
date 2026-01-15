// application/dto/PRDTO.ts

export interface PRDTO {
  id: string;
  number: number;
  title: string;
  url: string;
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  author: {
    login: string;
    avatarUrl?: string;
  };
  assignees: string[];
  reviewers: string[];
  status: string;
  reviewStatus: {
    approved: number;
    changesRequested: number;
    commented: number;
    pending: number;
  };
  comments: {
    total: number;
    unresolved: number;
    lastCommentAt?: string;
    bySource?: Record<string, number>;
  };
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
  userMetadata?: {
    notes?: string;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
    customStatus?: string;
  };
}
