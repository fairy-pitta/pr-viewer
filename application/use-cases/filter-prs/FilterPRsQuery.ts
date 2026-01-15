// application/use-cases/filter-prs/FilterPRsQuery.ts
import { UserId } from '@domain/entities/User';
import { PRState } from '@domain/value-objects/PRState';
import { Repository } from '@domain/value-objects/Repository';

export interface FilterPRsQuery {
  userId: UserId;
  repository?: Repository;
  status?: PRState;
  assignee?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}
