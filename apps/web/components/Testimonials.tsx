interface Testimonial {
  name: string;
  role_en: string;
  role_es: string;
  company: string;
  quote_en: string;
  quote_es: string;
}

export function Testimonials({
  content,
  locale,
}: {
  content: Testimonial[];
  locale: string;
}) {
  const isEs = locale === 'es';

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {isEs ? 'Lo Que Dicen Nuestros Clientes' : 'What Our Clients Say'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {content.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <p className="text-gray-700 mb-4 italic">
                "{isEs ? testimonial.quote_es : testimonial.quote_en}"
              </p>
              <div className="border-t pt-4">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-600">
                  {isEs ? testimonial.role_es : testimonial.role_en}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

