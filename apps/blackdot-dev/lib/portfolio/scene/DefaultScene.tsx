'use client'

/**
 * DefaultScene Component
 * Fallback 3D scene when no specific scene is defined
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeColors } from './hooks/useThemeColors';

export default function DefaultScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { primary } = useThemeColors();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={primary} />
      </mesh>
    </group>
  );
}
