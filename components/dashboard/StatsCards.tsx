// presentation/web/components/dashboard/StatsCards.tsx
'use client';

import type { PRDTO } from '@application/dto/PRDTO';
import styles from './StatsCards.module.css';

interface StatsCardsProps {
  prs: PRDTO[];
}

export function StatsCards({ prs }: StatsCardsProps) {
  const stats = {
    total: prs.length,
    needsReview: prs.filter(p => p.reviewStatus.pending > 0).length,
    approved: prs.filter(p => p.reviewStatus.approved > 0 && p.reviewStatus.changesRequested === 0).length,
    changesRequested: prs.filter(p => p.reviewStatus.changesRequested > 0).length,
    hasComments: prs.filter(p => p.comments.unresolved > 0).length,
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.total}`}>
        <div className={styles.iconWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </div>
        <div className={styles.content}>
          <div className={styles.value}>{stats.total}</div>
          <div className={styles.label}>Total PRs</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.pending}`}>
        <div className={styles.iconWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className={styles.content}>
          <div className={styles.value}>{stats.needsReview}</div>
          <div className={styles.label}>Pending Review</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.approved}`}>
        <div className={styles.iconWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className={styles.content}>
          <div className={styles.value}>{stats.approved}</div>
          <div className={styles.label}>Approved</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.changes}`}>
        <div className={styles.iconWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className={styles.content}>
          <div className={styles.value}>{stats.changesRequested}</div>
          <div className={styles.label}>Changes Requested</div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.comments}`}>
        <div className={styles.iconWrapper}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className={styles.content}>
          <div className={styles.value}>{stats.hasComments}</div>
          <div className={styles.label}>With Comments</div>
        </div>
      </div>
    </div>
  );
}
