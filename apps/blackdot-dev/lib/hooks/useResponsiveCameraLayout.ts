'use client';

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PerspectiveCamera } from 'three';
import type { Breakpoint } from './useResponsiveCanvas';

export interface ResponsiveCameraLayoutConfig {
  breakpoint: Breakpoint;
  aspectRatio: number;
}

/**
 * Simplified responsive camera hook for layout adjustments
 * Adjusts camera FOV and position based on breakpoint and aspect ratio
 */
export function useResponsiveCameraLayout(config: ResponsiveCameraLayoutConfig) {
  const { camera } = useThree();

  useEffect(() => {
    if (!camera || !(camera instanceof PerspectiveCamera)) return;

    // Adjust camera FOV and position based on breakpoint
    const fov = config.breakpoint === 'mobile' ? 50 : config.breakpoint === 'tablet' ? 45 : 40;
    const distance = config.breakpoint === 'mobile' ? 8 : config.breakpoint === 'tablet' ? 6 : 5;

    // Three.js objects must be mutated to apply changes
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = fov;
     
    camera.aspect = config.aspectRatio;
    // eslint-disable-next-line react-hooks/immutability
    camera.position.z = distance;
    camera.updateProjectionMatrix();
  }, [camera, config.breakpoint, config.aspectRatio]);
}
