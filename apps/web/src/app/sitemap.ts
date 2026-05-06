import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zello-conecta.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: '', priority: 1.0, frequency: 'weekly' as const },
    { path: '/como-funciona', priority: 0.9, frequency: 'monthly' as const },
    { path: '/quem-somos', priority: 0.8, frequency: 'monthly' as const },
    { path: '/tutoriais', priority: 0.7, frequency: 'weekly' as const },
    { path: '/contato', priority: 0.7, frequency: 'monthly' as const },
    { path: '/seguranca', priority: 0.6, frequency: 'monthly' as const },
    { path: '/termos', priority: 0.4, frequency: 'yearly' as const },
    { path: '/privacidade', priority: 0.4, frequency: 'yearly' as const },
    { path: '/cookies', priority: 0.3, frequency: 'yearly' as const },
  ];

  return routes.map((r) => ({
    url: `${APP_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.frequency,
    priority: r.priority,
  }));
}
