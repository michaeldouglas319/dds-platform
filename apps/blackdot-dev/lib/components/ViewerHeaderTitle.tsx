/**
 * Viewer Header Title Component
 * Simple, performant title display using same mechanism as progress indicator
 * No complex animations - just simple opacity fade like the progress HUD
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface ViewerHeaderTitleProps {
  /** Array of titles to cycle through */
  titles?: string[];
  /** Current active title (if syncWithActiveSection is true) */
  activeTitle?: string;
  /** If true, shows activeTitle instead of cycling */
  syncWithActiveSection?: boolean;
  /** If false, disables auto-cycling (default: false - no auto cycle) */
  enableCycling?: boolean;
  /** Time each title stays in view (seconds) - only used when cycling */
  timeInView?: number;
  /** Custom className for styling */
  className?: string;
}

export function ViewerHeaderTitle({
  titles = [],
  activeTitle,
  syncWithActiveSection = false,
  enableCycling = false,
  timeInView = 3,
  className = '',
}: ViewerHeaderTitleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle cycling through titles (only if enableCycling is true)
  useEffect(() => {
    if (syncWithActiveSection || !enableCycling || titles.length === 0) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % titles.length);
    }, timeInView * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [titles.length, timeInView, syncWithActiveSection, enableCycling]);

  // Determine what title to show
  let displayTitle: string | null = null;
  let titleKey: string | number = '';

  if (syncWithActiveSection && activeTitle) {
    displayTitle = activeTitle;
    titleKey = activeTitle;
  } else if (titles.length > 0) {
    displayTitle = enableCycling 
      ? (titles[currentIndex] || titles[0] || '')
      : (titles[0] || '');
    titleKey = enableCycling ? currentIndex : titles[0];
  } else if (activeTitle) {
    displayTitle = activeTitle;
    titleKey = activeTitle;
  }

  if (!displayTitle) {
    return null;
  }

  // Use same simple mechanism as progress indicator - just key change with opacity
  return (
    <motion.span
      key={titleKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className || 'text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter leading-none'}
    >
      {displayTitle}
    </motion.span>
  );
}

export default ViewerHeaderTitle;
