// infrastructure/repositories/IndexedDBPRRepository.ts
import type { PRRepository } from '@domain/repositories/PRRepository';
import { PR } from '@domain/entities/PR';
import { PRId } from '@domain/value-objects/PRId';
import { Repository } from '@domain/value-objects/Repository';
import { UserId } from '@domain/entities/User';
import { IndexedDBClient } from '@infrastructure/external/storage/IndexedDBClient';

export class IndexedDBPRRepository implements PRRepository {
  constructor(private db: IndexedDBClient) {}

  async findById(id: PRId): Promise<PR | null> {
    const data = await this.db.get<PR>('prs', id.toString());
    return data || null;
  }

  async findByUser(userId: UserId): Promise<PR[]> {
    const prs = await this.db.getAll<PR>('prs', 'userId', userId.toString());
    return prs;
  }

  async findByRepository(repo: Repository): Promise<PR[]> {
    const prs = await this.db.getAll<PR>('prs', 'repository', repo.toString());
    return prs;
  }

  async save(pr: PR): Promise<void> {
    await this.db.set('prs', pr.id.toString(), {
      ...pr,
      userId: pr.author.login, // インデックス用
      repository: pr.repository.toString(), // インデックス用
    });
  }

  async saveMany(prs: PR[]): Promise<void> {
    for (const pr of prs) {
      await this.save(pr);
    }
  }

  async delete(id: PRId): Promise<void> {
    await this.db.delete('prs', id.toString());
  }
}
