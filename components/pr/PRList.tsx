// presentation/web/components/pr/PRList.tsx
'use client';

import type { PRDTO } from '../../../../application/dto/PRDTO';
import { PRCard } from './PRCard';
import styles from './PRList.module.css';

interface PRListProps {
  prs: PRDTO[];
  onPRClick?: (pr: PRDTO) => void;
}

export function PRList({ prs, onPRClick }: PRListProps) {
  return (
    <div className={styles.list}>
      {prs.length === 0 ? (
        <div className={styles.empty}>PRが見つかりません</div>
      ) : (
        prs.map((pr) => (
          <PRCard
            key={pr.id}
            pr={pr}
            onClick={() => onPRClick?.(pr)}
          />
        ))
      )}
    </div>
  );
}
