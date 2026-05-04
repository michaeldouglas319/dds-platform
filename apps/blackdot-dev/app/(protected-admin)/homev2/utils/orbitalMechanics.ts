import * as THREE from 'three';
import type { HybridParticle, OrbitalMechanicsState } from '../types/path-particle.types';
import type { OrbitalParams } from '@/lib/threejs/utils/orbitalPaths';

/**
 * Calculate orbital velocity using gravitational formula: v = √(k / r)
 *
 * Where:
 * - k is the gravitational parameter (controls how "strong" gravity is)
 * - r is the orbital radius
 *
 * This ensures particles at smaller radii orbit faster, naturally
 */
export function calculateOrbitalVelocity(
  radius: number,
  gravitationalParam: number = 1000
): number {
  if (radius <= 0) return 0;
  return Math.sqrt(gravitationalParam / radius);
}

/**
 * Create orbital mechanics state from particle parameters
 */
export function createOrbitalMechanicsState(
  particle: HybridParticle,
  gravitationalParam: number = 1000
): OrbitalMechanicsState {
  const mechanics: OrbitalMechanicsState = {
    center: particle.orbitalParams.center.clone(),
    radius: particle.orbitalParams.radius,
    eccentricity: 0.1 + Math.random() * 0.2, // 0.1-0.3 for slight elliptical orbits
    inclination: (Math.random() - 0.5) * 0.3, // ±0.15 radians

    gravitationalParam,
    currentRadius: particle.orbitalParams.radius,
    orbitalVelocity: calculateOrbitalVelocity(particle.orbitalParams.radius, gravitationalParam),

    eccentricityPhase: Math.random() * Math.PI * 2,
    inclinationPhase: Math.random() * Math.PI * 2,
  };

  return mechanics;
}

/**
 * Update orbital angle based on velocity and radius
 *
 * Angular velocity ω = v / r (radians per second)
 */
export function updateOrbitalAngle(
  particle: HybridParticle,
  mechanics: OrbitalMechanicsState,
  delta: number,
  time: number
): number {
  // Calculate current radius with elliptical variation
  const radiusVariation = 1.0 + mechanics.eccentricity * Math.sin(particle.orbitAngle + mechanics.eccentricityPhase);
  mechanics.currentRadius = mechanics.radius * radiusVariation;

  // Calculate orbital velocity for this radius
  const orbitalVelocity = calculateOrbitalVelocity(mechanics.currentRadius, mechanics.gravitationalParam);
  mechanics.orbitalVelocity = orbitalVelocity;

  // Calculate angular velocity: ω = v / r
  const angularVelocity = orbitalVelocity / mechanics.currentRadius;

  // Apply particle's speed variation multiplier
  const speedVariation = 1.0 + Math.sin(time * 0.2 + particle.speedVariation * Math.PI) * 0.15;
  const effectiveAngularVelocity = angularVelocity * particle.orbitalSpeed * speedVariation;

  // Update angle
  return particle.orbitAngle + effectiveAngularVelocity * delta;
}

/**
 * Calculate particle position in orbit with natural variations
 */
export function calculateOrbitalPosition(
  particle: HybridParticle,
  mechanics: OrbitalMechanicsState,
  time: number
): THREE.Vector3 {
  // Calculate radius with elliptical variation
  const radiusVariation = 1.0 + mechanics.eccentricity * Math.sin(particle.orbitAngle + mechanics.eccentricityPhase);
  const currentRadius = mechanics.radius * radiusVariation;

  // Calculate base orbital position
  const x = mechanics.center.x + currentRadius * Math.cos(particle.orbitAngle);
  const z = mechanics.center.z + currentRadius * Math.sin(particle.orbitAngle);

  // Apply inclination (orbital plane tilt)
  const inclination = mechanics.inclination + particle.radiusVariation * 0.2 * Math.sin(particle.orbitAngle * 2 + mechanics.inclinationPhase);
  const yOffset = currentRadius * inclination * Math.sin(particle.orbitAngle * 2);

  // Apply altitude with small random variation for visual interest
  const altitudeVariation = Math.sin(time * 0.1 + particle.inclinationPhase) * 2; // ±2 units
  const y = mechanics.center.y + particle.orbitalParams.altitude + altitudeVariation + yOffset;

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculate orbital velocity vector (tangent to orbit)
 */
export function calculateOrbitalVelocityVector(
  particle: HybridParticle,
  mechanics: OrbitalMechanicsState
): THREE.Vector3 {
  // Tangent direction (perpendicular to radius)
  const tangentX = -Math.sin(particle.orbitAngle);
  const tangentZ = Math.cos(particle.orbitAngle);

  // Calculate orbital speed at current radius
  const radiusVariation = 1.0 + mechanics.eccentricity * Math.sin(particle.orbitAngle + mechanics.eccentricityPhase);
  const currentRadius = mechanics.radius * radiusVariation;
  const orbitalVelocity = calculateOrbitalVelocity(currentRadius, mechanics.gravitationalParam);

  return new THREE.Vector3(
    tangentX * orbitalVelocity * particle.orbitalSpeed,
    0,
    tangentZ * orbitalVelocity * particle.orbitalSpeed
  );
}

/**
 * Check if particle should transition from orbital to landing phase
 */
export function shouldTransitionToLanding(
  particle: HybridParticle,
  currentTime: number,
  orbitDuration: number
): boolean {
  // Simple lifetime-based approach: land after N seconds in orbit
  const orbitPhaseStartTime = particle.phaseStartTime;
  const timeInOrbit = currentTime - orbitPhaseStartTime;

  return timeInOrbit >= orbitDuration;
}

/**
 * Calculate centripetal acceleration toward orbit center
 *
 * This is what keeps particles in orbit
 * a_c = v² / r = ω² * r
 */
export function calculateCentripetalAcceleration(
  particle: HybridParticle,
  mechanics: OrbitalMechanicsState
): THREE.Vector3 {
  const toCenter = mechanics.center.clone().sub(particle.position).normalize();
  const a_c = (mechanics.orbitalVelocity * mechanics.orbitalVelocity) / mechanics.currentRadius;
  return toCenter.multiplyScalar(a_c);
}

/**
 * Calculate effective orbital parameters including variations
 */
export interface OrbitalSnapshot {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  angle: number;
  radius: number;
  speed: number;
  acceleration: THREE.Vector3;
}

export function captureOrbitalSnapshot(
  particle: HybridParticle,
  mechanics: OrbitalMechanicsState,
  time: number
): OrbitalSnapshot {
  return {
    position: calculateOrbitalPosition(particle, mechanics, time),
    velocity: calculateOrbitalVelocityVector(particle, mechanics),
    angle: particle.orbitAngle,
    radius: mechanics.currentRadius,
    speed: mechanics.orbitalVelocity * particle.orbitalSpeed,
    acceleration: calculateCentripetalAcceleration(particle, mechanics),
  };
}

/**
 * Initialize orbital parameters from gate configuration
 */
export function initializeOrbitalParams(
  orbitalCenter: THREE.Vector3,
  orbitalRadius: number,
  orbitalAltitude: number
): OrbitalParams {
  return {
    center: orbitalCenter,
    radius: orbitalRadius,
    altitude: orbitalAltitude,
    initialAngle: Math.random() * Math.PI * 2, // Random initial angle
    speed: 0.5 + Math.random() * 0.5, // 0.5-1.0 speed multiplier
    phase: Math.random() * Math.PI * 2, // Random phase offset
    noiseOffset: Math.random(), // Random noise offset for uniqueness
  };
}

/**
 * Calculate the orbital period (time for one full orbit)
 *
 * Period T = 2π * r / v = 2π / ω
 */
export function calculateOrbitalPeriod(
  radius: number,
  orbitalVelocity: number
): number {
  if (orbitalVelocity === 0) return Infinity;
  return (2 * Math.PI * radius) / orbitalVelocity;
}

/**
 * Get orbital phase as a percentage (0-1) representing progress through one orbit
 */
export function getOrbitalPhase(particle: HybridParticle): number {
  const normalizedAngle = ((particle.orbitAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return normalizedAngle / (Math.PI * 2);
}
