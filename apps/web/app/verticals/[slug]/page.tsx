import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLocale, getLocalePrefix } from '@/lib/locale';

// Content directory - adjust path based on where Next.js runs from
const CONTENT_DIR = process.cwd().includes('apps/web')
  ? join(process.cwd(), '..', '..', 'content')
  : join(process.cwd(), 'content');

async function getVerticals() {
  const data = readFileSync(join(CONTENT_DIR, 'verticals.json'), 'utf-8');
  return JSON.parse(data).verticals || [];
}

async function getServices() {
  const data = readFileSync(join(CONTENT_DIR, 'services.json'), 'utf-8');
  return JSON.parse(data).services || [];
}

export default async function VerticalPage({
  params,
}: {
  params: { slug: string; locale?: string };
}) {
  const locale = getLocale();
  const prefix = getLocalePrefix(locale);
  const isEs = locale === 'es';
  const verticals = await getVerticals();
  const services = await getServices();
  
  const vertical = verticals.find((v: any) => v.id === params.slug);
  
  if (!vertical) {
    notFound();
  }

  const verticalServices = services.filter((s: any) =>
    vertical.services.includes(s.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">
        {isEs ? vertical.name_es : vertical.name_en}
      </h1>
      <p className="text-xl text-gray-700 mb-12">
        {isEs
          ? 'Soluciones de IA nivel empresa para este vertical'
          : 'Enterprise-grade AI solutions for this vertical'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {verticalServices.map((service: any) => (
          <div key={service.id} className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEs ? service.name_es : service.name_en}
            </h2>
            <ul className="space-y-2">
              {(isEs ? service.capabilities_es : service.capabilities_en).map(
                (cap: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {cap}
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-primary-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          {isEs ? 'Pruebas de Éxito' : 'Proof Points'}
        </h2>
        <ul className="space-y-3">
          {(isEs ? vertical.proof_es : vertical.proof_en).map(
            (proof: string, idx: number) => (
              <li key={idx} className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>{proof}</span>
              </li>
            )
          )}
        </ul>
      </div>

      <div className="text-center">
        <Link
          href={`${prefix}/contact`}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold inline-block"
        >
          {isEs ? 'Contactar' : 'Get in Touch'}
        </Link>
      </div>
    </div>
  );
}

