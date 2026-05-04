'use client';

import { ReactNode } from 'react';
import { Physics, type PhysicsProps } from '@react-three/rapier';

/**
 * PhysicsProvider wraps scenes with React Three Rapier physics engine.
 * Configured for orbital mechanics with zero gravity and optimized stepping.
 */
interface PhysicsProviderProps extends Partial<PhysicsProps> {
  children: ReactNode;
}

export function PhysicsProvider({
  children,
  ...props
}: PhysicsProviderProps) {
  return (
    <Physics
      gravity={[0, 0, 0]} // Zero gravity for orbital mechanics - forces applied explicitly
      interpolate={true} // Smooth interpolation between physics frames
      colliders="trimesh" // Detailed collision detection
      paused={false}
      {...props}
    >
      {children}
    </Physics>
  );
}
