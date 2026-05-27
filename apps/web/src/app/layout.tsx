import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ChatFab } from '@/components/layout/chat-fab';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';
import { TableCards } from '@/components/table-cards';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zello-conecta.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Zello Conecta — O serviço certo, na hora certa',
    template: '%s | Zello Conecta',
  },
  description:
    'Marketplace de serviços profissionais. Encontre profissionais verificados de qualquer setor, agende com poucos cliques e pague com segurança. Pagamento retido até a conclusão do serviço.',
  keywords: [
    'marketplace de serviços',
    'profissionais',
    'agendamento',
    'pagamento seguro',
    'advocacia',
    'consultoria',
    'beleza',
    'reformas',
    'tecnologia',
    'zello conecta',
  ],
  authors: [{ name: 'Zello Conecta' }],
  creator: 'Zello Conecta',
  publisher: 'Zello Conecta',
  applicationName: 'Zello Conecta',
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'Zello Conecta',
    title: 'Zello Conecta — O serviço certo, na hora certa',
    description:
      'Encontre profissionais verificados, agende com poucos cliques e pague com segurança.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zello Conecta',
    description: 'Marketplace de serviços profissionais',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1238' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex min-h-screen flex-col pb-20 font-sans antialiased sm:pb-0">
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <BottomNav />
          <ChatFab />
          <Toaster position="top-center" richColors closeButton />
          <TableCards />
        </Providers>
      </body>
    </html>
  );
}
