'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export interface GlassFormContainerProps {
  /** Position in 3D space */
  position?: [number, number, number];

  /** Scale of the container */
  scale?: number | [number, number, number];

  /** Dimensions of the form container */
  width?: number;

  /** Height of the form container */
  height?: number;

  /** Depth of the form container */
  depth?: number;

  /** Color tint of the glass */
  color?: string;

  /** Transmission level (0=opaque, 1=fully transparent) */
  transmission?: number;

  /** Glass thickness for refraction */
  thickness?: number;

  /** Surface roughness */
  roughness?: number;

  /** Index of refraction */
  ior?: number;

  /** Cast shadows */
  castShadow?: boolean;

  /** Receive shadows */
  receiveShadow?: boolean;
}

/**
 * GlassFormContainer - A frosted glass background for the login form
 *
 * Features:
 * - Realistic glass material with transmission & refraction
 * - Frosted/matte finish for form content visibility
 * - Uses MeshPhysicalMaterial for natural glass look
 * - Responsive scaling
 * - Shadow support for depth
 *
 * @example
 * ```tsx
 * <GlassFormContainer
 *   position={[0, 0, -0.1]}
 *   scale={[3, 4, 0.5]}
 *   color="#ffffff"
 * />
 * ```
 */
export const GlassFormContainer = ({
  position = [0, 0, -0.1],
  scale = 1,
  width = 3,
  height = 4,
  depth = 0.5,
  color = '#ffffff',
  transmission = 0.8,
  thickness = 0.3,
  roughness = 0.3,
  ior = 1.5,
  castShadow = true,
  receiveShadow = true,
}: GlassFormContainerProps) => {
  // Memoize material to prevent recreation
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transmission, // High transparency with frosted effect
      thickness, // Controls refraction depth
      roughness, // Frosted surface (higher = more matte)
      ior, // Index of refraction
      metalness: 0, // Non-metallic
      clearcoat: 0.5, // Subtle glossy coating
      clearcoatRoughness: 0.5, // Matte clearcoat
      envMapIntensity: 0.8, // Environment reflection strength
      side: THREE.DoubleSide, // Render both sides
    });
  }, [color, transmission, thickness, roughness, ior]);

  // Determine scale as array if provided as number
  const scaleArray = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  // Adjust dimensions by scale
  const scaledWidth = width * scaleArray[0];
  const scaledHeight = height * scaleArray[1];
  const scaledDepth = depth * scaleArray[2];

  return (
    <group position={position} scale={scaleArray as any}>
      {/* Main glass box container */}
      <mesh
        material={material}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
        scale={[width, height, depth]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      {/* Optional: Subtle edge highlight for definition */}
      <mesh
        position={[0, 0, depth / 2 + 0.01]}
        scale={[width, height, 0.02]}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom shadow plane for depth perception */}
      <mesh position={[0, -height / 2 - 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 1.5, depth * 2]} />
        <shadowMaterial opacity={0.15} />
      </mesh>
    </group>
  );
};

export default GlassFormContainer;
