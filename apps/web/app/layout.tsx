import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { getLocale } from '@/lib/locale';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gringo Connection — AI that elevates your brand. Built in Medellín.',
  description: 'Websites, automations, concierge growth — bilingual, enterprise-grade, price after the plan.',
  openGraph: {
    title: 'Gringo Connection',
    description: 'AI that elevates your brand. Built in Medellín.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_CO',
  },
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  // Get locale from headers (set by middleware) or default to 'en'
  const locale = getLocale();

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || process.env.PLAUSIBLE_DOMAIN;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com';

  // Structured data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Gringo Connection',
    url: baseUrl,
    description: 'AI that elevates your brand. Built in Medellín.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Medellín',
      addressRegion: 'Antioquia',
      addressCountry: 'CO',
    },
    sameAs: [
      // Add social media links when available
    ],
  };

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={`${inter.className} antialiased`}>
        <Nav locale={locale} />
        <main className="pt-16">{children}</main>
        <Footer locale={locale} />
        <WhatsAppFloat />
      </body>
    </html>
  );
}

