// infrastructure/repositories/IndexedDBPRRepository.ts
import type { PRRepository } from '@domain/repositories/PRRepository';
import { PR } from '@domain/entities/PR';
import { PRId } from '@domain/value-objects/PRId';
import { Repository } from '@domain/value-objects/Repository';
import { UserId } from '@domain/entities/User';
import { IndexedDBClient } from '@infrastructure/external/storage/IndexedDBClient';
import { PRState } from '@domain/value-objects/PRState';
import { ReviewStatus } from '@domain/entities/PR';
import { Comment } from '@domain/entities/Comment';
import { CommentSource } from '@domain/value-objects/CommentSource';
import { UserMetadata } from '@domain/value-objects/UserMetadata';

export class IndexedDBPRRepository implements PRRepository {
  constructor(private db: IndexedDBClient) {}

  private toCommentSource(value: unknown, author?: { login?: string; type?: 'User' | 'Bot' }): CommentSource {
    const v =
      typeof value === 'string'
        ? value
        : (value as any)?.value ?? (value as any)?.toString?.();

    if (typeof v === 'string') {
      switch (v) {
        case 'reviewer':
          return CommentSource.REVIEWER;
        case 'bot':
          return CommentSource.BOT;
        case 'copilot':
          return CommentSource.COPILOT;
        case 'coderabbit':
          return CommentSource.CODERABBIT;
        case 'other':
          return CommentSource.OTHER;
      }
    }

    // fallback: derive from author if possible
    if (author?.login && author?.type) {
      return CommentSource.fromAuthor({ login: author.login, type: author.type });
    }
    return CommentSource.OTHER;
  }

  private rehydratePR(raw: any): PR {
    if (raw && typeof raw.getUserMetadata === 'function') {
      return raw as PR;
    }

    const idStr =
      raw?.id?.toString?.() ??
      raw?.id?.value ??
      raw?.id ??
      '';

    const numberNum =
      raw?.number?.toNumber?.() ??
      raw?.number?.value ??
      raw?.number ??
      0;

    const titleStr =
      raw?.title?.toString?.() ??
      raw?.title?.value ??
      raw?.title ??
      '';

    const repoOwner = raw?.repository?.owner ?? (typeof raw?.repository === 'string' ? raw.repository.split('/')[0] : undefined);
    const repoName = raw?.repository?.name ?? (typeof raw?.repository === 'string' ? raw.repository.split('/')[1] : undefined);

    const authorLogin = raw?.author?.login ?? raw?.author?.value ?? raw?.author ?? '';
    const authorAvatarUrl = raw?.author?.avatarUrl ?? raw?.author?.avatar_url ?? raw?.author?.avatar ?? undefined;

    const statusStr =
      raw?.status?.toString?.() ??
      raw?.status?.value ??
      raw?.status ??
      'open';

    const reviewStatusRaw = raw?.reviewStatus ?? {};
    const reviewStatus = ReviewStatus.create({
      approved: reviewStatusRaw?.approved ?? 0,
      changesRequested: reviewStatusRaw?.changesRequested ?? 0,
      commented: reviewStatusRaw?.commented ?? 0,
      pending: reviewStatusRaw?.pending ?? 0,
    });

    const rawComments =
      raw?.comments?.getComments?.() ??
      raw?.comments?.comments ??
      [];

    const comments: Comment[] = Array.isArray(rawComments)
      ? rawComments.map((c: any) => {
          if (c && typeof c.isFromBot === 'function') {
            return c as Comment;
          }
          const author = c?.author ?? {};
          const authorLogin2 = author?.login ?? '';
          const authorType2 = author?.type ?? 'User';
          const authorAvatar2 = author?.avatarUrl ?? author?.avatar_url ?? undefined;
          const contentStr = c?.content?.toString?.() ?? c?.content?.value ?? c?.content ?? '';
          const createdAt = c?.createdAt instanceof Date ? c.createdAt : new Date(c?.createdAt);
          return Comment.create({
            id: c?.id?.toString?.() ?? c?.id?.value ?? c?.id ?? '',
            author: { login: authorLogin2, type: authorType2, avatarUrl: authorAvatar2 },
            content: contentStr,
            source: this.toCommentSource(c?.source, { login: authorLogin2, type: authorType2 }),
            createdAt,
            isResolved: c?.isResolved ?? false,
            url: c?.url,
          });
        })
      : [];

    const createdAt = raw?.createdAt instanceof Date ? raw.createdAt : new Date(raw?.createdAt);
    const updatedAt = raw?.updatedAt instanceof Date ? raw.updatedAt : new Date(raw?.updatedAt);
    const lastSyncedAt = raw?.lastSyncedAt instanceof Date ? raw.lastSyncedAt : new Date(raw?.lastSyncedAt);

    const userMetadataRaw = raw?.userMetadata;
    const userMetadata =
      userMetadataRaw && typeof userMetadataRaw === 'object'
        ? UserMetadata.create({
            notes: userMetadataRaw.notes,
            tags: userMetadataRaw.tags,
            priority: userMetadataRaw.priority,
            customStatus: userMetadataRaw.customStatus,
          })
        : undefined;

    return PR.create({
      id: String(idStr),
      number: Number(numberNum),
      title: String(titleStr),
      url: raw?.url ?? '',
      repository: { owner: String(repoOwner ?? ''), name: String(repoName ?? '') },
      author: { login: String(authorLogin), avatarUrl: authorAvatarUrl },
      assignees: Array.isArray(raw?.assignees) ? raw.assignees : [],
      reviewers: Array.isArray(raw?.reviewers) ? raw.reviewers : [],
      status: PRState.fromString(String(statusStr)),
      reviewStatus,
      comments,
      createdAt,
      updatedAt,
      lastSyncedAt,
      userMetadata,
    });
  }

  async findById(id: PRId): Promise<PR | null> {
    const data = await this.db.get<PR>('prs', id.toString());
    if (!data) return null;
    return this.rehydratePR(data as any);
  }

  async findByUser(userId: UserId): Promise<PR[]> {
    const prs = await this.db.getAll<any>('prs', 'userId', userId.toString());
    return (Array.isArray(prs) ? prs : []).map((p) => this.rehydratePR(p));
  }

  async findByRepository(repo: Repository): Promise<PR[]> {
    const prs = await this.db.getAll<any>('prs', 'repository', repo.toString());
    return (Array.isArray(prs) ? prs : []).map((p) => this.rehydratePR(p));
  }

  async save(pr: PR): Promise<void> {
    const idxUserId = (pr as any).__userId ?? pr.author.login;
    await this.db.set('prs', pr.id.toString(), {
      ...pr,
      userId: idxUserId,
      repository: pr.repository.toString(),
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
