// domain/repositories/PRRepository.ts
import { PR } from '../entities/PR';
import { PRId } from '../value-objects/PRId';
import { Repository } from '../value-objects/Repository';
import { UserId } from '../entities/User';

export interface PRRepository {
  findById(id: PRId): Promise<PR | null>;
  findByUser(userId: UserId): Promise<PR[]>;
  findByRepository(repo: Repository): Promise<PR[]>;
  save(pr: PR): Promise<void>;
  saveMany(prs: PR[]): Promise<void>;
  delete(id: PRId): Promise<void>;
}
