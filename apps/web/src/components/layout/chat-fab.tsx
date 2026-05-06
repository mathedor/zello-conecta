'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const POLL_MS = 30_000;

export function ChatFab() {
  const { status } = useSession();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/conversas', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { conversations: { unread: number }[] };
        if (cancelled) return;
        const total = data.conversations.reduce((acc, c) => acc + (c.unread ?? 0), 0);
        setUnread(total);
      } catch {
        // ignore
      }
    };
    fetchUnread();
    const id = window.setInterval(fetchUnread, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [status]);

  if (status !== 'authenticated') return null;
  if (pathname.startsWith('/mensagens')) return null;

  return (
    <Link
      href="/mensagens"
      aria-label={`Mensagens${unread ? ` (${unread} não lidas)` : ''}`}
      className={cn(
        'fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-zello-600 text-white shadow-xl shadow-zello-600/30 transition-transform hover:scale-105 active:scale-95',
        'bottom-24 sm:bottom-6',
      )}
    >
      <MessageCircle className="h-6 w-6" />
      {unread > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white ring-2 ring-background">
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
