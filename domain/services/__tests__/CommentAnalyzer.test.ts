import { CommentAnalyzer } from '../CommentAnalyzer';
import { Comment } from '@domain/entities/Comment';
import { CommentSource } from '@domain/value-objects/CommentSource';

describe('CommentAnalyzer', () => {
  const analyzer = new CommentAnalyzer();

  const createMockComment = (id: string, source: CommentSource, isResolved = false) => {
    return Comment.create({
      id,
      author: { login: `user-${id}`, type: 'User' },
      content: `Comment ${id}`,
      source,
      createdAt: new Date(),
      isResolved,
    });
  };

  describe('analyzeComments', () => {
    it('should analyze empty comments', () => {
      const stats = analyzer.analyzeComments([]);
      expect(stats.total).toBe(0);
      expect(stats.unresolved).toBe(0);
      expect(stats.bySource.size).toBe(0);
    });

    it('should analyze comments with statistics', () => {
      const comments = [
        createMockComment('1', CommentSource.REVIEWER),
        createMockComment('2', CommentSource.REVIEWER),
        createMockComment('3', CommentSource.BOT),
        createMockComment('4', CommentSource.REVIEWER, true),
      ];

      const stats = analyzer.analyzeComments(comments);
      expect(stats.total).toBe(4);
      expect(stats.unresolved).toBe(3); // resolved: 1つ
      expect(stats.getCountBySource('reviewer')).toBe(3);
      expect(stats.getCountBySource('bot')).toBe(1);
    });
  });

  describe('getCommentsBySource', () => {
    it('should filter comments by source', () => {
      const comments = [
        createMockComment('1', CommentSource.REVIEWER),
        createMockComment('2', CommentSource.BOT),
        createMockComment('3', CommentSource.REVIEWER),
      ];

      const reviewerComments = analyzer.getCommentsBySource(comments, CommentSource.REVIEWER);
      expect(reviewerComments).toHaveLength(2);
      expect(reviewerComments[0].source.equals(CommentSource.REVIEWER)).toBe(true);

      const botComments = analyzer.getCommentsBySource(comments, CommentSource.BOT);
      expect(botComments).toHaveLength(1);
      expect(botComments[0].source.equals(CommentSource.BOT)).toBe(true);
    });
  });

  describe('getBotComments', () => {
    it('should filter bot comments', () => {
      const comments = [
        createMockComment('1', CommentSource.REVIEWER),
        createMockComment('2', CommentSource.BOT),
        createMockComment('3', CommentSource.COPILOT),
      ];

      const botComments = analyzer.getBotComments(comments);
      expect(botComments).toHaveLength(2); // BOTとCOPILOT
    });
  });

  describe('getReviewerComments', () => {
    it('should filter reviewer comments', () => {
      const comments = [
        createMockComment('1', CommentSource.REVIEWER),
        createMockComment('2', CommentSource.BOT),
        createMockComment('3', CommentSource.REVIEWER),
      ];

      const reviewerComments = analyzer.getReviewerComments(comments);
      expect(reviewerComments).toHaveLength(2);
    });
  });

  describe('getNewCommentsSince', () => {
    it('should filter new comments since date', () => {
      const baseDate = new Date('2024-01-01');
      const comments = [
        Comment.create({
          id: '1',
          author: { login: 'user1', type: 'User' },
          content: 'Old comment',
          source: CommentSource.REVIEWER,
          createdAt: new Date('2023-12-31'),
        }),
        Comment.create({
          id: '2',
          author: { login: 'user2', type: 'User' },
          content: 'New comment',
          source: CommentSource.REVIEWER,
          createdAt: new Date('2024-01-02'),
        }),
      ];

      const newComments = analyzer.getNewCommentsSince(comments, baseDate);
      expect(newComments).toHaveLength(1);
      expect(newComments[0].id.toString()).toBe('2');
    });
  });
});
