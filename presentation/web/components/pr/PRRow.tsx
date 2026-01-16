// components/pr/PRRow.tsx
'use client';

import type { PRDTO } from '@application/dto/PRDTO';
import styles from './PRRow.module.css';

interface PRRowProps {
  pr: PRDTO;
  currentUserId?: string;
}

type Priority = 'urgent' | 'action' | 'blocked' | 'good' | 'pending' | 'draft';

function getPriority(pr: PRDTO, currentUserId?: string): Priority {
  if (pr.status === 'draft') return 'draft';
  if (pr.reviewers?.includes(currentUserId || '')) return 'urgent';
  if (pr.reviewStatus.changesRequested > 0) return 'blocked';
  if (pr.comments.unresolved > 0) return 'action';
  if (pr.reviewStatus.approved > 0 && pr.reviewStatus.changesRequested === 0) return 'good';
  return 'pending';
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

function getSourceBadges(bySource?: Record<string, number>): { name: string; count: number; type: string }[] {
  if (!bySource) return [];

  const badges: { name: string; count: number; type: string }[] = [];

  Object.entries(bySource).forEach(([source, count]) => {
    if (count > 0) {
      const sourceLower = source.toLowerCase();
      let type = 'human';
      let name = source;

      if (sourceLower.includes('copilot')) {
        type = 'copilot';
        name = 'Copilot';
      } else if (sourceLower.includes('coderabbit')) {
        type = 'coderabbit';
        name = 'CodeRabbit';
      } else if (sourceLower.includes('bot')) {
        type = 'bot';
        name = 'Bot';
      }

      badges.push({ name, count, type });
    }
  });

  return badges;
}

export function PRRow({ pr, currentUserId }: PRRowProps) {
  const priority = getPriority(pr, currentUserId);
  const timeAgo = getTimeAgo(pr.updatedAt);
  const sourceBadges = getSourceBadges(pr.comments.bySource);

  const handleClick = () => {
    window.open(pr.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`${styles.row} ${styles[priority]}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Priority indicator */}
      <div className={styles.indicator} />

      {/* Main content */}
      <div className={styles.content}>
        {/* Left: Title and meta */}
        <div className={styles.titleSection}>
          <span className={styles.title}>{pr.title}</span>
          <div className={styles.meta}>
            <span className={styles.repo}>{pr.repository.fullName}</span>
            <span className={styles.separator}>#{pr.number}</span>
            <span className={styles.author}>by {pr.author.login}</span>
            <span className={styles.time}>{timeAgo}</span>
          </div>
        </div>

        {/* Right: Status indicators with text labels */}
        <div className={styles.status}>
          {/* Review status with text */}
          {pr.reviewStatus.approved > 0 && (
            <span className={`${styles.badge} ${styles.approved}`}>
              {pr.reviewStatus.approved} approved
            </span>
          )}
          {pr.reviewStatus.changesRequested > 0 && (
            <span className={`${styles.badge} ${styles.changes}`}>
              {pr.reviewStatus.changesRequested} changes
            </span>
          )}
          {pr.reviewStatus.pending > 0 && (
            <span className={`${styles.badge} ${styles.pendingBadge}`}>
              {pr.reviewStatus.pending} pending
            </span>
          )}

          {/* Comments with text */}
          {pr.comments.total > 0 && (
            <span className={`${styles.badge} ${pr.comments.unresolved > 0 ? styles.unresolved : styles.comments}`}>
              {pr.comments.total} comments
              {pr.comments.unresolved > 0 && ` (${pr.comments.unresolved} open)`}
            </span>
          )}

          {/* Source badges */}
          {sourceBadges.map((badge) => (
            <span
              key={badge.name}
              className={`${styles.sourceBadge} ${styles[badge.type]}`}
            >
              {badge.name}: {badge.count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
