'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin-error]', error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-destructive">Erro no painel admin</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Algo deu errado ao carregar esta página. Detalhes técnicos abaixo (envie para o
        desenvolvedor).
      </p>
      <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-card p-4 text-xs">
        <strong>{error.name}: {error.message}</strong>
        {error.digest ? `\n\nDigest: ${error.digest}` : ''}
        {error.stack ? `\n\nStack:\n${error.stack}` : ''}
      </pre>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => reset()}>Tentar novamente</Button>
      </div>
    </div>
  );
}
