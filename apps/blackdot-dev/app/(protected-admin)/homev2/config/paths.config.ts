import type { Origin, Path } from '@/lib/threejs/utils/pathSystem';
import { createWaypointPath } from '@/lib/threejs/utils/waypointPath';
import { createTakeoffPath } from '@/lib/threejs/utils/takeoffPath';
import { createOrbitPath } from '@/lib/threejs/utils/orbitPath';
import { RUNWAY_CONFIG } from './runway.config';

/**
 * Abstract path configuration for runway particle system
 * This demonstrates how to use the abstract path system
 */

/**
 * Origin points (spawn locations)
 */
export const ORIGINS: Origin[] = RUNWAY_CONFIG.gates.map(gate => ({
  id: gate.id,
  position: gate.position as [number, number, number],
  spawnRadius: 0.5, // Small random offset around gate
}));

/**
 * Taxi waypoint path
 */
export const TAXI_PATH: Path = createWaypointPath(
  RUNWAY_CONFIG.taxiWaypoints.map(wp => ({
    id: wp.id,
    position: wp.position as [number, number, number],
  })),
  RUNWAY_CONFIG.timing.taxiSpeed
);

/**
 * Create takeoff path from runway start to orbit entry
 */
export function createTakeoffPathForParticle(
  startPos: [number, number, number],
  targetAltitude: number
): Path {
  return createTakeoffPath({
    startPosition: startPos,
    endPosition: [startPos[0], targetAltitude, startPos[2] + 50], // Forward and up
    acceleration: RUNWAY_CONFIG.takeoff.acceleration,
    liftSpeed: RUNWAY_CONFIG.takeoff.liftSpeed,
    maxHeight: RUNWAY_CONFIG.takeoff.maxHeight,
    curveIntensity: 0.3,
  });
}

/**
 * Create orbit path from orbital params
 */
export function createOrbitPathForParticle(
  center: [number, number, number],
  radius: number,
  altitude: number,
  speed: number
): Path {
  return createOrbitPath({
    center,
    radius,
    speed,
    altitude,
    inclination: 0.1, // Slight inclination for visual interest
  });
}

/**
 * Path registry - maps path IDs to path generators
 */
export const PATH_REGISTRY = {
  taxi: () => TAXI_PATH,
  takeoff: (startPos: [number, number, number], targetAltitude: number) =>
    createTakeoffPathForParticle(startPos, targetAltitude),
  orbit: (center: [number, number, number], radius: number, altitude: number, speed: number) =>
    createOrbitPathForParticle(center, radius, altitude, speed),
} as const;
