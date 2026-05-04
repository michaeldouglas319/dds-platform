/**
 * CONFIGURATION PRESETS
 *
 * Pre-optimized configurations for common scenarios.
 * Use these as starting points and customize as needed.
 *
 * Each preset is tuned for specific performance targets and use cases.
 */

import type { AnimationPhysicsConfig } from './rapier-physics.config';
import { DEFAULT_ANIMATION_PHYSICS_CONFIG } from './rapier-physics.config';

/**
 * PERFORMANCE PRESET
 * Optimized for 100+ vehicles at 30-45 FPS
 *
 * Trade-offs:
 * - Simpler physics calculations
 * - Larger avoidance radius (fewer collision checks)
 * - Faster transitions
 * - Lower precision orbit maintenance
 *
 * Use when:
 * - Running on lower-end hardware
 * - Displaying large fleet (100+ vehicles)
 * - FPS is critical
 */
export const PERFORMANCE_PRESET: AnimationPhysicsConfig = {
  ...DEFAULT_ANIMATION_PHYSICS_CONFIG,

  taxi: {
    speed: 0.25,
    acceleration: 3.0,
    waypointThreshold: 1.0, // Larger threshold = fewer precision updates
    orientationBlendSpeed: 0.2,
  },

  takeoff: {
    liftSpeed: 400.0, // Faster takeoff = less computation time
    acceleration: 150.0,
    maxHeight: 40.0,
    duration: 2.0, // Shorter duration = fewer frames
    pitchAngle: 10.0,
    speedMultiplier: 1.5,
  },

  toPhysicsTransition: {
    orbitPullStrength: 80.0,
    linearDamping: 0.3, // Higher damping = quicker stabilization
    angularDamping: 0.6,
    blendDuration: 0.3, // Shorter blend = faster handoff
    captureVelocityFrames: 2, // Fewer frames = less overhead
  },

  orbit: {
    center: [20, 50, 0],
    radius: 20.0, // Larger orbit = better spread, fewer collisions
    targetSpeed: 0.4,
    stiffness: 15.0, // Lower stiffness = less force calculations
    tangentialAccel: 5.0,
    altitudeVariation: 2.0,
  },

  avoidance: {
    detectionRadius: 15.0, // Larger radius = fewer precise checks needed
    repulsionStrength: 30.0,
    enablePrediction: false, // Disable expensive prediction
    predictionTime: 0.5,
  },

  toLandingTransition: {
    dampingDuration: 0.5,
    orbitLinearDamping: 0.4,
    landingLinearDamping: 5.0,
    landingPullStrength: 50.0,
    velocityDecayDuration: 1.0,
    rotationBlendSpeed: 0.15,
  },

  landing: {
    approachSpeed: 0.25,
    descentRate: 1.5,
    touchdownThreshold: 0.3,
    finalOrientation: [0, 0, 0],
  },

  global: {
    gravityScale: 0,
    timeScale: 1.0,
    debugVisualization: false,
  },
};

/**
 * QUALITY PRESET
 * Balanced for 50 vehicles at 60 FPS
 *
 * Trade-offs:
 * - Moderate precision physics
 * - Medium avoidance radius
 * - Smooth transitions
 * - Good orbit maintenance
 *
 * Use when:
 * - Target hardware is mid-range
 * - Fleet size is 20-100 vehicles
 * - Balance between quality and performance is needed
 * - General purpose usage
 */
export const QUALITY_PRESET: AnimationPhysicsConfig = {
  ...DEFAULT_ANIMATION_PHYSICS_CONFIG,
  // Uses defaults which are already balanced for quality
};

/**
 * HIGH_QUALITY PRESET
 * Optimized for 10-20 vehicles at 60+ FPS with maximum precision
 *
 * Trade-offs:
 * - High-precision physics calculations
 * - Sensitive collision detection
 * - Smooth, realistic motion
 * - More CPU usage
 *
 * Use when:
 * - Running on high-end hardware
 * - Small fleet (< 20 vehicles)
 * - Visual quality is paramount
 * - Demonstrating to stakeholders
 */
export const HIGH_QUALITY_PRESET: AnimationPhysicsConfig = {
  ...DEFAULT_ANIMATION_PHYSICS_CONFIG,

  taxi: {
    speed: 0.35,
    acceleration: 8.0,
    waypointThreshold: 0.2, // Tight threshold = high precision
    orientationBlendSpeed: 0.1, // Slow blending = smooth
  },

  takeoff: {
    liftSpeed: 800.0, // Fast, realistic climb
    acceleration: 350.0,
    maxHeight: 70.0,
    duration: 4.0, // Longer, more realistic duration
    pitchAngle: 20.0,
    speedMultiplier: 2.5,
  },

  toPhysicsTransition: {
    orbitPullStrength: 150.0,
    linearDamping: 0.15, // Low damping = more realistic
    angularDamping: 0.4,
    blendDuration: 0.8, // Longer blend = smoother
    captureVelocityFrames: 6, // More frames = better history
  },

  orbit: {
    center: [20, 50, 0],
    radius: 12.0, // Tighter orbit = more precision needed
    targetSpeed: 0.6,
    stiffness: 40.0, // High stiffness = tight control
    tangentialAccel: 15.0,
    altitudeVariation: 4.0,
  },

  avoidance: {
    detectionRadius: 8.0, // Small radius = precise detection
    repulsionStrength: 80.0,
    enablePrediction: true, // Enable expensive but accurate prediction
    predictionTime: 1.5,
  },

  toLandingTransition: {
    dampingDuration: 1.0,
    orbitLinearDamping: 0.2,
    landingLinearDamping: 3.5,
    landingPullStrength: 80.0,
    velocityDecayDuration: 2.0,
    rotationBlendSpeed: 0.08,
  },

  landing: {
    approachSpeed: 0.4,
    descentRate: 0.5,
    touchdownThreshold: 0.1,
    finalOrientation: [0, 0, 0],
  },

  global: {
    gravityScale: 0,
    timeScale: 1.0,
    debugVisualization: false,
  },
};

/**
 * DEBUG PRESET
 * Optimized for development and debugging
 *
 * Features:
 * - Slow motion (0.5x speed) for inspection
 * - Debug visualization enabled
 * - Tight avoidance for collision testing
 * - Verbose state transitions
 *
 * Use when:
 * - Developing and debugging
 * - Testing collision avoidance
 * - Verifying state transitions
 * - Analyzing motion behavior
 */
export const DEBUG_PRESET: AnimationPhysicsConfig = {
  ...DEFAULT_ANIMATION_PHYSICS_CONFIG,

  taxi: {
    speed: 0.3,
    acceleration: 5.0,
    waypointThreshold: 0.3,
    orientationBlendSpeed: 0.1,
  },

  takeoff: {
    liftSpeed: 300.0, // Half speed for easier observation
    acceleration: 125.0,
    maxHeight: 50.0,
    duration: 6.0, // Double duration for slow-mo
    pitchAngle: 15.0,
    speedMultiplier: 1.0, // No speed multiplier to simplify
  },

  toPhysicsTransition: {
    orbitPullStrength: 100.0,
    linearDamping: 0.2,
    angularDamping: 0.5,
    blendDuration: 1.0, // Longer = easier to observe
    captureVelocityFrames: 4,
  },

  orbit: {
    center: [20, 50, 0],
    radius: 15.0,
    targetSpeed: 0.25, // Half speed
    stiffness: 25.0,
    tangentialAccel: 10.0,
    altitudeVariation: 3.0,
  },

  avoidance: {
    detectionRadius: 8.0, // Tight detection
    repulsionStrength: 100.0, // Strong repulsion for testing
    enablePrediction: true,
    predictionTime: 1.0,
  },

  toLandingTransition: {
    dampingDuration: 1.0,
    orbitLinearDamping: 0.3,
    landingLinearDamping: 4.0,
    landingPullStrength: 60.0,
    velocityDecayDuration: 2.0,
    rotationBlendSpeed: 0.08,
  },

  landing: {
    approachSpeed: 0.15, // Slow approach
    descentRate: 0.5, // Slow descent
    touchdownThreshold: 0.2,
    finalOrientation: [0, 0, 0],
  },

  global: {
    gravityScale: 0,
    timeScale: 0.5, // SLOW MOTION - half speed
    debugVisualization: true, // ENABLE DEBUG VISUALIZATION
  },
};

/**
 * TEST PRESET
 * Optimized for automated testing and CI/CD
 *
 * Features:
 * - Fast transitions for quick test cycles
 * - Deterministic behavior (no randomness)
 * - Known stable parameters
 * - Minimal variation to catch real issues
 *
 * Use when:
 * - Running automated tests
 * - Running in CI/CD pipeline
 * - Benchmarking performance
 * - Verifying correctness with known config
 */
export const TEST_PRESET: AnimationPhysicsConfig = {
  ...DEFAULT_ANIMATION_PHYSICS_CONFIG,

  taxi: {
    speed: 1.0, // Fast for tests
    acceleration: 20.0,
    waypointThreshold: 2.0, // Loose threshold for quick movement
    orientationBlendSpeed: 0.5,
  },

  takeoff: {
    liftSpeed: 1000.0, // Very fast takeoff
    acceleration: 500.0,
    maxHeight: 50.0,
    duration: 1.0, // Very short duration
    pitchAngle: 15.0,
    speedMultiplier: 1.0,
  },

  toPhysicsTransition: {
    orbitPullStrength: 150.0,
    linearDamping: 0.3,
    angularDamping: 0.6,
    blendDuration: 0.2, // Very fast handoff
    captureVelocityFrames: 3,
  },

  orbit: {
    center: [20, 50, 0],
    radius: 20.0,
    targetSpeed: 1.0, // Fast orbit
    stiffness: 30.0,
    tangentialAccel: 20.0,
    altitudeVariation: 0.0, // No variation - deterministic
  },

  avoidance: {
    detectionRadius: 12.0,
    repulsionStrength: 50.0,
    enablePrediction: false, // Disable for speed
    predictionTime: 0.5,
  },

  toLandingTransition: {
    dampingDuration: 0.3,
    orbitLinearDamping: 0.4,
    landingLinearDamping: 5.0,
    landingPullStrength: 80.0,
    velocityDecayDuration: 0.5,
    rotationBlendSpeed: 0.2,
  },

  landing: {
    approachSpeed: 0.5, // Fast approach
    descentRate: 2.0, // Fast descent
    touchdownThreshold: 0.5, // Loose threshold
    finalOrientation: [0, 0, 0],
  },

  global: {
    gravityScale: 0,
    timeScale: 2.0, // 2x speed - faster tests
    debugVisualization: false,
  },
};

/**
 * Registry of all presets
 */
export const ANIMATION_PHYSICS_PRESETS = {
  performance: PERFORMANCE_PRESET,
  quality: QUALITY_PRESET,
  highQuality: HIGH_QUALITY_PRESET,
  debug: DEBUG_PRESET,
  test: TEST_PRESET,
} as const;

/**
 * Get preset by name
 */
export function getPreset(
  name: keyof typeof ANIMATION_PHYSICS_PRESETS
): AnimationPhysicsConfig {
  return { ...ANIMATION_PHYSICS_PRESETS[name] };
}

/**
 * List all available presets
 */
export function listAvailablePresets(): string[] {
  return Object.keys(ANIMATION_PHYSICS_PRESETS);
}

/**
 * Get preset description
 */
export function getPresetDescription(
  name: keyof typeof ANIMATION_PHYSICS_PRESETS
): string {
  const descriptions: Record<string, string> = {
    performance: 'Optimized for 100+ vehicles at 30-45 FPS',
    quality: 'Balanced for 50 vehicles at 60 FPS (recommended)',
    highQuality: 'High precision for 10-20 vehicles at 60+ FPS',
    debug: 'Slow motion with debug visualization enabled',
    test: 'Fast transitions for automated testing',
  };

  return descriptions[name] || 'Unknown preset';
}
