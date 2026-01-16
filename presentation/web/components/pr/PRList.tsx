// presentation/web/components/pr/PRList.tsx
'use client';

import type { PRDTO } from '@application/dto/PRDTO';
import { PRCard } from './PRCard';
import styles from './PRList.module.css';

interface PRListProps {
  prs: PRDTO[];
  currentUserId?: string;
  onPRClick?: (pr: PRDTO) => void;
}

export function PRList({ prs, currentUserId, onPRClick }: PRListProps) {
  const handlePRClick = (pr: PRDTO) => {
    // Open PR in new tab
    window.open(pr.url, '_blank', 'noopener,noreferrer');
    onPRClick?.(pr);
  };

  return (
    <div className={styles.list}>
      {prs.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No Pull Requests</h3>
          <p className={styles.emptyText}>
            Click sync to fetch your pull requests from GitHub
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {prs.map((pr, index) => (
            <div
              key={pr.id}
              className={styles.cardWrapper}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <PRCard
                pr={pr}
                currentUserId={currentUserId}
                onClick={() => handlePRClick(pr)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
