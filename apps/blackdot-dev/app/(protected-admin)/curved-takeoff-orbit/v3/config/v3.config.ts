/**
 * V3 Configuration - Rapier Physics + Blue Gate Attraction
 */

import * as THREE from 'three';
import type { OrbitPhysicsConfig } from '@/app/(protected-admin)/curved-takeoff-orbit/lib/orbitPhysics';
import type { BlueGateConfig } from '@/app/(protected-admin)/curved-takeoff-orbit/lib/blueGatePhysics';
import type { TaxiStagingConfig, AssemblyConfig, HealthConfig } from '../types/extended';
import { GENERATED_STATIC_OBJECTS } from './generated-static-objects';
import { DEFAULT_DISPLAY_CONFIG } from './schemas/display.schema';
import type { CursorEventsConfig } from './schemas/cursor-events.schema';
import { DEFAULT_CURSOR_EVENTS_CONFIG } from './schemas/cursor-events.schema';

export interface V3SourceConfig {
  id: string;
  gatePosition: THREE.Vector3;
  spawnRate: number;
  orbitEntryAngle: number;
  particleColor: string;
  modelScale: number;

  // Optional per-source overrides
  flightPattern?: {
    // Ground circuit options
    isGroundSource?: boolean;
    groundWaypoints?: THREE.Vector3[];
    modelPath?: string;

    // Orbital physics overrides
    physics?: Partial<OrbitPhysicsConfig>;

    // Vertical wave overrides
    verticalWave?: Partial<{
      enabled: boolean;
      amplitudeMultiplier: number;
      frequency: number;
      springConstant: number;
    }>;

    // Soft guidance overrides
    softGuidance?: Partial<{
      enabled: boolean;
      speedVariationTolerance: number;
      verticalSoftness: number;
      radialComfortZone: number;
      individualVariation: boolean;
    }>;

    // Orientation overrides
    orientation?: Partial<{
      mode: 'tangent' | 'radial' | 'banking' | 'combo' | 'tumble' | 'fixed';
      tangentSmoothing: number;
      bankMultiplier: number;
      maxBankAngle: number;
    }>;

    // Collision overrides
    collision?: Partial<{
      enabled: boolean;
      shape: 'sphere' | 'ellipsoid' | 'squircle' | 'box';
      dimensions: {
        width: number;
        height: number;
        depth: number;
      };
      offset: {
        x: number;
        y: number;
        z: number;
      };
      strength: number;
      damping: number;
      squircleExponent?: number;
    }>;
  };
}

export interface V3StaticObject {
  id: string;
  modelPath: string; // Path to GLTF or GLB file (e.g., '/assets/models/building/scene.gltf' or '/assets/models/prop.glb')
  position: THREE.Vector3;
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  color?: string; // Optional hex color tint (e.g., '#ff0000' or '#ff0000ff' with alpha)
}

export interface V3Config {
  // Scene
  particleCount: number;

  // Orbit
  orbit: {
    center: THREE.Vector3;
    radius: number;
    nominalSpeed: number;
  };

  // Sources
  sources: V3SourceConfig[];

  // Static scene objects (buildings, decorations)
  staticObjects?: V3StaticObject[];

  // Physics (Rapier)
  physics: OrbitPhysicsConfig;

  // Blue Gates
  blueGate: Omit<BlueGateConfig, 'position'>;

  // Exit eligibility
  exitRequirements: {
    minAngleTraveled: number;
    minTimeInOrbit: number;
  };

  // Landing transition (orbit → landing curve)
  landingTransition: {
    blendDuration: number;         // Seconds to blend from orbit to curve (default: 0.5)
    captureDistance: number;       // Distance to gate to trigger landing (default: 5.0)
    positionBlendMode: 'lerp' | 'physics'; // How to blend position
    preLandingDistance: number;    // Distance to start slowing/redirecting (default: 15.0)
    preLandingSlowdown: number;    // Speed reduction factor in pre-landing (0-1, default: 0.3)
  };

  // 3D Orbit Settings
  verticalWave: {
    enabled: boolean;
    amplitudeMultiplier: number;  // Multiplier for donut thickness (0-1)
    frequency: number;             // Waves per full orbit
    springConstant: number;        // Vertical force strength
  };

  // Orientation Settings
  orientation: {
    mode: 'tangent' | 'radial' | 'banking' | 'combo' | 'tumble' | 'fixed';
    tangentSmoothing: number;      // 0-1, higher = smoother rotation
    bankMultiplier: number;        // Banking intensity (0-2)
    maxBankAngle: number;          // Max degrees to lean (0-90)
  };

  // Model Orientation Override
  modelOrientation: {
    scale: number;                 // Uniform scale multiplier
    rotationX: number;             // X-axis rotation in radians (pitch)
    rotationY: number;             // Y-axis rotation in radians (yaw)
    rotationZ: number;             // Z-axis rotation in radians (roll)
  };

  // Collision/Repulsion Settings
  collision: {
    enabled: boolean;              // Enable particle-particle repulsion

    // Shape selection
    shape: 'sphere' | 'ellipsoid' | 'squircle' | 'box';

    // Dimensional controls
    dimensions: {
      width: number;               // X-axis extent
      height: number;              // Y-axis extent
      depth: number;               // Z-axis extent
    };

    // Position offset (relative to particle center)
    offset: {
      x: number;
      y: number;
      z: number;
    };

    // Force parameters
    strength: number;              // Repulsion force strength (0-10)
    damping: number;               // Velocity damping on collision (0-1)

    // Squircle-specific (when shape = 'squircle')
    squircleExponent?: number;     // Controls corner sharpness (2 = ellipse, 4 = squircle, >8 = box)
  };

  // Soft Guidance Settings
  softGuidance: {
    enabled: boolean;                    // Use soft forces vs hard rules
    speedVariationTolerance: number;     // ±% speed allowed (0-0.3)
    verticalSoftness: number;            // Wave guidance softness (0-1)
    radialComfortZone: number;           // % of donut that's correction-free (0-0.5)
    individualVariation: boolean;        // Enable per-particle preferences
  };

  // Trajectory Curve Settings
  trajectorySettings: {
    curveTension: number;          // CatmullRom tension (0-1, default 0.5)
    midpointHeightMultiplier: number; // Height of arc midpoint (0-2, default 1)
    approachAngle: number;         // Approach angle in degrees (0-90)
    landingSpeed: number;          // Landing speed multiplier (0-1)
    preOrbitDistance: number;      // Distance before orbit for tangent approach (5-15)

    // Exit-specific settings
    exitCurveTension: number;              // Exit curve tension (0-1, default 0.5)
    exitMidpointHeightMultiplier: number;  // Exit arc height (0-2, default 0.8)
    exitPreOrbitDistance: number;          // Exit departure distance (5-15, default 10.0)
    exitLandingSpeed: number;              // Exit landing speed (0-1, default 0.6)
  };

  // Performance Optimization Settings
  performance?: {
    enableCurveCaching?: boolean;      // Cache trajectory curves at initialization (default: true)
    enableSpatialGrid?: boolean;       // Use spatial grid for O(n) collision (default: true)
    curveSampleCount?: number;         // Samples per cached curve (default: 150)
    spatialGridCellSize?: number;      // Grid cell size in units (default: 15)
  };

  // Rendering Settings
  rendering?: {
    multiSourceMeshes?: boolean;       // One InstancedMesh per source for unique colors (default: false)
    enableInstanceOptimization?: boolean; // GPU instance optimization (default: true)
    enableLOD?: boolean;               // Level of detail system (default: false)
    pixelRatio?: number;               // Render resolution multiplier (0.5-2, default: 1)
  };

  // Display Toggles (Models & Particles Visibility)
  display: {
    particleCount: number;           // Number of particles to render
    particleMode: 'hidden' | 'orb' | 'sphere' | 'hybrid-glow' | 'emissive-bloom' | 'model';  // Particle rendering mode
    orb?: {
      lightPower: number;          // PointLight illumination strength (1-3000)
      lightDistance: number;       // Light falloff distance (10-500)
      sphereRadius: number;        // Orb visual radius (0.05-2)
    };
    hybridGlow?: {
      mainLightCount: number;      // Number of cluster follow lights (2-5)
      mainLightPower: number;      // Light power per cluster light
      mainLightDistance: number;   // Light falloff distance
      bloomIntensity: number;      // Bloom post-processing strength (0.1-3)
      bloomThreshold: number;      // Luminance threshold for bloom (0.1-1)
      particleEmissive: number;    // Particle glow intensity (0.1-2)
      bloomKernelSize: number;     // Blur spread (1-5)
      bloomMipmapBlur: boolean;    // Enable layered 3D bloom effect
    };
    lighting?: {
      ambientIntensity: number;    // Overall scene ambient light (0-1)
      directionalIntensity: number; // Main directional light (0-2)
    };
    showModels: boolean;           // Show/hide dynamic models
    showStaticObjects: boolean;    // Show/hide static scene objects
  };

  // Visual Toggles
  debug: {
    showTrajectories: boolean;     // Show takeoff/landing curves (yellow/orange)
    showWaypoints: boolean;        // Show curve control points (spheres)
    showVelocityVectors: boolean;  // Show particle velocity arrows
    showHandoffZone: boolean;      // Highlight 85-95% handoff zone
    showGateZones: boolean;        // Show blue gate attraction zones
    showOrbitPath: boolean;        // Show nominal orbit circle
    showCollisionSpheres: boolean; // Show collision shape wireframes
    showAssemblyProgress: boolean; // Show assembly progress spheres
    showTaxiPaths: boolean;        // Show taxi paths and staging zones
    showHealthIndicators: boolean; // Show health color indicator spheres
    showPhysicsBounds: boolean;    // Show physics donut thickness bounds
    showExitCaptureZones: boolean; // Show pre-landing and capture distance boundaries
    showBluGateCenter: boolean;    // Show exact blue gate center points
  };

  // Cursor Events (Pointer Interaction)
  cursorEvents: CursorEventsConfig;

  // Taxi & Staging
  taxiStaging: TaxiStagingConfig;

  // Assembly Progression
  assembly: AssemblyConfig;

  // Health & Stats
  health: HealthConfig;
}

export const PARTICLE_COUNT = 40;

export const V3_CONFIG: V3Config = {
  particleCount: PARTICLE_COUNT,

  // Display toggles - uses DEFAULT_DISPLAY_CONFIG as fallback
  display: {...DEFAULT_DISPLAY_CONFIG, particleCount: PARTICLE_COUNT},

  // Performance optimizations ENABLED by default
  performance: {
    enableCurveCaching: false,      // Pre-sample trajectory curves for 95% faster lookups
    enableSpatialGrid: true,       // Use O(n) spatial grid instead of O(n²) collision
    curveSampleCount: 150,         // Samples per cached curve
    spatialGridCellSize: 15,       // Grid cell size in units
  },

  // Rendering optimizations
  rendering: {
    multiSourceMeshes: false,       // Single InstancedMesh for all sources (more efficient)
    enableInstanceOptimization: true, // GPU instance optimization enabled
    enableLOD: false,               // Level of detail disabled by default
    pixelRatio: 1,                  // Full resolution rendering
  },

  orbit: {
    center: new THREE.Vector3(0, 15, 0),
    radius: 10,
    nominalSpeed: 15.0,  // Increased from 0.6 to 5.0
  },

  sources: [
    {
      id: 'north-gate',
      gatePosition: new THREE.Vector3(-60, 0, 60),
      flightPattern: {
        verticalWave: { springConstant: 1.5, frequency: 3.0 },
        physics: { donutThickness: 18.0 },
      } ,
      spawnRate: 3,
      orbitEntryAngle: Math.PI * .72,
      particleColor: 'green',
      modelScale: 1,
    },
    {
      id: 'north-east-gate',
      gatePosition: new THREE.Vector3(-30, 0, 60),
      flightPattern: {
        verticalWave: { springConstant: 1.5, frequency: 3.0 },
        physics: { donutThickness: 18.0 },
      } ,
      spawnRate: 1,
      orbitEntryAngle: Math.PI * .72,
      particleColor: '#240042',  // purple
      modelScale: 1,
    },
    {
      id: 'west-gate',
      gatePosition: new THREE.Vector3(60, 0, -60),
      flightPattern: {
        verticalWave: { springConstant: 1.5, frequency: 1 },
        physics: { donutThickness: 20.0 },
      },
      spawnRate: 2.6,
      orbitEntryAngle: Math.PI * 1.6,
      particleColor: 'green',
      modelScale: 1,
    },
    {
        id: 'south-gate',
        gatePosition: new THREE.Vector3(60, 0, 60),
      flightPattern: {
        verticalWave: { springConstant: 1.5, frequency: 2 },
        physics: { donutThickness: 28.0 },
      } ,
      spawnRate: 2.2,
      orbitEntryAngle: Math.PI * .2,
      particleColor: 'blue',
      modelScale: 1,
    },
    {
      id: 'east-gate',
      gatePosition: new THREE.Vector3(-60, 0, -60),
      flightPattern: {
        verticalWave: { springConstant: 1.5, frequency: 0 },
        physics: { donutThickness: 10.0 },
      } ,
      spawnRate: 2.5,
      orbitEntryAngle: Math.PI * 1.2 ,
      particleColor: 'red',
      modelScale: 1,
    },
  ],

  // Static scene objects - add manually as needed
  staticObjects: GENERATED_STATIC_OBJECTS,

  physics: {
    orbitRadius: 25.0,
    donutThickness: 10.0,
    gravitationalConstant: 200.0,
    nominalOrbitSpeed: 15.0,  // MUST match orbit.nominalSpeed
    particleMass: 1.0,
    collisionRadius: 1.5,
    dampingLinear: 0.15,  // Slightly increased damping for higher speed
    dampingAngular: 0.3,
    tangentialBoost: 150.0,  // Increased for faster orbit (was 200.0)
    radialConfinement: 220.0,  // Increased for higher speed (was 80.0)
    restitution: 0.5,
    friction: 0.1,
  },

  blueGate: {
    radius: 25.0,  // Matches preLandingDistance - particles feel pull across entire approach zone
    entryAttraction: {
      enabled: false,  // Disabled for seamless handoff
      maxStrength: 0.5,
      activationProgress: 0.92,
      falloffPower: 1,
    },
    exitAttraction: {
      enabled: true,
      maxStrength: 8.0,  // Increased to 8.0 for STRONG directional pull toward exit gate
      minAngleTraveled: 3.14,
      minTimeInOrbit: 2.0,
      falloffPower: 1.1,  // Gentle falloff for wide effective range
    },
    transitionBlendTime: 2,
  },

  exitRequirements: {
    minAngleTraveled: Math.PI * 2 * 1.1,  // 1.1 full orbits
    minTimeInOrbit: 2.0,  // 2 seconds minimum
  },

  landingTransition: {
    blendDuration: 2,         // 2 seconds smooth blend
    captureDistance: 5.0,       // STRICT: Only capture when extremely close (5 units)
    positionBlendMode: 'physics',  // Smooth lerp transition
    preLandingDistance: 25,   // ATTRACTION ZONE: Start pulling at 25 units
    preLandingSlowdown: 0.1,  // Reduce to 40% speed during approach
  },

  verticalWave: {
    enabled: true,
    amplitudeMultiplier: 0.3,  // 30% of donut thickness
    frequency: 4.0,            // 2 full waves per orbit
    springConstant: 1.0,       // Vertical restoration force
  },

  orientation: {
    mode: 'combo',             // Velocity + Banking
    tangentSmoothing: 0.85,    // Smooth but responsive
    bankMultiplier: 0.2,       // Noticeable banking
    maxBankAngle: 25,          // Realistic aircraft limit (degrees)
  },

  modelOrientation: {
    scale: 0.4,                // Model scale multiplier
    rotationX: Math.PI,        // 180° - Flip upside-down to right-side up
    rotationY: Math.PI * 1.5,  // 270° - Face forward along +Z axis
    rotationZ: 0,              // 0° - No roll adjustment
  },

  collision: {
    enabled: true,             // Enable collision avoidance
    shape: 'ellipsoid',        // Default to ellipsoid (backward compatible with sphere)
    dimensions: {
      width: 3,                // X-axis extent (matches old radius)
      height: 30,               // Y-axis extent
      depth: 3,                // Z-axis extent
    },
    offset: {
      x: 0,                    // No X offset
      y: 0,                    // No Y offset
      z: 0,                    // No Z offset
    },
    strength: 2.0,             // Moderate repulsion force
    damping: 0.0,              // Light velocity damping
    squircleExponent: 2,       // Default squircle shape
  },

  softGuidance: {
    enabled: true,
    speedVariationTolerance: 1,       // ±15% speed variation allowed
    verticalSoftness: 1,               // 30% softness on vertical guidance
    radialComfortZone: 0.2,              // Middle 40% has no correction
    individualVariation: true,           // Enable personality
  },

  trajectorySettings: {
    curveTension: 1,         // Default CatmullRom tension
    midpointHeightMultiplier: 1.0, // Default arc height (15 units base)
    approachAngle: 0,         // 30° approach angle
    landingSpeed: 0.5,         // 80% of orbital speed for landing
    preOrbitDistance: 20.0,     // 8 units before orbit for tangent approach

    // Exit-specific defaults
    exitCurveTension: 0.5,              // Default exit curve tension
    exitMidpointHeightMultiplier: 0.2,  // Lower arc for descent
    exitPreOrbitDistance: 10.0,         // Farther departure = gentler exit
    exitLandingSpeed: 0.9,              // Slower landing approach
  },

  debug: {
    showTrajectories: false,       // Takeoff/landing curves (yellow/orange)
    showWaypoints: false,          // Curve control points (spheres)
    showVelocityVectors: false,    // Particle velocity arrows
    showHandoffZone: false,        // 85-95% handoff markers
    showGateZones: false,          // Blue gate torus rings
    showOrbitPath: false,          // Green nominal orbit circle
    showCollisionSpheres: false,   // Cyan collision shape wireframes
    showAssemblyProgress: false,   // Assembly progress spheres
    showTaxiPaths: false,          // Taxi paths and staging zones
    showHealthIndicators: false,   // Health color indicator spheres
    showPhysicsBounds: false,      // Physics donut thickness bounds
    showExitCaptureZones: false,   // Pre-landing and capture distance boundaries
    showBluGateCenter: false,      // Exact blue gate center points
  },

  // Cursor Events (Pointer Interaction)
  cursorEvents: DEFAULT_CURSOR_EVENTS_CONFIG,

  taxiStaging: {
    enabled: false,
    stagingZones: [
      {
        id: 'staging-north',
        position: new THREE.Vector3(-50, 0, -50),
        capacity: 1,  // Only 1 particle allowed at a time, others must queue
        waitTime: 3.0,
        purpose: 'loading',
      },
    ],
    groundSpeed: 3.0,
    queueSpacing: 5.0,
    pathSmoothness: 0.5,
  },

  assembly: {
    enabled: false,
    maxSteps: 10,
    advancementMode: 'time',
    timePerStep: 5.0,
    orbitsPerStep: 1,
    visual: {
      mode: 'glow',  // Changed from 'combined' to preserve source colors
      colorStart: new THREE.Color(0x333333),
      colorEnd: new THREE.Color(0x00ffff),
      scaleStart: 0.5,
      scaleEnd: 1.0,
      glowIntensity: 0.8,
    },
    stations: [],
  },

  health: {
    enabled: false,
    startingHealth: 100,
    damage: {
      decayRate: 0.5,
      collisionDamage: 1,
      environmentalDamage: 1,
      overcrowdingDamage: 0,
      overcrowdingDistance: 0,
    },
    regeneration: {
      enabled: true,
      stagingRegen: 10,
      repairZoneRegen: 5,
    },
    death: {
      behavior: 'respawn',
      respawnDelay: 5.0,
    },
    visual: {
      colorHealthIndicator: true,
      particleEffects: true,
      healthBars: false,
    },
  },
};
