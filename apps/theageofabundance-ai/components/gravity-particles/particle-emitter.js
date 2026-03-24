/**
 * ParticleEmitter — Spawns particles from a configurable source position.
 *
 * Single Responsibility: Manages spawn timing, initial velocity, and particle lifecycle.
 *
 * Reference: Stemkoski particle engine pattern (stemkoski.github.io/Three.js/Particle-Engine.html)
 *
 * @example
 *   const emitter = new ParticleEmitter({
 *     position: [5, 0, 0],
 *     rate: 10,           // particles per second
 *     spread: 0.3,
 *     initialSpeed: 1.5,
 *   });
 *   const newParticles = emitter.update(deltaTime);
 */

import { Vector3 } from 'three';

export class ParticleEmitter {
  /**
   * @param {Object} config
   * @param {number[]} config.position - [x, y, z] spawn point
   * @param {number}   config.rate - Particles per second (default: 10)
   * @param {number}   config.spread - Random offset radius from position (default: 0.3)
   * @param {number}   config.initialSpeed - Magnitude of initial velocity (default: 1.5)
   * @param {number[]} [config.direction] - Preferred direction [x,y,z] (default: random)
   * @param {string}   [config.id] - Optional identifier
   */
  constructor({
    position = [0, 0, 0],
    rate = 10,
    spread = 0.3,
    initialSpeed = 1.5,
    direction = null,
    id = '',
  }) {
    this.position = new Vector3(...position);
    this.rate = rate;
    this.spread = spread;
    this.initialSpeed = initialSpeed;
    this.direction = direction ? new Vector3(...direction).normalize() : null;
    this.id = id;
    this._accumulator = 0;
  }

  /**
   * Advance the emitter by `dt` seconds.
   * Returns an array of { position: Vector3, velocity: Vector3 } for new particles.
   *
   * @param {number} dt - Delta time in seconds
   * @returns {Array<{ position: Vector3, velocity: Vector3 }>}
   */
  update(dt) {
    this._accumulator += dt * this.rate;
    const count = Math.floor(this._accumulator);
    this._accumulator -= count;

    const spawned = [];
    for (let i = 0; i < count; i++) {
      spawned.push({
        position: this._randomPosition(),
        velocity: this._randomVelocity(),
      });
    }
    return spawned;
  }

  /** @private */
  _randomPosition() {
    return new Vector3(
      this.position.x + (Math.random() - 0.5) * this.spread,
      this.position.y + (Math.random() - 0.5) * this.spread,
      this.position.z + (Math.random() - 0.5) * this.spread,
    );
  }

  /** @private */
  _randomVelocity() {
    if (this.direction) {
      // Cone around preferred direction
      const jitter = new Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
      );
      return this.direction.clone().add(jitter).normalize().multiplyScalar(this.initialSpeed);
    }

    // Random direction on unit sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    return new Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi),
    ).multiplyScalar(this.initialSpeed);
  }
}
