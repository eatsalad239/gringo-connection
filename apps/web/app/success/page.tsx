import Link from 'next/link';
import { getLocale, getLocalePrefix } from '@/lib/locale';

export default function SuccessPage({ params }: { params: { locale?: string } }) {
  const locale = getLocale();
  const prefix = getLocalePrefix(locale);
  const isEs = locale === 'es';

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-12 h-12 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold mb-4">
        {isEs ? '¡Gracias!' : 'Thank You!'}
      </h1>
      <p className="text-xl text-gray-700 mb-8">
        {isEs
          ? 'Su mensaje ha sido enviado con éxito. Nos pondremos en contacto pronto.'
          : 'Your message has been sent successfully. We will be in touch soon.'}
      </p>
      <Link
        href={`${prefix}/`}
        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold inline-block"
      >
        {isEs ? 'Volver al Inicio' : 'Back to Home'}
      </Link>
    </div>
  );
}

