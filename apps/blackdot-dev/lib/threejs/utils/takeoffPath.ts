import * as THREE from 'three';
import type { Path, PathSegment, Waypoint } from './pathSystem';

/**
 * Takeoff path configuration
 */
export interface TakeoffPathConfig {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  acceleration: number;
  liftSpeed: number;
  maxHeight: number;
  curveIntensity?: number; // 0-1, how curved the path is
}

/**
 * Generate a takeoff path from configuration
 */
export function createTakeoffPath(config: TakeoffPathConfig): Path {
  const { startPosition, endPosition, acceleration, liftSpeed, maxHeight, curveIntensity = 0.3 } = config;

  // Create waypoints for takeoff path
  const start: Waypoint = {
    id: 'takeoff-start',
    position: startPosition,
  };

  // Midpoint for curve (higher altitude)
  const midHeight = Math.max(startPosition[1], endPosition[1]) + (maxHeight - Math.max(startPosition[1], endPosition[1])) * curveIntensity;
  const midX = (startPosition[0] + endPosition[0]) / 2;
  const midZ = (startPosition[2] + endPosition[2]) / 2;

  const mid: Waypoint = {
    id: 'takeoff-mid',
    position: [midX, midHeight, midZ],
  };

  const end: Waypoint = {
    id: 'takeoff-end',
    position: endPosition,
  };

  // Create bezier curve segment for smooth takeoff
  const control1: Waypoint = {
    id: 'takeoff-control1',
    position: [
      startPosition[0] + (midX - startPosition[0]) * 0.5,
      startPosition[1] + (midHeight - startPosition[1]) * 0.3,
      startPosition[2] + (midZ - startPosition[2]) * 0.5,
    ],
  };

  const control2: Waypoint = {
    id: 'takeoff-control2',
    position: [
      midX + (endPosition[0] - midX) * 0.5,
      midHeight + (endPosition[1] - midHeight) * 0.3,
      midZ + (endPosition[2] - midZ) * 0.5,
    ],
  };

  const segment: PathSegment = {
    type: 'bezier',
    waypoints: [start, control1, control2, end],
    duration: Math.sqrt(
      Math.pow(endPosition[0] - startPosition[0], 2) +
      Math.pow(endPosition[1] - startPosition[1], 2) +
      Math.pow(endPosition[2] - startPosition[2], 2)
    ) / liftSpeed,
  };

  return {
    id: 'takeoff-path',
    segments: [segment],
    loop: false,
  };
}

/**
 * Calculate takeoff position using physics-based approach
 */
export function calculateTakeoffPosition(
  startPos: THREE.Vector3,
  velocity: THREE.Vector3,
  acceleration: number,
  liftSpeed: number,
  delta: number
): { position: THREE.Vector3; velocity: THREE.Vector3 } {
  // Update velocity
  const newVelocity = velocity.clone();
  newVelocity.y += acceleration * delta;
  newVelocity.z += liftSpeed * delta;

  // Update position
  const newPosition = startPos.clone();
  newPosition.add(newVelocity.clone().multiplyScalar(delta));

  return {
    position: newPosition,
    velocity: newVelocity,
  };
}
