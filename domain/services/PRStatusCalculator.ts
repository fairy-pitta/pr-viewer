// domain/services/PRStatusCalculator.ts
import { PR } from '../entities/PR';
import { Review } from '../entities/Review';
import { ReviewStatus } from '../entities/PR';
import { PRState } from '../value-objects/PRState';

export class PRStatusCalculator {
  calculateReviewStatus(pr: PR, reviews: Review[]): ReviewStatus {
    const approved = reviews.filter(r => r.isApproved()).length;
    const changesRequested = reviews.filter(r => r.requiresChanges()).length;
    const commented = reviews.filter(r => r.isCommented()).length;
    
    // レビューリクエストされているが、まだレビューされていない数
    const requestedReviewers = pr.reviewers.length;
    const reviewedBy = new Set(reviews.map(r => r.reviewer.login));
    const pending = requestedReviewers - reviewedBy.size;

    return ReviewStatus.create({
      approved,
      changesRequested,
      commented,
      pending: Math.max(0, pending),
    });
  }

  determinePRState(pr: PR, reviews: Review[]): PRState {
    // マージ済みまたはクローズ済みの場合はそのまま返す
    if (pr.status.isMerged()) {
      return PRState.MERGED;
    }
    if (pr.status.isClosed()) {
      return PRState.CLOSED;
    }

    // ドラフトの場合はそのまま返す
    if (pr.status.isDraft()) {
      return PRState.DRAFT;
    }

    // レビュー状態に基づいて状態を決定
    const reviewStatus = this.calculateReviewStatus(pr, reviews);
    
    // 変更要求がある場合は変更要求状態
    if (reviewStatus.hasChangesRequested()) {
      return PRState.OPEN; // 実際の状態はOPENのまま、レビュー状態で管理
    }

    // 承認がある場合は承認状態
    if (reviewStatus.hasApprovals()) {
      return PRState.OPEN; // 実際の状態はOPENのまま、レビュー状態で管理
    }

    // デフォルトはOPEN
    return PRState.OPEN;
  }
}
