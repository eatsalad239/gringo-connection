import Link from 'next/link';

export function Footer({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const prefix = isEs ? '/es' : '';

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Gringo Connection</h3>
            <p className="text-gray-400">
              {isEs
                ? 'IA que eleva su marca. Hecha en Medellín.'
                : 'AI that elevates your brand. Built in Medellín.'}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">
              {isEs ? 'Enlaces' : 'Links'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`${prefix}/services`} className="text-gray-400 hover:text-white">
                  {isEs ? 'Servicios' : 'Services'}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/tours`} className="text-gray-400 hover:text-white">
                  {isEs ? 'Tours' : 'Tours'}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/contact`} className="text-gray-400 hover:text-white">
                  {isEs ? 'Contacto' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">
              {isEs ? 'Legal' : 'Legal'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href={`${prefix}/legal/privacy`} className="text-gray-400 hover:text-white">
                  {isEs ? 'Privacidad' : 'Privacy'}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/legal/terms`} className="text-gray-400 hover:text-white">
                  {isEs ? 'Términos' : 'Terms'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Gringo Connection. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

