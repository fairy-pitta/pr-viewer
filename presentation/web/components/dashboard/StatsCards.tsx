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
    open: prs.filter(p => p.status === 'open').length,
    draft: prs.filter(p => p.status === 'draft').length,
    merged: prs.filter(p => p.status === 'merged').length,
    needsReview: prs.filter(p => p.reviewStatus.pending > 0).length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.value}>{stats.total}</div>
        <div className={styles.label}>合計</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{stats.open}</div>
        <div className={styles.label}>Open</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{stats.draft}</div>
        <div className={styles.label}>Draft</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{stats.merged}</div>
        <div className={styles.label}>Merged</div>
      </div>
      <div className={styles.card}>
        <div className={styles.value}>{stats.needsReview}</div>
        <div className={styles.label}>レビュー待ち</div>
      </div>
    </div>
  );
}
