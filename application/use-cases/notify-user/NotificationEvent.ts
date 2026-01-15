// application/use-cases/notify-user/NotificationEvent.ts
import { PRId } from '../../../domain/value-objects/PRId';

export type NotificationEventType =
  | 'new_comment'
  | 'pr_state_changed'
  | 'new_commit'
  | 'merged'
  | 'closed';

export interface NotificationEvent {
  prId: PRId;
  type: NotificationEventType;
  title: string;
  body: string;
  data?: any;
}
