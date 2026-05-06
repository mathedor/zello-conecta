'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { Logo } from './logo';
import { LocationPill } from './location-pill';
import { UserMenu } from './user-menu';
import { DesktopNavLinks } from './desktop-nav-links';
import { NotificationsBell } from './notifications-bell';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        scrolled
          ? 'border-b border-border/40 bg-background/85 backdrop-blur-md shadow-sm'
          : 'bg-background',
      )}
    >
      <div className="container flex h-14 items-center gap-3 sm:h-20">
        <div className="flex items-center gap-3">
          <Logo size="sm" showWordmark={false} className="sm:hidden" />
          <div className="hidden sm:block">
            <Logo size="sm" />
          </div>
          <div className="hidden sm:block">
            <LocationPill />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center sm:hidden">
          <LocationPill />
        </div>

        <div className="hidden flex-1 justify-center sm:flex">
          <DesktopNavLinks />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <NotificationsBell />
          <UserMenu />
        </div>

        <MobileAuthButtons />
      </div>
    </header>
  );
}

function MobileAuthButtons() {
  const { data, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-1 sm:hidden">
        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
      </div>
    );
  }

  if (data?.user) {
    const initials =
      data.user.name
        ?.split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? 'U';
    return (
      <div className="flex items-center gap-1 sm:hidden">
        <NotificationsBell compact />
        <Link
          href={
            data.user.role === 'ADMIN'
              ? '/admin'
              : data.user.role === 'PROFESSIONAL'
                ? '/painel-pro'
                : '/painel'
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zello-600 text-xs font-semibold text-white"
          aria-label="Meu painel"
        >
          {initials}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sair"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="h-9 w-9 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:hidden">
      <Link
        href="/entrar"
        aria-label="Entrar"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
      >
        <LogIn className="h-4 w-4" />
      </Link>
      <Link
        href="/cadastro"
        aria-label="Registre-se"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-zello-600 text-white shadow-sm transition-colors hover:bg-zello-700"
      >
        <UserPlus className="h-4 w-4" />
      </Link>
    </div>
  );
}
