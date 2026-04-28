'use client';

import React, { Suspense } from 'react';
import { Skeleton } from '@dds/ui';
import { CanvasErrorBoundary } from './CanvasErrorBoundary';

interface SceneWithFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string | number;
  className?: string;
}

/**
 * SceneWithFallback - Wrapper for 3D scenes with built-in error handling and loading fallbacks.
 *
 * Combines:
 * - Suspense boundary for async scene loading
 * - Error boundary for Canvas/WebGL failures
 * - Skeleton loader during loading state
 * - aria-hidden on canvas elements (3D is visual-only)
 *
 * @param children - Canvas or 3D scene component
 * @param fallback - Custom fallback during loading (defaults to Skeleton)
 * @param height - Container height (string or number, in pixels)
 * @param className - CSS classes for wrapper div
 *
 * @example
 * <SceneWithFallback height={400} className="bg-black">
 *   <Canvas>
 *     <Scene />
 *   </Canvas>
 * </SceneWithFallback>
 */
export const SceneWithFallback: React.FC<SceneWithFallbackProps> = ({
  children,
  fallback,
  height = '100%',
  className,
}) => {
  const style = {
    height: typeof height === 'number' ? `${height}px` : height,
    position: 'relative' as const,
  };

  return (
    <div style={style} className={className}>
      <CanvasErrorBoundary height={height} fallback={fallback}>
        <Suspense
          fallback={
            fallback ?? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Skeleton className="h-full w-full" />
              </div>
            )
          }
        >
          {children}
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
};

SceneWithFallback.displayName = 'SceneWithFallback';

export default SceneWithFallback;
