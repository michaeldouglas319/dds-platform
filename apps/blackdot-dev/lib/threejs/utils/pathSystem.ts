import * as THREE from 'three';

/**
 * Abstract path system for particle movement
 * Supports waypoints, curves, and parametric paths
 */

export interface Waypoint {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  speed?: number; // Optional speed multiplier at this waypoint
}

export interface PathSegment {
  type: 'linear' | 'bezier' | 'spline' | 'arc';
  waypoints: Waypoint[];
  duration?: number; // Optional duration for this segment
  speed?: number; // Optional speed for this segment
}

export interface Path {
  id: string;
  segments: PathSegment[];
  loop?: boolean; // Whether path loops back to start
}

/**
 * Origin/Starting point configuration
 */
export interface Origin {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  spawnRadius?: number; // Random spawn radius around origin
}

/**
 * Calculate position along a linear path segment
 */
export function getLinearPathPosition(
  start: THREE.Vector3,
  end: THREE.Vector3,
  t: number // 0 to 1
): THREE.Vector3 {
  return start.clone().lerp(end, t);
}

/**
 * Calculate position along a bezier curve
 */
export function getBezierPathPosition(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number
): THREE.Vector3 {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const point = new THREE.Vector3();
  point.x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  point.y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
  point.z = uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z;

  return point;
}

/**
 * Calculate position along an arc path
 */
export function getArcPathPosition(
  center: THREE.Vector3,
  radius: number,
  startAngle: number,
  endAngle: number,
  t: number,
  normal?: THREE.Vector3 // Normal vector for arc plane (defaults to Y-up)
): THREE.Vector3 {
  const angle = startAngle + (endAngle - startAngle) * t;
  const up = normal || new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3(1, 0, 0);
  const forward = new THREE.Vector3(0, 0, 1);

  // Create rotation matrix around normal
  const rotation = new THREE.Matrix4().makeRotationAxis(up, angle);
  const direction = right.clone().applyMatrix4(rotation);

  return center.clone().add(direction.multiplyScalar(radius));
}

/**
 * Get position along a path segment
 */
export function getPathSegmentPosition(
  segment: PathSegment,
  t: number
): THREE.Vector3 {
  if (segment.waypoints.length < 2) {
    const wp = segment.waypoints[0];
    return new THREE.Vector3(...wp.position);
  }

  switch (segment.type) {
    case 'linear': {
      // Handle multi-waypoint linear paths (e.g., gate → taxi-1 → taxi-2 → runway)
      if (segment.waypoints.length === 2) {
        // Simple two-point interpolation
        const start = new THREE.Vector3(...segment.waypoints[0].position);
        const end = new THREE.Vector3(...segment.waypoints[1].position);
        return getLinearPathPosition(start, end, t);
      } else {
        // Multi-waypoint: traverse sequentially
        const numSegments = segment.waypoints.length - 1;
        const segmentIndex = Math.min(Math.floor(t * numSegments), numSegments - 1);
        const segmentT = (t * numSegments) - segmentIndex;

        const start = new THREE.Vector3(...segment.waypoints[segmentIndex].position);
        const end = new THREE.Vector3(...segment.waypoints[segmentIndex + 1].position);
        return getLinearPathPosition(start, end, segmentT);
      }
    }

    case 'bezier': {
      if (segment.waypoints.length === 4) {
        const p0 = new THREE.Vector3(...segment.waypoints[0].position);
        const p1 = new THREE.Vector3(...segment.waypoints[1].position);
        const p2 = new THREE.Vector3(...segment.waypoints[2].position);
        const p3 = new THREE.Vector3(...segment.waypoints[3].position);
        return getBezierPathPosition(p0, p1, p2, p3, t);
      }
      // Fallback to linear if not 4 points
      const start = new THREE.Vector3(...segment.waypoints[0].position);
      const end = new THREE.Vector3(...segment.waypoints[segment.waypoints.length - 1].position);
      return getLinearPathPosition(start, end, t);
    }

    case 'arc': {
      if (segment.waypoints.length >= 2) {
        const center = new THREE.Vector3(...segment.waypoints[0].position);
        const radiusPoint = new THREE.Vector3(...segment.waypoints[1].position);
        const radius = center.distanceTo(radiusPoint);
        return getArcPathPosition(center, radius, 0, Math.PI * 2, t);
      }
      return new THREE.Vector3(...segment.waypoints[0].position);
    }

    default:
      // Linear fallback
      const start = new THREE.Vector3(...segment.waypoints[0].position);
      const end = new THREE.Vector3(...segment.waypoints[segment.waypoints.length - 1].position);
      return getLinearPathPosition(start, end, t);
  }
}

/**
 * Path evaluator - calculates position along a path given progress
 */
export class PathEvaluator {
  private path: Path;
  private totalDuration: number;

  constructor(path: Path) {
    this.path = path;
    this.totalDuration = this.calculateTotalDuration();
  }

  private calculateTotalDuration(): number {
    return this.path.segments.reduce((total, segment) => {
      return total + (segment.duration || 1.0);
    }, 0);
  }

  /**
   * Get position along path given overall progress (0 to 1)
   */
  getPosition(progress: number): THREE.Vector3 {
    if (this.path.segments.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    let accumulatedDuration = 0;
    let segmentProgress = 0;
    let currentSegment: PathSegment | null = null;

    // Find which segment we're in
    for (const segment of this.path.segments) {
      const segmentDuration = segment.duration || 1.0;
      const segmentStart = accumulatedDuration / this.totalDuration;
      const segmentEnd = (accumulatedDuration + segmentDuration) / this.totalDuration;

      if (progress >= segmentStart && progress <= segmentEnd) {
        currentSegment = segment;
        segmentProgress = (progress - segmentStart) / (segmentEnd - segmentStart);
        break;
      }

      accumulatedDuration += segmentDuration;
    }

    // If we've passed all segments, use the last one
    if (!currentSegment) {
      currentSegment = this.path.segments[this.path.segments.length - 1];
      segmentProgress = 1.0;
    }

    return getPathSegmentPosition(currentSegment, segmentProgress);
  }

  /**
   * Get direction/tangent at current position
   */
  getDirection(progress: number, delta: number = 0.01): THREE.Vector3 {
    const pos1 = this.getPosition(progress);
    const pos2 = this.getPosition(Math.min(1.0, progress + delta));
    return pos2.clone().sub(pos1).normalize();
  }

  /**
   * Get orientation at current position (for particle rotation)
   */
  getOrientation(progress: number, delta: number = 0.01): {
    position: THREE.Vector3;
    direction: THREE.Vector3;
    up: THREE.Vector3;
  } {
    const position = this.getPosition(progress);
    const direction = this.getDirection(progress, delta);
    
    // Calculate up vector (perpendicular to direction)
    const defaultUp = new THREE.Vector3(0, 1, 0);
    const right = direction.clone().cross(defaultUp).normalize();
    const up = right.clone().cross(direction).normalize();
    
    return {
      position,
      direction,
      up,
    };
  }
}
