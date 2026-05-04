'use client';

import { motion } from 'framer-motion';

/**
 * Full configurator layout skeleton
 * Shows placeholder for viewport and control panel while loading
 */
export function ConfiguratorSkeleton() {
  const pulseVariants = {
    pulse: {
      opacity: [0.5, 0.8, 0.5] as number[],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  } as const;

  return (
    <div className="w-full h-screen flex bg-background">
      {/* Viewport skeleton - left side (70%) */}
      <motion.div
        className="flex-[0.7] bg-gradient-to-br from-background to-background/80 relative overflow-hidden"
        variants={pulseVariants}
        animate="pulse"
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10 grid-pattern" />

        {/* Skeleton content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-muted/30 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-muted/30 rounded w-48 mx-auto animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Control panel skeleton - right side (30%) */}
      <motion.div
        className="flex-[0.3] bg-card border-l border-border flex flex-col"
        variants={pulseVariants}
        animate="pulse"
      >
        {/* Header skeleton */}
        <div className="border-b border-border p-4 space-y-3">
          <div className="h-6 bg-muted/30 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted/30 rounded w-1/2 animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Section 1 */}
          <div className="space-y-2">
            <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-full animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-5/6 animate-pulse" />
          </div>

          {/* Section 2 */}
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-full animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-5/6 animate-pulse" />
          </div>

          {/* Section 3 */}
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-full animate-pulse" />
            <div className="h-3 bg-muted/20 rounded w-5/6 animate-pulse" />
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="border-t border-border p-4">
          <div className="h-10 bg-muted/30 rounded w-full animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
