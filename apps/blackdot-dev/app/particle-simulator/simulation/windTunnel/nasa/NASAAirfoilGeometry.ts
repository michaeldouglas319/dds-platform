/**
 * NASA BGA Airfoil Geometry
 * 
 * Generates NACA 4-digit airfoil surface coordinates for visualization and SDF
 * Based on NACA 4-digit series formula
 */

import { Vector3 } from 'three';
import {
  AirfoilParameters,
  AirfoilGeometry,
  JoukowskiGeometry,
} from './NASATypes';

export class NASAAirfoilGeometry {
  /**
   * Generate NACA 4-digit airfoil coordinates
   * 
   * Thickness distribution:
   *   y_t = 5t[0.2969√x - 0.1260x - 0.3516x² + 0.2843x³ - 0.1015x⁴]
   * 
   * Camber line:
   *   For x < p: y_c = (m/p²)(2px - x²)
   *   For x ≥ p: y_c = (m/(1-p)²)((1-2p) + 2px - x²)
   * 
   * where:
   *   - t = thickness ratio (e.g., 0.12 for NACA 2412)
   *   - m = maximum camber (e.g., 0.02 for NACA 2412)
   *   - p = position of maximum camber (0.4 for NACA standard)
   *   - x = position along chord (0 to 1)
   */
  static generateNACA4Digit(
    camber: number, // 0-20 (percentage)
    thickness: number, // 5-20 (percentage)
    pointCount: number = 100
  ): { upper: Vector3[]; lower: Vector3[] } {
    const m = camber / 100; // Max camber as decimal
    const t = thickness / 100; // Thickness as decimal
    const p = 0.4; // Position of max camber (NACA standard)

    const upper: Vector3[] = [];
    const lower: Vector3[] = [];

    for (let i = 0; i <= pointCount; i++) {
      const x = i / pointCount;

      // Thickness distribution
      const yt =
        5 *
        t *
        (0.2969 * Math.sqrt(x) -
          0.1260 * x -
          0.3516 * x * x +
          0.2843 * x * x * x -
          0.1015 * x * x * x * x);

      // Camber line
      let yc: number, dyc_dx: number;
      if (x < p) {
        yc = (m / (p * p)) * (2 * p * x - x * x);
        dyc_dx = (2 * m / (p * p)) * (p - x);
      } else {
        yc = (m / ((1 - p) * (1 - p))) * ((1 - 2 * p) + 2 * p * x - x * x);
        dyc_dx = (2 * m / ((1 - p) * (1 - p))) * (p - x);
      }

      // Angle of camber line
      const theta = Math.atan(dyc_dx);

      // Upper and lower surface
      const xu = x - yt * Math.sin(theta);
      const yu = yc + yt * Math.cos(theta);
      const xl = x + yt * Math.sin(theta);
      const yl = yc - yt * Math.cos(theta);

      upper.push(new Vector3(xu, yu, 0));
      lower.push(new Vector3(xl, yl, 0));
    }

    return { upper, lower };
  }

  /**
   * Create complete AirfoilGeometry for use in renderer
   */
  static create(
    params: AirfoilParameters,
    joukowski: JoukowskiGeometry,
    center: Vector3 = new Vector3(0, 0, 0)
  ): AirfoilGeometry {
    const { upper, lower } = this.generateNACA4Digit(
      params.camber,
      params.thickness,
      100
    );

    // Scale by chord and translate to center
    const angleRad = (params.angle * Math.PI) / 180;

    const scaleAndRotate = (points: Vector3[]) => {
      return points.map((p) => {
        const scaled = p.clone().multiplyScalar(params.chord);
        // Rotate by angle of attack
        const rotated = new Vector3(
          scaled.x * Math.cos(angleRad) - scaled.y * Math.sin(angleRad),
          scaled.x * Math.sin(angleRad) + scaled.y * Math.cos(angleRad),
          0
        );
        return rotated.add(center);
      });
    };

    return {
      chord: params.chord,
      center,
      angleOfAttack: angleRad,
      upperSurfacePoints: scaleAndRotate(upper),
      lowerSurfacePoints: scaleAndRotate(lower),
      joukowski,
    };
  }
}


