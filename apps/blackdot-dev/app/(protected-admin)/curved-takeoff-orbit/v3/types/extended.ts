/**
 * Extended Types for Taxi, Assembly, Health Systems
 * CORE ARCHITECTURE - DO NOT MODIFY WITHOUT REVIEW
 */

import * as THREE from 'three';

// ============================================================================
// TAXI & STAGING TYPES
// ============================================================================

export type ExtendedPhase =
  | 'spawn'
  | 'taxi-to-staging'
  | 'staging'
  | 'taxi-to-runway'
  | 'runway'
  | 'takeoff'
  | 'orbit'
  | 'pre-landing'
  | 'landing'
  | 'taxi-to-destination'
  | 'parked';

export interface StagingZone {
  id: string;
  position: THREE.Vector3;
  capacity: number;
  occupancy: number;
  purpose: 'loading' | 'preparation' | 'repair' | 'inspection';
  waitTime: number;              // Seconds minimum wait
  queue: number[];               // Particle IDs in queue
}

export interface TaxiPath {
  waypoints: THREE.Vector3[];
  curve: THREE.CatmullRomCurve3;
  speed: number;                 // Units per second
}

// ============================================================================
// ASSEMBLY TYPES
// ============================================================================

export interface AssemblyState {
  currentStep: number;           // 0 to maxSteps
  maxSteps: number;              // Total steps (e.g., 10)
  stepProgress: number;          // 0-1 within current step
  advancementMode: 'time' | 'location' | 'orbit' | 'manual';
  timePerStep: number;           // Seconds per step (time mode)
  lastStepAdvance: number;       // Timestamp of last advancement
}

export interface AssemblyVisualConfig {
  mode: 'color' | 'scale' | 'glow' | 'combined';
  colorStart: THREE.Color;       // Step 0 color
  colorEnd: THREE.Color;         // Max step color
  scaleStart: number;            // Step 0 scale multiplier
  scaleEnd: number;              // Max step scale multiplier
  glowIntensity: number;         // Max emissive intensity
}

// ============================================================================
// HEALTH & STATS TYPES
// ============================================================================

export interface HealthState {
  current: number;               // 0-100
  max: number;                   // Default 100
  damageRate: number;            // HP lost per second (decay)
  regenRate: number;             // HP gained per second (in zones)
  isDamaged: boolean;            // < 50%
  isCritical: boolean;           // < 25%
  isDead: boolean;               // = 0
  lastDamage: number;            // Timestamp
}

export interface DamageSource {
  type: 'decay' | 'collision' | 'environmental' | 'overcrowding';
  amount: number;
  timestamp: number;
  position?: THREE.Vector3;
}

export interface ParticleStats {
  // Lifecycle
  spawnTime: number;
  totalAge: number;
  deathTime?: number;

  // Movement
  totalDistance: number;
  orbitsCompleted: number;
  avgSpeed: number;
  maxSpeed: number;

  // Health
  totalDamage: number;
  totalHealing: number;
  collisions: number;

  // Assembly
  stepsCompleted: number;
  assemblyStartTime: number;
  assemblyEndTime?: number;

  // Phases
  phaseHistory: Array<{
    phase: ExtendedPhase;
    enteredAt: number;
    duration: number;
  }>;
}

// ============================================================================
// EXTENDED PARTICLE INTERFACE
// ============================================================================

export interface ExtendedParticle {
  // Base (existing)
  id: number;
  sourceId: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  phase: ExtendedPhase;

  // Taxi & Staging
  taxiPath?: TaxiPath;
  taxiProgress: number;          // 0-1 along current path
  stagingZoneId?: string;
  stagingWaitStart?: number;
  queuePosition?: number;

  // Assembly
  assembly: AssemblyState;

  // Health
  health: HealthState;
  damageHistory: DamageSource[];

  // Stats
  stats: ParticleStats;

  // Visual
  color: THREE.Color;
  scale: number;                    // ORIGINAL scale from source
  emissiveIntensity: number;
  assemblyVisualScale?: number;     // ASSEMBLY progress scale (for debug only)
  emissiveFadeStartTime?: number;   // Timestamp when emissive fade begins
  targetEmissiveIntensity?: number;  // Target emissive for smooth fade

  // Existing orbit fields
  curveProgress: number;
  orbitAngle: number;
  orbitEntryAngle: number;
  orbitTimeTotal: number;
  isExitEligible: boolean;
  quaternion: THREE.Quaternion;
  prevVelocity: THREE.Vector3;
  spawnTime: number;

  // Landing transition
  landingTransitionTime?: number;
  landingStartPosition?: THREE.Vector3;
  preLandingProgress?: number;
}

// ============================================================================
// CONFIG EXTENSIONS
// ============================================================================

export interface TaxiStagingConfig {
  enabled: boolean;

  stagingZones: Array<{
    id: string;
    position: THREE.Vector3;
    capacity: number;
    waitTime: number;
    purpose: 'loading' | 'preparation' | 'repair' | 'inspection';
  }>;

  groundSpeed: number;           // Taxi movement speed (units/sec)
  queueSpacing: number;          // Distance between queued particles
  pathSmoothness: number;        // CatmullRom tension
}

export interface AssemblyConfig {
  enabled: boolean;
  maxSteps: number;              // Default 10
  advancementMode: 'time' | 'location' | 'orbit' | 'manual';
  timePerStep: number;           // Seconds (time mode)
  orbitsPerStep: number;         // Orbits (orbit mode)

  visual: AssemblyVisualConfig;

  // Assembly stations in orbit (optional)
  stations: Array<{
    position: THREE.Vector3;
    radius: number;
    speedBonus: number;          // Step advancement multiplier
  }>;
}

export interface HealthConfig {
  enabled: boolean;
  startingHealth: number;        // Default 100

  damage: {
    decayRate: number;           // HP/sec during orbit
    collisionDamage: number;     // HP per collision
    environmentalDamage: number; // HP when out of bounds
    overcrowdingDamage: number;  // HP/sec when too close
    overcrowdingDistance: number; // Distance threshold
  };

  regeneration: {
    enabled: boolean;
    stagingRegen: number;        // HP/sec in staging zones
    repairZoneRegen: number;     // HP/sec in repair zones
  };

  death: {
    behavior: 'remove' | 'respawn' | 'fade';
    respawnDelay: number;        // Seconds before respawn
  };

  visual: {
    colorHealthIndicator: boolean;
    particleEffects: boolean;    // Smoke/sparks when damaged
    healthBars: boolean;         // Debug overlay
  };
}
