import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { ScrollToTop } from '@/components/ScrollToTop';
import { getLocale } from '@/lib/locale';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gringo Connection — AI that elevates your brand. Built in Medellín.',
  description: 'Websites, automations, concierge growth — bilingual, enterprise-grade, price after the plan.',
  keywords: ['AI', 'automation', 'web development', 'Medellín', 'Colombia', 'bilingual', 'enterprise', 'concierge'],
  authors: [{ name: 'Gringo Connection' }],
  creator: 'Gringo Connection',
  publisher: 'Gringo Connection',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'es': '/es',
    },
  },
  openGraph: {
    title: 'Gringo Connection — AI that elevates your brand',
    description: 'Websites, automations, concierge growth — bilingual, enterprise-grade, price after the plan.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gringoconnection.com',
    siteName: 'Gringo Connection',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gringo Connection - AI that elevates your brand',
      },
    ],
    locale: 'en_US',
    type: 'website',
    alternateLocale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gringo Connection — AI that elevates your brand',
    description: 'Websites, automations, concierge growth — bilingual, enterprise-grade.',
    images: ['/og-image.jpg'],
    creator: '@gringoconnection',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
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
        <ScrollToTop />
      </body>
    </html>
  );
}

