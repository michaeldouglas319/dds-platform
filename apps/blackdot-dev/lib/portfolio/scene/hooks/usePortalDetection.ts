'use client'

/**
 * usePortalDetection Hook
 * Detects if component is rendered inside a portal (overview card)
 *
 * Best Practices Applied:
 * - Composition pattern
 * - React Three Fiber integration
 * - Enables conditional rendering based on context
 */

import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

export interface PortalDetection {
  isPortal: boolean;
  portalOffsetY: number;
}

/**
 * Hook to detect if scene is rendered in a portal (overview card)
 * Uses React Three Fiber's previousRoot to determine context
 *
 * @returns Object with isPortal boolean and portalOffsetY for positioning
 */
export function usePortalDetection(): PortalDetection {
  const { previousRoot } = useThree();

  const detection = useMemo(() => {
    const isPortal = !!previousRoot;
    const portalOffsetY = isPortal ? -0.2 : 0;

    return {
      isPortal,
      portalOffsetY,
    };
  }, [previousRoot]);

  return detection;
}
