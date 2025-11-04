'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function MagneticButton({
  href,
  children,
  variant = 'primary',
  className = '',
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 700 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const baseClasses =
    variant === 'primary'
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
      : 'bg-white/10 backdrop-blur-md text-white border border-white/20';

  return (
    <Link
      href={href}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg overflow-hidden transition-all ${baseClasses} ${className}`}
    >
      <motion.span
        style={{ x: xSpring, y: ySpring }}
        className="relative z-10 flex items-center gap-2"
      >
        {children}
        <ArrowRight
          className={`w-5 h-5 transition-transform ${
            isHovered ? 'translate-x-1' : ''
          }`}
        />
      </motion.span>
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? 0 : '-100%' }}
          transition={{ duration: 0.3 }}
        />
      )}
    </Link>
  );
}

