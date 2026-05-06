'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  bookingId: string | null;
  readAt: string | null;
  createdAt: string;
}

const POLL_MS = 60_000;

export function NotificationsBell({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=15', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { items: NotificationItem[]; unreadCount: number };
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchNotifs();
    const id = window.setInterval(fetchNotifs, POLL_MS);
    return () => window.clearInterval(id);
  }, [status, fetchNotifs]);

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (!res.ok) throw new Error();
      setUnreadCount(0);
      setItems((prev) => prev.map((it) => ({ ...it, readAt: it.readAt ?? new Date().toISOString() })));
      toast.success('Tudo marcado como lido');
    } catch {
      toast.error('Erro ao marcar como lido');
    }
  };

  const markOne = async (id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, readAt: new Date().toISOString() } : it)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch {
      // ignore
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) fetchNotifs();
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            compact ? 'h-9 w-9' : 'h-10 w-10',
            'text-muted-foreground hover:text-foreground',
          )}
          aria-label={`Notificações${unreadCount ? ` (${unreadCount} não lidas)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto pt-12">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <h2 className="text-lg font-semibold">Notificações</h2>
          {unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Marcar todas
            </Button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          {loading && items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <BellOff className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação ainda.</p>
            </div>
          ) : (
            items.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => !it.readAt && markOne(it.id)}
                className={cn(
                  'block w-full rounded-xl border border-border p-4 text-left transition-colors',
                  it.readAt
                    ? 'bg-card text-foreground hover:bg-secondary'
                    : 'border-zello-200 bg-zello-50/50 hover:bg-zello-50',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', !it.readAt && 'font-semibold')}>{it.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{it.body}</p>
                  </div>
                  {!it.readAt ? (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zello-600" />
                  ) : null}
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {new Date(it.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <SheetClose asChild>
            <Link
              href="/painel/notificacoes"
              className="text-sm font-medium text-zello-600 hover:underline"
            >
              Ver todas as notificações →
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
