// application/use-cases/sync-prs/SyncPRsCommand.ts
import { UserId } from '@domain/entities/User';

export interface SyncPRsCommand {
  userId: UserId;
  force?: boolean;
}
