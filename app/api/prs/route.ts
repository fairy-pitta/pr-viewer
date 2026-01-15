import { NextRequest, NextResponse } from 'next/server';
import { GetPRsUseCase } from '@application/use-cases/get-prs/GetPRsUseCase';
import { UserId } from '@domain/entities/User';
import { dependencyContainer } from '@infrastructure/config/dependencies';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

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

    // dependencyContainerを初期化
    // サーバーサイドではメモリストレージが自動的に使用される
    await dependencyContainer.initialize({
      githubAccessToken: token,
      indexedDB: {
        dbName: 'pr-viewer',
        version: 1,
      },
    });

    const deps = dependencyContainer.getDependencies();
    const useCase = new GetPRsUseCase(deps.prRepository);
    const prs = await useCase.execute({ userId: UserId.create(userId) });

    return NextResponse.json(prs);
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PRs' },
      { status: 500 }
    );
  }
}
