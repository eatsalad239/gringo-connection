'use client';

import { motion } from 'framer-motion';

export function SectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative py-16 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200"></div>
      </div>
      <div className="relative flex justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
}

