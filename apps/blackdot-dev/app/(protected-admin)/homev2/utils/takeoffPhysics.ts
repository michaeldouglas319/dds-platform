'use client';

import * as THREE from 'three';
import { RUNWAY_CONFIG } from '../config/runway.config';

/**
 * Takeoff Physics System
 *
 * Provides complete control over:
 * - Speed increase patterns (linear, exponential, smooth curves)
 * - Trajectory shaping (climb angle, forward vs vertical balance)
 * - Rotation and pitch during takeoff
 * - Lateral spacing and spreading
 * - Gravity ramping and transitions
 * - Multi-phase takeoff sequences
 */

export interface TakeoffState {
  elapsedTime: number;
  progress: number; // 0 to 1
  phase: 'acceleration' | 'climb' | 'transition';
  height: number;
  forwardVelocity: number;
  verticalVelocity: number;
  pitch: number;
  roll: number;
}

/**
 * Easing function types for smooth animations
 */
export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'smoothstep' | 'custom';

/**
 * Applies easing to a normalized 0-1 value
 */
export function applyEasing(t: number, easing: EasingType): number {
  t = Math.max(0, Math.min(1, t)); // Clamp to 0-1

  switch (easing) {
    case 'linear':
      return t;

    case 'easeIn':
      return t * t;

    case 'easeOut':
      return t * (2 - t);

    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    case 'smoothstep':
      return t * t * (3 - 2 * t);

    case 'custom':
      return t; // User-provided function should be used instead

    default:
      return t;
  }
}

/**
 * Calculates speed multiplier based on current height
 * Allows progressive speed increase as altitude increases
 */
export function getSpeedMultiplierAtHeight(height: number, maxHeight: number): number {
  const config = RUNWAY_CONFIG.takeoff;
  const [minMult, maxMult] = config.speedMultiplierRange;

  // Normalized height (0 at ground, 1 at maxHeight)
  const normalizedHeight = Math.min(1, height / maxHeight);

  // Apply easing curve for smooth speed increase
  const eased = applyEasing(normalizedHeight, config.speedIncreaseEasing || 'easeOut');

  // Interpolate between min and max multiplier
  return minMult + (maxMult - minMult) * eased;
}

/**
 * Calculates gravity strength at current time
 * Gravity ramps from initial to maximum strength over the gravityRampDuration
 */
export function getGravityStrengthAtTime(
  elapsedTime: number,
  gravityStartDelay: number,
  gravityRampDuration: number,
  initialGravity: number,
  maxGravity: number
): number {
  const config = RUNWAY_CONFIG.takeoff;
  const timeSinceGravityStart = Math.max(0, elapsedTime - gravityStartDelay);

  // Before gravity starts
  if (timeSinceGravityStart <= 0) {
    return 0;
  }

  // Gravity ramp phase
  if (timeSinceGravityStart < gravityRampDuration) {
    const rampProgress = timeSinceGravityStart / gravityRampDuration;
    const eased = applyEasing(rampProgress, config.gravityRampEasing || 'easeIn');
    return initialGravity + (maxGravity - initialGravity) * eased;
  }

  // Full gravity reached
  return maxGravity;
}

/**
 * Calculates forward acceleration at current time
 * Allows different acceleration patterns throughout takeoff
 */
export function getForwardAccelerationAtTime(elapsedTime: number): number {
  const config = RUNWAY_CONFIG.takeoff;

  // Acceleration phases
  if (config.accelerationPhases && config.accelerationPhases.length > 0) {
    for (const phase of config.accelerationPhases) {
      if (elapsedTime >= phase.startTime && elapsedTime <= phase.endTime) {
        // Smooth transition between phases
        const phaseDuration = phase.endTime - phase.startTime;
        const phaseProgress = (elapsedTime - phase.startTime) / phaseDuration;
        const eased = applyEasing(phaseProgress, phase.easing || 'linear');

        // Interpolate from startAccel to endAccel
        return phase.startAccel + (phase.endAccel - phase.startAccel) * eased;
      }
    }
  }

  // Default constant acceleration
  return config.acceleration;
}

/**
 * Calculates vertical velocity target at given height
 * Allows V-shaped or curved climb profiles
 */
export function getVerticalVelocityTarget(height: number, maxHeight: number): number {
  const config = RUNWAY_CONFIG.takeoff;

  // Use climb curve from config
  if (config.climbCurveType === 'parabolic') {
    const normalized = Math.min(1, height / maxHeight);
    // Parabolic curve: peaks at midpoint, decreases toward maxHeight
    return config.initialVerticalVelocity! * (1 - (normalized - 0.5) * (normalized - 0.5) * 4);
  }

  // Default linear
  return config.initialVerticalVelocity || 50;
}

/**
 * Calculates pitch angle during takeoff
 * Allows smooth rotation from horizontal to climb angle
 */
export function getPitchAtHeight(height: number, maxHeight: number): number {
  const config = RUNWAY_CONFIG.takeoff;
  const normalizedHeight = Math.min(1, height / maxHeight);
  const eased = applyEasing(normalizedHeight, config.pitchEasing || 'easeOut');

  // Interpolate from takeoffPitch to climbPitch
  const takeoffPitch = config.takeoffPitch || 0;
  const climbPitch = config.climbPitch || 15;

  return takeoffPitch + (climbPitch - takeoffPitch) * eased;
}

/**
 * Calculates lateral offset during takeoff
 * Allows particles to spread laterally during takeoff
 */
export function getLateralOffsetAtHeight(
  height: number,
  maxHeight: number,
  particleIndex: number,
  totalParticles: number
): number {
  const config = RUNWAY_CONFIG.takeoff;
  if (!config.lateralSpreadPattern) return 0;

  const normalizedHeight = Math.min(1, height / maxHeight);
  const maxSpread = config.takeoffLateralSpread || 5;

  // Spread particles laterally as they climb
  const offsetFromCenter = ((particleIndex + 0.5) / totalParticles - 0.5) * 2;

  // Apply easing pattern based on config
  if (config.lateralSpreadPattern === 'easeOut') {
    return offsetFromCenter * maxSpread * applyEasing(normalizedHeight, 'easeOut');
  }

  // Default to easeOut
  return offsetFromCenter * maxSpread * applyEasing(normalizedHeight, 'easeOut');
}

/**
 * Calculates current takeoff state for a particle
 * Returns complete information about position, velocity, rotation, etc.
 */
export function calculateTakeoffState(
  elapsedTime: number,
  particleIndex: number,
  totalParticles: number,
  startPosition: THREE.Vector3
): TakeoffState {
  const config = RUNWAY_CONFIG.takeoff;
  const maxDuration = config.maxDuration || 3.0;
  const progress = Math.min(1, elapsedTime / maxDuration);

  // Determine phase
  let phase: 'acceleration' | 'climb' | 'transition' = 'acceleration';
  const accelerationDuration = config.accelerationDuration || 1.0;
  const climbDuration = config.climbDuration || 1.5;

  if (elapsedTime > accelerationDuration + climbDuration) {
    phase = 'transition';
  } else if (elapsedTime > accelerationDuration) {
    phase = 'climb';
  }

  // Calculate velocities
  const forwardAccel = getForwardAccelerationAtTime(elapsedTime);
  const forwardVelocity = forwardAccel * elapsedTime;

  const gravityStrength = getGravityStrengthAtTime(
    elapsedTime,
    config.gravityStartDelay || 1.0,
    config.gravityRampDuration || 1.0,
    config.initialGravityStrength || 50,
    config.maxGravityStrength || 150
  );

  // Integrate vertical motion (with gravity acceleration)
  let verticalVelocity = 0;
  if (elapsedTime > (config.gravityStartDelay || 1.0)) {
    const timeUnderGravity = elapsedTime - (config.gravityStartDelay || 1.0);
    verticalVelocity = config.initialVerticalVelocity || 50;
    verticalVelocity -= gravityStrength * 0.5 * timeUnderGravity;
  } else {
    verticalVelocity = config.initialVerticalVelocity || 50;
  }

  // Integrate position
  const height = Math.max(0, startPosition.y + verticalVelocity * elapsedTime - 0.5 * gravityStrength * elapsedTime * elapsedTime);
  const forwardDistance = forwardVelocity * elapsedTime;
  const lateralOffset = getLateralOffsetAtHeight(height, config.maxHeight || 50, particleIndex, totalParticles);

  // Calculate rotations
  const pitch = getPitchAtHeight(height, config.maxHeight || 50);
  const roll = 0; // Can be modified for banking during lateral spread

  return {
    elapsedTime,
    progress,
    phase,
    height,
    forwardVelocity,
    verticalVelocity,
    pitch,
    roll,
  };
}

/**
 * Calculates position delta for a takeoff frame update
 * Given current state and delta time, returns position change
 */
export function getTakeoffPositionDelta(
  currentState: TakeoffState,
  deltaTime: number,
  nextElapsedTime: number,
  particleIndex: number,
  totalParticles: number,
  currentHeight: number
): THREE.Vector3 {
  const config = RUNWAY_CONFIG.takeoff;

  const nextState = calculateTakeoffState(nextElapsedTime, particleIndex, totalParticles, new THREE.Vector3(0, currentHeight, 0));

  const forwardDelta = (nextState.forwardVelocity - currentState.forwardVelocity) * deltaTime;
  const verticalDelta = (nextState.height - currentHeight);
  const lateralDelta =
    getLateralOffsetAtHeight(nextState.height, config.maxHeight || 50, particleIndex, totalParticles) -
    getLateralOffsetAtHeight(currentHeight, config.maxHeight || 50, particleIndex, totalParticles);

  return new THREE.Vector3(forwardDelta, verticalDelta, lateralDelta);
}

/**
 * Validates takeoff configuration
 * Ensures all required parameters are present and valid
 */
export function validateTakeoffConfig(): boolean {
  const config = RUNWAY_CONFIG.takeoff;

  const requiredFields = [
    'acceleration',
    'liftSpeed',
    'maxHeight',
    'gravityStartDelay',
    'maxDuration',
    'initialGravityStrength',
    'maxGravityStrength',
  ];

  for (const field of requiredFields) {
    if (!(field in config)) {
      console.error(`[TakeoffPhysics] Missing required takeoff config field: ${field}`);
      return false;
    }
  }

  return true;
}

/**
 * Logging helper for takeoff debugging
 */
export function logTakeoffDebug(
  label: string,
  state: TakeoffState,
  position: THREE.Vector3
): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.log(
    `[TakeoffPhysics] ${label} - Phase: ${state.phase}, Height: ${state.height.toFixed(1)}, FwdVel: ${state.forwardVelocity.toFixed(1)}, Pitch: ${state.pitch.toFixed(1)}°, Pos: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`
  );
}
