'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { ParallaxScrollState } from '../../hooks/useParallaxScroll';

interface ParallaxCameraProps {
  /** Scroll state from useParallaxScroll hook */
  scrollState: ParallaxScrollState;
  /** Camera zoom level (default: 100 for orthographic) */
  zoom?: number;
  /** Lerp amount for smooth following (0-1, higher = faster) */
  lerpAmount?: number;
}

/**
 * ParallaxCamera Component
 * Orthographic camera that follows scroll position with smooth lerp animation
 *
 * Pattern from React Three Fiber scroll example:
 * - Uses orthographic camera (no perspective distortion, cleaner for parallax)
 * - Follows scrollState.top.current with lerp smoothing
 * - Updates position in useFrame for consistent motion
 *
 * @example
 * <Canvas orthographic>
 *   <ParallaxCamera scrollState={scrollState} zoom={100} />
 * </Canvas>
 */
export function ParallaxCamera({
  scrollState,
  zoom = 100,
  lerpAmount = 0.1
}: ParallaxCameraProps) {
  const { camera } = useThree();
  const currentY = useRef<number>(0);

  // Set initial camera properties
  camera.zoom = zoom;
  camera.updateProjectionMatrix();

  useFrame(() => {
    // Calculate target Y position from scroll
    // Negative because we want to move the camera down as we scroll down
    const targetY = -scrollState.top.current * 100;

    // Smooth lerp animation
    currentY.current = THREE.MathUtils.lerp(currentY.current, targetY, lerpAmount);

    // Update camera position
    camera.position.y = currentY.current;
    camera.updateProjectionMatrix();
  });

  return null; // Camera is controlled via useThree hook
}
