import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="text-[clamp(5rem,18vw,9rem)] font-bold leading-none tracking-tighter text-zello-600">
        404
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        O link pode estar quebrado ou a página foi removida. Volta para a home ou usa a busca.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar à home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/buscar">
            <Search className="h-4 w-4" />
            Buscar profissionais
          </Link>
        </Button>
      </div>
    </main>
  );
}
