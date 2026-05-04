import * as THREE from 'three';
import type { Path, PathSegment, Waypoint } from './pathSystem';

/**
 * Create a linear path from waypoints
 */
export function createWaypointPath(
  waypoints: Array<{ id: string; position: [number, number, number] }>,
  speed?: number
): Path {
  if (waypoints.length < 2) {
    throw new Error('Waypoint path requires at least 2 waypoints');
  }

  const pathWaypoints: Waypoint[] = waypoints.map(wp => ({
    id: wp.id,
    position: wp.position,
    speed,
  }));

  const segment: PathSegment = {
    type: 'linear',
    waypoints: pathWaypoints,
    speed,
  };

  return {
    id: 'waypoint-path',
    segments: [segment],
    loop: false,
  };
}

/**
 * Calculate distance along waypoint path
 */
export function getWaypointPathDistance(waypoints: Waypoint[]): number {
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = new THREE.Vector3(...waypoints[i].position);
    const p2 = new THREE.Vector3(...waypoints[i + 1].position);
    totalDistance += p1.distanceTo(p2);
  }
  return totalDistance;
}

/**
 * Get position along waypoint path given progress (0 to 1)
 */
export function getWaypointPathPosition(
  waypoints: Waypoint[],
  progress: number
): THREE.Vector3 {
  if (waypoints.length === 0) {
    return new THREE.Vector3(0, 0, 0);
  }

  if (waypoints.length === 1) {
    return new THREE.Vector3(...waypoints[0].position);
  }

  // Calculate total path length
  const totalDistance = getWaypointPathDistance(waypoints);
  const targetDistance = totalDistance * progress;

  // Find which segment we're in
  let accumulatedDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = new THREE.Vector3(...waypoints[i].position);
    const p2 = new THREE.Vector3(...waypoints[i + 1].position);
    const segmentDistance = p1.distanceTo(p2);

    if (accumulatedDistance + segmentDistance >= targetDistance) {
      // We're in this segment
      const segmentProgress = (targetDistance - accumulatedDistance) / segmentDistance;
      return p1.clone().lerp(p2, segmentProgress);
    }

    accumulatedDistance += segmentDistance;
  }

  // Return last waypoint if we've passed all segments
  return new THREE.Vector3(...waypoints[waypoints.length - 1].position);
}
