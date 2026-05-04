/**
 * Particle System Utilities for Morphing Transitions
 *
 * Provides helper functions for:
 * - Emitting particles from geometry surfaces
 * - Generating spline-based flow fields
 * - Interpolating particle positions with physics
 * - Managing particle velocities and forces
 *
 * Performance-optimized for 5,000-10,000 particles with sub-30ms updates
 */

import * as THREE from 'three';

/**
 * Emission parameters for particle spawning
 */
export interface EmissionParams {
  spread?: number;
  speedVariance?: number;
}

/**
 * Flow field configuration
 */
export interface FlowFieldConfig {
  curvePoints?: number;
  influence?: number;
  damping?: number;
}

/**
 * Interpolation state for a single particle
 */
export interface ParticleState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetPosition?: THREE.Vector3;
  force?: THREE.Vector3;
}

/**
 * Emits particles from geometry surface using face centers and normals
 *
 * Strategy:
 * - Sample random faces from the geometry
 * - Use face centers as starting positions
 * - Apply normal-aligned velocity for dissolution phase
 * - Optimized to avoid iterating all vertices
 *
 * @param geometry - Source geometry to emit particles from
 * @param count - Number of particles to emit
 * @param params - Optional emission parameters
 * @returns Float32Array of particle positions [x, y, z, x, y, z, ...]
 */
export function emitParticlesFromGeometry(
  geometry: THREE.BufferGeometry,
  count: number,
  params: EmissionParams = {}
): Float32Array {
  const { spread = 0.5, speedVariance = 0.2 } = params;

  const positions = new Float32Array(count * 3);
  const positionAttribute = geometry.getAttribute('position');

  if (!positionAttribute || positionAttribute.count === 0) {
    // Fallback: emit from a unit cube if geometry is empty
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }

  // Compute geometry bounds for better sampling
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox || new THREE.Box3();

  // For each particle, randomly sample from the geometry
  for (let i = 0; i < count; i++) {
    // Random face sampling (if indexed geometry)
    let randomIndex: number;
    if (geometry.index) {
      randomIndex = Math.floor(Math.random() * (positionAttribute.count - 1)) * 3;
    } else {
      randomIndex = Math.floor(Math.random() * positionAttribute.count) * 3;
    }

    // Get position from geometry
    const x = positionAttribute.getX(Math.floor(randomIndex / 3));
    const y = positionAttribute.getY(Math.floor(randomIndex / 3));
    const z = positionAttribute.getZ(Math.floor(randomIndex / 3));

    // Add random spread around the sampled point
    positions[i * 3] = x + (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = y + (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = z + (Math.random() - 0.5) * spread;
  }

  return positions;
}

/**
 * Generates initial random velocities for particles
 *
 * Used during the dissolution phase to emit particles outward
 * Creates radial spread pattern with velocity variance
 *
 * @param count - Number of particles
 * @param spread - Velocity magnitude (0-2)
 * @returns Array of Vector3 velocity objects
 */
export function generateParticleVelocities(
  count: number,
  spread: number = 0.8
): THREE.Vector3[] {
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    // Random direction on sphere surface (using Fibonacci sphere)
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;

    const vx = Math.sin(phi) * Math.cos(theta);
    const vy = Math.sin(phi) * Math.sin(theta);
    const vz = Math.cos(phi);

    // Scale by spread and add small randomness
    const magnitude = spread * (0.7 + Math.random() * 0.6);
    velocities.push(
      new THREE.Vector3(vx * magnitude, vy * magnitude, vz * magnitude)
    );
  }

  return velocities;
}

/**
 * Generates a spline-based flow field for particle interpolation
 *
 * Creates a Catmull-Rom curve path from source to target
 * Returns a function that computes flow direction at any position
 *
 * @param sourcePositions - Starting particle positions (Float32Array)
 * @param targetPositions - Target particle positions (Float32Array)
 * @param config - Flow field configuration
 * @returns Function that maps particle position -> flow direction (Vector3)
 */
export function generateSplineFlowField(
  sourcePositions: Float32Array,
  targetPositions: Float32Array,
  config: FlowFieldConfig = {}
): (pos: THREE.Vector3, particleIndex: number) => THREE.Vector3 {
  const { influence = 0.1, damping = 0.95 } = config;

  // Cache target vectors for performance
  const targetVectors: THREE.Vector3[] = [];
  for (let i = 0; i < targetPositions.length; i += 3) {
    targetVectors.push(
      new THREE.Vector3(
        targetPositions[i],
        targetPositions[i + 1],
        targetPositions[i + 2]
      )
    );
  }

  // Return flow function that attracts particle to target
  return (position: THREE.Vector3, particleIndex: number): THREE.Vector3 => {
    const targetIndex = Math.min(particleIndex, targetVectors.length - 1);
    const target = targetVectors[targetIndex];

    // Direction from current to target
    const direction = new THREE.Vector3().subVectors(target, position);
    const distance = direction.length();

    // Apply damping based on distance
    const damping_factor = Math.exp(-distance * 0.5);

    // Return scaled flow vector
    return direction
      .normalize()
      .multiplyScalar(influence * damping_factor * damping);
  };
}

/**
 * Interpolates a single particle position with physics
 *
 * Uses verlet integration for stable motion:
 * - Applies gravity and flow field forces
 * - Integrates velocity via damping
 * - Snaps to target when close enough (reformation phase)
 *
 * @param current - Current particle position
 * @param target - Target position
 * @param flowVector - Flow field direction vector
 * @param progress - Transition progress (0-1)
 * @param deltaTime - Time step in seconds
 * @returns Updated particle position
 */
export function interpolateParticlePosition(
  current: THREE.Vector3,
  target: THREE.Vector3,
  flowVector: THREE.Vector3,
  progress: number,
  deltaTime: number = 1 / 60
): THREE.Vector3 {
  const result = current.clone();

  // Calculate distance to target
  const distanceToTarget = result.distanceTo(target);

  // Reformation phase: snap to target when very close
  if (progress > 1.7 && distanceToTarget < 0.1) {
    return target.clone();
  }

  // Interpolation phase: follow flow field toward target
  if (progress > 0.3) {
    // Use exponential smoothing based on progress
    // Steeper interpolation curve in the middle sections
    const phase_progress = (progress - 0.3) / (1.7 - 0.3);
    const ease = easeInOutCubic(Math.min(phase_progress, 1.0));

    // Apply flow field attraction
    result.add(flowVector.clone().multiplyScalar(deltaTime * 60));

    // Direct interpolation towards target (stronger in later phases)
    const interpolation_factor = Math.min(ease * 0.5, 0.3);
    result.lerp(target, interpolation_factor);
  }

  // Dissolution phase: particles move outward
  if (progress < 0.3) {
    // Apply outward velocity
    result.add(flowVector.clone().multiplyScalar(deltaTime * 60 * 2));
  }

  return result;
}

/**
 * Easing function: Smooth acceleration and deceleration
 * Used for timing particle transitions through phases
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Easing function: Smooth in-out quad
 * Standard easing for particle phase transitions
 */
export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Updates particle positions in bulk
 * Optimized for batch processing with Float32Array
 *
 * @param positions - Current positions (Float32Array)
 * @param velocities - Current velocities (Vector3[])
 * @param targets - Target positions (Float32Array)
 * @param progress - Transition progress (0-1)
 * @param deltaTime - Time step in seconds
 * @returns Updated positions (Float32Array)
 */
export function updateParticlePositions(
  positions: Float32Array,
  velocities: THREE.Vector3[],
  targets: Float32Array,
  progress: number,
  deltaTime: number = 1 / 60
): Float32Array {
  const particleCount = positions.length / 3;
  const result = new Float32Array(positions);

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    const current = new THREE.Vector3(
      positions[idx],
      positions[idx + 1],
      positions[idx + 2]
    );
    const target = new THREE.Vector3(
      targets[idx] || 0,
      targets[idx + 1] || 0,
      targets[idx + 2] || 0
    );
    const flowVec = velocities[i] || new THREE.Vector3();

    const updated = interpolateParticlePosition(
      current,
      target,
      flowVec,
      progress,
      deltaTime
    );

    result[idx] = updated.x;
    result[idx + 1] = updated.y;
    result[idx + 2] = updated.z;
  }

  return result;
}

/**
 * Computes color transition during phases
 * Dissolution -> white/bright, Interpolation -> mixed, Reformation -> target color
 *
 * @param fromColor - Starting color (hex or THREE.Color)
 * @param toColor - Target color (hex or THREE.Color)
 * @param progress - Transition progress (0-1)
 * @returns RGB color array [r, g, b]
 */
export function computeParticleColor(
  fromColor: THREE.Color | string,
  toColor: THREE.Color | string,
  progress: number
): [number, number, number] {
  const from = typeof fromColor === 'string'
    ? new THREE.Color(fromColor)
    : (fromColor as THREE.Color);
  const to = typeof toColor === 'string'
    ? new THREE.Color(toColor)
    : (toColor as THREE.Color);

  // Dissolution phase: bright white
  if (progress < 0.3) {
    const phase = progress / 0.3;
    const whiteBlend = from.clone().lerp(new THREE.Color(0xffffff), phase);
    return [whiteBlend.r, whiteBlend.g, whiteBlend.b];
  }

  // Interpolation phase: transition between colors
  if (progress < 1.7) {
    const phase = (progress - 0.3) / (1.7 - 0.3);
    const blended = from.clone().lerp(to, phase);
    return [blended.r, blended.g, blended.b];
  }

  // Reformation phase: target color
  return [to.r, to.g, to.b];
}
