'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  trigger?: boolean;
  count?: number;
}

export function Confetti({ trigger = false, count = 50 }: ConfettiProps) {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    endY?: number;
  }>>([]);

  useEffect(() => {
    if (!trigger || typeof window === 'undefined') return;

    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    const newConfetti = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      endY: window.innerHeight + 100,
    }));

    setConfetti(newConfetti);

    setTimeout(() => setConfetti([]), 3000);
  }, [trigger, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: `${piece.y}%`,
          }}
          animate={{
            y: [0, piece.endY || 1000],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [piece.rotation, piece.rotation + 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

