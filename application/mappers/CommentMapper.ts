// application/mappers/CommentMapper.ts
import { Comment } from '../../domain/entities/Comment';
import type { CommentDTO } from '../dto/CommentDTO';

export class CommentMapper {
  static toDTO(comment: Comment): CommentDTO {
    return {
      id: comment.id.toString(),
      author: {
        login: comment.author.login,
        type: comment.author.type,
        avatarUrl: comment.author.avatarUrl,
      },
      content: comment.content.toString(),
      source: comment.source.toString(),
      createdAt: comment.createdAt.toISOString(),
      isResolved: comment.isResolved,
      url: comment.url,
    };
  }

  static toDTOs(comments: Comment[]): CommentDTO[] {
    return comments.map(comment => this.toDTO(comment));
  }
}
