// prs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePRs } from '@/hooks/usePRs';
import { useSync } from '@/hooks/useSync';
import { PRList } from '@/components/pr/PRList';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { FilterSidebar, type FilterState } from '@/components/filters/FilterSidebar';
import styles from './page.module.css';

export default function PRsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  // #region agent log
  typeof window !== 'undefined' && fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/prs/page.tsx:usePRs-call',message:'Calling usePRs hook',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const { prs, loading, error } = usePRs(userId);
  const { sync, syncing } = useSync();

  useEffect(() => {
    // セッションストレージからトークンとユーザー情報を取得
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('github_token');
      const userStr = sessionStorage.getItem('github_user');
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/prs/page.tsx:session-check',message:'Checking session storage',data:{hasToken:!!token,tokenLength:token?.length||0,hasUserStr:!!userStr,userStr:userStr},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/prs/page.tsx:before-setUserId',message:'About to set userId',data:{userId:user.login,currentUserId:userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          setUserId(user.login);
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/prs/page.tsx:user-set',message:'User ID set from session',data:{userId:user.login},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } catch (e) {
          // パースエラーは無視
        }
      }
      
      // トークンがない場合はログインページにリダイレクト
      if (!token) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/prs/page.tsx:no-token-redirect',message:'No token found - redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        router.push('/login');
      }
    }
  }, [router]);

  const handleSync = async () => {
    if (userId) {
      await sync(userId);
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

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link href="/" className={styles.logo}>
            PR Viewer
          </Link>
          <div className={styles.navActions}>
            {userId && (
              <span className={styles.userInfo}>@{userId}</span>
            )}
            <button onClick={handleLogout} className={styles.logoutButton}>
              ログアウト
            </button>
          </div>
        </div>
      </nav>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterSidebar onFilterChange={setFilters} />
        </aside>

        <main className={styles.main}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Pull Requests</h1>
              {userId && (
                <p className={styles.subtitle}>
                  {filteredPRs.length}件のPRが見つかりました
                </p>
              )}
            </div>
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
                {syncing ? (
                  <>
                    <span className={styles.spinner}></span>
                    同期中...
                  </>
                ) : (
                  <>
                    🔄 同期
                  </>
                )}
              </button>
            </div>
          </div>

          {userId && prs.length > 0 && (
            <div className={styles.statsSection}>
              <StatsCards prs={filteredPRs} />
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <p>読み込み中...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <div className={styles.errorIcon}>⚠️</div>
              <div>
                <h3>エラーが発生しました</h3>
                <p>{error.message}</p>
              </div>
            </div>
          ) : filteredPRs.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>PRが見つかりません</h3>
              <p>GitHub User IDを入力して同期してください</p>
            </div>
          ) : (
            <PRList prs={filteredPRs} />
          )}
        </main>
      </div>
    </div>
  );
}
