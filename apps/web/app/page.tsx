import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
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

export default async function Home({
  params,
}: {
  params: { locale?: string };
}) {
  const locale = getLocale();
  const content = await getContent(locale);

  return (
    <div>
      <Hero content={content.hero} locale={locale} />
      <Services content={content.services} locale={locale} />
      <Testimonials content={content.testimonials} locale={locale} />
      <FAQ content={content.faq} locale={locale} />
    </div>
  );
}

