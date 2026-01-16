// components/pr/PRRow.tsx
'use client';

import type { PRDTO } from '@application/dto/PRDTO';
import styles from './PRRow.module.css';

interface PRRowProps {
  pr: PRDTO;
  currentUserId?: string;
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

function getActionLabel(action: PRDTO['actionNeeded']): { text: string; style: string } {
  switch (action) {
    case 'review':
      return { text: 'NEEDS YOUR REVIEW', style: 'actionReview' };
    case 'address_feedback':
      return { text: 'ADDRESS FEEDBACK', style: 'actionFeedback' };
    case 'respond_comments':
      return { text: 'RESPOND TO COMMENTS', style: 'actionComments' };
    case 'ready_to_merge':
      return { text: 'READY TO MERGE', style: 'actionReady' };
    case 'waiting':
      return { text: 'WAITING FOR REVIEW', style: 'actionWaiting' };
    default:
      return { text: '', style: '' };
  }
}

function formatReviewers(reviewers: { login: string; isBot: boolean }[]): string {
  if (reviewers.length === 0) return '';

  const names = reviewers.map(r => {
    if (r.isBot) {
      // Shorten bot names
      if (r.login.toLowerCase().includes('coderabbit')) return 'CodeRabbit';
      if (r.login.toLowerCase().includes('copilot')) return 'Copilot';
      return r.login.replace('[bot]', '').trim();
    }
    return r.login;
  });

  if (names.length <= 2) return names.join(', ');
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

function formatCommentBreakdown(bySource?: Record<string, number>): string {
  if (!bySource || Object.keys(bySource).length === 0) return '';

  const parts: string[] = [];
  let humanCount = 0;

  for (const [source, count] of Object.entries(bySource)) {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('coderabbit')) {
      parts.push(`CodeRabbit ${count}`);
    } else if (sourceLower.includes('copilot')) {
      parts.push(`Copilot ${count}`);
    } else if (sourceLower.includes('bot')) {
      parts.push(`Bot ${count}`);
    } else {
      humanCount += count;
    }
  }

  if (humanCount > 0) {
    parts.push(`Human ${humanCount}`);
  }

  return parts.join(', ');
}

export function PRRow({ pr, currentUserId }: PRRowProps) {
  const timeAgo = getTimeAgo(pr.updatedAt);
  const action = getActionLabel(pr.actionNeeded);
  const commentBreakdown = formatCommentBreakdown(pr.comments.bySource);

  const handleClick = () => {
    window.open(pr.url, '_blank', 'noopener,noreferrer');
  };

  // Determine row color based on action needed
  let rowStyle = styles.row;
  if (pr.actionNeeded === 'review' || pr.actionNeeded === 'address_feedback') {
    rowStyle += ` ${styles.needsAction}`;
  } else if (pr.actionNeeded === 'ready_to_merge') {
    rowStyle += ` ${styles.ready}`;
  } else if (pr.status === 'draft') {
    rowStyle += ` ${styles.draft}`;
  }

  return (
    <div
      className={rowStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Priority indicator */}
      <div className={`${styles.indicator} ${pr.actionNeeded === 'review' || pr.actionNeeded === 'address_feedback' ? styles.indicatorRed : pr.actionNeeded === 'ready_to_merge' ? styles.indicatorGreen : ''}`} />

      {/* Main content */}
      <div className={styles.content}>
        {/* Top row: Action + Title */}
        <div className={styles.topRow}>
          {action.text && (
            <span className={`${styles.actionBadge} ${styles[action.style]}`}>
              {action.text}
            </span>
          )}
          <span className={styles.title}>{pr.title}</span>
        </div>

        {/* Middle row: Meta info */}
        <div className={styles.meta}>
          <span className={styles.repo}>{pr.repository.fullName}</span>
          <span className={styles.separator}>#{pr.number}</span>
          <span className={styles.author}>by {pr.author.login}</span>
          <span className={styles.time}>{timeAgo}</span>
        </div>

        {/* Bottom row: Status details */}
        <div className={styles.statusRow}>
          {/* Approvals with names */}
          {pr.reviewStatus.approved > 0 && (
            <span className={styles.approved}>
              Approved by {formatReviewers(pr.reviewStatus.approvedBy)}
            </span>
          )}

          {/* Changes requested with names */}
          {pr.reviewStatus.changesRequested > 0 && (
            <span className={styles.changes}>
              Changes by {formatReviewers(pr.reviewStatus.changesRequestedBy)}
            </span>
          )}

          {/* Pending reviews */}
          {pr.reviewStatus.pending > 0 && (
            <span className={styles.pending}>
              {pr.reviewStatus.pending} pending
            </span>
          )}

          {/* Comments with breakdown */}
          {pr.comments.total > 0 && (
            <span className={styles.comments}>
              {pr.comments.total} comments
              {commentBreakdown && ` (${commentBreakdown})`}
              {pr.comments.unresolved > 0 && (
                <span className={styles.unresolved}> - {pr.comments.unresolved} open</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
