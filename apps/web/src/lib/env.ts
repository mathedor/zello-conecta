export const env = {
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'Zello Conecta <noreply@zelloconecta.com.br>',
  CONTACT_TO: process.env.CONTACT_TO ?? 'contato@zelloconecta.com.br',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'https://zello-conecta.vercel.app',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Zello Conecta',
};
