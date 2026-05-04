/**
 * Dev-Tunable Configuration
 *
 * All parameters exposed for fine-tuning. Auto-calculated values can be
 * overridden manually. All fields available in sidebar editor.
 */

import * as THREE from 'three';

// ============================================================================
// SOURCE CONFIGURATION (Per-Gate Tunable Parameters)
// ============================================================================

export interface TunableSourceConfig {
  // -------------------------------------------------------------------------
  // IDENTITY
  // -------------------------------------------------------------------------
  id: string;
  label?: string; // Display name in editor

  // -------------------------------------------------------------------------
  // GATE POSITION (Required)
  // -------------------------------------------------------------------------
  gatePosition: THREE.Vector3;

  // -------------------------------------------------------------------------
  // TAKEOFF TRAJECTORY
  // -------------------------------------------------------------------------
  takeoff: {
    // Waypoints: auto-generated OR manual override
    waypointsMode: 'auto' | 'manual';
    manualWaypoints?: THREE.Vector3[]; // Used if mode = 'manual'

    // Auto-generation parameters (used if mode = 'auto')
    direction?: THREE.Vector3;      // Default: toward orbit center
    arcHeight?: number;             // Peak height (default: orbit.center.y * 1.2)
    intermediatePoints?: number;    // Number of waypoints (default: 3)
    curveType?: 'catmull-rom' | 'cubic-bezier'; // Default: catmull-rom
    curveTension?: number;          // 0-1, affects smoothness (default: 0.5)

    // Duration & timing
    duration: number;               // Seconds to complete takeoff (default: 2.0)
  };

  // -------------------------------------------------------------------------
  // ORBIT ENTRY
  // -------------------------------------------------------------------------
  orbitEntry: {
    // Entry angle: auto-calculated OR manual override
    angleMode: 'auto' | 'manual';
    manualAngle?: number;           // Radians, used if mode = 'manual'

    // Auto-calculation hint (used if mode = 'auto')
    preferredSide?: 'closest' | 'north' | 'east' | 'south' | 'west';

    // Entry velocity (tangential speed when entering orbit)
    entryVelocity: number;          // Default: orbit.nominalSpeed

    // Fine-tune entry point position (applied AFTER auto-calc)
    entryOffset?: {
      radial?: number;              // Offset from orbit radius (±units)
      tangential?: number;          // Offset along orbit (radians)
      vertical?: number;            // Y-axis offset (units)
    };
  };

  // -------------------------------------------------------------------------
  // ORBIT BEHAVIOR
  // -------------------------------------------------------------------------
  orbit: {
    // Duration before landing eligible
    minDuration: number;            // Default: 8.0 seconds

    // Speed modulation
    speedMultiplier: number;        // Multiplier on nominalSpeed (default: 1.0)
    speedVariation?: number;        // Random variation ±% (default: 0.0)

    // Vertical distribution
    verticalOffset?: number;        // Static Y offset (default: 0)
    verticalOscillation?: {
      enabled: boolean;
      amplitude: number;            // Peak-to-peak (default: 3.0)
      frequency: number;            // Cycles per orbit (default: 1.5)
      phase: number;                // Start phase offset (radians)
    };

    // Radial distribution
    radialOffset?: number;          // Static radius offset (default: 0)
  };

  // -------------------------------------------------------------------------
  // ORBIT EXIT / LANDING
  // -------------------------------------------------------------------------
  landing: {
    // Destination: auto (back to gate) OR manual
    destinationMode: 'auto' | 'manual';
    manualDestination?: THREE.Vector3;

    // Exit point: auto-calculated OR manual override
    exitAngleMode: 'auto' | 'manual';
    manualExitAngle?: number;       // Radians

    // Waypoints: auto-generated OR manual
    waypointsMode: 'auto' | 'manual';
    manualWaypoints?: THREE.Vector3[];

    // Auto-generation parameters
    descentArcHeight?: number;      // Default: exitPoint.y * 0.8
    intermediatePoints?: number;    // Default: 3
    curveType?: 'catmull-rom' | 'cubic-bezier';

    // Duration & timing
    duration: number;               // Default: 3.0 seconds
    transitionBlend: number;        // Smooth blend time from orbit (default: 0.5s)
  };

  // -------------------------------------------------------------------------
  // ORIENTATION (Model Rotation)
  // -------------------------------------------------------------------------
  orientation: {
    mode: 'forward-polar-lock' | 'curve-tangent' | 'orbit-lock' | 'manual';

    // Manual orientation (if mode = 'manual')
    manualRotation?: THREE.Euler;

    // Additional rotation applied AFTER automatic orientation
    additionalRotation?: THREE.Euler;

    // Smoothing
    rotationSpeed: number;          // Radians/sec (default: Math.PI * 2)
    useInstantRotation: boolean;    // Skip smoothing (default: false)

    // Up vector override
    customUpVector?: THREE.Vector3; // Default: radial from orbit center
  };

  // -------------------------------------------------------------------------
  // VISUAL & RENDERING
  // -------------------------------------------------------------------------
  visual: {
    color: string;                  // Hex color (default: '#ff0000')
    modelScale: number;             // Scale multiplier (default: 1.0)
    modelPath?: string;             // Custom model (default: shared model)

    // Position offset (applied to model, not physics)
    positionOffset?: THREE.Vector3;

    // Trail
    enableTrail: boolean;           // Default: true
    trailLength?: number;           // Default: 50
    trailColor?: string;            // Default: matches particle color
  };

  // -------------------------------------------------------------------------
  // SPAWNING
  // -------------------------------------------------------------------------
  spawn: {
    enabled: boolean;               // Enable/disable this source (default: true)
    spawnRate: number;              // Seconds between spawns (default: 0.15)
    maxParticles: number;           // Pool size (default: 20)
    burstMode?: {
      enabled: boolean;
      burstSize: number;            // Particles per burst
      burstInterval: number;        // Seconds between bursts
    };
  };
}

// ============================================================================
// GLOBAL ORBIT CONFIGURATION
// ============================================================================

export interface TunableOrbitConfig {
  // Core orbit parameters
  center: THREE.Vector3;
  radius: number;
  nominalSpeed: number;             // Base tangential velocity (units/sec)

  // Orbit plane
  normal: THREE.Vector3;            // Default: (0, 1, 0) for XZ plane
  inclination?: number;             // Tilt angle (radians, default: 0)

  // Physics
  physics: {
    gravity?: THREE.Vector3;        // Optional gravity vector
    drag?: number;                  // Air resistance (default: 0)
    angularDrag?: number;           // Rotation damping (default: 0)
  };
}

// ============================================================================
// COLLISION AVOIDANCE (Global)
// ============================================================================

export interface TunableCollisionConfig {
  enabled: boolean;

  // Detection method
  method: 'spatial-grid' | 'brute-force' | 'octree';
  gridSectorCount?: number;         // For spatial-grid (default: 32)

  // Separation distances
  minSeparationDistance: number;    // Warning threshold (default: 8.0)
  criticalDistance: number;         // Emergency avoidance (default: 4.0)

  // Collision bubble
  bubbleRadius: {
    inner: number;                  // Hard contact (default: 2.0)
    base: number;                   // Soft bubble (default: 3.0)
    outer: number;                  // Detection zone (default: 5.0)
  };

  // Response forces
  repulsionStrength: number;        // Base force magnitude (default: 0.8)
  falloffMode: 'linear' | 'quadratic' | 'exponential';

  // PID controller gains
  separationKP: number;             // Proportional (default: 1.2)
  separationKI: number;             // Integral (default: 0.0)
  separationKD: number;             // Derivative (default: 0.3)

  // Adjustment strategies
  strategies: {
    tangentialSpeed: {
      enabled: boolean;             // Slow down / speed up
      strength: number;             // Adjustment magnitude
      range: [number, number];      // Min/max speed multipliers [0.4, 1.6]
    };
    radialOffset: {
      enabled: boolean;             // Move to inner/outer lane
      strength: number;
      maxOffset: number;            // Max radius change (default: 10.0)
    };
    verticalAdjustment: {
      enabled: boolean;             // Move up/down
      strength: number;
      maxOffset: number;            // Max Y change (default: 8.0)
    };
  };
}

// ============================================================================
// EXIT ZONE CONFIGURATION
// ============================================================================

export interface TunableExitConfig {
  // Exit detection
  exitZone: {
    radius: number;                 // Trigger distance (default: 7.0)
    shape: 'sphere' | 'cylinder';   // Detection volume
  };

  // Attraction force (pulls toward exit)
  attraction: {
    enabled: boolean;
    strength: number;               // Force magnitude (default: 0.7)
    maxDistance: number;            // Start attracting at this distance (default: 15.0)
    falloff: 'linear' | 'quadratic' | 'exponential';
  };

  // Missed exit handling
  missedExit: {
    extensionTime: number;          // Extra orbit time (default: 2.0s)
    maxMisses: number;              // Recycle after this many (default: 3)
    debugWarnings: boolean;         // Log to console (default: false)
  };
}

// ============================================================================
// VISUALIZATION & DEBUG
// ============================================================================

export interface TunableVisualConfig {
  // Curve paths
  paths: {
    showTakeoff: boolean;
    showLanding: boolean;
    showOrbitCircle: boolean;
    lineWidth: number;              // Default: 2
    opacity: number;                // Default: 0.6
  };

  // Waypoints & markers
  markers: {
    showWaypoints: boolean;
    showEntryPoints: boolean;
    showExitPoints: boolean;
    markerSize: number;             // Default: 0.5
  };

  // Collision visualization
  collision: {
    showBubbles: boolean;
    showRepulsionVectors: boolean;
    bubbleOpacity: number;          // Default: 0.2
  };

  // Performance overlays
  debug: {
    showFPS: boolean;
    showParticleCount: boolean;
    showPhysicsStats: boolean;
    consoleLogging: 'none' | 'errors' | 'warnings' | 'all';
  };

  // Camera
  camera: {
    autoRotate: boolean;
    rotationSpeed: number;          // Default: 0.5
    fov: number;                    // Default: 50
    position: THREE.Vector3;
  };
}

// ============================================================================
// UNIFIED CONFIGURATION TYPE
// ============================================================================

// ============================================================================
// MOMENTUM HANDOFF CONFIGURATION (Global)
// ============================================================================

export interface TunableMomentumHandoffConfig {
  // Entry handoff (takeoff → orbit)
  entry: {
    blendDuration: number;          // Seconds to blend velocities (default: 1.0)
    easingMode: 'linear' | 'smooth' | 'ease-in' | 'ease-out'; // Default: smooth
    speedMatchMode: 'particle-to-orbit' | 'orbit-to-particle' | 'blend'; // Default: particle-to-orbit
    maxAcceleration: number;        // Max m/s² (default: Infinity)
  };

  // Exit handoff (orbit → landing)
  exit: {
    blendDuration: number;          // Seconds to blend velocities (default: 1.0)
    easingMode: 'linear' | 'smooth' | 'ease-in' | 'ease-out'; // Default: smooth
    speedMatchMode: 'particle-to-orbit' | 'orbit-to-particle' | 'blend';
    maxAcceleration: number;        // Max m/s² (default: Infinity)
  };

  // Debug
  showVelocityVectors: boolean;     // Visualize velocity during handoff
  logTransitions: boolean;          // Console log handoff events
}

// ============================================================================
// ORIENTATION CONFIGURATION (Global)
// ============================================================================

export interface TunableOrientationConfig {
  mode: 'forward-polar-lock' | 'orbit-lock' | 'curve-tangent' | 'manual';

  // Polar lock settings (forward-polar-lock mode)
  polarLock: {
    worldUp: THREE.Vector3;         // Default: (0, 1, 0)
    lockDuringBlend: boolean;       // Maintain polar lock during velocity blend
  };

  // Smoothing
  rotationSpeed: number;            // Radians/sec (default: Math.PI * 2)
  useInstantRotation: boolean;      // Skip smoothing (default: false)

  // Additional rotation (applied to all modes)
  additionalRotation?: THREE.Euler;

  // Debug
  showOrientationVectors: boolean;  // Visualize forward/up/right axes
}

export interface DevTunableConfig {
  // Metadata
  version: string;
  name: string;
  description?: string;
  createdAt?: string;
  modifiedAt?: string;

  // Core systems
  orbit: TunableOrbitConfig;
  sources: TunableSourceConfig[];
  collision: TunableCollisionConfig;
  exit: TunableExitConfig;
  visual: TunableVisualConfig;
  momentumHandoff: TunableMomentumHandoffConfig;
  orientation: TunableOrientationConfig;

  // Global settings
  global: {
    timeScale: number;              // Speed up/slow down entire simulation (default: 1.0)
    paused: boolean;
    framerateCap?: number;          // Limit FPS (default: unlimited)
  };
}

// ============================================================================
// DEFAULT CONFIGURATION (with auto-calculation)
// ============================================================================

export const DEFAULT_DEV_CONFIG: DevTunableConfig = {
  version: '2.0.0',
  name: 'Curved Takeoff Orbit - Dev Config',
  description: 'Auto-calculated with manual override support',

  orbit: {
    center: new THREE.Vector3(6, 30, 0),
    radius: 25,
    nominalSpeed: 0.6,
    normal: new THREE.Vector3(0, 1, 0),
    physics: {}
  },

  sources: [
    {
      id: 'north-gate',
      label: 'North Gate',
      gatePosition: new THREE.Vector3(-40, 0, -40),

      takeoff: {
        waypointsMode: 'auto',
        arcHeight: 40,
        intermediatePoints: 3,
        duration: 2.0
      },

      orbitEntry: {
        angleMode: 'auto',
        preferredSide: 'closest',
        entryVelocity: 0.6
      },

      orbit: {
        minDuration: 8.0,
        speedMultiplier: 1.0,
        verticalOscillation: {
          enabled: true,
          amplitude: 3.0,
          frequency: 1.5,
          phase: 0
        }
      },

      landing: {
        destinationMode: 'auto',
        exitAngleMode: 'auto',
        waypointsMode: 'auto',
        duration: 3.0,
        transitionBlend: 0.5
      },

      orientation: {
        mode: 'forward-polar-lock',
        additionalRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        rotationSpeed: Math.PI * 2,
        useInstantRotation: false
      },

      visual: {
        color: '#ff0000',
        modelScale: 2.0,
        enableTrail: true,
        trailLength: 50
      },

      spawn: {
        enabled: true,
        spawnRate: 0.15,
        maxParticles: 20
      }
    },

    {
      id: 'east-gate',
      label: 'East Gate',
      gatePosition: new THREE.Vector3(50, 0, 0),

      takeoff: {
        waypointsMode: 'auto',
        arcHeight: 35,
        duration: 2.0
      },

      orbitEntry: {
        angleMode: 'auto',
        entryVelocity: 0.6
      },

      orbit: {
        minDuration: 8.0,
        speedMultiplier: 1.0
      },

      landing: {
        destinationMode: 'auto',
        exitAngleMode: 'auto',
        waypointsMode: 'auto',
        duration: 3.0,
        transitionBlend: 0.5
      },

      orientation: {
        mode: 'forward-polar-lock',
        additionalRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        rotationSpeed: Math.PI * 2,
        useInstantRotation: false
      },

      visual: {
        color: '#00ff00',
        modelScale: 1.5,
        enableTrail: true
      },

      spawn: {
        enabled: true,
        spawnRate: 0.15,
        maxParticles: 20
      }
    },

    {
      id: 'south-gate',
      label: 'South Gate',
      gatePosition: new THREE.Vector3(0, 0, 50),

      takeoff: {
        waypointsMode: 'auto',
        arcHeight: 38,
        duration: 2.0
      },

      orbitEntry: {
        angleMode: 'auto',
        entryVelocity: 0.6
      },

      orbit: {
        minDuration: 8.0,
        speedMultiplier: 1.0
      },

      landing: {
        destinationMode: 'auto',
        exitAngleMode: 'auto',
        waypointsMode: 'auto',
        duration: 3.0,
        transitionBlend: 0.5
      },

      orientation: {
        mode: 'forward-polar-lock',
        additionalRotation: new THREE.Euler(-Math.PI / 2, 0, 0),
        rotationSpeed: Math.PI * 2,
        useInstantRotation: false
      },

      visual: {
        color: '#0099ff',
        modelScale: 2.0,
        enableTrail: true
      },

      spawn: {
        enabled: true,
        spawnRate: 0.15,
        maxParticles: 20
      }
    }
  ],

  collision: {
    enabled: true,
    method: 'spatial-grid',
    gridSectorCount: 32,
    minSeparationDistance: 8.0,
    criticalDistance: 4.0,

    bubbleRadius: {
      inner: 2.0,
      base: 3.0,
      outer: 5.0
    },

    repulsionStrength: 0.8,
    falloffMode: 'quadratic',

    separationKP: 1.2,
    separationKI: 0.0,
    separationKD: 0.3,

    strategies: {
      tangentialSpeed: {
        enabled: true,
        strength: 0.5,
        range: [0.4, 1.6]
      },
      radialOffset: {
        enabled: true,
        strength: 0.5,
        maxOffset: 10.0
      },
      verticalAdjustment: {
        enabled: true,
        strength: 0.6,
        maxOffset: 8.0
      }
    }
  },

  exit: {
    exitZone: {
      radius: 7.0,
      shape: 'sphere'
    },

    attraction: {
      enabled: true,
      strength: 0.7,
      maxDistance: 15.0,
      falloff: 'linear'
    },

    missedExit: {
      extensionTime: 2.0,
      maxMisses: 3,
      debugWarnings: false
    }
  },

  visual: {
    paths: {
      showTakeoff: true,
      showLanding: true,
      showOrbitCircle: true,
      lineWidth: 2,
      opacity: 0.6
    },

    markers: {
      showWaypoints: true,
      showEntryPoints: true,
      showExitPoints: true,
      markerSize: 0.5
    },

    collision: {
      showBubbles: false,
      showRepulsionVectors: false,
      bubbleOpacity: 0.2
    },

    debug: {
      showFPS: true,
      showParticleCount: true,
      showPhysicsStats: false,
      consoleLogging: 'errors'
    },

    camera: {
      autoRotate: false,
      rotationSpeed: 0.5,
      fov: 50,
      position: new THREE.Vector3(80, 60, 80)
    }
  },

  momentumHandoff: {
    entry: {
      blendDuration: 1.0,
      easingMode: 'smooth',
      speedMatchMode: 'particle-to-orbit',
      maxAcceleration: Infinity
    },
    exit: {
      blendDuration: 1.0,
      easingMode: 'smooth',
      speedMatchMode: 'particle-to-orbit',
      maxAcceleration: Infinity
    },
    showVelocityVectors: false,
    logTransitions: false
  },

  orientation: {
    mode: 'forward-polar-lock',
    polarLock: {
      worldUp: new THREE.Vector3(0, 1, 0),
      lockDuringBlend: true
    },
    rotationSpeed: Math.PI * 2,
    useInstantRotation: false,
    showOrientationVectors: false
  },

  global: {
    timeScale: 1.0,
    paused: false
  }
};
