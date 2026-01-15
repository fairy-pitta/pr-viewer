// presentation/web/hooks/useSync.ts
'use client';

import { useState } from 'react';

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sync = async (userId: string, force?: boolean) => {
    setSyncing(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('github_token') : null;
      // #region agent log
      typeof window !== 'undefined' && fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'presentation/web/hooks/useSync.ts:sync-start',message:'Starting sync',data:{userId,hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/prs/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, force }),
      });
      // #region agent log
      typeof window !== 'undefined' && fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'presentation/web/hooks/useSync.ts:sync-response',message:'Sync response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      if (!response.ok) {
        const errorData = await response.json().catch(()=>({}));
        // #region agent log
        typeof window !== 'undefined' && fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'presentation/web/hooks/useSync.ts:sync-error',message:'Sync error',data:{status:response.status,errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        throw new Error(`Failed to sync PRs: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // #region agent log
      typeof window !== 'undefined' && fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'presentation/web/hooks/useSync.ts:sync-success',message:'Sync completed',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return result;
    } catch (err) {
      // #region agent log
      typeof window !== 'undefined' && fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'presentation/web/hooks/useSync.ts:sync-catch',message:'Sync catch error',data:{error:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return { sync, syncing, error };
}
