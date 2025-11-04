'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Code,
  Database,
  Cloud,
  Zap,
  Shield,
  Globe,
  Cpu,
  Lock,
  Rocket,
  Layers,
  Workflow,
} from 'lucide-react';

const techStack = [
  {
    category: 'Frontend',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS'],
    description: 'Modern, performant, and SEO-optimized',
  },
  {
    category: 'Backend',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    technologies: ['Cloudflare D1', 'Serverless Functions', 'Edge Computing'],
    description: 'Global edge network, instant scale',
  },
  {
    category: 'AI/ML',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    technologies: ['SDXL', 'Stable Video', 'GPT-4', 'Claude 3'],
    description: '300+ AI models via AIMLAPI',
  },
  {
    category: 'Infrastructure',
    icon: Cloud,
    color: 'from-green-500 to-emerald-500',
    technologies: ['Cloudflare Pages', 'D1 Database', 'KV Storage'],
    description: '99.9% uptime SLA, global CDN',
  },
  {
    category: 'Security',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    technologies: ['HTTPS', 'WAF', 'DDoS Protection', 'Zero Trust'],
    description: 'Enterprise-grade security',
  },
  {
    category: 'Analytics',
    icon: Globe,
    color: 'from-indigo-500 to-purple-500',
    technologies: ['Plausible', 'Real-time Metrics', 'Custom KPIs'],
    description: 'Privacy-focused, GDPR-compliant',
  },
];

export function TechStackShowcase({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Stack Tecnológico' : 'Technology Stack'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEs
              ? 'Construido con las tecnologías más avanzadas y confiables del mercado'
              : 'Built with the most advanced and reliable technologies in the market'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techStack.map((tech, idx) => (
            <motion.div
              key={tech.category}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tech.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
              
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${tech.color} mb-6`}>
                <tech.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{tech.category}</h3>
              <p className="text-gray-600 mb-6">{tech.description}</p>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {tech.technologies.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Rocket, value: '< 50ms', label: isEs ? 'Tiempo de Respuesta' : 'Response Time' },
              { icon: Zap, value: '100/100', label: isEs ? 'Lighthouse Score' : 'Lighthouse Score' },
              { icon: Globe, value: '200+', label: isEs ? 'Países Servidos' : 'Countries Served' },
              { icon: Shield, value: 'A+', label: isEs ? 'Calificación SSL' : 'SSL Rating' },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="text-center"
              >
                <metric.icon className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm opacity-80">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

