// presentation/web/app/api/notifications/push/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { NotifyUserUseCase } from '@application/use-cases/notify-user/NotifyUserUseCase';
import { PRId } from '@domain/value-objects/PRId';
import { dependencyContainer } from '@infrastructure/config/dependencies';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prId, type, title, body: bodyText, data } = body;

    if (!prId || !type || !title || !bodyText) {
      return NextResponse.json(
        { error: 'prId, type, title, and body are required' },
        { status: 400 }
      );
    }

    const deps = dependencyContainer.getDependencies();
    const useCase = new NotifyUserUseCase(
      deps.notificationService,
      deps.prRepository
    );

    await useCase.execute({
      prId: PRId.create(prId),
      type,
      title,
      body: bodyText,
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
