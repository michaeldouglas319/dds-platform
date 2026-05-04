/**
 * V3 Physics Hook
 *
 * Phase 2: Rapier Physics Integration for Orbital Motion
 *
 * Core Rule #3: Orbit Entry Acceptance with seamless velocity matching
 */

import { useCallback } from 'react';
import * as THREE from 'three';
import type { V3Config } from '../config/v3.config';
import {
  calculateOrbitalForces,
  calculateOrbitTangentVelocity,
  checkVelocityAlignment,
} from '../../lib/orbitPhysics';

export interface ParticlePhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: 'takeoff' | 'orbit' | 'landing';
}

export interface PhysicsUpdateResult {
  force: THREE.Vector3;
  shouldTransitionToOrbit: boolean;
  shouldTransitionToLanding: boolean;
}

export interface V3PhysicsState {
  updateParticlePhysics: (
    particle: ParticlePhysicsState,
    deltaTime: number
  ) => PhysicsUpdateResult;
  checkOrbitEntry: (
    position: THREE.Vector3,
    velocity: THREE.Vector3
  ) => { canEnter: boolean; targetVelocity: THREE.Vector3 };
}

/**
 * Hook for managing Rapier physics integration
 */
export function useV3Physics(config: V3Config): V3PhysicsState {
  // Calculate orbital forces and determine phase transitions
  const updateParticlePhysics = useCallback(
    (particle: ParticlePhysicsState, deltaTime: number): PhysicsUpdateResult => {
      const result: PhysicsUpdateResult = {
        force: new THREE.Vector3(0, 0, 0),
        shouldTransitionToOrbit: false,
        shouldTransitionToLanding: false,
      };

      if (particle.phase === 'orbit') {
        // Apply orbital forces (gravity, tangential boost, confinement)
        const forces = calculateOrbitalForces(
          particle.position,
          particle.velocity,
          config.orbit.center,
          config.physics
        );

        result.force = forces.totalForce;
      }

      return result;
    },
    [config.orbit.center, config.physics]
  );

  // Check if particle can enter orbit (velocity alignment check)
  const checkOrbitEntry = useCallback(
    (
      position: THREE.Vector3,
      velocity: THREE.Vector3
    ): { canEnter: boolean; targetVelocity: THREE.Vector3 } => {
      // Calculate target orbit tangent velocity at this position
      const targetVelocity = calculateOrbitTangentVelocity(
        position,
        config.orbit.center,
        config.orbit.nominalSpeed
      );

      // Check if velocity is aligned with orbit tangent
      const isAligned = checkVelocityAlignment(velocity, targetVelocity, Math.PI / 6);

      // Check if within donut bounds
      const distanceFromCenter = position.distanceTo(config.orbit.center);
      const innerRadius = config.physics.orbitRadius - config.physics.donutThickness / 2;
      const outerRadius = config.physics.orbitRadius + config.physics.donutThickness / 2;
      const withinBounds = distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius;

      return {
        canEnter: isAligned && withinBounds,
        targetVelocity,
      };
    },
    [config.orbit.center, config.orbit.nominalSpeed, config.physics]
  );

  return {
    updateParticlePhysics,
    checkOrbitEntry,
  };
}
