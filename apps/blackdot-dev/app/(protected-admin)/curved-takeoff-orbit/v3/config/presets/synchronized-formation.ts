/**
 * Synchronized Formation Preset (Default)
 *
 * Tight choreography with synchronized wave patterns.
 * Beautiful visual spectacle with minimal deviation.
 */

import type { V3Config } from '../v3.config';
import { V3_CONFIG } from '../v3.config';

export const SYNCHRONIZED_FORMATION_CONFIG: Partial<V3Config> = {
  verticalWave: {
    enabled: true,
    amplitudeMultiplier: 0.3,   // Moderate wave height
    frequency: 2.0,             // 2 full waves per orbit
    springConstant: 5.0,        // Strong pull - tight formation
  },

  physics: {
    ...V3_CONFIG.physics,
    donutThickness: 10.0,       // Standard thickness
    radialConfinement: 120.0,   // Strong confinement
    dampingLinear: 0.15,        // Standard damping
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
    enabled: false,             // ⚡ Use hard rules for tight formation
    speedVariationTolerance: 0.05,
    verticalSoftness: 0.2,
    radialComfortZone: 0.3,
    individualVariation: false,
  },
};

// This is essentially the default V3_CONFIG
// Exported for completeness
