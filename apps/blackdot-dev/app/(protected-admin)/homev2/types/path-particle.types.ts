import * as THREE from 'three';
import type { Path } from '@/lib/threejs/utils/pathSystem';
import { PathEvaluator } from '@/lib/threejs/utils/pathSystem';
import type { OrbitalParams } from '@/lib/threejs/utils/orbitalPaths';

/**
 * Particle lifecycle phases
 */
export type ParticlePhase = 'taxi' | 'takeoff' | 'orbiting' | 'landing' | 'landed';

/**
 * Hybrid particle that uses both path-based and physics-based motion
 *
 * Path-based phases (taxi, takeoff, landing) follow exact paths
 * Orbital phase uses physics-based motion for natural variation
 */
export interface HybridParticle {
  // Identity
  id: number;
  sourceId: string; // Which ParticleSource spawned this
  fleetId: string;
  modelId: number; // Model type identifier for orientation calculations

  // Life cycle
  phase: ParticlePhase;
  phaseStartTime: number; // Timestamp when phase started

  // Path-based properties (taxi, takeoff, landing phases)
  takeoffPath: Path;
  landingPath: Path | null;
  pathEvaluator: PathEvaluator | null;
  pathProgress: number; // 0.0 to 1.0 along current path

  // Orbital properties (orbiting phase)
  orbitalParams: OrbitalParams;
  orbitAngle: number; // Current angle around orbit center
  orbitalSpeed: number; // Base orbital speed multiplier

  // Position and motion
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  orientation: THREE.Quaternion; // Rotation based on movement direction

  // Rendering
  scale: number;
  color: string; // Fleet color (hex)
  emissive: string; // Fleet emissive color
  visible: boolean;

  // Orbital variation parameters (for natural, non-repetitive motion)
  radiusVariation: number; // 0-1, controls elliptical orbit variation
  speedVariation: number; // 0-1, controls speed variation
  inclinationPhase: number; // Random phase offset for inclination

  // Lifecycle
  birthTime: number; // When particle was spawned
  maxLifetime: number; // How long particle should live (null = infinite)
}

/**
 * Orbital mechanics parameters calculated per particle
 */
export interface OrbitalMechanicsState {
  // Orbit geometry
  center: THREE.Vector3;
  radius: number; // Base orbital radius
  eccentricity: number; // 0 = circular, >0 = elliptical
  inclination: number; // Orbital plane tilt

  // Dynamics
  gravitationalParam: number; // Controls orbital speed: v = √(k/r)
  currentRadius: number; // Actual radius with variation
  orbitalVelocity: number; // Current orbital velocity

  // Variation phases (for predictable, repeating randomness)
  eccentricityPhase: number;
  inclinationPhase: number;
}

/**
 * Configuration for particle source (gate)
 */
export interface ParticleSourceConfig {
  // Identity
  id: string; // Unique source identifier
  gateId: string; // Which gate this source represents

  // Spawn location
  position: THREE.Vector3;

  // Fleet properties
  fleetId: string;
  color: string;
  emissive: string;

  // Paths
  takeoffPath: Path; // Path from spawn to orbit
  landingPath: Path | null; // Path from orbit to spawn (null = no landing)

  // Orbital parameters
  orbitalParams: OrbitalParams;

  // Spawn behavior
  spawnRate: number; // Particles per second
  spawnDelay: number; // Initial delay before first spawn
  maxParticles: number; // Max active particles from this source

  // Timing
  pathDuration: number; // Expected time to complete path (seconds)
  orbitDuration: number; // How long to orbit before landing
}

/**
 * Runway waypoint configuration
 */
export interface TaxiWaypoint {
  id: string;
  position: [number, number, number];
  description?: string;
}

/**
 * Takeoff configuration for a gate
 */
export interface TakeoffConfiguration {
  gateId: string;
  gatePosition: [number, number, number];
  taxiWaypoints: TaxiWaypoint[];
  runwayStart: [number, number, number];
  runwayEnd: [number, number, number];
  takeoffCurveIntensity: number; // 0-1, controls how much the curve arcs upward
}
