'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile screen size
 * @param breakpoint - Width threshold for mobile detection (default: 1024px)
 * @returns Boolean indicating if screen is mobile-sized
 */
export function useMobileDetection(breakpoint = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}
