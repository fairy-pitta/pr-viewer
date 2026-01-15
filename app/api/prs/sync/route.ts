import { NextRequest, NextResponse } from 'next/server';
import { SyncPRsUseCase } from '@application/use-cases/sync-prs/SyncPRsUseCase';
import { UserId } from '@domain/entities/User';
import { dependencyContainer } from '@infrastructure/config/dependencies';
import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';
import { GitHubCommentRepository } from '@infrastructure/repositories/GitHubCommentRepository';
import { GitHubReviewRepository } from '@infrastructure/repositories/GitHubReviewRepository';

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
    const githubClient = new GitHubAPIClient(token);
    
    // GitHubリポジトリを作成
    const commentRepository = new GitHubCommentRepository(githubClient);
    const reviewRepository = new GitHubReviewRepository(githubClient);

    // dependencyContainerを初期化（IndexedDBを使用）
    await dependencyContainer.initialize({
      githubAccessToken: token,
      indexedDB: {
        dbName: 'pr-viewer',
        version: 1,
      },
    });

    const deps = dependencyContainer.getDependencies();

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
