'use client';

import { useFBOParticles, useVirtualHand } from '@/app/particle-interaction/hooks/index';
import {
  particleVertShader,
  particleFragShader,
} from '@/app/particle-interaction/shaders/index';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from 'three';
import { useMemo } from 'react';

interface ParticleInteractionFeatureProps {
  enabled: boolean;
  particleCount: number;
  handBounceRatio: number;
  handForce: number;
  gravity: number;
}

/**
 * ParticleInteractionFeature component
 * Renders SDF-based touch particles that interact with virtual hand
 * Integrated into ConfiguratorScene canvas
 */
export function ParticleInteractionFeature({
  enabled,
  particleCount,
  handBounceRatio,
  handForce,
  gravity,
}: ParticleInteractionFeatureProps) {
  // Initialize particle system (must be before early return)
  const fboParticles = useFBOParticles(particleCount, {
    dropRadius: 150,
    fromY: 200,
    yDynamicRange: 50,
  });

  // Initialize virtual hand tracking
  const hand = useVirtualHand();

  // Create particle material
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertShader,
      fragmentShader: particleFragShader,
      uniforms: {
        texturePosition: { value: fboParticles.positionTexture },
        pointSize: { value: 4.0 }, // Increased for visibility
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, [fboParticles.positionTexture]);

  // Per-frame update
  useFrame((state) => {
    const deltaTime = state.clock.getDelta();

    // Update physics uniforms
    fboParticles.velocityMaterial.uniforms.handBounceRatio.value = handBounceRatio;
    fboParticles.velocityMaterial.uniforms.handForce.value = handForce;
    fboParticles.velocityMaterial.uniforms.gravity.value = gravity;
    fboParticles.velocityMaterial.uniforms.palmVelocity.value =
      hand.palmVelocity;

    // Run compute passes
    fboParticles.compute(hand.handMatrices, deltaTime);

    // Update particle texture reference
    particleMaterial.uniforms.texturePosition.value = fboParticles.positionTexture;
  });

  // Create points mesh
  const pointsMesh = useMemo(() => {
    const mesh = new THREE.Points(fboParticles.particleGeometry, particleMaterial);
    mesh.frustumCulled = false;
    return mesh;
  }, [fboParticles.particleGeometry, particleMaterial]);

  if (!enabled) return null;

  return (
    <>
      {/* Render particles */}
      <primitive object={pointsMesh} />

      {/* Hand visualization - solid sphere */}
      <mesh position={hand.handPosition}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshStandardMaterial
          color="#ff3366"
          emissive="#ff3366"
          emissiveIntensity={0.4}
          wireframe={false}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Wireframe outline */}
      <mesh position={hand.handPosition}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial
          color="#ffaa00"
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Center point */}
      <mesh position={hand.handPosition}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Palm box visualization */}
      <group position={hand.handPosition}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[40, 60, 20]} />
          <meshStandardMaterial
            color="#0066ff"
            emissive="#0066ff"
            emissiveIntensity={0.2}
            wireframe={false}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </>
  );
}
