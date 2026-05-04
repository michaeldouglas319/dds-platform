/**
 * Chaotic Swarm Preset
 *
 * High freedom, turbulent movement with emergent patterns.
 * Particles behave like a swarm with minimal constraints.
 */

import type { V3Config } from '../v3.config';
import { V3_CONFIG } from '../v3.config';

export const CHAOTIC_SWARM_CONFIG: Partial<V3Config> = {
  verticalWave: {
    enabled: true,
    amplitudeMultiplier: 0.7,   // ⚡ LARGE wave amplitude
    frequency: 3.0,             // ⚡ CHOPPY - many waves
    springConstant: 1.5,        // ⚡ VERY WEAK pull
  },

  physics: {
    ...V3_CONFIG.physics,
    donutThickness: 18.0,       // ⚡ THICK donut - lots of space
    radialConfinement: 60.0,    // ⚡ WEAK containment
    dampingLinear: 0.05,        // ⚡ MINIMAL damping - bouncy
  },

  collision: {
    enabled: true,
    shape: 'sphere',
    dimensions: {
      width: 3.0,               // Larger collision width for safety
      height: 3.0,
      depth: 3.0,
    },
    offset: { x: 0, y: 0, z: 0 },
    strength: 7.0,              // Stronger repulsion
    damping: 0.15,              // More damping to reduce chaos
  },

  softGuidance: {
    enabled: true,
    speedVariationTolerance: 0.25,    // ±25% speed variation
    verticalSoftness: 0.7,            // Very loose guidance
    radialComfortZone: 0.6,           // Large comfort zone
    individualVariation: true,
  },
};
