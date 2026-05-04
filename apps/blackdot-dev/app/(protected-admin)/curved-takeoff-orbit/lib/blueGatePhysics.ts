/**
 * Blue Gate Attraction System
 *
 * GOLD STANDARD - Phase 3: State-Based Attraction Zones
 *
 * Core Rule #2: Blue Gate Attraction (NOT Repulsion)
 * - Timed/state-based ATTRACTION pulls particles smoothly
 * - Entry attraction: Trajectory → Orbit transition
 * - Exit attraction: Orbit → Landing transition
 * - Natural spacing through well-timed pulls
 */

import * as THREE from 'three';

/**
 * Blue gate configuration
 */
export interface BlueGateConfig {
  // Gate geometry
  position: THREE.Vector3;          // Gate center position
  radius: number;                   // Capture zone radius

  // Entry attraction (trajectory → orbit)
  entryAttraction: {
    enabled: boolean;
    maxStrength: number;            // Max force magnitude
    activationProgress: number;     // Start at this curve progress (0-1)
    falloffPower: number;           // Distance falloff exponent
  };

  // Exit attraction (orbit → landing)
  exitAttraction: {
    enabled: boolean;
    maxStrength: number;
    minAngleTraveled: number;       // Radians (e.g., 2π * 1.1 = 1.1 orbits)
    minTimeInOrbit: number;         // Seconds
    falloffPower: number;
  };

  // Transition blending
  transitionBlendTime: number;      // Seconds for momentum blending
}

/**
 * Particle state for gate interaction
 */
export interface ParticleGateState {
  phase: 'takeoff' | 'orbit' | 'landing';
  curveProgress?: number;           // For takeoff phase (0-1)
  orbitAngle?: number;              // For orbit phase (current angle)
  orbitEntryAngle?: number;         // Where particle entered orbit
  orbitTimeTotal?: number;          // Time spent in orbit
  isExitEligible?: boolean;         // Can exit orbit
  angleTraveled?: number;           // Total angle traveled (accumulated)
}

/**
 * Attraction force result
 */
export interface AttractionForce {
  force: THREE.Vector3;
  magnitude: number;
  isActive: boolean;
  reason?: string;                  // Debug: why attraction is/isn't active
}

/**
 * Default blue gate configuration
 */
export const DEFAULT_BLUE_GATE_CONFIG: BlueGateConfig = {
  position: new THREE.Vector3(0, 0, 0),
  radius: 20.0,  // Increased from 5.0 - larger zone for stronger pull throughout orbit

  entryAttraction: {
    enabled: true,
    maxStrength: 2.0,
    activationProgress: 0.8,        // Start at 80% through curve
    falloffPower: 2.0,              // Quadratic falloff
  },

  exitAttraction: {
    enabled: true,
    maxStrength: 3.0,  // Increased from 1.5 - stronger pull toward gate
    minAngleTraveled: Math.PI * 2 * 1.1,
    minTimeInOrbit: 8.0,
    falloffPower: 2.0,
  },

  transitionBlendTime: 0.3,
};

/**
 * Calculate entry attraction force (trajectory → orbit)
 */
export function calculateEntryAttraction(
  particlePosition: THREE.Vector3,
  particleState: ParticleGateState,
  gateConfig: BlueGateConfig
): AttractionForce {
  // Check if entry attraction is enabled
  if (!gateConfig.entryAttraction.enabled) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: 'Entry attraction disabled',
    };
  }

  // Only apply during takeoff phase
  if (particleState.phase !== 'takeoff') {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Wrong phase: ${particleState.phase}`,
    };
  }

  // Check curve progress
  const progress = particleState.curveProgress ?? 0;
  if (progress < gateConfig.entryAttraction.activationProgress) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Progress too low: ${progress.toFixed(2)} < ${gateConfig.entryAttraction.activationProgress}`,
    };
  }

  // Calculate distance to gate
  const toGate = new THREE.Vector3().subVectors(gateConfig.position, particlePosition);
  const distance = toGate.length();

  // Check if within gate radius
  if (distance > gateConfig.radius) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Outside gate radius: ${distance.toFixed(2)} > ${gateConfig.radius}`,
    };
  }

  // Calculate attraction strength with falloff
  // Strength increases as particle gets closer (inverse of distance)
  const normalizedDistance = distance / gateConfig.radius; // 0-1
  const falloff = 1 - Math.pow(normalizedDistance, gateConfig.entryAttraction.falloffPower);
  const strength = gateConfig.entryAttraction.maxStrength * falloff;

  // Direction toward gate
  const direction = toGate.normalize();
  const force = direction.multiplyScalar(strength);

  return {
    force,
    magnitude: strength,
    isActive: true,
    reason: `Active (progress: ${progress.toFixed(2)}, dist: ${distance.toFixed(2)})`,
  };
}

/**
 * Calculate exit attraction force (orbit → landing)
 */
export function calculateExitAttraction(
  particlePosition: THREE.Vector3,
  particleState: ParticleGateState,
  gateConfig: BlueGateConfig
): AttractionForce {
  // Check if exit attraction is enabled
  if (!gateConfig.exitAttraction.enabled) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: 'Exit attraction disabled',
    };
  }

  // Only apply during orbit phase
  if (particleState.phase !== 'orbit') {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Wrong phase: ${particleState.phase}`,
    };
  }

  // Check if particle is exit eligible
  if (!particleState.isExitEligible) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: 'Not exit eligible',
    };
  }

  // Verify angle requirement using accumulated angle traveled
  const angleTraveled = particleState.angleTraveled ?? 0;

  if (angleTraveled < gateConfig.exitAttraction.minAngleTraveled) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Angle too low: ${angleTraveled.toFixed(2)} < ${gateConfig.exitAttraction.minAngleTraveled.toFixed(2)}`,
    };
  }

  // Verify time requirement
  const timeInOrbit = particleState.orbitTimeTotal ?? 0;
  if (timeInOrbit < gateConfig.exitAttraction.minTimeInOrbit) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Time too low: ${timeInOrbit.toFixed(2)}s < ${gateConfig.exitAttraction.minTimeInOrbit}s`,
    };
  }

  // Calculate distance to gate
  const toGate = new THREE.Vector3().subVectors(gateConfig.position, particlePosition);
  const distance = toGate.length();

  // Check if within gate radius
  if (distance > gateConfig.radius) {
    return {
      force: new THREE.Vector3(0, 0, 0),
      magnitude: 0,
      isActive: false,
      reason: `Outside gate radius: ${distance.toFixed(2)} > ${gateConfig.radius}`,
    };
  }

  // Calculate attraction strength with falloff
  const normalizedDistance = distance / gateConfig.radius;
  const falloff = 1 - Math.pow(normalizedDistance, gateConfig.exitAttraction.falloffPower);
  const strength = gateConfig.exitAttraction.maxStrength * falloff;

  // Direction toward gate
  const direction = toGate.normalize();
  const force = direction.multiplyScalar(strength);

  return {
    force,
    magnitude: strength,
    isActive: true,
    reason: `Active (angle: ${angleTraveled.toFixed(2)}, time: ${timeInOrbit.toFixed(2)}s, dist: ${distance.toFixed(2)})`,
  };
}

/**
 * Create blue gate at orbit entry angle
 */
export function createBlueGate(
  orbitCenter: THREE.Vector3,
  orbitRadius: number,
  entryAngle: number,
  partialConfig?: Partial<BlueGateConfig>
): BlueGateConfig {
  // Calculate gate position on orbit perimeter
  const gatePosition = new THREE.Vector3(
    orbitCenter.x + Math.cos(entryAngle) * orbitRadius,
    orbitCenter.y,
    orbitCenter.z + Math.sin(entryAngle) * orbitRadius
  );

  return {
    ...DEFAULT_BLUE_GATE_CONFIG,
    ...partialConfig,
    position: gatePosition,
  };
}

/**
 * Check if particle is near gate
 */
export function isNearGate(
  particlePosition: THREE.Vector3,
  gateConfig: BlueGateConfig
): boolean {
  const distance = particlePosition.distanceTo(gateConfig.position);
  return distance < gateConfig.radius;
}

/**
 * Validate blue gate configuration
 */
export function validateBlueGateConfig(config: BlueGateConfig): string[] {
  const errors: string[] = [];

  if (config.radius <= 0) {
    errors.push('Gate radius must be positive');
  }

  if (config.entryAttraction.enabled) {
    if (config.entryAttraction.maxStrength < 0) {
      errors.push('Entry attraction max strength must be non-negative');
    }
    if (config.entryAttraction.activationProgress < 0 || config.entryAttraction.activationProgress > 1) {
      errors.push('Entry activation progress must be between 0 and 1');
    }
    if (config.entryAttraction.falloffPower <= 0) {
      errors.push('Entry falloff power must be positive');
    }
  }

  if (config.exitAttraction.enabled) {
    if (config.exitAttraction.maxStrength < 0) {
      errors.push('Exit attraction max strength must be non-negative');
    }
    if (config.exitAttraction.minAngleTraveled < 0) {
      errors.push('Exit min angle traveled must be non-negative');
    }
    if (config.exitAttraction.minTimeInOrbit < 0) {
      errors.push('Exit min time in orbit must be non-negative');
    }
    if (config.exitAttraction.falloffPower <= 0) {
      errors.push('Exit falloff power must be positive');
    }
  }

  if (config.transitionBlendTime < 0) {
    errors.push('Transition blend time must be non-negative');
  }

  return errors;
}
