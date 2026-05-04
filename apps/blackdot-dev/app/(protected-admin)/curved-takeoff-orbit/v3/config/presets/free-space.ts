/**
 * Free Space Preset
 *
 * Maximum freedom with minimal constraints.
 * Particles roam freely within expanded donut zone.
 */

import type { V3Config } from '../v3.config';
import { V3_CONFIG } from '../v3.config';

export const FREE_SPACE_CONFIG: Partial<V3Config> = {
  verticalWave: {
    enabled: false,             // ⚡ NO wave guidance
    amplitudeMultiplier: 0,
    frequency: 0,
    springConstant: 0,
  },

  physics: {
    ...V3_CONFIG.physics,
    donutThickness: 20.0,       // ⚡ VERY THICK - maximum vertical space
    radialConfinement: 50.0,    // ⚡ VERY WEAK - barely contained
    dampingLinear: 0.03,        // ⚡ MINIMAL damping - lots of momentum
  },

  collision: {
    enabled: true,              // ⚡ ESSENTIAL for free-roaming
    shape: 'sphere',
    dimensions: { width: 3.5, height: 3.5, depth: 3.5 },
    offset: { x: 0, y: 0, z: 0 },
    strength: 8.0,              // Stronger repulsion
    damping: 0.2,               // More damping to prevent chaos
  },

  softGuidance: {
    enabled: true,
    speedVariationTolerance: 0.3,     // ±30% speed variation
    verticalSoftness: 1.0,            // Maximum softness
    radialComfortZone: 0.7,           // Most of donut is comfort zone
    individualVariation: true,
  },
};
