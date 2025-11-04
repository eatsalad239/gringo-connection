import { readFileSync } from 'fs';
import { join } from 'path';

// Content directory - adjust path based on where Next.js runs from
const CONTENT_DIR = process.cwd().includes('apps/web')
  ? join(process.cwd(), '..', '..', 'content')
  : join(process.cwd(), 'content');

async function getPartners() {
  const data = readFileSync(join(CONTENT_DIR, 'partners.json'), 'utf-8');
  return JSON.parse(data).partners || [];
}

export default async function PartnersPage({ params }: { params: { locale?: string } }) {
  const locale = params.locale || 'en';
  const isEs = locale === 'es';
  const partners = await getPartners();

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
        {isEs ? 'Socios' : 'Partners'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map((partner: any) => (
          <div
            key={partner.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">
              {isEs ? partner.name_es : partner.name_en}
            </h2>
            <p className="text-gray-700 mb-4">
              {isEs ? partner.description_es : partner.description_en}
            </p>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {isEs ? 'Visitar Sitio' : 'Visit Website'} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

