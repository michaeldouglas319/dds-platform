import * as THREE from 'three';
import type { DroneFleet } from '../types/fleet.types';

/**
 * Multi-source drone fleet configuration
 * Each fleet represents a warehouse, distribution center, or drone operator
 * Infinitely scalable - add new fleets without code changes
 */

// Fleet 1: North Warehouse - Ground/Multi-rotor Drones
const WAREHOUSE_NORTH: DroneFleet = {
  id: 'warehouse-north',
  name: 'North Warehouse Fleet',
  color: '#FF6347',              // Tomato Red
  emissive: '#CC4F38',           // Dark red glow
  modelType: 'quadcopter',       // Multi-rotor drones
  particleCount: 5,
  speedMultiplier: 1.0,          // Normal speed
  altitudeOffset: 2.5,           // ±2.5m altitude variation
  originGates: [
    {
      id: 'wh-north-g1',
      fleetId: 'warehouse-north',
      position: new THREE.Vector3(-15, 0.1, -5),
      index: 0,
    },
    {
      id: 'wh-north-g2',
      fleetId: 'warehouse-north',
      position: new THREE.Vector3(-15, 0.1, 0),
      index: 1,
    },
  ],
  landingZone: [
    new THREE.Vector3(-15, 0.1, -5),
    new THREE.Vector3(-15, 0.1, 0),
  ],
  orbitalCenter: new THREE.Vector3(15, 50, -10),
  collisionAvoidanceRadius: 10.0,
  collisionAvoidanceStrength: 0.18,
};

// Fleet 2: South Distribution Hub - Fixed-wing Aircraft
const DISTRIBUTION_SOUTH: DroneFleet = {
  id: 'distribution-south',
  name: 'South Distribution Hub',
  color: '#4169E1',              // Royal Blue
  emissive: '#2E5DB8',           // Dark blue glow
  modelType: 'aircraft',         // Fixed-wing aircraft
  particleCount: 4,
  speedMultiplier: 1.3,          // Faster (aircraft)
  altitudeOffset: 3.0,
  originGates: [
    {
      id: 'dist-south-g1',
      fleetId: 'distribution-south',
      position: new THREE.Vector3(-15, 0.1, 5),
      index: 0,
    },
    {
      id: 'dist-south-g2',
      fleetId: 'distribution-south',
      position: new THREE.Vector3(-15, 0.1, 10),
      index: 1,
    },
  ],
  landingZone: [
    new THREE.Vector3(-15, 0.1, 5),
    new THREE.Vector3(-15, 0.1, 10),
  ],
  orbitalCenter: new THREE.Vector3(15, 55, 10),
  collisionAvoidanceRadius: 12.0,
  collisionAvoidanceStrength: 0.15,
};

// Fleet 3: Mobile Unit - Flexible Drone Network
const MOBILE_UNIT: DroneFleet = {
  id: 'mobile-unit',
  name: 'Mobile Dispatch Unit',
  color: '#32CD32',              // Lime Green
  emissive: '#228B22',           // Forest Green glow
  modelType: 'drone',            // Generic drone model
  particleCount: 3,
  speedMultiplier: 0.8,          // Slower (careful operations)
  altitudeOffset: 2.0,
  originGates: [
    {
      id: 'mobile-g1',
      fleetId: 'mobile-unit',
      position: new THREE.Vector3(-10, 0.1, -10),
      index: 0,
    },
  ],
  landingZone: [new THREE.Vector3(-10, 0.1, -10)],
  orbitalCenter: new THREE.Vector3(20, 48, 0),
  collisionAvoidanceRadius: 9.0,
  collisionAvoidanceStrength: 0.2,
};

// Fleet 4: Express Fleet - Fast Delivery Service
const EXPRESS_FLEET: DroneFleet = {
  id: 'express-fleet',
  name: 'Express Delivery Fleet',
  color: '#FFD700',              // Gold
  emissive: '#CCAA00',           // Dark gold glow
  modelType: 'drone',            // Optimized delivery drone
  particleCount: 6,
  speedMultiplier: 1.5,          // Very fast
  altitudeOffset: 4.0,           // Higher altitude operations
  originGates: [
    {
      id: 'express-g1',
      fleetId: 'express-fleet',
      position: new THREE.Vector3(-10, 0.1, 10),
      index: 0,
    },
  ],
  landingZone: [new THREE.Vector3(-10, 0.1, 10)],
  orbitalCenter: new THREE.Vector3(25, 52, 5),
  orbitalRadius: 16.0,           // Wider orbit for faster drones
  collisionAvoidanceRadius: 11.0,
  collisionAvoidanceStrength: 0.12,
};

// Fleet 5: Heavy Operations Team - Cargo/Industrial Drones
const HEAVY_OPERATIONS: DroneFleet = {
  id: 'heavy-operations',
  name: 'Heavy Ops Team',
  color: '#8B4513',              // Saddle Brown
  emissive: '#654321',           // Dark brown glow
  modelType: 'quadcopter',       // Heavy-duty multi-rotor
  particleCount: 2,
  speedMultiplier: 0.6,          // Slower (heavy load)
  altitudeOffset: 1.5,           // Lower altitude (stability)
  originGates: [
    {
      id: 'heavy-g1',
      fleetId: 'heavy-operations',
      position: new THREE.Vector3(-20, 0.1, 0),
      index: 0,
    },
  ],
  landingZone: [new THREE.Vector3(-20, 0.1, 0)],
  orbitalCenter: new THREE.Vector3(10, 45, -5),
  orbitalRadius: 14.0,           // Smaller orbit for slower drones
  collisionAvoidanceRadius: 8.0,
  collisionAvoidanceStrength: 0.22,
};

// Fleet 6: Autonomous Testing Network - R&D Fleet
const AUTONOMOUS_TEST: DroneFleet = {
  id: 'autonomous-test',
  name: 'Autonomous Testing Network',
  color: '#9370DB',              // Medium Purple
  emissive: '#6B4FAA',           // Dark purple glow
  modelType: 'aircraft',         // Advanced test platform
  particleCount: 3,
  speedMultiplier: 1.2,          // Moderate speed
  altitudeOffset: 3.5,           // Variable altitude testing
  originGates: [
    {
      id: 'auto-test-g1',
      fleetId: 'autonomous-test',
      position: new THREE.Vector3(-5, 0.1, -5),
      index: 0,
    },
  ],
  landingZone: [new THREE.Vector3(-5, 0.1, -5)],
  orbitalCenter: new THREE.Vector3(20, 50, 10),
  collisionAvoidanceRadius: 10.5,
  collisionAvoidanceStrength: 0.16,
};

/**
 * All available fleets
 * System is infinitely scalable - add new fleets here
 */
export const DRONE_FLEETS: DroneFleet[] = [
  WAREHOUSE_NORTH,
  // DISTRIBUTION_SOUTH,
  // MOBILE_UNIT,
  // EXPRESS_FLEET,
  // HEAVY_OPERATIONS,
  // AUTONOMOUS_TEST,
];

/**
 * Get fleet by ID
 */
export function getFleetById(fleetId: string): DroneFleet | undefined {
  return DRONE_FLEETS.find(f => f.id === fleetId);
}

/**
 * Get all gates across all fleets
 */
export function getAllFleetGates(): typeof DRONE_FLEETS[0]['originGates'] {
  return DRONE_FLEETS.flatMap(fleet => fleet.originGates);
}

/**
 * Get total particle count across all fleets
 */
export function getTotalFleetParticles(): number {
  return DRONE_FLEETS.reduce((sum, fleet) => sum + fleet.particleCount, 0);
}

/**
 * Export config for legacy compatibility
 */
export const FLEET_CONFIG = {
  fleets: DRONE_FLEETS,
  totalDrones: getTotalFleetParticles(),
  fleetCount: DRONE_FLEETS.length,
  maxParticlesPerFleet: Math.max(...DRONE_FLEETS.map(f => f.particleCount)),
};
