// presentation/web/hooks/usePRs.ts
'use client';

import { useState, useEffect } from 'react';
import type { PRDTO } from '../../../application/dto/PRDTO';

export function usePRs(userId: string | null) {
  const [prs, setPRs] = useState<PRDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const fetchPRs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/prs?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch PRs');
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
