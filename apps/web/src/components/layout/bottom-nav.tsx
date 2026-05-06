'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ArrowRight,
  CalendarDays,
  HelpCircle,
  Home,
  LayoutGrid,
  ListChecks,
  LogOut,
  Mail,
  Menu as MenuIcon,
  Newspaper,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  central?: boolean;
}

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const accountHref = session?.user
    ? session.user.role === 'ADMIN'
      ? '/admin'
      : session.user.role === 'PROFESSIONAL'
        ? '/painel-pro'
        : '/painel'
    : '/entrar';

  const myAgendaHref = session?.user
    ? session.user.role === 'PROFESSIONAL'
      ? '/painel-pro/agenda'
      : '/painel/agendamentos'
    : '/entrar?next=/painel/agendamentos';

  const items: NavItem[] = [
    { label: 'Agenda', href: myAgendaHref, icon: CalendarDays },
    { label: 'Categorias', href: '/buscar', icon: LayoutGrid },
    { label: 'Buscar', href: '/buscar', icon: Search, central: true },
    { label: 'Minha conta', href: accountHref, icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1.5 pb-1">
          {items.slice(0, 2).map((item) => (
            <NavLink key={item.label} item={item} active={isActive(item.href)} />
          ))}
          <li className="-mt-6 flex justify-center">
            <Link
              href={items[2]!.href}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full bg-zello-600 text-white shadow-lg shadow-zello-600/30 ring-4 ring-background transition-transform hover:scale-105',
              )}
              aria-label="Buscar"
            >
              <Search className="h-6 w-6" />
            </Link>
          </li>
          {items.slice(3).map((item) => (
            <NavLink key={item.label} item={item} active={isActive(item.href)} />
          ))}
          <li>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors',
                    'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <MenuIcon className="h-5 w-5" />
                  <span className="text-[10px] font-medium leading-none">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-0 pb-8 pt-8"
              >
                <MenuContent
                  isLogged={!!session?.user}
                  role={session?.user?.role}
                  name={session?.user?.name ?? null}
                />
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors',
          active ? 'text-zello-600' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-none">{item.label}</span>
      </Link>
    </li>
  );
}

const SECONDARY_LINKS = [
  { label: 'Como funciona', href: '/como-funciona', icon: HelpCircle },
  { label: 'Quem somos', href: '/quem-somos', icon: Sparkles },
  { label: 'Tutoriais', href: '/tutoriais', icon: Newspaper },
  { label: 'Contato', href: '/contato', icon: Mail },
  { label: 'Segurança', href: '/seguranca', icon: Shield },
];

function MenuContent({
  isLogged,
  role,
  name,
}: {
  isLogged: boolean;
  role?: string;
  name: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Logo size="md" />
      </div>

      {isLogged ? (
        <div className="rounded-2xl bg-zello-50 p-4">
          <p className="text-xs text-muted-foreground">Conectado como</p>
          <p className="mt-0.5 font-semibold">{name}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {role === 'PROFESSIONAL' || role === 'ADMIN' ? (
              <>
                <SheetClose asChild>
                  <Link
                    href="/painel-pro"
                    className="rounded-lg bg-card px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
                  >
                    Painel pro
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/painel-pro/financeiro"
                    className="rounded-lg bg-card px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
                  >
                    Financeiro
                  </Link>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Link
                    href="/painel"
                    className="rounded-lg bg-card px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
                  >
                    Meu painel
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/painel/agendamentos"
                    className="rounded-lg bg-card px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
                  >
                    Agendamentos
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SheetClose asChild>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/entrar">Entrar</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button asChild size="lg" className="w-full">
              <Link href="/cadastro">Cadastrar</Link>
            </Button>
          </SheetClose>
        </div>
      )}

      <div className="space-y-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Profissionais
        </p>
        <SheetClose asChild>
          <Link
            href="/cadastro/profissional"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary"
          >
            <Wallet className="h-4 w-4 text-zello-600" />
            Quero oferecer serviços
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Link>
        </SheetClose>
        {(role === 'PROFESSIONAL' || role === 'ADMIN') && isLogged ? (
          <>
            <SheetClose asChild>
              <Link
                href="/painel-pro/servicos"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary"
              >
                <ListChecks className="h-4 w-4 text-zello-600" />
                Meus serviços
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/painel-pro/agenda"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary"
              >
                <CalendarDays className="h-4 w-4 text-zello-600" />
                Minha agenda
              </Link>
            </SheetClose>
          </>
        ) : null}
      </div>

      <div className="space-y-1">
        <p className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sobre a plataforma
        </p>
        {SECONDARY_LINKS.map((l) => (
          <SheetClose asChild key={l.href}>
            <Link
              href={l.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-secondary"
            >
              <l.icon className="h-4 w-4 text-muted-foreground" />
              {l.label}
            </Link>
          </SheetClose>
        ))}
      </div>

      {role === 'ADMIN' ? (
        <SheetClose asChild>
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl bg-zello-50 px-3 py-3 text-sm font-medium text-zello-700 hover:bg-zello-100"
          >
            <Settings className="h-4 w-4" />
            Painel admin
          </Link>
        </SheetClose>
      ) : null}

      {isLogged ? (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      ) : null}

      <p className="pt-4 text-center text-xs text-muted-foreground">
        Em breve nas lojas iOS e Android
      </p>
    </div>
  );
}
