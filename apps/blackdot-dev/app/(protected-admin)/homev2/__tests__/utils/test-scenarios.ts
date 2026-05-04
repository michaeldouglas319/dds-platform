/**
 * PREDEFINED TEST SCENARIOS
 *
 * Standard test cases for validating physics transitions.
 * Each scenario tests a specific flight phase or transition.
 */

import type { PhysicsTestScenario } from './physics-test-utils';

/**
 * TAXI TEST SCENARIO
 * Validates kinematic movement from gate to runway
 */
export const TAXI_SCENARIO: PhysicsTestScenario = {
  name: 'Taxi Phase',
  description: 'Particle moves from gate to runway with smooth acceleration',
  initialState: {
    position: [-10, 0.1, 0],
    velocity: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [15, 0.1, 0], // Reached runway (approximate)
    velocity: [0.3, 0, 0], // Taxi speed
  },
  duration: 100, // 100 seconds for full taxi
  tolerance: {
    position: 5.0, // Allow ±5 units variation
    velocity: 0.2,
    jitter: 0.1,
  },
};

/**
 * TAKEOFF TEST SCENARIO
 * Validates kinematic climb from runway to orbit entry altitude
 */
export const TAKEOFF_SCENARIO: PhysicsTestScenario = {
  name: 'Takeoff Phase',
  description: 'Particle ascends from runway to orbit altitude with pitch',
  initialState: {
    position: [0, 0.1, 0],
    velocity: [600, 0, 0], // Forward speed
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [0, 50, 0], // At max altitude
    velocity: [600, 100, 0], // Still forward + upward component
  },
  duration: 3.0, // 3 seconds takeoff
  tolerance: {
    position: 5.0,
    velocity: 50.0,
    jitter: 0.1,
  },
};

/**
 * TAKEOFF → ORBIT HANDOFF TEST SCENARIO
 * CRITICAL: Validates smooth transition from animation to physics
 */
export const TAKEOFF_TO_ORBIT_HANDOFF_SCENARIO: PhysicsTestScenario = {
  name: 'Takeoff → Orbit Physics Handoff',
  description:
    'Validates zero-jitter transition from kinematic animation to dynamic physics. ' +
    'This is the most critical transition in the system.',
  initialState: {
    position: [0, 50, 0], // At max takeoff altitude
    velocity: [600, 100, 0], // Takeoff velocity
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [20, 50, 0], // Near orbit center
    velocity: [10, 0, 0], // Reduced to orbital speed
  },
  duration: 1.0, // 1 second transition + stabilization
  tolerance: {
    position: 2.0, // Tight tolerance - physics should be precise
    velocity: 1.0,
    jitter: 0.1, // CRITICAL: Must detect jitter
  },
};

/**
 * ORBIT STABILITY TEST SCENARIO
 * Validates physics-based orbiting doesn't drift
 */
export const ORBIT_STABILITY_SCENARIO: PhysicsTestScenario = {
  name: 'Orbit Stability',
  description:
    'Validates particle maintains stable circular orbit without drifting. ' +
    'Physics body should smoothly maintain radius and altitude.',
  initialState: {
    position: [35, 50, 0], // Orbit entry point (radius 15 from center [20, 50, 0])
    velocity: [0, 0, 7.5], // Tangential velocity for 0.5 units/s orbit
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [20, 50, 0], // Still at orbit center Y, radius maintained
    velocity: [0, 0, 7.5], // Tangential velocity maintained
  },
  duration: 20.0, // 20 seconds = ~2 complete orbits
  tolerance: {
    position: 5.0,
    velocity: 1.0,
    jitter: 0.2,
  },
};

/**
 * ORBIT → LANDING HANDOFF TEST SCENARIO
 * CRITICAL: Validates smooth transition from physics back to animation
 */
export const ORBIT_TO_LANDING_HANDOFF_SCENARIO: PhysicsTestScenario = {
  name: 'Orbit → Landing Physics Handoff',
  description:
    'Validates smooth transition from dynamic physics back to kinematic control. ' +
    'Physics damping increases, then control switches to kinematic.',
  initialState: {
    position: [35, 50, 0], // In orbit
    velocity: [0, 0, 7.5], // Orbiting at speed
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [-10, 0.1, 0], // Back at gate
    velocity: [0, 0, 0], // Stationary
  },
  duration: 1.5, // 1.5 seconds transition + descent
  tolerance: {
    position: 5.0,
    velocity: 1.0,
    jitter: 0.1, // CRITICAL: No jitter on landing
  },
};

/**
 * LANDING TEST SCENARIO
 * Validates kinematic descent to parked position
 */
export const LANDING_SCENARIO: PhysicsTestScenario = {
  name: 'Landing Phase',
  description: 'Particle descends smoothly from orbit to gate with orientation control',
  initialState: {
    position: [0, 50, 0],
    velocity: [0, -1, 0], // Descending
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [-10, 0.1, 0], // At gate
    velocity: [0, 0, 0], // Stopped
  },
  duration: 50, // 50 seconds descent
  tolerance: {
    position: 2.0,
    velocity: 0.2,
    jitter: 0.05,
  },
};

/**
 * FULL CYCLE TEST SCENARIO
 * Validates complete parked → orbit → parked sequence
 */
export const FULL_CYCLE_SCENARIO: PhysicsTestScenario = {
  name: 'Full Flight Cycle',
  description:
    'Complete cycle: parked → taxi → takeoff → orbit → landing → parked. ' +
    'Tests integration of all phases.',
  initialState: {
    position: [-10, 0.1, 0], // Parked at gate
    velocity: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [-10, 0.1, 0], // Back at same gate
    velocity: [0, 0, 0], // Stationary
  },
  duration: 180, // 3 minutes total (taxi 90s, takeoff 3s, orbit 60s, landing 27s)
  tolerance: {
    position: 3.0,
    velocity: 0.1,
    jitter: 0.15,
  },
};

/**
 * COLLISION AVOIDANCE TEST SCENARIO
 * Validates avoidance forces prevent collisions
 */
export const COLLISION_AVOIDANCE_SCENARIO: PhysicsTestScenario = {
  name: 'Collision Avoidance',
  description: 'Two particles orbit and avoid collision through sensor/force system',
  initialState: {
    position: [35, 50, 0], // Orbit entry
    velocity: [0, 0, 7.5],
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [20, 50, 0], // Maintained orbit (with avoidance clearance)
    velocity: [0, 0, 7.5], // Maintained speed despite avoidance
  },
  duration: 10.0, // 10 seconds in shared orbit
  tolerance: {
    position: 5.0,
    velocity: 1.0,
    jitter: 0.2,
  },
};

/**
 * HIGH LOAD TEST SCENARIO
 * Validates performance with many simultaneous transitions
 */
export const HIGH_LOAD_SCENARIO: PhysicsTestScenario = {
  name: 'High Load (50 Vehicles)',
  description:
    'Validates system handles 50 vehicles with continuous state transitions. ' +
    'Each particle starts at different phases for staggered load.',
  initialState: {
    position: [0, 25, 0], // Variable (each particle different)
    velocity: [300, 50, 0], // In flight
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [20, 50, 0], // In orbit
    velocity: [5, 0, 5], // Orbiting
  },
  duration: 60, // 60 seconds with all transitions happening
  tolerance: {
    position: 10.0,
    velocity: 2.0,
    jitter: 0.3, // Higher tolerance due to many simultaneous transitions
  },
};

/**
 * FAST TRANSITIONS TEST SCENARIO
 * Used for automated testing - all phases complete quickly
 */
export const FAST_TRANSITIONS_SCENARIO: PhysicsTestScenario = {
  name: 'Fast Transitions (Testing)',
  description: 'Compressed timeline for automated test execution',
  initialState: {
    position: [-10, 0.1, 0],
    velocity: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    mass: 1000,
  },
  expectedFinalState: {
    position: [-10, 0.1, 0],
    velocity: [0, 0, 0],
  },
  duration: 10, // 10 seconds total (all phases compressed)
  tolerance: {
    position: 5.0,
    velocity: 1.0,
    jitter: 0.2,
  },
};

/**
 * Registry of all test scenarios
 */
export const TEST_SCENARIOS = {
  taxi: TAXI_SCENARIO,
  takeoff: TAKEOFF_SCENARIO,
  takeoffToOrbitHandoff: TAKEOFF_TO_ORBIT_HANDOFF_SCENARIO,
  orbitStability: ORBIT_STABILITY_SCENARIO,
  orbitToLandingHandoff: ORBIT_TO_LANDING_HANDOFF_SCENARIO,
  landing: LANDING_SCENARIO,
  fullCycle: FULL_CYCLE_SCENARIO,
  collisionAvoidance: COLLISION_AVOIDANCE_SCENARIO,
  highLoad: HIGH_LOAD_SCENARIO,
  fastTransitions: FAST_TRANSITIONS_SCENARIO,
} as const;

/**
 * Get scenario by name
 */
export function getScenario(
  name: keyof typeof TEST_SCENARIOS
): PhysicsTestScenario {
  return TEST_SCENARIOS[name];
}

/**
 * List all available scenarios
 */
export function listAvailableScenarios(): string[] {
  return Object.keys(TEST_SCENARIOS);
}

/**
 * Get critical test scenarios (must pass for production)
 */
export function getCriticalScenarios(): PhysicsTestScenario[] {
  return [
    TAKEOFF_TO_ORBIT_HANDOFF_SCENARIO,
    ORBIT_TO_LANDING_HANDOFF_SCENARIO,
    FULL_CYCLE_SCENARIO,
  ];
}

/**
 * Get performance test scenarios
 */
export function getPerformanceScenarios(): PhysicsTestScenario[] {
  return [FULL_CYCLE_SCENARIO, HIGH_LOAD_SCENARIO];
}
