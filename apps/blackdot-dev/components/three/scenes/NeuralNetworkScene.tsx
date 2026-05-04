"use client"

import { Suspense, useRef } from 'react';
import { ContactShadows } from '@react-three/drei';
import { NeuralNetwork } from '@/components/three/models/NeuralNetwork';
import { OrbitingParticleSystem } from '@/components/three/particles/OrbitingParticleSystem';
import { PARTICLE_CONFIG } from '@/app/landing/config/particle.config';
import { NetworkRef } from '@/app/landing/types/network.types';
import { NeuralNetworkLighting } from '@/app/resumev3/scene/components/NeuralNetworkLighting';
import { BaseScene } from '@/components/shared/layouts/BaseScene';
import * as THREE from 'three';

interface NeuralNetworkSceneProps {
  /** Particle count multiplier (0-1) for performance scaling */
  particleCountMultiplier?: number;
  /** Whether to show contact shadows */
  showContactShadows?: boolean;
}

/**
 * Shared neural network scene component
 * Reusable across portal and detail views
 * Uses BaseScene for consistent scene foundation
 */
export function NeuralNetworkScene({
  particleCountMultiplier = 1,
  showContactShadows = true
}: NeuralNetworkSceneProps) {
  const networkCollisionRef = useRef<NetworkRef | null>(null);

  // Collision handler for neural network
  const handleParticleCollision = (particleColor: THREE.Color, intensity: number) => {
    if (networkCollisionRef.current) {
      networkCollisionRef.current.handleCollision(particleColor, intensity);
    }
  };

  // Main content: Neural network and particle system
  const neuralNetworkContent = (
    <Suspense fallback={null}>
      {/* Neural Network - same as landing page */}
      <NeuralNetwork
        position={[0, -0.09, 0]}
        collisionRef={networkCollisionRef as React.RefObject<NetworkRef>}
      />

      {/* Orbiting Particle System */}
      <OrbitingParticleSystem
        count={Math.floor(PARTICLE_CONFIG.count * particleCountMultiplier)}
        objectPosition={[0, -0.09, 0]}
        avoidanceRadius={PARTICLE_CONFIG.avoidanceRadius}
        avoidanceStrength={PARTICLE_CONFIG.avoidanceStrength}
        orbitalSpeed={PARTICLE_CONFIG.orbitalSpeed}
        collisionHandler={handleParticleCollision}
        collisionThreshold={0.15}
        networkRef={networkCollisionRef as React.RefObject<NetworkRef>}
      />

      {/* Contact Shadows - disabled in portal to avoid clipping */}
      {showContactShadows && (
        <ContactShadows
          frames={1}
          rotation-x={Math.PI / 2}
          position={[0, -0.33, 0]}
          far={0.4}
          width={2}
          height={2}
          blur={4}
        />
      )}
    </Suspense>
  );

  return (
    <BaseScene
      detailContent={neuralNetworkContent}
      portalContent={neuralNetworkContent}
      lighting={{
        ambientIntensity: { portal: 2.5, detail: 2.5 },
        directionalIntensity: { portal: 1.0, detail: 1.0 },
        castShadows: true,
      }}
      floor={{
        enabled: false, // No floor for neural network scene
      }}
      environment={false} // No environment preset for cleaner neural network view
      fog={{
        enabled: false, // No fog for cleaner view
      }}
      disableBackground={true} // Transparent background for neural network
    >
      {/* Custom neural network lighting (spot lights and point light) */}
      <NeuralNetworkLighting />
    </BaseScene>
  );
}