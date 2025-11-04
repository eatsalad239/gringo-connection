'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  duration?: number;
}

export function GlitchText({ text, className = '', duration = 3 }: GlitchTextProps) {
  const [glitched, setGlitched] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitched(true);
      setTimeout(() => setGlitched(false), 200);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={glitched ? { x: [0, -2, 2, -2, 2, 0] } : {}}
      transition={{ duration: 0.2 }}
    >
      <span className="relative z-10">{text}</span>
      {glitched && (
        <>
          <span
            className="absolute inset-0 text-red-500 opacity-75"
            style={{ clipPath: 'inset(40% 0 61% 0)' }}
          >
            {text}
          </span>
          <span
            className="absolute inset-0 text-blue-500 opacity-75"
            style={{ clipPath: 'inset(61% 0 40% 0)' }}
          >
            {text}
          </span>
        </>
      )}
    </motion.span>
  );
}

