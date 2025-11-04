import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { getContent } from '@/lib/content';

export default async function Home({
  params,
}: {
  params: { locale?: string };
}) {
  const locale = params.locale || 'en';
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

