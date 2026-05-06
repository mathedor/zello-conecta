import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Zello Conecta — Marketplace de serviços profissionais',
    template: '%s | Zello Conecta',
  },
  description:
    'Encontre profissionais de qualquer setor, agende e pague de forma segura. Zello Conecta conecta você ao serviço certo, na hora certa.',
  keywords: ['marketplace', 'serviços', 'profissionais', 'agendamento', 'zello'],
  authors: [{ name: 'Zello Conecta' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://zelloconecta.com.br',
    siteName: 'Zello Conecta',
    title: 'Zello Conecta — Marketplace de serviços profissionais',
    description: 'Encontre profissionais e agende serviços com pagamento seguro.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zello Conecta',
    description: 'Marketplace de serviços profissionais',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
