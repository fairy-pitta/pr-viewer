// infrastructure/notifications/PWAPushNotificationService.ts
import type { NotificationService, NotificationOptions } from './BrowserNotificationService';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PWAPushNotificationService implements NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  constructor(registration: ServiceWorkerRegistration) {
    this.registration = registration;
  }

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
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  async send(options: NotificationOptions): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker registration is required');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    // Service Workerにメッセージを送信して通知を表示
    await this.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction,
    });
  }

  async subscribe(vapidPublicKey: string): Promise<PushSubscription> {
    if (!this.registration) {
      throw new Error('Service Worker registration is required');
    }

    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
    });

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    const subscription = await this.registration.pushManager.getSubscription();
    if (subscription) {
      return await subscription.unsubscribe();
    }

    return false;
  }

  private urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
