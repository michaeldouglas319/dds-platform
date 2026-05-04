import * as THREE from 'three';
import { VelocityField } from './VelocityField';

/**
 * ObstacleSDF - Signed Distance Fields for obstacle representation
 * Provides efficient geometry-based boundary conditions for flow fields
 */
export class ObstacleSDF {
  /**
   * Cylinder SDF (infinite along z-axis)
   * Useful for wind tunnel cross-section studies
   */
  static cylinder(
    center: THREE.Vector2,
    radius: number
  ): (pos: THREE.Vector3) => number {
    return (pos: THREE.Vector3) => {
      const dx = pos.x - center.x;
      const dy = pos.y - center.y;
      return Math.sqrt(dx * dx + dy * dy) - radius;
    };
  }

  /**
   * Sphere SDF
   */
  static sphere(center: THREE.Vector3, radius: number): (pos: THREE.Vector3) => number {
    return (pos: THREE.Vector3) => {
      return pos.distanceTo(center) - radius;
    };
  }

  /**
   * Box SDF (axis-aligned)
   */
  static box(
    center: THREE.Vector3,
    halfExtents: THREE.Vector3
  ): (pos: THREE.Vector3) => number {
    return (pos: THREE.Vector3) => {
      const diff = pos.clone().sub(center);
      const q = new THREE.Vector3(Math.abs(diff.x), Math.abs(diff.y), Math.abs(diff.z));
      const outside = q.clone().sub(halfExtents);
      const maxComponent = Math.max(outside.x, outside.y, outside.z);
      const insideDist = Math.min(maxComponent, 0);

      return (
        new THREE.Vector3(Math.max(outside.x, 0), Math.max(outside.y, 0), Math.max(outside.z, 0))
          .length() + insideDist
      );
    };
  }

  /**
   * Infinite plane SDF
   * Normal should be unit vector
   */
  static plane(
    point: THREE.Vector3,
    normal: THREE.Vector3
  ): (pos: THREE.Vector3) => number {
    const normalUnit = normal.clone().normalize();
    return (pos: THREE.Vector3) => {
      return pos.clone().sub(point).dot(normalUnit);
    };
  }

  /**
   * Union of two SDFs (take minimum distance)
   * Represents combined obstacles
   */
  static union(
    sdf1: (pos: THREE.Vector3) => number,
    sdf2: (pos: THREE.Vector3) => number
  ): (pos: THREE.Vector3) => number {
    return (pos: THREE.Vector3) => {
      return Math.min(sdf1(pos), sdf2(pos));
    };
  }

  /**
   * Intersection of two SDFs
   * Represents overlapping regions
   */
  static intersection(
    sdf1: (pos: THREE.Vector3) => number,
    sdf2: (pos: THREE.Vector3) => number
  ): (pos: THREE.Vector3) => number {
    return (pos: THREE.Vector3) => {
      return Math.max(sdf1(pos), sdf2(pos));
    };
  }

  /**
   * Difference of two SDFs
   * Represents one obstacle subtracted from another
   */
  static difference(
    sdf1: (pos: THREE.Vector3) => number,
    sdf2: (pos: THREE.Vector3) => number
  ): (pos: THREE.Vector3) => number {
    return (pos: THREE.Vector3) => {
      return Math.max(sdf1(pos), -sdf2(pos));
    };
  }

  /**
   * Apply obstacle boundary condition to velocity field
   * Sets velocity to zero inside obstacle with smooth falloff at boundary
   */
  static applyObstacleToField(
    field: VelocityField,
    sdf: (pos: THREE.Vector3) => number,
    falloffDistance: number = 2.0
  ): void {
    field.applyObstacle(sdf, falloffDistance);
  }

  /**
   * NACA airfoil SDF (simplified approximation)
   * Uses analytical NACA 4-digit series equations
   * Chord is assumed to be along x-axis from -chord/2 to +chord/2
   */
  static naacAirfoil(
    chord: number,
    maxCamber: number,
    maxThickness: number,
    angleOfAttack: number = 0
  ): (pos: THREE.Vector3) => number {
    const angleRad = (angleOfAttack * Math.PI) / 180;
    const cos_a = Math.cos(angleRad);
    const sin_a = Math.sin(angleRad);

    // NACA parameters (as percentages of chord)
    const m = maxCamber / 100;
    const p = 0.4; // Position of maximum camber (fixed for simplicity)
    const t = maxThickness / 100;

    return (pos: THREE.Vector3) => {
      // Rotate point by angle of attack
      const rotX = pos.x * cos_a + pos.y * sin_a;
      const rotY = -pos.x * sin_a + pos.y * cos_a;

      // Normalize to chord coordinates [-0.5, 0.5]
      const x = rotX / chord + 0.5;

      if (x < 0 || x > 1) {
        return Math.sqrt(rotX * rotX + rotY * rotY) + 1.0; // Far outside
      }

      // NACA thickness distribution
      const thickness =
        t *
        5 *
        (0.2969 * Math.sqrt(x) -
          0.1260 * x -
          0.3516 * x * x +
          0.2843 * x * x * x -
          0.1015 * x * x * x * x);

      // Camber line
      let camber = 0;
      let dCamber = 0;

      if (x <= p) {
        camber = (m / (p * p)) * (2 * p * x - x * x);
        dCamber = (2 * m / (p * p)) * (p - x);
      } else {
        camber = (m / ((1 - p) * (1 - p))) * ((1 - 2 * p) + 2 * p * x - x * x);
        dCamber = (2 * m / ((1 - p) * (1 - p))) * (p - x);
      }

      // Signed distance (simplified)
      const theta = Math.atan(dCamber);
      const relY = rotY / chord;

      // Distance from upper and lower surfaces
      const distUpper = relY - (camber + thickness);
      const distLower = relY - (camber - thickness);

      return Math.min(Math.abs(distUpper), Math.abs(distLower)) *
        (Math.min(distUpper, distLower) < 0 ? -1 : 1) * chord;
    };
  }
}
