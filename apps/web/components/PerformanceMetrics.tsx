'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TrendingUp, Zap, Shield, Globe, CheckCircle2 } from 'lucide-react';

export function PerformanceMetrics({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const metrics = [
    {
      icon: Zap,
      value: '< 50ms',
      label: isEs ? 'Tiempo de Respuesta' : 'Response Time',
      description: isEs ? 'Edge computing global' : 'Global edge computing',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: TrendingUp,
      value: '100/100',
      label: isEs ? 'Lighthouse Score' : 'Lighthouse Score',
      description: isEs ? 'Rendimiento perfecto' : 'Perfect performance',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: Shield,
      value: 'A+',
      label: isEs ? 'Calificación SSL' : 'SSL Rating',
      description: isEs ? 'Seguridad máxima' : 'Maximum security',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Globe,
      value: '200+',
      label: isEs ? 'Países Servidos' : 'Countries Served',
      description: isEs ? 'CDN global' : 'Global CDN',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: CheckCircle2,
      value: '99.9%',
      label: isEs ? 'Uptime SLA' : 'Uptime SLA',
      description: isEs ? 'Disponibilidad garantizada' : 'Guaranteed availability',
      color: 'from-indigo-400 to-purple-500',
    },
    {
      icon: Zap,
      value: '∞',
      label: isEs ? 'Escalabilidad' : 'Scalability',
      description: isEs ? 'Sin límites' : 'Unlimited',
      color: 'from-rose-400 to-red-500',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Rendimiento Excepcional' : 'Exceptional Performance'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEs
              ? 'Métricas que demuestran nuestra excelencia técnica'
              : 'Metrics that demonstrate our technical excellence'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div className={`relative z-10 inline-flex p-4 rounded-xl bg-gradient-to-br ${metric.color} mb-6 group-hover:scale-110 transition-transform`}>
                <metric.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{metric.label}</div>
                <div className="text-sm text-gray-500">{metric.description}</div>
              </div>

              {/* Decorative Element */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 rounded-bl-full transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">
            {isEs ? 'Benchmarks de Rendimiento' : 'Performance Benchmarks'}
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: isEs ? 'First Contentful Paint' : 'First Contentful Paint', value: '0.8s', target: '1.8s' },
              { label: isEs ? 'Time to Interactive' : 'Time to Interactive', value: '1.2s', target: '3.8s' },
              { label: isEs ? 'Largest Contentful Paint' : 'Largest Contentful Paint', value: '1.5s', target: '2.5s' },
              { label: isEs ? 'Cumulative Layout Shift' : 'Cumulative Layout Shift', value: '0.05', target: '0.1' },
            ].map((benchmark, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-sm text-white/70 mb-2">{benchmark.label}</div>
                <div className="text-3xl font-bold mb-1">{benchmark.value}</div>
                <div className="text-xs text-green-400">Target: {benchmark.target}</div>
                <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: '100%' } : {}}
                    transition={{ delay: 0.8 + idx * 0.1, duration: 1 }}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

