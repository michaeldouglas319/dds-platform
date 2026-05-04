/**
 * Streamlines.ts - Streamline generation and visualization
 *
 * Generates flow visualization by tracing particles through velocity field
 * Streamlines show the path that a massless particle would follow in the flow
 */

import * as THREE from 'three';
import { VelocityField } from './VelocityField';
import { ParticleAdvection } from './ParticleAdvection';

export interface StreamlineConfig {
  gridResolution: number;        // e.g., 10 = 10x10 grid of streamlines
  maxSteps: number;              // Max integration steps per streamline
  timeStep: number;              // Integration time step
  minVelocity: number;           // Stop if velocity below this (default 0.01)
}

export class Streamlines {
  /**
   * Generate a grid of streamlines from inlet
   *
   * @param field - Velocity field to trace through
   * @param inletBounds - Bounds of inlet region (where particles spawn)
   * @param config - Configuration for streamline generation
   * @returns Array of streamline paths (each path is an array of Vector3 positions)
   */
  static generateStreamlines(
    field: VelocityField,
    inletBounds: { min: THREE.Vector3; max: THREE.Vector3 },
    config: StreamlineConfig = {
      gridResolution: 10,
      maxSteps: 100,
      timeStep: 0.1,
      minVelocity: 0.01,
    }
  ): THREE.Vector3[][] {
    const streamlines: THREE.Vector3[][] = [];

    // Calculate spacing for grid of starting points
    const ySpacing = (inletBounds.max.y - inletBounds.min.y) / (config.gridResolution + 1);
    const zSpacing = (inletBounds.max.z - inletBounds.min.z) / (config.gridResolution + 1);

    // Generate streamlines from grid of starting points at inlet
    for (let i = 1; i <= config.gridResolution; i++) {
      for (let j = 1; j <= config.gridResolution; j++) {
        const startPos = new THREE.Vector3(
          inletBounds.min.x,
          inletBounds.min.y + i * ySpacing,
          inletBounds.min.z + j * zSpacing
        );

        const path = this.traceStreamline(field, startPos, config);
        if (path.length > 2) {
          // Only keep streamlines with at least 3 points
          streamlines.push(path);
        }
      }
    }

    return streamlines;
  }

  /**
   * Trace a single streamline using RK4 integration
   *
   * @param field - Velocity field
   * @param startPos - Starting position for streamline
   * @param config - Configuration
   * @returns Array of positions along the streamline
   */
  static traceStreamline(
    field: VelocityField,
    startPos: THREE.Vector3,
    config: StreamlineConfig
  ): THREE.Vector3[] {
    const path: THREE.Vector3[] = [];
    let pos = startPos.clone();

    path.push(pos.clone());

    const bounds = field.getBounds();

    for (let step = 0; step < config.maxSteps; step++) {
      // Sample velocity at current position
      const vel = field.sampleVelocity(pos);
      const speed = vel.length();

      // Stop if velocity is negligible (inside obstacle)
      if (speed < config.minVelocity) {
        break;
      }

      // Advance position using RK4 integration
      pos = ParticleAdvection.advectRK4(pos, field, config.timeStep);

      // Add to path
      path.push(pos.clone());

      // Stop if outside bounds
      if (!field.isWithinBounds(pos)) {
        break;
      }
    }

    return path;
  }

  /**
   * Convert streamline path to a smooth curve geometry for rendering
   *
   * @param streamlines - Array of streamline paths
   * @param lineWidth - Width of lines (for wireframe rendering)
   * @returns THREE.BufferGeometry with streamline geometry
   */
  static createStreamlineGeometry(
    streamlines: THREE.Vector3[][],
    lineWidth: number = 2.0
  ): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const indices: number[] = [];

    let vertexIndex = 0;

    // Create geometry from each streamline
    for (const streamline of streamlines) {
      if (streamline.length < 2) continue;

      // Add vertices for this streamline
      for (const pos of streamline) {
        positions.push(pos.x, pos.y, pos.z);
      }

      // Create line segments
      for (let i = 0; i < streamline.length - 1; i++) {
        indices.push(vertexIndex + i, vertexIndex + i + 1);
      }

      vertexIndex += streamline.length;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    return geometry;
  }

  /**
   * Create THREE.js Line objects for streamline visualization
   *
   * @param streamlines - Array of streamline paths
   * @param color - Color for all streamlines
   * @returns THREE.Group containing line objects
   */
  static createStreamlineLines(
    streamlines: THREE.Vector3[][],
    color: THREE.Color = new THREE.Color(0x4488ff)
  ): THREE.Group {
    const group = new THREE.Group();

    // Create a line for each streamline
    for (const streamline of streamlines) {
      if (streamline.length < 2) continue;

      // Create geometry for this streamline
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(
        streamline.flatMap(p => [p.x, p.y, p.z])
      ), 3));

      // Create line material and object
      const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 2,
        transparent: true,
        opacity: 0.6,
      });

      const line = new THREE.Line(geometry, material);
      group.add(line);
    }

    return group;
  }

  /**
   * Create tube geometry for streamlines (thicker visualization)
   * Useful for better visibility in 3D
   *
   * @param streamlines - Array of streamline paths
   * @param tubeRadius - Radius of tube geometry
   * @param radialSegments - Segments around tube circumference
   * @returns THREE.Group with tube meshes
   */
  static createStreamlineTubes(
    streamlines: THREE.Vector3[][],
    tubeRadius: number = 0.5,
    radialSegments: number = 4
  ): THREE.Group {
    const group = new THREE.Group();

    for (const streamline of streamlines) {
      if (streamline.length < 2) continue;

      // Create curve from streamline points
      const curve = new THREE.CatmullRomCurve3(streamline);

      // Sample curve and create tube
      const points = curve.getPoints(streamline.length * 2);
      const tubeGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        20, // segments along curve
        tubeRadius,
        radialSegments,
        false // closed
      );

      // Color by position along streamline
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4488ff),
        metalness: 0.0,
        roughness: 0.7,
        transparent: true,
        opacity: 0.5,
      });

      const mesh = new THREE.Mesh(tubeGeometry, material);
      group.add(mesh);
    }

    return group;
  }

  /**
   * Cache streamline data for reuse
   */
  private static streamlineCache = new Map<string, THREE.Vector3[][]>();

  /**
   * Get or generate cached streamlines
   *
   * @param cacheKey - Unique key for this streamline configuration
   * @param generator - Function to generate streamlines if not cached
   * @returns Streamline paths
   */
  static getCachedStreamlines(
    cacheKey: string,
    generator: () => THREE.Vector3[][]
  ): THREE.Vector3[][] {
    if (this.streamlineCache.has(cacheKey)) {
      return this.streamlineCache.get(cacheKey)!;
    }

    const streamlines = generator();
    this.streamlineCache.set(cacheKey, streamlines);
    return streamlines;
  }

  /**
   * Clear streamline cache
   */
  static clearCache(): void {
    this.streamlineCache.clear();
  }
}
