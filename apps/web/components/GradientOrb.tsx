'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GradientOrbProps {
  size?: number;
  color?: 'blue' | 'purple' | 'pink' | 'green';
  className?: string;
}

export function GradientOrb({
  size = 400,
  color = 'blue',
  className = '',
}: GradientOrbProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 100,
        y: (e.clientY / window.innerHeight - 0.5) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const colors = {
    blue: 'from-blue-500/30 via-cyan-500/20 to-transparent',
    purple: 'from-purple-500/30 via-pink-500/20 to-transparent',
    pink: 'from-pink-500/30 via-rose-500/20 to-transparent',
    green: 'from-green-500/30 via-emerald-500/20 to-transparent',
  };

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${colors[color]} ${className}`}
      style={{
        width: size,
        height: size,
        x: mousePosition.x * 0.5,
        y: mousePosition.y * 0.5,
      }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

