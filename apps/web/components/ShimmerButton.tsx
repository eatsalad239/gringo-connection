'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ShimmerButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ShimmerButton({ href, children, className = '' }: ShimmerButtonProps) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </Link>
  );
}

