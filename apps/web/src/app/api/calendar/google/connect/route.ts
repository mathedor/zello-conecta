import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { buildGoogleAuthUrl, isGoogleConfigured } from '@/lib/google-calendar';
import { env } from '@/lib/env';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/entrar?next=/painel-pro/agenda', env.APP_URL));
  }
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL('/painel-pro/agenda?google=missing-config', env.APP_URL));
  }

  const redirectUri = `${env.APP_URL}/api/calendar/google/callback`;
  const state = `${session.user.id}:${nanoid(12)}`;
  const url = buildGoogleAuthUrl({ redirectUri, state });

  const res = NextResponse.redirect(url);
  res.cookies.set('zello_gcal_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}
