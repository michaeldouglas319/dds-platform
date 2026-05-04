'use client'

/**
 * BaseScene Component
 * Gold Standard foundation for all 3D scenes
 *
 * Best Practices Applied:
 * - Composition pattern (not inheritance)
 * - Theme-reactive colors
 * - Portal detection for conditional rendering
 * - Performance optimized
 * - Memory management with cleanup
 * - Adaptive lighting based on context
 *
 * Based on research:
 * - React Three Fiber best practices
 * - DDSv2 BaseScene implementation
 * - Composition over inheritance pattern
 */

import { ReactNode, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeColors } from './hooks/useThemeColors';
import { usePortalDetection } from './hooks/usePortalDetection';

export interface BaseSceneProps {
  /** Additional children content */
  children?: ReactNode;

  /** Portal view content (rendered when in overview card) */
  portalContent?: ReactNode;

  /** Detail view content (rendered when in full page) */
  detailContent: ReactNode;

  /** Lighting configuration */
  lighting?: {
    ambientIntensity?: { portal: number; detail: number };
    directionalIntensity?: { portal: number; detail: number };
    directionalPosition?: [number, number, number];
    castShadows?: boolean;
  };

  /** Floor configuration */
  floor?: {
    enabled?: boolean;
    size?: [number, number];
    color?: { dark: string; light: string };
    roughness?: number;
    metalness?: number;
  };

  /** Environment preset */
  environment?: string | false;

  /** Fog configuration */
  fog?: {
    enabled?: boolean;
    near?: number;
    far?: number;
  };

  /** Content group position offset */
  contentPosition?: [number, number, number];

  /** Portal content position offset */
  portalContentPosition?: [number, number, number];

  /** Disable background color (for transparent scenes like neural network) */
  disableBackground?: boolean;
}

/**
 * BaseScene - Shared foundation for all 3D scenes
 *
 * Provides:
 * - Theme-reactive background
 * - Portal detection with conditional rendering
 * - Adaptive lighting (optimized for portal vs detail)
 * - Optional reflective floor (detail mode only)
 * - Environment setup
 * - Fog configuration
 * - Memory disposal
 *
 * @example
 * ```tsx
 * <BaseScene
 *   portalContent={<PortalView />}
 *   detailContent={<DetailView />}
 *   lighting={{
 *     ambientIntensity: { portal: 1.2, detail: 0.8 },
 *   }}
 *   floor={{ enabled: true }}
 *   environment="city"
 * />
 * ```
 */
export function BaseScene({
  children,
  portalContent,
  detailContent,
  lighting = {},
  floor = {},
  environment = 'city',
  fog = {},
  contentPosition = [0, 0, 0],
  portalContentPosition = [0, 0, 0],
  disableBackground = false,
}: BaseSceneProps) {
  const { scene } = useThree();
  const { background, isDark } = useThemeColors();
  const { isPortal, portalOffsetY } = usePortalDetection();

  // Default lighting values
  const {
    ambientIntensity = { portal: 1.2, detail: 0.8 },
    directionalIntensity = { portal: 1.5, detail: 1.0 },
    directionalPosition = [5, 5, 5],
    castShadows = true,
  } = lighting;

  // Default floor values
  const {
    enabled: floorEnabled = false,
    size: floorSize = [20, 20],
    color: floorColor = { dark: '#050505', light: '#f5f5f5' },
    roughness: floorRoughness = 0.7,
    metalness: floorMetalness = 0,
  } = floor;

  // Default fog values
  const {
    enabled: fogEnabled = false,
    near: fogNear = 1,
    far: fogFar = 10,
  } = fog;

  // Set background color
  useEffect(() => {
    if (!disableBackground) {
      // eslint-disable-next-line react-hooks/immutability
      scene.background = background;
    }

    return () => {
      if (scene.background) {
         
        scene.background = null;
      }
    };
  }, [scene, background, disableBackground]);

  // Set fog
  useEffect(() => {
    if (fogEnabled) {
      // eslint-disable-next-line react-hooks/immutability
      scene.fog = new THREE.Fog(background.getHex(), fogNear, fogFar);
    }

    return () => {
       
      scene.fog = null;
    };
  }, [scene, fogEnabled, background, fogNear, fogFar]);

  // Get current intensity based on context
  const currentAmbientIntensity = isPortal
    ? ambientIntensity.portal
    : ambientIntensity.detail;

  const currentDirectionalIntensity = isPortal
    ? directionalIntensity.portal
    : directionalIntensity.detail;

  // Choose floor color based on theme
  const currentFloorColor = isDark ? floorColor.dark : floorColor.light;

  // Show floor only in detail mode (not in portal)
  const showFloor = floorEnabled && !isPortal;

  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={currentAmbientIntensity} />

      {/* Directional Light */}
      <directionalLight
        position={directionalPosition}
        intensity={currentDirectionalIntensity}
        castShadow={castShadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Environment */}
      {environment && <Environment preset={environment as 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'park' | 'lobby'} />}

      {/* Reflective Floor (Detail mode only) */}
      {showFloor && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1, 0]}
          receiveShadow
        >
          <planeGeometry args={floorSize} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={2048}
            mixBlur={1}
            mixStrength={40}
            roughness={floorRoughness}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color={currentFloorColor}
            metalness={floorMetalness}
          />
        </mesh>
      )}

      {/* Content - Conditional based on portal vs detail */}
      <group position={isPortal ? portalContentPosition : contentPosition}>
        {isPortal ? portalContent : detailContent}
      </group>

      {/* Additional children */}
      {children}
    </>
  );
}
