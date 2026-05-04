'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { BaseScene } from '@/components/shared/layouts/BaseScene';

/**
 * General Ideas Layout
 * Uses BaseScene-based NeuralNetworkScene for consistent scene foundation
 * 
 * BaseScene provides:
 * - Theme-reactive background
 * - Portal detection
 * - Consistent lighting patterns
 * - Environment setup
 * - Performance optimizations
 */
export default function GeneralIdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen">
      {/* 3D Background Scene with BaseScene */}
      <SceneErrorBoundary>
        <div className="fixed inset-0 z-0">
          <Canvas
            shadows
            dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1]}
            camera={{ position: [0, 0, 1.1], fov: 50 }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
              alpha: true,
            }}
          >
            <Suspense fallback={null}>
              <BaseScene detailContent={null} />
            </Suspense>
          </Canvas>
        </div>
      </SceneErrorBoundary>

      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
