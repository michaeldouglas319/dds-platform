import * as THREE from 'three';
import { SCENE_CONFIG } from './scene.config';
import { StateMachineInstance } from './stateMachine';

/**
 * PHYSICS TRANSITION MANAGER
 * Handles smooth handoff from keyframe animation to physics simulation
 * Manages the critical takeoff → orbit transition
 */

export interface PhysicsBody {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  drag: number;
  angularVelocity: THREE.Vector3;
  orientation: THREE.Quaternion;
}

export interface TransitionZone {
  id: string;
  center: THREE.Vector3;
  radius: number;
  type: 'takeoff' | 'orbit_entry' | 'orbit_exit' | 'landing';
  physicsEnabled: boolean;
  blendDuration: number;
}

export class PhysicsTransitionManager {
  private physicsBodies = new Map<string, PhysicsBody>();
  private transitionZones: TransitionZone[] = [];
  private activeTransitions = new Map<string, TransitionState>();

  constructor() {
    this.initializeTransitionZones();
  }

  /**
   * Initialize transition zones from scene config
   */
  private initializeTransitionZones(): void {
    // Takeoff transition zone
    this.transitionZones.push({
      id: 'takeoff-transition',
      center: new THREE.Vector3(50, SCENE_CONFIG.physics.takeoff.transitionAltitude, 30),
      radius: 20,
      type: 'takeoff',
      physicsEnabled: true,
      blendDuration: SCENE_CONFIG.physics.takeoff.physicsBlendDuration,
    });

    // Orbit entry zones for each fleet
    Object.values(SCENE_CONFIG.fleets).forEach(fleet => {
      this.transitionZones.push({
        id: `orbit-entry-${fleet.id}`,
        center: new THREE.Vector3(...fleet.orbit.center),
        radius: fleet.orbit.radius * 0.8, // Entry zone is 80% of orbit radius
        type: 'orbit_entry',
        physicsEnabled: true,
        blendDuration: 3.0,
      });
    });
  }

  /**
   * Begin physics transition for an instance
   */
  beginTransition(instance: StateMachineInstance): void {
    const body: PhysicsBody = {
      id: instance.id,
      position: instance.position.clone(),
      velocity: instance.velocity.clone(), // Use current velocity for smooth handoff
      acceleration: new THREE.Vector3(0, -SCENE_CONFIG.physics.orbit.gravitationalConstant, 0),
      mass: 1000, // kg (aircraft mass)
      drag: 0.1,
      angularVelocity: new THREE.Vector3(0, 0, 0),
      orientation: new THREE.Quaternion().setFromEuler(instance.orientation),
    };

    this.physicsBodies.set(instance.id, body);

    // Initialize transition state with current motion
    const transitionState: TransitionState = {
      instanceId: instance.id,
      startTime: Date.now(),
      blendFactor: 0,
      animationPosition: instance.position.clone(),
      animationVelocity: instance.velocity.clone(),
      physicsPosition: instance.position.clone(),
      physicsVelocity: instance.velocity.clone(), // Start with current velocity
    };

    this.activeTransitions.set(instance.id, transitionState);
  }

  /**
   * Update physics simulation
   */
  update(deltaTime: number): void {
    // Update active transitions
    for (const [instanceId, transition] of this.activeTransitions) {
      this.updateTransition(instanceId, transition, deltaTime);
    }

    // Update physics bodies
    for (const body of this.physicsBodies.values()) {
      this.updatePhysicsBody(body, deltaTime);
    }
  }

  /**
   * Check if instance should enter physics transition
   */
  shouldBeginTransition(instance: StateMachineInstance): boolean {
    const zone = this.getTransitionZoneForInstance(instance);
    if (!zone) return false;

    return instance.position.distanceTo(zone.center) <= zone.radius;
  }

  /**
   * Get final blended position for rendering
   */
  getBlendedPosition(instanceId: string): THREE.Vector3 {
    const transition = this.activeTransitions.get(instanceId);
    const body = this.physicsBodies.get(instanceId);

    if (!transition || !body) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Blend between animation and physics
    const animationPos = transition.animationPosition;
    const physicsPos = body.position;
    const blendFactor = transition.blendFactor;

    return animationPos.clone().lerp(physicsPos, blendFactor);
  }

  /**
   * Get final blended velocity for effects
   */
  getBlendedVelocity(instanceId: string): THREE.Vector3 {
    const transition = this.activeTransitions.get(instanceId);
    const body = this.physicsBodies.get(instanceId);

    if (!transition || !body) {
      return new THREE.Vector3(0, 0, 0);
    }

    const animationVel = transition.animationVelocity;
    const physicsVel = body.velocity;
    const blendFactor = transition.blendFactor;

    return animationVel.clone().lerp(physicsVel, blendFactor);
  }

  /**
   * Check if transition is complete
   */
  isTransitionComplete(instanceId: string): boolean {
    const transition = this.activeTransitions.get(instanceId);
    return transition ? transition.blendFactor >= 1.0 : false;
  }

  /**
   * End transition and hand off fully to physics
   */
  endTransition(instanceId: string): void {
    this.activeTransitions.delete(instanceId);
    // Keep physics body active for orbital mechanics
  }

  private updateTransition(instanceId: string, transition: TransitionState, deltaTime: number): void {
    const zone = this.getTransitionZoneForInstanceId(instanceId);
    if (!zone) return;

    // Update blend factor
    const elapsed = (Date.now() - transition.startTime) / 1000;
    transition.blendFactor = Math.min(elapsed / zone.blendDuration, 1.0);

    // Update animation state (continuing from last known)
    transition.animationPosition.add(
      transition.animationVelocity.clone().multiplyScalar(deltaTime)
    );

    // Update physics state
    const body = this.physicsBodies.get(instanceId);
    if (body) {
      transition.physicsPosition.copy(body.position);
      transition.physicsVelocity.copy(body.velocity);
    }
  }

  private updatePhysicsBody(body: PhysicsBody, deltaTime: number): void {
    // Apply gravitational acceleration
    body.acceleration.y = -SCENE_CONFIG.physics.orbit.gravitationalConstant;

    // Apply drag
    const dragForce = body.velocity.clone().multiplyScalar(-body.drag);
    body.acceleration.add(dragForce.divideScalar(body.mass));

    // Integrate velocity
    body.velocity.add(body.acceleration.clone().multiplyScalar(deltaTime));

    // Clamp orbital velocity
    const speed = body.velocity.length();
    if (speed > SCENE_CONFIG.physics.orbit.maxSpeed) {
      body.velocity.normalize().multiplyScalar(SCENE_CONFIG.physics.orbit.maxSpeed);
    }

    // Integrate position
    body.position.add(body.velocity.clone().multiplyScalar(deltaTime));

    // Apply orbital constraints
    this.applyOrbitalConstraints(body);

    // Update orientation based on velocity
    this.updateOrientation(body, deltaTime);
  }

  private applyOrbitalConstraints(body: PhysicsBody): void {
    // Find nearest fleet orbit
    let nearestOrbit: { center: THREE.Vector3; radius: number; altitude: number } | null = null;
    let minDistance = Infinity;

    for (const fleet of Object.values(SCENE_CONFIG.fleets)) {
      const center = new THREE.Vector3(...fleet.orbit.center);
      const distance = body.position.distanceTo(center);
      if (distance < minDistance) {
        minDistance = distance;
        nearestOrbit = {
          center,
          radius: fleet.orbit.radius,
          altitude: fleet.orbit.altitude,
        };
      }
    }

    if (!nearestOrbit) return;

    const center = nearestOrbit.center;
    const targetRadius = nearestOrbit.radius;
    const targetAltitude = nearestOrbit.altitude;

    // Constrain to orbital altitude
    const currentAltitude = body.position.y;
    if (Math.abs(currentAltitude - targetAltitude) > 5) {
      body.position.y += (targetAltitude - currentAltitude) * 0.1; // Smooth altitude correction
    }

    // Apply orbital centripetal force
    const toCenter = center.clone().sub(body.position);
    const distance = toCenter.length();

    if (distance > 0) {
      const centripetalAcceleration = SCENE_CONFIG.physics.orbit.avoidanceStrength;
      const centripetalForce = toCenter.normalize().multiplyScalar(centripetalAcceleration);
      body.acceleration.add(centripetalForce);
    }

    // Maintain orbital radius
    const radiusError = targetRadius - distance;
    if (Math.abs(radiusError) > 1) {
      const correction = toCenter.normalize().multiplyScalar(radiusError * 0.05);
      body.position.add(correction);
    }
  }

  private updateOrientation(body: PhysicsBody, deltaTime: number): void {
    // Align orientation with velocity vector
    if (body.velocity.lengthSq() > 0.1) {
      const forward = body.velocity.clone().normalize();
      const up = new THREE.Vector3(0, 1, 0);

      // Create rotation matrix from forward and up vectors
      const matrix = new THREE.Matrix4();
      matrix.lookAt(new THREE.Vector3(0, 0, 0), forward, up);

      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(matrix);

      // Smooth interpolation to target orientation
      body.orientation.slerp(targetQuaternion, deltaTime * 2.0);
    }
  }

  private getTransitionZoneForInstance(instance: StateMachineInstance): TransitionZone | null {
    for (const zone of this.transitionZones) {
      if (instance.position.distanceTo(zone.center) <= zone.radius) {
        return zone;
      }
    }
    return null;
  }

  private getTransitionZoneForInstanceId(instanceId: string): TransitionZone | null {
    // Find instance's current position
    const body = this.physicsBodies.get(instanceId);
    if (!body) return null;

    for (const zone of this.transitionZones) {
      if (body.position.distanceTo(zone.center) <= zone.radius) {
        return zone;
      }
    }
    return null;
  }
}

interface TransitionState {
  instanceId: string;
  startTime: number;
  blendFactor: number;
  animationPosition: THREE.Vector3;
  animationVelocity: THREE.Vector3;
  physicsPosition: THREE.Vector3;
  physicsVelocity: THREE.Vector3;
}

// Singleton instance
export const physicsTransitionManager = new PhysicsTransitionManager();