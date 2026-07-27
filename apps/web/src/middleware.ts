import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth: edgeAuth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ['/painel', '/painel-pro', '/admin', '/checkout', '/mensagens', '/notificacoes'];
const PRO_PREFIXES = ['/painel-pro'];
const ADMIN_PREFIXES = ['/admin'];

// ── Trava EM MANUTENÇÃO (controlada pela Ana — www.ana.show) ─────────────────
// Fail-open: qualquer erro/timeout na Ana → site segue no ar normal.
// Cache local de 15s por instância; timeout de 800ms na consulta.
const manut = { t: 0, m: false };
async function emManutencao(): Promise<boolean> {
  const agora = Date.now();
  if (agora - manut.t < 15000) return manut.m;
  manut.t = agora; // marca antes: erro não martela a Ana
  try {
    const r = await fetch('https://www.ana.show/api/manutencao/zello', {
      signal: AbortSignal.timeout(800),
    });
    manut.m = r.ok && (await r.json()).m === true;
  } catch {
    manut.m = false;
  }
  return manut.m;
}

const authMiddleware = edgeAuth((req) => {
  const { pathname } = req.nextUrl;

  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL('/entrar', req.url);
    loginUrl.searchParams.set('next', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const role = (session.user as { role?: string }).role;

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/painel', req.url));
  }

  if (
    PRO_PREFIXES.some((p) => pathname.startsWith(p)) &&
    role !== 'PROFESSIONAL' &&
    role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/painel', req.url));
  }

  return NextResponse.next();
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const { pathname } = req.nextUrl;

  // Página de manutenção acessada direto → HTML estático (sem banco/env).
  if (pathname === '/manutencao') {
    return NextResponse.rewrite(new URL('/manutencao.html', req.url));
  }

  // NUNCA bloquear: pulso da Ana, webhooks de pagamento (Efí — perde
  // confirmação de pagamento!), crons internos, assets e arquivos estáticos.
  const passa =
    pathname.startsWith('/api/ana') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/_next') ||
    /\.[a-z0-9]+$/i.test(pathname);

  if (!passa && (await emManutencao())) {
    return NextResponse.rewrite(new URL('/manutencao.html', req.url));
  }

  // Auth continua exatamente como antes: só roda nos prefixos protegidos.
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return authMiddleware(req as never, event as never) as Promise<Response>;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
