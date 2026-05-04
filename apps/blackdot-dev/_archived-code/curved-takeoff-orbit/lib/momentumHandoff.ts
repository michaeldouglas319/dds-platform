/**
 * Momentum Handoff Controller
 *
 * Handles smooth velocity transitions between trajectory phases.
 * - Entry: Takeoff curve → Orbit (gradual acceleration)
 * - Exit: Orbit → Landing curve (gradual deceleration/acceleration)
 *
 * All blend durations and easing configurable.
 */

import * as THREE from 'three';

// ===================================================================
// TYPES
// ===================================================================

export interface HandoffConfig {
  /**
   * Duration of velocity blend when entering orbit (seconds)
   * @default 1.0
   */
  entryBlendDuration: number;

  /**
   * Duration of velocity blend when exiting orbit (seconds)
   * @default 1.0
   */
  exitBlendDuration: number;

  /**
   * Easing function for velocity blending
   * @default 'smooth' (ease-in-out)
   */
  easingMode: 'linear' | 'smooth' | 'ease-in' | 'ease-out';

  /**
   * Whether to match orbit speed to particle or particle to orbit
   * @default 'particle-to-orbit' (particle adjusts to orbit speed)
   */
  speedMatchMode: 'particle-to-orbit' | 'orbit-to-particle' | 'blend';

  /**
   * Maximum velocity change per second (prevents unrealistic acceleration)
   * Set to Infinity for no limit
   * @default Infinity
   */
  maxAcceleration: number;
}

export interface HandoffState {
  isBlending: boolean;
  blendStartTime: number;
  blendDuration: number;
  startVelocity: THREE.Vector3;
  targetVelocity: THREE.Vector3;
  currentVelocity: THREE.Vector3;
  easingFunction: (t: number) => number;
}

// ===================================================================
// EASING FUNCTIONS
// ===================================================================

const EASING_FUNCTIONS = {
  linear: (t: number) => t,
  smooth: (t: number) => t * t * (3 - 2 * t), // Smoothstep
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
};

// ===================================================================
// HANDOFF CONTROLLER
// ===================================================================

export class MomentumHandoffController {
  private config: HandoffConfig;
  private handoffStates: Map<number, HandoffState> = new Map();

  constructor(config: HandoffConfig) {
    this.config = config;
  }

  /**
   * Update configuration (allows runtime changes)
   */
  updateConfig(config: Partial<HandoffConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Start entry handoff (takeoff curve → orbit)
   */
  startEntryHandoff(
    particleId: number,
    currentVelocity: THREE.Vector3,
    targetOrbitVelocity: THREE.Vector3
  ): void {
    const state: HandoffState = {
      isBlending: true,
      blendStartTime: performance.now() / 1000,
      blendDuration: this.config.entryBlendDuration,
      startVelocity: currentVelocity.clone(),
      targetVelocity: targetOrbitVelocity.clone(),
      currentVelocity: currentVelocity.clone(),
      easingFunction: EASING_FUNCTIONS[this.config.easingMode],
    };

    this.handoffStates.set(particleId, state);
  }

  /**
   * Start exit handoff (orbit → landing curve)
   */
  startExitHandoff(
    particleId: number,
    currentOrbitVelocity: THREE.Vector3,
    targetLandingVelocity: THREE.Vector3
  ): void {
    const state: HandoffState = {
      isBlending: true,
      blendStartTime: performance.now() / 1000,
      blendDuration: this.config.exitBlendDuration,
      startVelocity: currentOrbitVelocity.clone(),
      targetVelocity: targetLandingVelocity.clone(),
      currentVelocity: currentOrbitVelocity.clone(),
      easingFunction: EASING_FUNCTIONS[this.config.easingMode],
    };

    this.handoffStates.set(particleId, state);
  }

  /**
   * Update velocity blending (call every frame)
   * @returns Current velocity (blended or target if complete)
   */
  updateHandoff(particleId: number, deltaTime: number): THREE.Vector3 | null {
    const state = this.handoffStates.get(particleId);
    if (!state || !state.isBlending) return null;

    const currentTime = performance.now() / 1000;
    const elapsed = currentTime - state.blendStartTime;
    const t = Math.min(elapsed / state.blendDuration, 1.0);

    // Apply easing
    const easedT = state.easingFunction(t);

    // Lerp velocity
    state.currentVelocity.lerpVectors(
      state.startVelocity,
      state.targetVelocity,
      easedT
    );

    // Check max acceleration limit
    if (this.config.maxAcceleration !== Infinity) {
      const velocityDelta = new THREE.Vector3()
        .subVectors(state.currentVelocity, state.startVelocity);
      const acceleration = velocityDelta.length() / elapsed;

      if (acceleration > this.config.maxAcceleration) {
        // Clamp to max acceleration
        const maxDelta = this.config.maxAcceleration * elapsed;
        velocityDelta.normalize().multiplyScalar(maxDelta);
        state.currentVelocity.copy(state.startVelocity).add(velocityDelta);
      }
    }

    // Complete handoff if t >= 1
    if (t >= 1.0) {
      state.isBlending = false;
      state.currentVelocity.copy(state.targetVelocity);
      this.handoffStates.delete(particleId);
    }

    return state.currentVelocity.clone();
  }

  /**
   * Check if particle is currently blending
   */
  isBlending(particleId: number): boolean {
    const state = this.handoffStates.get(particleId);
    return state?.isBlending ?? false;
  }

  /**
   * Get current blend progress (0-1)
   */
  getBlendProgress(particleId: number): number {
    const state = this.handoffStates.get(particleId);
    if (!state || !state.isBlending) return 1.0;

    const currentTime = performance.now() / 1000;
    const elapsed = currentTime - state.blendStartTime;
    return Math.min(elapsed / state.blendDuration, 1.0);
  }

  /**
   * Cancel handoff (instant snap to target velocity)
   */
  cancelHandoff(particleId: number): void {
    this.handoffStates.delete(particleId);
  }

  /**
   * Clear all handoff states
   */
  reset(): void {
    this.handoffStates.clear();
  }
}

// ===================================================================
// VELOCITY CALCULATION HELPERS
// ===================================================================

/**
 * Calculate tangential velocity for circular orbit
 */
export function calculateOrbitVelocity(
  orbitCenter: THREE.Vector3,
  particlePosition: THREE.Vector3,
  orbitSpeed: number
): THREE.Vector3 {
  // Vector from center to particle
  const radius = new THREE.Vector3().subVectors(particlePosition, orbitCenter);

  // Tangent is perpendicular to radius (in XZ plane for horizontal orbit)
  const tangent = new THREE.Vector3(-radius.z, 0, radius.x).normalize();

  return tangent.multiplyScalar(orbitSpeed);
}

/**
 * Calculate velocity from curve at given point
 */
export function calculateCurveVelocity(
  curve: THREE.CatmullRomCurve3,
  t: number,
  speed: number
): THREE.Vector3 {
  const tangent = curve.getTangentAt(t);
  return tangent.multiplyScalar(speed);
}

/**
 * Match orbit speed to particle's current speed
 * (Used when speedMatchMode is 'orbit-to-particle')
 */
export function calculateMatchedOrbitSpeed(
  particleVelocity: THREE.Vector3,
  orbitRadius: number
): number {
  // Angular velocity = linear velocity / radius
  const linearSpeed = particleVelocity.length();
  return linearSpeed;
}

/**
 * Blend two velocities based on mode
 */
export function blendVelocities(
  velocity1: THREE.Vector3,
  velocity2: THREE.Vector3,
  mode: HandoffConfig['speedMatchMode'],
  blendFactor: number = 0.5
): THREE.Vector3 {
  switch (mode) {
    case 'particle-to-orbit':
      return velocity2.clone(); // Use orbit velocity
    case 'orbit-to-particle':
      return velocity1.clone(); // Use particle velocity
    case 'blend':
      return new THREE.Vector3().lerpVectors(velocity1, velocity2, blendFactor);
    default:
      return velocity2.clone();
  }
}

// ===================================================================
// TRANSITION VALIDATION
// ===================================================================

/**
 * Validate that velocity change is physically reasonable
 */
export function validateVelocityTransition(
  startVelocity: THREE.Vector3,
  endVelocity: THREE.Vector3,
  duration: number,
  maxAcceleration: number
): { valid: boolean; reason?: string } {
  const velocityDelta = new THREE.Vector3().subVectors(endVelocity, startVelocity);
  const requiredAcceleration = velocityDelta.length() / duration;

  if (requiredAcceleration > maxAcceleration) {
    return {
      valid: false,
      reason: `Required acceleration ${requiredAcceleration.toFixed(2)} m/s² exceeds max ${maxAcceleration} m/s²`,
    };
  }

  return { valid: true };
}

/**
 * Calculate minimum blend duration to stay within acceleration limits
 */
export function calculateMinBlendDuration(
  startVelocity: THREE.Vector3,
  endVelocity: THREE.Vector3,
  maxAcceleration: number
): number {
  const velocityDelta = new THREE.Vector3().subVectors(endVelocity, startVelocity);
  const deltaSpeed = velocityDelta.length();
  return deltaSpeed / maxAcceleration;
}
