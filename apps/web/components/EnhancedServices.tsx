'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react';

interface Service {
  id: string;
  name_en: string;
  name_es: string;
  capabilities_en: string[];
  capabilities_es: string[];
}

export function EnhancedServices({
  content,
  locale,
}: {
  content: Service[];
  locale: string;
}) {
  const isEs = locale === 'es';
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Lo Que Hacemos' : 'What We Do'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEs
              ? 'Soluciones empresariales impulsadas por IA para transformar su negocio'
              : 'Enterprise-grade AI solutions to transform your business'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="relative z-10 mb-6">
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {isEs ? service.name_es : service.name_en}
                </h3>
                <ul className="space-y-3 mb-6">
                  {(isEs ? service.capabilities_es : service.capabilities_en).map(
                    (cap, capIdx) => (
                      <motion.li
                        key={capIdx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: idx * 0.1 + capIdx * 0.05 }}
                        className="text-gray-700 flex items-start group-hover:text-gray-900 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{cap}</span>
                      </motion.li>
                    )
                  )}
                </ul>

                {/* Learn More */}
                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  {isEs ? 'Saber más' : 'Learn more'}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div>
              <Zap className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {isEs ? 'Rendimiento Excepcional' : 'Exceptional Performance'}
              </h3>
              <p className="text-white/90">
                {isEs
                  ? 'Optimizado para velocidad y escalabilidad'
                  : 'Optimized for speed and scalability'}
              </p>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {isEs ? 'Escalable Infinitamente' : 'Infinitely Scalable'}
              </h3>
              <p className="text-white/90">
                {isEs
                  ? 'Crece con su negocio sin límites'
                  : 'Grows with your business without limits'}
              </p>
            </div>
            <div>
              <Sparkles className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {isEs ? 'IA de Última Generación' : 'Cutting-Edge AI'}
              </h3>
              <p className="text-white/90">
                {isEs
                  ? 'Tecnología de vanguardia en cada función'
                  : 'State-of-the-art technology in every feature'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

