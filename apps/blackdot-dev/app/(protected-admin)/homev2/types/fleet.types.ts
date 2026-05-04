import * as THREE from 'three';

/**
 * Drone model types with distinct visual and behavioral characteristics
 */
export type DroneModelType = 'sphere' | 'drone' | 'aircraft' | 'quadcopter' | 'custom';

/**
 * Fleet identity and configuration
 * Each fleet represents a warehouse, distribution hub, or drone operator
 */
export interface DroneFleet {
  // Identity
  id: string;                          // Unique identifier (e.g., "warehouse-north")
  name: string;                        // Display name (e.g., "North Warehouse Fleet")

  // Visual appearance
  color: string;                       // Hex color (e.g., "#FF6347")
  emissive: string;                    // Emissive color for glow
  modelType: DroneModelType;           // Drone shape/model

  // Fleet scale
  particleCount: number;               // How many drones in this fleet

  // Origin locations (where drones spawn)
  originGates: FleetGate[];            // Spawn points for this fleet

  // Landing configuration
  landingZone: THREE.Vector3[];        // Where drones return to land

  // Flight characteristics
  orbitalCenter: THREE.Vector3;        // Center point for orbital holding
  orbitalRadius?: number;              // Override orbital radius (if different from config)
  orbitalSpeed?: number;               // Override orbital speed
  speedMultiplier: number;             // 0.5-2.0 for fleet speed variance
  altitudeOffset: number;              // ±height variation for fleet altitude

  // Behavioral characteristics
  collisionAvoidanceRadius?: number;   // Fleet-specific separation distance
  collisionAvoidanceStrength?: number; // How strongly drones avoid each other
}

/**
 * Gate/spawn point for a specific fleet
 */
export interface FleetGate {
  id: string;                          // Unique gate identifier
  fleetId: string;                     // Which fleet uses this gate
  position: THREE.Vector3;             // World position
  index: number;                       // Gate order/index
}

/**
 * Fleet statistics for dashboard visualization
 */
export interface FleetStatistics {
  fleetId: string;
  total: number;                       // Total drones in fleet
  active: number;                      // Currently spawned
  parked: number;                      // At gates
  taxiing: number;                     // Moving on ground
  takeoff: number;                     // Ascending
  merging: number;                     // Entering orbit
  orbiting: number;                    // In holding pattern
  approaching: number;                 // Returning
  landing: number;                     // Descending
}

/**
 * Fleet color scheme
 */
export interface FleetColorScheme {
  primary: string;                     // Main color
  emissive: string;                    // Glow color
  light?: string;                      // Light variant
  dark?: string;                       // Dark variant
}
