'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RUNWAY_CONFIG } from '../config/runway.config';
import type { RunwayParticle } from '../types/particle.types';

/**
 * useRapierParticles Hook
 *
 * Manages particle physics using React Three Rapier.
 * Handles state transitions: taxi → takeoff → orbit.
 */
interface UseRapierParticlesProps {
  particlesRef: React.MutableRefObject<RunwayParticle[]>;
  waypointPositions: THREE.Vector3[];
}

const STATE_EMOJI = {
  parked: '🅿️',
  taxiing: '🚗',
  takeoff: '🚀',
  mergingIn: '➡️',
  orbiting: '🌀',
  approaching: '📍',
  landing: '⬇️',
};

export function useRapierParticles({
  particlesRef,
  waypointPositions,
}: UseRapierParticlesProps) {
  const rigidbodiesRef = useRef<Map<string, any>>(new Map());
  const velocityHistoryRef = useRef<Map<string, THREE.Vector3[]>>(new Map());

  useEffect(() => {
    console.log('✅ RapierParticleManager: Kinematic physics system active');
    return () => {
      rigidbodiesRef.current.clear();
      velocityHistoryRef.current.clear();
    };
  }, []);

  useFrame((frameState, delta) => {
    const particles = particlesRef.current;
    const time = frameState.clock.getElapsedTime();
    const config = RUNWAY_CONFIG;

    particles.forEach((particle, idx) => {
      if (particle.scale === 0) return;

      const particleId = `${particle.gateId}-${idx}`;

      switch (particle.state) {
        case 'parked': {
          particle.stateTimer -= delta;
          if (particle.stateTimer <= 0) {
            particle.state = 'taxiing';
            particle.velocity.copy(new THREE.Vector3(0.5, 0, 0));
          }
          break;
        }

        case 'taxiing': {
          // Move along runway (positive X)
          const taxiSpeed = 0.5;
          particle.position.x += taxiSpeed * delta;
          particle.velocity.set(taxiSpeed, 0, 0);

          // Follow waypoints if available
          if (waypointPositions.length > 0) {
            const targetWaypoint = waypointPositions[
              Math.min(0, waypointPositions.length - 1)
            ];
            if (particle.position.distanceTo(targetWaypoint) > 0.5) {
              const direction = new THREE.Vector3()
                .subVectors(targetWaypoint, particle.position)
                .normalize();
              particle.position.addScaledVector(direction, taxiSpeed * delta);
            }
          }

          // Transition to takeoff at runway start
          if (particle.position.x > 10) {
            particle.state = 'takeoff';
            particle.velocity.set(1.0, 0, 0);
          }
          break;
        }

        case 'takeoff': {
          const takeoffConfig = config.takeoff;
          const takeoffSpeed = takeoffConfig.liftSpeed / 100; // Scale down
          const upAccel = takeoffConfig.acceleration / 100;

          // Forward motion
          particle.position.x += takeoffSpeed * delta;
          particle.velocity.x = takeoffSpeed;

          // Upward acceleration
          particle.velocity.y += upAccel * delta;
          particle.position.y += particle.velocity.y * delta;

          // Spread laterally as climb
          const spreadAmount = Math.sin(particle.position.y / 10) * 0.02;
          particle.position.z += spreadAmount * delta;

          // Transition when reaching max height
          if (particle.position.y > takeoffConfig.maxHeight) {
            particle.state = 'mergingIn';
          }
          break;
        }

        case 'mergingIn': {
          // Smooth transition to orbit
          particle.state = 'orbiting';
          break;
        }

        case 'orbiting': {
          // TODO: Phase 4 - Implement orbital mechanics with forces
          // For now, maintain altitude
          particle.position.y = Math.max(30, particle.position.y);
          break;
        }

        case 'approaching': {
          // TODO: Phase 5 - Approach landing
          break;
        }

        case 'landing': {
          // TODO: Phase 5 - Landing sequence
          break;
        }
      }
    });
  });

  // Hook doesn't return anything - it manages state via useFrame
}
