/**
 * V3 Particle Renderer
 *
 * GPU-instanced particle rendering with per-particle colors
 */

'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { V3Config } from '../config/v3.config';
import type { V3ParticlesState } from '../hooks/useV3Particles';

interface V3ParticleRendererProps {
  config: V3Config;
  particlesState: V3ParticlesState;
}

export function V3ParticleRenderer({ config, particlesState }: V3ParticleRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Load the plane model
  const { scene } = useGLTF('/assets/models/2_plane_draco.glb');

  // Extract geometry from the loaded model using V1's proven pattern
  const geometry = useMemo(() => {
    // Find first mesh only (no merging)
    let geo: THREE.BufferGeometry | undefined;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !geo) {
        geo = (child as THREE.Mesh).geometry;
      }
    });

    // Fallback to cone if model fails to load
    if (!geo) {
      console.warn('V3: Plane model geometry not found, using fallback cone');
      return new THREE.ConeGeometry(0.3, 1.5, 8);
    }

    // Clone geometry once
    const cloned = geo.clone();

    // Apply scale from config
    cloned.scale(config.modelOrientation.scale, config.modelOrientation.scale, config.modelOrientation.scale);

    // Apply rotation via matrix - native orientation override from config
    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeRotationFromEuler(
      new THREE.Euler(
        config.modelOrientation.rotationX,
        config.modelOrientation.rotationY,
        config.modelOrientation.rotationZ,
        'XYZ'  // Rotation order
      )
    );
    cloned.applyMatrix4(rotMatrix);

    return cloned;
  }, [scene, config.modelOrientation]);

  // Set mesh ref for particle system and initialize hidden matrices
  useEffect(() => {
    if (meshRef.current) {
      particlesState.instanceMatrixRef.current = meshRef.current;

      // Initialize all instances as hidden (scale = 0) to prevent flash on initial load
      const hiddenMatrix = new THREE.Matrix4();
      const zeroScale = new THREE.Vector3(0, 0, 0);

      for (let i = 0; i < config.particleCount; i++) {
        hiddenMatrix.compose(
          new THREE.Vector3(0, 0, 0),  // Position
          new THREE.Quaternion(),      // Rotation
          zeroScale                    // Scale = 0 (invisible)
        );
        meshRef.current.setMatrixAt(i, hiddenMatrix);
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [particlesState, config.particleCount]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, config.particleCount]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        vertexColors={true}
        roughness={0.3}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

// Preload the plane model for better performance
useGLTF.preload('/assets/models/2_plane_draco.glb');
