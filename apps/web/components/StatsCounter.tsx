'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function StatsCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: StatsCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const startValue = 0;
    const endValue = value;
    const steps = 60;
    const increment = (endValue - startValue) / steps;
    const stepDuration = (duration * 1000) / steps;

    let current = startValue;
    const timer = setInterval(() => {
      current += increment;
      if (current >= endValue) {
        setDisplayValue(endValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {Math.floor(displayValue).toLocaleString()}
      {suffix}
    </motion.span>
  );
}

