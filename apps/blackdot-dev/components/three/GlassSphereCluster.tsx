'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FloatingGlassSphere } from './FloatingGlassSphere';

export interface SphereConfig {
  /** Unique identifier */
  id: string;

  /** Position relative to cluster center */
  localPosition: [number, number, number];

  /** Base scale */
  scale: number;

  /** Color of the sphere */
  color?: string;

  /** Transmission level (0=opaque, 1=fully transparent) */
  transmission?: number;

  /** Glass thickness */
  thickness?: number;

  /** Surface roughness */
  roughness?: number;

  /** Index of refraction */
  ior?: number;

  /** Float intensity */
  floatIntensity?: number;

  /** Float speed */
  floatSpeed?: number;

  /** Rotation speed */
  rotationSpeed?: number;

  /** Whether interactive */
  interactive?: boolean;

  /** Scale override for mobile */
  mobileScale?: number;

  /** Scale override for tablet */
  tabletScale?: number;

  /** Click handler */
  onClick?: () => void;
}

export interface GlassSphereClusterProps {
  /** Configuration for each sphere */
  spheres: SphereConfig[];

  /** Center position of the cluster */
  centerPosition?: [number, number, number];

  /** Speed of cluster group rotation */
  groupRotationSpeed?: number;

  /** Whether to apply responsive scaling */
  responsive?: boolean;

  /** Current breakpoint: 'mobile' | 'tablet' | 'desktop' */
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * GlassSphereCluster - Manages a group of floating glass spheres
 *
 * Features:
 * - Multiple interactive glass spheres
 * - Responsive positioning and scaling
 * - Group rotation animation
 * - Coordinated physics behavior
 *
 * @example
 * ```tsx
 * <GlassSphereCluster
 *   spheres={[
 *     {
 *       id: 'main',
 *       localPosition: [0, 0, 0],
 *       scale: 2.0,
 *       color: '#4a90e2',
 *     },
 *     {
 *       id: 'secondary',
 *       localPosition: [3, 2, 0],
 *       scale: 1.5,
 *       color: '#7ed321',
 *     },
 *   ]}
 *   centerPosition={[0, 0, 0]}
 *   breakpoint="desktop"
 * />
 * ```
 */
export const GlassSphereCluster = ({
  spheres,
  centerPosition = [0, 0, 0],
  groupRotationSpeed = 0.1,
  responsive = true,
  breakpoint = 'desktop',
}: GlassSphereClusterProps) => {
  const groupRef = useRef<THREE.Group>(null);

  // Animation loop: slow group rotation
  useFrame((state) => {
    if (!groupRef.current) return;

    // Rotate the entire cluster slowly
    groupRef.current.rotation.y += groupRotationSpeed * 0.001;

    // Optional: subtle bobbing of entire cluster
    const bobOffset = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    groupRef.current.position.y = centerPosition[1] + bobOffset;
  });

  // Get responsive scale multiplier
  const getResponsiveScale = (baseSphere: SphereConfig): number => {
    if (!responsive) return baseSphere.scale;

    switch (breakpoint) {
      case 'mobile':
        return baseSphere.mobileScale ?? baseSphere.scale * 0.6;
      case 'tablet':
        return baseSphere.tabletScale ?? baseSphere.scale * 0.8;
      case 'desktop':
      default:
        return baseSphere.scale;
    }
  };

  return (
    <group
      ref={groupRef}
      position={[centerPosition[0], centerPosition[1], centerPosition[2]]}
    >
      {spheres.map((sphereConfig) => (
        <FloatingGlassSphere
          key={sphereConfig.id}
          position={sphereConfig.localPosition}
          scale={getResponsiveScale(sphereConfig)}
          color={sphereConfig.color}
          transmission={sphereConfig.transmission}
          thickness={sphereConfig.thickness}
          roughness={sphereConfig.roughness}
          ior={sphereConfig.ior}
          floatIntensity={sphereConfig.floatIntensity}
          floatSpeed={sphereConfig.floatSpeed}
          rotationSpeed={sphereConfig.rotationSpeed}
          interactive={sphereConfig.interactive !== false}
          onClick={sphereConfig.onClick}
        />
      ))}
    </group>
  );
};

export default GlassSphereCluster;
