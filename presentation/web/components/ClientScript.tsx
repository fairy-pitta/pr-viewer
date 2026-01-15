// presentation/web/components/ClientScript.tsx
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../app/register-sw';

export function ClientScript() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
