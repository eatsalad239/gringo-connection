import { readFileSync } from 'fs';
import { join } from 'path';
import { getLocale, getLocalePrefix } from '@/lib/locale';
import { Metadata } from 'next';

// Content directory - adjust path based on where Next.js runs from
const CONTENT_DIR = process.cwd().includes('apps/web')
  ? join(process.cwd(), '..', '..', 'content')
  : join(process.cwd(), 'content');

async function getTours() {
  const data = readFileSync(join(CONTENT_DIR, 'tours.json'), 'utf-8');
  return JSON.parse(data).tours || [];
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const isEs = locale === 'es';
  
  return {
    title: isEs ? 'Tours — Gringo Connection' : 'Tours & Experiences — Gringo Connection',
    description: isEs
      ? 'Tours y experiencias tecnológicas en Medellín'
      : 'Tech tours and experiences in Medellín',
  };
}

export default async function ToursPage({ params }: { params: { locale?: string } }) {
  const locale = getLocale();
  const isEs = locale === 'es';
  const tours = await getTours();

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-12 text-center">
        {isEs ? 'Tours y Experiencias' : 'Tours & Experiences'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tours.map((tour: any) => (
          <div key={tour.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {isEs ? tour.name_es : tour.name_en}
            </h2>
            <p className="text-gray-700 mb-4">
              {isEs ? tour.description_es : tour.description_en}
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {isEs ? 'Capacidad' : 'Capacity'}: {tour.capacity}
                </p>
                <p className="text-sm text-gray-600">
                  {isEs ? 'Duración' : 'Duration'}: {tour.duration}
                </p>
              </div>
              <p className="text-xl font-bold text-primary-600">
                ${tour.price.toLocaleString()} {tour.currency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

