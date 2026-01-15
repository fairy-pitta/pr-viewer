// application/use-cases/get-prs/GetPRsQuery.ts
import { UserId } from '@domain/entities/User';

export interface GetPRsQuery {
  userId: UserId;
}
