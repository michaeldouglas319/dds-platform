'use client';

import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

/**
 * Loading skeleton for 3D viewport
 * Shows animated gradient background with spinner while 3D scene loads
 */
export function ViewportSkeleton() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 grid-pattern" />

      {/* Center loading indicator */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        {/* Spinner with rotation animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Loader className="w-12 h-12 text-blue-500" strokeWidth={1.5} />
        </motion.div>

        {/* Loading text with fade animation */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-center"
        >
          <p className="text-base font-medium text-foreground">Loading 3D Scene</p>
          <p className="text-xs text-muted-foreground mt-1">Initializing renderer...</p>
        </motion.div>

        {/* Progress dots animation */}
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
