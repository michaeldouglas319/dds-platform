/**
 * Fluid Dynamics Solver
 * Implementation of Jos Stam's stable fluids algorithm
 * Reference: "Real-Time Fluid Dynamics for Games"
 */

import * as THREE from 'three';
import type { FluidConfig } from './fluidConfig';

export interface FluidField {
  velocity: Float32Array; // [x, y, z] for each grid cell
  pressure: Float32Array;
  divergence: Float32Array;
}

export interface FluidForces {
  force: THREE.Vector3;
  torque: THREE.Vector3;
  pressure: number;
  velocity: number;
}

export class FluidSolver {
  private config: FluidConfig;
  private gridResolution: [number, number, number];
  private gridSize: number; // Total cells
  private cellSize: number; // Physical size of each cell

  // Field buffers (ping-pong)
  private velocity: Float32Array;
  private velocityTemp: Float32Array;
  private pressure: Float32Array;
  private pressureTemp: Float32Array;
  private divergence: Float32Array;

  // Boundary conditions
  private boundaryVelocity: Float32Array;
  private boundaryMask: Uint8Array; // 1 = solid, 0 = fluid

  // Force accumulation
  private forces: Float32Array; // [x, y, z] for each cell

  private frameCount = 0;
  private totalTime = 0;

  constructor(config: FluidConfig) {
    this.config = config;
    this.gridResolution = config.gridResolution;
    this.gridSize = this.gridResolution[0] * this.gridResolution[1] * this.gridResolution[2];
    this.cellSize = 1.0 / Math.max(...this.gridResolution);

    // Initialize fields
    this.velocity = new Float32Array(this.gridSize * 3);
    this.velocityTemp = new Float32Array(this.gridSize * 3);
    this.pressure = new Float32Array(this.gridSize);
    this.pressureTemp = new Float32Array(this.gridSize);
    this.divergence = new Float32Array(this.gridSize);
    this.boundaryVelocity = new Float32Array(this.gridSize * 3);
    this.boundaryMask = new Uint8Array(this.gridSize);
    this.forces = new Float32Array(this.gridSize * 3);
  }

  /**
   * Set velocity at grid position (for force injection)
   */
  public addVelocity(x: number, y: number, z: number, vx: number, vy: number, vz: number, radius: number = 1): void {
    const [gx, gy, gz] = this.gridResolution;

    // Apply gaussian splat to velocity field
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const ix = Math.floor(x) + dx;
          const iy = Math.floor(y) + dy;
          const iz = Math.floor(z) + dz;

          if (ix >= 0 && ix < gx && iy >= 0 && iy < gy && iz >= 0 && iz < gz) {
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const weight = Math.exp(-(dist * dist) / (radius * radius));
            const idx = (iz * gy * gx + iy * gx + ix) * 3;

            this.velocity[idx] += vx * weight;
            this.velocity[idx + 1] += vy * weight;
            this.velocity[idx + 2] += vz * weight;
          }
        }
      }
    }
  }

  /**
   * Add external force (e.g., buoyancy, drag)
   */
  public addForce(x: number, y: number, z: number, fx: number, fy: number, fz: number, radius: number = 1): void {
    const [gx, gy, gz] = this.gridResolution;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const ix = Math.floor(x) + dx;
          const iy = Math.floor(y) + dy;
          const iz = Math.floor(z) + dz;

          if (ix >= 0 && ix < gx && iy >= 0 && iy < gy && iz >= 0 && iz < gz) {
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const weight = Math.exp(-(dist * dist) / (radius * radius));
            const idx = (iz * gy * gx + iy * gx + ix) * 3;

            this.forces[idx] += fx * weight;
            this.forces[idx + 1] += fy * weight;
            this.forces[idx + 2] += fz * weight;
          }
        }
      }
    }
  }

  /**
   * Mark cells as solid (boundary conditions)
   */
  public setSolidBoundary(x: number, y: number, z: number, radius: number = 1): void {
    const [gx, gy, gz] = this.gridResolution;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const ix = Math.floor(x) + dx;
          const iy = Math.floor(y) + dy;
          const iz = Math.floor(z) + dz;

          if (ix >= 0 && ix < gx && iy >= 0 && iy < gy && iz >= 0 && iz < gz) {
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist <= radius) {
              const idx = iz * gy * gx + iy * gx + ix;
              this.boundaryMask[idx] = 1;
            }
          }
        }
      }
    }
  }

  /**
   * Main simulation step
   */
  public step(dt: number): void {
    this.frameCount++;
    this.totalTime += dt;

    // 1. Add forces
    this.applyForces(dt);

    // 2. Advect velocity (semi-Lagrangian)
    this.advect(this.velocity, this.velocity, dt);

    // 3. Diffuse velocity (viscosity)
    this.diffuse(this.velocity, dt);

    // 4. Project to make incompressible
    this.project();

    // 5. Clear forces
    this.forces.fill(0);
  }

  /**
   * Apply external forces to velocity field
   */
  private applyForces(dt: number): void {
    const [_gx, _gy, _gz] = this.gridResolution;

    for (let i = 0; i < this.gridSize; i++) {
      if (this.boundaryMask[i] === 0) {
        const idx = i * 3;
        // F = ma -> a = F/m, add to velocity
        this.velocity[idx] += this.forces[idx] * dt;
        this.velocity[idx + 1] += this.forces[idx + 1] * dt;
        this.velocity[idx + 2] += this.forces[idx + 2] * dt;
      }
    }
  }

  /**
   * Semi-Lagrangian advection
   */
  private advect(source: Float32Array, dest: Float32Array, dt: number): void {
    const [gx, gy, gz] = this.gridResolution; // Used in loop bounds
    const scale = Math.min(gx, gy, gz);

    for (let z = 1; z < gz - 1; z++) {
      for (let y = 1; y < gy - 1; y++) {
        for (let ix = 1; ix < gx - 1; ix++) {
          const idx = (z * gy * gx + y * gx + ix) * 3;

          // Trace backward
          const vx = this.velocity[idx] * scale * dt;
          const vy = this.velocity[idx + 1] * scale * dt;
          const vz = this.velocity[idx + 2] * scale * dt;

          const bx = ix - vx;
          const by = y - vy;
          const bz = z - vz;

          // Bilinear interpolation
          const val = this.interpolate(source, bx, by, bz);
          dest[idx] = val[0];
          dest[idx + 1] = val[1];
          dest[idx + 2] = val[2];
        }
      }
    }

    this.applyBoundaryConditions(dest);
  }

  /**
   * Diffusion step using Jacobi iteration
   */
  private diffuse(field: Float32Array, dt: number): void {
    const [gx, gy, gz] = this.gridResolution;
    const alpha = (this.config.viscosity * dt) / (this.cellSize * this.cellSize);
    const rBeta = 1.0 / (1.0 + 6.0 * alpha);

    for (let iter = 0; iter < this.config.solverIterations; iter++) {
      this.jacobi(field, field, alpha, rBeta);
    }

    this.applyBoundaryConditions(field);
  }

  /**
   * Jacobi iteration for diffusion/pressure
   */
  private jacobi(xField: Float32Array, b: Float32Array, alpha: number, rBeta: number): void {
    const [gx, gy, gz] = this.gridResolution;
    const temp = new Float32Array(xField);

    for (let z = 1; z < gz - 1; z++) {
      for (let y = 1; y < gy - 1; y++) {
        for (let ix = 1; ix < gx - 1; ix++) {
          const idx = (z * gy * gx + y * gx + ix) * 3;
          const l = ((z) * gy * gx + y * gx + (ix - 1)) * 3;
          const r = ((z) * gy * gx + y * gx + (ix + 1)) * 3;
          const b_ = ((z) * gy * gx + (y - 1) * gx + ix) * 3;
          const t = ((z) * gy * gx + (y + 1) * gx + ix) * 3;
          const f = ((z - 1) * gy * gx + y * gx + ix) * 3;
          const bk = ((z + 1) * gy * gx + y * gx + ix) * 3;

          for (let c = 0; c < 3; c++) {
            temp[idx + c] =
              (b[idx + c] +
                alpha * (xField[l + c] + xField[r + c] + xField[b_ + c] + xField[t + c] + xField[f + c] + xField[bk + c])) *
              rBeta;
          }
        }
      }
    }

    xField.set(temp);
  }

  /**
   * Pressure projection (makes fluid incompressible)
   */
  private project(): void {
    // Compute divergence
    this.computeDivergence();

    // Solve Poisson equation for pressure
    this.pressure.fill(0);
    const alpha = -this.cellSize * this.cellSize;
    const rBeta = 1.0 / 6.0;

    for (let iter = 0; iter < this.config.solverIterations; iter++) {
      this.jacobi(this.pressure, this.divergence, alpha, rBeta);
    }

    this.applyBoundaryConditions(this.pressure);

    // Subtract pressure gradient from velocity
    this.subtractGradient();
  }

  /**
   * Compute velocity divergence (for pressure solver)
   */
  private computeDivergence(): void {
    const [gx, gy, gz] = this.gridResolution;
    const scale = Math.min(gx, gy, gz);

    for (let z = 1; z < gz - 1; z++) {
      for (let y = 1; y < gy - 1; y++) {
        for (let ix = 1; ix < gx - 1; ix++) {
          const l = ((z) * gy * gx + y * gx + (ix - 1)) * 3;
          const r = ((z) * gy * gx + y * gx + (ix + 1)) * 3;
          const b_ = ((z) * gy * gx + (y - 1) * gx + ix) * 3;
          const t = ((z) * gy * gx + (y + 1) * gx + ix) * 3;
          const f = ((z - 1) * gy * gx + y * gx + ix) * 3;
          const bk = ((z + 1) * gy * gx + y * gx + ix) * 3;

          const divIdx = z * gy * gx + y * gx + ix;

          this.divergence[divIdx] =
            -0.5 *
            scale *
            ((this.velocity[r] - this.velocity[l]) +
              (this.velocity[t + 1] - this.velocity[b_ + 1]) +
              (this.velocity[bk + 2] - this.velocity[f + 2]));
        }
      }
    }
  }

  /**
   * Subtract pressure gradient from velocity
   */
  private subtractGradient(): void {
    const [gx, gy, gz] = this.gridResolution;
    const scale = Math.min(gx, gy, gz);

    for (let z = 1; z < gz - 1; z++) {
      for (let y = 1; y < gy - 1; y++) {
        for (let ix = 1; ix < gx - 1; ix++) {
          const idx = (z * gy * gx + y * gx + ix) * 3;
          const l = (z * gy * gx + y * gx + (ix - 1));
          const r = (z * gy * gx + y * gx + (ix + 1));
          const b_ = (z * gy * gx + (y - 1) * gx + ix);
          const t = (z * gy * gx + (y + 1) * gx + ix);
          const f = ((z - 1) * gy * gx + y * gx + ix);
          const bk = ((z + 1) * gy * gx + y * gx + ix);

          this.velocity[idx] -= 0.5 * scale * (this.pressure[r] - this.pressure[l]);
          this.velocity[idx + 1] -= 0.5 * scale * (this.pressure[t] - this.pressure[b_]);
          this.velocity[idx + 2] -= 0.5 * scale * (this.pressure[bk] - this.pressure[f]);
        }
      }
    }

    this.applyBoundaryConditions(this.velocity);
  }


  /**
   * Interpolate value at fractional grid position
   */
  private interpolate(field: Float32Array, x: number, y: number, z: number): [number, number, number] {
    const [gx, gy, gz] = this.gridResolution;

    x = Math.max(0.5, Math.min(gx - 1.5, x));
    y = Math.max(0.5, Math.min(gy - 1.5, y));
    z = Math.max(0.5, Math.min(gz - 1.5, z));

    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);

    const fx = x - ix;
    const fy = y - iy;
    const fz = z - iz;

    const idx000 = (iz * gy * gx + iy * gx + ix) * 3;
    const idx100 = (iz * gy * gx + iy * gx + (ix + 1)) * 3;
    const idx010 = (iz * gy * gx + (iy + 1) * gx + ix) * 3;
    const idx110 = (iz * gy * gx + (iy + 1) * gx + (ix + 1)) * 3;
    const idx001 = ((iz + 1) * gy * gx + iy * gx + ix) * 3;
    const idx101 = ((iz + 1) * gy * gx + iy * gx + (ix + 1)) * 3;
    const idx011 = ((iz + 1) * gy * gx + (iy + 1) * gx + ix) * 3;
    const idx111 = ((iz + 1) * gy * gx + (iy + 1) * gx + (ix + 1)) * 3;

    const v000 = [field[idx000], field[idx000 + 1], field[idx000 + 2]];
    const v100 = [field[idx100], field[idx100 + 1], field[idx100 + 2]];
    const v010 = [field[idx010], field[idx010 + 1], field[idx010 + 2]];
    const v110 = [field[idx110], field[idx110 + 1], field[idx110 + 2]];
    const v001 = [field[idx001], field[idx001 + 1], field[idx001 + 2]];
    const v101 = [field[idx101], field[idx101 + 1], field[idx101 + 2]];
    const v011 = [field[idx011], field[idx011 + 1], field[idx011 + 2]];
    const v111 = [field[idx111], field[idx111 + 1], field[idx111 + 2]];

    const result: [number, number, number] = [0, 0, 0];

    for (let c = 0; c < 3; c++) {
      const v00 = v000[c] * (1 - fx) + v100[c] * fx;
      const v10 = v010[c] * (1 - fx) + v110[c] * fx;
      const v01 = v001[c] * (1 - fx) + v101[c] * fx;
      const v11 = v011[c] * (1 - fx) + v111[c] * fx;

      const v0 = v00 * (1 - fy) + v10 * fy;
      const v1 = v01 * (1 - fy) + v11 * fy;

      result[c] = v0 * (1 - fz) + v1 * fz;
    }

    return result;
  }

  /**
   * Apply boundary conditions
   */
  private applyBoundaryConditions(field: Float32Array): void {
    const [gx, gy, gz] = this.gridResolution;

    // Set boundaries to zero (closed boundary)
    for (let z = 0; z < gz; z++) {
      for (let y = 0; y < gy; y++) {
        for (let x = 0; x < gx; x++) {
          if (x === 0 || x === gx - 1 || y === 0 || y === gy - 1 || z === 0 || z === gz - 1) {
            const idx = (z * gy * gx + y * gx + x) * 3;
            field[idx] = field[idx + 1] = field[idx + 2] = 0;
          }
        }
      }
    }
  }

  /**
   * Get velocity at grid position
   */
  public getVelocity(x: number, y: number, z: number): THREE.Vector3 {
    const vel = this.interpolate(this.velocity, x, y, z);
    return new THREE.Vector3(vel[0], vel[1], vel[2]);
  }

  /**
   * Get pressure at grid position
   */
  public getPressure(x: number, y: number, z: number): number {
    x = Math.max(0.5, Math.min(this.gridResolution[0] - 1.5, x));
    y = Math.max(0.5, Math.min(this.gridResolution[1] - 1.5, y));
    z = Math.max(0.5, Math.min(this.gridResolution[2] - 1.5, z));

    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fy = y - iy;
    const fz = z - iz;

    const [gx, gy] = this.gridResolution;
    const idx000 = iz * gy * gx + iy * gx + ix;
    const idx100 = iz * gy * gx + iy * gx + (ix + 1);
    const idx010 = iz * gy * gx + (iy + 1) * gx + ix;
    const idx110 = iz * gy * gx + (iy + 1) * gx + (ix + 1);
    const idx001 = (iz + 1) * gy * gx + iy * gx + ix;
    const idx101 = (iz + 1) * gy * gx + iy * gx + (ix + 1);
    const idx011 = (iz + 1) * gy * gx + (iy + 1) * gx + ix;
    const idx111 = (iz + 1) * gy * gx + (iy + 1) * gx + (ix + 1);

    const p000 = this.pressure[idx000];
    const p100 = this.pressure[idx100];
    const p010 = this.pressure[idx010];
    const p110 = this.pressure[idx110];
    const p001 = this.pressure[idx001];
    const p101 = this.pressure[idx101];
    const p011 = this.pressure[idx011];
    const p111 = this.pressure[idx111];

    const p00 = p000 * (1 - fx) + p100 * fx;
    const p10 = p010 * (1 - fx) + p110 * fx;
    const p01 = p001 * (1 - fx) + p101 * fx;
    const p11 = p011 * (1 - fx) + p111 * fx;

    const p0 = p00 * (1 - fy) + p10 * fy;
    const p1 = p01 * (1 - fy) + p11 * fy;

    return p0 * (1 - fz) + p1 * fz;
  }

  /**
   * Get entire velocity field
   */
  public getVelocityField(): Float32Array {
    return new Float32Array(this.velocity);
  }

  /**
   * Get entire pressure field
   */
  public getPressureField(): Float32Array {
    return new Float32Array(this.pressure);
  }


  /**
   * Reset simulation
   */
  public reset(): void {
    this.velocity.fill(0);
    this.velocityTemp.fill(0);
    this.pressure.fill(0);
    this.pressureTemp.fill(0);
    this.divergence.fill(0);
    this.boundaryMask.fill(0);
    this.forces.fill(0);
    this.frameCount = 0;
    this.totalTime = 0;
  }

  /**
   * Get grid resolution
   */
  public getGridResolution(): [number, number, number] {
    return this.gridResolution;
  }

  /**
   * Get frame count
   */
  public getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Get total elapsed time
   */
  public getTotalTime(): number {
    return this.totalTime;
  }
}
