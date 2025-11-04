interface FAQItem {
  question_en: string;
  question_es: string;
  answer_en: string;
  answer_es: string;
}

export function FAQ({ content, locale }: { content: FAQItem[]; locale: string }) {
  const isEs = locale === 'es';

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-6">
          {content.map((item, idx) => (
            <div key={idx} className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-2">
                {isEs ? item.question_es : item.question_en}
              </h3>
              <p className="text-gray-700">
                {isEs ? item.answer_es : item.answer_en}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

