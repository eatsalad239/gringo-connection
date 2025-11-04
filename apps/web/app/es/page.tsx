import { AnimatedHero } from '@/components/AnimatedHero';
import { EnhancedServices } from '@/components/EnhancedServices';
import { TechStackShowcase } from '@/components/TechStackShowcase';
import { InteractiveDemo } from '@/components/InteractiveDemo';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { InnovationShowcase } from '@/components/InnovationShowcase';
import { GrantReadyBadge } from '@/components/GrantReadyBadge';
import { EnhancedTestimonials } from '@/components/EnhancedTestimonials';
import { EnhancedFAQ } from '@/components/EnhancedFAQ';
import { getContent } from '@/lib/content';

export default async function HomeEs() {
  const locale = 'es';
  const content = await getContent(locale);

  return (
    <div>
      <AnimatedHero content={content.hero} locale={locale} />
      <GrantReadyBadge locale={locale} />
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

