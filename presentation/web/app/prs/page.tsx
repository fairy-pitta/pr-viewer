// presentation/web/app/prs/page.tsx
'use client';

import { useState } from 'react';
import { usePRs } from '../../hooks/usePRs';
import { useSync } from '../../hooks/useSync';
import { PRList } from '../../components/pr/PRList';
import { FilterSidebar, type FilterState } from '../../components/filters/FilterSidebar';
import styles from './page.module.css';

export default function PRsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const { prs, loading, error } = usePRs(userId);
  const { sync, syncing } = useSync();

  const handleSync = async () => {
    if (userId) {
      await sync(userId);
    }
  };

  const filteredPRs = prs.filter(pr => {
    if (filters.repository && !pr.repository.fullName.includes(filters.repository)) {
      return false;
    }
    if (filters.status && pr.status !== filters.status) {
      return false;
    }
    if (filters.assignee && !pr.assignees.includes(filters.assignee)) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !pr.title.toLowerCase().includes(searchLower) &&
        !pr.repository.fullName.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <FilterSidebar onFilterChange={setFilters} />
      <div className={styles.main}>
        <div className={styles.header}>
          <h1>Pull Requests</h1>
          <div className={styles.actions}>
            <input
              type="text"
              placeholder="GitHub User ID"
              value={userId || ''}
              onChange={(e) => setUserId(e.target.value || null)}
              className={styles.userInput}
            />
            <button
              onClick={handleSync}
              disabled={!userId || syncing}
              className={styles.syncButton}
            >
              {syncing ? '同期中...' : '同期'}
            </button>
          </div>
        </div>
        {loading ? (
          <div className={styles.loading}>読み込み中...</div>
        ) : error ? (
          <div className={styles.error}>エラー: {error.message}</div>
        ) : (
          <PRList prs={filteredPRs} />
        )}
      </div>
    </div>
  );
}
