"use client"

/**
 * Inline Model Viewer Component
 * Reusable component for displaying 3D models inline within HTML content
 * Optimized for mobile with lower DPR and performance settings
 */

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { ModelRenderer, type ModelType } from '../scene/components/ModelRenderer';
import { MorphModelRenderer } from '../scene/components/MorphModelRenderer';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';

interface InlineModelViewerProps {
  modelType: ModelType;
  textureUrl?: string;
  color?: string;
  height?: number | string;
  autoRotate?: boolean;
  onClick?: () => void;
  className?: string;
  enableMorph?: boolean; // New: Enable morph animations on hover
  morphIntensity?: number; // New: Control morph effect strength
}

/**
 * Inline Model Viewer
 * Displays a 3D model in a contained Canvas for inline use in HTML content
 */
export function InlineModelViewer({
  modelType,
  textureUrl,
  color,
  height = 250,
  autoRotate = false,
  onClick,
  className = '',
  enableMorph = false, // Default: morph disabled for inline viewers (opt-in)
  morphIntensity = 0.5,
}: InlineModelViewerProps) {
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden bg-background/5 border border-border/50 ${className}`}
      style={{ height: heightValue }}
      onClick={onClick}
      onMouseEnter={() => enableMorph && setIsHovered(true)}
      onMouseLeave={() => enableMorph && setIsHovered(false)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <SceneErrorBoundary>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">Loading model...</div>
          </div>
        }>
          <Canvas
            camera={{ position: [0, 0, 3], fov: 50 }}
            dpr={[1, 1.5]} // Lower DPR on mobile for performance
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
              alpha: true,
            }}
            frameloop={autoRotate ? 'always' : 'demand'}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, 3, -5]} intensity={0.4} />

            {/* Environment */}
            <Environment preset="studio" />

            {/* Model with optional morph support */}
            {enableMorph ? (
              <MorphModelRenderer
                modelType={modelType}
                textureUrl={textureUrl}
                color={color}
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                scale={1.5}
                enableMorph={true}
                isHovered={isHovered}
                morphIntensity={morphIntensity}
              />
            ) : (
              <ModelRenderer
                modelType={modelType}
                textureUrl={textureUrl}
                color={color}
                position={[0, 0, 0]}
                rotation={[0, 0, 0]}
                scale={1.5}
              />
            )}

            {/* Controls - optional, can be disabled for static display */}
            {!autoRotate && (
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
              />
            )}
          </Canvas>
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}

