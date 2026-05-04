import * as THREE from 'three';

export interface ModelOrientationConfig {
  scale?: number | [number, number, number];
  rotationOffset?: [number, number, number]; // Euler angles [x, y, z] in radians
  positionOffset?: [number, number, number]; // Local position offset

  // Orientation locking to particle trail/movement
  lockToTrail?: boolean; // Lock model orientation to movement direction
  trailAlignmentMode?: 'horizontal' | 'full-3d' | 'none'; // How to align with trail
  allowBanking?: boolean; // Allow banking during turns
}

// Default factory configuration for model orientation
export const DEFAULT_FACTORY_MODEL_ORIENTATION: ModelOrientationConfig = {
  scale: 1.9, // 1.9x scale as requested
  rotationOffset: [0, 0, 0], // No rotation offset (face default direction)
  positionOffset: [0, 0, 0], // No position offset
  lockToTrail: true, // Lock orientation to movement direction
  trailAlignmentMode: 'horizontal', // Align horizontally (no pitch)
  allowBanking: true, // Allow banking during turns
};

// Default factory source configuration
export const DEFAULT_FACTORY_SOURCE_CONFIG: Partial<SourceConfig> = {
  gatePosition: new THREE.Vector3(-40, 0, -40), // Factory gate position
  takeoffDuration: 2.0,
  spawnRate: 0.15,
  orbitEntryAngle: Math.PI / 2,
  orbitEntryVelocity: 0.6,
  particleColor: '#3b82f6', // Factory blue color
  modelOrientation: DEFAULT_FACTORY_MODEL_ORIENTATION,
};

export interface SourceConfig {
  id: string;
  gatePosition: THREE.Vector3;
  takeoffWaypoints: THREE.Vector3[];
  takeoffDuration: number;
  spawnRate: number;
  orbitEntryAngle: number;
  orbitEntryVelocity: number;
  particleColor: string;
  modelOrientation?: ModelOrientationConfig; // Per-source model orientation overrides
}

export interface OrbitConfig {
  center: THREE.Vector3;
  radius: number;
  nominalSpeed: number;
}

export interface AvoidanceConfig {
  enabled: boolean;
  method: 'spatial-grid' | 'brute-force';
  gridSectorCount: number;
  minSeparationDistance: number;
  avoidanceForceStrength: number;
  separationKP: number;
  separationKD: number;
  // Vertical adjustment parameters
  allowVerticalAdjustment: boolean;
  verticalAdjustmentStrength: number; // How much to move up/down
  maxVerticalOffset: number; // Max vertical displacement from nominal orbit
}

// Orientation config removed - using simple native Three.js orientation
// Particles now simply look in their direction of movement

export const MULTI_SOURCE_ORBIT_CONFIG = {
  orbit: {
    center: new THREE.Vector3(6, 30, 0),
    radius: 25,
    nominalSpeed: 0.6,
  },

  // Factory defaults for quick source configuration
  // Use DEFAULT_FACTORY_MODEL_ORIENTATION and DEFAULT_FACTORY_SOURCE_CONFIG
  // to quickly set up new sources with standard factory settings

  sources: [
    {
      id: 'north-gate',
      gatePosition: new THREE.Vector3(-40, 0, -40),
      takeoffWaypoints: [
        new THREE.Vector3(-40, 0, -40),
        new THREE.Vector3(-30, 12, -37),
        new THREE.Vector3(0, 25, 0),
        new THREE.Vector3(6, 30, 25),  // FIX: Y=30 to match orbit center height
      ],
      takeoffDuration: 2.0,
      spawnRate: 2.0,  // FIX: Was 0.15 (too fast!), now 2.0 seconds between spawns
      orbitEntryAngle: Math.PI / 2,
      orbitEntryVelocity: 0.6,
      particleColor: '#ff0000', // Red (hex format required by validation)
      modelOrientation: {
        scale: 2,
        rotationOffset: [-Math.PI, 0, 0],
        positionOffset: [0, 0, 0],
        lockToTrail: true,
        trailAlignmentMode: 'horizontal',
        allowBanking: true,
      },
    },
    {
      id: 'east-gate',
      gatePosition: new THREE.Vector3(40, 0, -40),
      takeoffWaypoints: [
        new THREE.Vector3(40, 0, -40),
        new THREE.Vector3(30, 12, -37),
        new THREE.Vector3(15, 25, 10),
        new THREE.Vector3(6, 30, 25),  // FIX: Y=30 to match orbit center height
      ],
      takeoffDuration: 6.0,
      spawnRate: 3.0,  // FIX: Was 1 (too fast), now 3.0 seconds between spawns
      orbitEntryAngle: Math.PI,
      orbitEntryVelocity: 0.6,
      particleColor: '#ef4444',
      modelOrientation: {
        scale: 0.1, // Slightly larger
        rotationOffset: [-Math.PI, 0, 0],
        positionOffset: [0, 0, 0], // Slightly raised
        lockToTrail: true,
        trailAlignmentMode: 'horizontal',
        allowBanking: true,
      },
    },
    {
      id: 'south-gate',
      gatePosition: new THREE.Vector3(-40, 0, 40),
      takeoffWaypoints: [
        new THREE.Vector3(-40, 0, 40),
        new THREE.Vector3(-30, 12, 37),
        new THREE.Vector3(0, 25, 15),
        new THREE.Vector3(6, 30, 25),  // FIX: Y=30 to match orbit center height
      ],
      takeoffDuration: 4.0,
      spawnRate: 2.5,  // FIX: Keep at 2.5 seconds between spawns
      orbitEntryAngle: (3 * Math.PI) / 2, // 270° (equivalent to -90° but in 0-2π range)
      orbitEntryVelocity: 0.6,
      particleColor: '#10b981',
      modelOrientation: {
        scale: 0.1, // Slightly smaller
        rotationOffset: [-Math.PI, 0, 0],
        positionOffset: [0, 0, 0], // Slightly lowered
        lockToTrail: true,
        trailAlignmentMode: 'horizontal',
        allowBanking: true,
      },
    },
  ],

  particleCount: 100,

  avoidance: {
    enabled: true,
    method: 'spatial-grid',
    gridSectorCount: 32,
    minSeparationDistance: 8.0,
    avoidanceForceStrength: 0.8,
    separationKP: 0.15,
    separationKD: 0.05,
    allowVerticalAdjustment: true,
    verticalAdjustmentStrength: 0.3, // 30% of separation force goes vertical
    maxVerticalOffset: 8.0, // Max ±8 units from nominal orbit height
  },

  orbitDuration: 8.0,
  landingDuration: 5.0, // Increased from 3.0 - slower, smoother landing
  landingWaypoints: [
    new THREE.Vector3(9, 32.3, 25),
    new THREE.Vector3(20, 20, 35),
    new THREE.Vector3(35, 8, 20),
    new THREE.Vector3(40, 2, 40),
    new THREE.Vector3(40, 0, 40),
  ],
  landingTransitionTolerance: Math.PI / 12,

  // Exit zone configuration for area-based exits
  exitZone: {
    radius: 7.0,                    // 3-5 units (small zone for precise exits)
    attractionStrength: 0.7,       // Gentle pull toward exit
    attractionMaxDistance: 15.0,    // Start attracting within this distance
    requireProximity: true,         // Must be in zone to exit
  },

  defaultStartPhase: 'takeoff' as const,
  orbitHeightVariation: 1,
  orbitWaveFrequency: 0.3,

  // === V2 ENHANCEMENTS ===

  // Momentum handoff for smooth transitions
  momentumHandoff: {
    entry: {
      blendDuration: 0.3,           // Seconds to blend takeoff → orbit velocities (shorter = stronger orbit force)
      easingMode: 'smooth' as const, // 'linear' | 'smooth' | 'ease-in' | 'ease-out'
      speedMatchMode: 'particle-to-orbit' as const, // How to resolve velocity mismatch
      maxAcceleration: Infinity,    // Max m/s² (Infinity = no limit)
    },
    exit: {
      blendDuration: 0.5,           // Seconds to blend orbit → landing velocities
      easingMode: 'smooth' as const,
      speedMatchMode: 'particle-to-orbit' as const,
      maxAcceleration: Infinity,
    },
    showVelocityVectors: false,     // Debug: visualize velocity arrows
    logTransitions: true,           // Debug: console log handoff events (enabled for testing)
  },

  // Orientation control (forward-polar-lock, orbit-lock, or V1 behavior)
  orientation: {
    mode: 'forward-polar-lock' as const, // 'forward-polar-lock' | 'orbit-lock' | 'v1-original'
    polarLock: {
      worldUp: new THREE.Vector3(0, 1, 0), // Up direction for polar lock
      lockDuringBlend: true,        // Maintain polar lock during velocity handoff
    },
    rotationSpeed: Math.PI * 2,     // Radians/sec (2π = 360°/sec)
    useInstantRotation: false,      // Skip smooth rotation (snap immediately)
    showOrientationVectors: false,  // Debug: visualize forward/up/right axes
  },

  // Visual configuration
  visual: {
    // Orbit zone visualization (donut showing orbital volume)
    orbitZone: {
      enabled: true,
      mode: 'wireframe' as const,   // 'solid' | 'wireframe' | 'rings' | 'hidden'
      color: '#4444ff',
      opacity: 0.0,
      radialThickness: 6.0,         // Donut tube width (auto-calculated from particle variation if 0)
      verticalHeight: 9.0,          // Donut tube height (auto-calculated from oscillation if 0)
    },
    // Legacy orbit circle (thin line)
    orbitCircle: {
      enabled: false,                // Disable in favor of donut
      color: '#4444ff',
    },
  },
};

// === COLLISION BUBBLE CONFIGURATION ===
export interface CollisionBubbleConfig {
  baseRadius: number;
  outerRadius: number;
  innerRadius: number;
  repulsionStrength: number;
  repulsionFalloff: 'linear' | 'quadratic' | 'exponential';
  softCollisionThreshold: number;
  hardCollisionThreshold: number;
}

export const COLLISION_BUBBLE_CONFIG: CollisionBubbleConfig = {
  baseRadius: 3.0,
  outerRadius: 5.0,
  innerRadius: 2.0,
  repulsionStrength: 1.5,
  repulsionFalloff: 'quadratic' as const,
  softCollisionThreshold: 4.0,
  hardCollisionThreshold: 2.5,
};