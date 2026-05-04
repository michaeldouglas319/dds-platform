/**
 * VelocityVisualization.ts - Velocity field visualization utilities
 *
 * Creates visual representations of velocity field:
 * - Velocity vectors (arrows showing direction and magnitude)
 * - Velocity heatmap (color-coded by speed)
 */

import * as THREE from 'three';
import { VelocityField } from '../simulation/windTunnel/VelocityField';

export interface VelocityVisualizationConfig {
  gridSpacing: number;           // Distance between visualization points (default 10)
  arrowScale: number;            // Scale factor for arrow length (default 5)
  arrowRadius: number;           // Radius of arrow shaft (default 0.3)
  minVelocityThreshold: number;  // Skip vectors below this speed (default 0.1)
  colorBySpeed: boolean;         // Color arrows by velocity magnitude (default true)
}

export class VelocityVisualization {
  /**
   * Create velocity vector field visualization
   * Shows arrows indicating velocity direction and magnitude at grid points
   *
   * @param field - Velocity field to visualize
   * @param config - Visualization configuration
   * @returns THREE.Group containing arrow geometries
   */
  static createVelocityVectors(
    field: VelocityField,
    config: Partial<VelocityVisualizationConfig> = {}
  ): THREE.Group {
    const fullConfig: VelocityVisualizationConfig = {
      gridSpacing: 10,
      arrowScale: 5,
      arrowRadius: 0.3,
      minVelocityThreshold: 0.1,
      colorBySpeed: true,
      ...config,
    };

    const group = new THREE.Group();
    const bounds = field.getBounds();

    let maxSpeed = 0;

    // First pass: find max speed for color normalization
    for (let x = bounds.min.x; x < bounds.max.x; x += fullConfig.gridSpacing) {
      for (let y = bounds.min.y; y < bounds.max.y; y += fullConfig.gridSpacing) {
        for (let z = bounds.min.z; z < bounds.max.z; z += fullConfig.gridSpacing) {
          const pos = new THREE.Vector3(x, y, z);
          const vel = field.sampleVelocity(pos);
          maxSpeed = Math.max(maxSpeed, vel.length());
        }
      }
    }

    if (maxSpeed < fullConfig.minVelocityThreshold) {
      maxSpeed = 1.0;
    }

    // Second pass: create arrow geometry for each velocity vector
    for (let x = bounds.min.x; x < bounds.max.x; x += fullConfig.gridSpacing) {
      for (let y = bounds.min.y; y < bounds.max.y; y += fullConfig.gridSpacing) {
        for (let z = bounds.min.z; z < bounds.max.z; z += fullConfig.gridSpacing) {
          const pos = new THREE.Vector3(x, y, z);
          const vel = field.sampleVelocity(pos);
          const speed = vel.length();

          // Skip negligible velocities
          if (speed < fullConfig.minVelocityThreshold) {
            continue;
          }

          // Calculate arrow properties
          const direction = vel.clone().normalize();
          const arrowLength = Math.min(
            speed * fullConfig.arrowScale,
            fullConfig.gridSpacing * 0.8
          );

          // Color by speed (blue = slow, red = fast)
          let color: THREE.Color;
          if (fullConfig.colorBySpeed) {
            const speedRatio = Math.min(speed / maxSpeed, 1.0);
            const hue = Math.max(0, 1 - speedRatio) * 0.67; // 0.67 rad ≈ 240° (blue)
            color = new THREE.Color().setHSL(hue, 1.0, 0.5);
          } else {
            color = new THREE.Color(0x4488ff); // Default blue
          }

          // Create arrow
          const arrow = this.createArrow(pos, direction, arrowLength, fullConfig.arrowRadius, color);
          group.add(arrow);
        }
      }
    }

    return group;
  }

  /**
   * Create a single arrow geometry
   * Arrow consists of shaft (cylinder) + head (cone)
   *
   * @param origin - Starting position of arrow
   * @param direction - Direction vector (should be normalized)
   * @param length - Length of arrow
   * @param radius - Radius of arrow shaft
   * @param color - Color of arrow
   * @returns THREE.Group containing the arrow geometry
   */
  private static createArrow(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    color: THREE.Color
  ): THREE.Group {
    const group = new THREE.Group();

    // Arrow shaft length (80% of total)
    const shaftLength = length * 0.8;
    const headLength = length * 0.2;

    // Shaft (cylinder)
    const shaftGeom = new THREE.CylinderGeometry(
      radius, // radiusTop
      radius, // radiusBottom
      shaftLength,
      8, // radialSegments
      1  // heightSegments
    );

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.6,
      emissive: color.clone().multiplyScalar(0.3),
      toneMapped: false,
    });

    const shaft = new THREE.Mesh(shaftGeom, material);

    // Position shaft at origin, pointing along direction
    shaft.position.copy(origin);
    shaft.position.addScaledVector(direction, shaftLength / 2);

    // Rotate shaft to point in direction
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(direction.dot(up)) > 0.99) {
      // Direction is parallel to up vector
      up.set(1, 0, 0);
    }
    shaft.quaternion.setFromUnitVectors(up, direction);

    group.add(shaft);

    // Arrow head (cone)
    const headGeom = new THREE.ConeGeometry(
      radius * 3, // radiusAtBase
      headLength,
      8, // radialSegments
      1  // heightSegments
    );

    const head = new THREE.Mesh(headGeom, material);

    // Position head at end of shaft
    head.position.copy(origin);
    head.position.addScaledVector(direction, length);

    // Rotate head to point along direction
    head.quaternion.copy(shaft.quaternion);

    group.add(head);

    return group;
  }

  /**
   * Create velocity heatmap texture
   * Color-codes velocity magnitude across 2D plane
   *
   * @param field - Velocity field
   * @param planeNormal - Normal vector for slicing plane (e.g., [0, 0, 1] for XY plane)
   * @param planePosition - Position along normal axis
   * @param resolution - Texture resolution (default 256x256)
   * @returns THREE.Texture with velocity heatmap
   */
  static createVelocityHeatmap(
    field: VelocityField,
    planeNormal: THREE.Vector3 = new THREE.Vector3(0, 0, 1),
    planePosition: number = 0,
    resolution: number = 256
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const imageData = ctx.createImageData(resolution, resolution);
    const data = imageData.data;

    const bounds = field.getBounds();

    // Calculate tangent vectors for the plane
    let tangent1 = new THREE.Vector3(1, 0, 0);
    let tangent2 = new THREE.Vector3(0, 1, 0);

    if (Math.abs(planeNormal.x) > 0.1) {
      tangent1 = new THREE.Vector3(0, 1, 0);
      tangent2 = planeNormal.clone().cross(tangent1).normalize();
    } else if (Math.abs(planeNormal.y) > 0.1) {
      tangent1 = new THREE.Vector3(1, 0, 0);
      tangent2 = planeNormal.clone().cross(tangent1).normalize();
    }

    let maxSpeed = 0;

    // Collect velocities and find max
    const velocities: number[] = [];

    for (let py = 0; py < resolution; py++) {
      for (let px = 0; px < resolution; px++) {
        // Map pixel to world coordinates on plane
        const u = (px / (resolution - 1)) * 2 - 1; // -1 to 1
        const v = (py / (resolution - 1)) * 2 - 1; // -1 to 1

        // Convert bounds object to Box3 for getSize/getCenter methods
        const boundsBox = bounds instanceof THREE.Box3 
          ? bounds 
          : new THREE.Box3().setFromPoints([bounds.min, bounds.max]);
        const boundsSize = boundsBox.getSize(new THREE.Vector3());
        const boundsCenter = boundsBox.getCenter(new THREE.Vector3());
        const pos = boundsCenter.clone();
        pos.addScaledVector(planeNormal, planePosition);
        pos.addScaledVector(tangent1, u * boundsSize.x / 2);
        pos.addScaledVector(tangent2, v * boundsSize.y / 2);

        const vel = field.sampleVelocity(pos);
        const speed = vel.length();

        velocities.push(speed);
        maxSpeed = Math.max(maxSpeed, speed);
      }
    }

    if (maxSpeed < 0.1) maxSpeed = 1.0;

    // Fill canvas with colors
    for (let i = 0; i < resolution * resolution; i++) {
      const speed = velocities[i];
      const speedRatio = Math.min(speed / maxSpeed, 1.0);

      // Color: blue (slow) -> red (fast)
      const hue = Math.max(0, 1 - speedRatio) * 0.67; // 0.67 rad ≈ 240° (blue)
      const rgb = this.hslToRgb(hue, 1.0, 0.5);

      const pixelIndex = i * 4;
      data[pixelIndex] = rgb.r;     // R
      data[pixelIndex + 1] = rgb.g; // G
      data[pixelIndex + 2] = rgb.b; // B
      data[pixelIndex + 3] = 255;   // A
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return texture;
  }

  /**
   * Convert HSL to RGB
   */
  private static hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 360) / 60) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    const angle = (h * 360) % 360;
    if (angle < 60) { r = c; g = x; b = 0; }
    else if (angle < 120) { r = x; g = c; b = 0; }
    else if (angle < 180) { r = 0; g = c; b = x; }
    else if (angle < 240) { r = 0; g = x; b = c; }
    else if (angle < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  }

  /**
   * Update velocity vector visualization (for interactive updates)
   * Useful when parameters change
   */
  static updateVelocityVectors(
    group: THREE.Group,
    field: VelocityField,
    config: Partial<VelocityVisualizationConfig> = {}
  ): void {
    // Clear existing geometry
    group.clear();

    // Recreate with new field
    const newVectors = this.createVelocityVectors(field, config);
    group.copy(newVectors);
  }
}
