'use client';

import { useMemo } from 'react';
import { useLeapParticles } from '../hooks/useLeapParticles';
import { useVirtualHand } from '../hooks/useVirtualHand';
import type { UseLeapParticlesConfig } from '../hooks/useLeapParticles';

export interface LeapParticleSceneProps extends UseLeapParticlesConfig {
  onStats?: (stats: { fps: number; particles: number }) => void;
}

export function LeapParticleScene({
  particleCount = 65536,
  handBounceRatio = 0.1,
  handForce = 0.015,
  gravity = 10,
  particlesDropRadius = 20,
  particlesFromY = 300,
  particlesYDynamicRange = 300,
  useBillboardParticle = false,
  onStats,
}: LeapParticleSceneProps) {
  const hand = useVirtualHand();

  const { particleMesh } = useLeapParticles(
    {
      handMatrices: hand.handMatrices,
      palmVelocity: hand.palmVelocity,
    },
    {
      particleCount,
      handBounceRatio,
      handForce,
      gravity,
      particlesDropRadius,
      particlesFromY,
      particlesYDynamicRange,
      useBillboardParticle,
    }
  );

  // Render particle mesh using primitive
  if (!particleMesh) {
    console.log('No particle mesh available yet');
    return null;
  }
  
  console.log('Rendering particle mesh:', particleMesh);
  return <primitive object={particleMesh} />;
}
