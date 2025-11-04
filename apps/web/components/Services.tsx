interface Service {
  id: string;
  name_en: string;
  name_es: string;
  capabilities_en: string[];
  capabilities_es: string[];
}

export function Services({
  content,
  locale,
}: {
  content: Service[];
  locale: string;
}) {
  const isEs = locale === 'es';

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {isEs ? 'Lo Que Hacemos' : 'What We Do'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-4">
                {isEs ? service.name_es : service.name_en}
              </h3>
              <ul className="space-y-2">
                {(isEs ? service.capabilities_es : service.capabilities_en).map(
                  (cap, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      {cap}
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

