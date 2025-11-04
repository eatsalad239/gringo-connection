import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com';
  const now = new Date();

  const routes = [
    '',
    '/services',
    '/tours',
    '/partners',
    '/contact',
    '/coming-soon',
    '/legal/privacy',
    '/legal/terms',
  ];

  // Generate sitemap entries for both EN and ES
  const entries: MetadataRoute.Sitemap = [];

  // English routes
  routes.forEach((route) => {
    entries.push({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 1 : 0.8,
    });
  });

  // Spanish routes
  routes.forEach((route) => {
    entries.push({
      url: `${baseUrl}/es${route}`,
      lastModified: now,
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority: route === '' ? 0.9 : 0.7,
    });
  });

  // Dynamic vertical routes (if we have them)
  const verticals = ['law', 'clinics', 'restaurants', 'real-estate'];
  verticals.forEach((vertical) => {
    entries.push({
      url: `${baseUrl}/verticals/${vertical}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
    entries.push({
      url: `${baseUrl}/es/verticals/${vertical}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  return entries;
}

