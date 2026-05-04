'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { MULTI_SOURCE_ORBIT_CONFIG, COLLISION_BUBBLE_CONFIG } from './config/multi-source.config';

/**
 * Curved Takeoff → Orbit Showcase
 *
 * Based on Wawa Sensei Atmos tutorial:
 * - CubicBezierCurve3 for smooth curved takeoff path
 * - Phase transition: takeoff (curve-following) → orbit (force-based)
 * - InstancedMesh for 80 particles at 60fps
 *
 * @see https://wawasensei.dev/tuto/recreating-atmos-3d-website-with-react-three-fiber-part-1-curved-path
 */

interface CollisionEvent {
  timestamp: number;                   // Frame time of collision
  otherParticleId: number;            // Which particle
  severity: number;                   // 0-1 (how much overlap)
  resolution: 'repulsion' | 'speed-adjust' | 'radial-offset'; // How resolved
  durationFrames: number;             // Frames before resolution
}

interface Particle {
  // === Identity ===
  id: string;                          // Unique particle identifier
  sourceId: string;                    // Which source spawned this
  color: THREE.Color;                  // Particle color (set by source)

  // === Position & Motion ===
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  time: number;
  phase: 'takeoff' | 'orbit' | 'landing';

  // Orbit state
  orbitAngle: number;
  orbitTimeTotal: number;
  orbitSpeed: number;                  // Current angular velocity
  orbitalRadius: number;               // May vary with avoidance (radial)
  verticalOffset: number;              // Vertical displacement from nominal orbit (Y-axis)
  orbitInclination: number;            // Vertical angle for 3D donut distribution (phi in spherical coords)
  orbitVerticalPhase: number;          // Phase offset for vertical oscillation
  landingEligible: boolean;
  visible: boolean;

  // Orientation
  quaternion: THREE.Quaternion;        // NEW: Rotation
  forward: THREE.Vector3;              // NEW: Local Z (direction)
  up: THREE.Vector3;                   // NEW: Local Y (pitch)
  right: THREE.Vector3;                // NEW: Local X (bank)
  targetForward: THREE.Vector3;        // NEW: Target direction
  targetUp: THREE.Vector3;             // NEW: Target up
  bankingAngle: number;                // NEW: Roll (radians)
  targetBankingAngle: number;          // NEW: Target roll
  curvature: number;                   // NEW: Path curvature κ
  speedMagnitude: number;              // NEW: Velocity magnitude

  // Avoidance
  nearbyParticleCount: number;         // NEW: Collision detection
  avoidanceForce: THREE.Vector3;       // NEW: Repulsive force

  // === Exit system ===
  exitAttractionForce: THREE.Vector3;  // Attraction toward exit point
  distanceToExit: number;              // Current 3D distance to exit point
  missedExitCount: number;             // How many times passed exit without entering

  // === Collision bubble ===
  collisionBubbleRadius: number;      // Safe area radius (units)
  collisionBubbleType: 'soft' | 'hard';  // Soft = repulsion, Hard = bounce

  // === Collision tracking ===
  collisionCount: number;              // Total collisions this session
  collisionHistory: CollisionEvent[];  // Recent collision events
  currentCollisions: Set<number>;      // Particle indices currently overlapping
  collisionDepth: number;              // How deep into overlap (0-1, for severity)

  // === Physics ===
  repulsionForce: THREE.Vector3;      // Accumulated repulsive force
  repulsionAcceleration: THREE.Vector3; // Derived from force

  // Landing transition smoothing
  transitionStartPosition?: THREE.Vector3; // Position when transition started
  transitionProgress: number; // 0-1 progress through transition blend

  // === Trail visualization ===
  trail: THREE.Vector3[];                  // Recent positions for trail rendering
  trailMaxLength: number;                  // Maximum trail length
}

class OrbitSpatialGrid {
  sectors: Particle[][] = [];
  sectorCount: number;
  orbitRadius: number;
  orbitCenter: THREE.Vector3;

  constructor(sectorCount: number, orbitRadius: number, orbitCenter: THREE.Vector3) {
    this.sectorCount = sectorCount;
    this.orbitRadius = orbitRadius;
    this.orbitCenter = orbitCenter;
    this.sectors = Array(sectorCount).fill(null).map(() => []);
  }

  clear() {
    this.sectors.forEach(sector => sector.length = 0);
  }

  insert(particle: Particle) {
    if (particle.phase !== 'orbit' || !particle.visible) return;
    const normalized = ((particle.orbitAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const sector = Math.max(0, Math.min(
      Math.floor(normalized / (2 * Math.PI / this.sectorCount)),
      this.sectorCount - 1
    ));
    if (this.sectors[sector]) {
      this.sectors[sector].push(particle);
    }
  }

  query(angle: number, range: number): Particle[] {
    const results: Particle[] = [];
    if (!this.sectors || this.sectors.length === 0) return results;

    const startSector = Math.max(0, Math.floor(angle / (2 * Math.PI / this.sectorCount)));
    const sectorRange = Math.ceil(range / (2 * Math.PI / this.sectorCount)) + 1;

    for (let i = 0; i < sectorRange; i++) {
      const sector = (startSector + i) % this.sectorCount;
      if (sector >= 0 && sector < this.sectors.length && this.sectors[sector]) {
        results.push(...this.sectors[sector]);
      }
    }
    return results;
  }
}

// === COLLISION DETECTION FUNCTIONS ===

interface CollisionDetectionResult {
  collisions: Array<{ neighborId: number; distance: number; severity: number }>;
  totalRepulsionForce: THREE.Vector3;
  activeCollisionCount: number;
}

// Temp vectors for collision detection (reused across all calculations)
const _tempRepulsion = new THREE.Vector3();
const _tempTowardParticle = new THREE.Vector3();
const _tempDistance = new THREE.Vector3();

function calculateRepulsionForce(
  particle: Particle,
  neighbor: Particle,
  bubbleConfig: typeof COLLISION_BUBBLE_CONFIG
): THREE.Vector3 {
  _tempRepulsion.set(0, 0, 0);

  // Vector from neighbor to particle (repulsion direction) - reuse temp
  _tempTowardParticle.subVectors(particle.position, neighbor.position);
  const distance = _tempTowardParticle.length();

  // Early exit if too far
  if (distance > bubbleConfig.outerRadius) {
    return _tempRepulsion; // Zero force
  }

  // Normalized direction (normalize in place)
  const direction = _tempTowardParticle.normalize();

  // Repulsion force magnitude based on distance
  let forceMagnitude = 0;

  if (distance < bubbleConfig.innerRadius) {
    // === HARD CONTACT (maximum repulsion) ===
    forceMagnitude = bubbleConfig.repulsionStrength;
  } else if (distance < bubbleConfig.baseRadius) {
    // === SOFT BUBBLE (scaled repulsion) ===
    const overlap = 1 - (distance / bubbleConfig.baseRadius);

    // Apply falloff model
    switch (bubbleConfig.repulsionFalloff) {
      case 'linear':
        forceMagnitude = bubbleConfig.repulsionStrength * overlap;
        break;
      case 'quadratic':
        forceMagnitude = bubbleConfig.repulsionStrength * (overlap ** 2);
        break;
      case 'exponential':
        forceMagnitude = bubbleConfig.repulsionStrength * (Math.exp(overlap) - 1);
        break;
    }
  } else {
    // === DETECTION ZONE (weak repulsion) ===
    const proximity = 1 - ((distance - bubbleConfig.baseRadius) /
                          (bubbleConfig.outerRadius - bubbleConfig.baseRadius));
    forceMagnitude = bubbleConfig.repulsionStrength * 0.2 * proximity;
  }

  // Apply force (reuse _tempRepulsion)
  _tempRepulsion.copy(direction).multiplyScalar(forceMagnitude);

  return _tempRepulsion;
}

function detectCollisions(
  particle: Particle,
  allParticles: Particle[],
  spatialGrid: OrbitSpatialGrid,
  bubbleConfig: typeof COLLISION_BUBBLE_CONFIG
): CollisionDetectionResult {
  const result: CollisionDetectionResult = {
    collisions: [],
    totalRepulsionForce: new THREE.Vector3(),
    activeCollisionCount: 0,
  };

  // Query only nearby particles from spatial grid
  const neighbors = spatialGrid.query(
    particle.orbitAngle,
    bubbleConfig.outerRadius / particle.orbitalRadius
  );

  const previousCollisions = new Set(particle.currentCollisions);
  particle.currentCollisions.clear();

  neighbors.forEach(neighbor => {
    if (neighbor === particle) return;

    // Reuse _tempDistance to avoid allocation
    _tempDistance.subVectors(particle.position, neighbor.position);
    const distance = _tempDistance.length();

    if (distance > bubbleConfig.outerRadius) return;

    // Collision detected
    particle.currentCollisions.add(neighbors.indexOf(neighbor));

    // Calculate severity (0 = at outerRadius, 1 = at innerRadius)
    const severity = Math.max(
      0,
      1 - (distance / bubbleConfig.innerRadius)
    );

    result.collisions.push({
      neighborId: neighbors.indexOf(neighbor),
      distance,
      severity,
    });

    // Update depth (maximum overlap)
    particle.collisionDepth = Math.max(particle.collisionDepth, severity);

    // Accumulate repulsion force
    const repulsion = calculateRepulsionForce(particle, neighbor, bubbleConfig);
    result.totalRepulsionForce.add(repulsion);

    result.activeCollisionCount++;

    // === NEW COLLISION EVENT ===
    if (!previousCollisions.has(neighbors.indexOf(neighbor))) {
      particle.collisionCount++;
      particle.collisionHistory.push({
        timestamp: performance.now(),
        otherParticleId: neighbors.indexOf(neighbor),
        severity,
        resolution: 'repulsion',
        durationFrames: 0,
      });
    }
  });

  // Update event durations
  particle.collisionHistory.forEach(event => {
    event.durationFrames++;
  });

  // Prune old events (keep last 100 frames)
  if (particle.collisionHistory.length > 100) {
    particle.collisionHistory = particle.collisionHistory.slice(-100);
  }

  return result;
}

// Note: Configuration has been moved to config/multi-source.config.ts
// See MULTI_SOURCE_ORBIT_CONFIG for the new multi-source, multi-orbit system

/**
 * Drone model configuration for instanced rendering
 * Supports overridable scale, rotation, and position offsets
 */
interface DroneModelConfig {
  modelPath: string;
  scale?: number | [number, number, number];
  rotationOffset?: [number, number, number]; // Euler angles in radians
  positionOffset?: [number, number, number];
  // Native orientation preserved by default, overrides applied after
}

const DRONE_MODEL_CONFIG: DroneModelConfig = {
  modelPath: '/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb',
  scale: 0.8, // Uniform scale (or use [x, y, z] for non-uniform)
  rotationOffset: [0, Math.PI / 2, 0], // Rotate 90° around Y to face forward
  positionOffset: [0, 0, 0], // No position offset from particle center
};

/**
 * Hook to load and prepare drone geometry for instanced rendering
 * Clones geometry to avoid mutation, applies base transforms
 */
function useDroneGeometry(config: DroneModelConfig) {
  const { scene } = useGLTF(config.modelPath);

  return useMemo((): THREE.BufferGeometry => {
    // Find the first mesh in the loaded model
    let geometry: THREE.BufferGeometry | undefined;
    scene.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh && !geometry) {
        geometry = (child as THREE.Mesh).geometry as THREE.BufferGeometry;
      }
    });

    if (!geometry) {
      console.warn('No geometry found in drone model, using fallback');
      return new THREE.ConeGeometry(0.8, 2.5, 8);
    }

    // Clone to avoid mutating the original
    const clonedGeometry = geometry.clone();

    // Apply scale transformation
    const scaleVec = Array.isArray(config.scale)
      ? new THREE.Vector3(...config.scale)
      : new THREE.Vector3(config.scale || 1, config.scale || 1, config.scale || 1);
    clonedGeometry.scale(scaleVec.x, scaleVec.y, scaleVec.z);

    // Apply rotation offset (applied to geometry, not per-instance)
    if (config.rotationOffset) {
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationFromEuler(
        new THREE.Euler(...config.rotationOffset)
      );
      clonedGeometry.applyMatrix4(rotationMatrix);
    }

    // Apply position offset
    if (config.positionOffset) {
      clonedGeometry.translate(...config.positionOffset);
    }

    return clonedGeometry;
  }, [scene, config]);
}

interface CurvedTakeoffOrbitProps {
  config?: typeof MULTI_SOURCE_ORBIT_CONFIG;
  droneConfig?: DroneModelConfig;
}

export function CurvedTakeoffOrbit({
  config = MULTI_SOURCE_ORBIT_CONFIG,
  droneConfig = DRONE_MODEL_CONFIG
}: CurvedTakeoffOrbitProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef(0);
  const sourceSpawnersRef = useRef<Map<string, number>>(new Map());
  const spatialGridRef = useRef<OrbitSpatialGrid | null>(null);

  // Debug mode for collision visualization
  const debugMode = false;

  // Ensure exitZone config exists (with fallback for backward compatibility)
  const exitZoneConfig = config.exitZone || {
    radius: 4.0,
    attractionStrength: 0.15,
    attractionMaxDistance: 15.0,
    requireProximity: true,
  };

  // Load drone geometry for instancing
  const droneGeometry = useDroneGeometry(droneConfig);

  // Setup instance colors
  const colorArray = useMemo(() => {
    const colors = new Float32Array(config.particleCount * 3);
    // Initialize with white, will be updated per-particle
    for (let i = 0; i < config.particleCount; i++) {
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
    }
    return colors;
  }, [config.particleCount]);

  // ========================================================================
  // PERFORMANCE: Object pooling - Reusable temp objects (eliminates ~96K allocations/sec)
  // ========================================================================
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempVec1 = useMemo(() => new THREE.Vector3(), []);
  const tempVec2 = useMemo(() => new THREE.Vector3(), []);
  const tempVec3 = useMemo(() => new THREE.Vector3(), []);
  const tempVec4 = useMemo(() => new THREE.Vector3(), []);

  // Initialize spatial grid
  if (!spatialGridRef.current) {
    spatialGridRef.current = new OrbitSpatialGrid(config.avoidance.gridSectorCount, config.orbit.radius, config.orbit.center);
  }

  // Setup instance colors on mesh
  useEffect(() => {
    if (meshRef.current && !meshRef.current.instanceColor) {
      meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [colorArray]);

  // Initialize source spawners
  if (sourceSpawnersRef.current.size === 0) {
    config.sources.forEach(source => {
      sourceSpawnersRef.current.set(source.id, 0);
    });
  }

  // Create takeoff curves for each source
  const takeoffCurves = useMemo(() => {
    const curves = new Map<string, THREE.CatmullRomCurve3>();

    config.sources.forEach(source => {
      // Calculate orbit entry point
      const orbitEntryPoint = new THREE.Vector3(
        config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius,
        config.orbit.center.y,
        config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius
      );

      // Use provided waypoints or generate defaults
      // IMPORTANT: Preserve user-defined waypoints, only override final point
      const waypoints = source.takeoffWaypoints && source.takeoffWaypoints.length > 0
        ? [...source.takeoffWaypoints.map(w => w.clone())]
        : [
            source.gatePosition.clone(),
            new THREE.Vector3(
              (source.gatePosition.x + orbitEntryPoint.x) * 0.3,
              config.orbit.center.y * 0.5,
              (source.gatePosition.z + orbitEntryPoint.z) * 0.3
            ),
            new THREE.Vector3(
              (source.gatePosition.x + orbitEntryPoint.x) * 0.6,
              config.orbit.center.y * 0.9,
              (source.gatePosition.z + orbitEntryPoint.z) * 0.6
            ),
          ];

      // Always ensure final waypoint exactly matches orbit entry
      waypoints[waypoints.length] = orbitEntryPoint;

      curves.set(source.id, new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5));
    });

    return curves;
  }, [config]);

  // Create landing curves for each source (per-source "return home")
  const landingCurves = useMemo(() => {
    const curves = new Map<string, THREE.CatmullRomCurve3>();

    config.sources.forEach(source => {
      // Exit orbit at this source's entry angle
      const orbitExitPoint = new THREE.Vector3(
        config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius,
        config.orbit.center.y,
        config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius
      );

      // Create smooth landing curve back to gate
      // Use simple, natural waypoints (respect user's visual ratios)
      const landingWaypoints = [
        orbitExitPoint.clone(),
        // Mid-descent point
        new THREE.Vector3(
          (orbitExitPoint.x + source.gatePosition.x) * 0.65,
          config.orbit.center.y * 0.6,
          (orbitExitPoint.z + source.gatePosition.z) * 0.65
        ),
        // Final approach
        new THREE.Vector3(
          (orbitExitPoint.x + source.gatePosition.x) * 0.3,
          source.gatePosition.y + 5,
          (orbitExitPoint.z + source.gatePosition.z) * 0.3
        ),
        // Touch down
        source.gatePosition.clone()
      ];

      curves.set(source.id, new THREE.CatmullRomCurve3(landingWaypoints, false, 'catmullrom', 0.5));
    });

    return curves;
  }, [config]);

  // Cache per-source rotation offset quaternions (avoids per-frame allocations)
  const rotationOffsetQuats = useMemo(() => {
    const map = new Map<string, THREE.Quaternion>();
    config.sources.forEach(source => {
      if (source.modelOrientation?.rotationOffset) {
        const quat = new THREE.Quaternion();
        quat.setFromEuler(
          new THREE.Euler(...source.modelOrientation.rotationOffset)
        );
        map.set(source.id, quat);
      }
    });
    return map;
  }, [config]);

  // Cache per-source scale vectors (avoids per-frame allocations)
  const scaleVectors = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    config.sources.forEach(source => {
      const scale = new THREE.Vector3(1, 1, 1);
      if (source.modelOrientation?.scale) {
        if (typeof source.modelOrientation.scale === 'number') {
          scale.setScalar(source.modelOrientation.scale);
        } else {
          const [x, y, z] = source.modelOrientation.scale as [number, number, number];
          scale.set(x, y, z);
        }
      }
      map.set(source.id, scale);
    });
    return map;
  }, [config]);

  // Cache per-source position offset vectors (avoids per-frame allocations)
  const positionOffsets = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    config.sources.forEach(source => {
      if (source.modelOrientation?.positionOffset) {
        map.set(source.id, new THREE.Vector3(...source.modelOrientation.positionOffset));
      }
    });
    return map;
  }, [config]);

  // Initialize particles array once
  if (particlesRef.current.length === 0) {
    particlesRef.current = Array(config.particleCount)
      .fill(null)
      .map((_, idx) => ({
        // Identity
        id: `particle-${idx}-${Date.now()}`,
        sourceId: 'default',
        color: new THREE.Color('#ffffff'),

        // Position & Motion
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        time: 0,
        phase: 'takeoff' as const,

        // Orbit state
        orbitAngle: 0,
        orbitTimeTotal: 0,
        orbitSpeed: config.orbit.nominalSpeed,
        orbitalRadius: config.orbit.radius,
        verticalOffset: 0,
        orbitInclination: (Math.random() - 0.5) * Math.PI * 0.6, // ±54° vertical spread
        orbitVerticalPhase: Math.random() * Math.PI * 2, // Random phase for vertical movement
        landingEligible: false,
        visible: false,

        // Orientation
        quaternion: new THREE.Quaternion(),
        forward: new THREE.Vector3(0, 0, 1),
        up: new THREE.Vector3(0, 1, 0),
        right: new THREE.Vector3(1, 0, 0),
        targetForward: new THREE.Vector3(0, 0, 1),
        targetUp: new THREE.Vector3(0, 1, 0),
        bankingAngle: 0,
        targetBankingAngle: 0,
        curvature: 0,
        speedMagnitude: 0,

        // Avoidance
        nearbyParticleCount: 0,
        avoidanceForce: new THREE.Vector3(),

        // Exit system
        exitAttractionForce: new THREE.Vector3(),
        distanceToExit: 0,
        missedExitCount: 0,

        // Collision bubble
        collisionBubbleRadius: 3.0,
        collisionBubbleType: 'soft' as const,

        // Collision tracking
        collisionCount: 0,
        collisionHistory: [],
        currentCollisions: new Set(),
        collisionDepth: 0,

        // Physics
        repulsionForce: new THREE.Vector3(),
        repulsionAcceleration: new THREE.Vector3(),

        // Landing transition smoothing
        transitionProgress: 0,

        // Trail
        trail: [],
        trailMaxLength: 20, // Store last 20 positions
      }));
  }

  // ========================================================================
  // PARTICLE ORIENTATION SYSTEM - STABLE RADIAL UP
  // ========================================================================
  // Forward: Movement direction (tangent to orbit path)
  // Up: Points toward orbit center (radial inward) - with stability checks
  // Right: Cross product of Forward × Up
  // Result: Models "lean in" toward orbit center (no flipping)
  // PERFORMANCE: Uses function-scoped temp objects to eliminate allocations
  // ========================================================================
  const _orientForward = new THREE.Vector3();
  const _orientToCenter = new THREE.Vector3();
  const _orientWorldUp = new THREE.Vector3(0, 1, 0);
  const _orientRight = new THREE.Vector3();
  const _orientUp = new THREE.Vector3();
  const _orientMatrix = new THREE.Matrix4();
  const _orientTargetQuat = new THREE.Quaternion();

  const updateParticleOrientation = (
    particle: Particle,
    movementDirection: THREE.Vector3,
    phase: 'takeoff' | 'orbit' | 'landing',
    delta: number,
    modelOrientation?: any,
    orbitCenter?: THREE.Vector3
  ) => {
    // Check if orientation locking is disabled
    if (modelOrientation?.lockToTrail === false) {
      return; // Keep static orientation
    }

    // Normalize movement direction (reuse _orientForward)
    _orientForward.copy(movementDirection).normalize();

    if (_orientForward.length() < 0.001) return; // Skip if no movement

    // Calculate radial up vector (points toward orbit center) - reuse _orientToCenter
    if (orbitCenter) {
      _orientToCenter.subVectors(orbitCenter, particle.position).normalize();
    } else {
      _orientToCenter.copy(_orientWorldUp); // Fallback to world up
    }

    // Check if forward and toCenter are nearly parallel (causes flipping)
    const parallelThreshold = 0.99;
    const dot = Math.abs(_orientForward.dot(_orientToCenter));

    if (dot > parallelThreshold) {
      // Forward and radial are nearly parallel - use world up as fallback
      _orientRight.crossVectors(_orientForward, _orientWorldUp).normalize();
      _orientUp.crossVectors(_orientRight, _orientForward).normalize();
    } else {
      // Safe to use radial up
      _orientRight.crossVectors(_orientForward, _orientToCenter).normalize();

      // Check if right vector is valid
      if (_orientRight.length() < 0.001) {
        // Fallback to world up
        _orientRight.crossVectors(_orientForward, _orientWorldUp).normalize();
      }

      _orientUp.crossVectors(_orientRight, _orientForward).normalize();
    }

    // Build rotation matrix from orthonormal basis (reuse _orientMatrix)
    _orientMatrix.makeBasis(_orientRight, _orientUp, _orientForward);

    // Extract target quaternion (reuse _orientTargetQuat)
    _orientTargetQuat.setFromRotationMatrix(_orientMatrix);

    // Smooth interpolation (slerp with fixed damping factor)
    const smoothness = 0.1; // Lower = smoother (0.05-0.2 range)
    const lerpFactor = Math.min(1.0, smoothness);
    particle.quaternion.slerp(_orientTargetQuat, lerpFactor);
  };

  // ========================================================================
  // RESOURCE CLEANUP - Prevent memory leaks on component unmount
  // ========================================================================
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up CurvedTakeoffOrbit resources...');

      // Dispose geometries
      if (droneGeometry) {
        droneGeometry.dispose();
      }

      // Dispose instanced mesh materials and geometry
      if (meshRef.current) {
        if (meshRef.current.material) {
          if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach(mat => mat.dispose());
          } else {
            meshRef.current.material.dispose();
          }
        }
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
        if (meshRef.current.instanceColor) {
          meshRef.current.instanceColor = null;
        }
      }

      // Clear refs to prevent memory retention
      particlesRef.current = [];
      spawnTimerRef.current = 0;
      sourceSpawnersRef.current.clear();

      // Clear spatial grid
      if (spatialGridRef.current) {
        spatialGridRef.current.clear();
        spatialGridRef.current = null;
      }

      console.log('✅ CurvedTakeoffOrbit cleanup complete');
    };
  }, [droneGeometry]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Rebuild spatial grid each frame
    spatialGridRef.current!.clear();
    particlesRef.current.forEach(p => {
      if (p.visible && p.phase === 'orbit') {
        spatialGridRef.current!.insert(p);
      }
    });

    spawnTimerRef.current += delta;
    let visibleCount = 0;

    // Multi-source spawning
    config.sources.forEach(source => {
      const spawner = sourceSpawnersRef.current.get(source.id) || 0;
      const newSpawner = spawner + delta;

      if (newSpawner >= source.spawnRate) {
        const availableIdx = particlesRef.current.findIndex(p => !p.visible);
        if (availableIdx !== -1) {
          const particle = particlesRef.current[availableIdx];
          particle.visible = true;
          particle.time = 0;
          particle.phase = config.defaultStartPhase;
          particle.sourceId = source.id;
          particle.color.set(source.particleColor); // Set color from source
          particle.orbitTimeTotal = 0;
          particle.orbitAngle = source.orbitEntryAngle;
          particle.orbitSpeed = source.orbitEntryVelocity;
          particle.orbitalRadius = config.orbit.radius;
          particle.verticalOffset = 0; // Reset vertical offset
          particle.orbitInclination = (Math.random() - 0.5) * Math.PI * 0.6; // New random inclination
          particle.orbitVerticalPhase = Math.random() * Math.PI * 2; // New random phase
          particle.landingEligible = false;
          particle.transitionProgress = 0;

          if (particle.phase === 'takeoff') {
            particle.position.copy(source.gatePosition);
          } else if (particle.phase === 'orbit') {
            particle.position.x = config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius;
            particle.position.y = config.orbit.center.y;
            particle.position.z = config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius;
          } else if (particle.phase === 'landing') {
            const orbitExitPoint = new THREE.Vector3(
              config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius,
              config.orbit.center.y,
              config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius
            );
            particle.position.copy(orbitExitPoint);
            particle.landingEligible = true;
            particle.transitionProgress = 1;
          }
        }
        sourceSpawnersRef.current.set(source.id, 0);
      } else {
        sourceSpawnersRef.current.set(source.id, newSpawner);
      }
    });

    particlesRef.current.forEach((particle, idx) => {
      // ========================================================================
      // Process visible particles
      // ========================================================================

      if (!particle.visible) return;
      visibleCount++;

      // ========================================================================
      // CORE TECHNIQUE #2: Phase 1 - Follow Bezier curve (takeoff)
      // ========================================================================
      if (particle.phase === 'takeoff') {
        const source = config.sources.find(s => s.id === particle.sourceId);
        if (!source) return;

        const curve = takeoffCurves.get(source.id);
        if (!curve) return;

        const progress = Math.min(particle.time / source.takeoffDuration, 1);
        const newPosition = curve.getPoint(progress);

        // Use curve tangent for stable tangent-space orientation (Frenet frame)
        const tangent = curve.getTangent(progress);
        particle.position.copy(newPosition);

        // Update orientation using curve tangent (more stable than position delta)
        if (tangent.length() > 0.001) {
          updateParticleOrientation(particle, tangent, 'takeoff', delta, source.modelOrientation, config.orbit.center);
        }

        if (progress >= 1) {
          particle.phase = 'orbit';
          particle.orbitAngle = source.orbitEntryAngle;
          particle.orbitSpeed = source.orbitEntryVelocity;
        }
      }
      // ========================================================================
      // CORE TECHNIQUE #3: Phase 2 - Smooth orbital motion with collision avoidance (orbit)
      // ========================================================================
      else if (particle.phase === 'orbit') {
        particle.orbitTimeTotal += delta;

        // === COLLISION DETECTION ===
        const collisionResult = detectCollisions(
          particle,
          particlesRef.current,
          spatialGridRef.current!,
          COLLISION_BUBBLE_CONFIG
        );

        particle.repulsionForce.copy(collisionResult.totalRepulsionForce);

        // Convert force to orbit parameters
        // For circular orbit, force has tangential and radial components

        if (collisionResult.activeCollisionCount > 0) {
          // === RESPONSE STRATEGY 1: Tangential Speed Adjustment ===
          // Project repulsion onto tangent direction (reuse tempVec2, tempVec3)
          tempVec2.set(
            particle.position.x - config.orbit.center.x,
            0,
            particle.position.z - config.orbit.center.z
          ).normalize();

          tempVec3.set(-tempVec2.z, 0, tempVec2.x);
          const tangentialComponent = particle.repulsionForce.dot(tempVec3);

          // Speed adjustment proportional to tangential force
          const speedAdjustment = tangentialComponent / (config.orbit.radius * config.orbit.radius);
          particle.orbitSpeed = Math.max(
            config.orbit.nominalSpeed * 0.4,
            Math.min(config.orbit.nominalSpeed * 1.6, particle.orbitSpeed + speedAdjustment * delta)
          );

          // === RESPONSE STRATEGY 2: Radial Offset ===
          // Project repulsion onto radial direction (reuse tempVec2)
          const radialComponent = particle.repulsionForce.dot(tempVec2);

          // Radial offset scaled by repulsion magnitude
          const radialOffset = (radialComponent / collisionResult.activeCollisionCount) * delta;
          particle.orbitalRadius = Math.max(
            config.orbit.radius * 0.7,
            Math.min(config.orbit.radius * 1.3, particle.orbitalRadius + radialOffset)
          );

          // === RESPONSE STRATEGY 3: Vertical Offset (Y-Axis) ===
          if (config.avoidance.allowVerticalAdjustment) {
            // Apply vertical force based on collision severity
            const verticalForce = particle.repulsionForce.y * config.avoidance.verticalAdjustmentStrength;
            particle.verticalOffset += verticalForce * delta;

            // Clamp to max offset
            particle.verticalOffset = Math.max(
              -config.avoidance.maxVerticalOffset,
              Math.min(config.avoidance.maxVerticalOffset, particle.verticalOffset)
            );
          }

          // === SEVERITY-BASED RESPONSE ===
          if (particle.collisionDepth > 0.8) {
            // CRITICAL: Multiple response mechanisms
            particle.orbitSpeed *= 0.9;  // Slow down more aggressively
            particle.orbitalRadius += Math.sign(radialComponent) * 0.5; // Larger offset

            console.warn(
              `⚠️ Critical collision for particle: ` +
              `depth=${particle.collisionDepth.toFixed(2)}, ` +
              `count=${collisionResult.activeCollisionCount}`
            );
          } else if (particle.collisionDepth > 0.5) {
            // WARNING: Moderate response
            particle.orbitSpeed *= 0.95;
            particle.orbitalRadius += Math.sign(radialComponent) * 0.2;
          }
        } else {
          // No collision: reset depth and return to nominal values
          particle.collisionDepth = Math.max(0, particle.collisionDepth - 0.1);
          particle.orbitSpeed = config.orbit.nominalSpeed;
          particle.orbitalRadius = config.orbit.radius;

          // Gradually return to nominal vertical position
          particle.verticalOffset *= 0.95; // Decay back to center
        }

        // === UPDATE POSITION (with adjusted speed/radius/vertical) ===
        particle.orbitAngle += particle.orbitSpeed * delta;

        // === 3D DONUT/SPHERE DISTRIBUTION ===
        // Use spherical coordinates for vertical distribution
        // This creates a donut/torus shape where particles orbit at different heights
        const verticalRadius = particle.orbitalRadius * Math.cos(particle.orbitInclination);
        const heightFromInclination = particle.orbitalRadius * Math.sin(particle.orbitInclination);

        // Add oscillating vertical movement for more dynamic 3D motion
        const verticalOscillation = Math.sin(particle.orbitAngle + particle.orbitVerticalPhase) *
                                    config.orbitHeightVariation * 2.0; // Increased for more visible 3D effect

        particle.position.x = config.orbit.center.x + Math.cos(particle.orbitAngle) * verticalRadius;
        particle.position.z = config.orbit.center.z + Math.sin(particle.orbitAngle) * verticalRadius;
        particle.position.y = config.orbit.center.y
          + heightFromInclination              // Base height from inclination
          + verticalOscillation                 // Dynamic vertical movement
          + particle.verticalOffset;            // Collision avoidance offset

        // Calculate tangential movement direction for orientation (perpendicular to radius)
        // Reuse tempVec2, tempVec3
        tempVec2.set(
          -Math.sin(particle.orbitAngle) * verticalRadius,
          0, // Will be updated by vertical oscillation derivative
          Math.cos(particle.orbitAngle) * verticalRadius
        ).normalize();

        // Add vertical component from oscillation derivative
        const verticalVelocity = Math.cos(particle.orbitAngle + particle.orbitVerticalPhase) *
                                 config.orbitHeightVariation * 2.0 * particle.orbitSpeed;
        tempVec3.set(
          tempVec2.x,
          verticalVelocity,
          tempVec2.z
        );

        // Update orientation to point tangent to orbit
        const source = config.sources.find(s => s.id === particle.sourceId);
        updateParticleOrientation(particle, tempVec3, 'orbit', delta, source?.modelOrientation, config.orbit.center);

        // Mark eligible for landing after duration threshold met
        if (particle.orbitTimeTotal >= config.orbitDuration) {
          particle.landingEligible = true;
        }

        // === AREA-BASED EXIT SYSTEM ===
        // Gradual attraction toward exit point once eligible
        if (particle.landingEligible) {
          const source = config.sources.find(s => s.id === particle.sourceId);
          if (!source) return;

          // Calculate exit point (where this particle entered orbit) - reuse tempVec2
          tempVec2.set(
            config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius,
            config.orbit.center.y,
            config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius
          );

          // Store previous distance for missed exit detection
          const previousDistanceToExit = particle.distanceToExit;

          // Calculate 3D distance to exit point
          particle.distanceToExit = particle.position.distanceTo(tempVec2);

          // Apply attraction force if within max distance
          if (particle.distanceToExit < exitZoneConfig.attractionMaxDistance) {
            // Reuse tempVec3 for toExit
            tempVec3.subVectors(tempVec2, particle.position);
            const attractionMagnitude = exitZoneConfig.attractionStrength *
                                        (1 - particle.distanceToExit / exitZoneConfig.attractionMaxDistance);
            particle.exitAttractionForce.copy(tempVec3.normalize().multiplyScalar(attractionMagnitude));

            // Apply force to position (blend with orbital motion) - reuse tempVec4
            tempVec4.copy(particle.exitAttractionForce).multiplyScalar(delta);
            particle.position.add(tempVec4);
          }

          // Detect missed exit (moved away from exit after being near)
          if (previousDistanceToExit > 0 && // Not first frame
              previousDistanceToExit < exitZoneConfig.radius * 2 &&
              particle.distanceToExit > exitZoneConfig.radius * 2) {
            // Drone moved away from exit - missed it
            particle.missedExitCount++;

            // Extend orbit time on miss (give 2 more seconds to retry)
            particle.orbitTimeTotal = config.orbitDuration - 2.0;
          }

          // Transition to landing when inside exit zone
          if (particle.distanceToExit < exitZoneConfig.radius) {
            particle.phase = 'landing';
            particle.time = 0;
            particle.landingEligible = false;

            // Store the starting position for smooth blending transition
            if (!particle.transitionStartPosition) {
              particle.transitionStartPosition = new THREE.Vector3();
            }
            particle.transitionStartPosition.copy(particle.position);
            particle.transitionProgress = 0;
          }
        }
      }
      // ========================================================================
      // CORE TECHNIQUE #4: Phase 3 - Curved landing descent
      // ========================================================================
      else if (particle.phase === 'landing') {
        // Handle smooth transition blending from orbit to landing curve
        if (particle.transitionProgress < 1 && particle.transitionStartPosition) {
          // Calculate target position on landing curve (accounting for transition time)
          const landingProgress = Math.min(particle.time / config.landingDuration, 1);
          const landingCurve = landingCurves.get(particle.sourceId);
          if (!landingCurve) return;

          const targetPosition = landingCurve.getPoint(landingProgress);

          // Get landing curve tangent for stable orientation
          const landingTangent = landingCurve.getTangent(landingProgress);

          // Store old position for movement direction - reuse tempVec2
          tempVec2.copy(particle.position);

          // Smooth interpolation using easing function
          const easedProgress = 1 - Math.pow(1 - particle.transitionProgress, 3); // Cubic ease-out
          particle.position.lerpVectors(
            particle.transitionStartPosition,
            targetPosition,
            easedProgress
          );

          // Interpolate between orbit direction and landing tangent - reuse tempVec3, tempVec4
          tempVec3.subVectors(particle.position, tempVec2);
          tempVec4.lerpVectors(tempVec3, landingTangent, easedProgress);

          if (tempVec4.length() > 0.001) {
            const source = config.sources.find(s => s.id === particle.sourceId);
            updateParticleOrientation(particle, tempVec4, 'landing', delta, source?.modelOrientation, config.orbit.center);
          }

          // Update transition progress
          particle.transitionProgress = Math.min(
            particle.transitionProgress + (delta / 0.5),
            1
          );
        } else {
          // Normal landing curve following after transition is complete
          const progress = Math.min(particle.time / config.landingDuration, 1);
          const landingCurve = landingCurves.get(particle.sourceId);
          if (!landingCurve) return;

          // Use curve tangent for stable tangent-space orientation
          const tangent = landingCurve.getTangent(progress);

          particle.position.copy(landingCurve.getPoint(progress));

          // Update orientation using curve tangent
          if (tangent.length() > 0.001) {
            const source = config.sources.find(s => s.id === particle.sourceId);
            updateParticleOrientation(particle, tangent, 'landing', delta, source?.modelOrientation, config.orbit.center);
          }
        }

        // Cycle back to spawn when landing complete
        if (particle.time >= config.landingDuration) {
          particle.visible = false;
        }
      }

      particle.time += delta;

      // === Update Trail ===
      // Add current position to trail
      if (particle.visible) {
        particle.trail.push(particle.position.clone());
        // Keep trail at max length
        if (particle.trail.length > particle.trailMaxLength) {
          particle.trail.shift();
        }
      }

      // ========================================================================
      // Update InstancedMesh matrix for GPU rendering with quaternion rotation
      // Apply per-source model orientation (scale, rotation offset, position offset)
      // PERFORMANCE: Uses temp objects to eliminate allocations (was ~96K/sec, now 0)
      // ========================================================================
      const source = config.sources.find(s => s.id === particle.sourceId);

      // Get cached source-specific scale (no allocation)
      const scale = scaleVectors.get(source?.id || '') || new THREE.Vector3(1, 1, 1);

      // Compose final quaternion with cached rotation offset (reuse tempQuat)
      tempQuat.copy(particle.quaternion);
      const offsetQuat = rotationOffsetQuats.get(source?.id || '');
      if (offsetQuat) {
        tempQuat.multiply(offsetQuat);
        // Normalize to prevent drift from floating point errors
        tempQuat.normalize();
      }

      // Apply cached position offset in local space (reuse tempPos, tempVec1)
      tempPos.copy(particle.position);
      const positionOffset = positionOffsets.get(source?.id || '');
      if (positionOffset) {
        // Rotate the offset by the particle's orientation so it follows the model
        tempVec1.copy(positionOffset).applyQuaternion(particle.quaternion);
        tempPos.add(tempVec1);
      }

      // Compose final matrix (reuse tempMatrix)
      tempMatrix.compose(tempPos, tempQuat, scale);
      meshRef.current!.setMatrixAt(idx, tempMatrix);

      // Update instance color
      colorArray[idx * 3] = particle.color.r;
      colorArray[idx * 3 + 1] = particle.color.g;
      colorArray[idx * 3 + 2] = particle.color.b;
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = visibleCount;

    // Update instance colors
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* ===================================================================== */}
      {/* Particle instances - Drone models */}
      {/* ===================================================================== */}
      <instancedMesh
        ref={meshRef}
        args={[droneGeometry, undefined, config.particleCount]}
      >
        <meshStandardMaterial
          color="#ffffff" // Base white color for vertex color multiplication
          vertexColors // Enable per-instance colors
          emissive="#ffffff" // Emissive follows vertex colors
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.4}
        />
      </instancedMesh>

      {/* ===================================================================== */}
      {/* Particle Trails - visualize movement direction */}
      {/* ===================================================================== */}
      {particlesRef.current
        .filter(p => p.visible && p.trail.length > 1)
        .map((particle, idx) => {
          const points = particle.trail;
          if (points.length < 2) return null;

          return (
            <line key={`trail-${particle.id}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
                  count={points.length}
                  array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={particle.color}
                opacity={0.4}
                transparent
                linewidth={2}
              />
            </line>
          );
        })}

      {/* ===================================================================== */}
      {/* Takeoff curves visualization - render each source curve */}
      {/* ===================================================================== */}
      {Array.from(takeoffCurves.entries()).map(([sourceId, curve]) => (
        <mesh key={`takeoff-${sourceId}`}>
          <tubeGeometry args={[curve, 128, 0.3, 8, false]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.3}
            opacity={0.9}
            transparent
            side={2}
          />
        </mesh>
      ))}

      {/* ===================================================================== */}
      {/* Landing curves visualization - Per-source return home paths */}
      {/* ===================================================================== */}
      {Array.from(landingCurves.entries()).map(([sourceId, curve]) => (
        <mesh key={`landing-${sourceId}`}>
          <tubeGeometry args={[curve, 128, 0.3, 8, false]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.3}
            opacity={0.7}
            transparent
            side={2}
          />
        </mesh>
      ))}

      {/* ===================================================================== */}
      {/* Orbit path visualization - Torus visible from all angles */}
      {/* ===================================================================== */}
      <mesh position={[config.orbit.center.x, config.orbit.center.y, config.orbit.center.z]}>
        <torusGeometry args={[config.orbit.radius, 0.25, 16, 128]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.2}
          opacity={0.6}
          transparent
          side={2}
        />
      </mesh>

      {/* Gate position markers (spawn points per source) */}
      {config.sources.map(source => (
        <mesh key={`gate-${source.id}`} position={[source.gatePosition.x, source.gatePosition.y, source.gatePosition.z]}>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial color={source.particleColor} opacity={0.7} transparent />
        </mesh>
      ))}

      {/* Orbit center marker */}
      <mesh position={[config.orbit.center.x, config.orbit.center.y, config.orbit.center.z]}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial color="#10b981" opacity={0.6} transparent />
      </mesh>

      {/* ===================================================================== */}
      {/* Landing entry/exit point marker (where particles transition to landing) */}
      {/* ===================================================================== */}
      {/* Landing entry/exit points per source */}
      {config.sources.map(source => (
        <mesh
          key={`exit-${source.id}`}
          position={[
            config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius,
            config.orbit.center.y + 5,
            config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius,
          ]}
        >
          <sphereGeometry args={[2, 16, 16]} />
          <meshStandardMaterial color={source.particleColor} emissive={source.particleColor} emissiveIntensity={0.8} opacity={0.9} transparent />
        </mesh>
      ))}

      {/* ===================================================================== */}
      {/* Exit zone visualization - Proximity-based exit areas */}
      {/* ===================================================================== */}
      {config.sources.map(source => {
        const exitPoint = new THREE.Vector3(
          config.orbit.center.x + Math.cos(source.orbitEntryAngle) * config.orbit.radius,
          config.orbit.center.y,
          config.orbit.center.z + Math.sin(source.orbitEntryAngle) * config.orbit.radius
        );

        return (
          <mesh key={`exit-zone-${source.id}`} position={exitPoint}>
            <sphereGeometry args={[exitZoneConfig.radius, 16, 16]} />
            <meshStandardMaterial
              color={source.particleColor}
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        );
      })}

      {/* Landing entry zone indicator - transparent cylinder showing tolerance zone */}
      <mesh
        position={[
          config.orbit.center.x,
          config.orbit.center.y + 5,
          config.orbit.center.z,
        ]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[config.orbit.radius + 3, config.orbit.radius + 3, 1, 32]} />
        <meshStandardMaterial color="#00ff00" opacity={0.15} transparent />
      </mesh>

      {/* ===================================================================== */}
      {/* Takeoff waypoint markers per source */}
      {/* ===================================================================== */}
      {config.sources.flatMap(source =>
        source.takeoffWaypoints.map((waypoint, idx) => (
          <mesh key={`takeoff-waypoint-${source.id}-${idx}`} position={[waypoint.x, waypoint.y, waypoint.z]}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshBasicMaterial
              color={source.particleColor}
              opacity={0.5}
              transparent
            />
          </mesh>
        ))
      )}

      {/* ===================================================================== */}
      {/* Landing waypoint markers */}
      {/* ===================================================================== */}
      {config.landingWaypoints.map((waypoint, idx) => (
        <mesh key={`waypoint-${idx}`} position={[waypoint.x, waypoint.y, waypoint.z]}>
          <sphereGeometry args={[1.2, 12, 12]} />
          <meshStandardMaterial
            color={idx === config.landingWaypoints.length - 1 ? '#fbbf24' : '#ef4444'}
            emissive={idx === config.landingWaypoints.length - 1 ? '#ca8a04' : '#dc2626'}
            emissiveIntensity={0.3}
            opacity={0.7}
            transparent
          />
        </mesh>
      ))}

      {/* ===================================================================== */}
      {/* Ground plane */}
      {/* ===================================================================== */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* ===================================================================== */}
      {/* Debug: Collision bubble visualization */}
      {/* ===================================================================== */}
      {debugMode && (
        <>
          {particlesRef.current.map((particle, idx) => {
            if (!particle.visible || particle.phase !== 'orbit') return null;

            const bubbleColor = particle.currentCollisions.size > 0
              ? particle.collisionDepth > 0.8 ? '#ff0000' : '#ffaa00'  // Red or orange
              : '#00ff00';  // Green

            return (
              <mesh
                key={`bubble-${idx}`}
                position={particle.position}
                scale={COLLISION_BUBBLE_CONFIG.outerRadius}
              >
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial
                  color={bubbleColor}
                  wireframe
                  transparent
                  opacity={0.3}
                />
              </mesh>
            );
          })}
        </>
      )}

      {/* ===================================================================== */}
      {/* Debug: Collision stats overlay */}
      {/* ===================================================================== */}
      {debugMode && (
        <div style={{
          position: 'absolute',
          top: 100,
          left: 10,
          color: 'white',
          fontSize: '12px',
          fontFamily: 'monospace',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px',
        }}>
          <div><strong>Collision Stats</strong></div>
          <div>Total Particles: {particlesRef.current.filter(p => p.visible).length}</div>
          <div>Orbiting: {particlesRef.current.filter(p => p.visible && p.phase === 'orbit').length}</div>
          <div>Active Collisions: {particlesRef.current.reduce((sum, p) => sum + p.currentCollisions.size, 0)}</div>
          <div>Max Collision Depth: {Math.max(...particlesRef.current.map(p => p.collisionDepth)).toFixed(2)}</div>
        </div>
      )}
    </group>
  );
}

// Preload the drone model for optimal performance
useGLTF.preload(DRONE_MODEL_CONFIG.modelPath);
