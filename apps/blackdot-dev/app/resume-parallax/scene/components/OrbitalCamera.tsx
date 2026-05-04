'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

interface OrbitalCameraProps {
  /** Camera zoom level (default: 60 for perspective) */
  zoom?: number;
  /** Distance from center */
  distance?: number;
  /** Height above center */
  height?: number;
}

/**
 * OrbitalCamera Component
 * Fixed perspective camera looking at center of orbital carousel
 *
 * Position:
 * - Positioned in front of and above the orbital center
 * - Looks down at ~20° angle for better card visibility
 * - Far enough to see all cards clearly
 *
 * @example
 * <Canvas>
 *   <OrbitalCamera distance={40} height={8} />
 * </Canvas>
 */
export function OrbitalCamera({
  zoom = 60,
  distance = 40,
  height = 8
}: OrbitalCameraProps) {
  const { camera } = useThree();

  useEffect(() => {
    // Set perspective camera position
    // Positioned in front of (positive Z) and above (positive Y) the orbit center
    camera.position.set(0, height, distance);

    // Look at the center of the orbit
    camera.lookAt(0, 2, 0);

    // Set zoom
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = zoom;
    }

    camera.updateProjectionMatrix();
  }, [camera, distance, height, zoom]);

  return null; // Camera is controlled via useThree hook
}
