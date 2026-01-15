// presentation/web/components/ClientScript.tsx
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@presentation/web/app/register-sw';

export function ClientScript() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
