'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

/**
 * Hook that tracks mouse position and converts to 3D world space
 * Returns a Vector3 that updates each frame to follow the mouse
 */
export function useMouseSphere() {
  const { viewport, camera } = useThree();
  const positionRef = useRef(new THREE.Vector3(0, 50, 0));

  useFrame((state) => {
    // Convert normalized pointer position to world space
    const x = (state.pointer.x * viewport.width) / 2;
    const y = (state.pointer.y * viewport.height) / 2;
    const z = 0;

    positionRef.current.set(x, y + 50, z);
  });

  return positionRef.current;
}
