'use client';

import { useRef, useCallback, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PathEvaluator } from '@/lib/threejs/utils/pathSystem';
import { calculatePathOrientation, calculateParticleOrientation } from '../utils/orientationSystem';
import type { HybridParticle, OrbitalMechanicsState } from '../types/path-particle.types';
import {
  calculateOrbitalPosition,
  updateOrbitalAngle,
  createOrbitalMechanicsState,
  shouldTransitionToLanding,
  calculateOrbitalVelocityVector,
} from '../utils/orbitalMechanics';

interface HybridMotionManagerProps {
  particlesRef: MutableRefObject<HybridParticle[]>;
  orbitingParticlesRef?: any; // Reference to ScalableOrbitingParticles for particle transfer
  enabled?: boolean;
}

/**
 * Hybrid Motion Manager
 *
 * Manages particle lifecycle through multiple phases:
 * 1. TAXI: Path-based movement from spawn to runway
 * 2. TAKEOFF: Path-based smooth curve to orbit
 * 3. ORBITING: Physics-based orbital motion with natural variation
 * 4. LANDING: Path-based descent back to spawn
 * 5. LANDED: Particle despawned or reset
 *
 * Uses path system for predictable takeoff/landing, orbital physics for natural motion
 */
export function HybridMotionManager({
  particlesRef,
  orbitingParticlesRef,
  enabled = true,
}: HybridMotionManagerProps) {
  const orbitalMechanicsRef = useRef<Map<number, OrbitalMechanicsState>>(new Map());
  const frameCountRef = useRef(0);

  // Get or create orbital mechanics for a particle
  const getOrbitalMechanics = useCallback(
    (particle: HybridParticle): OrbitalMechanicsState => {
      if (!orbitalMechanicsRef.current.has(particle.id)) {
        orbitalMechanicsRef.current.set(
          particle.id,
          createOrbitalMechanicsState(particle)
        );
      }
      return orbitalMechanicsRef.current.get(particle.id)!;
    },
    []
  );

  // Handle taxi/takeoff phase (path-based)
  const updatePathPhase = useCallback(
    (particle: HybridParticle, delta: number) => {
      if (!particle.pathEvaluator || !particle.takeoffPath) return;

      // Update path progress using total path duration
      const totalDuration = particle.takeoffPath.segments.reduce(
        (sum, seg) => sum + (seg.duration || 1.0),
        0
      );
      particle.pathProgress += delta / totalDuration;

      if (particle.pathProgress >= 1.0) {
        // Transition to orbital phase
        particle.phase = 'orbiting';
        particle.phaseStartTime = performance.now();
        particle.pathProgress = 0;

        // Initialize orbital mechanics
        const mechanics = getOrbitalMechanics(particle);
        // Calculate orbital angle from current position
        const toParticle = particle.position.clone().sub(mechanics.center);
        particle.orbitAngle = Math.atan2(toParticle.z, toParticle.x);
      } else {
        // Get position from path evaluator
        particle.position = particle.pathEvaluator.getPosition(particle.pathProgress);

        // Update orientation from path direction using config-driven orientation system
        const direction = particle.pathEvaluator.getDirection(particle.pathProgress);
        const modelId = particle.modelId || 1; // Default to model 1
        particle.orientation = calculatePathOrientation(direction, modelId);
      }
    },
    [getOrbitalMechanics]
  );

  // Handle orbital phase (physics-based)
  const updateOrbitalPhase = useCallback(
    (particle: HybridParticle, delta: number, time: number, orbitDuration: number) => {
      const mechanics = getOrbitalMechanics(particle);

      // Update orbital angle based on velocity and radius
      particle.orbitAngle = updateOrbitalAngle(particle, mechanics, delta, time);

      // Calculate new position
      particle.position = calculateOrbitalPosition(particle, mechanics, time);

      // Calculate velocity for orientation
      const velocity = calculateOrbitalVelocityVector(particle, mechanics);
      if (velocity.length() > 0) {
        // Use config-driven orientation system for orbital phase
        const modelId = particle.modelId || 1; // Default to model 1
        particle.orientation = calculateParticleOrientation('orbit', modelId, velocity.normalize());
      }

      // Check if should transition to landing
      if (
        particle.landingPath &&
        shouldTransitionToLanding(particle, time, orbitDuration)
      ) {
        particle.phase = 'landing';
        particle.phaseStartTime = time;
        particle.pathEvaluator = new PathEvaluator(particle.landingPath);
        particle.pathProgress = 0;
      }
    },
    [getOrbitalMechanics]
  );

  // Handle landing phase (path-based)
  const updateLandingPhase = useCallback(
    (particle: HybridParticle, delta: number) => {
      if (!particle.pathEvaluator || !particle.landingPath) {
        particle.phase = 'landed';
        particle.visible = false;
        return;
      }

      // Update path progress using total path duration
      const totalDuration = particle.landingPath.segments.reduce(
        (sum, seg) => sum + (seg.duration || 1.0),
        0
      );
      particle.pathProgress += delta / totalDuration;

      if (particle.pathProgress >= 1.0) {
        // Landing complete
        particle.phase = 'landed';
        particle.visible = false;
      } else {
        // Get position from path
        particle.position = particle.pathEvaluator.getPosition(particle.pathProgress);

        // Update orientation from landing direction using config-driven orientation system
        const direction = particle.pathEvaluator.getDirection(particle.pathProgress);
        const modelId = particle.modelId || 1; // Default to model 1
        particle.orientation = calculatePathOrientation(direction, modelId);
      }
    },
    []
  );

  // Main animation loop
  useFrame((state, delta) => {
    if (!enabled || !particlesRef.current) return;

    frameCountRef.current++;
    const time = state.clock.getElapsedTime();
    const particles = particlesRef.current;

    // Update each particle based on its current phase
    particles.forEach((particle, index) => {
      switch (particle.phase) {
        case 'taxi':
        case 'takeoff':
          updatePathPhase(particle, delta);
          break;

        case 'orbiting':
          // Assume 30 second orbits by default
          const orbitDuration = particle.maxLifetime || 30;
          updateOrbitalPhase(particle, delta, time, orbitDuration);
          break;

        case 'landing':
          updateLandingPhase(particle, delta);
          break;

        case 'landed':
          // Particle is done
          particle.visible = false;
          break;
      }
    });

    // Periodically log metrics for debugging
    if (frameCountRef.current % 60 === 0) {
      const activeParticles = particles.filter((p) => p.phase !== 'landed');
      const phaseCount = {
        taxi: activeParticles.filter((p) => p.phase === 'taxi').length,
        takeoff: activeParticles.filter((p) => p.phase === 'takeoff').length,
        orbiting: activeParticles.filter((p) => p.phase === 'orbiting').length,
        landing: activeParticles.filter((p) => p.phase === 'landing').length,
      };

      console.log(`[HybridMotionManager] Frame ${frameCountRef.current}:`, {
        total: particles.length,
        active: activeParticles.length,
        phases: phaseCount,
      });
    }
  });

  return null;
}
