/**
 * GravityWell — A point attractor with configurable mass and capture radius.
 *
 * Single Responsibility: Defines a gravity source and calculates force on a particle.
 *
 * Reference: Newtonian gravity F = G * m1 * m2 / r^2
 * Adapted from github.com/Almaric78/gravity-engine
 *
 * @example
 *   const well = new GravityWell({ position: [0, 0, 0], mass: 50, captureRadius: 0.5 });
 *   const force = well.calculateForce(particlePosition); // Vector3
 */

import { Vector3 } from 'three';

const _direction = new Vector3(); // reusable to avoid GC

export class GravityWell {
  /**
   * @param {Object} config
   * @param {number[]} config.position - [x, y, z] world position
   * @param {number}   config.mass - Gravitational strength (default: 50)
   * @param {number}   config.captureRadius - Distance at which particle is "captured" (default: 0.5)
   * @param {number}   config.soften - Softening factor to prevent singularity (default: 0.1)
   * @param {string}   [config.id] - Optional identifier
   */
  constructor({ position = [0, 0, 0], mass = 50, captureRadius = 0.5, soften = 0.1, id = '' }) {
    this.position = new Vector3(...position);
    this.mass = mass;
    this.captureRadius = captureRadius;
    this.soften = soften;
    this.id = id;
    this.capturedCount = 0;
  }

  /**
   * Calculate gravitational force vector on a particle at `pos`.
   * Returns zero vector if particle is inside capture radius.
   *
   * @param {Vector3} pos - Particle world position
   * @returns {{ force: Vector3, distance: number, captured: boolean }}
   */
  calculateForce(pos) {
    _direction.subVectors(this.position, pos);
    const distance = _direction.length();

    if (distance < this.captureRadius) {
      return { force: _direction.set(0, 0, 0), distance, captured: true };
    }

    // F = mass / (r^2 + soften^2) — softened to avoid infinity at r=0
    const strength = this.mass / (distance * distance + this.soften * this.soften);
    const force = _direction.normalize().multiplyScalar(strength);

    return { force: force.clone(), distance, captured: false };
  }

  /** Update the captured particle count (called by simulation). */
  setCapturedCount(count) {
    this.capturedCount = count;
  }
}
