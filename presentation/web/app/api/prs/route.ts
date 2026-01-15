// presentation/web/app/api/prs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GetPRsUseCase } from '../../../../application/use-cases/get-prs/GetPRsUseCase';
import { UserId } from '../../../../domain/entities/User';
import { dependencyContainer } from '../../../../infrastructure/config/dependencies';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

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
