import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  href?: string | null;
}

const sizes = {
  sm: { mark: 32, wordmark: 'text-base' },
  md: { mark: 40, wordmark: 'text-xl' },
  lg: { mark: 56, wordmark: 'text-3xl' },
};

export function Logo({
  className,
  showWordmark = true,
  size = 'md',
  variant = 'dark',
  href = '/',
}: LogoProps) {
  const { mark, wordmark } = sizes[size];

  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className="overflow-hidden rounded-[20%] shadow-sm"
        style={{ width: mark, height: mark }}
      >
        <Image
          src="/zello-logo.png"
          alt="Zello Conecta"
          width={mark * 2}
          height={mark * 2}
          priority
          className="h-full w-full object-cover"
        />
      </div>
      {showWordmark ? (
        <span
          className={cn(
            'font-semibold tracking-tight',
            wordmark,
            variant === 'light' ? 'text-white' : 'text-foreground',
          )}
        >
          Zello <span className="font-medium opacity-80">Conecta</span>
        </span>
      ) : null}
    </div>
  );

  if (href === null) return content;

  return (
    <Link href={href} aria-label="Zello Conecta — voltar à home">
      {content}
    </Link>
  );
}
