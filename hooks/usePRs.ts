// presentation/web/hooks/usePRs.ts
'use client';

import { useState, useEffect } from 'react';
import type { PRDTO } from '@application/dto/PRDTO';

export function usePRs(userId: string | null) {
  const [prs, setPRs] = useState<PRDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/usePRs.ts:useEffect-triggered',message:'useEffect triggered',data:{userId,hasUserId:!!userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!userId) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/usePRs.ts:userId-null',message:'userId is null - skipping fetch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setPRs([]);
      return;
    }

    const fetchPRs = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('github_token') : null;
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/usePRs.ts:fetch-start',message:'Fetching PRs',data:{userId,hasToken:!!token,tokenLength:token?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/usePRs.ts:auth-header-set',message:'Authorization header set',data:{tokenLength:token.length,headerPrefix:token.substring(0,4)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
        }
        const response = await fetch(`/api/prs?userId=${userId}`, {
          headers,
        });
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/usePRs.ts:response-received',message:'Response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        if (!response.ok) {
          const errorData = await response.json().catch(()=>({}));
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/b1622b6f-a5c6-4d74-992f-0246650411d2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/usePRs.ts:response-error',message:'Response error',data:{status:response.status,errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          throw new Error(`Failed to fetch PRs: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setPRs(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [userId]);

  return { prs, loading, error };
}
