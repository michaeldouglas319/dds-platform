'use client';

import * as THREE from 'three';
import { RUNWAY_CONFIG } from '../config/runway.config';

/**
 * Orientation System
 *
 * Manages particle and model orientations to ensure:
 * - Particles always face in their direction of travel
 * - Models are correctly aligned with their native orientation
 * - System is config-driven and scalable
 */

/**
 * Converts Euler angles in DEGREES to a quaternion
 * @param pitch Rotation around X-axis (degrees)
 * @param yaw Rotation around Y-axis (degrees)
 * @param roll Rotation around Z-axis (degrees)
 * @returns THREE.Quaternion
 */
export function eulerDegreesToQuaternion(
  pitch: number,
  yaw: number,
  roll: number
): THREE.Quaternion {
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(pitch),
    THREE.MathUtils.degToRad(yaw),
    THREE.MathUtils.degToRad(roll),
    'XYZ'
  );
  return new THREE.Quaternion().setFromEuler(euler);
}

/**
 * Calculates orientation from a velocity or direction vector
 * @param direction Direction vector (should be normalized)
 * @param upVector Up vector for the coordinate system (default: +Y)
 * @returns THREE.Quaternion that points the model forward along the direction
 */
export function quaternionFromDirection(
  direction: THREE.Vector3,
  upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
  const quaternion = new THREE.Quaternion();

  // Use the model's forward axis from config
  const modelForward = new THREE.Vector3(...RUNWAY_CONFIG.orientation.forwardAxis.modelForward);

  // Create quaternion that rotates modelForward to point along direction
  quaternion.setFromUnitVectors(modelForward, direction.clone().normalize());

  return quaternion;
}

/**
 * Composes two quaternions: particle orientation + model native orientation
 * This ensures the model faces correctly relative to particle travel direction
 *
 * @param particleOrientation Particle's direction of travel quaternion
 * @param modelNativeOrientation Model's native orientation offset quaternion
 * @returns Composed quaternion for final display
 */
export function composeOrientations(
  particleOrientation: THREE.Quaternion,
  modelNativeOrientation: THREE.Quaternion
): THREE.Quaternion {
  // Apply model native orientation AFTER particle orientation
  // This ensures the model visual aligns with travel direction
  const composed = particleOrientation.clone();
  composed.multiply(modelNativeOrientation);
  return composed;
}

/**
 * Gets the model native orientation quaternion from config
 * @param modelId Model identifier from config
 * @returns THREE.Quaternion of model native orientation
 */
export function getModelNativeOrientation(modelId: number): THREE.Quaternion {
  const modelConfig = (RUNWAY_CONFIG.models.planes as any)[modelId];
  if (!modelConfig) {
    console.warn(`[OrientationSystem] Model ${modelId} not found in config`);
    return new THREE.Quaternion(); // Identity quaternion
  }

  const [pitch, yaw, roll] = modelConfig.nativeOrientation;
  return eulerDegreesToQuaternion(pitch, yaw, roll);
}

/**
 * Gets phase-based particle orientation from config
 * @param phase Flight phase ('taxi', 'takeoff', 'orbit', 'landing')
 * @param direction Optional direction vector for dynamic phases like orbit
 * @returns THREE.Quaternion for the particle's travel direction
 */
export function getPhaseOrientation(
  phase: 'taxi' | 'takeoff' | 'orbit' | 'landing',
  direction?: THREE.Vector3
): THREE.Quaternion {
  const orientations = RUNWAY_CONFIG.orientation.particleOrientations;

  switch (phase) {
    case 'orbit': {
      // For orbit, use provided direction or calculate from position
      if (direction) {
        return quaternionFromDirection(direction);
      }
      // Fallback: face forward
      return eulerDegreesToQuaternion(0, 0, 0);
    }

    case 'taxi':
    case 'takeoff': {
      const [pitch, yaw, roll] = orientations.taxi;
      return eulerDegreesToQuaternion(pitch, yaw, roll);
    }

    case 'landing': {
      const [pitch, yaw, roll] = orientations.landing;
      return eulerDegreesToQuaternion(pitch, yaw, roll);
    }

    default:
      return new THREE.Quaternion(); // Identity
  }
}

/**
 * Complete orientation calculation for a particle
 * Combines particle travel direction with model native orientation
 *
 * @param phase Flight phase
 * @param modelId Model to display
 * @param direction Optional direction for dynamic phases
 * @returns Final composite quaternion for rendering
 */
export function calculateParticleOrientation(
  phase: 'taxi' | 'takeoff' | 'orbit' | 'landing',
  modelId: number,
  direction?: THREE.Vector3
): THREE.Quaternion {
  const particleOrientation = getPhaseOrientation(phase, direction);
  const modelNativeOrientation = getModelNativeOrientation(modelId);
  return composeOrientations(particleOrientation, modelNativeOrientation);
}

/**
 * Calculates orientation from a path direction vector
 * This ensures particles always face forward along their path
 *
 * @param pathDirection Direction particle is traveling (should be normalized)
 * @param modelId Model to display
 * @returns Final composite quaternion
 */
export function calculatePathOrientation(
  pathDirection: THREE.Vector3,
  modelId: number
): THREE.Quaternion {
  // Calculate quaternion that points along the path direction
  const particleOrientation = quaternionFromDirection(pathDirection);
  const modelNativeOrientation = getModelNativeOrientation(modelId);
  return composeOrientations(particleOrientation, modelNativeOrientation);
}

/**
 * Converts a quaternion to Euler angles (degrees) for debugging/inspection
 * @param quaternion Input quaternion
 * @returns [pitch, yaw, roll] in degrees
 */
export function quaternionToEulerDegrees(quaternion: THREE.Quaternion): [number, number, number] {
  const euler = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');
  return [
    THREE.MathUtils.radToDeg(euler.x),
    THREE.MathUtils.radToDeg(euler.y),
    THREE.MathUtils.radToDeg(euler.z),
  ];
}

/**
 * Validates orientation configuration
 * Checks that all models have valid native orientations
 */
export function validateOrientationConfig(): boolean {
  const models = RUNWAY_CONFIG.models.planes as any;

  for (const [modelId, config] of Object.entries(models)) {
    const cfg = config as any;
    if (!cfg.nativeOrientation || cfg.nativeOrientation.length !== 3) {
      console.error(
        `[OrientationSystem] Model ${modelId} has invalid nativeOrientation:`,
        cfg.nativeOrientation
      );
      return false;
    }
  }

  return true;
}

/**
 * Logging helper for debugging orientation issues
 * @param label Debug label
 * @param phase Flight phase
 * @param modelId Model ID
 * @param quaternion Final quaternion
 */
export function logOrientationDebug(
  label: string,
  phase: string,
  modelId: number,
  quaternion: THREE.Quaternion
): void {
  if (process.env.NODE_ENV !== 'development') return;

  const euler = quaternionToEulerDegrees(quaternion);
  console.log(
    `[OrientationSystem] ${label} - Phase: ${phase}, Model: ${modelId}, Euler: [${euler[0].toFixed(1)}°, ${euler[1].toFixed(1)}°, ${euler[2].toFixed(1)}°]`
  );
}
