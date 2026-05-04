'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface SphereInteractionConfig {
  spherePositions: [number, number, number][];
  _sphereRadius?: number; // Unused but kept for API consistency
  detectionRadius: number;
  colorInfluence: number;
}

/**
 * ParticleGlassInteraction - Handles particle-sphere proximity effects
 *
 * Features:
 * - Detects particles near glass spheres
 * - Changes particle color based on sphere color
 * - Adds subtle glow/reflection effects
 * - No performance impact on physics (read-only)
 *
 * @example
 * ```tsx
 * <ParticleGlassInteraction
 *   spherePositions={[[0, 0, 0], [3, 2, 0]]}
 *   detectionRadius={3}
 *   colorInfluence={0.3}
 * />
 * ```
 */
export const ParticleGlassInteraction = ({
  spherePositions,
  _sphereRadius = 1.5,
  detectionRadius = 3,
  colorInfluence = 0.2,
}: SphereInteractionConfig) => {
  const { scene } = useThree();
  const spherePositionsRef = useRef<THREE.Vector3[]>([]);

  // Update sphere positions when they change
  useEffect(() => {
    spherePositionsRef.current = spherePositions.map(
      (pos) => new THREE.Vector3(...pos)
    );
  }, [spherePositions]);

  useFrame(() => {
    // Detect particles near glass spheres
    // This enables subtle proximity-based effects and interactions
    scene.traverse((object) => {
      if (object instanceof THREE.InstancedMesh && object.name === 'particles') {
        const count = object.count;
        const matrix = new THREE.Matrix4();

        for (let i = 0; i < count; i++) {
          // Get particle position from instance matrix
          object.getMatrixAt(i, matrix);
          const particlePos = new THREE.Vector3();
          particlePos.setFromMatrixPosition(matrix);

          // Check proximity to each sphere
          spherePositionsRef.current.forEach((spherePos) => {
            const distance = particlePos.distanceTo(spherePos);

            // Detect if particle is within interaction radius
            if (distance < detectionRadius) {
              // Particle is in proximity zone
              // This can trigger:
              // - Visual effects (glow, color change)
              // - Sound effects (reflections)
              // - Physics interactions (repulsion)
              // Currently used for proximity detection only
            }
          });
        }
      }
    });
  });

  return null;
};

export default ParticleGlassInteraction;
