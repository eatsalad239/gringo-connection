'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = {
  en: [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/tours', label: 'Tours' },
    { href: '/partners', label: 'Partners' },
    { href: '/contact', label: 'Contact' },
  ],
  es: [
    { href: '/es', label: 'Inicio' },
    { href: '/es/services', label: 'Servicios' },
    { href: '/es/tours', label: 'Tours' },
    { href: '/es/partners', label: 'Socios' },
    { href: '/es/contact', label: 'Contacto' },
  ],
};

export function Nav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const items = navItems[locale as 'en' | 'es'] || navItems.en;
  const isEs = locale === 'es';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={isEs ? '/es' : '/'} className="text-xl font-bold text-primary-600">
            Gringo Connection
          </Link>
          <div className="flex space-x-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium ${
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={isEs ? '/' : '/es'}
              className="text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              {isEs ? 'EN' : 'ES'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

