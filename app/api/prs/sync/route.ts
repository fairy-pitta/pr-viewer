// api/prs/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SyncPRsUseCase } from '@application/use-cases/sync-prs/SyncPRsUseCase';
import { UserId } from '@domain/entities/User';
import { dependencyContainer } from '@infrastructure/config/dependencies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, force } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Authorizationヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || process.env.GITHUB_ACCESS_TOKEN || '';

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub access token is required' },
        { status: 401 }
      );
    }

    // トークンでGitHubAPIClientを作成
    const { GitHubAPIClient } = await import('@infrastructure/external/github/GitHubAPIClient');
    const githubClient = new GitHubAPIClient(token);

    const deps = dependencyContainer.getDependencies();
    
    // GitHubリポジトリを作成（トークンを使用）
    const { GitHubCommentRepository } = await import('@infrastructure/repositories/GitHubCommentRepository');
    const { GitHubReviewRepository } = await import('@infrastructure/repositories/GitHubReviewRepository');
    const commentRepository = new GitHubCommentRepository(githubClient);
    const reviewRepository = new GitHubReviewRepository(githubClient);

    const useCase = new SyncPRsUseCase(
      deps.prRepository,
      commentRepository,
      reviewRepository,
      githubClient
    );

    await useCase.execute({
      userId: UserId.create(userId),
      force,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing PRs:', error);
    return NextResponse.json(
      { error: 'Failed to sync PRs' },
      { status: 500 }
    );
  }
}
