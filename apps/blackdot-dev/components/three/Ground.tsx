'use client';

import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Ground - Reflective floor surface with realistic materials
 *
 * Features:
 * - High-quality material with texture mapping
 * - Normal mapping for surface detail
 * - Configurable metalness and roughness
 * - Seamless integration with 3D scene
 *
 * @example
 * ```tsx
 * <Ground />
 * ```
 */
export const Ground = () => {
  let floor: THREE.Texture | undefined;
  let normal: THREE.Texture | undefined;

  try {
    [floor, normal] = useTexture([
      '/SurfaceImperfections003_1K_var1.jpg',
      '/SurfaceImperfections003_1K_Normal.jpg',
    ]);
  } catch {
    // Textures not available, use plain material
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#a0a0a0"
        metalness={0.4}
        roughness={0.6}
        map={floor}
        normalMap={normal}
        normalScale={new THREE.Vector2(2, 2)}
        envMapIntensity={1.0}
      />
    </mesh>
  );
};

export default Ground;
