'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-9 w-24 animate-pulse rounded-lg bg-secondary" aria-hidden />
    );
  }

  if (!data?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className={compact ? '' : 'hidden sm:inline-flex'}>
          <Link href="/entrar">Entrar</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/cadastro">Começar</Link>
        </Button>
      </div>
    );
  }

  const role = data.user.role;
  const dashHref = role === 'ADMIN' ? '/admin' : role === 'PROFESSIONAL' ? '/painel-pro' : '/painel';
  const initials =
    data.user.name
      ?.split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'U';

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link href={dashHref}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zello-600 text-xs font-semibold text-white">
            {initials}
          </span>
          <span className="hidden text-sm font-medium md:inline">
            {data.user.name?.split(' ')[0]}
          </span>
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sair"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
