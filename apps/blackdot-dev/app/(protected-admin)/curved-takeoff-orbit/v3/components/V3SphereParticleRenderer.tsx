/**
 * V3 Sphere Particle Renderer
 *
 * Simple glowing emissive spheres (no PointLight contribution).
 * Lighter on performance than orb renderer.
 */

'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { V3Config } from '../config/v3.config';
import type { V3ParticlesState } from '../hooks/useV3Particles';

interface V3SphereParticleRendererProps {
  config: V3Config;
  particlesState: V3ParticlesState;
}

export function V3SphereParticleRenderer({ config, particlesState }: V3SphereParticleRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Orb settings from config (with safe defaults)
  const orbConfig = config.display.orb || {
    lightPower: 800,
    lightDistance: 100,
    sphereRadius: 0.3,
  };

  // Create sphere geometry with emissive material
  const geometry = useMemo(
    () => new THREE.SphereGeometry(orbConfig.sphereRadius, 16, 8),
    [orbConfig.sphereRadius]
  );

  // Initialize instanced mesh
  useEffect(() => {
    if (meshRef.current) {
      // Initialize all instances as hidden (scale = 0)
      const hiddenMatrix = new THREE.Matrix4();
      const zeroScale = new THREE.Vector3(0, 0, 0);

      for (let i = 0; i < config.particleCount; i++) {
        hiddenMatrix.compose(
          new THREE.Vector3(0, 0, 0),
          new THREE.Quaternion(),
          zeroScale
        );
        meshRef.current.setMatrixAt(i, hiddenMatrix);
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [config.particleCount]);

  // Update sphere positions and colors every frame
  useFrame(() => {
    if (!meshRef.current) return;

    const particles = particlesState.particles;
    let needsUpdate = false;

    for (let i = 0; i < Math.min(particles.length, config.particleCount); i++) {
      const particle = particles[i];

      if (particle.scale > 0) {
        // Create transform matrix
        const matrix = new THREE.Matrix4();
        matrix.compose(
          particle.position,
          particle.quaternion,
          new THREE.Vector3(particle.scale, particle.scale, particle.scale)
        );
        meshRef.current.setMatrixAt(i, matrix);
        meshRef.current.setColorAt(i, particle.color);
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, config.particleCount]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        vertexColors={true}
        emissive={0x000000}
        emissiveIntensity={config.display.hybridGlow?.particleEmissive ?? 0.3}
        toneMapped={false}
        roughness={0.3}
        metalness={0.1}
      />
    </instancedMesh>
  );
}
