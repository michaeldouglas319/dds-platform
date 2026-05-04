import * as THREE from 'three';
import { SCENE_CONFIG, MotionState, FleetConfig, ModelDefinition } from './scene.config';

/**
 * STATE MACHINE MANAGER
 * Manages the complete lifecycle of model motion states
 * Handles transitions between hanger → taxi → takeoff → orbit → landing
 */

export interface StateMachineInstance {
  id: string;
  fleetId: string;
  modelId: string;
  currentState: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  orientation: THREE.Euler;
  targetWaypoint?: string;
  physicsEnabled: boolean;
  lastTransition: number;
}

export interface StateTransition {
  fromState: string;
  toState: string;
  trigger: string;
  timestamp: number;
  instanceId: string;
}

export class StateMachineManager {
  private instances = new Map<string, StateMachineInstance>();
  private transitions: StateTransition[] = [];
  private eventListeners = new Map<string, ((transition: StateTransition) => void)[]>();

  /**
   * Create a new state machine instance for a model
   */
  createInstance(
    fleetId: string,
    modelId: string,
    spawnPointId: string
  ): StateMachineInstance {
    const fleet = SCENE_CONFIG.fleets[fleetId];
    const model = SCENE_CONFIG.models[modelId];
    const spawnPoint = fleet.spawnPoints.find(sp => sp.id === spawnPointId);

    if (!fleet || !model || !spawnPoint) {
      throw new Error(`Invalid configuration: fleet=${fleetId}, model=${modelId}, spawn=${spawnPointId}`);
    }

    const instanceId = `${fleetId}-${modelId}-${Date.now()}`;
    const instance: StateMachineInstance = {
      id: instanceId,
      fleetId,
      modelId,
      currentState: 'hanger-idle',
      position: new THREE.Vector3(...spawnPoint.position),
      velocity: new THREE.Vector3(0, 0, 0),
      orientation: new THREE.Euler(...spawnPoint.orientation),
      physicsEnabled: false,
      lastTransition: Date.now(),
    };

    this.instances.set(instanceId, instance);
    return instance;
  }

  /**
   * Trigger a state transition
   */
  triggerTransition(instanceId: string, trigger: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) return false;

    const currentState = SCENE_CONFIG.motionStates[instance.currentState];
    if (!currentState) return false;

    // Check if trigger is valid for current state
    if (!currentState.exitConditions.triggers.includes(trigger)) {
      return false;
    }

    // Find next state based on trigger
    const nextStateId = this.findNextState(currentState, trigger);
    if (!nextStateId) return false;

    // Perform transition
    const oldState = instance.currentState;
    instance.currentState = nextStateId;
    instance.lastTransition = Date.now();

    // Handle state-specific setup
    this.setupState(instance, nextStateId);

    // Emit transition event
    const transition: StateTransition = {
      fromState: oldState,
      toState: nextStateId,
      trigger,
      timestamp: Date.now(),
      instanceId,
    };

    this.transitions.push(transition);
    this.emit('transition', transition);

    return true;
  }

  /**
   * Update all instances (called each frame)
   */
  update(deltaTime: number): void {
    for (const instance of this.instances.values()) {
      this.updateInstance(instance, deltaTime);
    }
  }

  /**
   * Get all instances in a specific state
   */
  getInstancesByState(stateId: string): StateMachineInstance[] {
    return Array.from(this.instances.values()).filter(inst => inst.currentState === stateId);
  }

  /**
   * Get all instances for a fleet
   */
  getInstancesByFleet(fleetId: string): StateMachineInstance[] {
    return Array.from(this.instances.values()).filter(inst => inst.fleetId === fleetId);
  }

  /**
   * Add event listener for state transitions
   */
  onTransition(listener: (transition: StateTransition) => void): () => void {
    if (!this.eventListeners.has('transition')) {
      this.eventListeners.set('transition', []);
    }
    this.eventListeners.get('transition')!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get('transition')!;
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  private findNextState(currentState: MotionState, trigger: string): string | null {
    // Check explicit next states for this trigger
    for (const nextStateId of currentState.exitConditions.nextStates) {
      const nextState = SCENE_CONFIG.motionStates[nextStateId];
      if (nextState && nextState.entryConditions.triggers.includes(trigger)) {
        return nextStateId;
      }
    }
    return null;
  }

  private setupState(instance: StateMachineInstance, stateId: string): void {
    const state = SCENE_CONFIG.motionStates[stateId];
    if (!state) return;

    const fleet = SCENE_CONFIG.fleets[instance.fleetId];
    const model = SCENE_CONFIG.models[instance.modelId];

    switch (state.type) {
      case 'taxi':
        // Set up taxi path
        instance.targetWaypoint = state.behavior.waypoints?.[0];
        instance.velocity.setLength(state.behavior.speed * fleet.speedMultiplier);
        break;

      case 'takeoff':
        // Enable physics transition
        instance.physicsEnabled = true;
        instance.velocity.set(0, SCENE_CONFIG.physics.takeoff.liftSpeed, state.behavior.speed);
        break;

      case 'orbit':
        // Full physics control
        instance.physicsEnabled = true;
        instance.velocity.setLength(0); // Physics will take over
        break;

      case 'landing':
        // Set up landing approach
        instance.targetWaypoint = state.behavior.waypoints?.[0];
        instance.physicsEnabled = false; // Controlled descent
        break;
    }
  }

  private updateInstance(instance: StateMachineInstance, deltaTime: number): void {
    const state = SCENE_CONFIG.motionStates[instance.currentState];
    if (!state) return;

    const fleet = SCENE_CONFIG.fleets[instance.fleetId];

    // Update based on state type
    switch (state.type) {
      case 'taxi':
        this.updateTaxi(instance, state, fleet, deltaTime);
        break;

      case 'takeoff':
        this.updateTakeoff(instance, state, fleet, deltaTime);
        break;

      case 'orbit':
        this.updateOrbit(instance, state, fleet, deltaTime);
        break;

      case 'landing':
        this.updateLanding(instance, state, fleet, deltaTime);
        break;
    }

    // Check for automatic state transitions
    this.checkAutomaticTransitions(instance);
  }

  private updateTaxi(instance: StateMachineInstance, state: MotionState, fleet: FleetConfig, deltaTime: number): void {
    if (!instance.targetWaypoint) return;

    const waypoint = SCENE_CONFIG.waypoints[instance.targetWaypoint];
    if (!waypoint) return;

    const targetPos = new THREE.Vector3(...waypoint.position);
    const direction = targetPos.clone().sub(instance.position).normalize();

    // Move towards waypoint
    const moveDistance = state.behavior.speed * fleet.speedMultiplier * deltaTime;
    instance.position.add(direction.multiplyScalar(moveDistance));

    // Update orientation to face movement direction (path-based)
    this.updateOrientationFromDirection(instance, direction);

    // Check if reached waypoint
    if (instance.position.distanceTo(targetPos) < 1.0) {
      // Move to next waypoint or trigger transition
      const waypointIndex = state.behavior.waypoints?.indexOf(instance.targetWaypoint!) ?? -1;
      if (waypointIndex >= 0 && waypointIndex < (state.behavior.waypoints?.length ?? 0) - 1) {
        instance.targetWaypoint = state.behavior.waypoints![waypointIndex + 1];
      } else {
        // Reached final waypoint - trigger runway_reached
        this.triggerTransition(instance.id, 'runway_reached');
      }
    }
  }

  private updateTakeoff(instance: StateMachineInstance, state: MotionState, fleet: FleetConfig, deltaTime: number): void {
    if (!instance.targetWaypoint) {
      // No waypoints - use velocity-based orientation
      this.updateOrientationFromVelocity(instance);
    } else {
      // Follow waypoints with fixed orientation (no dynamic pivoting)
      const waypoint = SCENE_CONFIG.waypoints[instance.targetWaypoint];
      if (waypoint) {
        // Use waypoint's fixed orientation if defined, otherwise use velocity-based
        if (waypoint.orientation) {
          this.updateOrientationFromWaypoint(instance, waypoint.orientation);
        } else {
          this.updateOrientationFromVelocity(instance);
        }

        // Check if reached waypoint
        const targetPos = new THREE.Vector3(...waypoint.position);
        if (instance.position.distanceTo(targetPos) < 2.0) {
          const waypointIndex = state.behavior.waypoints?.indexOf(instance.targetWaypoint!) ?? -1;
          if (waypointIndex >= 0 && waypointIndex < (state.behavior.waypoints?.length ?? 0) - 1) {
            instance.targetWaypoint = state.behavior.waypoints![waypointIndex + 1];
          } else {
            // Reached final waypoint - prepare for physics transition
            instance.targetWaypoint = undefined;
          }
        }
      }
    }

    // Accelerate along takeoff path
    const acceleration = SCENE_CONFIG.physics.takeoff.acceleration * deltaTime;
    instance.velocity.add(new THREE.Vector3(0, SCENE_CONFIG.physics.takeoff.liftSpeed * deltaTime, acceleration));

    // Clamp velocity
    instance.velocity.clampLength(0, SCENE_CONFIG.physics.takeoff.maxHeight);

    // Update position
    instance.position.add(instance.velocity.clone().multiplyScalar(deltaTime));

    // Check for physics transition altitude
    if (instance.position.y >= SCENE_CONFIG.physics.takeoff.transitionAltitude) {
      this.triggerTransition(instance.id, 'physics_transition');
    }
  }

  private updateOrbit(instance: StateMachineInstance, state: MotionState, fleet: FleetConfig, deltaTime: number): void {
    // Physics system handles orbital mechanics
    // This is just a placeholder - actual physics would be handled by a separate system
    const orbit = fleet.orbit;
    const center = new THREE.Vector3(...orbit.center);

    // Simple orbital motion (placeholder)
    const angle = (Date.now() * 0.001 * orbit.speed) % (Math.PI * 2);
    instance.position.set(
      center.x + Math.cos(angle) * orbit.radius,
      center.y + orbit.altitude,
      center.z + Math.sin(angle) * orbit.radius
    );
  }

  private updateLanding(instance: StateMachineInstance, state: MotionState, fleet: FleetConfig, deltaTime: number): void {
    // Controlled descent to landing zone
    const landingZone = fleet.landingZones[0]; // Use first landing zone
    const targetPos = new THREE.Vector3(...landingZone.position);

    const direction = targetPos.clone().sub(instance.position).normalize();
    const distance = instance.position.distanceTo(targetPos);

    // Update orientation to face landing direction
    this.updateOrientationFromDirection(instance, direction);

    // Slow down as approaching
    const speed = Math.min(state.behavior.speed, distance * 2);
    instance.position.add(direction.multiplyScalar(speed * deltaTime));

    // Check if landed
    if (distance < 1.0) {
      this.triggerTransition(instance.id, 'landed');
    }
  }

  /**
   * Update instance orientation based on movement direction
   */
  private updateOrientationFromDirection(instance: StateMachineInstance, direction: THREE.Vector3): void {
    // Calculate yaw (Y-axis rotation) to face the direction
    const yaw = Math.atan2(direction.x, direction.z);

    // Smooth orientation changes to prevent jerky movements
    const currentYaw = instance.orientation.y;
    const targetYaw = yaw;

    // Normalize angle difference to [-π, π]
    let angleDiff = targetYaw - currentYaw;
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    // Apply smoothing (adjustable turn rate)
    const turnRate = 2.0; // radians per second
    const maxTurn = turnRate * (1/60); // assuming 60fps
    const clampedTurn = Math.max(-maxTurn, Math.min(maxTurn, angleDiff));

    instance.orientation.y = currentYaw + clampedTurn;
  }

  /**
   * Update instance orientation based on velocity vector
   */
  private updateOrientationFromVelocity(instance: StateMachineInstance): void {
    if (instance.velocity.lengthSq() > 0.1) {
      const direction = instance.velocity.clone().normalize();
      this.updateOrientationFromDirection(instance, direction);
    }
  }

  /**
   * Update instance orientation directly from waypoint orientation values
   */
  private updateOrientationFromWaypoint(instance: StateMachineInstance, waypointOrientation: [number, number, number]): void {
    // Smooth transition to waypoint orientation
    const targetOrientation = new THREE.Euler(...waypointOrientation);

    // Smooth interpolation for each axis
    const lerpFactor = 0.1; // Adjust for smoothness
    instance.orientation.x = THREE.MathUtils.lerp(instance.orientation.x, targetOrientation.x, lerpFactor);
    instance.orientation.y = THREE.MathUtils.lerp(instance.orientation.y, targetOrientation.y, lerpFactor);
    instance.orientation.z = THREE.MathUtils.lerp(instance.orientation.z, targetOrientation.z, lerpFactor);
  }

  private checkAutomaticTransitions(instance: StateMachineInstance): void {
    const state = SCENE_CONFIG.motionStates[instance.currentState];
    if (!state || !state.exitConditions.duration) return;

    const timeInState = Date.now() - instance.lastTransition;
    if (timeInState >= state.exitConditions.duration * 1000) {
      // Time-based transition
      const nextState = state.exitConditions.nextStates[0];
      if (nextState) {
        this.triggerTransition(instance.id, 'timeout');
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }
}

// Singleton instance
export const stateMachineManager = new StateMachineManager();