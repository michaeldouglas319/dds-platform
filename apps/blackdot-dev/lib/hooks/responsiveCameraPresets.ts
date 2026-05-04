/**
 * Preset configurations for useResponsiveCamera hook
 *
 * Use these as starting points, then customize for your specific scene
 */

import type { ResponsiveCameraConfig } from './useResponsiveCamera';

/**
 * Landing page camera preset
 * Optimized for hero/showcase scenes
 */
export const LANDING_PAGE_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 13, 10],
  baseFov: 50,
  breakpoints: [
    { width: 0, yPosition: 8, fov: 45 },      // Mobile (< 640px)
    { width: 640, yPosition: 10, fov: 48 },   // Tablet (640-1024px)
    { width: 1024, yPosition: 11, fov: 50 },  // Desktop (1024-1536px)
    { width: 1536, yPosition: 13, fov: 55 },  // Large desktop (>1536px)
  ],
  portraitThreshold: 1.0,
  portraitYAdjustment: -1,
  debounceDelay: 300,
  fovAspectMultiplier: 0.02,
};

/**
 * Product showcase preset
 * Lower camera angle for product display
 */
export const PRODUCT_SHOWCASE_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 8, 15],
  baseFov: 45,
  breakpoints: [
    { width: 0, yPosition: 6, fov: 40 },      // Mobile
    { width: 640, yPosition: 7, fov: 43 },    // Tablet
    { width: 1024, yPosition: 8, fov: 45 },   // Desktop
    { width: 1536, yPosition: 9, fov: 48 },   // Large desktop
  ],
  portraitThreshold: 0.9,
  portraitYAdjustment: -1.5,
  debounceDelay: 300,
};

/**
 * Wide-angle scene preset
 * Designed for expansive environments
 */
export const WIDE_SCENE_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 15, 20],
  baseFov: 60,
  breakpoints: [
    { width: 0, yPosition: 12, fov: 55 },     // Mobile
    { width: 640, yPosition: 13, fov: 57 },   // Tablet
    { width: 1024, yPosition: 14, fov: 60 },  // Desktop
    { width: 1536, yPosition: 15, fov: 65 },  // Large desktop
  ],
  portraitThreshold: 1.0,
  portraitYAdjustment: -2,
  debounceDelay: 300,
};

/**
 * Minimal preset
 * Tight camera, focused on center object
 */
export const MINIMAL_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 10, 5],
  baseFov: 40,
  breakpoints: [
    { width: 0, yPosition: 8 },        // Mobile
    { width: 640, yPosition: 9 },      // Tablet
    { width: 1024, yPosition: 10 },    // Desktop
    { width: 1536, yPosition: 11 },    // Large desktop
  ],
  portraitThreshold: 1.0,
  portraitYAdjustment: -1,
  debounceDelay: 300,
};

/**
 * Orbital preset
 * Camera positioned for orbital/rotating scenes
 */
export const ORBITAL_PRESET: ResponsiveCameraConfig = {
  basePosition: [15, 12, 15],
  baseFov: 50,
  breakpoints: [
    { width: 0, yPosition: 10 },       // Mobile
    { width: 640, yPosition: 11 },     // Tablet
    { width: 1024, yPosition: 12 },    // Desktop
    { width: 1536, yPosition: 13 },    // Large desktop
  ],
  portraitThreshold: 0.95,
  portraitYAdjustment: -1.5,
  debounceDelay: 300,
};

/**
 * Isometric preset
 * Elevated camera angle for isometric-style views
 */
export const ISOMETRIC_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 20, 20],
  baseFov: 55,
  breakpoints: [
    { width: 0, yPosition: 16, fov: 50 },     // Mobile
    { width: 640, yPosition: 17, fov: 52 },   // Tablet
    { width: 1024, yPosition: 18, fov: 55 },  // Desktop
    { width: 1536, yPosition: 20, fov: 60 },  // Large desktop
  ],
  portraitThreshold: 0.85,
  portraitYAdjustment: -2,
  debounceDelay: 300,
};

/**
 * Close-up preset
 * Camera positioned very close to subject
 */
export const CLOSE_UP_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 5, 3],
  baseFov: 35,
  breakpoints: [
    { width: 0, yPosition: 4, fov: 32 },      // Mobile
    { width: 640, yPosition: 4.5, fov: 34 },  // Tablet
    { width: 1024, yPosition: 5, fov: 35 },   // Desktop
    { width: 1536, yPosition: 5.5, fov: 37 }, // Large desktop
  ],
  portraitThreshold: 1.0,
  portraitYAdjustment: -0.5,
  debounceDelay: 300,
};

/**
 * Gallery/Grid preset
 * Medium distance, standard view
 */
export const GALLERY_PRESET: ResponsiveCameraConfig = {
  basePosition: [0, 12, 12],
  baseFov: 48,
  breakpoints: [
    { width: 0, yPosition: 10, fov: 45 },     // Mobile
    { width: 640, yPosition: 11, fov: 47 },   // Tablet
    { width: 1024, yPosition: 12, fov: 48 },  // Desktop
    { width: 1536, yPosition: 13, fov: 50 },  // Large desktop
  ],
  portraitThreshold: 1.0,
  portraitYAdjustment: -1.5,
  debounceDelay: 300,
};
