// ============================================================================
// CPU-SIDE PARTICLE UPDATE LOGIC
// Fallback particle system for WebGL1 and CPU-based updates
// ============================================================================

import * as THREE from 'three';

export interface ParticleState {
  // Position tracking
  position: THREE.Vector3;
  startPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;

  // Physics
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;

  // Life cycle
  age: number;
  lifetime: number;
  life: number;           // 0-1 normalized

  // Morphing
  morphProgress: number;   // 0-1
  targetMeshIndex: number;

  // Rendering
  color: THREE.Color;
  opacity: number;
  scale: number;

  // Flags
  active: boolean;
}

export interface FlowField {
  field: Float32Array;
  dimensions: [number, number, number];
  bounds: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
}

export class ParticleUpdater {
  /**
   * Update particle position and velocity based on physics simulation
   */
  static updateParticlePhysics(
    particle: ParticleState,
    flowField: FlowField | null,
    deltaTime: number,
    config: ParticlePhysicsConfig
  ): void {
    // Calculate direction to target
    const toTarget = particle.targetPosition.clone().sub(particle.position);
    const distanceToTarget = toTarget.length();

    // Direct interpolation path
    let targetDir = toTarget.clone();
    if (distanceToTarget > 0.001) {
      targetDir.normalize();
    }

    // Sample flow field if available
    let flowDir = new THREE.Vector3(0, 0, 0);
    if (flowField && distanceToTarget > 0.1) {
      flowDir = this.sampleFlowField(particle.position, flowField);
    }

    // Blend between direct path and flow field guidance
    const blendedDir = new THREE.Vector3()
      .addVectors(
        targetDir.multiplyScalar(1 - config.flowStrength),
        flowDir.multiplyScalar(config.flowStrength)
      )
      .normalize();

    // Calculate speed based on distance remaining
    const speedFactor = Math.min(distanceToTarget / config.maxDistance, 1.0);
    const speed = config.morphSpeed * speedFactor;

    // Update velocity
    particle.velocity = blendedDir.multiplyScalar(speed);

    // Apply damping/friction
    particle.velocity.multiplyScalar(config.damping);

    // Update position
    particle.position.add(
      particle.velocity.clone().multiplyScalar(deltaTime)
    );

    // Soft boundary constraint (particles don't escape bounds)
    this.constrainToBounds(particle, flowField);
  }

  /**
   * Update particle life and opacity
   */
  static updateParticleLife(
    particle: ParticleState,
    deltaTime: number,
    config: ParticleLifeConfig
  ): void {
    particle.age += deltaTime;
    particle.life = Math.min(particle.age / particle.lifetime, 1.0);

    // Fade out in final portion of lifetime
    if (particle.life > config.fadeOutStart) {
      const fadeRange = 1.0 - config.fadeOutStart;
      const fadeProgress = (particle.life - config.fadeOutStart) / fadeRange;
      particle.opacity = 1.0 - fadeProgress;
    } else {
      particle.opacity = 1.0;
    }

    // Deactivate when life is complete
    if (particle.life >= 1.0) {
      particle.active = false;
    }
  }

  /**
   * Update morphing progress toward target geometry
   */
  static updateMorphing(
    particle: ParticleState,
    deltaTime: number,
    totalDuration: number
  ): void {
    particle.morphProgress = Math.min(particle.morphProgress + deltaTime / totalDuration, 1.0);

    // Smoothly interpolate position toward target
    const eased = this.easeInOutCubic(particle.morphProgress);
    const currentPos = particle.position.clone();
    const interpolated = new THREE.Vector3().lerpVectors(
      particle.startPosition,
      particle.targetPosition,
      eased
    );

    // Don't overshoot the interpolated position
    particle.position.copy(interpolated);
  }

  /**
   * Sample flow field at given world position
   */
  static sampleFlowField(position: THREE.Vector3, flowField: FlowField): THREE.Vector3 {
    const { field, dimensions, bounds } = flowField;
    const [width, height, depth] = dimensions;

    // Normalize position to [0, 1] within bounds
    const size = bounds.max.clone().sub(bounds.min);
    const normalized = position
      .clone()
      .sub(bounds.min)
      .divide(size);

    // Clamp to bounds
    normalized.x = Math.max(0, Math.min(1, normalized.x));
    normalized.y = Math.max(0, Math.min(1, normalized.y));
    normalized.z = Math.max(0, Math.min(1, normalized.z));

    // Bilinear interpolation in 3D
    const ix = normalized.x * (width - 1);
    const iy = normalized.y * (height - 1);
    const iz = normalized.z * (depth - 1);

    const x0 = Math.floor(ix);
    const y0 = Math.floor(iy);
    const z0 = Math.floor(iz);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);
    const z1 = Math.min(z0 + 1, depth - 1);

    const fx = ix - x0;
    const fy = iy - y0;
    const fz = iz - z0;

    // Sample 8 corners
    const v000 = this.getFlowFieldSample(field, x0, y0, z0, width, height);
    const v100 = this.getFlowFieldSample(field, x1, y0, z0, width, height);
    const v010 = this.getFlowFieldSample(field, x0, y1, z0, width, height);
    const v110 = this.getFlowFieldSample(field, x1, y1, z0, width, height);
    const v001 = this.getFlowFieldSample(field, x0, y0, z1, width, height);
    const v101 = this.getFlowFieldSample(field, x1, y0, z1, width, height);
    const v011 = this.getFlowFieldSample(field, x0, y1, z1, width, height);
    const v111 = this.getFlowFieldSample(field, x1, y1, z1, width, height);

    // Trilinear interpolation
    const v00 = v000.clone().lerp(v100, fx);
    const v10 = v010.clone().lerp(v110, fx);
    const v01 = v001.clone().lerp(v101, fx);
    const v11 = v011.clone().lerp(v111, fx);

    const v0 = v00.clone().lerp(v10, fy);
    const v1 = v01.clone().lerp(v11, fy);

    return v0.lerp(v1, fz).normalize();
  }

  /**
   * Get flow vector at grid coordinate
   */
  private static getFlowFieldSample(
    field: Float32Array,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ): THREE.Vector3 {
    const idx = (z * height * width + y * width + x) * 3;
    return new THREE.Vector3(field[idx], field[idx + 1], field[idx + 2]);
  }

  /**
   * Constrain particle to flow field bounds
   */
  private static constrainToBounds(particle: ParticleState, flowField: FlowField | null): void {
    if (!flowField) return;

    const { min, max } = flowField.bounds;

    if (particle.position.x < min.x) particle.position.x = min.x;
    if (particle.position.x > max.x) particle.position.x = max.x;
    if (particle.position.y < min.y) particle.position.y = min.y;
    if (particle.position.y > max.y) particle.position.y = max.y;
    if (particle.position.z < min.z) particle.position.z = min.z;
    if (particle.position.z > max.z) particle.position.z = max.z;
  }

  /**
   * Smooth cubic easing function
   */
  private static easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// ============================================================================
// BATCH UPDATE FUNCTION
// ============================================================================

export interface ParticlePhysicsConfig {
  flowStrength: number;       // 0-1, influence of flow field
  morphSpeed: number;         // Velocity magnitude
  maxDistance: number;        // World units
  damping: number;            // Friction 0-1
}

export interface ParticleLifeConfig {
  fadeOutStart: number;       // When to start fading (0-1)
}

/**
 * Update entire particle array in batch
 */
export function batchUpdateParticles(
  particles: ParticleState[],
  flowField: FlowField | null,
  deltaTime: number,
  physicsConfig: ParticlePhysicsConfig,
  lifeConfig: ParticleLifeConfig,
  morphDuration: number
): void {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];

    if (!particle.active) continue;

    // Update physics (position, velocity)
    ParticleUpdater.updateParticlePhysics(
      particle,
      flowField,
      deltaTime,
      physicsConfig
    );

    // Update life and opacity
    ParticleUpdater.updateParticleLife(particle, deltaTime, lifeConfig);

    // Update morphing progress
    ParticleUpdater.updateMorphing(particle, deltaTime, morphDuration);
  }
}

// ============================================================================
// FLOW FIELD GENERATION
// ============================================================================

export class FlowFieldGenerator {
  /**
   * Generate Perlin noise-based flow field
   */
  static generatePerlinFlowField(
    dimensions: [number, number, number],
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    noiseScale: number = 1.0,
    timeInfluence: number = 0.0
  ): FlowField {
    const [width, height, depth] = dimensions;
    const field = new Float32Array(width * height * depth * 3);

    const size = bounds.max.clone().sub(bounds.min);

    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // World space position
          const px = bounds.min.x + (x / width) * size.x;
          const py = bounds.min.y + (y / height) * size.y;
          const pz = bounds.min.z + (z / depth) * size.z;

          // Sample Perlin noise at this location
          const noise = this.perlin3D(
            px * noiseScale,
            py * noiseScale,
            pz * noiseScale + timeInfluence
          );

          // Calculate gradient (approximate with finite differences)
          const noiseX = this.perlin3D(
            px * noiseScale + 0.01,
            py * noiseScale,
            pz * noiseScale + timeInfluence
          );
          const noiseY = this.perlin3D(
            px * noiseScale,
            py * noiseScale + 0.01,
            pz * noiseScale + timeInfluence
          );
          const noiseZ = this.perlin3D(
            px * noiseScale,
            py * noiseScale,
            pz * noiseScale + 0.01 + timeInfluence
          );

          const idx = (z * height * width + y * width + x) * 3;
          field[idx] = (noiseX - noise) * 10;
          field[idx + 1] = (noiseY - noise) * 10;
          field[idx + 2] = (noiseZ - noise) * 10;
        }
      }
    }

    return { field, dimensions, bounds };
  }

  /**
   * Generate radial flow field (particles move outward from center)
   */
  static generateRadialFlowField(
    dimensions: [number, number, number],
    bounds: { min: THREE.Vector3; max: THREE.Vector3 },
    center: THREE.Vector3,
    strength: number = 1.0
  ): FlowField {
    const [width, height, depth] = dimensions;
    const field = new Float32Array(width * height * depth * 3);

    const size = bounds.max.clone().sub(bounds.min);

    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // World space position
          const px = bounds.min.x + (x / width) * size.x;
          const py = bounds.min.y + (y / height) * size.y;
          const pz = bounds.min.z + (z / depth) * size.z;

          // Direction from center
          const dx = px - center.x;
          const dy = py - center.y;
          const dz = pz - center.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          const idx = (z * height * width + y * width + x) * 3;
          if (dist > 0.001) {
            field[idx] = (dx / dist) * strength;
            field[idx + 1] = (dy / dist) * strength;
            field[idx + 2] = (dz / dist) * strength;
          } else {
            field[idx] = 0;
            field[idx + 1] = 0;
            field[idx + 2] = 0;
          }
        }
      }
    }

    return { field, dimensions, bounds };
  }

  /**
   * Simple 3D Perlin noise implementation
   */
  private static perlin3D(x: number, y: number, z: number): number {
    // Hash-based pseudo-random noise
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);

    const xf = x - xi;
    const yf = y - yi;
    const zf = z - zi;

    // Smoothstep interpolation
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const w = zf * zf * (3 - 2 * zf);

    const n000 = this.hash(xi, yi, zi);
    const n100 = this.hash(xi + 1, yi, zi);
    const n010 = this.hash(xi, yi + 1, zi);
    const n110 = this.hash(xi + 1, yi + 1, zi);
    const n001 = this.hash(xi, yi, zi + 1);
    const n101 = this.hash(xi + 1, yi, zi + 1);
    const n011 = this.hash(xi, yi + 1, zi + 1);
    const n111 = this.hash(xi + 1, yi + 1, zi + 1);

    const n00 = n000 * (1 - u) + n100 * u;
    const n10 = n010 * (1 - u) + n110 * u;
    const n01 = n001 * (1 - u) + n101 * u;
    const n11 = n011 * (1 - u) + n111 * u;

    const n0 = n00 * (1 - v) + n10 * v;
    const n1 = n01 * (1 - v) + n11 * v;

    return n0 * (1 - w) + n1 * w;
  }

  /**
   * Hash function for noise
   */
  private static hash(x: number, y: number, z: number): number {
    let h = 0.5;

    h += Math.sin(x * 12.9898) * 0.5;
    h += Math.sin(y * 78.233) * 0.5;
    h += Math.sin(z * 45.164) * 0.5;

    return Math.abs(Math.sin(h) * 43758.5453);
  }
}
