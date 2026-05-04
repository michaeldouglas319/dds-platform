'use client';

import { Suspense, ReactNode, useCallback, useState } from 'react';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { ViewportSkeleton, ViewportError } from '../components/Fallback';
import { useAdaptiveResolution } from '@/lib/utils/resolutionOptimization';
import { cn } from '@/lib/utils';

interface ViewportPanelProps {
  children: ReactNode;
  showStats?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  className?: string;
  onQualityChange?: (quality: 'low' | 'medium' | 'high' | 'auto') => void;
}

/**
 * 3D viewport wrapper with error boundary and suspense
 * Handles loading states, errors, and adaptive resolution
 *
 * @category layout
 * @layer 3
 */
export function ViewportPanel({
  children,
  showStats = false,
  quality = 'auto',
  className,
  onQualityChange,
}: ViewportPanelProps) {
  const [error, setError] = useState<Error | null>(null);
  const { capabilities, settings } = useAdaptiveResolution();

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  const handleQualityChange = useCallback(
    (newQuality: 'low' | 'medium' | 'high' | 'auto') => {
      onQualityChange?.(newQuality);
    },
    [onQualityChange]
  );

  return (
    <div className={cn('relative w-full h-full overflow-hidden bg-background', className)}>
      {/* Error state */}
      {error && (
        <ViewportError
          error={error}
          onRetry={handleRetry}
          resetErrorBoundary={() => setError(null)}
        />
      )}

      {/* Error boundary + Suspense wrapper */}
      {!error && (
        <SceneErrorBoundary
          fallback={
            <ViewportError
              error={new Error('Failed to render 3D scene')}
              onRetry={handleRetry}
            />
          }
        >
          <Suspense fallback={<ViewportSkeleton />}>
            {children}
          </Suspense>
        </SceneErrorBoundary>
      )}

      {/* Quality indicator badge */}
      {quality === 'auto' && (
        <div className="absolute top-4 left-4 z-10 viewport-hud">
          <div className="viewport-badge">
            <span className="text-muted-foreground">Quality:</span>
            <span className="text-primary">
              {settings.quality.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* FPS counter (development only) */}
      {showStats && process.env.NODE_ENV === 'development' && (
        <StatsOverlay />
      )}
    </div>
  );
}

/**
 * Simple FPS counter component
 * Only renders in development mode
 */
function StatsOverlay() {
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastTime, setLastTime] = useState(Date.now());

  // RAF-based FPS counter
  const updateFps = useCallback(() => {
    const now = Date.now();
    setFrameCount((prev) => {
      const count = prev + 1;
      if (now - lastTime >= 1000) {
        setFps(count);
        setLastTime(now);
        return 0;
      }
      return count;
    });
    requestAnimationFrame(updateFps);
  }, [lastTime]);

  // Start FPS counter on mount
  // Note: This is a simplified version; for production, use Three.js stats
  const [started, setStarted] = useState(false);
  if (!started) {
    setStarted(true);
    requestAnimationFrame(updateFps);
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 viewport-hud">
      <div className="text-xs font-mono text-chart-1">
        FPS: <span className="text-foreground">{fps}</span>
      </div>
    </div>
  );
}
