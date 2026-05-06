import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

const PROTECTED_PREFIXES = ['/painel', '/painel-pro', '/admin', '/checkout', '/agendar'];
const PRO_PREFIXES = ['/painel-pro'];
const ADMIN_PREFIXES = ['/admin'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL('/entrar', req.url);
    loginUrl.searchParams.set('next', pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p)) && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/painel', req.url));
  }

  if (
    PRO_PREFIXES.some((p) => pathname.startsWith(p)) &&
    session.user.role !== 'PROFESSIONAL' &&
    session.user.role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/painel', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/painel/:path*',
    '/painel-pro/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/agendar/:path*',
  ],
};
