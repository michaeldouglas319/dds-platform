'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ParallaxScrollState {
  top: React.MutableRefObject<number>; // 0-1 normalized scroll (like example's state.top.current)
  scrollY: number; // Raw scroll value in pixels
  progress: number; // 0-1 progress through document
  sectionIndex: number; // Current section index based on scroll
  maxScroll: number; // Maximum scrollable distance
}

/**
 * Hook for managing parallax scroll state
 * Tracks scroll position as a ref (like React Three Fiber example pattern)
 * Provides normalized and raw scroll values for parallax calculations
 *
 * Pattern from: https://github.com/pmndrs/react-three-fiber/blob/master/examples/Scroll
 *
 * @param totalSections - Total number of sections for progress calculation
 * @returns Parallax scroll state with ref and progress values
 *
 * @example
 * const scrollState = useParallaxScroll(resumeJobs.length + 1); // +1 for hero
 *
 * useFrame(() => {
 *   const yPos = scrollState.top.current * factor * 10;
 * });
 */
export function useParallaxScroll(totalSections: number = 1): ParallaxScrollState {
  const topRef = useRef<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [maxScroll, setMaxScroll] = useState<number>(0);
  const [sectionIndex, setSectionIndex] = useState<number>(0);

  // useLayoutEffect for resize listener - runs synchronously before paint
  // Ensures maxScroll is set before scroll events fire
  useLayoutEffect(() => {
    const updateMaxScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setMaxScroll(scrollHeight);
    };

    // Use requestAnimationFrame to ensure DOM is fully settled
    const rafId = requestAnimationFrame(() => {
      updateMaxScroll();
    });

    window.addEventListener('resize', updateMaxScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateMaxScroll);
    };
  }, [totalSections]);

  // useEffect for passive scroll listener - runs after paint for better performance
  useEffect(() => {
    const handleScroll = () => {
      const scroll = window.scrollY;
      const maxScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Store raw values
      setScrollY(scroll);

      // Update ref with normalized scroll (0-1)
      // This is the key pattern from the example: state.top.current = normalized value
      if (maxScrollHeight > 0) {
        topRef.current = scroll / maxScrollHeight;
        setProgress(scroll / maxScrollHeight);

        // Calculate current section index based on scroll position
        const sectionHeight = maxScrollHeight / totalSections;
        setSectionIndex(Math.floor(scroll / sectionHeight));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [totalSections]);

  return {
    top: topRef,
    scrollY,
    progress,
    sectionIndex,
    maxScroll
  };
}
