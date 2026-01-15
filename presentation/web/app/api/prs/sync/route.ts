// presentation/web/app/api/prs/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SyncPRsUseCase } from '../../../../application/use-cases/sync-prs/SyncPRsUseCase';
import { UserId } from '../../../../domain/entities/User';
import { dependencyContainer } from '../../../../infrastructure/config/dependencies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, force } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const deps = dependencyContainer.getDependencies();
    const useCase = new SyncPRsUseCase(
      deps.prRepository,
      deps.commentRepository,
      deps.reviewRepository,
      deps.githubClient
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
