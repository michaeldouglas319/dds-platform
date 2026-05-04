/**
 * Physics Engine Configuration
 *
 * Central configuration for React Three Rapier physics engine settings.
 * Controls gravity, stepping, collision detection, and debugging.
 */

export const PHYSICS_CONFIG = {
  // World settings
  gravity: [0, 0, 0] as [number, number, number],
  timeStep: 'vary' as const, // 'vary' | number for adaptive stepping
  maxSubSteps: 4,
  interpolate: true,
  colliders: 'trimesh' as const,
  paused: false,

  // Physics behavior
  physics: {
    // Orbital mechanics: zero gravity, forces applied explicitly
    orbital: {
      gravity: [0, 0, 0] as [number, number, number],
      damping: 0.1, // Linear damping for orbit stability
      angularDamping: 0.1,
    },

    // Taxi and takeoff: kinematic movement
    taxi: {
      speed: 0.5,
      acceleration: 5,
      waypointThreshold: 0.5,
    },

    // Landing: physics-to-kinematic transition
    landing: {
      dampingRamp: 1.0, // Seconds to ramp damping
      forceScale: 100,
    },
  },

  // Debug visualization
  debug: {
    enabled: false,
    showColliders: true,
    showRigidBodies: true,
    showJoints: true,
    showContactPoints: true,
  },

  // Performance optimization
  performance: {
    enableSleeping: true,
    sleepThreshold: 0.01,
    enableConstraintPrefiltration: true,
  },
} as const;

export type PhysicsConfig = typeof PHYSICS_CONFIG;
