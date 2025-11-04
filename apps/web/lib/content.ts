import { readFileSync } from 'fs';
import { join } from 'path';

// Content directory - adjust path based on where Next.js runs from
const CONTENT_DIR = process.cwd().includes('apps/web')
  ? join(process.cwd(), '..', '..', 'content')
  : join(process.cwd(), 'content');

export async function getContent(locale: 'en' | 'es' = 'en') {
  const i18n = JSON.parse(
    readFileSync(join(CONTENT_DIR, 'i18n', `${locale}.json`), 'utf-8')
  );
  const services = JSON.parse(
    readFileSync(join(CONTENT_DIR, 'services.json'), 'utf-8')
  );
  const testimonials = JSON.parse(
    readFileSync(join(CONTENT_DIR, 'testimonials.json'), 'utf-8')
  );
  const faq = JSON.parse(
    readFileSync(join(CONTENT_DIR, 'faq.json'), 'utf-8')
  );
  const cta = JSON.parse(
    readFileSync(join(CONTENT_DIR, 'cta.json'), 'utf-8')
  );

  return {
    hero: i18n.hero,
    services: services.services,
    testimonials: testimonials.testimonials,
    faq: faq.faq,
    cta,
  };
}

