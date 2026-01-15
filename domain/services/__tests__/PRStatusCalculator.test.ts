import { PRStatusCalculator } from '../PRStatusCalculator';
import { PR } from '@domain/entities/PR';
import { Review } from '@domain/entities/Review';
import { PRState } from '@domain/value-objects/PRState';
import { ReviewState } from '@domain/value-objects/ReviewState';
import { PRId } from '@domain/value-objects/PRId';
import { Repository } from '@domain/value-objects/Repository';

describe('PRStatusCalculator', () => {
  const calculator = new PRStatusCalculator();

  const createMockPR = (reviewers: string[] = []) => {
    return PR.create({
      id: 'pr-1',
      number: 1,
      title: 'Test PR',
      url: 'https://github.com/owner/repo/pull/1',
      repository: { owner: 'owner', name: 'repo' },
      author: { login: 'author' },
      assignees: [],
      reviewers,
      status: PRState.OPEN,
      reviewStatus: { approved: 0, changesRequested: 0, commented: 0, pending: 0 } as any,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncedAt: new Date(),
    });
  };

  const createMockReview = (reviewerLogin: string, state: ReviewState) => {
    return Review.create({
      id: `review-${reviewerLogin}`,
      reviewer: { login: reviewerLogin },
      state,
      submittedAt: new Date(),
    });
  };

  describe('calculateReviewStatus', () => {
    it('should calculate review status with approved reviews', () => {
      const pr = createMockPR(['reviewer1', 'reviewer2']);
      const reviews = [
        createMockReview('reviewer1', ReviewState.APPROVED),
        createMockReview('reviewer2', ReviewState.APPROVED),
      ];

      const status = calculator.calculateReviewStatus(pr, reviews);
      expect(status.approved).toBe(2);
      expect(status.changesRequested).toBe(0);
      expect(status.commented).toBe(0);
      expect(status.pending).toBe(0);
    });

    it('should calculate review status with changes requested', () => {
      const pr = createMockPR(['reviewer1']);
      const reviews = [
        createMockReview('reviewer1', ReviewState.CHANGES_REQUESTED),
      ];

      const status = calculator.calculateReviewStatus(pr, reviews);
      expect(status.approved).toBe(0);
      expect(status.changesRequested).toBe(1);
      expect(status.commented).toBe(0);
      expect(status.pending).toBe(0);
    });

    it('should calculate review status with commented reviews', () => {
      const pr = createMockPR(['reviewer1']);
      const reviews = [
        createMockReview('reviewer1', ReviewState.COMMENTED),
      ];

      const status = calculator.calculateReviewStatus(pr, reviews);
      expect(status.approved).toBe(0);
      expect(status.changesRequested).toBe(0);
      expect(status.commented).toBe(1);
      expect(status.pending).toBe(0);
    });

    it('should calculate pending reviews correctly', () => {
      const pr = createMockPR(['reviewer1', 'reviewer2', 'reviewer3']);
      const reviews = [
        createMockReview('reviewer1', ReviewState.APPROVED),
      ];

      const status = calculator.calculateReviewStatus(pr, reviews);
      expect(status.approved).toBe(1);
      expect(status.pending).toBe(2); // reviewer2とreviewer3はまだレビューしていない
    });

    it('should handle mixed review states', () => {
      const pr = createMockPR(['reviewer1', 'reviewer2', 'reviewer3']);
      const reviews = [
        createMockReview('reviewer1', ReviewState.APPROVED),
        createMockReview('reviewer2', ReviewState.CHANGES_REQUESTED),
        createMockReview('reviewer3', ReviewState.COMMENTED),
      ];

      const status = calculator.calculateReviewStatus(pr, reviews);
      expect(status.approved).toBe(1);
      expect(status.changesRequested).toBe(1);
      expect(status.commented).toBe(1);
      expect(status.pending).toBe(0);
    });
  });

  describe('determinePRState', () => {
    it('should return MERGED if PR is already merged', () => {
      const pr = PR.create({
        ...createMockPR() as any,
        status: PRState.MERGED,
      });
      const reviews = [];

      const state = calculator.determinePRState(pr, reviews);
      expect(state).toBe(PRState.MERGED);
    });

    it('should return CLOSED if PR is already closed', () => {
      const pr = PR.create({
        ...createMockPR() as any,
        status: PRState.CLOSED,
      });
      const reviews = [];

      const state = calculator.determinePRState(pr, reviews);
      expect(state).toBe(PRState.CLOSED);
    });

    it('should return DRAFT if PR is draft', () => {
      const pr = PR.create({
        ...createMockPR() as any,
        status: PRState.DRAFT,
      });
      const reviews = [];

      const state = calculator.determinePRState(pr, reviews);
      expect(state).toBe(PRState.DRAFT);
    });

    it('should return OPEN for open PRs', () => {
      const pr = createMockPR();
      const reviews = [];

      const state = calculator.determinePRState(pr, reviews);
      expect(state).toBe(PRState.OPEN);
    });
  });
});
