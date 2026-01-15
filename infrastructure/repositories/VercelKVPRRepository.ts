// infrastructure/repositories/VercelKVPRRepository.ts
import type { PRRepository } from '../../domain/repositories/PRRepository';
import { PR } from '../../domain/entities/PR';
import { PRId } from '../../domain/value-objects/PRId';
import { Repository } from '../../domain/value-objects/Repository';
import { UserId } from '../../domain/entities/User';
import { VercelKVClient } from '../external/storage/VercelKVClient';

export class VercelKVPRRepository implements PRRepository {
  constructor(private kv: VercelKVClient) {}

  async findById(id: PRId): Promise<PR | null> {
    const key = `pr:${id.toString()}`;
    const data = await this.kv.hgetall(key);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return this.deserialize(data);
  }

  async findByUser(userId: UserId): Promise<PR[]> {
    const key = `user:${userId.toString()}:prs`;
    const prIds = await this.kv.smembers(key);
    
    const prs: PR[] = [];
    for (const prId of prIds) {
      const pr = await this.findById(PRId.create(prId));
      if (pr) {
        prs.push(pr);
      }
    }

    return prs;
  }

  async findByRepository(repo: Repository): Promise<PR[]> {
    // Vercel KVでは全PRをスキャンする必要があるため、効率的ではない
    // 実運用では別のインデックス構造を検討
    const allPRs = await this.findByUser(UserId.create('*')); // 仮実装
    return allPRs.filter(pr => pr.repository.equals(repo));
  }

  async save(pr: PR): Promise<void> {
    const prKey = `pr:${pr.id.toString()}`;
    const userKey = `user:${pr.author.login}:prs`;

    // PRデータを保存
    const data = this.serialize(pr);
    for (const [field, value] of Object.entries(data)) {
      await this.kv.hset(prKey, field, value);
    }

    // ユーザーのPRリストに追加
    await this.kv.sadd(userKey, pr.id.toString());
  }

  async saveMany(prs: PR[]): Promise<void> {
    for (const pr of prs) {
      await this.save(pr);
    }
  }

  async delete(id: PRId): Promise<void> {
    const key = `pr:${id.toString()}`;
    await this.kv.del(key);
  }

  private serialize(pr: PR): Record<string, string> {
    return {
      id: pr.id.toString(),
      number: pr.number.toNumber().toString(),
      title: pr.title.toString(),
      url: pr.url,
      repository: pr.repository.toString(),
      author: pr.author.login,
      assignees: JSON.stringify(pr.assignees),
      reviewers: JSON.stringify(pr.reviewers),
      status: pr.status.toString(),
      reviewStatus: JSON.stringify({
        approved: pr.reviewStatus.approved,
        changesRequested: pr.reviewStatus.changesRequested,
        commented: pr.reviewStatus.commented,
        pending: pr.reviewStatus.pending,
      }),
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
      lastSyncedAt: pr.lastSyncedAt.toISOString(),
      userMetadata: pr.getUserMetadata() ? JSON.stringify(pr.getUserMetadata()) : '',
    };
  }

  private deserialize(data: Record<string, string>): PR {
    // 簡略化のため、完全な実装は省略
    // 実際には各フィールドを適切にパースする必要がある
    throw new Error('Deserialization not fully implemented');
  }
}
