import { getLocale } from '@/lib/locale';

export default function PrivacyPage({ params }: { params: { locale?: string } }) {
  const locale = getLocale();
  const isEs = locale === 'es';

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">
        {isEs ? 'Política de Privacidad' : 'Privacy Policy'}
      </h1>
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          {isEs
            ? 'Última actualización: ' + new Date().toLocaleDateString('es-CO')
            : 'Last updated: ' + new Date().toLocaleDateString('en-US')}
        </p>
        <p className="text-gray-700">
          {isEs
            ? 'Gringo Connection se compromete a proteger su privacidad. Recopilamos información que usted nos proporciona directamente cuando se comunica con nosotros o utiliza nuestros servicios.'
            : 'Gringo Connection is committed to protecting your privacy. We collect information you provide directly when you contact us or use our services.'}
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {isEs ? 'Información que Recopilamos' : 'Information We Collect'}
        </h2>
        <p className="text-gray-700">
          {isEs
            ? 'Recopilamos información de contacto, incluyendo nombre, email y número de teléfono cuando usted completa nuestro formulario de contacto o se comunica con nosotros.'
            : 'We collect contact information, including name, email, and phone number when you complete our contact form or communicate with us.'}
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          {isEs ? 'Uso de la Información' : 'Use of Information'}
        </h2>
        <p className="text-gray-700">
          {isEs
            ? 'Utilizamos la información recopilada para responder a sus consultas, proporcionar nuestros servicios y mejorar nuestra comunicación con usted.'
            : 'We use the information collected to respond to your inquiries, provide our services, and improve our communication with you.'}
        </p>
      </div>
    </div>
  );
}

