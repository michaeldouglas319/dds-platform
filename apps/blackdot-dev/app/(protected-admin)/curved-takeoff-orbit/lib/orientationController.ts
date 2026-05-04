/**
 * Orientation Controller
 *
 * Smoothly locks particle orientation to trajectory-relative angles.
 * Based on Three.js quaternion.rotateTowards() pattern for gradual rotation.
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export type OrientationMode = 'curve-tangent' | 'orbit-lock' | 'forward-polar-lock' | 'manual';

export interface OrientationConfig {
  mode: OrientationMode;

  // Orbit-lock specific
  orbitCenter?: THREE.Vector3;
  orbitNormal?: THREE.Vector3;      // Default: (0, 1, 0) for XZ plane orbit

  // Manual overrides
  additionalRotation?: THREE.Euler; // Applied after automatic orientation
  upVector?: THREE.Vector3;         // Custom "up" direction (default: radial from orbit center)

  // Smoothing
  rotationSpeed?: number;           // Radians per second (default: Math.PI * 2 = 360°/sec)
  useInstantRotation?: boolean;     // Skip smoothing (default: false)
}

export interface OrientationState {
  currentQuaternion: THREE.Quaternion;
  targetQuaternion: THREE.Quaternion;
  isAligned: boolean;               // True when current matches target
  angularDistance: number;          // Radians between current and target
}

// Internal config type with defaults applied (all required except upVector)
interface ResolvedOrientationConfig {
  mode: OrientationMode;
  orbitCenter: THREE.Vector3;
  orbitNormal: THREE.Vector3;
  additionalRotation: THREE.Euler;
  upVector?: THREE.Vector3;
  rotationSpeed: number;
  useInstantRotation: boolean;
}

// ============================================================================
// TEMP OBJECT POOL (for performance)
// ============================================================================

const _tempMatrix = new THREE.Matrix4();
const _tempVec1 = new THREE.Vector3();
const _tempVec2 = new THREE.Vector3();
const _tempVec3 = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();

// ============================================================================
// TARGET QUATERNION CALCULATION
// ============================================================================

/**
 * Calculate target quaternion for curve-following (takeoff/landing)
 * Points "forward" along curve tangent, "up" toward orbit center
 */
export function calculateCurveTangentOrientation(
  position: THREE.Vector3,
  tangent: THREE.Vector3,
  orbitCenter: THREE.Vector3,
  additionalRotation?: THREE.Euler
): THREE.Quaternion {
  // Forward direction: curve tangent
  const forward = _tempVec1.copy(tangent).normalize();

  // Up direction: radial vector from position toward orbit center
  const up = _tempVec2.subVectors(orbitCenter, position).normalize();

  // Ensure up is perpendicular to forward (Gram-Schmidt)
  const forwardComponent = up.dot(forward);
  up.addScaledVector(forward, -forwardComponent).normalize();

  // Right direction: cross product
  const right = _tempVec3.crossVectors(forward, up).normalize();

  // Build rotation matrix from orthonormal basis
  _tempMatrix.makeBasis(right, up, forward);

  // Convert to quaternion
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(_tempMatrix);

  // Apply additional rotation if specified
  if (additionalRotation) {
    _tempQuat.setFromEuler(additionalRotation);
    quaternion.multiply(_tempQuat);
  }

  return quaternion;
}

/**
 * Calculate target quaternion for orbit-locked orientation
 * Always faces tangent to orbit circle, perpendicular to radius
 */
export function calculateOrbitLockedOrientation(
  position: THREE.Vector3,
  orbitCenter: THREE.Vector3,
  orbitNormal: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  additionalRotation?: THREE.Euler
): THREE.Quaternion {
  // Radial vector from orbit center to particle (in orbit plane)
  const radial = _tempVec1.subVectors(position, orbitCenter);

  // Project radial onto orbit plane (remove component along normal)
  const normalComponent = radial.dot(orbitNormal);
  radial.addScaledVector(orbitNormal, -normalComponent).normalize();

  // Forward direction: tangent to orbit (90° from radial in orbit plane)
  // For counterclockwise orbit: cross(normal, radial)
  const forward = _tempVec2.crossVectors(orbitNormal, radial).normalize();

  // Up direction: orbit normal (points "up" from orbit plane)
  const up = _tempVec3.copy(orbitNormal).normalize();

  // Right direction: radial (points outward from orbit center)
  const right = radial.clone();

  // Build rotation matrix
  _tempMatrix.makeBasis(right, up, forward);

  // Convert to quaternion
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(_tempMatrix);

  // Apply additional rotation
  if (additionalRotation) {
    _tempQuat.setFromEuler(additionalRotation);
    quaternion.multiply(_tempQuat);
  }

  return quaternion;
}

/**
 * Calculate target quaternion for forward-facing polar lock
 * Always points forward along velocity, with up locked to world up (no roll/banking)
 *
 * @param velocity - Current velocity vector (defines forward direction)
 * @param worldUp - World up vector (default: Y-up)
 * @param additionalRotation - Optional extra rotation
 */
export function calculateForwardFacingPolarLocked(
  velocity: THREE.Vector3,
  worldUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  additionalRotation?: THREE.Euler
): THREE.Quaternion {
  // Forward direction: velocity direction
  const forward = _tempVec1.copy(velocity).normalize();

  // Check if forward is parallel to world up (edge case)
  const parallelThreshold = 0.999;
  const upDotForward = Math.abs(worldUp.dot(forward));

  let up: THREE.Vector3;
  let right: THREE.Vector3;

  if (upDotForward > parallelThreshold) {
    // Forward is nearly vertical - use a fallback right vector
    // Use world X-axis as right if going straight up/down
    right = _tempVec2.set(1, 0, 0);
    up = _tempVec3.crossVectors(forward, right).normalize();
    right.crossVectors(up, forward).normalize();
  } else {
    // Normal case: project world up onto plane perpendicular to forward
    up = _tempVec2.copy(worldUp);

    // Remove forward component from up (Gram-Schmidt)
    const forwardComponent = up.dot(forward);
    up.addScaledVector(forward, -forwardComponent).normalize();

    // Right is perpendicular to both forward and up
    right = _tempVec3.crossVectors(forward, up).normalize();
  }

  // Build rotation matrix from orthonormal basis
  // Three.js uses: column 0 = right, column 1 = up, column 2 = forward
  _tempMatrix.makeBasis(right, up, forward);

  // Convert to quaternion
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(_tempMatrix);

  // Apply additional rotation if specified
  if (additionalRotation) {
    _tempQuat.setFromEuler(additionalRotation);
    quaternion.multiply(_tempQuat);
  }

  return quaternion;
}

/**
 * Calculate target quaternion using lookAt pattern (legacy compatibility)
 * Points particle toward a specific target position
 */
export function calculateLookAtOrientation(
  position: THREE.Vector3,
  target: THREE.Vector3,
  up: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
  _tempMatrix.lookAt(position, target, up);
  return new THREE.Quaternion().setFromRotationMatrix(_tempMatrix);
}

// ============================================================================
// SMOOTH ORIENTATION UPDATE
// ============================================================================

/**
 * Update particle orientation smoothly toward target
 * Uses quaternion.rotateTowards() for gradual rotation
 *
 * @param currentQuaternion - Particle's current orientation (modified in place)
 * @param targetQuaternion - Desired orientation
 * @param delta - Time step in seconds
 * @param rotationSpeed - Radians per second (default: 2π = 360°/sec)
 * @param instant - Skip smoothing, snap immediately
 * @returns Updated state information
 */
export function updateOrientationSmooth(
  currentQuaternion: THREE.Quaternion,
  targetQuaternion: THREE.Quaternion,
  delta: number,
  rotationSpeed: number = Math.PI * 2,
  instant: boolean = false
): OrientationState {
  // Calculate angular distance before update
  const angularDistance = currentQuaternion.angleTo(targetQuaternion);

  if (instant || angularDistance < 0.001) {
    // Snap to target immediately
    currentQuaternion.copy(targetQuaternion);

    return {
      currentQuaternion,
      targetQuaternion,
      isAligned: true,
      angularDistance: 0
    };
  }

  // Calculate step size based on rotation speed
  const step = rotationSpeed * delta;

  // Gradually rotate toward target
  currentQuaternion.rotateTowards(targetQuaternion, step);

  // Check if aligned after update
  const finalDistance = currentQuaternion.angleTo(targetQuaternion);
  const isAligned = finalDistance < 0.01; // ~0.57° tolerance

  return {
    currentQuaternion,
    targetQuaternion,
    isAligned,
    angularDistance: finalDistance
  };
}

// ============================================================================
// UNIFIED ORIENTATION CONTROLLER
// ============================================================================

/**
 * Complete orientation controller for a particle
 * Handles all phases: takeoff, orbit, landing
 */
export class ParticleOrientationController {
  private config: ResolvedOrientationConfig;
  private state: OrientationState;

  constructor(
    initialQuaternion: THREE.Quaternion = new THREE.Quaternion(),
    config: Partial<OrientationConfig> = {}
  ) {
    // Set defaults
    this.config = {
      mode: config.mode || 'orbit-lock',
      orbitCenter: config.orbitCenter || new THREE.Vector3(0, 0, 0),
      orbitNormal: config.orbitNormal || new THREE.Vector3(0, 1, 0),
      additionalRotation: config.additionalRotation || new THREE.Euler(0, 0, 0),
      upVector: config.upVector,
      rotationSpeed: config.rotationSpeed ?? Math.PI * 2,
      useInstantRotation: config.useInstantRotation ?? false
    };

    this.state = {
      currentQuaternion: initialQuaternion.clone(),
      targetQuaternion: initialQuaternion.clone(),
      isAligned: true,
      angularDistance: 0
    };
  }

  /**
   * Update orientation for curve-following phase (takeoff/landing)
   */
  updateCurveTangent(
    position: THREE.Vector3,
    tangent: THREE.Vector3,
    delta: number
  ): THREE.Quaternion {
    // Calculate target orientation
    const target = calculateCurveTangentOrientation(
      position,
      tangent,
      this.config.orbitCenter,
      this.config.additionalRotation
    );

    // Smooth update
    this.state = updateOrientationSmooth(
      this.state.currentQuaternion,
      target,
      delta,
      this.config.rotationSpeed,
      this.config.useInstantRotation
    );

    return this.state.currentQuaternion;
  }

  /**
   * Update orientation for orbit phase (locked to tangent)
   */
  updateOrbitLock(
    position: THREE.Vector3,
    delta: number
  ): THREE.Quaternion {
    // Calculate target orientation
    const target = calculateOrbitLockedOrientation(
      position,
      this.config.orbitCenter,
      this.config.orbitNormal,
      this.config.additionalRotation
    );

    // Smooth update
    this.state = updateOrientationSmooth(
      this.state.currentQuaternion,
      target,
      delta,
      this.config.rotationSpeed,
      this.config.useInstantRotation
    );

    return this.state.currentQuaternion;
  }

  /**
   * Update orientation for forward-facing polar lock (no roll/banking)
   * Always points in direction of velocity, up locked to world up
   */
  updateForwardPolarLock(
    velocity: THREE.Vector3,
    delta: number,
    worldUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
  ): THREE.Quaternion {
    // Calculate target orientation
    const target = calculateForwardFacingPolarLocked(
      velocity,
      worldUp,
      this.config.additionalRotation
    );

    // Smooth update
    this.state = updateOrientationSmooth(
      this.state.currentQuaternion,
      target,
      delta,
      this.config.rotationSpeed,
      this.config.useInstantRotation
    );

    return this.state.currentQuaternion;
  }

  /**
   * Get current state
   */
  getState(): Readonly<OrientationState> {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OrientationConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Reset to identity orientation
   */
  reset(): void {
    this.state.currentQuaternion.identity();
    this.state.targetQuaternion.identity();
    this.state.isAligned = true;
    this.state.angularDistance = 0;
  }
}

// ============================================================================
// BATCH UTILITIES
// ============================================================================

/**
 * Update orientations for multiple particles efficiently
 * Reuses calculation objects to minimize allocations
 */
export function updateParticleOrientations(
  particles: Array<{
    position: THREE.Vector3;
    quaternion: THREE.Quaternion;
    phase: 'takeoff' | 'orbit' | 'landing';
    tangent?: THREE.Vector3; // Required for takeoff/landing
  }>,
  orbitCenter: THREE.Vector3,
  orbitNormal: THREE.Vector3,
  delta: number,
  rotationSpeed: number = Math.PI * 2
): void {
  for (const particle of particles) {
    let target: THREE.Quaternion;

    if (particle.phase === 'orbit') {
      // Orbit: lock to tangent
      target = calculateOrbitLockedOrientation(
        particle.position,
        orbitCenter,
        orbitNormal
      );
    } else {
      // Takeoff/Landing: follow curve tangent
      if (!particle.tangent) {
        console.warn(`Particle in ${particle.phase} phase missing tangent`);
        continue;
      }

      target = calculateCurveTangentOrientation(
        particle.position,
        particle.tangent,
        orbitCenter
      );
    }

    // Smooth update in place
    updateOrientationSmooth(
      particle.quaternion,
      target,
      delta,
      rotationSpeed,
      false
    );
  }
}

// ============================================================================
// DEBUG / VISUALIZATION HELPERS
// ============================================================================

/**
 * Get orientation basis vectors for debugging
 */
export function getOrientationBasis(quaternion: THREE.Quaternion): {
  forward: THREE.Vector3;
  up: THREE.Vector3;
  right: THREE.Vector3;
} {
  const matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);

  return {
    right: new THREE.Vector3().setFromMatrixColumn(matrix, 0),
    up: new THREE.Vector3().setFromMatrixColumn(matrix, 1),
    forward: new THREE.Vector3().setFromMatrixColumn(matrix, 2)
  };
}

/**
 * Calculate rotation difference in degrees
 */
export function getRotationDifferenceDegrees(
  q1: THREE.Quaternion,
  q2: THREE.Quaternion
): number {
  return q1.angleTo(q2) * (180 / Math.PI);
}
