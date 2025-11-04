'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Globe, Users } from 'lucide-react';

interface Stat {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

export function LiveStats({ locale }: { locale: string }) {
  const isEs = locale === 'es';
  const [stats, setStats] = useState<Stat[]>([
    {
      icon: Zap,
      label: isEs ? 'Velocidad' : 'Speed',
      value: '45ms',
      change: '+5%',
      trend: 'up',
    },
    {
      icon: Globe,
      label: isEs ? 'Tráfico' : 'Traffic',
      value: '12.5K',
      change: '+23%',
      trend: 'up',
    },
    {
      icon: Users,
      label: isEs ? 'Usuarios' : 'Users',
      value: '1.2K',
      change: '+18%',
      trend: 'up',
    },
    {
      icon: TrendingUp,
      label: isEs ? 'Conversión' : 'Conversion',
      value: '8.3%',
      change: '+2.1%',
      trend: 'up',
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value: stat.label === 'Speed' || stat.label === 'Velocidad'
            ? `${40 + Math.random() * 15}ms`
            : stat.value,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <AnimatePresence>
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
          >
            <stat.icon className="w-6 h-6 text-blue-400 mb-3" />
            <div className="text-sm text-white/70 mb-1">{stat.label}</div>
            <motion.div
              key={stat.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-white mb-1"
            >
              {stat.value}
            </motion.div>
            <div
              className={`text-xs ${
                stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {stat.change}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

