import * as THREE from 'three';

export interface OrbitalParams {
  center: THREE.Vector3;
  radius: number;
  speed: number;
  initialAngle: number;
  altitude: number;
  // Smooth variation parameters (from landing page orbital system)
  phase: number; // Random phase offset for variation timing
  noiseOffset: number; // Random noise offset for uniqueness
}

/**
 * Generate randomized orbital parameters for particles to prevent stacking
 * Each particle gets unique orbit center, radius, speed, and starting angle
 */
export function generateRandomOrbitalParams(
  baseCenter: [number, number, number],
  baseRadius: number,
  baseSpeed: number,
  baseAltitude: number
): OrbitalParams {
  // Randomize orbit center within a small area around base center
  const centerOffset = {
    x: (Math.random() - 0.5) * 10, // ±5 units
    y: (Math.random() - 0.5) * 5,  // ±2.5 units
    z: (Math.random() - 0.5) * 10,  // ±5 units
  };

  const center = new THREE.Vector3(
    baseCenter[0] + centerOffset.x,
    baseCenter[1] + centerOffset.y,
    baseCenter[2] + centerOffset.z
  );

  // Randomize radius (±30% variation)
  const radiusVariation = 0.3;
  const radius = baseRadius * (1 + (Math.random() - 0.5) * radiusVariation);

  // Randomize speed (±20% variation)
  const speedVariation = 0.2;
  const speed = baseSpeed * (1 + (Math.random() - 0.5) * speedVariation);

  // Randomize starting angle (0 to 2π)
  const initialAngle = Math.random() * Math.PI * 2;

  // Randomize altitude slightly (±10% variation)
  const altitudeVariation = 0.1;
  const altitude = baseAltitude * (1 + (Math.random() - 0.5) * altitudeVariation);

  // Random phase and noise offset for smooth variation (from landing page system)
  const phase = Math.random() * Math.PI * 1.1;
  const noiseOffset = Math.random() * Math.PI * 1.1;

  return {
    center,
    radius,
    speed,
    initialAngle,
    altitude,
    phase,
    noiseOffset,
  };
}

/**
 * Calculate position on orbit given angle and orbital parameters
 * Adapted from landing page orbital system with smooth distance variation
 */
export function getOrbitPosition(
  angle: number,
  params: OrbitalParams,
  time: number = 0
): THREE.Vector3 {
  // Smooth radius variation (elliptical variation like landing page)
  // Creates smooth increase/decrease of distance traveled
  const radiusVariation = 1.0 + Math.sin(time * 0.3 + params.phase) * 0.1;
  const effectiveRadius = params.radius * radiusVariation;

  // Smooth speed variation (acceleration/deceleration)
  const speedVariation = 1.0 + Math.sin(time * 0.2 + params.noiseOffset) * 0.15;
  const effectiveSpeed = params.speed * speedVariation;

  // 3D orbital path with slight inclination (from landing page)
  const inclination = Math.sin(params.phase) * 0.3;
  
  return new THREE.Vector3(
    params.center.x + Math.cos(angle) * effectiveRadius * Math.cos(inclination),
    params.altitude + Math.sin(angle) * effectiveRadius * Math.sin(inclination),
    params.center.z + Math.sin(angle) * effectiveRadius
  );
}

/**
 * Calculate smooth orbital angle update with speed variation
 * Returns the new angle after applying smooth speed changes
 */
export function updateOrbitalAngle(
  currentAngle: number,
  params: OrbitalParams,
  delta: number,
  time: number
): number {
  // Smooth speed variation for acceleration/deceleration
  const speedVariation = 1.0 + Math.sin(time * 0.2 + params.noiseOffset) * 0.15;
  const effectiveSpeed = params.speed * speedVariation;
  
  return currentAngle + effectiveSpeed * delta;
}
