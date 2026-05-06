import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Zello Conecta',
    short_name: 'Zello',
    description: 'Marketplace de serviços profissionais — encontre, agende e pague com segurança.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d36f5',
    orientation: 'portrait',
    lang: 'pt-BR',
    icons: [
      {
        src: '/zello-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/zello-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity', 'lifestyle'],
  };
}
