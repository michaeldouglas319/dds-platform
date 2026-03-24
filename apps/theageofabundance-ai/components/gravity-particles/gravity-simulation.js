/**
 * GravitySimulation — CPU physics loop using Euler integration.
 *
 * Single Responsibility: Steps particle positions/velocities forward in time
 * under the influence of GravityWell attractors.
 *
 * Reference: Euler integration pattern from discourse.threejs.org/t/particle-physics-on-gpu/796
 *
 * Manages:
 *   - Flat Float32Arrays for positions and velocities (GPU-upload friendly)
 *   - Per-well captured counts
 *   - Particle lifecycle (alive/dead, respawn)
 *
 * @example
 *   const sim = new GravitySimulation({ maxParticles: 4096 });
 *   sim.addWell(well);
 *   sim.addEmitter(emitter);
 *   const { positions, colors, orbitCount, capturedCounts } = sim.step(dt);
 */

import { Vector3 } from 'three';

const _force = new Vector3();
const _totalForce = new Vector3();

/** Particle states */
const DEAD = 0;
const ORBITING = 1;
const CAPTURED = 2;

export class GravitySimulation {
  /**
   * @param {Object} config
   * @param {number} config.maxParticles - Buffer size (default: 4096)
   * @param {number} config.damping - Velocity damping per frame (default: 0.998)
   * @param {number} config.maxAge - Seconds before particle dies and respawns (default: 20)
   */
  constructor({ maxParticles = 4096, damping = 0.998, maxAge = 20 } = {}) {
    this.maxParticles = maxParticles;
    this.damping = damping;
    this.maxAge = maxAge;

    // Flat arrays (3 floats per particle)
    this.positions = new Float32Array(maxParticles * 3);
    this.velocities = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3); // RGB per particle

    // Per-particle metadata
    this.states = new Uint8Array(maxParticles);     // DEAD, ORBITING, CAPTURED
    this.ages = new Float32Array(maxParticles);      // seconds alive
    this.wellIndex = new Int16Array(maxParticles);   // which well captured it (-1 = none)

    this.wells = [];
    this.emitters = [];
    this.aliveCount = 0;

    // Fill states as DEAD
    this.states.fill(DEAD);
    this.wellIndex.fill(-1);
  }

  /** @param {import('./gravity-well').GravityWell} well */
  addWell(well) { this.wells.push(well); }

  /** @param {import('./particle-emitter').ParticleEmitter} emitter */
  addEmitter(emitter) { this.emitters.push(emitter); }

  /**
   * Advance simulation by `dt` seconds.
   *
   * @param {number} dt - Delta time in seconds
   * @returns {{
   *   positions: Float32Array,
   *   colors: Float32Array,
   *   aliveCount: number,
   *   orbitCount: number,
   *   capturedCounts: Map<string, number>,
   *   totalCaptured: number,
   * }}
   */
  step(dt) {
    // 1. Spawn new particles from emitters
    this._spawn(dt);

    // 2. Reset per-well counters
    const capturedCounts = new Map();
    for (const well of this.wells) capturedCounts.set(well.id, 0);

    let orbitCount = 0;
    let aliveCount = 0;

    // 3. Integrate each alive particle
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.states[i] === DEAD) continue;

      aliveCount++;
      const i3 = i * 3;

      // Age and kill old particles
      this.ages[i] += dt;
      if (this.ages[i] > this.maxAge) {
        this._kill(i);
        continue;
      }

      // Skip physics for captured particles (they sit at the well)
      if (this.states[i] === CAPTURED) {
        const wIdx = this.wellIndex[i];
        if (wIdx >= 0 && wIdx < this.wells.length) {
          capturedCounts.set(
            this.wells[wIdx].id,
            (capturedCounts.get(this.wells[wIdx].id) || 0) + 1
          );
        }
        continue;
      }

      // Accumulate gravity from all wells
      _totalForce.set(0, 0, 0);
      const px = this.positions[i3];
      const py = this.positions[i3 + 1];
      const pz = this.positions[i3 + 2];
      _force.set(px, py, pz);

      let wasCaptured = false;

      for (let w = 0; w < this.wells.length; w++) {
        const { force, captured } = this.wells[w].calculateForce(_force.set(px, py, pz));
        if (captured) {
          // Captured — keep at well position (bloom source)
          this.states[i] = CAPTURED;
          this.wellIndex[i] = w;
          this.positions[i3] = this.wells[w].position.x;
          this.positions[i3 + 1] = this.wells[w].position.y;
          this.positions[i3 + 2] = this.wells[w].position.z;
          this.velocities[i3] = 0;
          this.velocities[i3 + 1] = 0;
          this.velocities[i3 + 2] = 0;
          capturedCounts.set(
            this.wells[w].id,
            (capturedCounts.get(this.wells[w].id) || 0) + 1
          );
          wasCaptured = true;
          break;
        }
        _totalForce.add(force);
      }

      if (wasCaptured) continue;

      orbitCount++;

      // Euler integration: v += F * dt, p += v * dt
      this.velocities[i3] = (this.velocities[i3] + _totalForce.x * dt) * this.damping;
      this.velocities[i3 + 1] = (this.velocities[i3 + 1] + _totalForce.y * dt) * this.damping;
      this.velocities[i3 + 2] = (this.velocities[i3 + 2] + _totalForce.z * dt) * this.damping;

      this.positions[i3] += this.velocities[i3] * dt;
      this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
      this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;
    }

    // 4. Update well captured counts
    for (const well of this.wells) {
      well.setCapturedCount(capturedCounts.get(well.id) || 0);
    }

    this.aliveCount = aliveCount;

    let totalCaptured = 0;
    for (const count of capturedCounts.values()) totalCaptured += count;

    return {
      positions: this.positions,
      colors: this.colors,
      aliveCount,
      orbitCount,
      capturedCounts,
      totalCaptured,
    };
  }

  /**
   * Update particle colors by lerping between threshold stops.
   * Intensity is a continuous function of totalCaptured — no jumps.
   *
   * @param {Array<{ threshold: number, color: [number, number, number] }>} rules
   *   Sorted ascending by threshold. Color is [r, g, b] 0–1.
   * @param {number} totalCaptured - Current total captured across all wells
   * @returns {number} Interpolated bloom factor (0–1) for the scene to use
   */
  applyThresholdColors(rules, totalCaptured) {
    if (rules.length === 0) return 0;

    // Find the two stops we're between and lerp
    let lower = rules[0];
    let upper = rules[0];

    for (let i = 0; i < rules.length; i++) {
      if (totalCaptured >= rules[i].threshold) {
        lower = rules[i];
        upper = rules[i + 1] || rules[i]; // clamp to last
      }
    }

    // t = how far between lower and upper (0–1)
    let t = 0;
    if (lower !== upper) {
      const range = upper.threshold - lower.threshold;
      t = range > 0 ? Math.min((totalCaptured - lower.threshold) / range, 1) : 1;
    } else if (totalCaptured >= lower.threshold) {
      t = 1;
    }

    // Lerp color
    const r = lower.color[0] + (upper.color[0] - lower.color[0]) * t;
    const g = lower.color[1] + (upper.color[1] - lower.color[1]) * t;
    const b = lower.color[2] + (upper.color[2] - lower.color[2]) * t;

    // Overexposure multiplier — captured particles push color above 1.0
    // At max threshold: each captured particle emits 3× color → stacks into bloom blowout
    const maxThreshold = rules.length > 0 ? rules[rules.length - 1].threshold : 100;
    const overexpose = 1 + (totalCaptured / maxThreshold) * 2; // 1× → 3×

    // Apply to particles
    for (let i = 0; i < this.maxParticles; i++) {
      const i3 = i * 3;
      if (this.states[i] === CAPTURED) {
        this.colors[i3] = r * overexpose;
        this.colors[i3 + 1] = g * overexpose;
        this.colors[i3 + 2] = b * overexpose;
      } else if (this.states[i] === ORBITING) {
        this.colors[i3] = r * 0.3;
        this.colors[i3 + 1] = g * 0.3;
        this.colors[i3 + 2] = b * 0.3;
      }
    }

    return t; // pass back to scene for bloom interpolation
  }

  /** @private — spawn from emitters into dead slots */
  _spawn(dt) {
    for (const emitter of this.emitters) {
      const spawned = emitter.update(dt);
      for (const { position, velocity } of spawned) {
        const slot = this._findDeadSlot();
        if (slot === -1) break; // buffer full

        const i3 = slot * 3;
        this.positions[i3] = position.x;
        this.positions[i3 + 1] = position.y;
        this.positions[i3 + 2] = position.z;
        this.velocities[i3] = velocity.x;
        this.velocities[i3 + 1] = velocity.y;
        this.velocities[i3 + 2] = velocity.z;
        this.states[slot] = ORBITING;
        this.ages[slot] = 0;
        this.wellIndex[slot] = -1;
      }
    }
  }

  /** @private */
  _kill(i) {
    this.states[i] = DEAD;
    this.ages[i] = 0;
    this.wellIndex[i] = -1;
    const i3 = i * 3;
    this.positions[i3] = 0;
    this.positions[i3 + 1] = 0;
    this.positions[i3 + 2] = 0;
    this.colors[i3] = 0;
    this.colors[i3 + 1] = 0;
    this.colors[i3 + 2] = 0;
  }

  /** @private — linear scan for first dead slot */
  _findDeadSlot() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.states[i] === DEAD) return i;
    }
    return -1;
  }
}
