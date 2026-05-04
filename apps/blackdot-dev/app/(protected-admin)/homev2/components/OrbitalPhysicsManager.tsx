'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RUNWAY_CONFIG } from '../config/runway.config';
import type { RunwayParticle } from '../types/particle.types';
import { getOrbitPositionUnified, updateOrbitalAngleUnified } from '@/lib/threejs/utils/unifiedOrbit';
import { orientationFromDirection, orientationFromPoints } from '@/lib/threejs/utils/orientation';
import { SpatialGrid, getCollisionAvoidanceOptimized } from '../utils/spatialGrid';

import type { ScalableOrbitingParticlesRef } from '../particle/ScalableOrbitingParticles';

interface OrbitalPhysicsManagerProps {
  particlesRef: React.MutableRefObject<RunwayParticle[]>;
  waypointPositions: THREE.Vector3[];
  waypointOrientations?: Array<[number, number, number]>;
  orbitingParticlesRef?: React.RefObject<ScalableOrbitingParticlesRef>;
  originRotation?: [number, number, number];
}

/**
 * Physics-based particle manager: taxi → takeoff → orbit
 * Particles slide to runway, takeoff, then naturally settle into orbital trajectory
 */
export function OrbitalPhysicsManager({
  particlesRef,
  waypointPositions,
  waypointOrientations = [],
  orbitingParticlesRef,
  originRotation,
}: OrbitalPhysicsManagerProps) {
  const config = RUNWAY_CONFIG;
  const spatialGridRef = useRef<SpatialGrid<RunwayParticle>>(new SpatialGrid<RunwayParticle>(15)); // 15-unit cell size

  useFrame((state, delta) => {
    const particles = particlesRef.current;
    const time = state.clock.getElapsedTime();

    // Update spatial grid for optimized collision detection
    spatialGridRef.current.update(particles);

    particles.forEach((particle, idx) => {
      // Skip particles that aren't spawned yet
      if (particle.scale === 0) return;

      // PARKED state - wait before taxiing
      if (particle.state === 'parked') {
        particle.stateTimer -= delta;
        if (particle.stateTimer <= 0) {
          particle.state = 'taxiing';
          particle.stateTimer = 0;
          particle.currentWaypoint = 0;
          particle.targetWaypoint = 0;
        }
        return;
      }

      // TAXIING state - smooth velocity-based movement to runway waypoints, always facing runway direction
      if (particle.state === 'taxiing') {
        particle.stateTimer += delta;
        
        if (particle.targetWaypoint === null) {
          particle.targetWaypoint = 0;
        }

        const targetPos = waypointPositions[particle.targetWaypoint];
        const toTarget = targetPos.clone().sub(particle.position);
        const distance = toTarget.length();

        if (distance > 0.1) {
          // Smooth velocity-based movement toward waypoint (like takeoff)
          const targetDirection = toTarget.normalize();
          const targetSpeed = config.timing.taxiSpeed * 10; // Convert to velocity units
          
          // Accelerate velocity toward target direction
          const acceleration = targetSpeed * config.timing.taxiAccelerationMultiplier;
          particle.velocity.lerp(targetDirection.multiplyScalar(targetSpeed), acceleration * delta);
          
          // Apply velocity to position
          particle.position.add(particle.velocity.clone().multiplyScalar(delta));
          particle.position.y = 0.1; // Keep on ground
          
          // Use waypoint-specific orientation if available, otherwise default to runway direction
          const waypointOrientation = waypointOrientations[particle.targetWaypoint];
          if (waypointOrientation) {
            const euler = new THREE.Euler(waypointOrientation[0], waypointOrientation[1], waypointOrientation[2], 'XYZ');
            const quat = new THREE.Quaternion().setFromEuler(euler);
            particle.orientation = {
              quaternion: quat,
              rotation: euler,
              forward: new THREE.Vector3(1, 0, 0),
              up: new THREE.Vector3(0, 1, 0),
              right: new THREE.Vector3(0, 0, 1)
            };
          } else {
            // Default to runway direction (positive X) while taxiing on flat area
            const runwayDirection = new THREE.Vector3(1, 0, 0);
            particle.orientation = orientationFromDirection(runwayDirection);
          }
        } else {
          // Reached waypoint - move to next
          particle.currentWaypoint++;
          if (particle.currentWaypoint >= waypointPositions.length) {
          // Reached runway - start takeoff with runway-aligned velocity
          particle.state = 'takeoff';
          // Takeoff along runway direction (X) and upward (Y)
          particle.velocity.set(config.takeoff.liftSpeed, config.takeoff.acceleration, 0);
          particle.stateTimer = 0;
          
          // Apply runway-start waypoint orientation if available
          const runwayStartOrientation = waypointOrientations[waypointPositions.length - 1];
          if (runwayStartOrientation) {
            const euler = new THREE.Euler(runwayStartOrientation[0], runwayStartOrientation[1], runwayStartOrientation[2], 'XYZ');
            const quat = new THREE.Quaternion().setFromEuler(euler);
            particle.orientation = {
              quaternion: quat,
              rotation: euler,
              forward: new THREE.Vector3(1, 0, 0),
              up: new THREE.Vector3(0, 1, 0),
              right: new THREE.Vector3(0, 0, 1)
            };
          }
          } else {
            particle.targetWaypoint = particle.currentWaypoint;
          }
        }
        return;
      }

      // TAKEOFF state - accelerate upward and forward, then force into orbit within 3 seconds
      if (particle.state === 'takeoff') {
        particle.stateTimer += delta;
        
        // Check for nearby orbiting particles - adopt their trajectory if found
        if (orbitingParticlesRef?.current && particle.position.y > config.takeoff.maxHeight * 0.5) {
          const nearbyParticles = orbitingParticlesRef.current.getNearbyParticles(
            particle.position,
            config.takeoff.orbitMatchRadius, // Detection radius from config
            time
          );
          
          if (nearbyParticles.length > 0 && !particle.matchedOrbit) {
            // Adopt the trajectory of the first nearby orbiting particle
            const targetParticle = nearbyParticles[0];
            const targetState = targetParticle.state;
            
            // Match the target particle's orbit exactly
            particle.orbitAngle = targetState.angle;
            if (particle.orbitalParams) {
              particle.orbitalParams.center = targetState.center;
              particle.orbitalParams.radius = targetState.radius;
              particle.orbitalParams.speed = targetState.speed;
              particle.orbitalParams.phase = targetState.phase;
              particle.orbitalParams.altitude = targetState.height;
            }
            
            particle.matchedOrbit = true;
            
            // Strong pull toward the target particle's position
            const toTarget = targetParticle.position.clone().sub(particle.position);
            const distance = toTarget.length();
            const gravityStrength = 200.0;
            const gravityForce = toTarget.normalize().multiplyScalar(gravityStrength * delta);
            particle.velocity.add(gravityForce);
            
            // Match velocity direction toward target
            const targetVelocity = toTarget.normalize().multiplyScalar(targetState.speed * targetState.radius);
            particle.velocity.lerp(targetVelocity, 0.3);
            
            // Transition to orbiting immediately when close enough
            if (distance < 5.0) {
              particle.state = 'orbiting';
              particle.stateTimer = 0;
            }
          }
        }
        
        // Ensure orbital params exist
        if (!particle.orbitalParams) {
          console.warn(`[OrbitalPhysicsManager] Particle ${idx} missing orbitalParams`);
          return;
        }
        
        const orbitalParams = particle.orbitalParams;
        
        // Accelerate upward and forward along runway direction (X-axis)
        const takeoffProgress = particle.position.y / config.takeoff.maxHeight;
        const [minMultiplier, maxMultiplier] = config.takeoff.speedMultiplierRange;
        const speedMultiplier = minMultiplier + takeoffProgress * (maxMultiplier - minMultiplier);
        
        // Accelerate along runway (X) and upward (Y)
        particle.velocity.x += config.takeoff.liftSpeed * delta * speedMultiplier;
        particle.velocity.y += config.takeoff.acceleration * delta * speedMultiplier;
        
        // After gravityStartDelay, start applying gravity toward orbit (if not matched)
        if (particle.stateTimer > config.takeoff.gravityStartDelay && !particle.matchedOrbit) {
          const timeSinceGravityStart = particle.stateTimer - config.takeoff.gravityStartDelay;
          const gravityDuration = config.takeoff.maxDuration - config.takeoff.gravityStartDelay;
          const mergeProgress = Math.min(1.0, timeSinceGravityStart / gravityDuration);
          
          // Calculate target orbital position
          if (particle.orbitAngle === undefined) {
            particle.orbitAngle = orbitalParams.initialAngle;
          }
          
          const targetOrbitPos = getOrbitPositionUnified(
            particle.orbitAngle,
            orbitalParams,
            time,
            1.0
          );
          
          // Strong gravity force pulling toward orbit (increases over time)
          const toOrbit = targetOrbitPos.clone().sub(particle.position);
          const gravityStrength = config.takeoff.initialGravityStrength + 
            mergeProgress * (config.takeoff.maxGravityStrength - config.takeoff.initialGravityStrength);
          const gravityForce = toOrbit.normalize().multiplyScalar(gravityStrength * delta);
          
          // Apply gravity force
          particle.velocity.add(gravityForce);
          
          // Also curve trajectory toward orbit center
          const orbitCenter = orbitalParams.center;
          const toCenter = orbitCenter.clone().sub(particle.position);
          const centerPull = toCenter.normalize().multiplyScalar(gravityStrength * 0.5 * delta);
          particle.velocity.add(centerPull);
        }
        
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        // Update orientation to face velocity direction
        if (particle.velocity.lengthSq() > 0.01) {
          particle.orientation = orientationFromDirection(particle.velocity.normalize());
        }

        // Transition to orbiting when reaching max height OR after maxDuration (whichever comes first)
        if (particle.position.y >= config.takeoff.maxHeight || particle.stateTimer >= config.takeoff.maxDuration) {
          particle.state = 'orbiting';
          particle.stateTimer = 0; // Reset timer for orbiting state
        }
        return;
      }

      // ORBITING state - physics-based orbital motion with strong gravity forces
      if (particle.state === 'orbiting') {
        // Ensure orbital params exist
        if (!particle.orbitalParams) {
          console.warn(`[OrbitalPhysicsManager] Particle ${idx} missing orbitalParams`);
          return;
        }

        const orbitalParams = particle.orbitalParams;
        particle.stateTimer += delta; // Track time in orbiting state
        
        // Check for nearby orbiting particles - adopt their trajectory if found
        if (orbitingParticlesRef?.current) {
          const nearbyParticles = orbitingParticlesRef.current.getNearbyParticles(
            particle.position,
            25.0, // Detection radius
            time
          );
          
          if (nearbyParticles.length > 0 && !particle.matchedOrbit) {
            // Adopt the trajectory of the first nearby orbiting particle
            const targetParticle = nearbyParticles[0];
            const targetState = targetParticle.state;
            
            // Match the target particle's orbit exactly
            particle.orbitAngle = targetState.angle;
            particle.orbitalParams.center = targetState.center;
            particle.orbitalParams.radius = targetState.radius;
            particle.orbitalParams.speed = targetState.speed;
            particle.orbitalParams.phase = targetState.phase;
            particle.orbitalParams.altitude = targetState.height;
            
            particle.matchedOrbit = true;
            
            console.log(`[OrbitalPhysicsManager] Particle ${idx} matched orbit with nearby particle`);
          }
        }
        
        // Initialize orbit angle if not set
        if (particle.orbitAngle === undefined) {
          particle.orbitAngle = orbitalParams.initialAngle;
        }

        // Update orbit angle using matched orbit or own orbit
        particle.orbitAngle = updateOrbitalAngleUnified(
          particle.orbitAngle,
          orbitalParams,
          delta,
          time,
          1.0
        );

        // Calculate target orbital position
        const targetOrbitPos = getOrbitPositionUnified(
          particle.orbitAngle,
          orbitalParams,
          time,
          1.0
        );

        // Calculate direction to orbital target
        const toTarget = targetOrbitPos.clone().sub(particle.position);
        const distanceToTarget = toTarget.length();
        const direction = toTarget.normalize();
        
        // If matched to an orbit, strongly pull toward target position
        if (particle.matchedOrbit && orbitingParticlesRef?.current) {
          const nearbyParticles = orbitingParticlesRef.current.getNearbyParticles(
            particle.position,
            25.0,
            time
          );
          
          if (nearbyParticles.length > 0) {
            const targetParticle = nearbyParticles[0];
            const toMatchedTarget = targetParticle.position.clone().sub(particle.position);
            const matchDistance = toMatchedTarget.length();
            
            // Very strong pull to match exact position
            const matchStrength = 300.0;
            const matchForce = toMatchedTarget.normalize().multiplyScalar(matchStrength * delta);
            particle.velocity.add(matchForce);
            
            // Match velocity exactly
            const targetVel = toMatchedTarget.normalize().multiplyScalar(targetParticle.state.speed * targetParticle.state.radius);
            particle.velocity.lerp(targetVel, 0.5);
            
            // If very close, snap to exact position
            if (matchDistance < 2.0) {
              particle.position.copy(targetParticle.position);
              particle.velocity.copy(targetVel);
            }
          }
        }

        // Calculate orbital speed (for velocity magnitude)
        const speedVariation = 1.0 + Math.sin(time * 0.2 + orbitalParams.noiseOffset * 1.3) * 0.15;
        const orbitalSpeed = orbitalParams.speed * speedVariation;
        
        // Convert orbital angular speed to linear speed (approximate)
        const radiusVariation = 1.0 + Math.sin(time * 0.3 + orbitalParams.phase * 1.7) * 0.1;
        const effectiveRadius = orbitalParams.radius * radiusVariation;
        const linearSpeed = orbitalSpeed * effectiveRadius;

        // Apply orbital force (gravity-like attraction toward orbit)
        const orbitCenter = orbitalParams.center;
        const toCenter = orbitCenter.clone().sub(particle.position);
        const distanceToCenter = toCenter.length();
        const radialDirection = toCenter.normalize();
        
        // Calculate how close particle is to its target orbit radius
        const orbitDistance = Math.abs(distanceToCenter - effectiveRadius);
        const isNearOrbit = orbitDistance < effectiveRadius * 0.2; // Within 20% of target radius
        
        // Strong gravity force when newly orbiting (first 3 seconds) - forces particle into orbit
        const timeInOrbit = particle.stateTimer;
        const isMerging = timeInOrbit < 3.0; // First 3 seconds in orbit state
        
        if (isMerging) {
          // Very strong gravity pulling toward target orbit position
          const mergeProgress = timeInOrbit / 3.0; // 0 to 1 over 3 seconds
          const gravityStrength = 200.0 * (1.0 - mergeProgress * 0.5); // Start at 200, reduce to 100
          
          // Direct pull toward target orbit position
          const gravityForce = direction.multiplyScalar(gravityStrength * delta);
          particle.velocity.add(gravityForce);
          
          // Also pull toward orbit center to establish radius
          const centerPull = radialDirection.multiplyScalar(gravityStrength * 0.6 * delta);
          particle.velocity.add(centerPull);
          
          // Increase velocity toward orbit (faster convergence)
          const speedBoost = 1.0 + (1.0 - mergeProgress) * 2.0; // 3x speed initially, reducing to 1x
          particle.velocity.multiplyScalar(1.0 + (speedBoost - 1.0) * delta);
        }
        
        // Transfer particle to ScalableOrbitingParticles when it reaches stable orbit
        if (isNearOrbit && orbitingParticlesRef?.current && !particle.transferredToOrbit) {
          // Mark as transferred to prevent duplicate transfers
          particle.transferredToOrbit = true;
          
          // Add particle to orbiting system
          orbitingParticlesRef.current.addParticle(
            orbitalParams,
            particle.orbitAngle || orbitalParams.initialAngle,
            particle.position.clone()
          );
          
          // Hide particle from runway system
          particle.scale = 0;
          
          console.log(`[OrbitalPhysicsManager] Transferred particle ${idx} to ScalableOrbitingParticles`);
          return; // Skip further updates for this particle
        }
        
        // Calculate tangential direction (perpendicular to radius, for orbital motion)
        const up = new THREE.Vector3(0, 1, 0);
        const tangentDirection = new THREE.Vector3()
          .crossVectors(radialDirection, up)
          .normalize();
        
        // If particle is far from orbit, pull it toward the target position
        // If particle is near orbit, apply orbital motion (tangential velocity)
        let targetVelocity: THREE.Vector3;
        
        if (isNearOrbit) {
          // Near orbit: apply orbital motion (tangential velocity)
          targetVelocity = tangentDirection.multiplyScalar(linearSpeed);
          
          // Add slight radial correction to maintain orbit radius
          const radialCorrection = radialDirection.multiplyScalar(
            (effectiveRadius - distanceToCenter) * 2.0
          );
          targetVelocity.add(radialCorrection);
        } else {
          // Far from orbit: accelerate toward target orbital position
          targetVelocity = direction.multiplyScalar(linearSpeed * 1.5);
        }
        
        // Smoothly interpolate velocity toward target (physics-based approach)
        // Use stronger lerp when merging to force convergence faster
        const lerpFactor = isMerging 
          ? (isNearOrbit ? 0.2 : 0.4) // Stronger when merging
          : (isNearOrbit ? 0.05 : 0.15); // Normal when stable
        particle.velocity.lerp(targetVelocity, lerpFactor);
        
        // Apply velocity to position
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));

        // Update orientation to face velocity direction
        if (particle.velocity.lengthSq() > 0.01) {
          particle.orientation = orientationFromDirection(particle.velocity.normalize());
        }

        // Apply collision avoidance (optimized using spatial grid)
        const avoidance = getCollisionAvoidanceOptimized(
          particle,
          spatialGridRef.current,
          config.collision.avoidanceRadius,
          config.collision.avoidanceStrength
        );
        particle.position.add(avoidance.multiplyScalar(0.3));
      }
    });
  });

  return null;
}
