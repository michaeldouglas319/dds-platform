'use client';

import React, { useRef, useState } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as random from 'maath/random';

interface StarsProps {
  color?: string;
  size?: number;
  sizeAttenuation?: boolean;
}

/**
 * Animated star field component
 *
 * Features:
 * - 5000 point particles forming a rotating sphere
 * - Smooth rotation animation
 * - Optimized with frustum culling disabled for visibility
 * - Customizable color, size, and material properties
 */
export const Stars = React.forwardRef<any, StarsProps>(({
  color = '#ffa0e0',
  size = 0.005,
  sizeAttenuation = true,
}: StarsProps, ref) => {
  const pointsRef = useRef<any>(null);
  const [sphere] = useState(() => {
    const positions = new Float32Array(5000 * 3);
    const result = random.inSphere(positions, { radius: 1.5 });
    return result as Float32Array;
  });

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x -= delta / 10;
      pointsRef.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={pointsRef}
        positions={sphere}
        stride={3}
        frustumCulled={false}
      >
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation={sizeAttenuation}
          depthWrite={false}
        />
      </Points>
    </group>
  );
});

Stars.displayName = 'Stars';
