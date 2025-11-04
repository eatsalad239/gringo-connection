import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';

// Content directory - adjust path based on where Next.js runs from
const CONTENT_DIR = process.cwd().includes('apps/web')
  ? join(process.cwd(), '..', '..', 'content')
  : join(process.cwd(), 'content');

async function getServices() {
  const data = readFileSync(join(CONTENT_DIR, 'services.json'), 'utf-8');
  return JSON.parse(data).services || [];
}

export default async function ServicesPage({ params }: { params: { locale?: string } }) {
  const locale = params.locale || 'en';
  const isEs = locale === 'es';
  const services = await getServices();

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
        {isEs ? 'Servicios' : 'Services'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service: any) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4">
              {isEs ? service.name_es : service.name_en}
            </h2>
            <ul className="space-y-2">
              {(isEs ? service.capabilities_es : service.capabilities_en).map(
                (cap: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    {cap}
                  </li>
                )
              )}
            </ul>
            <Link
              href={`/${locale}/contact`}
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {isEs ? 'Solicitar Consulta' : 'Request Consultation'} →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

