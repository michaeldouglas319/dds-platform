'use client';

/**
 * SectionShowcaseCanvas Component
 *
 * Renders the 3D canvas with:
 * - Canvas3D rendering using React Three Fiber
 * - OrbitControls for camera interaction
 * - ParticleMorphBridge for transition effects
 * - Model loading and animation
 */

import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import { StandardCanvas } from '@/components/three/StandardCanvas';
import { AnimatedModel } from '@/components/canvas3d/AnimatedModel';
import { ParticleMorphBridge } from './ParticleMorphBridge';
import type { UnifiedSection } from '@/lib/config/content/sections.config';
import type { Canvas3DModel } from '@/lib/types/canvas3d.types';

interface SectionShowcaseCanvasProps {
  section: UnifiedSection;
  layoutType: string;
  isTransitioning: boolean;
}

const LAYOUT_COLORS: Record<string, string> = {
  'scroll-based': '#8b5cf6', // Purple
  grid: '#3b82f6', // Blue
  carousel: '#ec4899', // Pink
  timeline: '#10b981', // Green
  gallery: '#f59e0b', // Amber
};

function FallbackContent() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4b5563" />
    </mesh>
  );
}

function CanvasContent({ section, layoutType, isTransitioning }: SectionShowcaseCanvasProps) {
  const modelConfig = section.modelConfig;
  const color = LAYOUT_COLORS[layoutType] || '#3b82f6';

  const canvasModel: Canvas3DModel = {
    id: section.id,
    modelPath: modelConfig?.path || '/assets/models/cube.glb',
    position: (modelConfig?.position as [number, number, number]) || [0, 0, 0],
    rotation: (modelConfig?.rotation as [number, number, number]) || [0, 0, 0],
    scale: (typeof modelConfig?.scale === 'number' ? modelConfig.scale : 1) || 1,
    animation: modelConfig?.animation && modelConfig.animation.type !== 'none'
      ? modelConfig.animation as Canvas3DModel['animation']
      : undefined,
    interactive: false,
  };

  return (
    <>
      {/* Ambient light for even illumination */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* Directional light for shadows and depth */}
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffffff" />

      {/* Point light for dynamic effects */}
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#3b82f6" />
      <pointLight position={[5, 5, -5]} intensity={0.6} color="#8b5cf6" />

      {/* Fog for depth perception */}
      <fog attach="fog" args={['#0f172a', 5, 50]} />

      {/* 3D Model */}
      <Suspense fallback={<FallbackContent />}>
        <AnimatedModel {...canvasModel} />
      </Suspense>

      {/* Particle Morph Bridge */}
      <ParticleMorphBridge
        isActive={isTransitioning}
        layoutType={layoutType as any}
        position={[0, 0, 0]}
        color={color}
      />

      {/* Orbit Controls for camera interaction */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom
        enablePan
        autoRotate
        autoRotateSpeed={2}
        minDistance={2}
        maxDistance={20}
      />
    </>
  );
}

export default function SectionShowcaseCanvas(props: SectionShowcaseCanvasProps) {
  return (
    <StandardCanvas
      id={`showcase-canvas-${props.section.id}`}
      className="w-full h-full"
      camera={{
        position: [0, 0, 8],
        fov: 50,
      }}
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
      performance="auto"
      frameloop="always"
    >
      <CanvasContent {...props} />
    </StandardCanvas>
  );
}
