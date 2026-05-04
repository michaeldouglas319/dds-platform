/**
 * V3 Particles Hook
 *
 * Main particle lifecycle manager coordinating all V3 systems
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { V3Config } from '../config/v3.config';
import type { V3TrajectoriesState } from './useV3Trajectories';
import type { V3BlueGatesState } from './useV3BlueGates';
import type { V3PhysicsState } from './useV3Physics';
import type { ParticleGateState } from '../../lib/blueGatePhysics';
import {
  initAssembly,
  initHealth,
  updateAssemblyStep,
  updateHealth,
  updateStats,
  calculateAssemblyVisuals,
  getHealthColor,
  applyDamage,
  transitionParticle,
  createTaxiPath,
  updateTaxiMovement,
} from './useV3Extended';
import type { ExtendedParticle } from '../types/extended';
import { SpatialGrid } from '@/app/(protected-admin)/homev2/utils/spatialGrid';
export type { ExtendedParticle as V3Particle };

export interface V3ParticlesState {
  particles: ExtendedParticle[];
  instanceMatrixRef: React.MutableRefObject<THREE.InstancedMesh | null>;
}

/**
 * Hook for managing particle lifecycle and animation
 */
export function useV3Particles(
  config: V3Config,
  trajectories: V3TrajectoriesState,
  blueGates: V3BlueGatesState,
  physics: V3PhysicsState,
  pointerPositionRef?: React.RefObject<THREE.Vector3 | null>
): V3ParticlesState {
  const particlesRef = useRef<ExtendedParticle[]>([]);
  const instanceMatrixRef = useRef<THREE.InstancedMesh | null>(null);
  const timeRef = useRef(0);
  const spawnTimersRef = useRef<Map<string, number>>(new Map());

  // Spatial grid for O(n) collision detection (enabled by default)
  const spatialGridCellSize = config.performance?.spatialGridCellSize ?? 15;
  const spatialGridRef = useRef<SpatialGrid<ExtendedParticle>>(
    new SpatialGrid<ExtendedParticle>(spatialGridCellSize)
  );

  // Initialize particles array
  useMemo(() => {
    particlesRef.current = [];
    config.sources.forEach((source) => {
      spawnTimersRef.current.set(source.id, 0);
    });
  }, [config.sources]);

  // Main animation loop
  useFrame((_, delta) => {
    if (!trajectories.isReady) return;

    timeRef.current += delta;

    // Spawn new particles
    for (const source of config.sources) {
      const timer = spawnTimersRef.current.get(source.id) || 0;
      if (timer >= source.spawnRate && particlesRef.current.length < config.particleCount) {
        spawnParticle(source.id, config, trajectories);
        spawnTimersRef.current.set(source.id, 0);
      } else {
        spawnTimersRef.current.set(source.id, timer + delta);
      }
    }

    // Update all particles
    updateParticles(delta, config, trajectories, blueGates, physics);

    // Apply collision repulsion
    if (config.collision.enabled) {
      // Update spatial grid for optimized collision detection
      const useSpatialGrid = config.performance?.enableSpatialGrid ?? true;
      if (useSpatialGrid) {
        spatialGridRef.current.update(
          particlesRef.current,
          (particle) => particle.scale > 0 // Filter out invisible particles
        );
      }
      applyCollisionRepulsion(config, useSpatialGrid);
    }

    // Update orientations
    updateOrientations(delta, config);

    // Update instance matrix
    updateInstanceMatrix();
  });

  function spawnParticle(sourceId: string, cfg: V3Config, traj: V3TrajectoriesState) {
    const source = cfg.sources.find((s) => s.id === sourceId);
    if (!source) return;

    const trajectory = traj.trajectories.get(sourceId);
    if (!trajectory) return;

    const particle: ExtendedParticle = {
      id: particlesRef.current.length,
      sourceId,
      position: source.gatePosition.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      phase: cfg.taxiStaging.enabled ? 'spawn' : 'takeoff',

      // Taxi
      taxiProgress: 0,

      // Assembly
      assembly: initAssembly(cfg.assembly.maxSteps, cfg.assembly.advancementMode),

      // Health
      health: initHealth(cfg.health.startingHealth),
      damageHistory: [],

      // Stats
      stats: {
        spawnTime: timeRef.current,
        totalAge: 0,
        totalDistance: 0,
        orbitsCompleted: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        totalDamage: 0,
        totalHealing: 0,
        collisions: 0,
        stepsCompleted: 0,
        assemblyStartTime: timeRef.current,
        phaseHistory: [{
          phase: cfg.taxiStaging.enabled ? 'spawn' : 'takeoff',
          enteredAt: timeRef.current,
          duration: 0,
        }],
      },

      // Visual
      color: (() => {
        let col: THREE.Color;
        let colorSource = '';

        // Priority: source.particleColor > config.assembly.visual.colorStart > fallback
        if (source.particleColor) {
          col = new THREE.Color(source.particleColor);
          colorSource = `source.particleColor('${source.particleColor}')`;
        } else if (config.assembly?.visual?.colorStart) {
          col = new THREE.Color(config.assembly.visual.colorStart);
          colorSource = `config.assembly.visual.colorStart`;
        } else {
          col = new THREE.Color(0x798aa0);
          colorSource = 'fallback(0x798aa0)';
        }

        // Log first few particles per source
        if (particlesRef.current.filter(p => p.sourceId === source.id).length < 2) {
          console.log(`[Particle] Source: ${source.id}, ${colorSource} → 0x${col.getHex().toString(16)}`);
        }
        return col;
      })(),
      scale: source.modelScale,
      emissiveIntensity: 0,

      // Existing
      curveProgress: 0,
      orbitAngle: 0,
      orbitEntryAngle: source.orbitEntryAngle,
      orbitTimeTotal: 0,
      isExitEligible: false,
      quaternion: new THREE.Quaternion(),
      prevVelocity: new THREE.Vector3(0, 0, 0),
      spawnTime: timeRef.current,
    };

    particlesRef.current.push(particle);
  }

  function updateParticles(
    delta: number,
    cfg: V3Config,
    traj: V3TrajectoriesState,
    gates: V3BlueGatesState,
    phys: V3PhysicsState
  ) {
    const particles = particlesRef.current;

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      const trajectory = traj.trajectories.get(particle.sourceId);
      if (!trajectory) continue;

      // Update stats every frame
      updateStats(particle, delta, timeRef.current);

      // Update assembly if enabled
      if (cfg.assembly.enabled && particle.phase === 'orbit') {
        const stepAdvanced = updateAssemblyStep(particle, delta, particle.stats.orbitsCompleted);
        if (stepAdvanced) {
          console.log(`Particle ${particle.id} advanced to step ${particle.assembly.currentStep}`);
        }
      }

      // Update health if enabled
      if (cfg.health.enabled) {
        const isInRegenZone = particle.phase === 'staging';
        updateHealth(particle, delta, isInRegenZone, timeRef.current);

        if (particle.health.isDead) {
          console.log(`Particle ${particle.id} died`);
          particles.splice(i, 1);
          continue;
        }
      }

      // Apply assembly visuals based on mode
      if (cfg.assembly.enabled) {
        const visuals = calculateAssemblyVisuals(particle.assembly, cfg.assembly.visual);
        const mode = cfg.assembly.visual.mode;

        // Apply visuals based on selected mode
        if (mode === 'color' || mode === 'combined') {
          particle.color = visuals.color;
        }
        if (mode === 'glow' || mode === 'combined') {
          // Smooth fade-in for emissive intensity (0.5 second fade)
          const fadeDuration = 0.5;
          if (!particle.emissiveFadeStartTime) {
            particle.emissiveFadeStartTime = timeRef.current;
            particle.targetEmissiveIntensity = visuals.emissive;
          }
          const elapsedFade = timeRef.current - particle.emissiveFadeStartTime;
          const fadeProgress = Math.min(elapsedFade / fadeDuration, 1);
          particle.emissiveIntensity = (particle.targetEmissiveIntensity || 0) * fadeProgress;
        }
        // Scale is always stored for debug visualization (never applied to particle)
        particle.assemblyVisualScale = visuals.scale;
      }

      // Health color visualization is now handled via transparent sphere in V3DebugVisuals
      // (removed direct particle color override to separate health state from particle appearance)

      // Update based on phase
      // Handle taxi phases
      if (particle.phase === 'spawn') {
        // Initialize taxi to staging
        if (cfg.taxiStaging.enabled && !particle.taxiPath) {
          const stagingZone = cfg.taxiStaging.stagingZones[0]; // Use first zone
          particle.taxiPath = createTaxiPath(
            particle.position,
            stagingZone.position,
            cfg.taxiStaging.groundSpeed,
            cfg.taxiStaging.pathSmoothness
          );
          transitionParticle(particle, 'taxi-to-staging', timeRef.current);
        } else {
          // Skip to takeoff if disabled
          transitionParticle(particle, 'takeoff', timeRef.current);
        }
      }

      if (particle.phase === 'taxi-to-staging') {
        const complete = updateTaxiMovement(particle, delta);
        if (complete) {
          // Check if staging zone has capacity (only 1 allowed at a time)
          const stagingZone = cfg.taxiStaging.stagingZones[0];
          const particlesInZone = particles.filter(p =>
            p.phase === 'staging' && p.stagingZoneId === stagingZone?.id
          ).length;

          if (particlesInZone < 1) {
            // Zone available - enter staging
            transitionParticle(particle, 'staging', timeRef.current);
            particle.stagingWaitStart = timeRef.current;
            particle.stagingZoneId = stagingZone?.id;
          } else {
            // Zone occupied - wait in queue (stay in taxi-to-staging phase but stop moving)
            particle.taxiProgress = 1.0; // Stopped at queue position
            // Position in queue (offset behind staging zone)
            const queueOffset = 5.0; // Distance between queue positions
            const queueIndex = particles.filter(p =>
              p.phase === 'taxi-to-staging' && p.taxiProgress === 1.0
            ).length;
            if (stagingZone) {
              particle.position.set(
                stagingZone.position.x - queueOffset * (queueIndex + 1),
                stagingZone.position.y,
                stagingZone.position.z
              );
            }
          }
        }
      }

      if (particle.phase === 'staging') {
        // Wait for minimum time
        const waitTime = cfg.taxiStaging.stagingZones[0]?.waitTime ?? 3.0;
        if (timeRef.current - (particle.stagingWaitStart ?? 0) >= waitTime) {
          // Create path to runway (use gate position as runway)
          const source = cfg.sources.find(s => s.id === particle.sourceId);
          if (source) {
            particle.taxiPath = createTaxiPath(
              particle.position,
              source.gatePosition,
              cfg.taxiStaging.groundSpeed,
              cfg.taxiStaging.pathSmoothness
            );
            particle.taxiProgress = 0;

            // Release staging zone for next particle
            particle.stagingZoneId = undefined;

            transitionParticle(particle, 'taxi-to-runway', timeRef.current);

            // Allow next queued particle to enter staging
            const nextInQueue = particles.find(p =>
              p.phase === 'taxi-to-staging' && p.taxiProgress === 1.0
            );
            if (nextInQueue) {
              const stagingZone = cfg.taxiStaging.stagingZones[0];
              transitionParticle(nextInQueue, 'staging', timeRef.current);
              nextInQueue.stagingWaitStart = timeRef.current;
              nextInQueue.stagingZoneId = stagingZone?.id;
              if (stagingZone) {
                nextInQueue.position.copy(stagingZone.position);
              }
            }
          }
        }
      }

      if (particle.phase === 'taxi-to-runway') {
        const complete = updateTaxiMovement(particle, delta);
        if (complete) {
          transitionParticle(particle, 'runway', timeRef.current);
          setTimeout(() => {
            transitionParticle(particle, 'takeoff', timeRef.current);
          }, 1000); // 1 sec runway wait
        }
      }

      if (particle.phase === 'takeoff') {
        // Follow takeoff curve
        const prevProgress = particle.curveProgress;
        particle.curveProgress = Math.min(1, particle.curveProgress + delta * 0.2);
        particle.position.copy(trajectory.takeoffCurve.getPoint(particle.curveProgress));

        // Update velocity from curve tangent
        if (particle.curveProgress < 1) {
          const tangent = trajectory.takeoffCurve.getTangent(particle.curveProgress);
          particle.velocity.copy(tangent.multiplyScalar(cfg.orbit.nominalSpeed));
        }

        // Check for blue gate attraction
        const gateState: ParticleGateState = {
          phase: 'takeoff',
          curveProgress: particle.curveProgress,
        };
        const attraction = gates.calculateAttraction(
          particle.position,
          gateState,
          particle.sourceId
        );
        if (attraction.isActive) {
          particle.position.add(attraction.force.clone().multiplyScalar(delta));
        }

        // Check orbit entry (smooth handoff from 85% to 95% progress)
        if (particle.curveProgress >= 0.85 && particle.curveProgress < 0.95) {
          // Blend velocity toward orbit tangent during handoff zone
          const handoffProgress = (particle.curveProgress - 0.85) / 0.10; // 0 to 1
          const orbitTangent = phys.checkOrbitEntry(particle.position, particle.velocity);
          particle.velocity.lerp(orbitTangent.targetVelocity, handoffProgress * 0.3); // Gradual blend
        } else if (particle.curveProgress >= 0.95) {
          // Complete transition to orbit
          particle.phase = 'orbit';
          const orbitTangent = phys.checkOrbitEntry(particle.position, particle.velocity);
          particle.velocity.copy(orbitTangent.targetVelocity);
          particle.orbitAngle = particle.orbitEntryAngle;
          // Initialize angle accumulator
          (particle as any)._angleAccumulator = 0;
        }
      } else if (particle.phase === 'orbit') {
        particle.orbitTimeTotal += delta;

        // Apply orbital physics
        const physResult = phys.updateParticlePhysics(
          {
            position: particle.position,
            velocity: particle.velocity,
            phase: 'orbit',
          },
          delta
        );

        // Clamp force magnitude to prevent explosions
        const maxForce = 100.0;
        if (physResult.force.length() > maxForce) {
          physResult.force.normalize().multiplyScalar(maxForce);
        }

        // Apply force to velocity
        particle.velocity.add(physResult.force.clone().multiplyScalar(delta));

        // Apply pointer deflection and speed boost (orbit phase only)
        if (cfg.cursorEvents.enabled && pointerPositionRef?.current && particle.phase === 'orbit') {
          const pointerPos = pointerPositionRef.current;
          const dist = particle.position.distanceTo(pointerPos);
          const influenceRadius = cfg.cursorEvents.influenceRadius;

          if (dist < influenceRadius && dist > 0.1) {
            // Direction away from pointer
            const direction = new THREE.Vector3()
              .subVectors(particle.position, pointerPos)
              .normalize();

            // Distance-based falloff
            const distArea = Math.max(0, influenceRadius - dist);
            const falloff = distArea / influenceRadius; // 0 to 1 (closer = stronger)

            // Deflection force
            const strength = falloff * cfg.cursorEvents.deflectionStrength;
            const variation = 1 + (Math.sin(particle.id * 123.456) * cfg.cursorEvents.deflectionVariation);
            const force = direction.multiplyScalar(strength * variation);
            particle.velocity.add(force.multiplyScalar(delta));

            // Speed boost through pointer (smooth acceleration along velocity direction)
            if (cfg.cursorEvents.speedBoostEnabled) {
              const velocityMag = particle.velocity.length();
              if (velocityMag > 0.01) {
                const boostAmount = falloff * cfg.orbit.nominalSpeed * cfg.cursorEvents.speedBoostMultiplier;
                const velocityDir = particle.velocity.clone().normalize();
                const boostForce = velocityDir.multiplyScalar(boostAmount);
                particle.velocity.add(boostForce.multiplyScalar(delta));
              }
            }
          }
        }

        // Add vertical oscillation force for 3D donut effect (before damping)
        if (cfg.verticalWave.enabled) {
          const toParticle = new THREE.Vector3().subVectors(particle.position, cfg.orbit.center);
          const currentAngle = Math.atan2(toParticle.z, toParticle.x);
          const verticalWaveAmplitude = cfg.physics.donutThickness * cfg.verticalWave.amplitudeMultiplier;
          const targetY = cfg.orbit.center.y + Math.sin(currentAngle * cfg.verticalWave.frequency) * verticalWaveAmplitude;

          // Apply vertical force to reach target Y (with clamping)
          const verticalError = targetY - particle.position.y;
          const verticalForce = THREE.MathUtils.clamp(
            verticalError * cfg.verticalWave.springConstant,
            -20.0,
            20.0
          );
          particle.velocity.y += verticalForce * delta;
        }

        // Apply linear damping (air resistance)
        const dampingFactor = 1.0 - cfg.physics.dampingLinear;
        particle.velocity.multiplyScalar(Math.pow(dampingFactor, delta * 60)); // Frame-rate independent

        // Clamp velocity magnitude to prevent runaway behavior
        const maxVelocity = cfg.orbit.nominalSpeed * 3.0; // Allow 3x nominal speed
        if (particle.velocity.length() > maxVelocity) {
          particle.velocity.normalize().multiplyScalar(maxVelocity);
        }

        // Update position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        // Calculate current angle for tracking and exit eligibility
        const toParticleNow = new THREE.Vector3().subVectors(particle.position, cfg.orbit.center);
        const currentAngleNow = Math.atan2(toParticleNow.z, toParticleNow.x);

        // Calculate angle delta to accumulate total travel (handles wrapping)
        let angleDelta = currentAngleNow - particle.orbitAngle;
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;

        // Store previous angle for next frame
        particle.orbitAngle = currentAngleNow;

        // Accumulate angle traveled in a custom field
        if (!('_angleAccumulator' in particle)) {
          (particle as any)._angleAccumulator = 0;
        }
        (particle as any)._angleAccumulator += Math.abs(angleDelta);

        // Check exit eligibility
        const angleTraveled = (particle as any)._angleAccumulator || 0;
        const meetsAngle = angleTraveled >= cfg.exitRequirements.minAngleTraveled;
        const meetsTime = particle.orbitTimeTotal >= cfg.exitRequirements.minTimeInOrbit;
        const wasEligible = particle.isExitEligible;
        particle.isExitEligible = meetsAngle && meetsTime;

        // Debug: Log when particle becomes eligible
        if (!wasEligible && particle.isExitEligible) {
          console.log(`Particle ${particle.id} now EXIT ELIGIBLE - angle: ${angleTraveled.toFixed(2)}, time: ${particle.orbitTimeTotal.toFixed(2)}s`);
        }

        // STRICT EXIT CRITERIA: Only capture when extremely close to exit point
        if (particle.isExitEligible) {
          const angleTraveled = (particle as any)._angleAccumulator || 0;
          const distToGate = particle.position.distanceTo(trajectory.blueGatePosition);
          const releaseThreshold = cfg.landingTransition.captureDistance; // EXTREMELY strict threshold

          // ATTRACTION ZONE: Pull toward landing transition path (purple curve start)
          if (distToGate < cfg.landingTransition.preLandingDistance) {
            // Strong directional attraction toward the exit gate position
            const toGate = new THREE.Vector3().subVectors(trajectory.blueGatePosition, particle.position);
            const distanceNormalized = Math.max(0.1, distToGate / cfg.landingTransition.preLandingDistance);

            // Attraction strength increases as particle gets closer (quadratic)
            const attractionStrength = (1 - distanceNormalized * distanceNormalized) * cfg.blueGate.exitAttraction.maxStrength;
            const attractionForce = toGate.normalize().multiplyScalar(attractionStrength);

            // Apply STRONG to velocity to overcome orbital momentum
            particle.velocity.add(attractionForce.clone().multiplyScalar(delta * 3.0)); // STRONG pull toward path

            // Gradual braking as particle approaches
            const brakingFactor = 1 - (distanceNormalized * cfg.landingTransition.preLandingSlowdown);
            particle.velocity.multiplyScalar(brakingFactor);

            if (!(particle as any)._transitionPathAttractionLogged) {
              console.log(`Particle ${particle.id} ATTRACTED TO TRANSITION PATH - dist: ${distToGate.toFixed(2)}, strength: ${attractionStrength.toFixed(2)}`);
              (particle as any)._transitionPathAttractionLogged = true;
            }
          }

          // RELEASE CRITERIA: Only transition to landing when EXTREMELY CLOSE
          // If not close enough, particle continues orbiting for another attempt
          if (distToGate < releaseThreshold) {
            console.log(`Particle ${particle.id} RELEASED INTO LANDING - EXTREMELY close to exit (dist: ${distToGate.toFixed(2)} < ${releaseThreshold.toFixed(2)})`);
            particle.phase = 'landing';
            particle.curveProgress = 0;

            // Store current position for smooth blending
            particle.landingStartPosition = particle.position.clone();
            particle.landingTransitionTime = 0;

            // Match landing curve tangent direction
            const landingTangent = trajectory.landingCurve.getTangent(0);
            const targetVelocity = landingTangent.clone().multiplyScalar(cfg.orbit.nominalSpeed * cfg.trajectorySettings.exitLandingSpeed);
            particle.velocity.copy(targetVelocity);

            // Reset attraction flags for next opportunity if needed
            delete (particle as any)._transitionPathAttractionLogged;
            delete (particle as any)._exitAttractionLogged;
            delete (particle as any)._missedExitLogged;
          } else {
            // NOT CLOSE ENOUGH: Continue orbiting, will try again on next pass
            if (!(particle as any)._missedExitLogged) {
              console.log(`Particle ${particle.id} MISSED EXIT - too far from gate (${distToGate.toFixed(2)} > ${releaseThreshold.toFixed(2)}), will retry next orbit`);
              (particle as any)._missedExitLogged = true;
              (particle as any)._transitionPathAttractionLogged = false; // Reset for next pass
            }
          }
        }
      } else if (particle.phase === 'landing') {
        // Update transition timer
        particle.landingTransitionTime = (particle.landingTransitionTime || 0) + delta;

        // Follow landing curve
        particle.curveProgress = Math.min(1, particle.curveProgress + delta * 0.3);

        // Get target position from curve
        const curvePosition = trajectory.landingCurve.getPoint(particle.curveProgress);

        // Smooth position transition from orbit to curve
        if (particle.landingTransitionTime < cfg.landingTransition.blendDuration && particle.landingStartPosition) {
          // Calculate blend factor (0 to 1 over blend duration)
          const blendFactor = particle.landingTransitionTime / cfg.landingTransition.blendDuration;
          const smoothBlend = blendFactor * blendFactor * (3 - 2 * blendFactor); // Smoothstep

          // Blend from start position to curve position
          particle.position.lerpVectors(
            particle.landingStartPosition,
            curvePosition,
            smoothBlend
          );
        } else {
          // Transition complete, follow curve directly
          particle.position.copy(curvePosition);
        }

        // Update velocity from curve tangent for correct orientation
        if (particle.curveProgress < 1) {
          const tangent = trajectory.landingCurve.getTangent(particle.curveProgress);
          particle.velocity.copy(tangent.multiplyScalar(cfg.orbit.nominalSpeed * cfg.trajectorySettings.exitLandingSpeed));
        }

        // Remove when complete
        if (particle.curveProgress >= 1.0) {
          particles.splice(i, 1);
        }
      }
    }
  }

  function updateOrientations(delta: number, cfg: V3Config) {
    const particles = particlesRef.current;
    const mode = cfg.orientation.mode;

    if (mode === 'fixed') return; // Skip orientation updates

    for (const particle of particles) {
      // Skip if velocity is too small
      if (particle.velocity.length() < 0.01) continue;

      if (mode === 'combo' || mode === 'tangent') {
        // Calculate target orientation from velocity
        const forward = particle.velocity.clone().normalize();
        const up = new THREE.Vector3(0, 1, 0);

        // Handle edge case when forward is parallel to up
        let right = new THREE.Vector3().crossVectors(up, forward);
        if (right.length() < 0.01) {
          right.set(1, 0, 0);
        } else {
          right.normalize();
        }

        const correctedUp = new THREE.Vector3().crossVectors(forward, right).normalize();

        // Create target quaternion
        const targetMatrix = new THREE.Matrix4().makeBasis(right, correctedUp, forward);
        const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

        // Banking for combo mode
        if (mode === 'combo' && particle.phase === 'orbit') {
          // Calculate turn rate from velocity change
          const deltaVelocity = new THREE.Vector3().subVectors(particle.velocity, particle.prevVelocity);
          const turnRate = deltaVelocity.length() / delta;

          // Calculate bank angle
          const velocityMag = particle.velocity.length();
          const centrifugalAccel = velocityMag * turnRate;
          let bankAngle = Math.atan2(centrifugalAccel, 9.8) * cfg.orientation.bankMultiplier;

          // Clamp to max bank angle
          const maxBankRad = (cfg.orientation.maxBankAngle * Math.PI) / 180;
          bankAngle = THREE.MathUtils.clamp(bankAngle, -maxBankRad, maxBankRad);

          // Apply banking rotation around forward axis
          const bankQuat = new THREE.Quaternion().setFromAxisAngle(forward, bankAngle);
          targetQuaternion.multiply(bankQuat);
        }

        // Smooth interpolation
        particle.quaternion.slerp(targetQuaternion, 1 - cfg.orientation.tangentSmoothing);
      }

      // Store current velocity for next frame banking calculation
      particle.prevVelocity.copy(particle.velocity);
    }
  }

  /**
   * Collision Detection Algorithms
   */

  interface CollisionResult {
    isColliding: boolean;
    overlap: number;
    normal: THREE.Vector3;
  }

  /**
   * Detect ellipsoid-ellipsoid collision
   * Works by transforming to unit sphere space
   */
  function detectEllipsoidCollision(
    p1: ExtendedParticle,
    p2: ExtendedParticle,
    config: V3Config['collision']
  ): CollisionResult {
    // Apply offset to collision center
    const center1 = p1.position.clone().add(
      new THREE.Vector3(config.offset.x, config.offset.y, config.offset.z)
    );
    const center2 = p2.position.clone().add(
      new THREE.Vector3(config.offset.x, config.offset.y, config.offset.z)
    );

    // Calculate delta vector
    const delta = new THREE.Vector3().subVectors(center1, center2);

    // Prevent division by zero
    if (delta.length() < 0.01) {
      return { isColliding: false, overlap: 0, normal: new THREE.Vector3(1, 0, 0) };
    }

    // Scale delta by inverse dimensions (convert to unit sphere space)
    const scaledDelta = new THREE.Vector3(
      delta.x / config.dimensions.width,
      delta.y / config.dimensions.height,
      delta.z / config.dimensions.depth
    );

    // Distance in scaled space
    const scaledDistance = scaledDelta.length();

    // Collision if scaled distance < 1 (touching in ellipsoid space)
    const isColliding = scaledDistance < 1.0;

    if (!isColliding) {
      return { isColliding: false, overlap: 0, normal: new THREE.Vector3() };
    }

    // Calculate overlap in scaled space
    const overlap = 1.0 - scaledDistance;

    // Normal is the normalized delta in ORIGINAL space
    const normal = delta.normalize();

    return { isColliding, overlap, normal };
  }

  /**
   * Detect squircle-squircle collision
   * Uses superellipsoid distance formula
   */
  function detectSquircleCollision(
    p1: ExtendedParticle,
    p2: ExtendedParticle,
    config: V3Config['collision']
  ): CollisionResult {
    const n = config.squircleExponent ?? 4;

    // Apply offset
    const center1 = p1.position.clone().add(
      new THREE.Vector3(config.offset.x, config.offset.y, config.offset.z)
    );
    const center2 = p2.position.clone().add(
      new THREE.Vector3(config.offset.x, config.offset.y, config.offset.z)
    );

    const delta = new THREE.Vector3().subVectors(center1, center2);

    // Prevent division by zero
    if (delta.length() < 0.01) {
      return { isColliding: false, overlap: 0, normal: new THREE.Vector3(1, 0, 0) };
    }

    // Squircle distance formula: (|x/a|^n + |y/b|^n + |z/c|^n)^(1/n)
    const term_x = Math.pow(Math.abs(delta.x / config.dimensions.width), n);
    const term_y = Math.pow(Math.abs(delta.y / config.dimensions.height), n);
    const term_z = Math.pow(Math.abs(delta.z / config.dimensions.depth), n);

    const squircleDistance = Math.pow(term_x + term_y + term_z, 1 / n);

    const isColliding = squircleDistance < 1.0;

    if (!isColliding) {
      return { isColliding: false, overlap: 0, normal: new THREE.Vector3() };
    }

    const overlap = 1.0 - squircleDistance;

    // Gradient-based normal calculation (approximate)
    const epsilon = 0.001;

    // Helper to calculate squircle distance for gradient
    const calcDist = (dx: number, dy: number, dz: number) => {
      const tx = Math.pow(Math.abs(dx / config.dimensions.width), n);
      const ty = Math.pow(Math.abs(dy / config.dimensions.height), n);
      const tz = Math.pow(Math.abs(dz / config.dimensions.depth), n);
      return Math.pow(tx + ty + tz, 1 / n);
    };

    const gradX = (calcDist(delta.x + epsilon, delta.y, delta.z) - calcDist(delta.x - epsilon, delta.y, delta.z)) / (2 * epsilon);
    const gradY = (calcDist(delta.x, delta.y + epsilon, delta.z) - calcDist(delta.x, delta.y - epsilon, delta.z)) / (2 * epsilon);
    const gradZ = (calcDist(delta.x, delta.y, delta.z + epsilon) - calcDist(delta.x, delta.y, delta.z - epsilon)) / (2 * epsilon);

    const normal = new THREE.Vector3(gradX, gradY, gradZ).normalize();

    return { isColliding, overlap, normal };
  }

  /**
   * Detect box-box collision (AABB)
   * Simple axis-aligned bounding box overlap test
   */
  function detectBoxCollision(
    p1: ExtendedParticle,
    p2: ExtendedParticle,
    config: V3Config['collision']
  ): CollisionResult {
    // Calculate AABB min/max for both particles
    const halfWidth = config.dimensions.width / 2;
    const halfHeight = config.dimensions.height / 2;
    const halfDepth = config.dimensions.depth / 2;

    const center1 = p1.position.clone().add(
      new THREE.Vector3(config.offset.x, config.offset.y, config.offset.z)
    );
    const center2 = p2.position.clone().add(
      new THREE.Vector3(config.offset.x, config.offset.y, config.offset.z)
    );

    const min1 = center1.clone().sub(new THREE.Vector3(halfWidth, halfHeight, halfDepth));
    const max1 = center1.clone().add(new THREE.Vector3(halfWidth, halfHeight, halfDepth));
    const min2 = center2.clone().sub(new THREE.Vector3(halfWidth, halfHeight, halfDepth));
    const max2 = center2.clone().add(new THREE.Vector3(halfWidth, halfHeight, halfDepth));

    // AABB overlap test
    const isColliding = (
      min1.x <= max2.x && max1.x >= min2.x &&
      min1.y <= max2.y && max1.y >= min2.y &&
      min1.z <= max2.z && max1.z >= min2.z
    );

    if (!isColliding) {
      return { isColliding: false, overlap: 0, normal: new THREE.Vector3() };
    }

    // Calculate penetration depth on each axis
    const overlapX = Math.min(max1.x - min2.x, max2.x - min1.x);
    const overlapY = Math.min(max1.y - min2.y, max2.y - min1.y);
    const overlapZ = Math.min(max1.z - min2.z, max2.z - min1.z);

    // Find axis with minimum penetration (collision normal)
    const minOverlap = Math.min(overlapX, overlapY, overlapZ);
    const normal = new THREE.Vector3();

    if (minOverlap === overlapX) {
      normal.set(center1.x > center2.x ? 1 : -1, 0, 0);
    } else if (minOverlap === overlapY) {
      normal.set(0, center1.y > center2.y ? 1 : -1, 0);
    } else {
      normal.set(0, 0, center1.z > center2.z ? 1 : -1);
    }

    // Normalize overlap to 0-1 range (relative to box size)
    const avgDimension = (config.dimensions.width + config.dimensions.height + config.dimensions.depth) / 3;
    const overlap = minOverlap / avgDimension;

    return { isColliding, overlap, normal };
  }

  /**
   * Apply collision/repulsion forces between particles
   * Prevents overlap like shown in screenshot
   *
   * @param cfg - V3 configuration
   * @param useSpatialGrid - Whether to use O(n) spatial grid or O(n²) brute force
   */
  function applyCollisionRepulsion(cfg: V3Config, useSpatialGrid: boolean) {
    const particles = particlesRef.current;
    const { shape, strength, damping, dimensions } = cfg.collision;

    if (useSpatialGrid) {
      // O(n) collision check using spatial grid - scales to 200-300 particles
      // Calculate max collision distance based on shape dimensions
      const maxDimension = Math.max(dimensions.width, dimensions.height, dimensions.depth);
      const collisionRadius = maxDimension * 1.5; // 1.5x for safety margin

      const processedPairs = new Set<string>(); // Track processed pairs to avoid duplicates

      particles.forEach((p1) => {
        if (p1.scale === 0) return; // Skip invisible particles

        // Get nearby particles from spatial grid
        const nearby = spatialGridRef.current.getNearby(
          p1,
          collisionRadius,
          (other) => other.scale > 0 && other !== p1
        );

        nearby.forEach((p2) => {
          // Create unique pair ID to avoid checking same pair twice
          const pairId = p1.id < p2.id ? `${p1.id}-${p2.id}` : `${p2.id}-${p1.id}`;
          if (processedPairs.has(pairId)) return;
          processedPairs.add(pairId);

          // Apply collision detection and response
          applyCollisionBetweenPair(p1, p2, cfg, shape, strength, damping);
        });
      });
    } else {
      // O(n²) collision check - fallback for small particle counts or debugging
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.scale === 0) continue;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (p2.scale === 0) continue;

          // Apply collision detection and response
          applyCollisionBetweenPair(p1, p2, cfg, shape, strength, damping);
        }
      }
    }
  }

  /**
   * Apply collision detection and response between two particles
   * Extracted for reuse between spatial grid and brute force methods
   */
  function applyCollisionBetweenPair(
    p1: ExtendedParticle,
    p2: ExtendedParticle,
    cfg: V3Config,
    shape: V3Config['collision']['shape'],
    strength: number,
    damping: number
  ) {
    // Shape-specific collision detection
    let collisionResult: CollisionResult;
    switch (shape) {
      case 'sphere':
        // Fallback to sphere detection (ellipsoid with equal dimensions)
        collisionResult = detectEllipsoidCollision(p1, p2, cfg.collision);
        break;
      case 'ellipsoid':
        collisionResult = detectEllipsoidCollision(p1, p2, cfg.collision);
        break;
      case 'squircle':
        collisionResult = detectSquircleCollision(p1, p2, cfg.collision);
        break;
      case 'box':
        collisionResult = detectBoxCollision(p1, p2, cfg.collision);
        break;
      default:
        collisionResult = detectEllipsoidCollision(p1, p2, cfg.collision);
    }

    if (collisionResult.isColliding) {
      const { overlap, normal } = collisionResult;

      // Calculate repulsion magnitude (same as before)
      const repulsionMag = overlap * strength;

      // Apply forces along collision normal
      const repulsion = normal.clone().multiplyScalar(repulsionMag);

      // Apply to velocities (not positions directly - more natural)
      p1.velocity.add(repulsion);
      p2.velocity.sub(repulsion);

      // Apply damping to reduce oscillation
      p1.velocity.multiplyScalar(1 - damping);
      p2.velocity.multiplyScalar(1 - damping);

      // Apply collision damage if health system enabled
      if (cfg.health.enabled) {
        applyDamage(p1, cfg.health.damage.collisionDamage, 'collision', timeRef.current, p1.position);
        applyDamage(p2, cfg.health.damage.collisionDamage, 'collision', timeRef.current, p2.position);
        p1.stats.collisions++;
        p2.stats.collisions++;
      }
    }
  }

  function updateInstanceMatrix() {
    if (!instanceMatrixRef.current) return;

    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3();
    const particles = particlesRef.current;

    // Update spawned particles
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Create matrix from position, rotation, and scale
      scale.set(particle.scale, particle.scale, particle.scale);
      matrix.compose(particle.position, particle.quaternion, scale);

      instanceMatrixRef.current.setMatrixAt(i, matrix);
      instanceMatrixRef.current.setColorAt(i, particle.color);
    }

    // Hide unspawned instances by setting their scale to 0
    const zeroScale = new THREE.Vector3(0, 0, 0);
    const hiddenMatrix = new THREE.Matrix4();
    const totalInstances = instanceMatrixRef.current.count;

    for (let i = particles.length; i < totalInstances; i++) {
      hiddenMatrix.compose(
        new THREE.Vector3(0, 0, 0),  // Position (doesn't matter, scale is 0)
        new THREE.Quaternion(),      // Rotation (doesn't matter)
        zeroScale                    // Scale = 0 (invisible)
      );
      instanceMatrixRef.current.setMatrixAt(i, hiddenMatrix);
    }

    instanceMatrixRef.current.instanceMatrix.needsUpdate = true;
    if (instanceMatrixRef.current.instanceColor) {
      instanceMatrixRef.current.instanceColor.needsUpdate = true;
    }
  }

  return {
    particles: particlesRef.current,
    instanceMatrixRef,
  };
}
