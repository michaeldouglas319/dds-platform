'use client';

import { useSimpleParticles } from '../hooks/useSimpleParticles';
import { useMouseSphere } from '../hooks/useMouseSphere';

/**
 * Ultra-simple particle scene - just falling points
 */
export function SimpleParticleScene() {
  useSimpleParticles();
  const spherePosition = useMouseSphere();

  return (
    <>
      {/* Mouse-tracked sphere */}
      <mesh position={spherePosition}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshStandardMaterial
          color="#ff3366"
          emissive="#ff3366"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Grid for reference */}
      <gridHelper args={[400, 40]} position={[0, -50, 0]} />

      {/* Axes */}
      <axesHelper args={[100]} />

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[50, 100, 50]} intensity={1} />
    </>
  );
}
