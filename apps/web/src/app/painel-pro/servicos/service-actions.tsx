'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ServiceActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'toggle' | 'delete' | null>(null);

  const toggle = async () => {
    setBusy('toggle');
    try {
      const res = await fetch(`/api/servicos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) throw new Error();
      toast.success(active ? 'Serviço pausado' : 'Serviço ativado');
      router.refresh();
    } catch {
      toast.error('Erro ao alterar status');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm('Excluir este serviço? Esta ação não pode ser desfeita.')) return;
    setBusy('delete');
    try {
      const res = await fetch(`/api/servicos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Serviço excluído');
      router.refresh();
    } catch {
      toast.error('Erro ao excluir');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        disabled={busy !== null}
        className="text-muted-foreground"
      >
        {busy === 'toggle' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Power className="h-4 w-4" />
        )}
        {active ? 'Pausar' : 'Ativar'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={remove}
        disabled={busy !== null}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {busy === 'delete' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Excluir
      </Button>
    </div>
  );
}
