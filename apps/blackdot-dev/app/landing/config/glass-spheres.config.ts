import type { SphereConfig } from '@/components/three/GlassSphereCluster';

export type SphereLayoutPreset = 'minimal' | 'standard' | 'expansive';

export interface GlassSphereLayoutConfig {
  spheres: SphereConfig[];
  groupRotationSpeed: number;
}

// MINIMAL: 2-3 spheres optimized for mobile
export const MINIMAL_LAYOUT: GlassSphereLayoutConfig = {
  groupRotationSpeed: 0.05,
  spheres: [
    {
      id: 'main',
      localPosition: [0, 0, 0],
      scale: 1.8,
      mobileScale: 1.5,
      color: '#4a90e2',
      transmission: 0.92,
      thickness: 0.4,
      roughness: 0.06,
      ior: 1.5,
      floatIntensity: 0.25,
      floatSpeed: 1.2,
      rotationSpeed: 0.3,
      interactive: true,
    },
    {
      id: 'secondary',
      localPosition: [2, 1, -1],
      scale: 1.2,
      mobileScale: 0.9,
      color: '#7ed321',
      transmission: 0.94,
      thickness: 0.35,
      roughness: 0.05,
      ior: 1.5,
      floatIntensity: 0.2,
      floatSpeed: 1.5,
      rotationSpeed: 0.4,
      interactive: true,
    },
  ],
};

// STANDARD: 4-5 spheres for balanced experience
export const STANDARD_LAYOUT: GlassSphereLayoutConfig = {
  groupRotationSpeed: 0.08,
  spheres: [
    {
      id: 'main',
      localPosition: [0, 0, 0],
      scale: 2.0,
      mobileScale: 1.4,
      tabletScale: 1.6,
      color: '#4a90e2',
      transmission: 0.95,
      thickness: 0.5,
      roughness: 0.05,
      ior: 1.5,
      floatIntensity: 0.3,
      floatSpeed: 1.2,
      rotationSpeed: 0.35,
      interactive: true,
    },
    {
      id: 'secondary-right',
      localPosition: [3, 1.5, 0],
      scale: 1.4,
      mobileScale: 0.8,
      tabletScale: 1.1,
      color: '#7ed321',
      transmission: 0.93,
      thickness: 0.4,
      roughness: 0.06,
      ior: 1.5,
      floatIntensity: 0.25,
      floatSpeed: 1.5,
      rotationSpeed: 0.4,
      interactive: true,
    },
    {
      id: 'secondary-left',
      localPosition: [-3, 1.5, 0],
      scale: 1.4,
      mobileScale: 0.8,
      tabletScale: 1.1,
      color: '#06b6d4',
      transmission: 0.92,
      thickness: 0.45,
      roughness: 0.055,
      ior: 1.5,
      floatIntensity: 0.28,
      floatSpeed: 1.4,
      rotationSpeed: 0.38,
      interactive: true,
    },
    {
      id: 'tertiary-top',
      localPosition: [0, 3, -1.5],
      scale: 1.2,
      mobileScale: 0.6,
      tabletScale: 0.9,
      color: '#ec4899',
      transmission: 0.94,
      thickness: 0.35,
      roughness: 0.05,
      ior: 1.5,
      floatIntensity: 0.2,
      floatSpeed: 1.6,
      rotationSpeed: 0.45,
      interactive: true,
    },
  ],
};

// EXPANSIVE: 5-6 spheres for dramatic desktop experience
export const EXPANSIVE_LAYOUT: GlassSphereLayoutConfig = {
  groupRotationSpeed: 0.1,
  spheres: [
    {
      id: 'main',
      localPosition: [0, 0, 0],
      scale: 2.2,
      mobileScale: 1.3,
      tabletScale: 1.7,
      color: '#4a90e2',
      transmission: 0.96,
      thickness: 0.55,
      roughness: 0.04,
      ior: 1.5,
      floatIntensity: 0.35,
      floatSpeed: 1.0,
      rotationSpeed: 0.3,
      interactive: true,
    },
    {
      id: 'right-front',
      localPosition: [3.5, 1, 1],
      scale: 1.6,
      mobileScale: 0.7,
      tabletScale: 1.2,
      color: '#7ed321',
      transmission: 0.94,
      thickness: 0.42,
      roughness: 0.055,
      ior: 1.5,
      floatIntensity: 0.28,
      floatSpeed: 1.3,
      rotationSpeed: 0.42,
      interactive: true,
    },
    {
      id: 'left-front',
      localPosition: [-3.5, 1, 1],
      scale: 1.6,
      mobileScale: 0.7,
      tabletScale: 1.2,
      color: '#06b6d4',
      transmission: 0.93,
      thickness: 0.48,
      roughness: 0.05,
      ior: 1.5,
      floatIntensity: 0.3,
      floatSpeed: 1.2,
      rotationSpeed: 0.4,
      interactive: true,
    },
    {
      id: 'right-back',
      localPosition: [3, 2.5, -2],
      scale: 1.3,
      mobileScale: 0.6,
      tabletScale: 0.95,
      color: '#f59e0b',
      transmission: 0.92,
      thickness: 0.4,
      roughness: 0.06,
      ior: 1.5,
      floatIntensity: 0.25,
      floatSpeed: 1.4,
      rotationSpeed: 0.45,
      interactive: true,
    },
    {
      id: 'left-back',
      localPosition: [-3, 2.5, -2],
      scale: 1.3,
      mobileScale: 0.6,
      tabletScale: 0.95,
      color: '#ec4899',
      transmission: 0.93,
      thickness: 0.38,
      roughness: 0.055,
      ior: 1.5,
      floatIntensity: 0.27,
      floatSpeed: 1.5,
      rotationSpeed: 0.48,
      interactive: true,
    },
    {
      id: 'top-center',
      localPosition: [0, 3.5, -1],
      scale: 1.0,
      mobileScale: 0.5,
      tabletScale: 0.8,
      color: '#a78bfa',
      transmission: 0.95,
      thickness: 0.32,
      roughness: 0.045,
      ior: 1.5,
      floatIntensity: 0.2,
      floatSpeed: 1.7,
      rotationSpeed: 0.5,
      interactive: true,
    },
  ],
};

/**
 * Get the appropriate glass sphere layout based on viewport size
 */
export function getGlassSphereLayout(
  preset: SphereLayoutPreset = 'standard'
): GlassSphereLayoutConfig {
  switch (preset) {
    case 'minimal':
      return MINIMAL_LAYOUT;
    case 'expansive':
      return EXPANSIVE_LAYOUT;
    case 'standard':
    default:
      return STANDARD_LAYOUT;
  }
}

/**
 * Get layout preset based on breakpoint
 */
export function getLayoutPresetForBreakpoint(
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): SphereLayoutPreset {
  switch (breakpoint) {
    case 'mobile':
      return 'minimal';
    case 'tablet':
      return 'standard';
    case 'desktop':
    default:
      return 'expansive';
  }
}
