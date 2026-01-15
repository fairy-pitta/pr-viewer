// domain/repositories/PRRepository.ts
import { PR } from '@domain/entities/PR';
import { PRId } from '@domain/value-objects/PRId';
import { Repository } from '@domain/value-objects/Repository';
import { UserId } from '@domain/entities/User';

export interface PRRepository {
  findById(id: PRId): Promise<PR | null>;
  findByUser(userId: UserId): Promise<PR[]>;
  findByRepository(repo: Repository): Promise<PR[]>;
  save(pr: PR): Promise<void>;
  saveMany(prs: PR[]): Promise<void>;
  delete(id: PRId): Promise<void>;
}
