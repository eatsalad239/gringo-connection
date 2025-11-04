'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Code, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

export function InteractiveDemo({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [activeDemo, setActiveDemo] = useState(0);
  const [metrics, setMetrics] = useState({
    requests: 0,
    uptime: 99.9,
    latency: 45,
    success: 99.8,
  });

  useEffect(() => {
    if (!inView) return;
    
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        requests: prev.requests + Math.floor(Math.random() * 10),
        uptime: 99.9 + Math.random() * 0.1,
        latency: 40 + Math.random() * 15,
        success: 99.5 + Math.random() * 0.5,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [inView]);

  const demos = [
    {
      title: isEs ? 'Generación de Contenido AI' : 'AI Content Generation',
      description: isEs
        ? 'Genere posts, imágenes y videos en segundos'
        : 'Generate posts, images, and videos in seconds',
      icon: Sparkles,
      metrics: { value: '2.3s', label: isEs ? 'Tiempo Promedio' : 'Avg Time' },
    },
    {
      title: isEs ? 'Análisis en Tiempo Real' : 'Real-time Analytics',
      description: isEs
        ? 'Monitoree KPIs y métricas en tiempo real'
        : 'Monitor KPIs and metrics in real-time',
      icon: TrendingUp,
      metrics: { value: `${metrics.requests.toLocaleString()}`, label: isEs ? 'Solicitudes' : 'Requests' },
    },
    {
      title: isEs ? 'API Endpoints' : 'API Endpoints',
      description: isEs
        ? '50+ endpoints RESTful listos para usar'
        : '50+ RESTful endpoints ready to use',
      icon: Code,
      metrics: { value: '< 50ms', label: isEs ? 'Latencia' : 'Latency' },
    },
    {
      title: isEs ? 'Dashboard de Métricas' : 'Metrics Dashboard',
      description: isEs
        ? 'Visualice datos con gráficos interactivos'
        : 'Visualize data with interactive charts',
      icon: BarChart3,
      metrics: { value: `${metrics.success.toFixed(1)}%`, label: isEs ? 'Éxito' : 'Success' },
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {isEs ? 'Ver en Acción' : 'See It In Action'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {isEs
              ? 'Demostraciones interactivas de nuestras capacidades'
              : 'Interactive demonstrations of our capabilities'}
          </p>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {demos.map((demo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              onClick={() => setActiveDemo(idx)}
              className={`relative cursor-pointer bg-white rounded-2xl p-8 shadow-lg border-2 transition-all ${
                activeDemo === idx
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500`}>
                  <demo.icon className="w-6 h-6 text-white" />
                </div>
                {activeDemo === idx && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                  />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{demo.title}</h3>
              <p className="text-gray-600 mb-6">{demo.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{demo.metrics.value}</div>
                  <div className="text-sm text-gray-500">{demo.metrics.label}</div>
                </div>
                <Play className="w-8 h-8 text-gray-400" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Metrics Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">
            {isEs ? 'Métricas en Tiempo Real' : 'Live Metrics'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: isEs ? 'Solicitudes' : 'Requests',
                value: metrics.requests.toLocaleString(),
                trend: '+12%',
              },
              {
                label: isEs ? 'Uptime' : 'Uptime',
                value: `${metrics.uptime.toFixed(2)}%`,
                trend: 'Stable',
              },
              {
                label: isEs ? 'Latencia' : 'Latency',
                value: `${metrics.latency.toFixed(0)}ms`,
                trend: '-5ms',
              },
              {
                label: isEs ? 'Tasa de Éxito' : 'Success Rate',
                value: `${metrics.success.toFixed(1)}%`,
                trend: '+0.2%',
              },
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
              >
                <div className="text-sm text-white/70 mb-2">{metric.label}</div>
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-green-400">{metric.trend}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

