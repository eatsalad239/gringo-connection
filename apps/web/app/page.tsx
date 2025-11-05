import { AnimatedHero } from '@/components/AnimatedHero';
import { EnhancedServices } from '@/components/EnhancedServices';
import { TechStackShowcase } from '@/components/TechStackShowcase';
import { InteractiveDemo } from '@/components/InteractiveDemo';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { InnovationShowcase } from '@/components/InnovationShowcase';
import { GrantReadyBadge } from '@/components/GrantReadyBadge';
import { EnhancedTestimonials } from '@/components/EnhancedTestimonials';
import { EnhancedFAQ } from '@/components/EnhancedFAQ';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { ParticleBackground } from '@/components/ParticleBackground';
import { getContent } from '@/lib/content';
import { getLocale } from '@/lib/locale';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const isEs = locale === 'es';
  
  return {
    title: isEs
      ? 'Gringo Connection — IA que eleva su marca. Hecha en Medellín.'
      : 'Gringo Connection — AI that elevates your brand. Built in Medellín.',
    description: isEs
      ? 'Sitios web de nivel empresarial, automatizaciones y servicios de crecimiento concierge. Bilingüe, nivel empresa.'
      : 'Websites, automations, concierge growth — bilingual, enterprise-grade, price after the plan.',
    openGraph: {
      title: 'Gringo Connection',
      description: isEs
        ? 'IA que eleva su marca. Hecha en Medellín.'
        : 'AI that elevates your brand. Built in Medellín.',
      type: 'website',
      locale: isEs ? 'es_CO' : 'en_US',
      alternateLocale: isEs ? 'en_US' : 'es_CO',
    },
  };
}

export default async function Home() {
  const locale = getLocale();
  const content = await getContent(locale);

  return (
    <div className="relative">
      <ParticleBackground />
      <AnimatedHero content={content.hero} locale={locale} />
      <GrantReadyBadge locale={locale} />
      <FeatureShowcase locale={locale} />
      <TechStackShowcase locale={locale} />
      <PerformanceMetrics locale={locale} />
      <InnovationShowcase locale={locale} />
      <EnhancedServices content={content.services} locale={locale} />
      <InteractiveDemo locale={locale} />
      <EnhancedTestimonials content={content.testimonials} locale={locale} />
      <EnhancedFAQ content={content.faq} locale={locale} />
    </div>
  );
}

