'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitalResumeScene } from '../scene/OrbitalResumeScene';
import { useOrbitalState } from '../hooks/useOrbitalState';
import { resumeJobs } from '@/lib/config/content';

/**
 * OrbitalResumeLayout Component
 * Main layout for orbital carousel resume
 *
 * Architecture:
 * - Uses useOrbitalState for card selection and rotation
 * - Canvas with OrbitalResumeScene for 3D rendering
 * - No scroll handling (click-based navigation)
 * - Responsive design with mobile fallback
 *
 * @example
 * export default function OrbitalResumePage() {
 *   return <OrbitalResumeLayout />;
 * }
 */
export function OrbitalResumeLayout() {
  const orbital = useOrbitalState(resumeJobs.length);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      {/* 3D Canvas */}
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <p className="text-foreground/60 mb-2">Loading orbital scene...</p>
              <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
            </div>
          </div>
        }
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 8, 40], fov: 60 }}
          style={{ width: '100%', height: '100%' }}
        >
          <OrbitalResumeScene orbital={orbital} />
        </Canvas>
      </Suspense>

      {/* Control Hints - Bottom Right */}
      <div className="fixed bottom-6 right-6 bg-background/50 backdrop-blur-lg border border-border rounded-lg p-4 text-sm text-foreground/60 max-w-xs space-y-2 pointer-events-none">
        <p className="font-semibold text-foreground/80">Controls</p>
        <ul className="text-xs space-y-1">
          <li>• Click cards to select</li>
          <li>• Use navigation buttons</li>
          <li>• Arrow keys (coming soon)</li>
        </ul>
      </div>

      {/* Selection Indicator - Top Right */}
      <div className="fixed top-6 right-6 bg-background/50 backdrop-blur-lg border border-border rounded-lg p-4 text-sm">
        <p className="text-foreground/80 font-semibold mb-1">
          {orbital.selectedIndex + 1} of {resumeJobs.length}
        </p>
        {resumeJobs[orbital.selectedIndex] && (
          <p className="text-foreground/60 text-xs">
            {resumeJobs[orbital.selectedIndex].company}
          </p>
        )}
      </div>
    </div>
  );
}
