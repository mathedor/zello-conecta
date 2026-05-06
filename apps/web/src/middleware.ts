import { NextResponse, type NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

const { auth: edgeAuth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ['/painel', '/painel-pro', '/admin', '/checkout', '/agendar', '/mensagens', '/notificacoes'];
const PRO_PREFIXES = ['/painel-pro'];
const ADMIN_PREFIXES = ['/admin'];

export default edgeAuth((req) => {
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

export const config = {
  matcher: [
    '/painel/:path*',
    '/painel-pro/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/agendar/:path*',
    '/mensagens/:path*',
    '/notificacoes/:path*',
  ],
};
