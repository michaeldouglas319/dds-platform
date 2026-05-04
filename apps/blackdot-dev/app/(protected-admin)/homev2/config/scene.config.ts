import * as THREE from 'three';
import type { DroneFleet, DroneModelType } from '../types/fleet.types';

/**
 * UNIFIED SCENE CONFIGURATION
 * Single source of truth for all scene elements, motion states, and transitions
 *
 * This configuration centralizes:
 * - Model definitions and properties
 * - Fleet configurations and spawn points
 * - Motion state machines (hanger → taxi → takeoff → orbit)
 * - Physics transition parameters
 * - Scene layout and waypoints
 */

export interface SceneConfig {
  /** Scene boundaries and layout */
  scene: {
    bounds: {
      width: number;
      depth: number;
      height: number;
    };
    center: [number, number, number];
  };

  /** All models used in the scene */
  models: Record<string, ModelDefinition>;

  /** Fleet configurations */
  fleets: Record<string, FleetConfig>;

  /** Motion state machine definitions */
  motionStates: Record<string, MotionState>;

  /** Scene waypoints and paths */
  waypoints: Record<string, Waypoint>;

  /** Physics transition parameters */
  physics: {
    takeoff: TakeoffPhysics;
    orbit: OrbitPhysics;
    landing: LandingPhysics;
  };

  /** Ground vehicle system (2D plane movement) */
  groundVehicles?: GroundVehicleConfig;
}

export interface ModelDefinition {
  id: string;
  path: string;
  scale: number;
  nativeOrientation: [number, number, number]; // [pitch, yaw, roll] in degrees
  nativePosition: [number, number, number];
  targetSize?: number;
  category: 'aircraft' | 'drone' | 'particle' | 'ground_vehicle';
  capabilities: {
    canTakeoff: boolean;
    canOrbit: boolean;
    hasPhysics: boolean;
  };
}

export interface FleetConfig {
  id: string;
  name: string;
  color: string;
  emissive: string;
  modelType: DroneModelType;
  modelId: string; // Reference to model in models section
  particleCount: number;
  speedMultiplier: number;
  altitudeOffset: number;

  /** Spawn locations (hangers/gates) */
  spawnPoints: SpawnPoint[];

  /** Landing zones */
  landingZones: LandingZone[];

  /** Orbital parameters */
  orbit: {
    center: [number, number, number];
    radius: number;
    altitude: number;
    speed: number;
  };

  /** Collision avoidance */
  collisionAvoidance: {
    radius: number;
    strength: number;
  };
}

export interface SpawnPoint {
  id: string;
  position: [number, number, number];
  orientation: [number, number, number];
  gateIndex: number;
  type: 'hanger' | 'gate' | 'pad';
}

export interface LandingZone {
  id: string;
  position: [number, number, number];
  orientation: [number, number, number];
  capacity: number;
}

export interface MotionState {
  id: string;
  name: string;
  type: 'idle' | 'taxi' | 'takeoff' | 'orbit' | 'landing' | 'maintenance';

  /** Entry conditions */
  entryConditions: {
    fromStates: string[];
    triggers: string[];
    requirements?: string[];
  };

  /** State behavior */
  behavior: {
    pathType: 'taxi' | 'takeoff' | 'orbit' | 'landing' | 'custom';
    waypoints?: string[]; // Waypoint IDs
    speed: number;
    altitude?: number;
    // Removed: orientation - now calculated dynamically from path
  };

  /** Exit conditions */
  exitConditions: {
    duration?: number; // Time in state
    triggers: string[];
    nextStates: string[];
  };

  /** Visual effects */
  effects?: {
    trail?: boolean;
    glow?: boolean;
    particles?: boolean;
  };
}

export interface Waypoint {
  id: string;
  position: [number, number, number];
  orientation?: [number, number, number];
  type: 'taxi' | 'takeoff_start' | 'takeoff_end' | 'orbit_entry' | 'orbit_exit' | 'landing_start' | 'landing_end';
  speed?: number;
  altitude?: number;
  radius?: number; // For curved paths
}

export interface TakeoffPhysics {
  acceleration: number;
  liftSpeed: number;
  maxHeight: number;
  curveIntensity: number;
  transitionAltitude: number; // When to switch to physics
  physicsBlendDuration: number; // Blend time between animation and physics
}

export interface OrbitPhysics {
  gravitationalConstant: number;
  orbitalDecay: number;
  collisionRadius: number;
  avoidanceStrength: number;
  maxSpeed: number;
  minAltitude: number;
  maxAltitude: number;
}

export interface LandingPhysics {
  descentSpeed: number;
  approachAngle: number;
  flareAltitude: number;
  touchdownSpeed: number;
  rolloutDistance: number;
}

/** Ground vehicle system configuration */
export interface GroundVehicleConfig {
  enabled: boolean;

  /** Ground-specific waypoints (Y always at ground level) */
  groundWaypoints: Record<string, GroundWaypoint>;

  /** Predefined ground paths (roads, taxi lanes) */
  groundPaths: Record<string, GroundPath>;

  /** Ground fleet configurations (trucks, service vehicles) */
  groundFleets: Record<string, GroundFleet>;

  /** Ground physics (2D plane movement) */
  groundPhysics: GroundPhysics;

  /** Performance optimization settings */
  performance?: {
    /** Enable curve caching (default: true) */
    enableCurveCaching?: boolean;
    /** Enable spatial grid for collision detection (default: true) */
    enableSpatialGrid?: boolean;
    /** Number of samples per cached curve (default: 150) */
    defaultCurveSamples?: number;
    /** Spatial grid cell size in units (default: 15) */
    spatialGridCellSize?: number;
  };

  /** Debug visualization */
  debug?: {
    showPaths?: boolean;
    showWaypoints?: boolean;
    showZones?: boolean;
    showVehicles?: boolean;
    showCollisionBounds?: boolean;
  };
}

export interface GroundWaypoint {
  id: string;
  position: [number, number]; // [x, z] - Y is always ground level
  type: 'parking' | 'intersection' | 'queue_start' | 'queue_end' | 'loading' | 'service' | 'runway_service';
  orientation?: number; // Yaw rotation in radians
  speedLimit?: number;
  radius?: number; // Turning radius for curves
  width?: number; // Lane/zone width
}

export interface GroundPath {
  id: string;
  waypoints: string[]; // Array of waypoint IDs
  speed: number;
  width: number; // Lane width for collision detection
  curveType: 'linear' | 'catmullrom' | 'bezier';
  curveTension?: number; // For catmullrom curves
  bidirectional?: boolean; // Can vehicles travel both directions
}

export interface GroundFleet {
  id: string;
  name: string;
  modelId: string; // Reference to model in models section
  color: string;
  emissive: string;
  vehicleCount: number;

  /** Spawn/parking locations */
  spawnPoints: GroundSpawnPoint[];

  /** Default path assignment */
  defaultPath?: string; // Ground path ID

  /** Movement behavior */
  behavior: {
    cruiseSpeed: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    turnRate: number; // Max degrees per second
  };

  /** Collision avoidance */
  collision: {
    radius: number;
    avoidanceDistance: number;
    avoidanceStrength: number;
  };

  /** Performance overrides (optional per-fleet tuning) */
  performance?: {
    /** Override curve sample count for this fleet's paths */
    curveSampleCount?: number;
    /** Update priority: high = every frame, normal = standard throttling, low = aggressive throttling */
    updatePriority?: 'high' | 'normal' | 'low';
  };
}

export interface GroundSpawnPoint {
  id: string;
  position: [number, number]; // [x, z]
  orientation: number; // Yaw in radians
  type: 'parking' | 'loading_dock' | 'service_bay' | 'queue';
  capacity?: number;
}

export interface GroundPhysics {
  friction: number; // 0-1, affects braking and turning
  maxSpeed: number; // Global max speed (can be overridden per fleet)
  minTurnRadius: number; // Minimum turning radius at max speed
  collisionEnabled: boolean;
  collisionDamping: number; // Velocity reduction on collision
  groundLevel: number; // Y coordinate for ground (default 0)
}

/**
 * UNIFIED SCENE CONFIGURATION
 */
export const SCENE_CONFIG: SceneConfig = {
  scene: {
    bounds: {
      width: 200,
      depth: 200,
      height: 100,
    },
    center: [0, 0, 0],
  },

  models: {
    'plane-a': {
      id: 'plane-a',
      path: '/assets/models/2_plane_draco.glb',
      scale: 0.05,
      nativeOrientation: [0, 0, 0],
      nativePosition: [0, 0, 0],
      targetSize: 80,
      category: 'aircraft',
      capabilities: {
        canTakeoff: true,
        canOrbit: true,
        hasPhysics: true,
      },
    },
    'plane-b': {
      id: 'plane-b',
      path: '/assets/models/2_plane_draco.glb',
      scale: 0.05,
      nativeOrientation: [0, 180, 0],
      nativePosition: [0, 0, 0],
      targetSize: 80,
      category: 'aircraft',
      capabilities: {
        canTakeoff: true,
        canOrbit: true,
        hasPhysics: true,
      },
    },
    'drone-recon': {
      id: 'drone-recon',
      path: '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb',
      scale: 1.0,
      nativeOrientation: [0, 0, 0],
      nativePosition: [0, 0, 0],
      targetSize: 60,
      category: 'drone',
      capabilities: {
        canTakeoff: true,
        canOrbit: true,
        hasPhysics: true,
      },
    },
    'service-truck': {
      id: 'service-truck',
      path: '/assets/models/service-truck.glb', // Placeholder - add actual model
      scale: 1.0,
      nativeOrientation: [0, 0, 0],
      nativePosition: [0, 0, 0],
      targetSize: 3.0,
      category: 'ground_vehicle',
      capabilities: {
        canTakeoff: false,
        canOrbit: false,
        hasPhysics: true,
      },
    },
    'cargo-truck': {
      id: 'cargo-truck',
      path: '/assets/models/cargo-truck.glb', // Placeholder - add actual model
      scale: 1.0,
      nativeOrientation: [0, 0, 0],
      nativePosition: [0, 0, 0],
      targetSize: 4.0,
      category: 'ground_vehicle',
      capabilities: {
        canTakeoff: false,
        canOrbit: false,
        hasPhysics: true,
      },
    },
  },

  fleets: {
    'warehouse-north': {
      id: 'warehouse-north',
      name: 'North Warehouse Fleet',
      color: '#FF6347',
      emissive: '#CC4F38',
      modelType: 'aircraft',
      modelId: 'plane-a', // Reference to actual model in models section
      particleCount: 5,
      speedMultiplier: 1.0,
      altitudeOffset: 2.5,
      spawnPoints: [
        {
          id: 'wh-north-g1',
          position: [-15, 0.1, -5],
          orientation: [0, 0, 0],
          gateIndex: 0,
          type: 'hanger',
        },
        {
          id: 'wh-north-g2',
          position: [-15, 0.1, 0],
          orientation: [0, 0, 0],
          gateIndex: 1,
          type: 'hanger',
        },
      ],
      landingZones: [
        {
          id: 'wh-north-lz1',
          position: [-15, 0.1, -5],
          orientation: [0, 180, 0],
          capacity: 2,
        },
      ],
      orbit: {
        center: [15, 50, -10],
        radius: 30,
        altitude: 50,
        speed: 0.5,
      },
      collisionAvoidance: {
        radius: 10.0,
        strength: 0.18,
      },
    },

    'distribution-south': {
      id: 'distribution-south',
      name: 'South Distribution Hub',
      color: '#4169E1',
      emissive: '#2E5DB8',
      modelType: 'aircraft',
      modelId: 'plane-b', // Reference to actual model in models section
      particleCount: 4,
      speedMultiplier: 1.3,
      altitudeOffset: 3.0,
      spawnPoints: [
        {
          id: 'dist-south-g1',
          position: [-15, 0.1, 5],
          orientation: [0, 0, 0],
          gateIndex: 0,
          type: 'gate',
        },
        {
          id: 'dist-south-g2',
          position: [-15, 0.1, 10],
          orientation: [0, 0, 0],
          gateIndex: 1,
          type: 'gate',
        },
      ],
      landingZones: [
        {
          id: 'dist-south-lz1',
          position: [-15, 0.1, 5],
          orientation: [0, 180, 0],
          capacity: 2,
        },
      ],
      orbit: {
        center: [15, 55, 10],
        radius: 35,
        altitude: 55,
        speed: 0.6,
      },
      collisionAvoidance: {
        radius: 12.0,
        strength: 0.15,
      },
    },
  },

  motionStates: {
    'hanger-idle': {
      id: 'hanger-idle',
      name: 'Hanger Idle',
      type: 'idle',
      entryConditions: {
        fromStates: ['landing', 'maintenance'],
        triggers: ['spawn', 'ready'],
      },
      behavior: {
        pathType: 'custom',
        speed: 0,
        altitude: 0.1,
      },
      exitConditions: {
        triggers: ['dispatch', 'takeoff_request'],
        nextStates: ['taxi'],
      },
    },

    'taxi': {
      id: 'taxi',
      name: 'Taxi to Runway',
      type: 'taxi',
      entryConditions: {
        fromStates: ['hanger-idle'],
        triggers: ['dispatch'],
      },
      behavior: {
        pathType: 'taxi',
        waypoints: ['taxi-wp1', 'taxi-wp2', 'taxi-wp3', 'runway-start'],
        speed: 2.0,
        altitude: 0.1,
      },
      exitConditions: {
        triggers: ['runway_reached'],
        nextStates: ['takeoff'],
      },
      effects: {
        trail: false,
        glow: true,
      },
    },

    'takeoff': {
      id: 'takeoff',
      name: 'Takeoff Sequence',
      type: 'takeoff',
      entryConditions: {
        fromStates: ['taxi'],
        triggers: ['runway_aligned'],
      },
      behavior: {
        pathType: 'takeoff',
        waypoints: ['runway-start', 'takeoff-climb', 'orbit-transition'],
        speed: 5.0,
      },
      exitConditions: {
        triggers: ['physics_transition'],
        nextStates: ['orbit'],
      },
      effects: {
        trail: true,
        glow: true,
        particles: true,
      },
    },

    'orbit': {
      id: 'orbit',
      name: 'Orbital Physics',
      type: 'orbit',
      entryConditions: {
        fromStates: ['takeoff'],
        triggers: ['physics_engaged'],
      },
      behavior: {
        pathType: 'orbit',
        speed: 0, // Physics controlled
      },
      exitConditions: {
        triggers: ['landing_request', 'maintenance_request'],
        nextStates: ['landing'],
      },
      effects: {
        trail: false,
        glow: false,
        particles: false,
      },
    },

    'landing': {
      id: 'landing',
      name: 'Landing Approach',
      type: 'landing',
      entryConditions: {
        fromStates: ['orbit'],
        triggers: ['landing_request'],
      },
      behavior: {
        pathType: 'landing',
        waypoints: ['orbit-exit', 'approach', 'flare', 'touchdown', 'rollout'],
        speed: 3.0,
      },
      exitConditions: {
        triggers: ['landed'],
        nextStates: ['hanger-idle'],
      },
      effects: {
        trail: true,
        glow: true,
      },
    },
  },

  waypoints: {
    'taxi-wp1': {
      id: 'taxi-wp1',
      position: [-10, 0.1, 0],
      type: 'taxi',
      speed: 2.0,
    },
    'taxi-wp2': {
      id: 'taxi-wp2',
      position: [0, 0.1, 0],
      type: 'taxi',
      speed: 2.0,
    },
    'taxi-wp3': {
      id: 'taxi-wp3',
      position: [10, 0.1, 0],
      type: 'taxi',
      speed: 2.0,
    },
    'runway-start': {
      id: 'runway-start',
      position: [20, 0.1, 0],
      orientation: [0, 0, 0], // Face straight ahead (runway direction)
      type: 'takeoff_start',
      speed: 5.0,
    },
    'takeoff-climb': {
      id: 'takeoff-climb',
      position: [40, 15, 20],
      orientation: [0, 0, 0], // Slight pitch up and gentle turn
      type: 'takeoff_end',
      speed: 8.0,
      altitude: 15,
    },
    'orbit-transition': {
      id: 'orbit-transition',
      position: [50, 40, 30],
      orientation: [0, 0, 0], // More pitch up, continued turn toward orbit
      type: 'orbit_entry',
      speed: 10.0,
      altitude: 40,
    },
  },

  physics: {
    takeoff: {
      acceleration: 2.0,
      liftSpeed: 3.0,
      maxHeight: 50,
      curveIntensity: 0.3,
      transitionAltitude: 30,
      physicsBlendDuration: 2.0,
    },
    orbit: {
      gravitationalConstant: 0.1,
      orbitalDecay: 0.001,
      collisionRadius: 8.0,
      avoidanceStrength: 0.2,
      maxSpeed: 15.0,
      minAltitude: 20,
      maxAltitude: 80,
    },
    landing: {
      descentSpeed: 2.0,
      approachAngle: 0.1,
      flareAltitude: 5.0,
      touchdownSpeed: 1.0,
      rolloutDistance: 20.0,
    },
  },

  groundVehicles: {
    enabled: true,

    groundWaypoints: {
      'parking-a1': {
        id: 'parking-a1',
        position: [-80, 0],
        type: 'parking',
        orientation: 0,
        width: 3.0,
      },
      'parking-a2': {
        id: 'parking-a2',
        position: [-80, 10],
        type: 'parking',
        orientation: 0,
        width: 3.0,
      },
      'junction-1': {
        id: 'junction-1',
        position: [-60, 0],
        type: 'intersection',
        speedLimit: 5.0,
        radius: 5.0,
      },
      'loading-dock-1': {
        id: 'loading-dock-1',
        position: [-40, -20],
        type: 'loading',
        orientation: Math.PI / 2,
        width: 5.0,
      },
      'service-road-1': {
        id: 'service-road-1',
        position: [-20, 0],
        type: 'service',
        speedLimit: 8.0,
      },
      'runway-service-1': {
        id: 'runway-service-1',
        position: [20, -10],
        type: 'runway_service',
        orientation: 0,
        width: 4.0,
      },
    },

    groundPaths: {
      'parking-to-loading': {
        id: 'parking-to-loading',
        waypoints: ['parking-a1', 'junction-1', 'loading-dock-1'],
        speed: 5.0,
        width: 2.5,
        curveType: 'catmullrom',
        curveTension: 0.5,
        bidirectional: false,
      },
      'loading-to-service': {
        id: 'loading-to-service',
        waypoints: ['loading-dock-1', 'service-road-1', 'runway-service-1'],
        speed: 6.0,
        width: 3.0,
        curveType: 'catmullrom',
        curveTension: 0.5,
        bidirectional: true,
      },
      'service-loop': {
        id: 'service-loop',
        waypoints: ['service-road-1', 'runway-service-1', 'junction-1', 'service-road-1'],
        speed: 7.0,
        width: 2.5,
        curveType: 'catmullrom',
        curveTension: 0.5,
        bidirectional: false,
      },
    },

    groundFleets: {
      'service-vehicles': {
        id: 'service-vehicles',
        name: 'Airport Service Vehicles',
        modelId: 'service-truck',
        color: '#FFD700',
        emissive: '#AA8800',
        vehicleCount: 3,
        spawnPoints: [
          {
            id: 'spawn-parking-a1',
            position: [-80, 0],
            orientation: 0,
            type: 'parking',
          },
          {
            id: 'spawn-parking-a2',
            position: [-80, 10],
            orientation: 0,
            type: 'parking',
          },
        ],
        defaultPath: 'parking-to-loading',
        behavior: {
          cruiseSpeed: 5.0,
          maxSpeed: 10.0,
          acceleration: 2.0,
          deceleration: 3.0,
          turnRate: 45.0, // degrees/second
        },
        collision: {
          radius: 2.0,
          avoidanceDistance: 8.0,
          avoidanceStrength: 0.5,
        },
      },
      'cargo-trucks': {
        id: 'cargo-trucks',
        name: 'Cargo Transport',
        modelId: 'cargo-truck',
        color: '#4169E1',
        emissive: '#2E5DB8',
        vehicleCount: 2,
        spawnPoints: [
          {
            id: 'spawn-loading-1',
            position: [-40, -20],
            orientation: Math.PI / 2,
            type: 'loading_dock',
            capacity: 2,
          },
        ],
        defaultPath: 'loading-to-service',
        behavior: {
          cruiseSpeed: 4.0,
          maxSpeed: 8.0,
          acceleration: 1.5,
          deceleration: 2.5,
          turnRate: 30.0,
        },
        collision: {
          radius: 2.5,
          avoidanceDistance: 10.0,
          avoidanceStrength: 0.6,
        },
      },
    },

    groundPhysics: {
      friction: 0.7,
      maxSpeed: 15.0,
      minTurnRadius: 3.0,
      collisionEnabled: true,
      collisionDamping: 0.5,
      groundLevel: 0.1,
    },

    // Performance optimizations ENABLED by default
    performance: {
      enableCurveCaching: true,      // Pre-sample path curves for 95% faster lookups
      enableSpatialGrid: true,       // Use O(n) spatial grid instead of O(n²) collision
      defaultCurveSamples: 150,      // Samples per cached curve
      spatialGridCellSize: 15,       // Grid cell size in units
    },

    debug: {
      showPaths: true,
      showWaypoints: true,
      showZones: false,
      showVehicles: true,
      showCollisionBounds: false,
    },
  },
};

/**
 * UTILITY FUNCTIONS
 */

export function getModelConfig(modelId: string): ModelDefinition | undefined {
  return SCENE_CONFIG.models[modelId];
}

export function getFleetConfig(fleetId: string): FleetConfig | undefined {
  return SCENE_CONFIG.fleets[fleetId];
}

export function getMotionState(stateId: string): MotionState | undefined {
  return SCENE_CONFIG.motionStates[stateId];
}

export function getWaypoint(waypointId: string): Waypoint | undefined {
  return SCENE_CONFIG.waypoints[waypointId];
}

export function getAllSpawnPoints(): SpawnPoint[] {
  return Object.values(SCENE_CONFIG.fleets).flatMap(fleet => fleet.spawnPoints);
}

export function getAllLandingZones(): LandingZone[] {
  return Object.values(SCENE_CONFIG.fleets).flatMap(fleet => fleet.landingZones);
}

/**
 * Ground vehicle utility functions
 */
export function getGroundWaypoint(waypointId: string): GroundWaypoint | undefined {
  return SCENE_CONFIG.groundVehicles?.groundWaypoints[waypointId];
}

export function getGroundPath(pathId: string): GroundPath | undefined {
  return SCENE_CONFIG.groundVehicles?.groundPaths[pathId];
}

export function getGroundFleet(fleetId: string): GroundFleet | undefined {
  return SCENE_CONFIG.groundVehicles?.groundFleets[fleetId];
}

export function getAllGroundSpawnPoints(): GroundSpawnPoint[] {
  if (!SCENE_CONFIG.groundVehicles) return [];
  return Object.values(SCENE_CONFIG.groundVehicles.groundFleets).flatMap(
    fleet => fleet.spawnPoints
  );
}

/**
 * Convert configuration to legacy formats for backward compatibility
 */
export function toLegacyFleetConfig(): DroneFleet[] {
  return Object.values(SCENE_CONFIG.fleets).map(fleet => ({
    id: fleet.id,
    name: fleet.name,
    color: fleet.color,
    emissive: fleet.emissive,
    modelType: fleet.modelType,
    particleCount: fleet.particleCount,
    speedMultiplier: fleet.speedMultiplier,
    altitudeOffset: fleet.altitudeOffset,
    originGates: fleet.spawnPoints.map(sp => ({
      id: sp.id,
      fleetId: fleet.id,
      position: new THREE.Vector3(...sp.position),
      index: sp.gateIndex,
    })),
    landingZone: fleet.landingZones.map(lz => new THREE.Vector3(...lz.position)),
    orbitalCenter: new THREE.Vector3(...fleet.orbit.center),
    collisionAvoidanceRadius: fleet.collisionAvoidance.radius,
    collisionAvoidanceStrength: fleet.collisionAvoidance.strength,
  }));
}