'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface ResponsiveCanvasSize {
  width: number;
  height: number;
  pixelRatio: number;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export interface UseResponsiveCanvasReturn {
  canvasSize: ResponsiveCanvasSize;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  forceUpdate: () => void;
}

export function useResponsiveCanvas(
  initialWidth: number = 800,
  initialHeight: number = 600,
  options?: {
    breakpoints?: { mobile: number; tablet: number };
    pixelRatioScale?: number;
    /** Use window inner dimensions (e.g. full-screen canvas) instead of container measure */
    useViewportSize?: boolean;
  }
): UseResponsiveCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<ResponsiveCanvasSize>({
    width: initialWidth,
    height: initialHeight,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
  });
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  const breakpoints = {
    mobile: options?.breakpoints?.mobile ?? 640,
    tablet: options?.breakpoints?.tablet ?? 1024
  };

  const getBreakpoint = useCallback((width: number): Breakpoint => {
    if (width <= breakpoints.mobile) return 'mobile';
    if (width <= breakpoints.tablet) return 'tablet';
    return 'desktop';
  }, [breakpoints.mobile, breakpoints.tablet]);

  const updateSize = useCallback(() => {
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const scale = options?.pixelRatioScale ?? 1;

    if (options?.useViewportSize && typeof window !== 'undefined') {
      const w = Math.floor(window.innerWidth);
      const h = Math.floor(window.innerHeight);
      setCanvasSize({
        width: w,
        height: h,
        pixelRatio: pixelRatio * scale
      });
      setBreakpoint(getBreakpoint(w));
      return;
    }

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const newBreakpoint = getBreakpoint(rect.width);

    setCanvasSize({
      width: Math.floor(rect.width),
      height: Math.floor(rect.height),
      pixelRatio: pixelRatio * scale
    });

    setBreakpoint(newBreakpoint);
  }, [getBreakpoint, options?.pixelRatioScale, options?.useViewportSize]);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);

    const observer = new ResizeObserver(() => updateSize());
    const el = containerRef.current;
    if (!options?.useViewportSize && el) {
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, [updateSize, options?.useViewportSize]);

  return {
    canvasSize,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    canvasRef,
    containerRef,
    forceUpdate: updateSize
  };
}
