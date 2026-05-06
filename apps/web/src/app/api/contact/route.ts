import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema, subjectLabels } from '@/lib/contact-schema';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return NextResponse.json({ error: 'Dados inválidos', details: flat.fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  if (data.honeypot && data.honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!env.RESEND_API_KEY) {
    console.warn('[contact] RESEND_API_KEY não configurada — mensagem registrada nos logs.');
    console.info('[contact] Nova mensagem:', data);
    return NextResponse.json({
      ok: true,
      delivered: false,
      reason: 'email-disabled',
    });
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);

    const subject = `[Zello Contato] ${subjectLabels[data.subject]} — ${data.name}`;
    const html = renderEmail(data, subject);

    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: env.CONTACT_TO,
      replyTo: data.email,
      subject,
      html,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return NextResponse.json(
        { error: 'Não foi possível enviar a mensagem. Tente novamente em instantes.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

function renderEmail(
  data: { name: string; email: string; phone?: string | undefined; subject: string; message: string },
  subject: string,
): string {
  const safe = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6fb; padding: 24px; margin: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 26, 74, 0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #1d36f5, #1a26a3); padding: 32px 40px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 600;">Zello Conecta</h1>
              <p style="margin: 4px 0 0; opacity: 0.85; font-size: 14px;">Nova mensagem de contato</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px; color: #0f1a4a;">
              <h2 style="margin: 0 0 24px; font-size: 18px; font-weight: 600;">${safe(subject)}</h2>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; width: 120px;">Nome</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${safe(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Email</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><a href="mailto:${safe(data.email)}" style="color: #1d36f5; text-decoration: none;">${safe(data.email)}</a></td>
                </tr>
                ${
                  data.phone
                    ? `<tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">Telefone</td>
                  <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">${safe(data.phone)}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 12px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Mensagem</td>
                  <td style="padding: 12px 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safe(data.message)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background: #f9fafb; color: #6b7280; font-size: 12px; text-align: center;">
              Mensagem enviada via formulário de contato em zelloconecta.com.br
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
