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
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/prs/route.ts:header-check',message:'Checking authorization header',data:{hasAuthHeader:!!authHeader,authHeaderPrefix:authHeader?.substring(0,20)||'none',allHeaders:Object.fromEntries(request.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const token = authHeader?.replace('Bearer ', '') || process.env.GITHUB_ACCESS_TOKEN || '';
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/prs/route.ts:token-extracted',message:'Token extracted',data:{hasToken:!!token,tokenLength:token.length,tokenPrefix:token.substring(0,4)||'none',fromEnv:!!process.env.GITHUB_ACCESS_TOKEN},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    if (!token) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/prs/route.ts:no-token',message:'No token found - returning 401',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/prs/route.ts:prs-fetched',message:'PRs fetched from repository',data:{prsCount:prs.length,prs:prs.slice(0,2)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(prs);
  } catch (error) {
    console.error('Error fetching PRs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PRs' },
      { status: 500 }
    );
  }
}
