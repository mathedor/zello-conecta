'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function MarkAllReadButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Todas marcadas como lidas');
      router.refresh();
    } catch {
      toast.error('Erro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button onClick={handle} disabled={busy} size="sm" variant="outline">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
      Marcar todas como lidas
    </Button>
  );
}
