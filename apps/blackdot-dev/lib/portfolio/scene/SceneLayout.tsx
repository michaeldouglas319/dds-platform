'use client'

/**
 * SceneLayout Component
 * Standardized Canvas wrapper for all 3D scenes
 *
 * Best Practices Applied:
 * - Consistent Canvas configuration
 * - Error boundaries for 3D content
 * - Performance optimized settings
 * - SSR-safe initialization
 * - Overlay support for UI content
 */

import { ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';

export interface SceneLayoutProps {
  /** 3D scene content */
  children: ReactNode;

  /** Overlay content (HTML/UI) */
  overlay?: ReactNode;

  /** Camera configuration */
  camera?: {
    fov?: number;
    position?: [number, number, number];
    near?: number;
    far?: number;
  };

  /** Canvas container class */
  className?: string;

  /** Enable shadows */
  shadows?: boolean;

  /** Device pixel ratio */
  dpr?: number | [number, number];

  /** WebGL renderer options */
  gl?: Record<string, unknown>;

  /** Fallback content while loading */
  fallback?: ReactNode;
}

/**
 * SceneLayout - Standardized 3D scene wrapper
 *
 * Provides consistent Canvas setup with:
 * - Error boundaries
 * - Performance optimization
 * - Responsive sizing
 * - Overlay support
 *
 * @example
 * ```tsx
 * <SceneLayout
 *   camera={{ fov: 50, position: [0, 0, 8] }}
 *   overlay={<UIOverlay />}
 * >
 *   <MyScene />
 * </SceneLayout>
 * ```
 */
export function SceneLayout({
  children,
  overlay,
  camera = {},
  className = 'w-full h-screen',
  shadows = true,
  dpr = [1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1],
  gl = {},
  fallback = (
    <div className="flex items-center justify-center w-full h-full bg-background">
      <div className="text-sm text-muted-foreground">Loading 3D scene...</div>
    </div>
  ),
}: SceneLayoutProps) {
  // Default camera config
  const {
    fov = 50,
    position = [0, 0, 8],
    near = 0.1,
    far = 1000,
  } = camera;

  // Default GL config (performance optimized)
  const glConfig = {
    antialias: true,
    powerPreference: 'high-performance' as const,
    preserveDrawingBuffer: false,
    alpha: false,
    stencil: false,
    depth: true,
    ...gl,
  } as const;

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <div className={className}>
        <SceneErrorBoundary>
          <Suspense fallback={fallback}>
            <Canvas
              shadows={shadows}
              dpr={dpr}
              camera={{
                fov,
                position,
                near,
                far,
              }}
              gl={glConfig}
            >
              {children}
            </Canvas>
          </Suspense>
        </SceneErrorBoundary>
      </div>

      {/* Overlay Content */}
      {overlay && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {overlay}
        </div>
      )}
    </div>
  );
}
