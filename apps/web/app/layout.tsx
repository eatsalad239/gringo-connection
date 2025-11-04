import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';

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
  const locale = params.locale || 'en';

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || process.env.PLAUSIBLE_DOMAIN;

  return (
    <html lang={locale}>
      <head>
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={inter.className}>
        <Nav locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <WhatsAppFloat />
      </body>
    </html>
  );
}

