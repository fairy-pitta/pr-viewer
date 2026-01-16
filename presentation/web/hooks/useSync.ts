// presentation/web/hooks/useSync.ts
'use client';

import { useState } from 'react';
import type { PRDTO } from '@application/dto/PRDTO';

interface SyncResult {
  success: boolean;
  prs: PRDTO[];
  cached?: boolean;
  syncedAt?: string;
}

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Register user for periodic sync (Cloudflare KV)
  const registerForSync = async (userId: string) => {
    try {
      await fetch('/api/prs/cached', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Silently fail - not critical
    }
  };

  // Try to get from cache first
  const getFromCache = async (userId: string): Promise<SyncResult | null> => {
    try {
      const response = await fetch(`/api/prs/cached?userId=${encodeURIComponent(userId)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.cached && data.prs?.length > 0) {
          return data;
        }
      }
    } catch {
      // Cache not available, continue to live sync
    }
    return null;
  };

  const sync = async (userId: string, forceRefresh = false): Promise<SyncResult> => {
    setSyncing(true);
    setError(null);

    try {
      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await getFromCache(userId);
        if (cached) {
          // Register for periodic sync in background
          registerForSync(userId);
          setSyncing(false);
          return cached;
        }
      }

      // Live sync from GitHub
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

      // Register for periodic sync after successful live sync
      registerForSync(userId);

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
