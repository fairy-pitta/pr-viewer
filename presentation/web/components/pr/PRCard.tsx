// presentation/web/components/pr/PRCard.tsx
'use client';

import type { PRDTO } from '@application/dto/PRDTO';
import styles from './PRCard.module.css';

interface PRCardProps {
  pr: PRDTO;
  currentUserId?: string;
  onClick?: () => void;
}

type Priority = 'urgent' | 'action' | 'blocked' | 'good' | 'pending' | 'draft';

function getPriority(pr: PRDTO, currentUserId?: string): Priority {
  // Draft PRs
  if (pr.status === 'draft') return 'draft';

  // Check if this PR is waiting for my review (I'm a reviewer)
  if (pr.reviewers?.includes(currentUserId || '')) {
    return 'urgent';
  }

  // Check if my PR has changes requested
  if (pr.reviewStatus.changesRequested > 0) {
    return 'blocked';
  }

  // Check if there are new comments (potential action needed)
  if (pr.comments.unresolved > 0) {
    return 'action';
  }

  // Approved and ready
  if (pr.reviewStatus.approved > 0 && pr.reviewStatus.changesRequested === 0) {
    return 'good';
  }

  // Default: pending review
  return 'pending';
}

function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'urgent': return 'Review Requested';
    case 'action': return 'Has Comments';
    case 'blocked': return 'Changes Requested';
    case 'good': return 'Approved';
    case 'draft': return 'Draft';
    case 'pending': return 'Pending Review';
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

function getSourceBadges(bySource?: Record<string, number>): { name: string; count: number; type: string }[] {
  if (!bySource) return [];

  const badges: { name: string; count: number; type: string }[] = [];

  Object.entries(bySource).forEach(([source, count]) => {
    if (count > 0) {
      const sourceLower = source.toLowerCase();
      let type = 'reviewer';
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

export function PRCard({ pr, currentUserId, onClick }: PRCardProps) {
  const priority = getPriority(pr, currentUserId);
  const priorityLabel = getPriorityLabel(priority);
  const timeAgo = getTimeAgo(pr.updatedAt);
  const sourceBadges = getSourceBadges(pr.comments.bySource);

  return (
    <article
      className={`${styles.card} ${styles[priority]}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Priority indicator strip */}
      <div className={styles.priorityStrip} />

      <div className={styles.content}>
        {/* Header row */}
        <div className={styles.header}>
          <div className={styles.repoInfo}>
            <span className={styles.repo}>{pr.repository.fullName}</span>
            <span className={styles.prNumber}>#{pr.number}</span>
          </div>
          <div className={styles.priorityBadge}>
            <span className={styles.priorityDot} />
            {priorityLabel}
          </div>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{pr.title}</h3>

        {/* Meta row */}
        <div className={styles.meta}>
          {/* Author */}
          <div className={styles.author}>
            {pr.author.avatarUrl ? (
              <img
                src={pr.author.avatarUrl}
                alt={pr.author.login}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {pr.author.login.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={styles.authorName}>{pr.author.login}</span>
          </div>

          {/* Time */}
          <span className={styles.time}>{timeAgo}</span>
        </div>

        {/* Stats row */}
        <div className={styles.stats}>
          {/* Review status indicators */}
          <div className={styles.reviewStats}>
            {pr.reviewStatus.approved > 0 && (
              <div className={`${styles.stat} ${styles.approved}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{pr.reviewStatus.approved}</span>
              </div>
            )}
            {pr.reviewStatus.changesRequested > 0 && (
              <div className={`${styles.stat} ${styles.changes}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{pr.reviewStatus.changesRequested}</span>
              </div>
            )}
            {pr.reviewStatus.pending > 0 && (
              <div className={`${styles.stat} ${styles.pendingStat}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{pr.reviewStatus.pending}</span>
              </div>
            )}
          </div>

          {/* Comments */}
          {pr.comments.total > 0 && (
            <div className={styles.comments}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{pr.comments.total}</span>
              {pr.comments.unresolved > 0 && (
                <span className={styles.unresolved}>({pr.comments.unresolved} unresolved)</span>
              )}
            </div>
          )}
        </div>

        {/* Source badges */}
        {sourceBadges.length > 0 && (
          <div className={styles.sources}>
            {sourceBadges.map((badge) => (
              <span
                key={badge.name}
                className={`${styles.sourceBadge} ${styles[badge.type]}`}
              >
                {badge.name}
                <span className={styles.badgeCount}>{badge.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover arrow */}
      <div className={styles.arrow}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </article>
  );
}
