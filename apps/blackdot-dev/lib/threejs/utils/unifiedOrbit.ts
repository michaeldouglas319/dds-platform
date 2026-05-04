/**
 * Unified Orbital Function
 * 
 * Reusable orbital calculation function that can be used by:
 * - Runway particles (mergingIn, orbiting states)
 * - Scalable orbiting particles (background particle system)
 * 
 * Provides consistent orbital mechanics across all particle systems.
 */

import * as THREE from 'three';
import type { OrbitalParams } from './orbitalPaths';
import { getOrbitPosition, updateOrbitalAngle } from './orbitalPaths';

export interface UnifiedOrbitState {
  angle: number;
  phase: number;
  speed: number;
  radius: number;
  height: number;
  center: THREE.Vector3;
}

export interface UnifiedOrbitConfig {
  /** Base orbital speed multiplier */
  orbitalSpeed?: number;
  /** Time for orbital calculations */
  time: number;
  /** Delta time for updates */
  delta?: number;
}

/**
 * Calculate orbital position using unified orbital mechanics
 * Works with both OrbitalParams (runway) and simple orbit state (scalable particles)
 */
export function calculateUnifiedOrbitPosition(
  state: UnifiedOrbitState,
  config: UnifiedOrbitConfig
): THREE.Vector3 {
  const { angle, phase, speed, radius, height, center } = state;
  const { orbitalSpeed = 1.0, time } = config;

  // Smooth radius variation (elliptical variation)
  // Use different frequency multipliers to prevent phase alignment
  const radiusVariation = 1.0 + Math.sin(time * 0.3 + phase * 1.7) * 0.1;
  const effectiveRadius = radius * radiusVariation;

  // Smooth speed variation (acceleration/deceleration)
  // Use different frequency multipliers to prevent phase alignment
  const speedVariation = 1.0 + Math.sin(time * 0.2 + phase * 1.3) * 0.15;
  const effectiveSpeed = speed * speedVariation * orbitalSpeed;

  // 3D orbital path with slight inclination
  // Use phase directly for inclination to maintain separation
  const inclination = Math.sin(phase) * 0.3;
  
  return new THREE.Vector3(
    center.x + Math.cos(angle) * effectiveRadius * Math.cos(inclination),
    height + Math.sin(angle) * effectiveRadius * Math.sin(inclination),
    center.z + Math.sin(angle) * effectiveRadius
  );
}

/**
 * Update orbital angle using unified mechanics
 */
export function updateUnifiedOrbitAngle(
  state: UnifiedOrbitState,
  config: UnifiedOrbitConfig
): number {
  const { angle, phase, speed } = state;
  const { orbitalSpeed = 1.0, time, delta = 0.016 } = config;

  // Smooth speed variation
  // Use phase multiplier to prevent alignment
  const speedVariation = 1.0 + Math.sin(time * 0.2 + phase * 1.3) * 0.15;
  const effectiveSpeed = speed * speedVariation * orbitalSpeed;
  
  return angle + effectiveSpeed * delta;
}

/**
 * Convert OrbitalParams (runway) to UnifiedOrbitState
 */
export function orbitalParamsToUnifiedState(
  params: OrbitalParams,
  currentAngle: number
): UnifiedOrbitState {
  return {
    angle: currentAngle,
    phase: params.phase,
    speed: params.speed,
    radius: params.radius,
    height: params.altitude,
    center: params.center,
  };
}

/**
 * Create unified orbit state from simple parameters (scalable particles)
 */
export function createUnifiedOrbitState(
  center: THREE.Vector3,
  radius: number,
  height: number,
  angle: number,
  phase: number,
  speed: number
): UnifiedOrbitState {
  return {
    angle,
    phase,
    speed,
    radius,
    height,
    center,
  };
}

/**
 * Unified orbit update function - updates both angle and position
 * Returns new position and updated angle
 */
export function updateUnifiedOrbit(
  state: UnifiedOrbitState,
  config: UnifiedOrbitConfig
): { position: THREE.Vector3; newAngle: number } {
  const newAngle = updateUnifiedOrbitAngle(state, config);
  const updatedState = { ...state, angle: newAngle };
  const position = calculateUnifiedOrbitPosition(updatedState, config);
  
  return { position, newAngle };
}

/**
 * Legacy compatibility: Use OrbitalParams with unified function
 */
export function getOrbitPositionUnified(
  angle: number,
  params: OrbitalParams,
  time: number = 0,
  orbitalSpeed: number = 1.0
): THREE.Vector3 {
  const state = orbitalParamsToUnifiedState(params, angle);
  return calculateUnifiedOrbitPosition(state, { orbitalSpeed, time });
}

/**
 * Legacy compatibility: Update angle with unified function
 */
export function updateOrbitalAngleUnified(
  currentAngle: number,
  params: OrbitalParams,
  delta: number,
  time: number,
  orbitalSpeed: number = 1.0
): number {
  const state = orbitalParamsToUnifiedState(params, currentAngle);
  return updateUnifiedOrbitAngle(state, { orbitalSpeed, time, delta });
}
