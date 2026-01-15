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
        const response = await fetch('/api/prs/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
          body: JSON.stringify({ userId, force }),
        });

      if (!response.ok) {
        throw new Error('Failed to sync PRs');
      }

      return await response.json();
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
