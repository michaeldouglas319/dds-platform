/**
 * Fluid Particle System
 * Particles advected by fluid velocity field for visualization
 */

import * as THREE from 'three';
import type { FluidSolver } from '../physics/fluidSolver';

export interface FluidParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  maxAge: number;
}

export class FluidParticleSystem {
  private particles: FluidParticle[] = [];
  private particleCount: number;
  private solver: FluidSolver | null = null;
  private gridResolution: [number, number, number] = [64, 64, 32];

  // Geometry and positions for Three.js
  private positions: Float32Array;
  private positionAttribute: THREE.BufferAttribute | null = null;
  private particleLifetime: number = 5.0; // seconds

  // Inflow seeding strategy (novel approach)
  private inflowPlane: { x: number; width: number; height: number } = { x: -0.8, width: 0.6, height: 0.8 };
  private baseFlowVelocity: THREE.Vector3 = new THREE.Vector3(0.5, 0, 0); // Base flow direction

  // Model collision avoidance
  private modelCenter: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private modelRadius: number = 0.3; // Approximate model radius for collision detection
  private minDistanceFromModel: number = 0.25; // Minimum distance particles must maintain from model (increased for better collision)

  constructor(particleCount: number) {
    this.particleCount = particleCount;
    this.positions = new Float32Array(particleCount * 3);
    this.initializeParticles();
  }

  /**
   * Novel particle seeding: Inflow plane strategy
   * Particles spawn at an inflow plane upstream of the model
   * This creates natural flow visualization around obstacles
   */
  private initializeParticles(): void {
    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      // Seed particles at inflow plane (upstream of model)
      // This creates natural flow visualization
      const x = this.inflowPlane.x;
      const y = (Math.random() - 0.5) * this.inflowPlane.height;
      const z = (Math.random() - 0.5) * this.inflowPlane.width;

      this.particles.push({
        position: new THREE.Vector3(x, y, z),
        velocity: this.baseFlowVelocity.clone(), // Start with base flow velocity
        age: Math.random() * this.particleLifetime,
        maxAge: this.particleLifetime,
      });
    }

    this.updatePositionArray();
  }

  /**
   * Seed a new particle at the inflow plane
   * Used for respawning dead or stuck particles
   */
  private seedParticleAtInflow(particle: FluidParticle): void {
    const x = this.inflowPlane.x;
    const y = (Math.random() - 0.5) * this.inflowPlane.height;
    const z = (Math.random() - 0.5) * this.inflowPlane.width;

    particle.position.set(x, y, z);
    particle.velocity.copy(this.baseFlowVelocity);
    particle.age = 0;
  }

  public setSolver(solver: FluidSolver): void {
    this.solver = solver;
    this.gridResolution = solver.getGridResolution();
  }

  /**
   * Set model bounds for collision avoidance
   * Prevents particles from clipping through the model
   */
  public setModelBounds(center: THREE.Vector3, radius: number): void {
    this.modelCenter.copy(center);
    this.modelRadius = radius;
    // Use larger safety margin - particles must stay at least 80% of radius away
    // This prevents fast-moving particles from passing through
    this.minDistanceFromModel = radius * 0.8;
  }

  /**
   * Check and correct particle position to prevent model clipping
   * Uses continuous collision detection to catch fast-moving particles
   * Returns true if particle was pushed away from model
   */
  private avoidModelCollision(particle: FluidParticle, previousPosition: THREE.Vector3): boolean {
    const toParticle = particle.position.clone().sub(this.modelCenter);
    const distance = toParticle.length();

    // If particle is too close to model, push it away
    if (distance < this.minDistanceFromModel && distance > 0.001) {
      const pushDirection = toParticle.normalize();
      const pushDistance = this.minDistanceFromModel - distance + 0.1; // Larger buffer
      
      // Push particle away from model
      particle.position.add(pushDirection.multiplyScalar(pushDistance));
      
      // Also adjust velocity to flow around model (tangential component)
      // Remove velocity component toward model, keep only tangential
      const normal = pushDirection;
      const velocity = particle.velocity.clone();
      const towardModel = normal.multiplyScalar(velocity.dot(normal));
      const tangential = velocity.clone().sub(towardModel);
      
      // Strongly bias toward tangential flow
      particle.velocity.lerp(tangential, 0.8);
      
      // Add small outward push to prevent re-entry
      particle.velocity.add(pushDirection.multiplyScalar(0.1));
      
      return true;
    }

    // Continuous collision detection: check if particle path intersects model
    // This catches fast-moving particles that might skip through in one frame
    const movement = particle.position.clone().sub(previousPosition);
    const movementLength = movement.length();
    
    if (movementLength > 0.001) {
      // Check multiple points along the movement path
      const steps = Math.ceil(movementLength / 0.05); // Check every 0.05 units
      const stepSize = 1 / Math.max(1, steps);
      
      for (let t = 0; t <= 1; t += stepSize) {
        const checkPos = previousPosition.clone().add(movement.clone().multiplyScalar(t));
        const toCheck = checkPos.clone().sub(this.modelCenter);
        const checkDistance = toCheck.length();
        
        if (checkDistance < this.minDistanceFromModel) {
          // Particle path intersects model - push it away
          const pushDir = toCheck.normalize();
          const safePos = this.modelCenter.clone().add(pushDir.multiplyScalar(this.minDistanceFromModel + 0.1));
          particle.position.copy(safePos);
          
          // Redirect velocity tangentially
          const normal = pushDir;
          const velocity = particle.velocity.clone();
          const towardModel = normal.multiplyScalar(velocity.dot(normal));
          const tangential = velocity.clone().sub(towardModel);
          particle.velocity.lerp(tangential, 0.9);
          particle.velocity.add(normal.multiplyScalar(0.15)); // Push away
          
          return true;
        }
      }
    }

    return false;
  }

  public update(dt: number): void {
    if (!this.solver) return;

    const [gx, gy, gz] = this.gridResolution;
    const stuckThreshold = 0.01; // Velocity magnitude below which particle is considered stuck

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Update age
      particle.age += dt;

      // Check distance from model center for collision detection
      const toParticle = particle.position.clone().sub(this.modelCenter);
      const distanceFromModel = toParticle.length();
      
      // Check if particle is stuck (low velocity near model)
      const velocityMagnitude = particle.velocity.length();
      const isStuck = velocityMagnitude < stuckThreshold && distanceFromModel < 0.5;
      
      // Obstacle-aware respawning: Respawn if:
      // 1. Particle is too old
      // 2. Particle is stuck (low velocity near model)
      // 3. Particle has passed downstream (x > 0.9)
      // 4. Particle is too close to model center (likely inside model)
      const tooCloseToModel = distanceFromModel < this.minDistanceFromModel;
      
      if (particle.age > particle.maxAge || isStuck || particle.position.x > 0.9 || tooCloseToModel) {
        this.seedParticleAtInflow(particle);
        continue;
      }

      // Get velocity from fluid field
      // Convert from world space [-1, 1] to grid space [0, gridSize]
      const gridX = Math.max(0.5, Math.min(gx - 1.5, (particle.position.x + 1) * (gx * 0.5)));
      const gridY = Math.max(0.5, Math.min(gy - 1.5, (particle.position.y + 1) * (gy * 0.5)));
      const gridZ = Math.max(0.5, Math.min(gz - 1.5, (particle.position.z + 1) * (gz * 0.5)));

      const velocity = this.solver.getVelocity(gridX, gridY, gridZ);

      // Validate velocity to prevent NaN
      if (!isFinite(velocity.x) || !isFinite(velocity.y) || !isFinite(velocity.z)) {
        // If velocity is invalid, use base flow direction
        velocity.copy(this.baseFlowVelocity);
      }

      // Enhanced velocity blending: stronger influence from fluid field
      // This ensures particles follow the flow more closely
      particle.velocity.lerp(velocity, 0.3); // Increased from 0.1 to 0.3

      // Add base flow bias to prevent stagnation
      // This creates a "wind" effect that keeps particles moving
      const flowBias = this.baseFlowVelocity.clone().multiplyScalar(0.1);
      particle.velocity.add(flowBias);

      // Store previous position for continuous collision detection
      const previousPosition = particle.position.clone();

      // Update position using RK2 integration (more accurate than Euler)
      const v1 = particle.velocity.clone();
      const p2 = particle.position.clone().add(v1.clone().multiplyScalar(dt * 0.5));

      const gridX2 = Math.max(0.5, Math.min(gx - 1.5, (p2.x + 1) * (gx * 0.5)));
      const gridY2 = Math.max(0.5, Math.min(gy - 1.5, (p2.y + 1) * (gy * 0.5)));
      const gridZ2 = Math.max(0.5, Math.min(gz - 1.5, (p2.z + 1) * (gz * 0.5)));
      const v2 = this.solver.getVelocity(gridX2, gridY2, gridZ2);

      // Validate v2 to prevent NaN
      if (!isFinite(v2.x) || !isFinite(v2.y) || !isFinite(v2.z)) {
        v2.copy(this.baseFlowVelocity);
      }

      // RK2 step: use midpoint velocity
      particle.position.add(v2.multiplyScalar(dt));

      // Collision avoidance: prevent particles from clipping through model
      // Use continuous collision detection to catch fast-moving particles
      const wasPushed = this.avoidModelCollision(particle, previousPosition);
      
      // Recalculate distance after potential push
      const newDistanceFromModel = particle.position.clone().sub(this.modelCenter).length();
      
      // If particle was pushed away but still too close, respawn it
      if (wasPushed && newDistanceFromModel < this.minDistanceFromModel * 1.1) {
        // Particle keeps getting too close, respawn it
        this.seedParticleAtInflow(particle);
        continue;
      }
      
      // Additional safety check: if particle is inside model, immediately respawn
      if (newDistanceFromModel < this.modelRadius * 0.5) {
        this.seedParticleAtInflow(particle);
        continue;
      }

      // Clamp to domain (with respawn if out of bounds)
      if (particle.position.x > 1 || particle.position.x < -1 ||
          particle.position.y > 1 || particle.position.y < -1 ||
          particle.position.z > 1 || particle.position.z < -1) {
        this.seedParticleAtInflow(particle);
        continue;
      }
    }

    this.updatePositionArray();
  }

  private updatePositionArray(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const pos = this.particles[i].position;
      this.positions[i * 3] = pos.x;
      this.positions[i * 3 + 1] = pos.y;
      this.positions[i * 3 + 2] = pos.z;
    }
  }

  public getPositions(): Float32Array {
    return this.positions;
  }

  public getPositionAttribute(): THREE.BufferAttribute {
    if (!this.positionAttribute) {
      this.positionAttribute = new THREE.BufferAttribute(this.positions, 3);
    } else {
      this.positionAttribute.needsUpdate = true;
    }
    return this.positionAttribute;
  }

  public getParticleCount(): number {
    return this.particleCount;
  }

  public setParticleCount(count: number): void {
    if (count !== this.particleCount) {
      this.particleCount = count;
      this.positions = new Float32Array(count * 3);
      this.positionAttribute = null;
      this.initializeParticles();
    }
  }

  public reset(): void {
    this.initializeParticles();
  }
}
