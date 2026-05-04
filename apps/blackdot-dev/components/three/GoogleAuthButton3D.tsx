'use client';

import { useRef, useState, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface GoogleAuthButton3DProps {
  /** Position in 3D space */
  position?: [number, number, number];

  /** Scale of the button */
  scale?: number;

  /** Click handler */
  onClick?: () => void;

  /** Loading state */
  isLoading?: boolean;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * GoogleButton3DModel - Renders the 3D Google logo model
 */
function GoogleButton3DModel({
  onClick,
  isLoading,
  disabled,
  isHovered,
  scale,
}: {
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  isHovered?: boolean;
  scale: number;
}) {
  const { scene } = useGLTF('/assets/pictures/3d_google_logo.glb');
  const modelRef = useRef<THREE.Group>(null);

  // Clone scene to avoid reusing the same geometry
  const clonedScene = scene.clone();

  useFrame(() => {
    if (!modelRef.current) return;

    // Scale on loading (more prominent) or hover (subtle)
    let targetScale = scale;
    if (isLoading) {
      targetScale = scale * 1.2; // Larger scale when loading
    } else if (isHovered) {
      targetScale = scale * 1.08; // Subtle scale on hover
    }

    modelRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  const handlePointerOver = (e: any) => {
    if (!disabled && !isLoading) {
      e.stopPropagation?.();
    }
  };

  const handlePointerOut = (e: any) => {
    if (!disabled && !isLoading) {
      e.stopPropagation?.();
    }
  };

  const handleClick = (e: any) => {
    if (!disabled && !isLoading) {
      e.stopPropagation?.();
      onClick?.();
    }
  };

  return (
    <group
      ref={modelRef}
      scale={scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

/**
 * GoogleAuthButton3D - 3D Google logo button for OAuth
 *
 * Features:
 * - 3D model-based Google logo
 * - Interactive hover and click effects
 * - Loading state animation (rotation)
 *
 * @example
 * ```tsx
 * <GoogleAuthButton3D onClick={handleGoogleAuth} />
 * ```
 */
export const GoogleAuthButton3D = ({
  position = [0, 0, 0],
  scale = 1,
  onClick,
  isLoading = false,
  disabled = false,
  
}: GoogleAuthButton3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerOver = (e: any) => {
    if (!disabled && !isLoading) {
      e.stopPropagation?.();
      setIsHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e: any) => {
    if (!disabled && !isLoading) {
      e.stopPropagation?.();
      setIsHovered(false);
      document.body.style.cursor = 'auto';
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Suspense fallback={null}>
        <GoogleButton3DModel
          onClick={onClick}
          isLoading={isLoading}
          disabled={disabled}
          isHovered={isHovered}
          scale={scale}
        />
      </Suspense>
    </group>
  );
};

export default GoogleAuthButton3D;
