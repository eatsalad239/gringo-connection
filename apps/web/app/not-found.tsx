import Link from 'next/link';
import { getLocale, getLocalePrefix } from '@/lib/locale';

export default function NotFound() {
  const locale = getLocale();
  const prefix = getLocalePrefix(locale);
  const isEs = locale === 'es';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isEs ? 'Página no encontrada' : 'Page Not Found'}
        </h2>
        <p className="text-gray-600 mb-8">
          {isEs
            ? 'Lo sentimos, la página que buscas no existe.'
            : "Sorry, the page you're looking for doesn't exist."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={prefix || '/'}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isEs ? 'Volver al Inicio' : 'Go Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

