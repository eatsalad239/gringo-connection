import { getLocale } from '@/lib/locale';

export default function TermsPage({ params }: { params: { locale?: string } }) {
  const locale = getLocale();
  const isEs = locale === 'es';

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">
        {isEs ? 'Términos y Condiciones' : 'Terms and Conditions'}
      </h1>
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          {isEs
            ? 'Última actualización: ' + new Date().toLocaleDateString('es-CO')
            : 'Last updated: ' + new Date().toLocaleDateString('en-US')}
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {isEs ? 'Uso del Sitio Web' : 'Website Use'}
        </h2>
        <p className="text-gray-700">
          {isEs
            ? 'Al acceder y utilizar este sitio web, usted acepta cumplir con estos términos y condiciones. El contenido de este sitio es para fines informativos únicamente.'
            : 'By accessing and using this website, you agree to comply with these terms and conditions. The content of this site is for informational purposes only.'}
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {isEs ? 'Servicios' : 'Services'}
        </h2>
        <p className="text-gray-700">
          {isEs
            ? 'Los servicios ofrecidos por Gringo Connection están sujetos a disponibilidad y a términos específicos acordados por escrito. Los precios se proporcionan después de la planificación personalizada.'
            : 'Services offered by Gringo Connection are subject to availability and specific terms agreed upon in writing. Pricing is provided after personalized planning.'}
        </p>
      </div>
    </div>
  );
}

