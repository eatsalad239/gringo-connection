'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Star } from 'lucide-react';

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon?: 'trophy' | 'award' | 'star';
  className?: string;
}

export function AchievementBadge({
  title,
  description,
  icon = 'trophy',
  className = '',
}: AchievementBadgeProps) {
  const icons = {
    trophy: Trophy,
    award: Award,
    star: Star,
  };

  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl ${className}`}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="inline-flex p-3 bg-white/20 rounded-xl mb-4"
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90 text-sm">{description}</p>
    </motion.div>
  );
}

