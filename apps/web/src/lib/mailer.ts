import { Resend } from 'resend';
import { env } from './env';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  if (!env.RESEND_API_KEY) {
    console.warn('[mailer] RESEND_API_KEY ausente — email não foi enviado.');
    console.info('[mailer]', { to, subject });
    return { ok: false as const, reason: 'no-api-key' as const };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const { error, data } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    replyTo,
  });

  if (error) {
    console.error('[mailer] resend error:', error);
    return { ok: false as const, reason: 'send-failed' as const, error };
  }

  return { ok: true as const, id: data?.id };
}

export function emailLayout(content: string, preheader?: string) {
  const safe = preheader ? escapeHtml(preheader) : '';
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Zello Conecta</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f1a4a;">
    ${preheader ? `<div style="display:none!important;font-size:1px;color:#f4f6fb;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${safe}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,26,74,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#1d36f5,#1a26a3);padding:28px 40px;color:#ffffff;">
                <div style="font-size:20px;font-weight:600;letter-spacing:-0.3px;">Zello Conecta</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px;line-height:1.55;">${content}</td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} Zello Conecta — Marketplace de serviços profissionais
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function welcomeEmail(name: string) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">Bem-vindo à Zello, ${escapeHtml(name)}!</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3a4a8a;">Sua conta foi criada com sucesso. Já pode buscar profissionais e contratar serviços com pagamento seguro.</p>
    <p style="margin:24px 0;">
      <a href="${env.APP_URL}" style="display:inline-block;background:#1d36f5;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">Acessar plataforma</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Se você não criou esta conta, ignore este email.</p>`,
    'Bem-vindo à Zello Conecta',
  );
}

export function welcomeProEmail(name: string) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">Olá, ${escapeHtml(name)}! Sua conta de profissional está pronta.</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3a4a8a;">Próximos passos para você começar a receber clientes:</p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;color:#3a4a8a;line-height:1.8;">
      <li>Envie seus documentos para verificação (KYC)</li>
      <li>Cadastre seus serviços com foto, preço e duração</li>
      <li>Configure sua agenda semanal</li>
    </ol>
    <p style="margin:24px 0;">
      <a href="${env.APP_URL}/painel-pro" style="display:inline-block;background:#1d36f5;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">Acessar painel profissional</a>
    </p>`,
    'Sua conta de profissional foi criada',
  );
}

export function resetPasswordEmail(name: string, link: string) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">Olá, ${escapeHtml(name)}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3a4a8a;">Recebemos uma solicitação para redefinir sua senha. O link abaixo é válido por 30 minutos:</p>
    <p style="margin:24px 0;">
      <a href="${link}" style="display:inline-block;background:#1d36f5;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">Redefinir senha</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Se você não pediu para redefinir a senha, ignore este email — sua conta continua segura.</p>
    <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;word-break:break-all;">${escapeHtml(link)}</p>`,
    'Redefinição de senha',
  );
}

export function kycApprovedEmail(name: string) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">${escapeHtml(name)}, seu KYC foi aprovado!</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3a4a8a;">Seu perfil já está visível nas buscas. Agora é só cadastrar seus serviços e configurar sua agenda.</p>
    <p style="margin:24px 0;">
      <a href="${env.APP_URL}/painel-pro" style="display:inline-block;background:#1d36f5;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">Ir para o painel</a>
    </p>`,
    'KYC aprovado',
  );
}

export function kycRejectedEmail(name: string, reason: string) {
  return emailLayout(
    `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;">${escapeHtml(name)}, precisamos de ajustes no seu KYC</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3a4a8a;">Identificamos o seguinte ponto na sua documentação:</p>
    <blockquote style="margin:0 0 24px;padding:16px;background:#fef3f2;border-left:4px solid #f04438;border-radius:8px;font-size:14px;color:#7a271a;">${escapeHtml(reason)}</blockquote>
    <p style="margin:0 0 16px;font-size:15px;color:#3a4a8a;">Acesse seu painel e reenvie os documentos solicitados.</p>
    <p style="margin:24px 0;">
      <a href="${env.APP_URL}/painel-pro/kyc" style="display:inline-block;background:#1d36f5;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">Reenviar documentos</a>
    </p>`,
    'KYC precisa de ajustes',
  );
}
