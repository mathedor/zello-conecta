'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Banknote,
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  CalendarRange,
  History,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Map,
  MapPin,
  MessageCircle,
  PieChart,
  Search,
  Shield,
  ShieldAlert,
  Tag,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SidebarIconName =
  | 'Banknote'
  | 'BarChart3'
  | 'Bell'
  | 'Briefcase'
  | 'CalendarDays'
  | 'CalendarRange'
  | 'History'
  | 'Inbox'
  | 'LayoutDashboard'
  | 'LayoutGrid'
  | 'ListChecks'
  | 'Map'
  | 'MapPin'
  | 'MessageCircle'
  | 'PieChart'
  | 'Search'
  | 'Shield'
  | 'ShieldAlert'
  | 'Tag'
  | 'UsersRound'
  | 'Wallet';

const ICONS: Record<SidebarIconName, LucideIcon> = {
  Banknote,
  BarChart3,
  Bell,
  Briefcase,
  CalendarDays,
  CalendarRange,
  History,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Map,
  MapPin,
  MessageCircle,
  PieChart,
  Search,
  Shield,
  ShieldAlert,
  Tag,
  UsersRound,
  Wallet,
};

export interface SidebarItem {
  href: string;
  label: string;
  iconName: SidebarIconName;
  badge?: number | null;
  exact?: boolean;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

export function PanelSidebar({
  sections,
  title,
  subtitle,
}: {
  sections: SidebarSection[];
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  const isActive = (item: SidebarItem) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24">
        <div className="mb-5 px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm font-medium">{subtitle}</p>
          ) : null}
        </div>
        <nav aria-label="Navegação do painel" className="space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title ? (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              ) : null}
              {section.items.map((item) => {
                const active = isActive(item);
                const Icon = ICONS[item.iconName];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-zello-50 text-zello-700'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    {Icon ? (
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active ? 'text-zello-600' : 'text-muted-foreground',
                        )}
                      />
                    ) : null}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function PanelLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="container py-6 md:py-10">
      <div className="flex gap-8">
        {sidebar}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
