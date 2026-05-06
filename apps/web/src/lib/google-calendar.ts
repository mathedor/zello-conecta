import { prisma } from '@zello/db';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_API_BASE = 'https://www.googleapis.com';

export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildGoogleAuthUrl({
  redirectUri,
  state,
}: {
  redirectUri: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    scope: GOOGLE_CALENDAR_SCOPES.join(' '),
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function exchangeCodeForToken({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token error: ${res.status}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) {
    throw new Error(`Google refresh error: ${res.status}`);
  }
  return (await res.json()) as { access_token: string; expires_in: number };
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const integration = await prisma.calendarIntegration.findUnique({
    where: { userId_provider: { userId, provider: 'GOOGLE' } },
  });
  if (!integration || !integration.active || !integration.refreshToken) return null;

  if (integration.accessToken && integration.expiresAt && integration.expiresAt > new Date(Date.now() + 30_000)) {
    return integration.accessToken;
  }

  try {
    const refreshed = await refreshAccessToken(integration.refreshToken);
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { accessToken: refreshed.access_token, expiresAt },
    });
    return refreshed.access_token;
  } catch (err) {
    console.error('[google] refresh failed', err);
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { active: false },
    });
    return null;
  }
}

export async function createGoogleEvent({
  userId,
  summary,
  description,
  start,
  end,
  location,
}: {
  userId: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}): Promise<string | null> {
  const token = await getValidAccessToken(userId);
  if (!token) return null;

  const integration = await prisma.calendarIntegration.findUnique({
    where: { userId_provider: { userId, provider: 'GOOGLE' } },
  });
  const calendarId = integration?.calendarId ?? 'primary';

  const res = await fetch(
    `${GOOGLE_API_BASE}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        location,
        start: { dateTime: start.toISOString(), timeZone: 'America/Sao_Paulo' },
        end: { dateTime: end.toISOString(), timeZone: 'America/Sao_Paulo' },
        reminders: { useDefault: true },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('[google] event create failed', res.status, text);
    return null;
  }

  const data = (await res.json()) as { id: string };
  return data.id;
}
