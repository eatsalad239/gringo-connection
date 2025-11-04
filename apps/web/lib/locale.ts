import { headers } from 'next/headers';

/**
 * Get locale from URL pathname or headers (server-side)
 * Supports both / and /es routes
 */
export function getLocale(pathname?: string): 'en' | 'es' {
  if (pathname?.startsWith('/es') || pathname?.startsWith('/es/')) {
    return 'es';
  }
  
  // Try to get from headers (set by middleware)
  // Only works server-side, fails gracefully during static generation
  try {
    const headersList = headers();
    const localeHeader = headersList.get('x-locale');
    if (localeHeader === 'es' || localeHeader === 'en') {
      return localeHeader;
    }
  } catch {
    // Headers not available (client-side or during build)
    // Default to 'en'
  }
  
  return 'en';
}

/**
 * Get locale prefix for URL construction
 */
export function getLocalePrefix(locale: 'en' | 'es'): string {
  return locale === 'es' ? '/es' : '';
}

