import { NextResponse } from 'next/server';
import { prisma } from '@zello/db';
import { auth } from '@/lib/auth';
import { exchangeCodeForToken } from '@/lib/google-calendar';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/entrar', env.APP_URL));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  if (error || !code || !state) {
    return NextResponse.redirect(new URL('/painel-pro/agenda?google=error', env.APP_URL));
  }

  const cookieState = req.headers
    .get('cookie')
    ?.split(';')
    .map((s) => s.trim())
    .find((c) => c.startsWith('zello_gcal_state='))
    ?.split('=')[1];

  if (!cookieState || cookieState !== state || !state.startsWith(session.user.id + ':')) {
    return NextResponse.redirect(new URL('/painel-pro/agenda?google=state-mismatch', env.APP_URL));
  }

  try {
    const redirectUri = `${env.APP_URL}/api/calendar/google/callback`;
    const tokens = await exchangeCodeForToken({ code, redirectUri });
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.calendarIntegration.upsert({
      where: { userId_provider: { userId: session.user.id, provider: 'GOOGLE' } },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt,
        active: true,
      },
      create: {
        userId: session.user.id,
        provider: 'GOOGLE',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt,
        calendarId: 'primary',
        active: true,
      },
    });

    const res = NextResponse.redirect(new URL('/painel-pro/agenda?google=connected', env.APP_URL));
    res.cookies.delete('zello_gcal_state');
    return res;
  } catch (err) {
    console.error('[google callback]', err);
    return NextResponse.redirect(new URL('/painel-pro/agenda?google=error', env.APP_URL));
  }
}
