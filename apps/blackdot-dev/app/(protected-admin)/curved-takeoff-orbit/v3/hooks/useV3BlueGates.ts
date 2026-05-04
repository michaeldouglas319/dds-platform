/**
 * V3 Blue Gates Hook
 *
 * Phase 3: Blue Gate Attraction System
 *
 * Manages blue gate attraction zones for all sources.
 * Core Rule #2: Blue gates use timed/state-based ATTRACTION (not repulsion).
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { V3Config } from '../config/v3.config';
import type { SourceTrajectories } from './useV3Trajectories';
import {
  createBlueGate,
  calculateEntryAttraction,
  calculateExitAttraction,
  type BlueGateConfig,
  type ParticleGateState,
  type AttractionForce,
} from '../../lib/blueGatePhysics';

export interface BlueGateInstance {
  sourceId: string;
  config: BlueGateConfig;
  entryAngle: number;
}

export interface V3BlueGatesState {
  gates: Map<string, BlueGateInstance>;
  calculateAttraction: (
    particlePosition: THREE.Vector3,
    particleState: ParticleGateState,
    sourceId: string
  ) => AttractionForce;
}

/**
 * Hook for managing blue gate attraction zones
 */
export function useV3BlueGates(
  config: V3Config,
  trajectories: Map<string, SourceTrajectories>
): V3BlueGatesState {
  // Create gate instances for each source
  const gates = useMemo(() => {
    const map = new Map<string, BlueGateInstance>();

    for (const source of config.sources) {
      const trajectory = trajectories.get(source.id);
      if (!trajectory) continue;

      // Create blue gate at orbit entry point
      const gateConfig = createBlueGate(
        config.orbit.center,
        config.orbit.radius,
        source.orbitEntryAngle,
        config.blueGate
      );

      map.set(source.id, {
        sourceId: source.id,
        config: gateConfig,
        entryAngle: source.orbitEntryAngle,
      });
    }

    return map;
  }, [config.sources, config.orbit, config.blueGate, trajectories]);

  // Function to calculate attraction force for a particle
  const calculateAttraction = useMemo(
    () => (
      particlePosition: THREE.Vector3,
      particleState: ParticleGateState,
      sourceId: string
    ): AttractionForce => {
      const gate = gates.get(sourceId);
      if (!gate) {
        return {
          force: new THREE.Vector3(0, 0, 0),
          magnitude: 0,
          isActive: false,
          reason: 'Gate not found',
        };
      }

      // Check phase and apply appropriate attraction
      if (particleState.phase === 'takeoff') {
        // Entry attraction: trajectory → orbit
        return calculateEntryAttraction(particlePosition, particleState, gate.config);
      } else if (particleState.phase === 'orbit') {
        // Exit attraction: orbit → landing
        return calculateExitAttraction(particlePosition, particleState, gate.config);
      }

      // No attraction during landing phase
      return {
        force: new THREE.Vector3(0, 0, 0),
        magnitude: 0,
        isActive: false,
        reason: `No attraction during ${particleState.phase} phase`,
      };
    },
    [gates]
  );

  return {
    gates,
    calculateAttraction,
  };
}
