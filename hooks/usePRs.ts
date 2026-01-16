// presentation/web/hooks/usePRs.ts
'use client';

import { useState, useCallback } from 'react';
import type { PRDTO } from '@application/dto/PRDTO';

export function usePRs() {
  const [prs, setPRs] = useState<PRDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePRs = useCallback((newPRs: PRDTO[]) => {
    setPRs(newPRs);
  }, []);

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  const setErrorState = useCallback((err: Error | null) => {
    setError(err);
  }, []);

  return { prs, loading, error, updatePRs, setLoadingState, setErrorState };
}
