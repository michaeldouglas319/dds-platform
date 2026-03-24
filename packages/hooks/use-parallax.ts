'use client';

import { useEffect } from 'react';

export function useParallax(multiplier: number, onChange: (value: number) => void) {
  useEffect(() => {
    let ticking = false;
    let animationFrame: number | null = null;

    const animate = () => {
      const { innerHeight } = window;
      const offsetValue = Math.max(0, window.scrollY) * multiplier;
      const clampedOffsetValue = Math.max(-innerHeight, Math.min(innerHeight, offsetValue));
      onChange(clampedOffsetValue);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [multiplier, onChange]);
}
