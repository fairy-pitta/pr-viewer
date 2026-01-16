// presentation/web/hooks/useSync.ts
'use client';

import { useState } from 'react';
import type { PRDTO } from '@application/dto/PRDTO';

interface SyncResult {
  success: boolean;
  prs: PRDTO[];
}

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sync = async (userId: string): Promise<SyncResult> => {
    setSyncing(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('github_token') : null;
      const response = await fetch('/api/prs/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `Failed to sync PRs: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return { sync, syncing, error };
}
