'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card3D } from './3DCard';
import { Zap, Sparkles, Globe, Rocket, Shield, Code } from 'lucide-react';

interface Feature {
  icon: typeof Zap;
  title: string;
  description: string;
  metric: string;
  color: string;
}

export function FeatureShowcase({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features: Feature[] = [
    {
      icon: Zap,
      title: isEs ? 'Velocidad Extrema' : 'Extreme Speed',
      description: isEs
        ? 'Respuesta en menos de 50ms desde cualquier lugar del mundo'
        : 'Response in under 50ms from anywhere in the world',
      metric: '< 50ms',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: isEs ? 'IA Avanzada' : 'Advanced AI',
      description: isEs
        ? '300+ modelos de IA integrados para automatización inteligente'
        : '300+ AI models integrated for intelligent automation',
      metric: '300+',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Globe,
      title: isEs ? 'Alcance Global' : 'Global Reach',
      description: isEs
        ? '200+ ubicaciones de edge computing para latencia mínima'
        : '200+ edge computing locations for minimal latency',
      metric: '200+',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Rocket,
      title: isEs ? 'Escalabilidad Infinita' : 'Infinite Scale',
      description: isEs
        ? 'Arquitectura serverless que escala automáticamente'
        : 'Serverless architecture that scales automatically',
      metric: '∞',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: isEs ? 'Seguridad Empresarial' : 'Enterprise Security',
      description: isEs
        ? 'Protección WAF, HTTPS y mitigación DDoS incluida'
        : 'WAF protection, HTTPS, and DDoS mitigation included',
      metric: 'A+',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Code,
      title: isEs ? 'API Completa' : 'Complete API',
      description: isEs
        ? '50+ endpoints RESTful listos para integrar'
        : '50+ RESTful endpoints ready to integrate',
      metric: '50+',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-blue-50/50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Características Impresionantes' : 'Impressive Features'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEs
              ? 'Tecnología de vanguardia que marca la diferencia'
              : 'Cutting-edge technology that makes the difference'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1 }}
            >
              <Card3D className="h-full">
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 h-full hover:shadow-2xl transition-shadow">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                    {feature.metric}
                  </div>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

