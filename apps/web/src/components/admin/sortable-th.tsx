'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SortableTh({
  field,
  label,
  className,
  basePath,
}: {
  field: string;
  label: string;
  className?: string;
  basePath: string;
}) {
  const params = useSearchParams();
  const currentSort = params.get('sort');
  const currentDir = params.get('dir') ?? 'desc';

  const active = currentSort === field;
  const nextDir = active && currentDir === 'desc' ? 'asc' : 'desc';

  const newParams = new URLSearchParams(params.toString());
  newParams.set('sort', field);
  newParams.set('dir', nextDir);

  return (
    <th className={cn('text-left text-xs font-semibold uppercase tracking-wider', className)}>
      <Link
        href={`${basePath}?${newParams.toString()}`}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-2 transition-colors',
          active ? 'text-zello-700' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {label}
        {active ? (
          currentDir === 'desc' ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </Link>
    </th>
  );
}
