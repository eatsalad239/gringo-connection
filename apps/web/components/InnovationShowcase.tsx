'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Brain,
  Rocket,
  Network,
  Code2,
  Database,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

const innovations = [
  {
    icon: Brain,
    title: 'AI-Powered Automation',
    description: '300+ AI models integrated via AIMLAPI',
    features: ['Content Generation', 'Media Creation', 'Smart Analytics'],
  },
  {
    icon: Rocket,
    title: 'Edge Computing',
    description: 'Cloudflare Workers on 200+ global locations',
    features: ['< 50ms Latency', 'Auto-scaling', 'Zero Cold Starts'],
  },
  {
    icon: Network,
    title: 'Real-time Analytics',
    description: 'Live metrics and KPI dashboards',
    features: ['Real-time Updates', 'Custom KPIs', 'Data Visualization'],
  },
  {
    icon: Code2,
    title: 'API-First Architecture',
    description: '50+ RESTful endpoints ready to use',
    features: ['RESTful APIs', 'GraphQL Ready', 'Webhook Support'],
  },
  {
    icon: Database,
    title: 'Enterprise Database',
    description: 'Cloudflare D1 with SQLite compatibility',
    features: ['5GB Free', '5M Reads/Month', 'Global Replication'],
  },
  {
    icon: Lock,
    title: 'Security First',
    description: 'Enterprise-grade security by default',
    features: ['HTTPS Only', 'WAF Protection', 'DDoS Mitigation'],
  },
];

export function InnovationShowcase({ locale }: { locale: string }) {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            {isEs ? 'Innovación Tecnológica' : 'Technical Innovation'}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Capacidades de Vanguardia' : 'Cutting-Edge Capabilities'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEs
              ? 'Tecnologías y características que demuestran innovación y excelencia técnica'
              : 'Technologies and features that demonstrate innovation and technical excellence'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {innovations.map((innovation, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Icon */}
              <div className="relative z-10 mb-6">
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 group-hover:scale-110 transition-transform shadow-lg">
                  <innovation.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {innovation.title}
                </h3>
                <p className="text-gray-600 mb-6">{innovation.description}</p>

                {/* Features */}
                <ul className="space-y-2">
                  {innovation.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center text-sm text-gray-700">
                      <Zap className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

