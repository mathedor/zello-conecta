import { cn } from '@/lib/utils';

export function LegalProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose prose-zinc mx-auto max-w-3xl',
        '[&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-foreground first:[&>h2]:mt-0',
        '[&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-foreground',
        '[&>p]:my-4 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-muted-foreground',
        '[&>ul]:my-4 [&>ul]:space-y-2 [&>ul]:pl-6 [&>ul]:list-disc [&>ul]:text-muted-foreground',
        '[&>ol]:my-4 [&>ol]:space-y-2 [&>ol]:pl-6 [&>ol]:list-decimal [&>ol]:text-muted-foreground',
        '[&>li]:leading-relaxed',
        '[&_strong]:text-foreground [&_strong]:font-semibold',
        '[&_a]:text-zello-600 [&_a]:underline-offset-4 hover:[&_a]:underline',
        className,
      )}
    >
      {children}
    </div>
  );
}
