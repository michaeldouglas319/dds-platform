'use client';

import { Suspense, useRef } from 'react';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { RunwayGround } from '../components/RunwayGround';
import { RunwayParticleSystem } from '../components/RunwayParticleSystem';
import { ScalableOrbitingParticles, type ScalableOrbitingParticlesRef } from '../particle/ScalableOrbitingParticles';
import { HybridSystemDemo } from '../components/HybridSystemDemo';
import { AnnotationManager } from '@/lib/threejs/annotations/annotationManager';
import { RUNWAY_CONFIG } from '../config/runway.config';
import { PhysicsProvider } from '../physics/PhysicsProvider';

// Using isolated ScalableOrbitingParticles - self-contained, no config needed

interface HomeV2SceneProps {
  particleScale?: number;
  particlePosition?: [number, number, number];
  originRotation?: [number, number, number];
}

const DEFAULT_SCALE = 100;
const DEFAULT_POSITION: [number, number, number] = [5, 50, 0];

export function HomeV2Scene({
  particleScale = DEFAULT_SCALE,
  particlePosition = DEFAULT_POSITION,
  originRotation = [0, 0, 0],
}: HomeV2SceneProps) {
  const orbitingParticlesRef = useRef<ScalableOrbitingParticlesRef | null>(null);

  return (
    <PhysicsProvider>
      {/* Lighting */}
      <ambientLight intensity={2.5} />
      <spotLight
        position={[0, 40, 0]}
        angle={0.5}
        penumbra={1}
        intensity={8.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2.0}
        castShadow
      />

      {/* Background Orbiting Particles (isolated, scalable) */}
      <Suspense fallback={null}>
        <ScalableOrbitingParticles
          ref={orbitingParticlesRef}
          scale={particleScale}
          position={particlePosition}
          visible={true}
          originRotation={originRotation}
        />
      </Suspense>

      {/* Ground */}
      <Suspense fallback={null}>
        <RunwayGround />
      </Suspense>

      {/* Multi-Fleet Runway Particles (main simulation layer) */}
      <Suspense fallback={null}>
        <RunwayParticleSystem
          orbitingParticlesRef={orbitingParticlesRef as React.RefObject<ScalableOrbitingParticlesRef>}
          originRotation={originRotation}
        />
      </Suspense>

      {/* Hybrid Path-Based System Demo */}
      <Suspense fallback={null}>
        <HybridSystemDemo />
      </Suspense>

      {/* Annotations */}
      <AnnotationManager
        annotations={RUNWAY_CONFIG.annotations as any}
        hideDistance={100}
        scale={1}
      />

      {/* Shadows */}
      <ContactShadows
        frames={1}
        rotation-x={[Math.PI / 2]}
        position={[0, 0.01, 0]}
        far={0.4}
        width={100}
        height={100}
        blur={4}
      />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={15}
        maxDistance={250}
        enableZoom={true}
        enablePan={true}
        autoRotate={false}
        target={[5, 0, 0]} // Orbit around scene center
      />
    </PhysicsProvider>
  );
}
