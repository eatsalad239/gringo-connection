import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com';
  const now = new Date();

  const routes = [
    { path: '', priority: 1.0, changeFreq: 'daily' as const },
    { path: '/services', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/tours', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/partners', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFreq: 'monthly' as const },
    { path: '/grants', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/coming-soon', priority: 0.7, changeFreq: 'monthly' as const },
    { path: '/status', priority: 0.5, changeFreq: 'daily' as const },
    { path: '/legal/privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: '/legal/terms', priority: 0.3, changeFreq: 'yearly' as const },
  ];

  // Generate sitemap entries for both EN and ES
  const entries: MetadataRoute.Sitemap = [];

  // English routes
  routes.forEach((route) => {
    entries.push({
      url: `${baseUrl}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFreq,
      priority: route.priority,
    });
  });

  // Spanish routes
  routes.forEach((route) => {
    entries.push({
      url: `${baseUrl}/es${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFreq,
      priority: route.priority * 0.95, // Slightly lower priority for Spanish
    });
  });

  // Dynamic vertical routes
  const verticals = [
    { slug: 'law', priority: 0.7 },
    { slug: 'clinics', priority: 0.7 },
    { slug: 'restaurants', priority: 0.7 },
    { slug: 'real-estate', priority: 0.7 },
  ];
  
  verticals.forEach((vertical) => {
    entries.push({
      url: `${baseUrl}/verticals/${vertical.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: vertical.priority,
    });
    entries.push({
      url: `${baseUrl}/es/verticals/${vertical.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: vertical.priority * 0.95,
    });
  });

  return entries;
}
