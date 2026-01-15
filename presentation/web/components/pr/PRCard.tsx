// presentation/web/components/pr/PRCard.tsx
'use client';

import type { PRDTO } from '@application/dto/PRDTO';
import styles from './PRCard.module.css';

interface PRCardProps {
  pr: PRDTO;
  onClick?: () => void;
}

export function PRCard({ pr, onClick }: PRCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.title}>{pr.title}</h3>
        <span className={styles.status}>{pr.status}</span>
      </div>
      <div className={styles.meta}>
        <span className={styles.repository}>{pr.repository.fullName}</span>
        <span className={styles.number}>#{pr.number}</span>
      </div>
      <div className={styles.stats}>
        <span>承認: {pr.reviewStatus.approved}</span>
        <span>変更要求: {pr.reviewStatus.changesRequested}</span>
        <span>コメント: {pr.comments.total}</span>
      </div>
    </div>
  );
}
