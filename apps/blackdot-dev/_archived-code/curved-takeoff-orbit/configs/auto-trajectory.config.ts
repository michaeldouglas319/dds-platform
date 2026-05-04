/**
 * Auto-Trajectory Configuration
 *
 * Simplified config that auto-calculates entry/exit points.
 * NO manual orbitEntryAngle or waypoint specification required.
 */

import * as THREE from 'three';
import type { SourceDefinition, OrbitConfig } from '../lib/trajectoryCalculator';

// ============================================================================
// ORBIT CONFIGURATION (Global)
// ============================================================================

export const AUTO_ORBIT_CONFIG: OrbitConfig = {
  center: new THREE.Vector3(6, 30, 0),
  radius: 25,
  nominalSpeed: 0.6 // units per second tangential velocity
};

// ============================================================================
// SOURCE DEFINITIONS (Simplified - User Only Defines Gates)
// ============================================================================

export const AUTO_SOURCES: SourceDefinition[] = [
  {
    id: 'north-gate',
    gatePosition: new THREE.Vector3(-40, 0, -40),

    // Optional: customize trajectory shape
    takeoffDirection: undefined, // Auto: toward orbit center
    takeoffHeight: undefined,    // Auto: orbit.center.y
    takeoffArcHeight: 40,        // Override: peak height of arc

    // Optional: customize landing
    landingDestination: undefined, // Auto: same as gatePosition

    // Styling
    // particleColor: '#ff0000',
    // modelScale: 2.0
  },

  {
    id: 'east-gate',
    gatePosition: new THREE.Vector3(50, 0, 0),
    takeoffArcHeight: 35, // Slightly different arc
  },

  {
    id: 'south-gate',
    gatePosition: new THREE.Vector3(0, 0, 50),
    takeoffArcHeight: 38,
  }
];

// ============================================================================
// ORIENTATION CONFIGURATION
// ============================================================================

export const ORIENTATION_CONFIG = {
  // Orbit-lock settings
  orbitCenter: AUTO_ORBIT_CONFIG.center,
  orbitNormal: new THREE.Vector3(0, 1, 0), // XZ plane orbit

  // Smoothing (using quaternion.rotateTowards pattern)
  rotationSpeed: Math.PI * 3, // 540° per second (fast but smooth)
  useInstantRotation: false,  // False = smooth, True = instant snap

  // Per-source overrides (optional)
  sourceOverrides: {
    'north-gate': {
      additionalRotation: new THREE.Euler(-Math.PI / 2, 0, 0), // Pitch down
      modelScale: 2.0
    },
    'east-gate': {
      additionalRotation: new THREE.Euler(-Math.PI / 2, Math.PI / 4, 0),
      modelScale: 1.5
    },
    'south-gate': {
      additionalRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
      modelScale: 2.0
    }
  }
};

// ============================================================================
// PHYSICS & TIMING
// ============================================================================

export const TRAJECTORY_TIMING = {
  // Spawn
  spawnRate: 0.15,              // Seconds between spawns per source
  maxParticlesPerSource: 20,    // Pool size

  // Phase durations
  takeoffDuration: 2.0,         // Seconds to follow takeoff curve (0 → 1)
  orbitDuration: 8.0,           // Minimum time in orbit before landing eligible
  landingDuration: 3.0,         // Seconds to follow landing curve
  landingTransitionBlend: 0.5,  // Smooth blend from orbit → landing curve (seconds)

  // Physics
  orbitPhysics: {
    heightVariation: 3.0,       // Vertical oscillation amplitude
    waveFrequency: 1.5,         // Oscillation speed
    inclination: 0.0,           // Orbit tilt (radians)
  }
};

// ============================================================================
// COLLISION AVOIDANCE (Optional - can disable)
// ============================================================================

export const COLLISION_CONFIG = {
  enabled: true,
  method: 'spatial-grid' as const,

  // Grid parameters
  gridSectorCount: 32,          // Angular sectors for fast lookup
  minSeparationDistance: 8.0,   // Minimum safe distance

  // Response forces
  avoidanceForceStrength: 0.8,
  separationKP: 1.2,            // Proportional gain
  separationKD: 0.3,            // Derivative gain (damping)

  // Vertical adjustment
  allowVerticalAdjustment: true,
  verticalAdjustmentStrength: 0.6,
  maxVerticalOffset: 8.0,

  // Radial adjustment
  allowRadialAdjustment: true,
  radialAdjustmentStrength: 0.5,
  maxRadialOffset: 10.0,        // Max orbit radius change

  // Speed adjustment
  allowSpeedAdjustment: true,
  speedAdjustmentRange: [0.4, 1.6], // 40% to 160% of nominal speed
};

// ============================================================================
// EXIT/LANDING SYSTEM
// ============================================================================

export const EXIT_CONFIG = {
  // Area-based exit detection
  exitZone: {
    radius: 7.0,                // Distance from exit point to trigger landing
    attractionStrength: 0.7,    // Pull force toward exit
    attractionMaxDistance: 15.0 // Start attracting when within this distance
  },

  // Missed exit handling
  missedExitExtension: 2.0,     // Extra orbit time if exit missed (seconds)
  maxMissedExits: 3,            // Recycle particle after this many misses
};

// ============================================================================
// VISUALIZATION & DEBUG
// ============================================================================

export const VISUAL_CONFIG = {
  // Curve visualization
  showTakeoffPaths: true,
  showLandingPaths: true,
  showOrbitCircle: true,

  // Debug overlays
  showWaypoints: true,
  showEntryExitMarkers: true,
  showCollisionBubbles: false,

  // Trails
  enableTrails: true,
  trailLength: 50,              // Number of positions to track
  trailFadeSpeed: 0.95,         // Opacity decay per frame

  // Colors
  takeoffPathColor: '#00ff00',
  landingPathColor: '#ff9900',
  orbitCircleColor: '#0099ff',
  waypointColor: '#ffff00',

  // Performance
  showFPS: true,
  showParticleCount: true,
};

// ============================================================================
// VALIDATION THRESHOLDS
// ============================================================================

export const VALIDATION_THRESHOLDS = {
  // Trajectory merge quality
  excellentMergeDistance: 1.0,  // Distance < 1.0 = excellent
  goodMergeDistance: 3.0,       // Distance < 3.0 = good
  acceptableMergeDistance: 6.0, // Distance < 6.0 = acceptable
  // Above = poor

  // Angular separation
  minimumAngularSeparation: Math.PI / 4, // 45° between entry points

  // Warnings
  warnOnPoorMerge: true,
  warnOnCollisions: false,      // Set true for debugging
};

// ============================================================================
// EXPORT UNIFIED CONFIG
// ============================================================================

export const UNIFIED_AUTO_CONFIG = {
  orbit: AUTO_ORBIT_CONFIG,
  sources: AUTO_SOURCES,
  orientation: ORIENTATION_CONFIG,
  timing: TRAJECTORY_TIMING,
  collision: COLLISION_CONFIG,
  exit: EXIT_CONFIG,
  visual: VISUAL_CONFIG,
  validation: VALIDATION_THRESHOLDS,
} as const;

// Type export for usage
export type UnifiedAutoConfig = typeof UNIFIED_AUTO_CONFIG;
