// infrastructure/notifications/BrowserNotificationService.ts

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

export interface NotificationService {
  send(options: NotificationOptions): Promise<void>;
  requestPermission(): Promise<NotificationPermission>;
  isSupported(): boolean;
}

export class BrowserNotificationService implements NotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  async send(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Browser notifications are not supported');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
    });

    // 自動的に閉じる（5秒後）
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
}
