export const env = {
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'Zello Conecta <onboarding@resend.dev>',
  CONTACT_TO: process.env.CONTACT_TO ?? 'contato@zelloconecta.com.br',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'https://zello-conecta.vercel.app',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Zello Conecta',
  AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? '',
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ?? '',
};
