/**
 * Curved Takeoff Orbit V2
 *
 * Enhanced version using auto-trajectory calculation and smooth orientation.
 * Modular, maintainable architecture replacing 1,417 LOC monolith.
 *
 * Key improvements:
 * - Auto-calculates entry/exit points via trajectoryCalculator
 * - Smooth quaternion orientation via orientationController
 * - Manual override support for all parameters
 * - Cleaner separation of concerns
 */

'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { DevTunableConfig } from './config/dev-tunable.config';
import { calculateSourceTrajectory, type TrajectoryResult } from './lib/trajectoryCalculator';
import { ParticleOrientationController } from './lib/orientationController';

// ============================================================================
// TYPES
// ============================================================================

interface Particle {
  // Identity
  id: string;
  sourceId: string;
  sourceIndex: number;
  active: boolean;

  // Phase state machine
  phase: 'takeoff' | 'orbit' | 'landing';
  time: number;

  // Position & orientation
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  orientationController: ParticleOrientationController;

  // Orbit parameters
  orbitAngle: number;
  orbitSpeed: number;
  orbitalRadius: number;
  verticalOffset: number;

  // Collision tracking
  collisionDepth: number;
  repulsionForce: THREE.Vector3;

  // Landing
  landingEligible: boolean;
  distanceToExit: number;
  exitAttractionForce: THREE.Vector3;
  landingTransitionStart: THREE.Vector3;
  landingTransitionTime: number;

  // Trajectory (cached from source)
  trajectory: TrajectoryResult;

  // Visual
  trail: THREE.Vector3[];
  color: THREE.Color;
  scale: number;
}

interface CurvedTakeoffOrbitV2Props {
  config: DevTunableConfig;
}

// ============================================================================
// SPATIAL GRID (Collision Detection)
// ============================================================================

class SpatialGrid {
  private grid: Map<number, number[]>;
  private sectorCount: number;

  constructor(sectorCount: number = 32) {
    this.grid = new Map();
    this.sectorCount = sectorCount;
  }

  clear() {
    this.grid.clear();
  }

  insert(particleIndex: number, angle: number) {
    const sector = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * this.sectorCount) % this.sectorCount;
    if (!this.grid.has(sector)) {
      this.grid.set(sector, []);
    }
    this.grid.get(sector)!.push(particleIndex);
  }

  query(angle: number, range: number = 1): number[] {
    const centerSector = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * this.sectorCount) % this.sectorCount;
    const neighbors: number[] = [];

    for (let i = -range; i <= range; i++) {
      const sector = (centerSector + i + this.sectorCount) % this.sectorCount;
      const particles = this.grid.get(sector);
      if (particles) {
        neighbors.push(...particles);
      }
    }

    return neighbors;
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CurvedTakeoffOrbitV2({ config }: CurvedTakeoffOrbitV2Props) {
  // -------------------------------------------------------------------------
  // TRAJECTORY CALCULATION (Pre-compute on mount)
  // -------------------------------------------------------------------------
  const trajectories = useMemo(() => {
    console.log('🚀 V2: Calculating trajectories for', config.sources.length, 'sources');

    const results = new Map<string, TrajectoryResult>();

    for (const source of config.sources) {
      // Build source definition for calculator
      const sourceDefinition = {
        id: source.id,
        gatePosition: source.gatePosition,
        takeoffDirection: source.takeoff.direction,
        takeoffHeight: config.orbit.center.y,
        takeoffArcHeight: source.takeoff.arcHeight,
        landingDestination: source.landing.destinationMode === 'auto' ? source.gatePosition : source.landing.manualDestination,
      };

      // Calculate trajectory
      const trajectory = calculateSourceTrajectory(sourceDefinition, {
        center: config.orbit.center,
        radius: config.orbit.radius,
        nominalSpeed: config.orbit.nominalSpeed,
      });

      // Manual override for entry angle if specified
      if (source.orbitEntry.angleMode === 'manual' && source.orbitEntry.manualAngle !== undefined) {
        trajectory.entryAngle = source.orbitEntry.manualAngle;
        trajectory.entryPoint = new THREE.Vector3(
          config.orbit.center.x + Math.cos(trajectory.entryAngle) * config.orbit.radius,
          config.orbit.center.y,
          config.orbit.center.z + Math.sin(trajectory.entryAngle) * config.orbit.radius
        );
      }

      // Manual override for exit angle if specified
      if (source.landing.exitAngleMode === 'manual' && source.landing.manualExitAngle !== undefined) {
        trajectory.exitAngle = source.landing.manualExitAngle;
        trajectory.exitPoint = new THREE.Vector3(
          config.orbit.center.x + Math.cos(trajectory.exitAngle) * config.orbit.radius,
          config.orbit.center.y,
          config.orbit.center.z + Math.sin(trajectory.exitAngle) * config.orbit.radius
        );

        // Regenerate landing curve with new exit point
        const landingWaypoints = [
          trajectory.exitPoint,
          ...trajectory.landingWaypoints.slice(1)
        ];
        trajectory.landingCurve = new THREE.CatmullRomCurve3(landingWaypoints);
      }

      results.set(source.id, trajectory);

      console.log(`  ✓ ${source.id}: entry=${(trajectory.entryAngle * 180 / Math.PI).toFixed(0)}°, quality=${trajectory.mergeQuality}`);
    }

    return results;
  }, [config.sources, config.orbit]);

  // -------------------------------------------------------------------------
  // MODEL LOADING
  // -------------------------------------------------------------------------
  const modelGeometry = useMemo(() => {
    try {
      const gltf = useGLTF('/assets/models/Airplane.glb');
      const model = gltf.scene.clone();
      const geometry = new THREE.BufferGeometry();

      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) {
            geometry.copy(mesh.geometry);
          }
        }
      });

      return geometry;
    } catch (error) {
      console.warn('Failed to load model, using box fallback:', error);
      return new THREE.BoxGeometry(1, 0.5, 2);
    }
  }, []);

  // -------------------------------------------------------------------------
  // PARTICLE POOL
  // -------------------------------------------------------------------------
  const particles = useRef<Particle[]>([]);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const spatialGrid = useRef(new SpatialGrid(config.collision.gridSectorCount || 32));
  const spawnTimers = useRef<Map<string, number>>(new Map());

  // Initialize particle pool
  useMemo(() => {
    particles.current = [];

    config.sources.forEach((source, sourceIndex) => {
      const trajectory = trajectories.get(source.id);
      if (!trajectory) return;

      const color = new THREE.Color(source.visual.color);

      for (let i = 0; i < source.spawn.maxParticles; i++) {
        particles.current.push({
          id: `${source.id}-${i}`,
          sourceId: source.id,
          sourceIndex,
          active: false,

          phase: 'takeoff',
          time: 0,

          position: new THREE.Vector3(),
          velocity: new THREE.Vector3(),
          quaternion: new THREE.Quaternion(),
          orientationController: new ParticleOrientationController(
            new THREE.Quaternion(),
            {
              mode: source.orientation.mode,
              orbitCenter: config.orbit.center,
              orbitNormal: config.orbit.normal,
              additionalRotation: source.orientation.additionalRotation,
              rotationSpeed: source.orientation.rotationSpeed,
              useInstantRotation: source.orientation.useInstantRotation,
            }
          ),

          orbitAngle: trajectory.entryAngle,
          orbitSpeed: source.orbitEntry.entryVelocity,
          orbitalRadius: config.orbit.radius,
          verticalOffset: 0,

          collisionDepth: 0,
          repulsionForce: new THREE.Vector3(),

          landingEligible: false,
          distanceToExit: Infinity,
          exitAttractionForce: new THREE.Vector3(),
          landingTransitionStart: new THREE.Vector3(),
          landingTransitionTime: 0,

          trajectory,

          trail: [],
          color,
          scale: source.visual.modelScale,
        });
      }

      spawnTimers.current.set(source.id, 0);
    });

    console.log(`✓ V2: Initialized ${particles.current.length} particles`);
  }, [config.sources, trajectories, config.orbit]);

  // -------------------------------------------------------------------------
  // SPAWN LOGIC
  // -------------------------------------------------------------------------
  const spawnParticle = (sourceId: string) => {
    const source = config.sources.find((s) => s.id === sourceId);
    if (!source || !source.spawn.enabled) return;

    const particle = particles.current.find((p) => p.sourceId === sourceId && !p.active);
    if (!particle) return;

    // Reset particle state
    particle.active = true;
    particle.phase = 'takeoff';
    particle.time = 0;
    particle.position.copy(source.gatePosition);
    particle.velocity.set(0, 0, 0);
    particle.quaternion.identity();
    particle.orientationController.reset();

    particle.orbitAngle = particle.trajectory.entryAngle;
    particle.orbitSpeed = source.orbitEntry.entryVelocity;
    particle.orbitalRadius = config.orbit.radius;
    particle.verticalOffset = 0;

    particle.collisionDepth = 0;
    particle.repulsionForce.set(0, 0, 0);

    particle.landingEligible = false;
    particle.distanceToExit = Infinity;
    particle.exitAttractionForce.set(0, 0, 0);

    particle.trail = [];
  };

  // -------------------------------------------------------------------------
  // MAIN UPDATE LOOP
  // -------------------------------------------------------------------------
  useFrame((state, delta) => {
    if (config.global.paused) return;

    const scaledDelta = delta * config.global.timeScale;

    // Clear spatial grid
    spatialGrid.current.clear();

    // Update spawn timers
    config.sources.forEach((source) => {
      if (!source.spawn.enabled) return;

      const timer = spawnTimers.current.get(source.id) || 0;
      spawnTimers.current.set(source.id, timer + scaledDelta);

      if (timer >= source.spawn.spawnRate) {
        spawnParticle(source.id);
        spawnTimers.current.set(source.id, 0);
      }
    });

    // Update particles
    particles.current.forEach((particle, index) => {
      if (!particle.active) return;

      const source = config.sources[particle.sourceIndex];

      // -----------------------------------------------------------------------
      // PHASE 1: TAKEOFF
      // -----------------------------------------------------------------------
      if (particle.phase === 'takeoff') {
        particle.time += scaledDelta;
        const progress = Math.min(particle.time / source.takeoff.duration, 1);

        // Position from curve
        particle.position.copy(particle.trajectory.takeoffCurve.getPoint(progress));

        // Tangent for orientation
        const tangent = particle.trajectory.takeoffCurve.getTangent(progress);

        // Update orientation
        particle.orientationController.updateCurveTangent(
          particle.position,
          tangent,
          scaledDelta
        );
        particle.quaternion.copy(particle.orientationController.getState().currentQuaternion);

        // Transition to orbit
        if (progress >= 1) {
          particle.phase = 'orbit';
          particle.time = 0;
          particle.orbitAngle = particle.trajectory.entryAngle;
          particle.position.copy(particle.trajectory.entryPoint);
        }
      }

      // -----------------------------------------------------------------------
      // PHASE 2: ORBIT
      // -----------------------------------------------------------------------
      else if (particle.phase === 'orbit') {
        particle.time += scaledDelta;

        // Insert into spatial grid
        spatialGrid.current.insert(index, particle.orbitAngle);

        // Update orbit angle
        particle.orbitAngle += (particle.orbitSpeed / particle.orbitalRadius) * scaledDelta;
        particle.orbitAngle = particle.orbitAngle % (2 * Math.PI);

        // Base position
        const baseX = config.orbit.center.x + Math.cos(particle.orbitAngle) * particle.orbitalRadius;
        const baseZ = config.orbit.center.z + Math.sin(particle.orbitAngle) * particle.orbitalRadius;
        const baseY = config.orbit.center.y + particle.verticalOffset;

        particle.position.set(baseX, baseY, baseZ);

        // Update orientation (orbit-locked)
        particle.orientationController.updateOrbitLock(particle.position, scaledDelta);
        particle.quaternion.copy(particle.orientationController.getState().currentQuaternion);

        // Check landing eligibility
        if (particle.time >= source.orbit.minDuration) {
          particle.landingEligible = true;

          // Calculate distance to exit
          particle.distanceToExit = particle.position.distanceTo(particle.trajectory.exitPoint);

          // Exit attraction
          if (config.exit.attraction.enabled && particle.distanceToExit < config.exit.attraction.maxDistance) {
            const toExit = new THREE.Vector3().subVectors(particle.trajectory.exitPoint, particle.position);
            const attractionStrength = config.exit.attraction.strength * (1 - particle.distanceToExit / config.exit.attraction.maxDistance);
            particle.exitAttractionForce.copy(toExit.normalize().multiplyScalar(attractionStrength));
            particle.position.add(particle.exitAttractionForce.clone().multiplyScalar(scaledDelta));
          }

          // Transition to landing
          if (particle.distanceToExit < config.exit.exitZone.radius) {
            particle.phase = 'landing';
            particle.time = 0;
            particle.landingTransitionStart.copy(particle.position);
            particle.landingTransitionTime = 0;
          }
        }
      }

      // -----------------------------------------------------------------------
      // PHASE 3: LANDING
      // -----------------------------------------------------------------------
      else if (particle.phase === 'landing') {
        particle.time += scaledDelta;
        particle.landingTransitionTime += scaledDelta;

        const progress = Math.min(particle.time / source.landing.duration, 1);

        // Transition blending (smooth handoff from orbit)
        const transitionDuration = source.landing.transitionBlend;
        const transitionProgress = Math.min(particle.landingTransitionTime / transitionDuration, 1);
        const easedProgress = 1 - Math.pow(1 - transitionProgress, 3); // Cubic ease-out

        if (transitionProgress < 1) {
          // Blend from orbit position to landing curve
          const targetPosition = particle.trajectory.landingCurve.getPoint(progress);
          particle.position.lerpVectors(particle.landingTransitionStart, targetPosition, easedProgress);
        } else {
          // Normal curve following
          particle.position.copy(particle.trajectory.landingCurve.getPoint(progress));
        }

        // Tangent for orientation
        const tangent = particle.trajectory.landingCurve.getTangent(progress);
        particle.orientationController.updateCurveTangent(
          particle.position,
          tangent,
          scaledDelta
        );
        particle.quaternion.copy(particle.orientationController.getState().currentQuaternion);

        // Recycle particle
        if (progress >= 1) {
          particle.active = false;
        }
      }

      // -----------------------------------------------------------------------
      // TRAIL UPDATE
      // -----------------------------------------------------------------------
      if (source.visual.enableTrail) {
        particle.trail.push(particle.position.clone());
        if (particle.trail.length > (source.visual.trailLength || 50)) {
          particle.trail.shift();
        }
      }

      // -----------------------------------------------------------------------
      // UPDATE INSTANCED MESH
      // -----------------------------------------------------------------------
      if (instancedMeshRef.current) {
        const matrix = new THREE.Matrix4();
        matrix.compose(
          particle.position,
          particle.quaternion,
          new THREE.Vector3(particle.scale, particle.scale, particle.scale)
        );
        instancedMeshRef.current.setMatrixAt(index, matrix);
        instancedMeshRef.current.setColorAt(index, particle.color);
      }
    });

    // Update instance matrices
    if (instancedMeshRef.current) {
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  const totalParticles = particles.current.length;

  return (
    <group>
      {/* Instanced Mesh for all particles */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[modelGeometry, undefined, totalParticles]}
        frustumCulled={false}
      >
        <meshStandardMaterial />
      </instancedMesh>

      {/* Debug visualizations */}
      {config.visual.paths.showTakeoff && (
        <group>
          {Array.from(trajectories.values()).map((trajectory, idx) => {
            const points = trajectory.takeoffCurve.getPoints(50);
            return (
              <line key={`takeoff-${idx}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array(points.flatMap((p) => [p.x, p.y, p.z])), 3]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color={config.visual.paths.showTakeoff ? '#00ff00' : '#ffffff'} opacity={0.6} transparent />
              </line>
            );
          })}
        </group>
      )}

      {config.visual.paths.showOrbitCircle && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[config.orbit.center.x, config.orbit.center.y, config.orbit.center.z]}>
          <ringGeometry args={[config.orbit.radius - 0.2, config.orbit.radius + 0.2, 64]} />
          <meshBasicMaterial color="#0099ff" opacity={0.3} transparent side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
