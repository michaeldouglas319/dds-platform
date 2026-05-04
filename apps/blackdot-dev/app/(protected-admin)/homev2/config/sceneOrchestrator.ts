import * as THREE from 'three';
import { SCENE_CONFIG } from './scene.config';
import { stateMachineManager, StateMachineInstance } from './stateMachine';
import { physicsTransitionManager } from './physicsTransition';

/**
 * SCENE ORCHESTRATOR
 * Master controller for the entire scene animation and motion system
 * Coordinates state machines, physics transitions, and fleet management
 */

export interface SceneInstance {
  id: string;
  fleetId: string;
  modelId: string;
  stateMachine: StateMachineInstance;
  threeObject?: THREE.Object3D;
  lastUpdate: number;
}

export class SceneOrchestrator {
  private instances: SceneInstance[] = [];
  private clock = new THREE.Clock();
  private isRunning = false;

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * Initialize the scene with configured fleets and models
   */
  async initialize(): Promise<void> {
    console.log('🎬 Initializing Scene Orchestrator...');

    // Create instances for each fleet
    for (const [fleetId, fleet] of Object.entries(SCENE_CONFIG.fleets)) {
      for (let i = 0; i < fleet.particleCount; i++) {
        const spawnPoint = fleet.spawnPoints[i % fleet.spawnPoints.length];
        const modelId = fleet.modelId;

        // Create state machine instance
        const stateMachine = stateMachineManager.createInstance(fleetId, modelId, spawnPoint.id);

        // Create scene instance
        const instance: SceneInstance = {
          id: stateMachine.id,
          fleetId,
          modelId,
          stateMachine,
          lastUpdate: Date.now(),
        };

        this.instances.push(instance);
      }
    }

    console.log(`✅ Created ${this.instances.length} scene instances across ${Object.keys(SCENE_CONFIG.fleets).length} fleets`);
  }

  /**
   * Start the scene animation loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    console.log('▶️ Scene Orchestrator started');
  }

  /**
   * Stop the scene animation loop
   */
  stop(): void {
    this.isRunning = false;
    this.clock.stop();
    console.log('⏹️ Scene Orchestrator stopped');
  }

  /**
   * Update all scene instances (call this in render loop)
   */
  update(): void {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();

    // Update state machines
    stateMachineManager.update(deltaTime);

    // Update physics transitions
    physicsTransitionManager.update(deltaTime);

    // Process state transitions
    this.processStateTransitions();

    // Update instance positions and orientations
    this.updateInstanceTransforms();
  }

  /**
   * Trigger a fleet-wide action
   */
  triggerFleetAction(fleetId: string, action: 'dispatch' | 'recall' | 'hold'): void {
    const fleetInstances = this.instances.filter(inst => inst.fleetId === fleetId);

    fleetInstances.forEach(instance => {
      switch (action) {
        case 'dispatch':
          if (instance.stateMachine.currentState === 'hanger-idle') {
            stateMachineManager.triggerTransition(instance.id, 'dispatch');
          }
          break;

        case 'recall':
          if (['taxi', 'takeoff', 'orbit'].includes(instance.stateMachine.currentState)) {
            stateMachineManager.triggerTransition(instance.id, 'landing_request');
          }
          break;

        case 'hold':
          // Cancel pending transitions
          break;
      }
    });

    console.log(`🎯 Triggered ${action} for fleet ${fleetId} (${fleetInstances.length} instances)`);
  }

  /**
   * Get all instances in a specific state
   */
  getInstancesByState(stateId: string): SceneInstance[] {
    return this.instances.filter(inst =>
      inst.stateMachine.currentState === stateId
    );
  }

  /**
   * Get scene statistics
   */
  getStats(): SceneStats {
    const stats = {
      total: this.instances.length,
      byState: {} as Record<string, number>,
      byFleet: {} as Record<string, number>,
      inPhysicsTransition: 0,
      activeTransitions: 0,
    };

    this.instances.forEach(instance => {
      // Count by state
      const state = instance.stateMachine.currentState;
      stats.byState[state] = (stats.byState[state] || 0) + 1;

      // Count by fleet
      const fleet = instance.fleetId;
      stats.byFleet[fleet] = (stats.byFleet[fleet] || 0) + 1;

      // Count physics transitions
      if (physicsTransitionManager.shouldBeginTransition(instance.stateMachine)) {
        stats.inPhysicsTransition++;
      }
    });

    stats.activeTransitions = physicsTransitionManager.getActiveTransitionCount();

    return stats;
  }

  /**
   * Add event listeners for state machine events
   */
  private initializeEventListeners(): void {
    // Listen for state transitions
    stateMachineManager.onTransition((transition) => {
      console.log(`🔄 State transition: ${transition.instanceId} ${transition.fromState} → ${transition.toState} (${transition.trigger})`);

      // Handle physics transition triggers
      if (transition.trigger === 'physics_transition') {
        const instance = this.instances.find(inst => inst.id === transition.instanceId);
        if (instance) {
          physicsTransitionManager.beginTransition(instance.stateMachine);
        }
      }
    });
  }

  /**
   * Process pending state transitions
   */
  private processStateTransitions(): void {
    this.instances.forEach(instance => {
      // Check for physics transition triggers
      if (physicsTransitionManager.shouldBeginTransition(instance.stateMachine)) {
        stateMachineManager.triggerTransition(instance.id, 'physics_transition');
      }

      // Check for completed physics transitions
      if (physicsTransitionManager.isTransitionComplete(instance.id)) {
        physicsTransitionManager.endTransition(instance.id);
      }
    });
  }

  /**
   * Update Three.js object transforms based on state machine and physics
   */
  private updateInstanceTransforms(): void {
    this.instances.forEach(instance => {
      if (!instance.threeObject) return;

      let position: THREE.Vector3;
      let orientation: THREE.Euler;

      // Check if in physics transition
      if (physicsTransitionManager.isTransitionComplete(instance.id)) {
        // Use physics position
        position = physicsTransitionManager.getBlendedPosition(instance.id);
        // Physics system handles orientation
        const body = physicsTransitionManager.getPhysicsBody(instance.id);
        if (body) {
          orientation = new THREE.Euler().setFromQuaternion(body.orientation);
        } else {
          orientation = instance.stateMachine.orientation;
        }
      } else {
        // Use state machine position
        position = instance.stateMachine.position;
        orientation = instance.stateMachine.orientation;
      }

      // Apply transforms
      instance.threeObject.position.copy(position);
      instance.threeObject.rotation.copy(orientation);
    });
  }
}

interface SceneStats {
  total: number;
  byState: Record<string, number>;
  byFleet: Record<string, number>;
  inPhysicsTransition: number;
  activeTransitions: number;
}

// Extend physics manager with helper methods
declare module './physicsTransition' {
  interface PhysicsTransitionManager {
    getActiveTransitionCount(): number;
    getPhysicsBody(instanceId: string): any;
  }
}

// Singleton instance
export const sceneOrchestrator = new SceneOrchestrator();