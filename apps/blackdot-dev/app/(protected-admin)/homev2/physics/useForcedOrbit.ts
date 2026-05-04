'use client';

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';

/**
 * Configuration for force-based orbital mechanics
 */
export interface ForcedOrbitConfig {
  /** Center point of orbit */
  orbitCenter: [number, number, number];

  /** Desired orbital radius (units) */
  orbitRadius: number;

  /** Desired tangential speed (units/second) */
  orbitTargetSpeed: number;

  /** Stiffness of radius correction force (10-50 recommended) */
  orbitStiffness: number;

  /** Acceleration applied to maintain tangential speed (5-20 recommended) */
  orbitAcceleration: number;

  /** Optional altitude variation for visual interest (±2-5 units) */
  altitudeVariation?: number;

  /** Linear damping applied during orbit (0.2-0.5) */
  linearDamping?: number;

  /** Angular damping applied during orbit (0.5-0.9) */
  angularDamping?: number;
}

/**
 * Runtime state for orbital mechanics
 */
export interface OrbitState {
  /** Current distance from orbit center */
  currentRadius: number;

  /** Radius error (currentRadius - desiredRadius) */
  radiusError: number;

  /** Current tangential speed */
  tangentialSpeed: number;

  /** Speed deficit (targetSpeed - currentSpeed) */
  speedDeficit: number;

  /** Centripetal force being applied */
  centripetal: THREE.Vector3;

  /** Tangential force being applied */
  tangential: THREE.Vector3;

  /** Total force magnitude */
  totalForceMagnitude: number;

  /** Whether vehicle is in stable orbit */
  isStable: boolean;
}

/**
 * Hook for physics-based orbital mechanics
 *
 * Replaces mathematical orbit calculations with force-based control:
 * - Centripetal force maintains orbital radius
 * - Tangential acceleration maintains orbital speed
 * - Natural physics simulation handles collision avoidance interaction
 *
 * @example
 * const orbit = useForcedOrbit(rigidBodyRef, config);
 *
 * useFrame(() => {
 *   orbit.updateOrbit();
 *   const state = orbit.getOrbitState();
 *   console.log('Radius error:', state.radiusError);
 * });
 */
// Note: RigidBody from @react-three/rapier is a React component, not a class.
// Using any to work around library type issues.
export function useForcedOrbit(
  rigidBodyRef: React.RefObject<any>,
  config: ForcedOrbitConfig
) {
  const stateRef = useRef<OrbitState>({
    currentRadius: 0,
    radiusError: 0,
    tangentialSpeed: 0,
    speedDeficit: 0,
    centripetal: new THREE.Vector3(),
    tangential: new THREE.Vector3(),
    totalForceMagnitude: 0,
    isStable: false,
  });

  const linearDamping = config.linearDamping ?? 0.3;
  const angularDamping = config.angularDamping ?? 0.7;
  const altitudeVariation = config.altitudeVariation ?? 0;

  /**
   * Update orbital mechanics each frame
   */
  const updateOrbit = useCallback(
    (delta: number = 0.016) => {
      const rb = rigidBodyRef.current;
      if (!rb) return;

      const state = stateRef.current;
      const orbitCenter = new THREE.Vector3(...config.orbitCenter);

      // Get current rigidbody state
      const translation = rb.translation();
      const position = new THREE.Vector3(translation.x, translation.y, translation.z);
      const linvel = rb.linvel();
      const currentVelocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

      // Calculate orbital geometry
      const toCenter = new THREE.Vector3().subVectors(orbitCenter, position);
      const distance = toCenter.length();

      state.currentRadius = distance;
      state.radiusError = distance - config.orbitRadius;

      // PHASE 1: Centripetal Force - maintain orbital radius
      // F_centripetal = k * error * direction_to_center
      const radiusNormal = toCenter.normalize();
      const centripetal = radiusNormal.multiplyScalar(
        state.radiusError * config.orbitStiffness * delta
      );

      state.centripetal = centripetal.clone();

      // PHASE 2: Calculate tangential direction (perpendicular to radius)
      // Using up vector (0, 1, 0) for orbital plane
      const up = new THREE.Vector3(0, 1, 0);
      const tangentDirection = new THREE.Vector3()
        .crossVectors(radiusNormal, up)
        .normalize();

      // Calculate current tangential speed
      const tangentialComponent = currentVelocity.clone().projectOnPlane(radiusNormal);
      state.tangentialSpeed = tangentialComponent.length();

      // PHASE 3: Tangential Acceleration - maintain orbital speed
      // F_tangential = a * deficit * tangent_direction
      state.speedDeficit = Math.max(0, config.orbitTargetSpeed - state.tangentialSpeed);

      const tangential = tangentDirection.multiplyScalar(
        state.speedDeficit * config.orbitAcceleration * delta
      );

      state.tangential = tangential.clone();

      // PHASE 4: Altitude Variation (optional visual interest)
      let altitudeForce = new THREE.Vector3(0, 0, 0);
      if (altitudeVariation > 0) {
        const time = Date.now() * 0.001;
        // Variation depends on position for spatial variation
        const variation = Math.sin(time + position.x * 0.1 + position.z * 0.1);
        const targetAltitude = config.orbitCenter[1] + variation * altitudeVariation;
        const altitudeDiff = targetAltitude - position.y;

        if (Math.abs(altitudeDiff) > 0.1) {
          altitudeForce = new THREE.Vector3(0, altitudeDiff * 10 * delta, 0);
        }
      }

      // Apply all forces
      const totalForce = new THREE.Vector3()
        .add(centripetal)
        .add(tangential)
        .add(altitudeForce);

      state.totalForceMagnitude = totalForce.length();

      rb.addForce(
        {
          x: totalForce.x,
          y: totalForce.y,
          z: totalForce.z,
        },
        true
      );

      // Apply damping for smooth motion
      rb.setLinearDamping(linearDamping);
      rb.setAngularDamping(angularDamping);

      // Determine stability (small radius error + speed near target)
      const radiusErrorThreshold = config.orbitRadius * 0.1; // 10% tolerance
      const speedErrorThreshold = config.orbitTargetSpeed * 0.1; // 10% tolerance

      state.isStable =
        Math.abs(state.radiusError) < radiusErrorThreshold &&
        state.speedDeficit < speedErrorThreshold;
    },
    [config, linearDamping, angularDamping, altitudeVariation]
  );

  /**
   * Get current orbit state
   */
  const getOrbitState = useCallback((): OrbitState => {
    return { ...stateRef.current };
  }, []);

  /**
   * Get diagnostic information
   */
  const getDiagnostics = useCallback(() => {
    const state = stateRef.current;
    return {
      currentRadius: state.currentRadius.toFixed(2),
      targetRadius: config.orbitRadius.toFixed(2),
      radiusError: state.radiusError.toFixed(2),
      radiusErrorPercent: ((state.radiusError / config.orbitRadius) * 100).toFixed(1),
      currentSpeed: state.tangentialSpeed.toFixed(3),
      targetSpeed: config.orbitTargetSpeed.toFixed(3),
      speedDeficit: state.speedDeficit.toFixed(3),
      centripetal: {
        magnitude: state.centripetal.length().toFixed(3),
        x: state.centripetal.x.toFixed(3),
        y: state.centripetal.y.toFixed(3),
        z: state.centripetal.z.toFixed(3),
      },
      tangential: {
        magnitude: state.tangential.length().toFixed(3),
        x: state.tangential.x.toFixed(3),
        y: state.tangential.y.toFixed(3),
        z: state.tangential.z.toFixed(3),
      },
      isStable: state.isStable,
    };
  }, [config.orbitRadius, config.orbitTargetSpeed]);

  /**
   * Calculate required centripetal acceleration
   * Useful for understanding orbital requirements
   */
  const getRequiredCentripetal = useCallback((): number => {
    const v = config.orbitTargetSpeed;
    const r = config.orbitRadius;
    return (v * v) / r; // v²/r centripetal acceleration
  }, [config.orbitRadius, config.orbitTargetSpeed]);

  /**
   * Calculate orbital period (time for one complete orbit)
   * Useful for coordination between vehicles
   */
  const getOrbitalPeriod = useCallback((): number => {
    const circumference = 2 * Math.PI * config.orbitRadius;
    return circumference / config.orbitTargetSpeed; // seconds
  }, [config.orbitRadius, config.orbitTargetSpeed]);

  return {
    // Updates
    updateOrbit,

    // State access
    getOrbitState,
    getDiagnostics,

    // Calculations
    getRequiredCentripetal,
    getOrbitalPeriod,
  };
}

/**
 * Default orbit configuration
 * Suitable for mid-size circular orbits
 */
export const DEFAULT_FORCED_ORBIT_CONFIG: ForcedOrbitConfig = {
  orbitCenter: [0, 20, 0],
  orbitRadius: 30,
  orbitTargetSpeed: 0.5, // 30 units per minute
  orbitStiffness: 20,
  orbitAcceleration: 10,
  altitudeVariation: 0,
  linearDamping: 0.3,
  angularDamping: 0.7,
};

/**
 * Tight orbit configuration (small, fast)
 */
export const TIGHT_ORBIT_CONFIG: ForcedOrbitConfig = {
  orbitCenter: [0, 20, 0],
  orbitRadius: 15,
  orbitTargetSpeed: 0.8,
  orbitStiffness: 30,
  orbitAcceleration: 15,
  altitudeVariation: 0,
  linearDamping: 0.5,
  angularDamping: 0.9,
};

/**
 * Wide orbit configuration (large, slow)
 */
export const WIDE_ORBIT_CONFIG: ForcedOrbitConfig = {
  orbitCenter: [0, 20, 0],
  orbitRadius: 60,
  orbitTargetSpeed: 0.3,
  orbitStiffness: 10,
  orbitAcceleration: 5,
  altitudeVariation: 0,
  linearDamping: 0.2,
  angularDamping: 0.6,
};

/**
 * Scenic orbit configuration (altitude variation enabled)
 */
export const SCENIC_ORBIT_CONFIG: ForcedOrbitConfig = {
  orbitCenter: [0, 20, 0],
  orbitRadius: 40,
  orbitTargetSpeed: 0.4,
  orbitStiffness: 15,
  orbitAcceleration: 8,
  altitudeVariation: 5, // Sine wave variation of ±5 units
  linearDamping: 0.3,
  angularDamping: 0.7,
};
