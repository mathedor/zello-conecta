import Link from 'next/link';
import { Logo } from '@/components/layout/logo';

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="container flex min-h-[calc(100vh-4rem)] items-start justify-center py-10 md:items-center md:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center md:hidden">
          <Logo size="md" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
        {footer ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        ) : null}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com os{' '}
          <Link href="/termos" className="hover:text-foreground hover:underline">
            Termos
          </Link>{' '}
          e a{' '}
          <Link href="/privacidade" className="hover:text-foreground hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
