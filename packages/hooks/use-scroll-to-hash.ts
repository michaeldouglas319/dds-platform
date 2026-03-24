'use client';

import { useCallback, useRef } from 'react';

export function useScrollToHash() {
  const scrollTimeout = useRef<ReturnType<typeof setTimeout>>();

  const scrollToHash = useCallback(
    (hash: string, onDone?: () => void) => {
      const id = hash.split('#')[1];
      const targetElement = document.getElementById(id);
      if (!targetElement) return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

      const handleScroll = () => {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          window.removeEventListener('scroll', handleScroll);
          onDone?.();
          window.history.replaceState(null, '', `${window.location.pathname}#${id}`);
        }, 50);
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(scrollTimeout.current);
      };
    },
    []
  );

  return scrollToHash;
}
