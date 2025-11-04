'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CheckCircle2, Clock, Rocket } from 'lucide-react';

interface TimelineItem {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  date?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  locale: string;
}

export function Timeline({ items, locale }: TimelineProps) {
  const isEs = locale === 'es';
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const getIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Rocket className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

      <div className="space-y-12">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: idx * 0.2 }}
            className="relative flex items-start gap-6"
          >
            {/* Icon */}
            <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-gray-100">
              {getIcon(item.status)}
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                {item.date && (
                  <span className="text-sm text-gray-500">{item.date}</span>
                )}
              </div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

