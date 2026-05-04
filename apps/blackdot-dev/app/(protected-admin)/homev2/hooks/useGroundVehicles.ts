/**
 * Ground Vehicle System Hook
 * Handles 2D plane movement for ground vehicles
 * Follows the same pattern as V3 Extended system
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type {
  GroundVehicleConfig,
  GroundPath,
  GroundWaypoint,
  GroundFleet,
} from '../config/scene.config';
import { SpatialGrid, getCollisionAvoidanceGeneric } from '../utils/spatialGrid';

export interface GroundVehicle {
  id: string;
  fleetId: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;

  // Path following
  currentPathId: string | null;
  pathProgress: number; // 0-1 along path
  pathCurve: THREE.CatmullRomCurve3 | null;

  // State
  state: 'idle' | 'moving' | 'waiting' | 'loading';
  speed: number;
  targetSpeed: number;

  // Collision
  collisionRadius: number;

  // Stats
  stats: {
    spawnTime: number;
    totalDistance: number;
    pathsCompleted: number;
  };
}

/**
 * Cached curve data for performance optimization
 * Pre-samples curve points and tangents to avoid expensive runtime calculations
 */
export interface CachedCurve {
  pathId: string;
  samples: THREE.Vector3[]; // Pre-sampled positions
  tangentSamples: THREE.Vector3[]; // Pre-sampled tangents
  sampleCount: number;
  curveLength: number;
}

export interface UseGroundVehiclesProps {
  config: GroundVehicleConfig;
  enabled?: boolean;
}

/**
 * Fleet instance data for multi-fleet rendering
 */
export interface FleetInstance {
  fleetId: string;
  fleetConfig: GroundFleet;
  vehicles: GroundVehicle[];
  instancedMeshRef: React.RefObject<THREE.InstancedMesh>;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
}

/**
 * Create a cached curve from a path with pre-sampled points and tangents
 * @param pathId - Unique identifier for the path
 * @param curve - Three.js CatmullRomCurve3
 * @param sampleCount - Number of samples to cache (default: 150)
 */
function createCachedCurve(
  pathId: string,
  curve: THREE.CatmullRomCurve3,
  sampleCount: number = 150
): CachedCurve {
  const samples: THREE.Vector3[] = [];
  const tangentSamples: THREE.Vector3[] = [];
  const curveLength = curve.getLength();

  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1); // 0 to 1
    samples.push(curve.getPoint(t).clone());
    tangentSamples.push(curve.getTangent(t).clone().normalize());
  }

  return {
    pathId,
    samples,
    tangentSamples,
    sampleCount,
    curveLength,
  };
}

/**
 * Get interpolated position from cached curve samples
 * @param cache - Cached curve data
 * @param progress - Progress along curve (0-1)
 */
function getCurvePointInterpolated(cache: CachedCurve, progress: number): THREE.Vector3 {
  const t = Math.max(0, Math.min(1, progress)); // Clamp to [0, 1]
  const floatIndex = t * (cache.sampleCount - 1);
  const index = Math.floor(floatIndex);
  const fraction = floatIndex - index;

  // Handle edge case: exactly at end
  if (index >= cache.sampleCount - 1) {
    return cache.samples[cache.sampleCount - 1].clone();
  }

  // Linear interpolation between samples
  const p1 = cache.samples[index];
  const p2 = cache.samples[index + 1];
  return p1.clone().lerp(p2, fraction);
}

/**
 * Get interpolated tangent from cached curve samples
 * @param cache - Cached curve data
 * @param progress - Progress along curve (0-1)
 */
function getCurveTangentInterpolated(cache: CachedCurve, progress: number): THREE.Vector3 {
  const t = Math.max(0, Math.min(1, progress)); // Clamp to [0, 1]
  const floatIndex = t * (cache.sampleCount - 1);
  const index = Math.floor(floatIndex);
  const fraction = floatIndex - index;

  // Handle edge case: exactly at end
  if (index >= cache.sampleCount - 1) {
    return cache.tangentSamples[cache.sampleCount - 1].clone();
  }

  // Linear interpolation between tangent samples
  const t1 = cache.tangentSamples[index];
  const t2 = cache.tangentSamples[index + 1];
  return t1.clone().lerp(t2, fraction).normalize();
}

export function useGroundVehicles({ config, enabled = true }: UseGroundVehiclesProps) {
  const vehiclesRef = useRef<GroundVehicle[]>([]);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  // Multi-fleet architecture: one InstancedMesh per fleet
  const fleetInstancesRef = useRef<Map<string, FleetInstance>>(new Map());

  // Curve cache for performance optimization
  const curveCacheRef = useRef<Map<string, CachedCurve>>(new Map());

  // Spatial grid for collision detection optimization (O(n²) → O(n))
  const spatialGridRef = useRef<SpatialGrid<GroundVehicle>>(
    new SpatialGrid<GroundVehicle>(15) // 15-unit grid cells
  );

  // Initialize vehicles on mount
  const vehicles = useMemo(() => {
    if (!enabled || !config.enabled) return [];

    const allVehicles: GroundVehicle[] = [];
    let vehicleId = 0;

    // Create vehicles for each fleet
    Object.values(config.groundFleets).forEach((fleet: GroundFleet) => {
      for (let i = 0; i < fleet.vehicleCount; i++) {
        const spawnPoint = fleet.spawnPoints[i % fleet.spawnPoints.length];

        allVehicles.push({
          id: `ground-vehicle-${vehicleId++}`,
          fleetId: fleet.id,
          position: new THREE.Vector3(
            spawnPoint.position[0],
            config.groundPhysics.groundLevel,
            spawnPoint.position[1]
          ),
          velocity: new THREE.Vector3(0, 0, 0),
          rotation: new THREE.Euler(0, spawnPoint.orientation, 0),

          currentPathId: fleet.defaultPath || null,
          pathProgress: 0,
          pathCurve: null,

          state: 'idle',
          speed: 0,
          targetSpeed: fleet.behavior.cruiseSpeed,

          collisionRadius: fleet.collision.radius,

          stats: {
            spawnTime: Date.now(),
            totalDistance: 0,
            pathsCompleted: 0,
          },
        });
      }
    });

    // Initialize path curves and cache them
    allVehicles.forEach(vehicle => {
      if (vehicle.currentPathId) {
        const path = config.groundPaths[vehicle.currentPathId];
        if (path) {
          vehicle.pathCurve = createGroundPathCurve(path, config);
          vehicle.state = 'moving';

          // Create cached curve if not already cached
          if (!curveCacheRef.current.has(vehicle.currentPathId)) {
            const cachedCurve = createCachedCurve(
              vehicle.currentPathId,
              vehicle.pathCurve,
              150 // Default sample count
            );
            curveCacheRef.current.set(vehicle.currentPathId, cachedCurve);
          }
        }
      }
    });

    return allVehicles;
  }, [config, enabled]);

  // Store vehicles in ref
  vehiclesRef.current = vehicles;

  // Create fleet instances (one InstancedMesh per fleet)
  const fleetInstances = useMemo(() => {
    if (!enabled || !config.enabled) return new Map<string, FleetInstance>();

    const instances = new Map<string, FleetInstance>();

    // Group vehicles by fleet
    const vehiclesByFleet = new Map<string, GroundVehicle[]>();
    vehicles.forEach(vehicle => {
      if (!vehiclesByFleet.has(vehicle.fleetId)) {
        vehiclesByFleet.set(vehicle.fleetId, []);
      }
      vehiclesByFleet.get(vehicle.fleetId)!.push(vehicle);
    });

    // Create fleet instance for each fleet
    vehiclesByFleet.forEach((fleetVehicles, fleetId) => {
      const fleetConfig = config.groundFleets[fleetId];
      if (!fleetConfig) return;

      // Create geometry (box for now, can be replaced with GLTF later)
      const geometry = new THREE.BoxGeometry(2, 1, 3);

      // Create per-fleet material with unique color
      const material = new THREE.MeshStandardMaterial({
        color: fleetConfig.color,
        emissive: fleetConfig.emissive,
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.7,
      });

      instances.set(fleetId, {
        fleetId,
        fleetConfig,
        vehicles: fleetVehicles,
        instancedMeshRef: { current: null } as unknown as React.RefObject<THREE.InstancedMesh>,
        geometry,
        material,
      });
    });

    // Store in ref for frame loop access
    fleetInstancesRef.current = instances;

    return instances;
  }, [vehicles, config, enabled]);

  // Frame counter for update throttling
  const frameCountRef = useRef(0);
  const frustumRef = useRef(new THREE.Frustum());
  const projectionMatrixRef = useRef(new THREE.Matrix4());

  // Update loop with frustum culling (multi-fleet)
  useFrame((state, delta) => {
    if (!enabled || !config.enabled || vehicles.length === 0) return;
    if (fleetInstancesRef.current.size === 0) return;

    const groundLevel = config.groundPhysics.groundLevel;
    const camera = state.camera;
    frameCountRef.current++;

    // Update frustum from camera
    projectionMatrixRef.current.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustumRef.current.setFromProjectionMatrix(projectionMatrixRef.current);

    // Update spatial grid for collision detection (filter out idle vehicles)
    spatialGridRef.current.update(
      vehicles,
      (vehicle) => vehicle.state !== 'idle' && vehicle.state !== 'waiting'
    );

    // Update each fleet's instances
    fleetInstancesRef.current.forEach((fleetInstance) => {
      const instancedMesh = fleetInstance.instancedMeshRef.current;
      if (!instancedMesh) return;

      fleetInstance.vehicles.forEach((vehicle, localIndex) => {
        // Frustum culling - skip vehicles outside view
        if (!frustumRef.current.containsPoint(vehicle.position)) {
          // Still update matrix for off-screen vehicles but don't simulate movement
          tempObject.position.copy(vehicle.position);
          tempObject.position.y = groundLevel;
          tempObject.rotation.copy(vehicle.rotation);
          tempObject.updateMatrix();
          instancedMesh.setMatrixAt(localIndex, tempObject.matrix);
          return;
        }

        // Distance-based update throttling for visible vehicles
        const distanceToCamera = vehicle.position.distanceTo(camera.position);

        // Very far vehicles (>150 units) - update every 4th frame
        if (distanceToCamera > 150 && frameCountRef.current % 4 !== 0) {
          return;
        }

        // Far vehicles (>80 units) - update every 2nd frame
        if (distanceToCamera > 80 && frameCountRef.current % 2 !== 0) {
          return;
        }

        // Near and medium distance vehicles - update every frame
        // Update vehicle state
        updateGroundVehicle(vehicle, delta, config, curveCacheRef.current, spatialGridRef.current);

        // Update instance matrix
        tempObject.position.copy(vehicle.position);
        tempObject.position.y = groundLevel;
        tempObject.rotation.copy(vehicle.rotation);
        tempObject.updateMatrix();
        instancedMesh.setMatrixAt(localIndex, tempObject.matrix);
      });

      instancedMesh.instanceMatrix.needsUpdate = true;
    });
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Dispose of all path curves
      vehicles.forEach(vehicle => {
        if (vehicle.pathCurve) {
          // CatmullRomCurve3 doesn't have dispose, but we can clear references
          vehicle.pathCurve = null;
        }
      });

      // Dispose of fleet instance geometries and materials
      fleetInstancesRef.current.forEach((fleetInstance) => {
        fleetInstance.geometry.dispose();
        fleetInstance.material.dispose();
      });
      fleetInstancesRef.current.clear();
    };
  }, [vehicles]);

  return {
    vehicles,
    fleetInstances,
    vehicleCount: vehicles.length,
    fleetCount: fleetInstances.size,
  };
}

/**
 * Create a 3D curve from ground path waypoints
 */
function createGroundPathCurve(
  path: GroundPath,
  config: GroundVehicleConfig
): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const groundLevel = config.groundPhysics.groundLevel;

  path.waypoints.forEach(waypointId => {
    const waypoint = config.groundWaypoints[waypointId];
    if (waypoint) {
      points.push(
        new THREE.Vector3(waypoint.position[0], groundLevel, waypoint.position[1])
      );
    }
  });

  const tension = path.curveTension ?? 0.5;
  const closed = path.bidirectional ?? false;

  return new THREE.CatmullRomCurve3(points, closed, 'catmullrom', tension);
}

/**
 * Update vehicle physics and movement
 */
function updateGroundVehicle(
  vehicle: GroundVehicle,
  delta: number,
  config: GroundVehicleConfig,
  curveCache: Map<string, CachedCurve>,
  spatialGrid: SpatialGrid<GroundVehicle>
): void {
  if (vehicle.state === 'idle' || vehicle.state === 'waiting') return;
  if (!vehicle.pathCurve || !vehicle.currentPathId) return;

  const fleet = config.groundFleets[vehicle.fleetId];
  if (!fleet) return;

  // Get cached curve for this path
  const cachedCurve = curveCache.get(vehicle.currentPathId);
  if (!cachedCurve) return; // Fallback: skip if cache missing

  // Acceleration/deceleration
  const acceleration = fleet.behavior.acceleration;
  const deceleration = fleet.behavior.deceleration;

  if (vehicle.speed < vehicle.targetSpeed) {
    vehicle.speed = Math.min(
      vehicle.targetSpeed,
      vehicle.speed + acceleration * delta
    );
  } else if (vehicle.speed > vehicle.targetSpeed) {
    vehicle.speed = Math.max(
      vehicle.targetSpeed,
      vehicle.speed - deceleration * delta
    );
  }

  // Move along path
  const curveLength = cachedCurve.curveLength;
  const distance = vehicle.speed * delta;
  const progressDelta = distance / curveLength;

  vehicle.pathProgress += progressDelta;

  // Check if path completed
  if (vehicle.pathProgress >= 1.0) {
    vehicle.pathProgress = 0;
    vehicle.stats.pathsCompleted++;

    // Loop the path or assign new path
    // For now, just loop
    vehicle.pathProgress = vehicle.pathProgress % 1.0;
  }

  // Update position from cached curve (95% faster than getPoint())
  const newPosition = getCurvePointInterpolated(cachedCurve, vehicle.pathProgress);
  vehicle.position.copy(newPosition);
  vehicle.position.y = config.groundPhysics.groundLevel;

  // Update velocity and rotation from cached tangent (95% faster than getTangent())
  const tangent = getCurveTangentInterpolated(cachedCurve, vehicle.pathProgress);
  vehicle.velocity.copy(tangent.multiplyScalar(vehicle.speed));

  // Calculate yaw from XZ velocity (no pitch or roll for ground vehicles)
  const yaw = Math.atan2(tangent.x, tangent.z);
  vehicle.rotation.y = yaw;

  // Update stats
  vehicle.stats.totalDistance += distance;

  // Collision avoidance using spatial grid (O(n²) → O(n))
  applyCollisionAvoidance(vehicle, config, spatialGrid);
}

/**
 * Collision avoidance between vehicles using spatial grid
 * Reduced from O(n²) to O(n) average case complexity
 */
function applyCollisionAvoidance(
  vehicle: GroundVehicle,
  config: GroundVehicleConfig,
  spatialGrid: SpatialGrid<GroundVehicle>
): void {
  if (!config.groundPhysics.collisionEnabled) return;

  const fleet = config.groundFleets[vehicle.fleetId];
  if (!fleet) return;

  // Get collision avoidance force from nearby vehicles
  const avoidanceForce = getCollisionAvoidanceGeneric(
    vehicle,
    spatialGrid,
    fleet.collision.avoidanceDistance,
    fleet.collision.avoidanceStrength,
    // Filter: only avoid moving vehicles
    (other) => other.state === 'moving' && other.id !== vehicle.id
  );

  // Apply avoidance force to velocity
  if (avoidanceForce.lengthSq() > 0) {
    vehicle.velocity.add(avoidanceForce);

    // Apply damping to avoid excessive speed
    const maxAvoidanceSpeed = fleet.behavior.maxSpeed * 0.5;
    if (vehicle.velocity.lengthSq() > maxAvoidanceSpeed * maxAvoidanceSpeed) {
      vehicle.velocity.normalize().multiplyScalar(maxAvoidanceSpeed);
    }
  }

  // Keep vehicle within scene bounds
  const maxX = 100;
  const maxZ = 100;

  if (Math.abs(vehicle.position.x) > maxX) {
    vehicle.position.x = Math.sign(vehicle.position.x) * maxX;
    vehicle.velocity.x *= -config.groundPhysics.collisionDamping;
  }

  if (Math.abs(vehicle.position.z) > maxZ) {
    vehicle.position.z = Math.sign(vehicle.position.z) * maxZ;
    vehicle.velocity.z *= -config.groundPhysics.collisionDamping;
  }
}

/**
 * Get all vehicles as array (for external access)
 */
export function getGroundVehicles(vehiclesRef: React.MutableRefObject<GroundVehicle[]>): GroundVehicle[] {
  return vehiclesRef.current;
}

/**
 * Find vehicle by ID
 */
export function getGroundVehicleById(
  vehiclesRef: React.MutableRefObject<GroundVehicle[]>,
  id: string
): GroundVehicle | undefined {
  return vehiclesRef.current.find(v => v.id === id);
}

/**
 * Assign new path to vehicle
 */
export function assignPathToVehicle(
  vehicle: GroundVehicle,
  pathId: string,
  config: GroundVehicleConfig,
  curveCache?: Map<string, CachedCurve>
): boolean {
  const path = config.groundPaths[pathId];
  if (!path) return false;

  vehicle.currentPathId = pathId;
  vehicle.pathCurve = createGroundPathCurve(path, config);
  vehicle.pathProgress = 0;
  vehicle.state = 'moving';
  vehicle.targetSpeed = path.speed;

  // Cache the curve if cache is provided and not already cached
  if (curveCache && !curveCache.has(pathId)) {
    const cachedCurve = createCachedCurve(pathId, vehicle.pathCurve, 150);
    curveCache.set(pathId, cachedCurve);
  }

  return true;
}
