/**
 * Orbit Physics System - Rapier Integration
 *
 * GOLD STANDARD - Phase 2: True Rapier Physics for Orbital Motion
 *
 * Core Rule #3: Orbit Entry Acceptance
 * - Seamless handoff from scripted trajectory → Rapier physics
 * - Velocity matching at blue gate
 * - Natural collision avoidance via Rapier
 * - Donut-shaped orbital zone (inner/outer radius bounds)
 */

import * as THREE from 'three';
import type { RigidBody, Collider } from '@dimforge/rapier3d-compat';

/**
 * Orbit physics configuration
 */
export interface OrbitPhysicsConfig {
  // Donut geometry
  orbitRadius: number;              // Nominal orbit radius
  donutThickness: number;           // ±thickness from nominal radius

  // Physics parameters
  gravitationalConstant: number;    // Strength of central gravity well
  nominalOrbitSpeed: number;        // Target tangential velocity
  particleMass: number;             // Mass of each particle
  collisionRadius: number;          // Particle collision sphere radius

  // Damping (air resistance)
  dampingLinear: number;            // Linear velocity damping (0-1)
  dampingAngular: number;           // Angular velocity damping (0-1)

  // Orbit maintenance forces
  tangentialBoost: number;          // Force to maintain orbital speed
  radialConfinement: number;        // Force to keep particles in donut

  // Collision properties
  restitution: number;              // Bounciness (0-1)
  friction: number;                 // Surface friction (0-1)
}

/**
 * Default orbit physics configuration
 */
export const DEFAULT_ORBIT_PHYSICS_CONFIG: OrbitPhysicsConfig = {
  orbitRadius: 25.0,
  donutThickness: 10.0,

  gravitationalConstant: 100.0,
  nominalOrbitSpeed: 0.6,
  particleMass: 1.0,
  collisionRadius: 1.5,

  dampingLinear: 0.1,
  dampingAngular: 0.3,

  tangentialBoost: 50.0,
  radialConfinement: 80.0,

  restitution: 0.5,
  friction: 0.1,
};

/**
 * Calculate orbital forces to apply to particle
 */
export function calculateOrbitalForces(
  position: THREE.Vector3,
  velocity: THREE.Vector3,
  orbitCenter: THREE.Vector3,
  config: OrbitPhysicsConfig
) {
  const toParticle = new THREE.Vector3().subVectors(position, orbitCenter);
  const distanceFromCenter = toParticle.length();
  const radialDirection = toParticle.clone().normalize();

  // Gravity force (toward center)
  const gravityMagnitude = config.gravitationalConstant * config.particleMass / (distanceFromCenter * distanceFromCenter);
  const gravityForce = radialDirection.clone().multiplyScalar(-gravityMagnitude);

  // Tangential boost - 3D orbit using cross product
  // Use "up" vector to define orbital plane, but allow some vertical freedom
  const up = new THREE.Vector3(0, 1, 0);
  const tangentDirection = new THREE.Vector3().crossVectors(up, radialDirection).normalize();

  // If radial is too close to vertical, use fallback tangent (reversed direction)
  if (tangentDirection.length() < 0.1) {
    tangentDirection.set(radialDirection.z, 0, -radialDirection.x).normalize();
  }

  const tangentialVelocity = velocity.dot(tangentDirection);
  const speedError = config.nominalOrbitSpeed - tangentialVelocity;
  const tangentialForce = tangentDirection.clone().multiplyScalar(speedError * config.tangentialBoost);

  // Radial confinement
  const innerRadius = config.orbitRadius - config.donutThickness / 2;
  const outerRadius = config.orbitRadius + config.donutThickness / 2;
  let confinementForce = new THREE.Vector3(0, 0, 0);

  if (distanceFromCenter < innerRadius) {
    const penetration = innerRadius - distanceFromCenter;
    confinementForce = radialDirection.clone().multiplyScalar(penetration * config.radialConfinement);
  } else if (distanceFromCenter > outerRadius) {
    const penetration = distanceFromCenter - outerRadius;
    confinementForce = radialDirection.clone().multiplyScalar(-penetration * config.radialConfinement);
  }

  return {
    gravityForce,
    tangentialForce,
    confinementForce,
    totalForce: new THREE.Vector3().add(gravityForce).add(tangentialForce).add(confinementForce),
  };
}

/**
 * Calculate orbit tangent velocity
 */
export function calculateOrbitTangentVelocity(
  position: THREE.Vector3,
  orbitCenter: THREE.Vector3,
  nominalSpeed: number
): THREE.Vector3 {
  const toParticle = new THREE.Vector3().subVectors(position, orbitCenter);
  const radialDirection = toParticle.clone().normalize();
  // Reversed orbit direction: tangent perpendicular to radial
  const tangent = new THREE.Vector3(radialDirection.z, 0, -radialDirection.x).normalize();
  return tangent.multiplyScalar(nominalSpeed);
}

/**
 * Check velocity alignment with orbit tangent
 */
export function checkVelocityAlignment(
  velocity: THREE.Vector3,
  tangentVelocity: THREE.Vector3,
  maxAngleDifference: number = Math.PI / 6
): boolean {
  if (velocity.length() < 0.01) return false;
  const angle = velocity.angleTo(tangentVelocity);
  return angle < maxAngleDifference;
}
