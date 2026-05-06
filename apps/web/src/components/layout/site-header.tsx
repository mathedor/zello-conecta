'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/quem-somos', label: 'Quem somos' },
  { href: '/tutoriais', label: 'Tutoriais' },
  { href: '/contato', label: 'Contato' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        scrolled
          ? 'border-b border-border/40 bg-background/85 backdrop-blur-md shadow-sm'
          : 'bg-background',
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo size="sm" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/cadastro">Começar</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm pt-12">
              <div className="flex flex-col gap-6">
                <Logo size="md" />
                <nav className="flex flex-col gap-1" aria-label="Mobile">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'flex items-center rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                          pathname === link.href
                            ? 'bg-zello-50 text-zello-700'
                            : 'hover:bg-secondary',
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-2 flex flex-col gap-3 border-t border-border pt-6">
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/entrar">Entrar</Link>
                  </Button>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/cadastro">Cadastre-se grátis</Link>
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Em breve nas lojas iOS e Android
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
