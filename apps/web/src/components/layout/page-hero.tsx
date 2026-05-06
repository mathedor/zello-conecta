import { cn } from '@/lib/utils';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({ eyebrow, title, description, className, children }: PageHeroProps) {
  return (
    <section className={cn('relative overflow-hidden border-b border-border/60', className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-zello-50 via-background to-background"
      />
      <div className="container py-14 md:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wider text-zello-600">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
