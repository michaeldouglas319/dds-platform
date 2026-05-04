import * as THREE from 'three';

/**
 * VelocityField - 3D grid-based velocity field for fluid dynamics
 * Uses an Eulerian approach with trilinear interpolation
 */
export class VelocityField {
  private velocity: Float32Array;
  private gridResolution: [number, number, number];
  private cellSize: number;
  private bounds: { min: THREE.Vector3; max: THREE.Vector3 };

  constructor(
    resolution: [number, number, number] = [64, 64, 64],
    cellSize: number = 2.0
  ) {
    this.gridResolution = resolution;
    this.cellSize = cellSize;

    // Initialize velocity field: 3 components (vx, vy, vz) per cell
    const totalCells = resolution[0] * resolution[1] * resolution[2];
    this.velocity = new Float32Array(totalCells * 3);

    // Calculate bounds
    const halfWidth = (resolution[0] * cellSize) / 2;
    const halfHeight = (resolution[1] * cellSize) / 2;
    const halfDepth = (resolution[2] * cellSize) / 2;

    this.bounds = {
      min: new THREE.Vector3(-halfWidth, -halfHeight, -halfDepth),
      max: new THREE.Vector3(halfWidth, halfHeight, halfDepth),
    };
  }

  /**
   * Sample velocity at an arbitrary position using trilinear interpolation
   */
  sampleVelocity(pos: THREE.Vector3): THREE.Vector3 {
    // Clamp position to bounds
    const clampedPos = pos.clone().clamp(this.bounds.min, this.bounds.max);

    // Convert world position to grid coordinates
    const gridPos = {
      x: ((clampedPos.x - this.bounds.min.x) / (this.bounds.max.x - this.bounds.min.x)) *
        (this.gridResolution[0] - 1),
      y: ((clampedPos.y - this.bounds.min.y) / (this.bounds.max.y - this.bounds.min.y)) *
        (this.gridResolution[1] - 1),
      z: ((clampedPos.z - this.bounds.min.z) / (this.bounds.max.z - this.bounds.min.z)) *
        (this.gridResolution[2] - 1),
    };

    // Get integer and fractional parts
    const xi = Math.floor(gridPos.x);
    const yi = Math.floor(gridPos.y);
    const zi = Math.floor(gridPos.z);

    const fx = gridPos.x - xi;
    const fy = gridPos.y - yi;
    const fz = gridPos.z - zi;

    // Clamp to grid bounds
    const x0 = Math.min(xi, this.gridResolution[0] - 2);
    const x1 = Math.min(xi + 1, this.gridResolution[0] - 1);
    const y0 = Math.min(yi, this.gridResolution[1] - 2);
    const y1 = Math.min(yi + 1, this.gridResolution[1] - 1);
    const z0 = Math.min(zi, this.gridResolution[2] - 2);
    const z1 = Math.min(zi + 1, this.gridResolution[2] - 1);

    // Get velocities at 8 corners
    const v000 = this.getVelocityAt(x0, y0, z0);
    const v100 = this.getVelocityAt(x1, y0, z0);
    const v010 = this.getVelocityAt(x0, y1, z0);
    const v110 = this.getVelocityAt(x1, y1, z0);
    const v001 = this.getVelocityAt(x0, y0, z1);
    const v101 = this.getVelocityAt(x1, y0, z1);
    const v011 = this.getVelocityAt(x0, y1, z1);
    const v111 = this.getVelocityAt(x1, y1, z1);

    // Trilinear interpolation
    const v_x =
      v000.x * (1 - fx) * (1 - fy) * (1 - fz) +
      v100.x * fx * (1 - fy) * (1 - fz) +
      v010.x * (1 - fx) * fy * (1 - fz) +
      v110.x * fx * fy * (1 - fz) +
      v001.x * (1 - fx) * (1 - fy) * fz +
      v101.x * fx * (1 - fy) * fz +
      v011.x * (1 - fx) * fy * fz +
      v111.x * fx * fy * fz;

    const v_y =
      v000.y * (1 - fx) * (1 - fy) * (1 - fz) +
      v100.y * fx * (1 - fy) * (1 - fz) +
      v010.y * (1 - fx) * fy * (1 - fz) +
      v110.y * fx * fy * (1 - fz) +
      v001.y * (1 - fx) * (1 - fy) * fz +
      v101.y * fx * (1 - fy) * fz +
      v011.y * (1 - fx) * fy * fz +
      v111.y * fx * fy * fz;

    const v_z =
      v000.z * (1 - fx) * (1 - fy) * (1 - fz) +
      v100.z * fx * (1 - fy) * (1 - fz) +
      v010.z * (1 - fx) * fy * (1 - fz) +
      v110.z * fx * fy * (1 - fz) +
      v001.z * (1 - fx) * (1 - fy) * fz +
      v101.z * fx * (1 - fy) * fz +
      v011.z * (1 - fx) * fy * fz +
      v111.z * fx * fy * fz;

    return new THREE.Vector3(v_x, v_y, v_z);
  }

  /**
   * Get velocity at grid point (i, j, k)
   */
  private getVelocityAt(i: number, j: number, k: number): THREE.Vector3 {
    const index = (k * this.gridResolution[1] * this.gridResolution[0] +
      j * this.gridResolution[0] +
      i) * 3;

    return new THREE.Vector3(
      this.velocity[index],
      this.velocity[index + 1],
      this.velocity[index + 2]
    );
  }

  /**
   * Set velocity at grid point (i, j, k)
   */
  private setVelocityAt(i: number, j: number, k: number, vx: number, vy: number, vz: number) {
    const index = (k * this.gridResolution[1] * this.gridResolution[0] +
      j * this.gridResolution[0] +
      i) * 3;

    this.velocity[index] = vx;
    this.velocity[index + 1] = vy;
    this.velocity[index + 2] = vz;
  }

  /**
   * Populate velocity field from an analytical function
   */
  setFromFunction(fn: (pos: THREE.Vector3) => THREE.Vector3): void {
    for (let k = 0; k < this.gridResolution[2]; k++) {
      for (let j = 0; j < this.gridResolution[1]; j++) {
        for (let i = 0; i < this.gridResolution[0]; i++) {
          // Convert grid coordinates to world coordinates
          const x = this.bounds.min.x + (i / (this.gridResolution[0] - 1)) *
            (this.bounds.max.x - this.bounds.min.x);
          const y = this.bounds.min.y + (j / (this.gridResolution[1] - 1)) *
            (this.bounds.max.y - this.bounds.min.y);
          const z = this.bounds.min.z + (k / (this.gridResolution[2] - 1)) *
            (this.bounds.max.z - this.bounds.min.z);

          const pos = new THREE.Vector3(x, y, z);
          const vel = fn(pos);

          this.setVelocityAt(i, j, k, vel.x, vel.y, vel.z);
        }
      }
    }
  }

  /**
   * Apply obstacle by zeroing velocity inside SDF region
   */
  applyObstacle(sdf: (pos: THREE.Vector3) => number, falloffDistance: number = 2.0): void {
    for (let k = 0; k < this.gridResolution[2]; k++) {
      for (let j = 0; j < this.gridResolution[1]; j++) {
        for (let i = 0; i < this.gridResolution[0]; i++) {
          // Convert grid coordinates to world coordinates
          const x = this.bounds.min.x + (i / (this.gridResolution[0] - 1)) *
            (this.bounds.max.x - this.bounds.min.x);
          const y = this.bounds.min.y + (j / (this.gridResolution[1] - 1)) *
            (this.bounds.max.y - this.bounds.min.y);
          const z = this.bounds.min.z + (k / (this.gridResolution[2] - 1)) *
            (this.bounds.max.z - this.bounds.min.z);

          const pos = new THREE.Vector3(x, y, z);
          const distance = sdf(pos);

          if (distance < 0) {
            // Inside obstacle: zero velocity
            this.setVelocityAt(i, j, k, 0, 0, 0);
          } else if (distance < falloffDistance) {
            // Near boundary: smooth falloff
            const alpha = distance / falloffDistance;
            const index = (k * this.gridResolution[1] * this.gridResolution[0] +
              j * this.gridResolution[0] +
              i) * 3;

            this.velocity[index] *= alpha;
            this.velocity[index + 1] *= alpha;
            this.velocity[index + 2] *= alpha;
          }
        }
      }
    }
  }

  /**
   * Get velocity field bounds
   */
  getBounds(): { min: THREE.Vector3; max: THREE.Vector3 } {
    return this.bounds;
  }

  /**
   * Get grid resolution
   */
  getResolution(): [number, number, number] {
    return this.gridResolution;
  }

  /**
   * Get cell size
   */
  getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Check if position is within velocity field bounds
   */
  isWithinBounds(pos: THREE.Vector3): boolean {
    return (
      pos.x >= this.bounds.min.x && pos.x <= this.bounds.max.x &&
      pos.y >= this.bounds.min.y && pos.y <= this.bounds.max.y &&
      pos.z >= this.bounds.min.z && pos.z <= this.bounds.max.z
    );
  }

  /**
   * Store signed distance field for aerodynamic calculations
   * Maps grid cells to their distance to the nearest obstacle surface
   */
  private sdfField: Float32Array | null = null;

  /**
   * Set the signed distance field
   */
  setSDF(sdf: (pos: THREE.Vector3) => number): void {
    const totalCells = this.gridResolution[0] * this.gridResolution[1] * this.gridResolution[2];
    this.sdfField = new Float32Array(totalCells);

    for (let k = 0; k < this.gridResolution[2]; k++) {
      for (let j = 0; j < this.gridResolution[1]; j++) {
        for (let i = 0; i < this.gridResolution[0]; i++) {
          // Convert grid coordinates to world coordinates
          const x = this.bounds.min.x + (i / (this.gridResolution[0] - 1)) *
            (this.bounds.max.x - this.bounds.min.x);
          const y = this.bounds.min.y + (j / (this.gridResolution[1] - 1)) *
            (this.bounds.max.y - this.bounds.min.y);
          const z = this.bounds.min.z + (k / (this.gridResolution[2] - 1)) *
            (this.bounds.max.z - this.bounds.min.z);

          const pos = new THREE.Vector3(x, y, z);
          const index = k * this.gridResolution[1] * this.gridResolution[0] + j * this.gridResolution[0] + i;
          this.sdfField[index] = sdf(pos);
        }
      }
    }
  }

  /**
   * Get signed distance at a position using grid interpolation
   * Positive = outside obstacle, Negative = inside obstacle
   */
  getSignedDistance(pos: THREE.Vector3): number {
    if (!this.sdfField) return 1000; // Default to far away

    // Clamp position to bounds
    const clampedPos = pos.clone().clamp(this.bounds.min, this.bounds.max);

    // Convert world position to grid coordinates
    const gridPos = {
      x: ((clampedPos.x - this.bounds.min.x) / (this.bounds.max.x - this.bounds.min.x)) *
        (this.gridResolution[0] - 1),
      y: ((clampedPos.y - this.bounds.min.y) / (this.bounds.max.y - this.bounds.min.y)) *
        (this.gridResolution[1] - 1),
      z: ((clampedPos.z - this.bounds.min.z) / (this.bounds.max.z - this.bounds.min.z)) *
        (this.gridResolution[2] - 1),
    };

    // Get integer and fractional parts
    const xi = Math.floor(gridPos.x);
    const yi = Math.floor(gridPos.y);
    const zi = Math.floor(gridPos.z);

    const fx = gridPos.x - xi;
    const fy = gridPos.y - yi;
    const fz = gridPos.z - zi;

    // Clamp to grid bounds
    const x0 = Math.min(xi, this.gridResolution[0] - 2);
    const x1 = Math.min(xi + 1, this.gridResolution[0] - 1);
    const y0 = Math.min(yi, this.gridResolution[1] - 2);
    const y1 = Math.min(yi + 1, this.gridResolution[1] - 1);
    const z0 = Math.min(zi, this.gridResolution[2] - 2);
    const z1 = Math.min(zi + 1, this.gridResolution[2] - 1);

    // Get SDF values at 8 corners
    const getSdfAt = (i: number, j: number, k: number): number => {
      const index = k * this.gridResolution[1] * this.gridResolution[0] + j * this.gridResolution[0] + i;
      return this.sdfField![index];
    };

    const d000 = getSdfAt(x0, y0, z0);
    const d100 = getSdfAt(x1, y0, z0);
    const d010 = getSdfAt(x0, y1, z0);
    const d110 = getSdfAt(x1, y1, z0);
    const d001 = getSdfAt(x0, y0, z1);
    const d101 = getSdfAt(x1, y0, z1);
    const d011 = getSdfAt(x0, y1, z1);
    const d111 = getSdfAt(x1, y1, z1);

    // Trilinear interpolation
    return (
      d000 * (1 - fx) * (1 - fy) * (1 - fz) +
      d100 * fx * (1 - fy) * (1 - fz) +
      d010 * (1 - fx) * fy * (1 - fz) +
      d110 * fx * fy * (1 - fz) +
      d001 * (1 - fx) * (1 - fy) * fz +
      d101 * fx * (1 - fy) * fz +
      d011 * (1 - fx) * fy * fz +
      d111 * fx * fy * fz
    );
  }
}
