'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Logo } from './logo';
import { UserMenu } from './user-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const SECONDARY_LINKS = [
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

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <UserMenu />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="sm:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm pt-12">
              <div className="flex flex-col gap-6">
                <Logo size="md" />
                <div className="flex flex-col gap-3">
                  <SheetClose asChild>
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link href="/entrar">Entrar</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild size="lg" className="w-full">
                      <Link href="/cadastro">Cadastre-se grátis</Link>
                    </Button>
                  </SheetClose>
                </div>
                <nav
                  aria-label="Secundário"
                  className="flex flex-col gap-1 border-t border-border pt-4"
                >
                  {SECONDARY_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
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
