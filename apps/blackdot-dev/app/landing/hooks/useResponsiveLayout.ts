'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Responsive layout configuration for mobile, tablet, and desktop
 */
export interface ResponsiveLayoutConfig {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  particleCount: number;
  sphereCount: number;
  bloomIntensity: number;
  enableShadows: boolean;
  enablePostProcessing: boolean;
  glassMaterialQuality: 'low' | 'medium' | 'high';
  dpr: number; // Device pixel ratio
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const RESPONSIVE_CONFIGS: Record<string, ResponsiveLayoutConfig> = {
  mobile: {
    breakpoint: 'mobile',
    particleCount: 8,
    sphereCount: 2,
    bloomIntensity: 0.02,
    enableShadows: false,
    enablePostProcessing: false,
    glassMaterialQuality: 'low',
    dpr: 1,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  },
  tablet: {
    breakpoint: 'tablet',
    particleCount: 15,
    sphereCount: 4,
    bloomIntensity: 0.03,
    enableShadows: true,
    enablePostProcessing: true,
    glassMaterialQuality: 'medium',
    dpr: 1,
    isMobile: false,
    isTablet: true,
    isDesktop: false,
  },
  desktop: {
    breakpoint: 'desktop',
    particleCount: 25,
    sphereCount: 5,
    bloomIntensity: 0.045,
    enableShadows: true,
    enablePostProcessing: true,
    glassMaterialQuality: 'high',
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  },
};

/**
 * Hook to determine responsive layout configuration
 *
 * Automatically detects breakpoint based on window width and returns
 * optimized configuration for rendering quality and performance.
 *
 * @returns ResponsiveLayoutConfig - Configuration object for current breakpoint
 *
 * @example
 * ```tsx
 * const layoutConfig = useResponsiveLayout();
 *
 * console.log(layoutConfig.particleCount); // 25 on desktop, 8 on mobile
 * console.log(layoutConfig.enablePostProcessing); // true on desktop, false on mobile
 *
 * if (layoutConfig.isMobile) {
 *   // Mobile-specific logic
 * }
 * ```
 */
export function useResponsiveLayout(): ResponsiveLayoutConfig {
  const [config, setConfig] = useState<ResponsiveLayoutConfig>(RESPONSIVE_CONFIGS.desktop);

  // Determine breakpoint from window width
  const getBreakpoint = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      const breakpoint = getBreakpoint();
      setConfig(RESPONSIVE_CONFIGS[breakpoint]);
    };

    // Set initial config
    handleResize();

    // Debounced resize listener
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [getBreakpoint]);

  return useMemo(() => config, [config]);
}

export default useResponsiveLayout;
