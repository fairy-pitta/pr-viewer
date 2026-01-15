// application/use-cases/notify-user/NotifyUserUseCase.ts
import type { PRRepository } from '../../../domain/repositories/PRRepository';
import type { NotificationService } from '../../../infrastructure/notifications/BrowserNotificationService';
import { NotificationEvent } from './NotificationEvent';

export class NotifyUserUseCase {
  constructor(
    private notificationService: NotificationService,
    private prRepository: PRRepository
  ) {}

  async execute(event: NotificationEvent): Promise<void> {
    const pr = await this.prRepository.findById(event.prId);
    if (!pr) {
      return;
    }

    // 通知が必要か判定（簡略化のため、常に通知）
    await this.notificationService.send({
      title: event.title,
      body: event.body,
      tag: `pr-${event.prId.toString()}`,
      data: event.data,
      requireInteraction: false,
    });
  }
}
