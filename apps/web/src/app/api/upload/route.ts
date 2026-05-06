import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
]);
const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  if (!env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Storage não configurado. Avise o administrador.' },
      { status: 503 },
    );
  }

  const formData = await req.formData();
  const file = formData.get('file');
  const purpose = (formData.get('purpose') ?? 'kyc').toString();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Formato não suportado. Envie PNG, JPG, WEBP ou PDF.' },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Arquivo maior que 8MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const key = `${purpose}/${session.user.id}/${nanoid(16)}.${ext}`;

  const blob = await put(key, file, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
