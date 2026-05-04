/**
 * Flat Highway Preset
 *
 * Traditional 2D circular orbit on horizontal plane.
 * Clean, orderly traffic like cars on a highway.
 */

import type { V3Config } from '../v3.config';
import { V3_CONFIG } from '../v3.config';

export const FLAT_HIGHWAY_CONFIG: Partial<V3Config> = {
  verticalWave: {
    enabled: false,             // ⚡ NO vertical motion
    amplitudeMultiplier: 0,
    frequency: 0,
    springConstant: 0,
  },

  physics: {
    ...V3_CONFIG.physics,
    donutThickness: 2.0,        // ⚡ THIN donut - almost flat
    radialConfinement: 200.0,   // ⚡ STRONG radial force - stay in lane
    dampingLinear: 0.2,         // Higher damping - stable
  },

  collision: {
    enabled: true,
    shape: 'sphere',
    dimensions: { width: 2.5, height: 2.5, depth: 2.5 },
    offset: { x: 0, y: 0, z: 0 },
    strength: 5.0,
    damping: 0.1,
  },

  softGuidance: {
    enabled: true,
    speedVariationTolerance: 0.1,     // ±10% - more uniform speed
    verticalSoftness: 0.0,            // N/A - no wave
    radialComfortZone: 0.2,           // Small comfort zone
    individualVariation: false,        // Uniform behavior
  },
};
