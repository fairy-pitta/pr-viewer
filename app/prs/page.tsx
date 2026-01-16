// prs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePRs } from '@/hooks/usePRs';
import { useSync } from '@/hooks/useSync';
import { PRRow } from '@/components/pr/PRRow';
import { FilterSidebar, type FilterState } from '@/components/filters/FilterSidebar';
import styles from './page.module.css';

export default function PRsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [syncError, setSyncError] = useState<string | null>(null);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { prs, loading, updatePRs, setLoadingState, setErrorState, error } = usePRs();
  const { sync, syncing } = useSync();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('github_token');
      const userStr = sessionStorage.getItem('github_user');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserId(user.login);
        } catch (e) {
          // ignore
        }
      }

      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    if (userId && !initialSyncDone && !syncing) {
      setInitialSyncDone(true);
      handleSync();
    }
  }, [userId, initialSyncDone, syncing]);

  const handleSync = async () => {
    if (!userId) return;

    setSyncError(null);
    setLoadingState(true);
    setErrorState(null);

    try {
      const result = await sync(userId);
      if (result.prs) {
        updatePRs(result.prs);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSyncError(msg);
      setErrorState(e instanceof Error ? e : new Error(msg));
    } finally {
      setLoadingState(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('github_token');
      sessionStorage.removeItem('github_user');
      router.push('/login');
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

  const hasFilters = Object.values(filters).some(v => v);

  // Stats calculation
  const stats = {
    total: filteredPRs.length,
    needsReview: filteredPRs.filter(pr => pr.reviewers?.includes(userId || '')).length,
    approved: filteredPRs.filter(pr => pr.reviewStatus.approved > 0 && pr.reviewStatus.changesRequested === 0).length,
    changesRequested: filteredPRs.filter(pr => pr.reviewStatus.changesRequested > 0).length,
  };

  return (
    <div className={styles.container}>
      {/* Header with everything */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.filterToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle filters"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {hasFilters && <span className={styles.filterDot} />}
          </button>
          <h1 className={styles.logo}>PR Viewer</h1>
          <span className={styles.prCount}>{filteredPRs.length} PRs</span>
        </div>

        <div className={styles.headerRight}>
          <button
            onClick={handleSync}
            disabled={!userId || syncing}
            className={styles.syncButton}
          >
            {syncing ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            )}
            Sync
          </button>
          {userId && <span className={styles.userInfo}>@{userId}</span>}
          <button onClick={handleLogout} className={styles.logoutButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className={styles.layout}>
        {/* Collapsible sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarContent}>
            <FilterSidebar onFilterChange={setFilters} />
          </div>
          <button
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </aside>

        {/* Overlay when sidebar is open */}
        {sidebarOpen && (
          <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        )}

        {/* PR List */}
        <main className={styles.main}>
          {loading || syncing ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner} />
              <span>Loading PRs...</span>
            </div>
          ) : syncError || error ? (
            <div className={styles.error}>
              <span className={styles.errorIcon}>!</span>
              <span>{syncError || error?.message}</span>
            </div>
          ) : filteredPRs.length === 0 ? (
            <div className={styles.empty}>
              <span>No PRs found</span>
            </div>
          ) : (
            <div className={styles.prList}>
              {filteredPRs.map((pr) => (
                <PRRow key={pr.id} pr={pr} currentUserId={userId || undefined} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mini stats footer */}
      {prs.length > 0 && (
        <footer className={styles.footer}>
          <div className={styles.stat}>
            <span className={styles.statDot} data-type="review" />
            <span>{stats.needsReview} needs review</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statDot} data-type="approved" />
            <span>{stats.approved} approved</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statDot} data-type="changes" />
            <span>{stats.changesRequested} changes requested</span>
          </div>
        </footer>
      )}
    </div>
  );
}
