'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroContent {
  title: string;
  subtitle: string;
  cta: string;
  ctaSecondary: string;
}

export function Hero({ content, locale }: { content: HeroContent; locale: string }) {
  const isEs = locale === 'es';
  const prefix = isEs ? '/es' : '';

  return (
    <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`${prefix}/contact`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center transition-colors"
            >
              {content.cta}
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link
              href={`${prefix}/services`}
              className="bg-white hover:bg-gray-50 text-primary-600 px-8 py-3 rounded-lg font-semibold border-2 border-primary-600 inline-flex items-center justify-center transition-colors"
            >
              {content.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

