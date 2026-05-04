"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to detect screen size and calculate responsive offsets
 * Returns offset values for positioning model and content
 * On large screens: models positioned at right edge (justify-end equivalent)
 */
export function useResponsiveOffset() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [modelOffset, setModelOffset] = useState(0); // X offset for 3D model
  const [contentOffset, setContentOffset] = useState<'left' | 'center'>('center');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkScreen = () => {
      const width = window.innerWidth;
      const large = width >= 1024; // lg breakpoint
      setIsLargeScreen(large);
      
      if (large) {
        // Large screens: position model closer to content (moved left)
        const offset = 0.0; // Position model closer to content
        setModelOffset(offset);
        setContentOffset('left');
      } else {
        // Small/medium screens: center everything
        setModelOffset(0);
        setContentOffset('center');
      }
    };
    
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return { isLargeScreen, modelOffset, contentOffset };
}

