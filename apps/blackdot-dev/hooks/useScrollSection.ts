"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to track which section is currently in view based on scroll position
 * Optimized with requestAnimationFrame for better performance
 */
export function useScrollSection(totalSections: number) {
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafId = useRef<number | null>(null);
  const ticking = useRef(false);

  const updateScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - windowHeight;
    
    if (maxScroll <= 0) {
      setScrollProgress(0);
      setCurrentSection(0);
      ticking.current = false;
      return;
    }
    
    // Calculate progress (0 to 1)
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    setScrollProgress(progress);
    
    // Calculate current section based on scroll
    const sectionHeight = maxScroll / totalSections;
    const section = Math.min(
      totalSections - 1,
      Math.floor(scrollY / sectionHeight)
    );
    setCurrentSection(section);
    
    ticking.current = false;
  }, [totalSections]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafId.current = requestAnimationFrame(updateScroll);
      }
    };

    // Initial call - defer to avoid synchronous setState in effect
    // Use requestAnimationFrame to ensure it runs after render
    const initialRafId = requestAnimationFrame(() => {
      updateScroll();
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      cancelAnimationFrame(initialRafId);
    };
  }, [updateScroll]);

  return { currentSection, scrollProgress };
}
