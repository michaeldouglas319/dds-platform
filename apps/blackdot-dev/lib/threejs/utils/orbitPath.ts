import * as THREE from 'three';
import type { Path, PathSegment, Waypoint } from './pathSystem';
import type { OrbitalParams } from './orbitalPaths';

/**
 * Orbit path configuration
 */
export interface OrbitPathConfig {
  center: [number, number, number];
  radius: number;
  speed: number;
  altitude: number;
  inclination?: number; // Angle of orbit plane (0 = horizontal)
  phase?: number; // Starting phase offset
}

/**
 * Generate an orbit path from configuration
 */
export function createOrbitPath(config: OrbitPathConfig): Path {
  const { center, radius, altitude, inclination = 0 } = config;

  // Create waypoints for circular orbit
  const numPoints = 8; // Number of points to define the circle
  const waypoints: Waypoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const x = center[0] + Math.cos(angle) * radius;
    const y = center[1] + altitude + Math.sin(angle) * radius * Math.sin(inclination);
    const z = center[2] + Math.sin(angle) * radius * Math.cos(inclination);

    waypoints.push({
      id: `orbit-point-${i}`,
      position: [x, y, z],
    });
  }

  // Create arc segment (circular path)
  const segment: PathSegment = {
    type: 'arc',
    waypoints: waypoints,
    duration: (Math.PI * 2 * radius) / config.speed, // Time for one full orbit
  };

  return {
    id: 'orbit-path',
    segments: [segment],
    loop: true,
  };
}

/**
 * Convert OrbitalParams to OrbitPathConfig
 */
export function orbitalParamsToPathConfig(params: OrbitalParams): OrbitPathConfig {
  return {
    center: [params.center.x, params.center.y, params.center.z],
    radius: params.radius,
    speed: params.speed,
    altitude: params.altitude,
    phase: params.initialAngle,
  };
}

/**
 * Generate orbit path from orbital params
 */
export function createOrbitPathFromParams(params: OrbitalParams): Path {
  return createOrbitPath(orbitalParamsToPathConfig(params));
}
