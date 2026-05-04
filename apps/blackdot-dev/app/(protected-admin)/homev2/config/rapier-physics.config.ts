/**
 * UNIFIED RAPIER PHYSICS CONFIGURATION
 *
 * Central configuration for all Rapier physics parameters.
 * This is the single source of truth for physics behavior across all flight phases.
 *
 * Used by:
 * - ParticleStateManager.tsx (physics body management)
 * - RapierStateMachine.ts (state transitions with physics coordination)
 * - PhysicsTransitionManager (animation-to-physics handoff)
 * - Landing transition system (physics-to-kinematic handoff)
 *
 * @remarks
 * All durations in seconds, velocities in units/s, distances in units.
 * Rapier physics runs at variable timeStep (adaptive stepping).
 */

/**
 * Taxi Phase Configuration
 * Kinematic movement from gate to runway
 */
export interface TaxiPhysicsConfig {
  /** Forward speed during taxi (units/s) */
  speed: number;

  /** Acceleration factor for smooth speed changes */
  acceleration: number;

  /** Distance threshold to consider waypoint reached (units) */
  waypointThreshold: number;

  /** Blending speed for orientation toward next waypoint (0-1, higher = faster) */
  orientationBlendSpeed: number;
}

/**
 * Takeoff Phase Configuration
 * Kinematic ascending movement before orbit physics takeover
 */
export interface TakeoffPhysicsConfig {
  /** Upward velocity during climb (units/s) */
  liftSpeed: number;

  /** Vertical acceleration during takeoff (units/s²) */
  acceleration: number;

  /** Maximum altitude before transition to physics orbit (units) */
  maxHeight: number;

  /** Total duration of takeoff animation (seconds) */
  duration: number;

  /** Pitch angle during climb (degrees) */
  pitchAngle: number;

  /** Speed multiplier as function of height (1.0 = baseline) */
  speedMultiplier: number;
}

/**
 * Physics Handoff Configuration (Kinematic → Dynamic)
 * Parameters for smooth transition from animation to Rapier physics
 */
export interface ToPhysicsTransitionConfig {
  /** Strength of orbital pull force during handoff (units/s²) */
  orbitPullStrength: number;

  /** Linear damping in physics body (0.1 = minimal damping, higher = more resistance) */
  linearDamping: number;

  /** Angular damping in physics body */
  angularDamping: number;

  /** Duration to blend from kinematic to fully physics-driven (seconds) */
  blendDuration: number;

  /** Number of frames to capture velocity history for smooth handoff */
  captureVelocityFrames: number;
}

/**
 * Orbit Phase Configuration
 * Physics-based circular orbital motion
 */
export interface OrbitPhysicsConfig {
  /** Center point of orbit (units) */
  center: [number, number, number];

  /** Orbital radius from center (units) */
  radius: number;

  /** Target orbital speed (units/s) */
  targetSpeed: number;

  /** Spring stiffness pulling toward orbital path (higher = tighter orbit) */
  stiffness: number;

  /** Tangential acceleration for maintaining orbital speed (units/s²) */
  tangentialAccel: number;

  /** Altitude variation range around orbit center (±units) */
  altitudeVariation: number;
}

/**
 * Collision Avoidance Configuration
 * Sensor-based detection and avoidance during all phases
 */
export interface AvoidancePhysicsConfig {
  /** Sphere radius for collision detection (units) */
  detectionRadius: number;

  /** Force magnitude to push away from detected obstacles (units/s²) */
  repulsionStrength: number;

  /** Enable predictive collision avoidance */
  enablePrediction: boolean;

  /** How far ahead to predict collisions (seconds) */
  predictionTime: number;
}

/**
 * Physics Handoff Configuration (Dynamic → Kinematic)
 * Parameters for smooth transition from orbit physics back to animation (landing)
 */
export interface ToLandingTransitionConfig {
  /** Duration to increase damping for controlled descent (seconds) */
  dampingDuration: number;

  /** Linear damping while still in orbit phase (0.1-0.5) */
  orbitLinearDamping: number;

  /** Linear damping during landing phase (high damping for quick slowdown) */
  landingLinearDamping: number;

  /** Pull force toward landing zone (units/s²) */
  landingPullStrength: number;

  /** Duration to manually decay velocity when in kinematic phase (seconds) */
  velocityDecayDuration: number;

  /** Blending speed for rotation toward landing direction (0-1) */
  rotationBlendSpeed: number;
}

/**
 * Landing Phase Configuration
 * Kinematic descent to resting position
 */
export interface LandingPhysicsConfig {
  /** Forward approach speed toward landing zone (units/s) */
  approachSpeed: number;

  /** Downward velocity rate (units/s) */
  descentRate: number;

  /** Distance threshold to consider landed (units) */
  touchdownThreshold: number;

  /** Final resting orientation (Euler angles in degrees) */
  finalOrientation: [number, number, number];
}

/**
 * Global Physics Settings
 * Affects all phases equally
 */
export interface GlobalPhysicsConfig {
  /** Enable gravity (0 = disabled, 1 = enabled) */
  gravityScale: number;

  /** Simulation time scale (0.5 = slow-motion, 2.0 = speed-up) */
  timeScale: number;

  /** Enable debug visualization (wireframes, forces, labels) */
  debugVisualization: boolean;
}

/**
 * Complete Animation-Physics Configuration
 * Used throughout the application
 */
export interface AnimationPhysicsConfig {
  taxi: TaxiPhysicsConfig;
  takeoff: TakeoffPhysicsConfig;
  toPhysicsTransition: ToPhysicsTransitionConfig;
  orbit: OrbitPhysicsConfig;
  avoidance: AvoidancePhysicsConfig;
  toLandingTransition: ToLandingTransitionConfig;
  landing: LandingPhysicsConfig;
  global: GlobalPhysicsConfig;
}

/**
 * DEFAULT CONFIGURATION
 * Balanced settings suitable for most scenarios (50 vehicles at 60 FPS)
 */
export const DEFAULT_ANIMATION_PHYSICS_CONFIG: AnimationPhysicsConfig = {
  taxi: {
    speed: 0.3,
    acceleration: 5.0,
    waypointThreshold: 0.5,
    orientationBlendSpeed: 0.15,
  },

  takeoff: {
    liftSpeed: 600.0,
    acceleration: 250.0,
    maxHeight: 50.0,
    duration: 3.0,
    pitchAngle: 15.0,
    speedMultiplier: 2.0,
  },

  toPhysicsTransition: {
    orbitPullStrength: 100.0,
    linearDamping: 0.2,
    angularDamping: 0.5,
    blendDuration: 0.5,
    captureVelocityFrames: 4,
  },

  orbit: {
    center: [20, 50, 0],
    radius: 15.0,
    targetSpeed: 0.5,
    stiffness: 25.0,
    tangentialAccel: 10.0,
    altitudeVariation: 3.0,
  },

  avoidance: {
    detectionRadius: 10.0,
    repulsionStrength: 50.0,
    enablePrediction: true,
    predictionTime: 1.0,
  },

  toLandingTransition: {
    dampingDuration: 0.7,
    orbitLinearDamping: 0.3,
    landingLinearDamping: 4.0,
    landingPullStrength: 60.0,
    velocityDecayDuration: 1.5,
    rotationBlendSpeed: 0.1,
  },

  landing: {
    approachSpeed: 0.3,
    descentRate: 1.0,
    touchdownThreshold: 0.2,
    finalOrientation: [0, 0, 0],
  },

  global: {
    gravityScale: 0,
    timeScale: 1.0,
    debugVisualization: false,
  },
};

/**
 * Export singleton instance
 */
export let ANIMATION_PHYSICS_CONFIG = { ...DEFAULT_ANIMATION_PHYSICS_CONFIG };

/**
 * Update configuration at runtime
 * @param overrides Partial config to merge with current
 */
export function updateAnimationPhysicsConfig(
  overrides: Partial<AnimationPhysicsConfig>
): void {
  ANIMATION_PHYSICS_CONFIG = {
    ...ANIMATION_PHYSICS_CONFIG,
    ...overrides,
  };
}

/**
 * Reset to defaults
 */
export function resetAnimationPhysicsConfig(): void {
  ANIMATION_PHYSICS_CONFIG = { ...DEFAULT_ANIMATION_PHYSICS_CONFIG };
}

/**
 * Get current configuration
 */
export function getAnimationPhysicsConfig(): AnimationPhysicsConfig {
  return { ...ANIMATION_PHYSICS_CONFIG };
}
