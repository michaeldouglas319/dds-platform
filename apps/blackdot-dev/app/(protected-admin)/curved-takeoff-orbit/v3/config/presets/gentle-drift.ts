/**
 * Gentle Drift Preset
 *
 * Loose wave following with organic, flowing motion.
 * Particles drift naturally while maintaining general formation.
 */

import type { V3Config } from '../v3.config';
import { V3_CONFIG } from '../v3.config';

export const GENTLE_DRIFT_CONFIG: Partial<V3Config> = {
  verticalWave: {
    enabled: true,
    amplitudeMultiplier: 0.5,   // Wider vertical range
    frequency: 1.0,             // Gentler, 1 wave per orbit
    springConstant: 2.5,        // ⚡ WEAK pull - allows drift
  },

  physics: {
    ...V3_CONFIG.physics,
    donutThickness: 12.0,       // More vertical space
    radialConfinement: 100.0,   // Weaker radial force
    dampingLinear: 0.1,         // Less damping - more momentum
  },

  softGuidance: {
    enabled: true,
    speedVariationTolerance: 0.2,     // ±20% speed variation
    verticalSoftness: 0.5,            // Very loose wave following
    radialComfortZone: 0.5,           // Half of donut has no correction
    individualVariation: true,
  },
};
