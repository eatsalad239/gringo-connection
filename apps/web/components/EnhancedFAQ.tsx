'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id?: string;
  question_en: string;
  question_es: string;
  answer_en: string;
  answer_es: string;
}

export function EnhancedFAQ({
  content,
  locale,
}: {
  content: FAQItem[];
  locale: string;
}) {
  const isEs = locale === 'es';
  const [openId, setOpenId] = useState<string | null>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4" />
            {isEs ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? '¿Tiene Preguntas?' : 'Have Questions?'}
          </h2>
          <p className="text-xl text-gray-600">
            {isEs
              ? 'Encuentre respuestas a las preguntas más comunes'
              : 'Find answers to the most common questions'}
          </p>
        </motion.div>

        <div className="space-y-4">
          {content.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenId(openId === (item.id || `faq-${idx}`) ? null : (item.id || `faq-${idx}`))}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {isEs ? item.question_es : item.question_en}
                </span>
                <motion.div
                  animate={{ rotate: openId === (item.id || `faq-${idx}`) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openId === (item.id || `faq-${idx}`) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {isEs ? item.answer_es : item.answer_en}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

