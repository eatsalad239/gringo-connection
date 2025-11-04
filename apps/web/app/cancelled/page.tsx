import Link from 'next/link';
import { getLocale, getLocalePrefix } from '@/lib/locale';

export default function CancelledPage({ params }: { params: { locale?: string } }) {
  const locale = getLocale();
  const prefix = getLocalePrefix(locale);
  const isEs = locale === 'es';

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-4">
        {isEs ? 'Pago Cancelado' : 'Payment Cancelled'}
      </h1>
      <p className="text-xl text-gray-700 mb-8">
        {isEs
          ? 'Su pago fue cancelado. Si necesita ayuda, por favor contáctenos.'
          : 'Your payment was cancelled. If you need assistance, please contact us.'}
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href={`${prefix}/contact`}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold inline-block"
        >
          {isEs ? 'Contactar' : 'Contact Us'}
        </Link>
        <Link
          href={`${prefix}/`}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold inline-block"
        >
          {isEs ? 'Volver al Inicio' : 'Back to Home'}
        </Link>
      </div>
    </div>
  );
}

