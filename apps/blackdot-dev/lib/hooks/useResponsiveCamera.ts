import { useState, useEffect, useCallback } from 'react';

/**
 * Responsive camera configuration per screen size
 */
export interface BreakpointConfig {
  /** Screen width threshold in pixels */
  width: number;
  /** Camera Y position for this breakpoint */
  yPosition: number;
  /** Field of view (FOV) for this breakpoint (optional, defaults to base FOV) */
  fov?: number;
}

/**
 * Configuration for useResponsiveCamera hook
 */
export interface ResponsiveCameraConfig {
  /** Base camera position [x, y, z] */
  basePosition: [number, number, number];
  /** Base FOV (default: 50) */
  baseFov?: number;
  /** Breakpoints for different screen sizes, ordered smallest to largest */
  breakpoints: BreakpointConfig[];
  /** Aspect ratio range for portrait detection (default: 1.0) */
  portraitThreshold?: number;
  /** Y position adjustment for portrait mode (default: -1) */
  portraitYAdjustment?: number;
  /** Debounce delay for resize events in ms (default: 300) */
  debounceDelay?: number;
  /** Custom aspect ratio multiplier for FOV (default: 0.02) */
  fovAspectMultiplier?: number;
  /** When set, use canvas dimensions for aspect ratio and breakpoints instead of window */
  canvasSize?: { width: number; height: number };
}

/**
 * Hook for responsive camera and model positioning
 *
 * Automatically adjusts camera position and FOV based on screen size.
 * Handles resize events with debouncing for performance.
 *
 * @param config - Configuration object with breakpoints and settings
 * @returns [cameraPosition, cameraFov, updateCamera] - Camera position [x,y,z], FOV, and manual update function
 *
 * @example
 * // Basic usage with common breakpoints
 * const [cameraPos, cameraFov] = useResponsiveCamera({
 *   basePosition: [0, 13, 10],
 *   breakpoints: [
 *     { width: 0, yPosition: 8 },      // Mobile
 *     { width: 640, yPosition: 10 },   // Tablet
 *     { width: 1024, yPosition: 11 },  // Desktop
 *     { width: 1536, yPosition: 13 },  // Large desktop
 *   ],
 * });
 *
 * @example
 * // Advanced usage with custom FOV per breakpoint
 * const [cameraPos, cameraFov] = useResponsiveCamera({
 *   basePosition: [0, 13, 10],
 *   baseFov: 50,
 *   breakpoints: [
 *     { width: 0, yPosition: 8, fov: 45 },      // Mobile
 *     { width: 640, yPosition: 10, fov: 48 },   // Tablet
 *     { width: 1024, yPosition: 11, fov: 50 },  // Desktop
 *     { width: 1536, yPosition: 13, fov: 55 },  // Large desktop
 *   ],
 *   portraitYAdjustment: -1.5,
 *   debounceDelay: 500,
 * });
 */
export function useResponsiveCamera(config: ResponsiveCameraConfig) {
  const {
    basePosition,
    baseFov = 50,
    breakpoints,
    portraitThreshold = 1.0,
    portraitYAdjustment = -1,
    debounceDelay = 300,
    fovAspectMultiplier = 0.02,
    canvasSize: canvasSizeConfig,
  } = config;

  const [cameraPos, setCameraPos] = useState<[number, number, number]>(basePosition);
  const [cameraFov, setCameraFov] = useState(baseFov);

  const configKey = JSON.stringify({
    basePosition,
    baseFov,
    breakpoints,
    portraitThreshold,
    portraitYAdjustment,
    fovAspectMultiplier,
    canvasSize: canvasSizeConfig,
  });

  /**
   * Calculate camera position and FOV from actual canvas size when provided, else window
   */
  const calculateCameraSettings = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = canvasSizeConfig?.width ?? window.innerWidth;
    const height = canvasSizeConfig?.height ?? window.innerHeight;
    const aspectRatio = width / height;

    // Find appropriate breakpoint for current width
    let yPosition = basePosition[1];
    let fov = baseFov;

    // Iterate through breakpoints from largest to smallest
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      if (width >= breakpoints[i].width) {
        yPosition = breakpoints[i].yPosition;
        fov = breakpoints[i].fov ?? baseFov;
        break;
      }
    }

    // Adjust for portrait mode (aspect ratio < threshold)
    if (aspectRatio < portraitThreshold) {
      yPosition += portraitYAdjustment;
    }

    // Fine-tune FOV based on aspect ratio if not explicitly set in breakpoint
    // This helps prevent object deformation on extreme aspect ratios
    if (!breakpoints.some((bp) => bp.width >= width && bp.fov !== undefined)) {
      // Only apply aspect ratio multiplier if FOV wasn't explicitly set
      const fovAdjustment = (aspectRatio - 1) * fovAspectMultiplier * baseFov;
      fov = Math.max(20, Math.min(120, baseFov + fovAdjustment)); // Clamp to reasonable range
    }

    // Update camera position (keep X and Z from base, update Y)
    setCameraPos([basePosition[0], yPosition, basePosition[2]]);
    setCameraFov(fov);
  }, [configKey]);

  /**
   * Manual trigger for camera update (useful for testing or manual refresh)
   */
  const updateCamera = useCallback(() => {
    calculateCameraSettings();
  }, [calculateCameraSettings]);

  // Initial calculation on mount
  useEffect(() => {
    calculateCameraSettings();
  }, [calculateCameraSettings]);

  // Handle resize events with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        calculateCameraSettings();
      }, debounceDelay);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [calculateCameraSettings, debounceDelay]);

  return [cameraPos, cameraFov, updateCamera] as const;
}

export default useResponsiveCamera;
