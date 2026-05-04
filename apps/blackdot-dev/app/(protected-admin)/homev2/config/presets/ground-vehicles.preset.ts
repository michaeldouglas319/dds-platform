/**
 * Ground Vehicle Presets
 * Pre-configured ground vehicle scenarios
 */

import type { GroundVehicleConfig } from '../scene.config';

/**
 * PRESET: Small Airport
 * Simple service vehicle loop around a small airport
 */
export const SMALL_AIRPORT_PRESET: GroundVehicleConfig = {
  enabled: true,

  groundWaypoints: {
    'parking-1': { id: 'parking-1', position: [-40, -20], type: 'parking', orientation: 0, width: 3 },
    'parking-2': { id: 'parking-2', position: [-40, -10], type: 'parking', orientation: 0, width: 3 },
    'junction-main': { id: 'junction-main', position: [-20, 0], type: 'intersection', radius: 5, speedLimit: 5 },
    'runway-service': { id: 'runway-service', position: [20, 0], type: 'runway_service', orientation: 0, width: 4 },
    'loading-bay': { id: 'loading-bay', position: [0, 20], type: 'loading', orientation: Math.PI / 2, width: 5 },
  },

  groundPaths: {
    'main-loop': {
      id: 'main-loop',
      waypoints: ['parking-1', 'junction-main', 'runway-service', 'loading-bay', 'junction-main', 'parking-1'],
      speed: 6.0,
      width: 2.5,
      curveType: 'catmullrom',
      curveTension: 0.5,
      bidirectional: false,
    },
  },

  groundFleets: {
    'service-fleet': {
      id: 'service-fleet',
      name: 'Airport Service',
      modelId: 'service-truck',
      color: '#FFD700',
      emissive: '#AA8800',
      vehicleCount: 3,
      spawnPoints: [
        { id: 'spawn-1', position: [-40, -20], orientation: 0, type: 'parking' },
        { id: 'spawn-2', position: [-40, -10], orientation: 0, type: 'parking' },
      ],
      defaultPath: 'main-loop',
      behavior: {
        cruiseSpeed: 6.0,
        maxSpeed: 10.0,
        acceleration: 2.0,
        deceleration: 3.0,
        turnRate: 45,
      },
      collision: {
        radius: 2.0,
        avoidanceDistance: 8.0,
        avoidanceStrength: 0.5,
      },
    },
  },

  groundPhysics: {
    friction: 0.7,
    maxSpeed: 12.0,
    minTurnRadius: 3.0,
    collisionEnabled: true,
    collisionDamping: 0.5,
    groundLevel: 0.1,
  },

  debug: {
    showPaths: true,
    showWaypoints: true,
    showZones: false,
    showVehicles: true,
    showCollisionBounds: false,
  },
};

/**
 * PRESET: Busy Hub
 * Complex multi-path system with different vehicle types
 */
export const BUSY_HUB_PRESET: GroundVehicleConfig = {
  enabled: true,

  groundWaypoints: {
    // North zone
    'north-parking-1': { id: 'north-parking-1', position: [-60, 40], type: 'parking', orientation: 0, width: 3 },
    'north-parking-2': { id: 'north-parking-2', position: [-60, 50], type: 'parking', orientation: 0, width: 3 },
    'north-junction': { id: 'north-junction', position: [-40, 45], type: 'intersection', radius: 6, speedLimit: 6 },

    // Central zone
    'central-hub': { id: 'central-hub', position: [0, 0], type: 'intersection', radius: 8, speedLimit: 8 },

    // South zone
    'south-loading-1': { id: 'south-loading-1', position: [-20, -40], type: 'loading', orientation: Math.PI / 2, width: 6 },
    'south-loading-2': { id: 'south-loading-2', position: [20, -40], type: 'loading', orientation: Math.PI / 2, width: 6 },
    'south-junction': { id: 'south-junction', position: [0, -25], type: 'intersection', radius: 6, speedLimit: 6 },

    // East zone
    'east-service': { id: 'east-service', position: [50, 0], type: 'service', speedLimit: 7 },
    'east-runway': { id: 'east-runway', position: [60, 0], type: 'runway_service', orientation: 0, width: 5 },
  },

  groundPaths: {
    'north-to-central': {
      id: 'north-to-central',
      waypoints: ['north-parking-1', 'north-junction', 'central-hub'],
      speed: 7.0,
      width: 3.0,
      curveType: 'catmullrom',
      curveTension: 0.5,
      bidirectional: true,
    },
    'central-to-south': {
      id: 'central-to-south',
      waypoints: ['central-hub', 'south-junction', 'south-loading-1'],
      speed: 6.0,
      width: 3.5,
      curveType: 'catmullrom',
      curveTension: 0.5,
      bidirectional: true,
    },
    'central-to-east': {
      id: 'central-to-east',
      waypoints: ['central-hub', 'east-service', 'east-runway'],
      speed: 8.0,
      width: 3.0,
      curveType: 'catmullrom',
      curveTension: 0.5,
      bidirectional: false,
    },
    'outer-loop': {
      id: 'outer-loop',
      waypoints: ['north-junction', 'east-service', 'south-junction', 'north-junction'],
      speed: 9.0,
      width: 2.5,
      curveType: 'catmullrom',
      curveTension: 0.5,
      bidirectional: false,
    },
  },

  groundFleets: {
    'fast-service': {
      id: 'fast-service',
      name: 'Express Service',
      modelId: 'service-truck',
      color: '#FF6347',
      emissive: '#CC4F38',
      vehicleCount: 4,
      spawnPoints: [
        { id: 'spawn-north-1', position: [-60, 40], orientation: 0, type: 'parking' },
        { id: 'spawn-north-2', position: [-60, 50], orientation: 0, type: 'parking' },
      ],
      defaultPath: 'outer-loop',
      behavior: {
        cruiseSpeed: 9.0,
        maxSpeed: 15.0,
        acceleration: 3.0,
        deceleration: 4.0,
        turnRate: 60,
      },
      collision: {
        radius: 1.8,
        avoidanceDistance: 10.0,
        avoidanceStrength: 0.6,
      },
    },
    'heavy-cargo': {
      id: 'heavy-cargo',
      name: 'Heavy Cargo',
      modelId: 'cargo-truck',
      color: '#4169E1',
      emissive: '#2E5DB8',
      vehicleCount: 3,
      spawnPoints: [
        { id: 'spawn-south-1', position: [-20, -40], orientation: Math.PI / 2, type: 'loading_dock', capacity: 2 },
      ],
      defaultPath: 'central-to-south',
      behavior: {
        cruiseSpeed: 5.0,
        maxSpeed: 8.0,
        acceleration: 1.5,
        deceleration: 2.0,
        turnRate: 30,
      },
      collision: {
        radius: 2.5,
        avoidanceDistance: 12.0,
        avoidanceStrength: 0.7,
      },
    },
  },

  groundPhysics: {
    friction: 0.75,
    maxSpeed: 18.0,
    minTurnRadius: 4.0,
    collisionEnabled: true,
    collisionDamping: 0.6,
    groundLevel: 0.1,
  },

  debug: {
    showPaths: true,
    showWaypoints: true,
    showZones: true,
    showVehicles: true,
    showCollisionBounds: true,
  },
};

/**
 * PRESET: Minimal Demo
 * Single vehicle, single path for testing
 */
export const MINIMAL_DEMO_PRESET: GroundVehicleConfig = {
  enabled: true,

  groundWaypoints: {
    'start': { id: 'start', position: [-30, 0], type: 'parking', orientation: 0, width: 3 },
    'mid': { id: 'mid', position: [0, 30], type: 'intersection', radius: 5 },
    'end': { id: 'end', position: [30, 0], type: 'loading', orientation: Math.PI, width: 4 },
  },

  groundPaths: {
    'simple-path': {
      id: 'simple-path',
      waypoints: ['start', 'mid', 'end', 'mid', 'start'],
      speed: 5.0,
      width: 2.5,
      curveType: 'catmullrom',
      curveTension: 0.5,
      bidirectional: false,
    },
  },

  groundFleets: {
    'demo-vehicle': {
      id: 'demo-vehicle',
      name: 'Demo Vehicle',
      modelId: 'service-truck',
      color: '#32CD32',
      emissive: '#228B22',
      vehicleCount: 1,
      spawnPoints: [
        { id: 'spawn-demo', position: [-30, 0], orientation: 0, type: 'parking' },
      ],
      defaultPath: 'simple-path',
      behavior: {
        cruiseSpeed: 5.0,
        maxSpeed: 8.0,
        acceleration: 2.0,
        deceleration: 2.5,
        turnRate: 40,
      },
      collision: {
        radius: 2.0,
        avoidanceDistance: 8.0,
        avoidanceStrength: 0.5,
      },
    },
  },

  groundPhysics: {
    friction: 0.7,
    maxSpeed: 10.0,
    minTurnRadius: 3.0,
    collisionEnabled: false,
    collisionDamping: 0.5,
    groundLevel: 0.1,
  },

  debug: {
    showPaths: true,
    showWaypoints: true,
    showZones: false,
    showVehicles: true,
    showCollisionBounds: false,
  },
};

/**
 * PRESET: Large Fleet (Performance Test)
 * 30 fleets with 300 total vehicles for scale validation
 * Tests curve caching, spatial grid, and multi-fleet InstancedMesh at scale
 */
export const LARGE_FLEET_PRESET: GroundVehicleConfig = (() => {
  const groundWaypoints: Record<string, any> = {};
  const groundPaths: Record<string, any> = {};
  const groundFleets: Record<string, any> = {};

  // Color palette for fleets
  const colors = [
    { color: '#FF6347', emissive: '#CC4F38' }, // Red
    { color: '#4169E1', emissive: '#2E5DB8' }, // Blue
    { color: '#32CD32', emissive: '#228B22' }, // Green
    { color: '#FFD700', emissive: '#AA8800' }, // Gold
    { color: '#FF1493', emissive: '#CC1075' }, // Pink
    { color: '#00CED1', emissive: '#008B8D' }, // Cyan
    { color: '#FF8C00', emissive: '#CC7000' }, // Orange
    { color: '#9370DB', emissive: '#7B59B8' }, // Purple
    { color: '#20B2AA', emissive: '#1A8F8A' }, // Teal
    { color: '#F0E68C', emissive: '#C8BE70' }, // Khaki
  ];

  // Generate 10 zones, each with 3 fleets (30 total fleets)
  const zones = 10;
  const fleetsPerZone = 3;
  const vehiclesPerFleet = 10; // 300 total vehicles

  for (let zone = 0; zone < zones; zone++) {
    // Zone layout: spread zones in a grid pattern
    const zoneX = (zone % 5) * 40 - 80; // 5 columns
    const zoneZ = Math.floor(zone / 5) * 40 - 20; // 2 rows

    // Create 4 waypoints per zone (forming a rectangular loop)
    const wp1 = `zone-${zone}-wp1`;
    const wp2 = `zone-${zone}-wp2`;
    const wp3 = `zone-${zone}-wp3`;
    const wp4 = `zone-${zone}-wp4`;

    groundWaypoints[wp1] = { id: wp1, position: [zoneX - 10, zoneZ - 10], type: 'parking' as const, orientation: 0, width: 3 };
    groundWaypoints[wp2] = { id: wp2, position: [zoneX + 10, zoneZ - 10], type: 'intersection' as const, radius: 5 };
    groundWaypoints[wp3] = { id: wp3, position: [zoneX + 10, zoneZ + 10], type: 'service' as const, speedLimit: 8 };
    groundWaypoints[wp4] = { id: wp4, position: [zoneX - 10, zoneZ + 10], type: 'loading' as const, orientation: Math.PI / 2, width: 4 };

    // Create zone loop path
    const pathId = `zone-${zone}-loop`;
    groundPaths[pathId] = {
      id: pathId,
      waypoints: [wp1, wp2, wp3, wp4, wp1],
      speed: 6.0 + Math.random() * 3.0, // Vary speed 6-9 units/sec
      width: 2.5,
      curveType: 'catmullrom' as const,
      curveTension: 0.5,
      bidirectional: false,
    };

    // Create 3 fleets for this zone
    for (let fleetIdx = 0; fleetIdx < fleetsPerZone; fleetIdx++) {
      const globalFleetIdx = zone * fleetsPerZone + fleetIdx;
      const fleetId = `fleet-${globalFleetIdx}`;
      const colorPalette = colors[globalFleetIdx % colors.length];

      // Spawn point position (offset within zone)
      const spawnOffset = (fleetIdx - 1) * 5;
      const spawnPos: [number, number] = [zoneX - 10, zoneZ - 10 + spawnOffset];

      groundFleets[fleetId] = {
        id: fleetId,
        name: `Fleet ${globalFleetIdx + 1} (Zone ${zone + 1})`,
        modelId: fleetIdx % 2 === 0 ? 'service-truck' : 'cargo-truck',
        color: colorPalette.color,
        emissive: colorPalette.emissive,
        vehicleCount: vehiclesPerFleet,
        spawnPoints: [
          {
            id: `spawn-${fleetId}`,
            position: spawnPos,
            orientation: 0,
            type: 'parking' as const,
          },
        ],
        defaultPath: pathId,
        behavior: {
          cruiseSpeed: 5.0 + Math.random() * 4.0, // Vary 5-9 units/sec
          maxSpeed: 10.0 + Math.random() * 5.0, // Vary 10-15 units/sec
          acceleration: 1.5 + Math.random() * 1.5, // Vary 1.5-3.0
          deceleration: 2.0 + Math.random() * 2.0, // Vary 2.0-4.0
          turnRate: 30 + Math.random() * 30, // Vary 30-60 deg/sec
        },
        collision: {
          radius: 2.0,
          avoidanceDistance: 8.0 + Math.random() * 4.0, // Vary 8-12 units
          avoidanceStrength: 0.4 + Math.random() * 0.3, // Vary 0.4-0.7
        },
        performance: {
          // Vary update priority across fleets
          updatePriority: (globalFleetIdx % 3 === 0 ? 'high' : globalFleetIdx % 3 === 1 ? 'normal' : 'low') as 'high' | 'normal' | 'low',
        },
      };
    }
  }

  return {
    enabled: true,
    groundWaypoints,
    groundPaths,
    groundFleets,
    groundPhysics: {
      friction: 0.7,
      maxSpeed: 20.0, // Higher max for large scale
      minTurnRadius: 3.0,
      collisionEnabled: true,
      collisionDamping: 0.5,
      groundLevel: 0.1,
    },
    performance: {
      enableCurveCaching: true,
      enableSpatialGrid: true,
      defaultCurveSamples: 150,
      spatialGridCellSize: 15,
    },
    debug: {
      showPaths: false, // Disable debug for performance at scale
      showWaypoints: false,
      showZones: false,
      showVehicles: true,
      showCollisionBounds: false,
    },
  };
})();

/**
 * PRESET: Medium Fleet (Balanced Test)
 * 15 fleets with 150 total vehicles for mid-scale testing
 */
export const MEDIUM_FLEET_PRESET: GroundVehicleConfig = (() => {
  const groundWaypoints: Record<string, any> = {};
  const groundPaths: Record<string, any> = {};
  const groundFleets: Record<string, any> = {};

  const colors = [
    { color: '#FF6347', emissive: '#CC4F38' },
    { color: '#4169E1', emissive: '#2E5DB8' },
    { color: '#32CD32', emissive: '#228B22' },
    { color: '#FFD700', emissive: '#AA8800' },
    { color: '#FF1493', emissive: '#CC1075' },
  ];

  const zones = 5;
  const fleetsPerZone = 3;
  const vehiclesPerFleet = 10; // 150 total

  for (let zone = 0; zone < zones; zone++) {
    const zoneX = (zone % 3) * 50 - 50; // 3 columns
    const zoneZ = Math.floor(zone / 3) * 50 - 25; // 2 rows

    const wp1 = `zone-${zone}-wp1`;
    const wp2 = `zone-${zone}-wp2`;
    const wp3 = `zone-${zone}-wp3`;
    const wp4 = `zone-${zone}-wp4`;

    groundWaypoints[wp1] = { id: wp1, position: [zoneX - 15, zoneZ - 15], type: 'parking' as const, orientation: 0, width: 3 };
    groundWaypoints[wp2] = { id: wp2, position: [zoneX + 15, zoneZ - 15], type: 'intersection' as const, radius: 5 };
    groundWaypoints[wp3] = { id: wp3, position: [zoneX + 15, zoneZ + 15], type: 'service' as const };
    groundWaypoints[wp4] = { id: wp4, position: [zoneX - 15, zoneZ + 15], type: 'loading' as const, orientation: Math.PI / 2, width: 4 };

    const pathId = `zone-${zone}-loop`;
    groundPaths[pathId] = {
      id: pathId,
      waypoints: [wp1, wp2, wp3, wp4, wp1],
      speed: 7.0,
      width: 2.5,
      curveType: 'catmullrom' as const,
      curveTension: 0.5,
      bidirectional: false,
    };

    for (let fleetIdx = 0; fleetIdx < fleetsPerZone; fleetIdx++) {
      const globalFleetIdx = zone * fleetsPerZone + fleetIdx;
      const fleetId = `fleet-${globalFleetIdx}`;
      const colorPalette = colors[globalFleetIdx % colors.length];

      groundFleets[fleetId] = {
        id: fleetId,
        name: `Fleet ${globalFleetIdx + 1}`,
        modelId: 'service-truck',
        color: colorPalette.color,
        emissive: colorPalette.emissive,
        vehicleCount: vehiclesPerFleet,
        spawnPoints: [
          {
            id: `spawn-${fleetId}`,
            position: [zoneX - 15, zoneZ - 15 + fleetIdx * 5] as [number, number],
            orientation: 0,
            type: 'parking' as const,
          },
        ],
        defaultPath: pathId,
        behavior: {
          cruiseSpeed: 7.0,
          maxSpeed: 12.0,
          acceleration: 2.0,
          deceleration: 3.0,
          turnRate: 45,
        },
        collision: {
          radius: 2.0,
          avoidanceDistance: 10.0,
          avoidanceStrength: 0.5,
        },
      };
    }
  }

  return {
    enabled: true,
    groundWaypoints,
    groundPaths,
    groundFleets,
    groundPhysics: {
      friction: 0.7,
      maxSpeed: 15.0,
      minTurnRadius: 3.0,
      collisionEnabled: true,
      collisionDamping: 0.5,
      groundLevel: 0.1,
    },
    performance: {
      enableCurveCaching: true,
      enableSpatialGrid: true,
      defaultCurveSamples: 150,
      spatialGridCellSize: 15,
    },
    debug: {
      showPaths: true,
      showWaypoints: true,
      showZones: false,
      showVehicles: true,
      showCollisionBounds: false,
    },
  };
})();
