'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RUNWAY_CONFIG } from '../config/runway.config';
import type { RunwayParticle } from '../types/particle.types';
import { getOrbitPosition, updateOrbitalAngle, generateRandomOrbitalParams } from '@/lib/threejs/utils/orbitalPaths';
import { getOrbitPositionUnified, updateOrbitalAngleUnified } from '@/lib/threejs/utils/unifiedOrbit';
import { orientationFromDirection, orientationFromPoints } from '@/lib/threejs/utils/orientation';

interface ParticleStateManagerProps {
  particlesRef: React.MutableRefObject<RunwayParticle[]>;
  waypointPositions: THREE.Vector3[];
  fleets?: any[]; // Optional fleet config for future enhancements
}

const stateTransitionLog = new Map<string, Set<string>>();

const STATE_COLORS = {
  parked: '#90EE90',      // Light green
  taxiing: '#FFD700',     // Gold
  takeoff: '#FF6347',     // Tomato red
  mergingIn: '#FFA500',   // Orange - transitioning to orbit
  orbiting: '#00BFFF',    // Deep sky blue
  approaching: '#9370DB', // Medium purple
  landing: '#FF8C00',     // Dark orange
};

const STATE_EMOJI = {
  parked: '🅿️',
  taxiing: '🚗',
  takeoff: '🚀',
  mergingIn: '➡️',       // Arrow - merging into orbit
  orbiting: '🌀',
  approaching: '📍',
  landing: '⬇️',
};

const logStateTransition = (particleIdx: number, oldState: string, newState: string, position: THREE.Vector3, originPos: THREE.Vector3) => {
  const key = `particle-${particleIdx}`;
  if (!stateTransitionLog.has(key)) {
    stateTransitionLog.set(key, new Set());
  }
  const transitions = stateTransitionLog.get(key)!;
  const transition = `${oldState}→${newState}`;
  if (!transitions.has(transition)) {
    transitions.add(transition);
    const distFromOrigin = position.distanceTo(originPos);
    const emoji = STATE_EMOJI[newState as keyof typeof STATE_EMOJI] || '❓';
    console.log(
      `%c${emoji} [Particle ${particleIdx}] ${oldState} → ${newState}\n%cPos: [${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}] | Distance from origin: ${distFromOrigin.toFixed(1)}m`,
      `color: ${STATE_COLORS[newState as keyof typeof STATE_COLORS]}; font-weight: bold; font-size: 12px`,
      `color: gray; font-size: 11px`
    );
  }
};

// Calculate collision avoidance force
const getCollisionAvoidance = (particle: RunwayParticle, allParticles: RunwayParticle[], config: typeof RUNWAY_CONFIG): THREE.Vector3 => {
  const avoidanceForce = new THREE.Vector3(0, 0, 0);
  const { avoidanceRadius, avoidanceStrength } = config.collision;

  allParticles.forEach((other) => {
    if (other === particle || other.scale === 0) return;

    const distance = particle.position.distanceTo(other.position);
    if (distance < avoidanceRadius && distance > 0) {
      const repulsion = particle.position.clone().sub(other.position).normalize();
      const strength = (1 - distance / avoidanceRadius) * avoidanceStrength;
      avoidanceForce.add(repulsion.multiplyScalar(strength));
    }
  });

  return avoidanceForce;
};

export function ParticleStateManager({
  particlesRef,
  waypointPositions,
}: ParticleStateManagerProps) {
  const logFrameCountRef = useRef(0);
  const lastLogTimeRef = useRef(0);
  
  useFrame((state, delta) => {
    const config = RUNWAY_CONFIG;
    const particles = particlesRef.current;
    const time = state.clock.getElapsedTime();
    logFrameCountRef.current++;

    particles.forEach((particle, idx) => {
      // Skip particles that aren't spawned yet
      if (particle.scale === 0) return;

      // PARKED state
      if (particle.state === 'parked') {
        particle.stateTimer -= delta;
        if (particle.stateTimer <= 0) {
          logStateTransition(idx, 'parked', 'taxiing', particle.position, particle.originalGatePosition);
          particle.state = 'taxiing';
          particle.targetWaypoint = 0;
          particle.currentWaypoint = 0;
        }
        return;
      }

      // TAXIING state
      if (particle.state === 'taxiing') {
        if (particle.targetWaypoint === null) return;

        const targetPos = waypointPositions[particle.targetWaypoint];
        const direction = targetPos.clone().sub(particle.position);
        const distance = direction.length();

        if (distance > 0.1) {
          particle.position.lerp(targetPos, config.timing.taxiSpeed);
          particle.position.y = 0.1;
          
          // Update orientation to face movement direction
          particle.orientation = orientationFromPoints(particle.position, targetPos);
          particle.velocity.copy(direction.normalize().multiplyScalar(config.timing.taxiSpeed));
        } else {
          // Reached waypoint
          particle.currentWaypoint++;
          if (particle.currentWaypoint >= waypointPositions.length) {
            logStateTransition(idx, 'taxiing', 'takeoff', particle.position, particle.originalGatePosition);
            particle.state = 'takeoff';
            particle.velocity.set(0, config.takeoff.acceleration, config.takeoff.liftSpeed);
            particle.stateTimer = 0;
          } else {
            particle.targetWaypoint = particle.currentWaypoint;
          }
        }
        return;
      }

      // TAKEOFF state - accelerate upward and forward, then speed up toward orbital trajectory
      if (particle.state === 'takeoff') {
        particle.stateTimer += delta;
        
        // Phase 1: Initial acceleration (first 30% of takeoff)
        const takeoffProgress = particle.position.y / config.takeoff.maxHeight;
        const speedMultiplier = 1.0 + takeoffProgress * 2.0; // Speed increases as height increases
        
        // Accelerate upward and forward with increasing speed
        particle.velocity.y += config.takeoff.acceleration * delta * speedMultiplier;
        particle.velocity.z += config.takeoff.liftSpeed * delta * speedMultiplier;
        
        // Log takeoff metrics (every ~0.5 seconds)
        if (time - lastLogTimeRef.current >= 0.5 && idx === 0) {
          const takeoffParticles = particles.filter(p => p.state === 'takeoff' && p.scale > 0);
          if (takeoffParticles.length > 0) {
            const firstTakeoff = takeoffParticles[0];
            const lastTakeoff = takeoffParticles[takeoffParticles.length - 1];
            const firstSpeed = firstTakeoff.velocity.length();
            const lastSpeed = lastTakeoff.velocity.length();
            
            console.log(`[Takeoff] Time: ${time.toFixed(2)}s | ` +
              `First Speed: ${firstSpeed.toFixed(2)} units/s | ` +
              `Last Speed: ${lastSpeed.toFixed(2)} units/s | ` +
              `First Pos: [${firstTakeoff.position.x.toFixed(1)}, ${firstTakeoff.position.y.toFixed(1)}, ${firstTakeoff.position.z.toFixed(1)}] | ` +
              `Last Pos: [${lastTakeoff.position.x.toFixed(1)}, ${lastTakeoff.position.y.toFixed(1)}, ${lastTakeoff.position.z.toFixed(1)}] | ` +
              `Takeoff Count: ${takeoffParticles.length}`);
          }
        }
        
        // Phase 2: Speed boost when approaching max height (last 20% of climb)
        if (takeoffProgress > 0.8) {
          const boostFactor = 1.0 + (takeoffProgress - 0.8) * 5.0; // 1x to 2x speed boost
          particle.velocity.y *= boostFactor;
          particle.velocity.z *= boostFactor;
          
          // Start curving toward orbital trajectory
          const orbitalParams = particle.orbitalParams || generateRandomOrbitalParams(
            config.orbit.center,
            config.orbit.radius,
            config.orbit.speed,
            config.takeoff.maxHeight
          );
          
          if (!particle.orbitalParams) {
            particle.orbitalParams = orbitalParams;
          }
          
          // Calculate direction to orbital center
          const toOrbitCenter = new THREE.Vector3(...config.orbit.center).sub(particle.position);
          const curveStrength = (takeoffProgress - 0.8) * 2.0; // Gradually curve toward orbit
          
          // Add lateral velocity component toward orbital trajectory
          const lateralDirection = toOrbitCenter.normalize();
          lateralDirection.y = 0; // Keep horizontal
          particle.velocity.add(lateralDirection.multiplyScalar(config.takeoff.liftSpeed * curveStrength * delta));
        }
        
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        // Update orientation to face velocity direction
        if (particle.velocity.lengthSq() > 0.01) {
          particle.orientation = orientationFromDirection(particle.velocity.normalize());
        }

        // Transition to mergingIn when reaching max height
        if (particle.position.y >= config.takeoff.maxHeight) {
          // Ensure orbital params exist
          if (!particle.orbitalParams) {
            particle.orbitalParams = generateRandomOrbitalParams(
              config.orbit.center,
              config.orbit.radius,
              config.orbit.speed,
              config.takeoff.maxHeight
            );
          }
          
          const orbitalParams = particle.orbitalParams!;
          particle.orbitAngle = orbitalParams.initialAngle;
          const targetOrbitPos = getOrbitPositionUnified(particle.orbitAngle, orbitalParams, time, 1.0);
          
          // Preserve velocity momentum for smooth transition
          const currentSpeed = particle.velocity.length();
          const toTarget = targetOrbitPos.clone().sub(particle.position);
          const targetDirection = toTarget.normalize();
          
          // Set velocity toward orbital target with momentum preservation
          particle.velocity.copy(targetDirection.multiplyScalar(Math.max(currentSpeed, config.takeoff.liftSpeed * 1.5)));
          
          particle.targetOrbitPosition = targetOrbitPos.clone();
          particle.mergeProgress = 0;
          
          logStateTransition(idx, 'takeoff', 'mergingIn', particle.position, particle.originalGatePosition);
          particle.state = 'mergingIn';
          particle.stateTimer = 0;
        }
        return;
      }

      // MERGING IN state - speed up and smoothly transition from takeoff to orbital trajectory
      if (particle.state === 'mergingIn') {
        particle.stateTimer += delta;
        
        // Ensure orbital params exist
        if (!particle.orbitalParams) {
          particle.orbitalParams = generateRandomOrbitalParams(
            config.orbit.center,
            config.orbit.radius,
            config.orbit.speed,
            config.takeoff.maxHeight
          );
        }
        
        const orbitalParams = particle.orbitalParams!;
        
        // Initialize orbit angle if not set
        if (particle.orbitAngle === undefined) {
          particle.orbitAngle = orbitalParams.initialAngle;
        }
        
        // Accelerate orbit angle update using unified function (particles speed up FAST to match orbital speed)
        const orbitSpeedMultiplier = 1.0 + particle.stateTimer * 5.0; // Faster acceleration: 1x to 6x speed
        const speedMultiplier = Math.min(orbitSpeedMultiplier, 6.0);
        particle.orbitAngle = updateOrbitalAngleUnified(
          particle.orbitAngle,
          orbitalParams,
          delta,
          time,
          speedMultiplier
        );
        
        // Calculate current target orbital position using unified function (updates as orbit moves)
        const currentTargetPos = getOrbitPositionUnified(
          particle.orbitAngle,
          orbitalParams,
          time,
          speedMultiplier
        );
        
        // Store initial target if not set
        if (!particle.targetOrbitPosition) {
          particle.targetOrbitPosition = currentTargetPos.clone();
        }
        
        const mergeDuration = config.timing.mergeToOrbitDuration;
        const progress = Math.min(1.0, particle.stateTimer / mergeDuration);
        
        // Calculate direction to target
        const toTarget = currentTargetPos.clone().sub(particle.position);
        const distanceToTarget = toTarget.length();
        const direction = toTarget.normalize();
        
        // MUCH FASTER speed during merge - particles spread out quickly and join circle
        const baseSpeed = config.takeoff.liftSpeed * 3.0; // Increased base speed
        const speedBoost = 1.0 + progress * 4.0; // 1x to 5x speed increase (faster acceleration)
        const currentSpeed = baseSpeed * speedBoost;
        
        // Use stronger lerp for faster convergence to orbital position
        const lerpStrength = 0.15 + progress * 0.25; // Start at 15%, increase to 40% lerp
        particle.position.lerp(currentTargetPos, lerpStrength);
        
        // Also add direct movement for even faster convergence
        const moveDistance = currentSpeed * delta;
        if (moveDistance < distanceToTarget * 0.5) {
          particle.position.add(direction.multiplyScalar(moveDistance));
        }
        
        // Update velocity to match movement direction
        particle.velocity.copy(direction.multiplyScalar(currentSpeed));
        
        // Update orientation to face movement direction
        if (particle.velocity.lengthSq() > 0.01) {
          particle.orientation = orientationFromDirection(particle.velocity.normalize());
        }
        
        // Update merge progress
        particle.mergeProgress = progress;
        
        // Log merging metrics (every ~0.3 seconds) - track speed-up and trajectory
        if (time - lastLogTimeRef.current >= 0.3 && idx === 0) {
          const mergingParticles = particles.filter(p => p.state === 'mergingIn' && p.scale > 0 && p.orbitalParams);
          if (mergingParticles.length > 0) {
            const firstMerging = mergingParticles[0];
            const lastMerging = mergingParticles[mergingParticles.length - 1];
            const firstSpeed = firstMerging.velocity.length();
            const lastSpeed = lastMerging.velocity.length();
            
            // Calculate orbital speeds
            const firstOrbitalSpeed = firstMerging.orbitalParams ? 
              firstMerging.orbitalParams.speed * (1.0 + Math.sin(time * 0.2 + firstMerging.orbitalParams.noiseOffset * 1.3) * 0.15) : 0;
            const lastOrbitalSpeed = lastMerging.orbitalParams ? 
              lastMerging.orbitalParams.speed * (1.0 + Math.sin(time * 0.2 + lastMerging.orbitalParams.noiseOffset * 1.3) * 0.15) : 0;
            
            // Get target positions
            const firstTarget = firstMerging.targetOrbitPosition || firstMerging.position;
            const lastTarget = lastMerging.targetOrbitPosition || lastMerging.position;
            const firstDistanceToTarget = firstMerging.position.distanceTo(firstTarget);
            const lastDistanceToTarget = lastMerging.position.distanceTo(lastTarget);
            
            // Select random merging particles
            const randomIndices: number[] = [];
            if (mergingParticles.length > 2) {
              const numRandom = Math.min(2, Math.floor(mergingParticles.length / 3));
              for (let i = 0; i < numRandom; i++) {
                const randomIdx = Math.floor(Math.random() * mergingParticles.length);
                if (randomIdx !== 0 && randomIdx !== mergingParticles.length - 1) {
                  randomIndices.push(randomIdx);
                }
              }
            }
            
            console.log(`[MergingToOrbit] Time: ${time.toFixed(2)}s | Progress: ${(firstMerging.mergeProgress || 0).toFixed(2)}`);
            console.log(`  FIRST: Speed: ${firstSpeed.toFixed(2)} units/s | ` +
              `Orbital Speed: ${firstOrbitalSpeed.toFixed(3)} rad/s | ` +
              `Pos: [${firstMerging.position.x.toFixed(1)}, ${firstMerging.position.y.toFixed(1)}, ${firstMerging.position.z.toFixed(1)}] | ` +
              `Target: [${firstTarget.x.toFixed(1)}, ${firstTarget.y.toFixed(1)}, ${firstTarget.z.toFixed(1)}] | ` +
              `Distance to Target: ${firstDistanceToTarget.toFixed(2)} units`);
            console.log(`  LAST:  Speed: ${lastSpeed.toFixed(2)} units/s | ` +
              `Orbital Speed: ${lastOrbitalSpeed.toFixed(3)} rad/s | ` +
              `Pos: [${lastMerging.position.x.toFixed(1)}, ${lastMerging.position.y.toFixed(1)}, ${lastMerging.position.z.toFixed(1)}] | ` +
              `Target: [${lastTarget.x.toFixed(1)}, ${lastTarget.y.toFixed(1)}, ${lastTarget.z.toFixed(1)}] | ` +
              `Distance to Target: ${lastDistanceToTarget.toFixed(2)} units`);
            console.log(`  Merging Count: ${mergingParticles.length}`);
            
            // Log random merging particles
            randomIndices.forEach((randomIdx, i) => {
              const randomParticle = mergingParticles[randomIdx];
              const randomSpeed = randomParticle.velocity.length();
              const randomOrbitalSpeed = randomParticle.orbitalParams ? 
                randomParticle.orbitalParams.speed * (1.0 + Math.sin(time * 0.2 + randomParticle.orbitalParams.noiseOffset * 1.3) * 0.15) : 0;
              const randomTarget = randomParticle.targetOrbitPosition || randomParticle.position;
              const randomDistanceToTarget = randomParticle.position.distanceTo(randomTarget);
              
              console.log(`  RANDOM${i + 1}: Speed: ${randomSpeed.toFixed(2)} units/s | ` +
                `Orbital Speed: ${randomOrbitalSpeed.toFixed(3)} rad/s | ` +
                `Pos: [${randomParticle.position.x.toFixed(1)}, ${randomParticle.position.y.toFixed(1)}, ${randomParticle.position.z.toFixed(1)}] | ` +
                `Distance to Target: ${randomDistanceToTarget.toFixed(2)} units`);
            });
          }
        }
        
        // Transition to orbiting when close enough or time elapsed (faster threshold)
        if (progress >= 1.0 || distanceToTarget < 3.0) { // Increased threshold for faster transition
          particle.position.copy(currentTargetPos);
          // Set velocity to match orbital speed using unified function
          const nextAngle = updateOrbitalAngleUnified(particle.orbitAngle, orbitalParams, delta, time, 1.0);
          const nextPos = getOrbitPositionUnified(nextAngle, orbitalParams, time, 1.0);
          const orbitalDirection = nextPos.clone().sub(particle.position).normalize();
          particle.velocity.copy(orbitalDirection.multiplyScalar(config.takeoff.liftSpeed * 0.8));
          
          logStateTransition(idx, 'mergingIn', 'orbiting', particle.position, particle.originalGatePosition);
          particle.state = 'orbiting';
          particle.stateTimer = 0;
          particle.targetOrbitPosition = undefined;
          particle.mergeProgress = undefined;
        }
        return;
      }

      // ORBITING state - hold pattern around airport using randomized orbital params
      if (particle.state === 'orbiting') {
        particle.stateTimer += delta;

        // Ensure orbital params exist
        if (!particle.orbitalParams) {
          console.warn(`[ParticleStateManager] Particle ${idx} in orbiting state but missing orbitalParams`);
          particle.orbitalParams = generateRandomOrbitalParams(
            config.orbit.center,
            config.orbit.radius,
            config.orbit.speed,
            config.takeoff.maxHeight
          );
        }

        const orbitalParams = particle.orbitalParams!;

        // Initialize orbit angle from orbital params if not set
        if (particle.orbitAngle === undefined) {
          particle.orbitAngle = orbitalParams.initialAngle;
        }

        // Track angle before update for speed calculation
        const oldAngle = particle.orbitAngle;

        // Update orbit angle with smooth speed variation using unified function
        particle.orbitAngle = updateOrbitalAngleUnified(
          particle.orbitAngle,
          orbitalParams,
          delta,
          time,
          1.0 // Normal orbital speed
        );

        // Calculate speed (angle change per second)
        const angleDelta = particle.orbitAngle - oldAngle;
        const currentSpeed = angleDelta / delta;

        // Calculate position on particle's unique orbit using unified function
        const orbitPos = getOrbitPositionUnified(particle.orbitAngle, orbitalParams, time, 1.0);

        // Smooth movement around orbit
        particle.position.lerp(orbitPos, 0.4);

        // Update orientation to face orbital direction using unified function
        const nextAngle = updateOrbitalAngleUnified(particle.orbitAngle, orbitalParams, delta, time, 1.0);
        const nextOrbitPos = getOrbitPositionUnified(nextAngle, orbitalParams, time, 1.0);
        particle.orientation = orientationFromPoints(particle.position, nextOrbitPos);

        // Apply collision avoidance
        const avoidance = getCollisionAvoidance(particle, particles, config);
        particle.position.add(avoidance.multiplyScalar(0.3));

        // Log metrics for orbiting particles (every ~1 second) - log once per frame when any orbiting particle is found
        const orbitingParticles = particles.filter(p => p.state === 'orbiting' && p.scale > 0 && p.orbitalParams);
        if (orbitingParticles.length >= 2 && time - lastLogTimeRef.current >= 1.0 && particle.state === 'orbiting') {
          lastLogTimeRef.current = time;
            const firstOrbiting = orbitingParticles[0];
            const lastOrbiting = orbitingParticles[orbitingParticles.length - 1];
            
            // Select 2-3 random particles for comparison
            const randomIndices = [];
            if (orbitingParticles.length > 2) {
              const numRandom = Math.min(3, Math.floor(orbitingParticles.length / 4));
              for (let i = 0; i < numRandom; i++) {
                const randomIdx = Math.floor(Math.random() * orbitingParticles.length);
                if (randomIdx !== 0 && randomIdx !== orbitingParticles.length - 1) {
                  randomIndices.push(randomIdx);
                }
              }
            }
            
            if (firstOrbiting.orbitalParams && lastOrbiting.orbitalParams) {
              const firstPos = getOrbitPositionUnified(
                firstOrbiting.orbitAngle || 0,
                firstOrbiting.orbitalParams,
                time,
                1.0
              );
              const lastPos = getOrbitPositionUnified(
                lastOrbiting.orbitAngle || 0,
                lastOrbiting.orbitalParams,
                time,
                1.0
              );
              const distance = firstPos.distanceTo(lastPos);
              
              // Calculate effective speeds with variations (matching unified function)
              const firstSpeedVariation = 1.0 + Math.sin(time * 0.2 + firstOrbiting.orbitalParams.noiseOffset * 1.3) * 0.15;
              const lastSpeedVariation = 1.0 + Math.sin(time * 0.2 + lastOrbiting.orbitalParams.noiseOffset * 1.3) * 0.15;
              const firstEffectiveSpeed = firstOrbiting.orbitalParams.speed * firstSpeedVariation;
              const lastEffectiveSpeed = lastOrbiting.orbitalParams.speed * lastSpeedVariation;
              
              // Calculate velocity magnitude (speed per second) for first and last
              const firstVelocitySpeed = firstOrbiting.velocity.length();
              const lastVelocitySpeed = lastOrbiting.velocity.length();
              
              // Calculate radius variations (matching unified function)
              const firstRadiusVariation = 1.0 + Math.sin(time * 0.3 + firstOrbiting.orbitalParams.phase * 1.7) * 0.1;
              const lastRadiusVariation = 1.0 + Math.sin(time * 0.3 + lastOrbiting.orbitalParams.phase * 1.7) * 0.1;
              const firstEffectiveRadius = firstOrbiting.orbitalParams.radius * firstRadiusVariation;
              const lastEffectiveRadius = lastOrbiting.orbitalParams.radius * lastRadiusVariation;
              
              // Calculate angle change per second (rad/s) and per frame
              const firstAngleDelta = (firstOrbiting.orbitAngle || 0) - (firstOrbiting.orbitalParams.initialAngle || 0);
              const lastAngleDelta = (lastOrbiting.orbitAngle || 0) - (lastOrbiting.orbitalParams.initialAngle || 0);
              const firstSpeedPerFrame = firstEffectiveSpeed * delta;
              const lastSpeedPerFrame = lastEffectiveSpeed * delta;
              
              // Log first and last particles
              console.log(`[RunwayOrbiting] Time: ${time.toFixed(2)}s | Frame: ${logFrameCountRef.current}`);
              console.log(`  FIRST: Speed: ${firstEffectiveSpeed.toFixed(3)} rad/s (${firstSpeedPerFrame.toFixed(5)} rad/frame) | ` +
                `Base: ${firstOrbiting.orbitalParams.speed.toFixed(3)} | ` +
                `Velocity: ${firstVelocitySpeed.toFixed(2)} units/s | ` +
                `Pos: [${firstPos.x.toFixed(1)}, ${firstPos.y.toFixed(1)}, ${firstPos.z.toFixed(1)}] | ` +
                `Radius: ${firstEffectiveRadius.toFixed(2)} | Angle: ${(firstOrbiting.orbitAngle || 0).toFixed(3)} | ` +
                `Phase: ${firstOrbiting.orbitalParams.phase.toFixed(3)}`);
              console.log(`  LAST:  Speed: ${lastEffectiveSpeed.toFixed(3)} rad/s (${lastSpeedPerFrame.toFixed(5)} rad/frame) | ` +
                `Base: ${lastOrbiting.orbitalParams.speed.toFixed(3)} | ` +
                `Velocity: ${lastVelocitySpeed.toFixed(2)} units/s | ` +
                `Pos: [${lastPos.x.toFixed(1)}, ${lastPos.y.toFixed(1)}, ${lastPos.z.toFixed(1)}] | ` +
                `Radius: ${lastEffectiveRadius.toFixed(2)} | Angle: ${(lastOrbiting.orbitAngle || 0).toFixed(3)} | ` +
                `Phase: ${lastOrbiting.orbitalParams.phase.toFixed(3)}`);
              console.log(`  Distance: ${distance.toFixed(2)} units | Orbiting Count: ${orbitingParticles.length}`);
              
              // Log random particles for comparison
              randomIndices.forEach((randomIdx, i) => {
                const randomParticle = orbitingParticles[randomIdx];
                if (randomParticle.orbitalParams) {
                  const randomPos = getOrbitPositionUnified(
                    randomParticle.orbitAngle || 0,
                    randomParticle.orbitalParams,
                    time,
                    1.0
                  );
                  const randomSpeedVariation = 1.0 + Math.sin(time * 0.2 + randomParticle.orbitalParams.noiseOffset * 1.3) * 0.15;
                  const randomEffectiveSpeed = randomParticle.orbitalParams.speed * randomSpeedVariation;
                  const randomSpeedPerFrame = randomEffectiveSpeed * delta;
                  const randomVelocitySpeed = randomParticle.velocity.length();
                  const randomRadiusVariation = 1.0 + Math.sin(time * 0.3 + randomParticle.orbitalParams.phase * 1.7) * 0.1;
                  const randomEffectiveRadius = randomParticle.orbitalParams.radius * randomRadiusVariation;
                  
                  console.log(`  RANDOM${i + 1}: Speed: ${randomEffectiveSpeed.toFixed(3)} rad/s (${randomSpeedPerFrame.toFixed(5)} rad/frame) | ` +
                    `Base: ${randomParticle.orbitalParams.speed.toFixed(3)} | ` +
                    `Velocity: ${randomVelocitySpeed.toFixed(2)} units/s | ` +
                    `Pos: [${randomPos.x.toFixed(1)}, ${randomPos.y.toFixed(1)}, ${randomPos.z.toFixed(1)}] | ` +
                    `Radius: ${randomEffectiveRadius.toFixed(2)} | Angle: ${(randomParticle.orbitAngle || 0).toFixed(3)} | ` +
                    `Phase: ${randomParticle.orbitalParams.phase.toFixed(3)}`);
                }
              });
            }
          }

        // After orbits complete, start approaching
        const angleTraveled = particle.orbitAngle - orbitalParams.initialAngle;
        const orbitsCompleted = angleTraveled / (Math.PI * 2);
        if (orbitsCompleted > config.orbit.orbitsBeforeLanding) {
          logStateTransition(idx, 'orbiting', 'approaching', particle.position, particle.originalGatePosition);
          particle.state = 'approaching';
          particle.stateTimer = 0;
          particle.velocity.set(0, 0, 0);
        }
        return;
      }

      // APPROACHING state - descend on approach to runway
      if (particle.state === 'approaching') {
        particle.stateTimer += delta;

        // Move toward runway entry point (over gates)
        const approachTarget = particle.originalGatePosition.clone();
        approachTarget.y = 10; // Approach height

        // Smooth glide path toward approach target
        const toTarget = approachTarget.clone().sub(particle.position);
        const targetDistance = toTarget.length();

        if (targetDistance > 1.0) {
          particle.position.add(toTarget.normalize().multiplyScalar(Math.min(config.takeoff.liftSpeed * 0.8 * delta, targetDistance)));
          particle.orientation = orientationFromPoints(particle.position, approachTarget);
        }

        // Descend faster
        particle.position.y -= config.takeoff.acceleration * 0.8 * delta;

        // Apply collision avoidance
        const avoidance = getCollisionAvoidance(particle, particles, config);
        particle.position.add(avoidance.multiplyScalar(0.2));

        // Once on approach path and low enough, start landing
        if (particle.position.y <= 5.0) {
          logStateTransition(idx, 'approaching', 'landing', particle.position, particle.originalGatePosition);
          particle.state = 'landing';
          particle.velocity.set(0, -config.takeoff.acceleration * 0.5, 0);
          particle.stateTimer = 0;
        }
        return;
      }

      // LANDING state - final descent to gate
      if (particle.state === 'landing') {
        particle.velocity.y -= config.takeoff.acceleration * delta;
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        // Faster lateral movement toward gate
        const toGate = particle.originalGatePosition.clone().sub(particle.position);
        toGate.y = 0; // Only lateral movement
        if (toGate.length() > 0.5) {
          particle.position.add(toGate.normalize().multiplyScalar(0.3));
          
          // Update orientation to face gate
          const landingTarget = particle.originalGatePosition.clone();
          landingTarget.y = particle.position.y;
          particle.orientation = orientationFromPoints(particle.position, landingTarget);
        }

        // Check if landed
        if (particle.position.y <= particle.originalGatePosition.y + 0.1) {
          particle.position.copy(particle.originalGatePosition);
          particle.velocity.set(0, 0, 0);
          logStateTransition(idx, 'landing', 'parked', particle.position, particle.originalGatePosition);
          particle.state = 'parked';
          particle.stateTimer = config.timing.parkedTime;
          particle.currentWaypoint = 0;
          particle.targetWaypoint = null;
          particle.orbitAngle = 0;
        }
        return;
      }
    });
  });

  return null; // This is a logic component
}
