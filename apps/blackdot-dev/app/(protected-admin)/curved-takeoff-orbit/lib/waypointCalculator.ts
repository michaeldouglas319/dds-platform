import * as THREE from 'three';

/**
 * Waypoint Calculator - Auto-generate purple waypoints from green+yellow+blue
 *
 * GOLD STANDARD - Phase 1: Purple Waypoint Auto-Calculation
 *
 * Core Rule #1: Flow with Momentum-Based Transitions
 * - Green waypoint: Spawn/taxi position
 * - Yellow waypoint: Release point (start of physics trajectory)
 * - Blue waypoint: Orbit entry gate (merge point)
 * - Purple waypoints: Auto-calculated intermediate points (smooth momentum transition)
 *
 * Algorithm:
 * 1. Calculate trajectory arc from yellow → blue
 * 2. Apply physics simulation (gravity, initial velocity, drag)
 * 3. Generate purple waypoints along natural ballistic curve
 * 4. Ensure smooth velocity matching at blue gate
 */

export interface WaypointCalculationConfig {
  // Input waypoints (user-defined)
  green: THREE.Vector3;  // Spawn/taxi position
  yellow: THREE.Vector3; // Release point
  blue: THREE.Vector3;   // Orbit entry gate

  // Physics parameters
  physics: {
    gravity: number;           // m/s² (default: 9.8)
    initialVelocity: number;   // m/s at yellow release
    dragCoefficient: number;   // Air resistance (0 = none, 1 = high)
    mass: number;              // Particle mass (kg)
  };

  // Trajectory settings
  trajectory: {
    sampleCount: number;       // Number of purple waypoints to generate
    timeStep: number;          // Simulation time step (seconds)
    maxDuration: number;       // Max trajectory duration (seconds)
    smoothingFactor: number;   // Curve smoothing (0-1, higher = smoother)
  };

  // Orbit matching
  orbit: {
    center: THREE.Vector3;     // Orbit center point
    radius: number;            // Orbit radius
    nominalSpeed: number;      // Target velocity at blue gate
  };

  // Momentum transition settings
  momentumHandoff: {
    blendDuration: number;     // Seconds to blend trajectory → orbit
    velocityMatchMode: 'tangent' | 'radial' | 'hybrid'; // How to match velocities
    smoothnessWeight: number;  // 0-1, higher = smoother (may miss blue gate slightly)
  };
}

export interface CalculatedWaypoints {
  // All waypoints in order: green → yellow → purple[] → blue
  allWaypoints: THREE.Vector3[];

  // Purple waypoints only (auto-calculated)
  purpleWaypoints: THREE.Vector3[];

  // Velocity at each waypoint (for momentum handoff)
  velocities: THREE.Vector3[];

  // Physics metadata
  metadata: {
    trajectoryDuration: number; // Total time from yellow → blue
    peakHeight: number;         // Maximum Y value in trajectory
    totalDistance: number;      // Arc length
    finalVelocity: THREE.Vector3; // Velocity at blue gate
    orbitTangentVelocity: THREE.Vector3; // Target orbit velocity
    velocityMismatch: number;   // Magnitude difference (for debugging)
  };

  // Curve for rendering
  curve: THREE.CatmullRomCurve3;
}

/**
 * Auto-calculate purple waypoints from green+yellow+blue
 * Uses physics simulation to generate natural ballistic trajectory
 */
export function calculatePurpleWaypoints(config: WaypointCalculationConfig): CalculatedWaypoints {
  const { green, yellow, blue, physics, trajectory, orbit, momentumHandoff } = config;

  // ========================================================================
  // STEP 1: Calculate initial trajectory direction (yellow → blue)
  // ========================================================================
  const toBlue = new THREE.Vector3().subVectors(blue, yellow);
  const distance = toBlue.length();
  const direction = toBlue.clone().normalize();

  // ========================================================================
  // STEP 2: Physics simulation (yellow → blue with gravity + drag)
  // ========================================================================
  const purpleWaypoints: THREE.Vector3[] = [];
  const velocities: THREE.Vector3[] = [];

  // Initial state at yellow
  let position = yellow.clone();
  let velocity = direction.clone().multiplyScalar(physics.initialVelocity);

  // Gravity vector (downward)
  const gravityVector = new THREE.Vector3(0, -physics.gravity, 0);

  let time = 0;
  let closestDistanceToBlue = Infinity;
  let bestPosition = position.clone();
  let bestVelocity = velocity.clone();
  let bestTime = 0;

  // Simulate trajectory with physics
  while (time < trajectory.maxDuration) {
    // Store current state
    if (purpleWaypoints.length < trajectory.sampleCount) {
      purpleWaypoints.push(position.clone());
      velocities.push(velocity.clone());
    }

    // Check if we're close to blue gate
    const distToBlue = position.distanceTo(blue);
    if (distToBlue < closestDistanceToBlue) {
      closestDistanceToBlue = distToBlue;
      bestPosition = position.clone();
      bestVelocity = velocity.clone();
      bestTime = time;
    }

    // Early exit if we reached blue gate
    if (distToBlue < 0.5) {
      break;
    }

    // Calculate forces
    const dragForce = velocity.clone().multiplyScalar(-physics.dragCoefficient * velocity.length());
    const totalForce = gravityVector.clone().add(dragForce);

    // Update velocity (F = ma, a = F/m)
    const acceleration = totalForce.divideScalar(physics.mass);
    velocity.add(acceleration.clone().multiplyScalar(trajectory.timeStep));

    // Update position
    position.add(velocity.clone().multiplyScalar(trajectory.timeStep));

    time += trajectory.timeStep;
  }

  // ========================================================================
  // STEP 3: Adjust final waypoint to exactly match blue gate
  // ========================================================================
  // Replace last purple waypoint with exact blue position
  if (purpleWaypoints.length > 0) {
    purpleWaypoints[purpleWaypoints.length - 1] = blue.clone();
  }

  // Calculate final velocity at blue gate
  const finalVelocity = bestVelocity.clone();

  // ========================================================================
  // STEP 4: Calculate target orbit tangent velocity at blue gate
  // ========================================================================
  // Blue gate angle relative to orbit center
  const toGate = new THREE.Vector3().subVectors(blue, orbit.center);
  const gateAngle = Math.atan2(toGate.z, toGate.x);

  // Orbit tangent velocity (perpendicular to radius)
  const orbitTangentVelocity = new THREE.Vector3(
    -Math.sin(gateAngle),
    0,
    Math.cos(gateAngle)
  ).multiplyScalar(orbit.nominalSpeed);

  // ========================================================================
  // STEP 5: Apply smoothing to purple waypoints
  // ========================================================================
  const smoothedPurple = smoothWaypoints(purpleWaypoints, trajectory.smoothingFactor);

  // ========================================================================
  // STEP 6: Assemble final waypoint array (green → yellow → purple[] → blue)
  // ========================================================================
  const allWaypoints = [
    green.clone(),
    yellow.clone(),
    ...smoothedPurple,
  ];

  // Ensure blue is the final waypoint
  if (allWaypoints[allWaypoints.length - 1].distanceTo(blue) > 0.1) {
    allWaypoints.push(blue.clone());
  }

  // ========================================================================
  // STEP 7: Create curve for rendering
  // ========================================================================
  const curve = new THREE.CatmullRomCurve3(allWaypoints, false, 'catmullrom', 0.5);

  // ========================================================================
  // STEP 8: Calculate metadata
  // ========================================================================
  const peakHeight = Math.max(...purpleWaypoints.map(p => p.y));
  const totalDistance = curve.getLength();
  const velocityMismatch = finalVelocity.clone().sub(orbitTangentVelocity).length();

  return {
    allWaypoints,
    purpleWaypoints: smoothedPurple,
    velocities,
    metadata: {
      trajectoryDuration: bestTime,
      peakHeight,
      totalDistance,
      finalVelocity,
      orbitTangentVelocity,
      velocityMismatch,
    },
    curve,
  };
}

/**
 * Smooth waypoints using weighted average
 * Higher smoothingFactor = smoother curve (may deviate from physics simulation)
 */
function smoothWaypoints(waypoints: THREE.Vector3[], smoothingFactor: number): THREE.Vector3[] {
  if (waypoints.length < 3 || smoothingFactor === 0) {
    return waypoints;
  }

  const smoothed: THREE.Vector3[] = [];

  for (let i = 0; i < waypoints.length; i++) {
    if (i === 0 || i === waypoints.length - 1) {
      // Keep first and last waypoints unchanged
      smoothed.push(waypoints[i].clone());
    } else {
      // Weighted average with neighbors
      const prev = waypoints[i - 1];
      const current = waypoints[i];
      const next = waypoints[i + 1];

      const smoothedPoint = new THREE.Vector3()
        .addScaledVector(prev, smoothingFactor * 0.25)
        .addScaledVector(current, 1 - smoothingFactor * 0.5)
        .addScaledVector(next, smoothingFactor * 0.25);

      smoothed.push(smoothedPoint);
    }
  }

  return smoothed;
}

/**
 * Default configuration factory for quick setup
 */
export function createDefaultWaypointConfig(
  green: THREE.Vector3,
  yellow: THREE.Vector3,
  blue: THREE.Vector3,
  orbitCenter: THREE.Vector3,
  orbitRadius: number
): WaypointCalculationConfig {
  return {
    green,
    yellow,
    blue,
    physics: {
      gravity: 9.8,
      initialVelocity: 15.0,
      dragCoefficient: 0.1,
      mass: 1.0,
    },
    trajectory: {
      sampleCount: 8,
      timeStep: 0.05,
      maxDuration: 5.0,
      smoothingFactor: 0.3,
    },
    orbit: {
      center: orbitCenter,
      radius: orbitRadius,
      nominalSpeed: 0.6,
    },
    momentumHandoff: {
      blendDuration: 0.3,
      velocityMatchMode: 'tangent',
      smoothnessWeight: 0.7,
    },
  };
}

/**
 * Validate waypoint configuration
 * Returns error messages if invalid, empty array if valid
 */
export function validateWaypointConfig(config: WaypointCalculationConfig): string[] {
  const errors: string[] = [];

  // Check for valid waypoints
  if (!config.green || !config.yellow || !config.blue) {
    errors.push('Missing required waypoints: green, yellow, or blue');
  }

  // Check physics parameters
  if (config.physics.gravity <= 0) {
    errors.push('Gravity must be positive');
  }
  if (config.physics.initialVelocity <= 0) {
    errors.push('Initial velocity must be positive');
  }
  if (config.physics.mass <= 0) {
    errors.push('Mass must be positive');
  }

  // Check trajectory parameters
  if (config.trajectory.sampleCount < 2) {
    errors.push('Sample count must be at least 2');
  }
  if (config.trajectory.timeStep <= 0) {
    errors.push('Time step must be positive');
  }
  if (config.trajectory.maxDuration <= 0) {
    errors.push('Max duration must be positive');
  }

  // Check orbit parameters
  if (config.orbit.radius <= 0) {
    errors.push('Orbit radius must be positive');
  }
  if (config.orbit.nominalSpeed <= 0) {
    errors.push('Orbit nominal speed must be positive');
  }

  return errors;
}

/**
 * Helper: Calculate orbit entry angle for a given blue gate position
 */
export function calculateOrbitEntryAngle(
  blueGate: THREE.Vector3,
  orbitCenter: THREE.Vector3
): number {
  const toGate = new THREE.Vector3().subVectors(blueGate, orbitCenter);
  return Math.atan2(toGate.z, toGate.x);
}

/**
 * Helper: Generate blue gate position from orbit angle
 */
export function generateBlueGatePosition(
  orbitCenter: THREE.Vector3,
  orbitRadius: number,
  entryAngle: number
): THREE.Vector3 {
  return new THREE.Vector3(
    orbitCenter.x + Math.cos(entryAngle) * orbitRadius,
    orbitCenter.y,
    orbitCenter.z + Math.sin(entryAngle) * orbitRadius
  );
}

/**
 * Debug visualization helper
 * Returns color-coded waypoint data for rendering
 */
export interface WaypointVisualization {
  green: { position: THREE.Vector3; color: string; label: string };
  yellow: { position: THREE.Vector3; color: string; label: string };
  purple: Array<{ position: THREE.Vector3; color: string; label: string }>;
  blue: { position: THREE.Vector3; color: string; label: string };
}

export function createWaypointVisualization(
  result: CalculatedWaypoints,
  config: WaypointCalculationConfig
): WaypointVisualization {
  return {
    green: {
      position: config.green,
      color: '#00ff00',
      label: 'Green (Spawn)',
    },
    yellow: {
      position: config.yellow,
      color: '#ffff00',
      label: 'Yellow (Release)',
    },
    purple: result.purpleWaypoints.map((pos, idx) => ({
      position: pos,
      color: '#ff00ff',
      label: `Purple ${idx + 1}`,
    })),
    blue: {
      position: config.blue,
      color: '#0000ff',
      label: 'Blue (Gate)',
    },
  };
}
