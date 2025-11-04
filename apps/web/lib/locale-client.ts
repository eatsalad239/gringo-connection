'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Client-side locale hook (for use in 'use client' components)
 */
export function useLocale(): 'en' | 'es' {
  const pathname = usePathname();
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  
  useEffect(() => {
    setLocale(pathname?.startsWith('/es') ? 'es' : 'en');
  }, [pathname]);
  
  return locale;
}

