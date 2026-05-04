'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';

/**
 * Configuration for collision avoidance system
 */
export interface CollisionAvoidanceConfig {
  /** Sensor radius for detecting nearby objects (units) */
  sensorRadius: number;

  /** Strength of repulsion force (units/frame²) */
  repulsionStrength: number;

  /** Enable predictive collision detection */
  enablePrediction: boolean;

  /** Time ahead to predict collisions (seconds) */
  predictionTime: number;

  /** Damping for avoidance forces (0-1) */
  avoidanceDamping: number;

  /** Maximum avoidance force (prevent overshooting) */
  maxAvoidanceForce: number;
}

/**
 * Information about a detected collision
 */
export interface DetectedCollision {
  /** ID of the other rigidbody (position or some identifier) */
  otherId: string;

  /** Position of the other object */
  otherPosition: THREE.Vector3;

  /** Velocity of the other object */
  otherVelocity: THREE.Vector3;

  /** Distance to the other object */
  distance: number;

  /** Whether this is a predicted collision (future) */
  isPredicted: boolean;

  /** Time until predicted collision (seconds) */
  timeToCollision?: number;
}

/**
 * Avoidance state and metrics
 */
export interface AvoidanceState {
  /** Active collisions detected */
  activeCollisions: DetectedCollision[];

  /** Avoidance force being applied */
  avoidanceForce: THREE.Vector3;

  /** Number of avoided collisions in current session */
  avoidsPerformed: number;

  /** Total distance maintained from nearest object */
  minDistanceToAny: number;

  /** Whether currently in avoidance maneuver */
  isAvoiding: boolean;
}

/**
 * Hook for sensor-based collision avoidance
 *
 * Features:
 * - Real-time collision detection via Rapier contact events
 * - Repulsion force-based avoidance
 * - Predictive collision detection (optional)
 * - Dynamic sensor radius
 *
 * @example
 * const avoidance = useCollisionAvoidance(rigidBodyRef, config);
 *
 * // Track nearby vehicles
 * const updateOtherVehicles = (vehicles: Array<{ position, velocity }>) => {
 *   avoidance.updateNearbyObjects(vehicles);
 * };
 *
 * useFrame(() => {
 *   avoidance.updateAvoidance();
 *   const state = avoidance.getAvoidanceState();
 * });
 */
// Note: RigidBody from @react-three/rapier is a React component, not a class.
// Using any to work around library type issues.
export function useCollisionAvoidance(
  rigidBodyRef: React.RefObject<any>,
  config: CollisionAvoidanceConfig
) {
  const [avoidanceState, setAvoidanceState] = useState<AvoidanceState>({
    activeCollisions: [],
    avoidanceForce: new THREE.Vector3(),
    avoidsPerformed: 0,
    minDistanceToAny: Infinity,
    isAvoiding: false,
  });

  const nearbyObjectsRef = useRef<
    Array<{ id: string; position: THREE.Vector3; velocity: THREE.Vector3 }>
  >([]);

  /**
   * Update list of nearby objects to check for collisions
   * This should be called with active vehicles in the scene
   */
  const updateNearbyObjects = useCallback(
    (objects: Array<{ id: string; position: THREE.Vector3; velocity: THREE.Vector3 }>) => {
      nearbyObjectsRef.current = objects;
    },
    []
  );

  /**
   * Check for collisions with nearby objects
   */
  const detectCollisions = useCallback((): DetectedCollision[] => {
    const rb = rigidBodyRef.current;
    if (!rb) return [];

    const translation = rb.translation();
    const myPos = new THREE.Vector3(translation.x, translation.y, translation.z);
    const myVel = rb.linvel();
    const myVelocity = new THREE.Vector3(myVel.x, myVel.y, myVel.z);

    const collisions: DetectedCollision[] = [];

    nearbyObjectsRef.current.forEach((obj) => {
      const distance = myPos.distanceTo(obj.position);

      // Check immediate collision
      if (distance < config.sensorRadius && distance > 0.1) {
        collisions.push({
          otherId: obj.id,
          otherPosition: obj.position.clone(),
          otherVelocity: obj.velocity.clone(),
          distance,
          isPredicted: false,
        });
      }

      // Check predicted collision
      if (config.enablePrediction) {
        const futureOtherPos = obj.position
          .clone()
          .add(obj.velocity.clone().multiplyScalar(config.predictionTime));

        const futureDistance = myPos.distanceTo(futureOtherPos);

        if (futureDistance < config.sensorRadius && futureDistance < distance) {
          const timeToCollision =
            myVelocity.length() > 0
              ? (config.predictionTime * (distance - futureDistance)) / distance
              : config.predictionTime;

          // Only add if not already in active collisions
          const exists = collisions.some((c) => c.otherId === obj.id);
          if (!exists) {
            collisions.push({
              otherId: obj.id,
              otherPosition: futureOtherPos,
              otherVelocity: obj.velocity.clone(),
              distance: futureDistance,
              isPredicted: true,
              timeToCollision,
            });
          }
        }
      }
    });

    return collisions;
  }, [config.sensorRadius, config.enablePrediction, config.predictionTime]);

  /**
   * Calculate avoidance force from detected collisions
   */
  const calculateAvoidanceForce = useCallback(
    (collisions: DetectedCollision[]): THREE.Vector3 => {
      const rb = rigidBodyRef.current;
      if (!rb || collisions.length === 0) {
        return new THREE.Vector3();
      }

      const translation = rb.translation();
      const myPos = new THREE.Vector3(translation.x, translation.y, translation.z);

      const avoidanceForce = new THREE.Vector3();

      collisions.forEach((collision) => {
        // Repulsion vector (away from other object)
        const repulsion = myPos
          .clone()
          .sub(collision.otherPosition)
          .normalize();

        // Strength decreases with distance (closer = stronger)
        const strength =
          (1 - collision.distance / config.sensorRadius) * config.repulsionStrength;

        // Extra boost for predicted collisions
        const boost = collision.isPredicted ? 1.5 : 1.0;

        // Accumulate force
        avoidanceForce.add(repulsion.multiplyScalar(strength * boost));
      });

      // Cap maximum force
      if (avoidanceForce.length() > config.maxAvoidanceForce) {
        avoidanceForce.normalize().multiplyScalar(config.maxAvoidanceForce);
      }

      return avoidanceForce;
    },
    [config.repulsionStrength, config.sensorRadius, config.maxAvoidanceForce]
  );

  /**
   * Update collision avoidance each frame
   */
  const updateAvoidance = useCallback(
    (delta: number = 0.016) => {
      const rb = rigidBodyRef.current;
      if (!rb) return;

      // Detect collisions
      const collisions = detectCollisions();

      // Calculate avoidance force
      const force = calculateAvoidanceForce(collisions);

      // Apply force if avoidance needed
      if (force.length() > 0.001) {
        rb.addForce(
          {
            x: force.x * delta,
            y: force.y * delta,
            z: force.z * delta,
          },
          true
        );
      }

      // Find minimum distance to any object
      let minDistance = Infinity;
      collisions.forEach((c) => {
        minDistance = Math.min(minDistance, c.distance);
      });

      // Update state
      setAvoidanceState((prev) => ({
        ...prev,
        activeCollisions: collisions,
        avoidanceForce: force,
        isAvoiding: force.length() > 0.01,
        minDistanceToAny: minDistance < Infinity ? minDistance : prev.minDistanceToAny,
        avoidsPerformed:
          force.length() > 0.01 && prev.avoidanceForce.length() <= 0.01
            ? prev.avoidsPerformed + 1
            : prev.avoidsPerformed,
      }));
    },
    [detectCollisions, calculateAvoidanceForce]
  );

  /**
   * Get current avoidance state
   */
  const getAvoidanceState = useCallback((): AvoidanceState => {
    return { ...avoidanceState };
  }, [avoidanceState]);

  /**
   * Get diagnostic information
   */
  const getDiagnostics = useCallback(() => {
    return {
      activeCollisions: avoidanceState.activeCollisions.length,
      avoidanceForceMagnitude: avoidanceState.avoidanceForce.length().toFixed(3),
      isAvoiding: avoidanceState.isAvoiding,
      totalAvoids: avoidanceState.avoidsPerformed,
      minDistance: avoidanceState.minDistanceToAny.toFixed(2),
      detectedObjects: nearbyObjectsRef.current.length,
    };
  }, [avoidanceState]);

  /**
   * Get density of objects around vehicle (0-1)
   */
  const getEnvironmentalDensity = useCallback((): number => {
    if (nearbyObjectsRef.current.length === 0) return 0;

    const rb = rigidBodyRef.current;
    if (!rb) return 0;

    const translation = rb.translation();
    const myPos = new THREE.Vector3(translation.x, translation.y, translation.z);

    let objectsInSensor = 0;
    nearbyObjectsRef.current.forEach((obj) => {
      if (myPos.distanceTo(obj.position) < config.sensorRadius) {
        objectsInSensor++;
      }
    });

    // Normalize based on typical density (e.g., expect 0-10 objects in sensor)
    return Math.min(1, objectsInSensor / 10);
  }, [config.sensorRadius]);

  /**
   * Reset avoidance statistics
   */
  const reset = useCallback(() => {
    setAvoidanceState({
      activeCollisions: [],
      avoidanceForce: new THREE.Vector3(),
      avoidsPerformed: 0,
      minDistanceToAny: Infinity,
      isAvoiding: false,
    });
  }, []);

  return {
    // Updates
    updateNearbyObjects,
    updateAvoidance,

    // Detectors
    detectCollisions,
    calculateAvoidanceForce,

    // State access
    getAvoidanceState,
    getDiagnostics,
    getEnvironmentalDensity,

    // Control
    reset,
  };
}

/**
 * Default avoidance configuration
 */
export const DEFAULT_COLLISION_AVOIDANCE_CONFIG: CollisionAvoidanceConfig = {
  sensorRadius: 15,
  repulsionStrength: 50,
  enablePrediction: true,
  predictionTime: 1.0,
  avoidanceDamping: 0.5,
  maxAvoidanceForce: 200,
};

/**
 * Aggressive avoidance configuration (tight spacing)
 */
export const AGGRESSIVE_AVOIDANCE_CONFIG: CollisionAvoidanceConfig = {
  sensorRadius: 10,
  repulsionStrength: 100,
  enablePrediction: true,
  predictionTime: 0.5,
  avoidanceDamping: 0.7,
  maxAvoidanceForce: 300,
};

/**
 * Conservative avoidance configuration (wide spacing)
 */
export const CONSERVATIVE_AVOIDANCE_CONFIG: CollisionAvoidanceConfig = {
  sensorRadius: 25,
  repulsionStrength: 30,
  enablePrediction: true,
  predictionTime: 2.0,
  avoidanceDamping: 0.3,
  maxAvoidanceForce: 150,
};
