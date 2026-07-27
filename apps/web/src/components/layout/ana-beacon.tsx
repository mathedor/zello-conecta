'use client';

import { useEffect } from 'react';

/** Beacon da Ana — conta acessos do dia (só páginas públicas; admin/painéis ficam de fora). */
const PRIVATE_PREFIXES = ['/admin', '/painel', '/painel-pro'];

export function AnaBeacon() {
  useEffect(() => {
    try {
      const path = window.location.pathname;
      if (PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return;
      navigator.sendBeacon?.('https://www.ana.show/api/b/zello');
    } catch {
      /* nunca quebrar a página por causa do beacon */
    }
  }, []);
  return null;
}
