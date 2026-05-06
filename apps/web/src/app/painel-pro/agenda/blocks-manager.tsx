'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Block {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

function formatRange(b: Block) {
  const start = new Date(b.startsAt);
  const end = new Date(b.endsAt);
  const sameDay = start.toDateString() === end.toDateString();
  const dateFmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const timeFmt = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (sameDay) {
    return `${dateFmt(start)} · ${timeFmt(start)} – ${timeFmt(end)}`;
  }
  return `${dateFmt(start)} ${timeFmt(start)} – ${dateFmt(end)} ${timeFmt(end)}`;
}

function defaultStartLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 60 - (d.getMinutes() % 60), 0, 0);
  return toLocalInput(d);
}

function defaultEndLocal() {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return toLocalInput(d);
}

function toLocalInput(d: Date) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export function BlocksManager({ initial }: { initial: Block[] }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [startsAt, setStartsAt] = useState(defaultStartLocal());
  const [endsAt, setEndsAt] = useState(defaultEndLocal());
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();

  const create = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/agenda/blocos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
            reason: reason || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? 'Erro');
        const nb: Block = {
          id: data.block.id,
          startsAt: data.block.startsAt,
          endsAt: data.block.endsAt,
          reason: data.block.reason,
        };
        setBlocks((b) => [...b, nb].sort((a, c) => a.startsAt.localeCompare(c.startsAt)));
        setShowForm(false);
        setReason('');
        setStartsAt(defaultStartLocal());
        setEndsAt(defaultEndLocal());
        toast.success('Bloqueio criado');
        router.refresh();
      } catch (err) {
        toast.error('Erro ao criar bloqueio', {
          description: err instanceof Error ? err.message : 'Tente novamente.',
        });
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm('Remover este bloqueio?')) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/agenda/blocos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        setBlocks((b) => b.filter((x) => x.id !== id));
        toast.success('Bloqueio removido');
      } catch {
        toast.error('Erro ao remover');
      }
    });
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-6 text-center">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum bloqueio ativo. Sua agenda recorrente está totalmente disponível.
          </p>
        </div>
      ) : null}

      <ul className="space-y-2">
        {blocks.map((b) => (
          <li
            key={b.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
          >
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-zello-600" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{formatRange(b)}</div>
              {b.reason ? (
                <div className="mt-0.5 truncate text-xs text-muted-foreground">{b.reason}</div>
              ) : null}
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => remove(b.id)}
              disabled={pending}
              aria-label="Remover bloqueio"
              className="text-muted-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {showForm ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="block-start">Início</Label>
              <Input
                id="block-start"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-end">Fim</Label>
              <Input
                id="block-end"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="block-reason">Motivo (opcional)</Label>
              <Input
                id="block-reason"
                placeholder="Ex: férias, compromisso, viagem..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={create} disabled={pending} className="flex-1">
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Adicionar bloqueio
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4" />
          Novo bloqueio
        </Button>
      )}
    </div>
  );
}
