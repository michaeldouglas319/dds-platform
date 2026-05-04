'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewportErrorProps {
  error?: Error;
  onRetry?: () => void;
  resetErrorBoundary?: () => void;
}

/**
 * Error state for 3D viewport
 * Shows error message with retry button and optional error details
 */
export function ViewportError({
  error,
  onRetry,
  resetErrorBoundary,
}: ViewportErrorProps) {
  const handleRetry = () => {
    onRetry?.();
    resetErrorBoundary?.();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 opacity-40" />

      {/* Error grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Center error content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <AlertTriangle className="w-16 h-16 text-destructive" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-md"
        >
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Scene Error
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Failed to load the 3D scene. Please try again or contact support if the problem persists.
          </p>

          {/* Error details (development only) */}
          {error && process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-mono text-destructive text-left break-words">
                {error.message}
              </p>
            </div>
          )}
        </motion.div>

        {/* Retry button */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleRetry}
            variant="default"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
