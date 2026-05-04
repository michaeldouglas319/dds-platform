import { ReactNode, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

interface PitchDeckSectionProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Pitch Deck Section Component
 * Full-height section with scroll-triggered animations
 */
export function PitchDeckSection({ id, children, className = '' }: PitchDeckSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3, once: false });

  return (
    <section
      id={id}
      ref={ref}
      className={`min-h-screen flex items-center justify-center lg:justify-start relative ${className}`}
      data-section-id={id}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-6xl px-6 py-20 lg:pl-16 xl:pl-24 2xl:pl-32"
      >
        {children}
      </motion.div>
    </section>
  );
}




