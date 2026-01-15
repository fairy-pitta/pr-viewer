// api/prs/filter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { FilterPRsUseCase } from '../../../../application/use-cases/filter-prs/FilterPRsUseCase';
import { UserId } from '../../../../domain/entities/User';
import { PRState } from '../../../../domain/value-objects/PRState';
import { Repository } from '../../../../domain/value-objects/Repository';
import { dependencyContainer } from '../../../../infrastructure/config/dependencies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, repository, status, assignee, dateRange, search } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const deps = dependencyContainer.getDependencies();
    const useCase = new FilterPRsUseCase(deps.prRepository);

    const query: any = {
      userId: UserId.create(userId),
    };

    if (repository) {
      query.repository = Repository.fromString(repository);
    }

    if (status) {
      query.status = PRState.fromString(status);
    }

    if (assignee) {
      query.assignee = assignee;
    }

    if (dateRange) {
      query.dateRange = {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to),
      };
    }

    if (search) {
      query.search = search;
    }

    const prs = await useCase.execute(query);

    return NextResponse.json(prs);
  } catch (error) {
    console.error('Error filtering PRs:', error);
    return NextResponse.json(
      { error: 'Failed to filter PRs' },
      { status: 500 }
    );
  }
}
