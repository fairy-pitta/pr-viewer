// domain/repositories/CommentRepository.ts
import { Comment } from '@domain/entities/Comment';
import { PRId } from '@domain/value-objects/PRId';

export interface CommentRepository {
  findByPR(prId: PRId): Promise<Comment[]>;
  findNewCommentsSince(prId: PRId, since: Date): Promise<Comment[]>;
  save(prId: PRId, comment: Comment): Promise<void>;
  saveMany(prId: PRId, comments: Comment[]): Promise<void>;
}
