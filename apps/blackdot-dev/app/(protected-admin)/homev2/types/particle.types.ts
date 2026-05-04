import * as THREE from 'three';
import type { OrbitalParams } from '@/lib/threejs/utils/orbitalPaths';
import type { Orientation } from '@/lib/threejs/utils/orientation';
import type { DroneModelType } from './fleet.types';

export type ParticleState = 'parked' | 'taxiing' | 'takeoff' | 'mergingIn' | 'orbiting' | 'approaching' | 'landing';

export interface RunwayParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  state: ParticleState;
  stateTimer: number;
  targetWaypoint: number | null;
  currentWaypoint: number;
  scale: number;
  gateId: string;
  originalGatePosition: THREE.Vector3;

  // Orientation/rotation
  orientation?: Orientation;
  rotation?: THREE.Euler;
  quaternion?: THREE.Quaternion;

  // Model configuration
  modelId?: string;                    // Reference to model registry
  modelType?: DroneModelType;          // Type of drone model (sphere, drone, aircraft, etc.)

  // Fleet membership (NEW)
  fleetId?: string;                    // Which fleet owns this drone
  sourceGateId?: string;               // Which gate it spawned from
  fleetColor?: string;                 // Fleet-specific color (hex)
  fleetEmissive?: string;              // Fleet-specific emissive color

  // Orbital properties (randomized per particle to prevent stacking)
  orbitAngle?: number;
  orbitalParams?: OrbitalParams;

  // Transition properties for smooth merging into orbit
  targetOrbitPosition?: THREE.Vector3;
  mergeProgress?: number;
  // Takeoff separation
  takeoffLateralOffset?: number; // Lateral offset from runway center during takeoff
  // Transfer flag
  transferredToOrbit?: boolean; // True when particle has been transferred to ScalableOrbitingParticles
  // Orbit matching flag
  matchedOrbit?: boolean; // True when particle has matched an existing orbiting particle's trajectory
}
