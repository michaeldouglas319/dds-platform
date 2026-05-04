'use client'

import { Suspense } from 'react';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { OrbitingParticleSystem } from '../particle/OrbitingParticleSystem';
import { PARTICLE_CONFIG } from '../config/particle.config';

interface Scene3DProps {
  networkRef?: any;
}

export function Scene3D({ networkRef }: Scene3DProps) {
  return (
    <>
      <ambientLight intensity={2.5} />
      <spotLight
        position={[1, 6, 1.5]}
        angle={0.2}
        penumbra={1}
        intensity={3.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-5, 5, -1.5]}
        angle={0.03}
        penumbra={1}
        intensity={4.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[5, 5, -5]}
        angle={0.3}
        penumbra={1}
        intensity={4.5}
        castShadow
        shadow-mapSize={[256, 256]}
        color="#ffffc0"
      />
      <pointLight
        position={[0, 0, 5]}
        intensity={1.5}
        color="#8b5cf6"
        distance={10}
      />

      <Suspense fallback={null}>
        <OrbitingParticleSystem
          count={PARTICLE_CONFIG.count}
          objectPosition={[0, -0.09, 0]}
          avoidanceRadius={PARTICLE_CONFIG.avoidanceRadius}
          avoidanceStrength={PARTICLE_CONFIG.avoidanceStrength}
          orbitalSpeed={PARTICLE_CONFIG.orbitalSpeed}
        />

        <ContactShadows
          frames={1}
          rotation-x={Math.PI / 2}
          position={[0, -0.33, 0]}
          far={0.4}
          width={2}
          height={2}
          blur={4}
        />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={3}
        enableZoom={true}
        enablePan={false}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  );
}


