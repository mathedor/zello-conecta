'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, LayoutGrid, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/buscar', label: 'Busca', icon: Search },
  { href: '/categorias', label: 'Categorias', icon: LayoutGrid },
  { href: '/cadastro/profissional', label: 'Profissionais', icon: Briefcase },
];

export function DesktopNavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
      {NAV_LINKS.map((link) => {
        const active =
          pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-zello-50 text-zello-700'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
