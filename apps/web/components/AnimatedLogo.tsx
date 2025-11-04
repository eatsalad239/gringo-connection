'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function AnimatedLogo({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex items-center gap-2 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.div
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Sparkles className="w-8 h-8 text-blue-600" />
      </motion.div>
      <motion.span
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
        animate={{
          backgroundPosition: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        Gringo Connection
      </motion.span>
    </motion.div>
  );
}

