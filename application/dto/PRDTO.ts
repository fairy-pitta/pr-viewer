// application/dto/PRDTO.ts

export interface ReviewerInfo {
  login: string;
  avatarUrl?: string;
  isBot: boolean;
}

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
    // NEW: Who gave each review
    approvedBy: ReviewerInfo[];
    changesRequestedBy: ReviewerInfo[];
  };
  comments: {
    total: number;
    unresolved: number;
    lastCommentAt?: string;
    bySource?: Record<string, number>;
  };
  // NEW: Action indicator for the current user
  actionNeeded?: 'review' | 'address_feedback' | 'respond_comments' | 'ready_to_merge' | 'waiting' | 'none';
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
