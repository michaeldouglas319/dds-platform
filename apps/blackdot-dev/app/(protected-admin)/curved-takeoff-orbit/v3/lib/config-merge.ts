/**
 * Deep Config Merge Utility
 *
 * Merges config overrides deeply into base config without mutation.
 * Useful for overriding nested properties at the component usage level.
 */

import type { V3Config } from '../config/v3.config';

/**
 * Deep merge config overrides
 *
 * @example
 * mergeV3Config(V3_CONFIG, {
 *   display: {
 *     orb: { lightPower: 400 }
 *   }
 * })
 */
export function mergeV3Config(
  baseConfig: V3Config,
  overrides: Partial<V3Config>
): V3Config {
  return {
    ...baseConfig,
    ...overrides,
    // Deep merge nested objects
    orbit: { ...baseConfig.orbit, ...overrides.orbit },
    physics: { ...baseConfig.physics, ...overrides.physics },
    blueGate: { ...baseConfig.blueGate, ...overrides.blueGate },
    exitRequirements: {
      ...baseConfig.exitRequirements,
      ...overrides.exitRequirements,
    },
    landingTransition: {
      ...baseConfig.landingTransition,
      ...overrides.landingTransition,
    },
    trajectorySettings: {
      ...baseConfig.trajectorySettings,
      ...overrides.trajectorySettings,
    },
    verticalWave: { ...baseConfig.verticalWave, ...overrides.verticalWave },
    softGuidance: { ...baseConfig.softGuidance, ...overrides.softGuidance },
    orientation: { ...baseConfig.orientation, ...overrides.orientation },
    collision: { ...baseConfig.collision, ...overrides.collision },
    modelOrientation: {
      ...baseConfig.modelOrientation,
      ...overrides.modelOrientation,
    },
    performance: { ...baseConfig.performance, ...overrides.performance },
    rendering: { ...baseConfig.rendering, ...overrides.rendering },
    // Deep merge display config - preserve all required fields
    display: {
      particleCount: overrides.display?.particleCount ?? baseConfig.display.particleCount,
      particleMode: overrides.display?.particleMode ?? baseConfig.display.particleMode,
      showModels: overrides.display?.showModels ?? baseConfig.display.showModels,
      showStaticObjects: overrides.display?.showStaticObjects ?? baseConfig.display.showStaticObjects,
      orb: overrides.display?.orb
        ? { ...baseConfig.display.orb, ...overrides.display.orb }
        : baseConfig.display.orb,
      hybridGlow: overrides.display?.hybridGlow
        ? { ...baseConfig.display.hybridGlow, ...overrides.display.hybridGlow }
        : baseConfig.display.hybridGlow,
      lighting: overrides.display?.lighting
        ? { ...baseConfig.display.lighting, ...overrides.display.lighting }
        : baseConfig.display.lighting,
    },
    // Deep merge debug config
    debug: { ...baseConfig.debug, ...overrides.debug },
    // Deep merge extended configs
    taxiStaging: { ...baseConfig.taxiStaging, ...overrides.taxiStaging },
    assembly: { ...baseConfig.assembly, ...overrides.assembly },
    health: { ...baseConfig.health, ...overrides.health },
  } as V3Config;
}


