import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

import { UserId } from '@domain/entities/User';
import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';
import { GitHubPRMapper } from '@infrastructure/external/github/GitHubPRMapper';
import { CommentAnalyzer } from '@domain/services/CommentAnalyzer';
import type { PRDTO, ReviewerInfo } from '@application/dto/PRDTO';

const commentAnalyzer = new CommentAnalyzer();

function isBot(login: string): boolean {
  const botPatterns = ['[bot]', 'copilot', 'coderabbit', 'dependabot', 'renovate', 'github-actions'];
  const lowerLogin = login.toLowerCase();
  return botPatterns.some(pattern => lowerLogin.includes(pattern));
}

function determineAction(
  pr: any,
  reviews: any[],
  currentUserId: string
): PRDTO['actionNeeded'] {
  const isAuthor = pr.author.login === currentUserId;
  const isRequestedReviewer = pr.reviewers?.includes(currentUserId);

  // Get latest review per user (most recent state)
  const latestReviewByUser = new Map<string, any>();
  for (const review of reviews) {
    const existing = latestReviewByUser.get(review.reviewer.login);
    if (!existing || review.submittedAt > existing.submittedAt) {
      latestReviewByUser.set(review.reviewer.login, review);
    }
  }

  const hasChangesRequested = Array.from(latestReviewByUser.values()).some(r => r.requiresChanges());
  const hasApprovals = Array.from(latestReviewByUser.values()).some(r => r.isApproved());
  const hasUnresolvedComments = pr.comments?.unresolved > 0;

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

    const githubClient = new GitHubAPIClient(token);
    const githubPRs = await githubClient.getPRs(userId);

    const prDTOs: PRDTO[] = [];

    for (const githubPR of githubPRs) {
      try {
        const owner = (githubPR as any).head?.repo?.owner?.login;
        const repo = (githubPR as any).head?.repo?.name;
        const number = githubPR.number;

        if (!owner || !repo) continue;

        // Fetch comments and reviews
        let rawComments: any[] = [];
        let rawReviews: any[] = [];

        try {
          rawComments = await githubClient.getComments(owner, repo, number);
          rawReviews = await githubClient.getReviews(owner, repo, number);
        } catch (e) {
          console.error(`Failed to fetch details for PR #${number}:`, e);
        }

        // Map to domain objects for analysis
        const comments = rawComments.map(c => GitHubPRMapper.toDomainComment(c));
        const reviews = rawReviews.map(r => GitHubPRMapper.toDomainReview(r));

        // Analyze comments by source
        const commentStats = commentAnalyzer.analyzeComments(comments);
        const bySource: Record<string, number> = {};
        commentStats.bySource.forEach((count, source) => {
          bySource[source] = count;
        });

        // Get latest review state per reviewer
        const latestReviewByUser = new Map<string, any>();
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
          if (review.isApproved()) {
            approvedBy.push(info);
          } else if (review.requiresChanges()) {
            changesRequestedBy.push(info);
          }
        }

        // Calculate counts
        const approved = approvedBy.length;
        const changesRequested = changesRequestedBy.length;
        const commented = Array.from(latestReviewByUser.values()).filter(r => r.isCommented()).length;
        const requestedCount = (githubPR as any).requested_reviewers?.length ?? 0;
        const pending = Math.max(0, requestedCount);

        // Build domain PR for action calculation
        const domainPR = GitHubPRMapper.toDomainPR(githubPR as any, comments, reviews);

        const dto: PRDTO = {
          id: githubPR.id.toString(),
          number: githubPR.number,
          title: githubPR.title,
          url: (githubPR as any).html_url,
          repository: {
            owner,
            name: repo,
            fullName: `${owner}/${repo}`,
          },
          author: {
            login: (githubPR as any).user.login,
            avatarUrl: (githubPR as any).user.avatar_url,
          },
          assignees: ((githubPR as any).assignees || []).map((a: any) => a.login),
          reviewers: ((githubPR as any).requested_reviewers || []).map((r: any) => r.login),
          status: (githubPR as any).draft ? 'draft' : (githubPR as any).state,
          reviewStatus: {
            approved,
            changesRequested,
            commented,
            pending,
            approvedBy,
            changesRequestedBy,
          },
          comments: {
            total: comments.length,
            unresolved: comments.filter(c => !c.isResolved).length,
            lastCommentAt: comments.length > 0
              ? comments.reduce((latest, c) => c.createdAt > latest ? c.createdAt : latest, comments[0].createdAt).toISOString()
              : undefined,
            bySource: Object.keys(bySource).length > 0 ? bySource : undefined,
          },
          actionNeeded: determineAction(
            {
              author: { login: (githubPR as any).user.login },
              reviewers: ((githubPR as any).requested_reviewers || []).map((r: any) => r.login),
              comments: { unresolved: comments.filter(c => !c.isResolved).length },
            },
            reviews,
            userId
          ),
          createdAt: (githubPR as any).created_at,
          updatedAt: (githubPR as any).updated_at,
          lastSyncedAt: new Date().toISOString(),
        };

        prDTOs.push(dto);
      } catch (error) {
        console.error(`Failed to process PR ${githubPR.number}:`, error);
      }
    }

    // Sort by updatedAt descending (most recent first)
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
