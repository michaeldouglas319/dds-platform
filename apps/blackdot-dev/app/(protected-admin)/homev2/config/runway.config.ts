/**
 * Model Native Orientations
 *
 * These define how each model is oriented in its native coordinate system.
 * The model's "forward" direction (what it considers +Z) should be defined here.
 * This allows different models to have different default rotations.
 *
 * Values are Euler angles in degrees: [pitch, yaw, roll]
 * - pitch (X): rotation around X-axis (nose up/down)
 * - yaw (Y): rotation around Y-axis (heading left/right)
 * - roll (Z): rotation around Z-axis (wing up/down)
 */
const PLANE_A_NATIVE_ORIENTATION = [0, 0, 0] as [number, number, number];      // 2_plane_draco: already faces +Z
const PLANE_B_NATIVE_ORIENTATION = [0, 180, 0] as [number, number, number];   // Faces -Z by default
const PLANE_C_NATIVE_ORIENTATION = [0, 90, 0] as [number, number, number];    // Faces +X by default

/**
 * Particle Orientation Definitions
 *
 * These define the expected forward direction for particles during different phases.
 * The system combines particle orientation + model native orientation to get final pose.
 */
const PARTICLE_ORIENTATIONS = {
  /** Direction particles should face during taxi phase (aligned with runway) */
  taxi: [0, 0, 0] as [number, number, number],           // Faces +X (runway direction)

  /** Direction particles face during takeoff (heading forward along runway) */
  takeoff: [0, 0, 0] as [number, number, number],        // Faces +X

  /** Direction particles face during orbit (calculated dynamically from path) */
  orbit: null as [number, number, number] | null,        // Computed from orbital position

  /** Direction particles face during landing (heading back toward gate) */
  landing: [0, 180, 0] as [number, number, number],      // Faces -X (reverse direction)
} as const;

export const RUNWAY_CONFIG = {
  /**
   * Particle Orientation System
   *
   * Defines how particles should be oriented during flight.
   * The particle orientation is the direction of travel/heading.
   * The model native orientation is applied on top to align the visual model.
   *
   * Final quaternion = particleOrientation * modelNativeOrientation
   */
  orientation: {
    /** Particle orientation during taxi/taxi phases (Euler angles in degrees) */
    particleOrientations: PARTICLE_ORIENTATIONS,

    /**
     * Forward axis convention
     * Particles move along path and face in the direction of travel.
     * Models are defined with their own forward axis (usually +Z or +X).
     * This configuration resolves the mapping.
     */
    forwardAxis: {
      /** What direction particles travel along paths (typically +X) */
      particleForward: [1, 0, 0] as [number, number, number],

      /** What direction the model considers "forward" in its native space (+Z typical) */
      modelForward: [0, 0, 1] as [number, number, number],
    },
  },

  models: {
    planes: {
      1: {
        path: '/assets/models/2_plane_draco.glb',
        scale: 0.05,
        /**
         * Native Orientation (Euler angles in DEGREES)
         * How the model is rotated in its local coordinate system.
         * Applied AFTER particle orientation to align visual model with travel direction.
         * [pitch, yaw, roll] where:
         * - pitch (X): nose up/down
         * - yaw (Y): heading left/right
         * - roll (Z): wing bank
         */
        nativeOrientation: PLANE_A_NATIVE_ORIENTATION,
        nativePosition: [0, 0, 0] as [number, number, number],
      },
      2: {
        path: '/assets/models/super_cam__-_rusian_reconnaissance_drone_draco.glb',
        scale: 0.05,
        nativeOrientation: PLANE_B_NATIVE_ORIENTATION,
        nativePosition: [0, 0, 0] as [number, number, number],
      },
      3: {
        path: '/assets/models/aircraft_presentation_cover_draco.glb',
        scale: 0.05,
        nativeOrientation: PLANE_C_NATIVE_ORIENTATION,
        nativePosition: [0, 0, 0] as [number, number, number],
      },
    },
    /** Mapping from fleet ID to model ID - each fleet/color uses a different model */
    fleetModelMap: {
      'warehouse-north': 1,        // Red - Model 1
      'distribution-south': 2,     // Blue - Model 2
      'mobile-unit': 3,            // Green - Model 3
      'express-fleet': 1,          // Gold - Model 1 (reuse)
      'heavy-operations': 2,       // Brown - Model 2 (reuse)
      'autonomous-test': 3,        // Purple - Model 3 (reuse)
    },
  },
  ground: {
    width: 100,
    length: 100,
    color: '#2a2a2a',
    roughness: 0.7,
    metalness: 0.1,
  },
  gates: [
    { id: 'gate-a1', position: [-10, 0.1, -5] },
    { id: 'gate-a2', position: [-10, 0.1, 0] },
    { id: 'gate-a3', position: [-10, 0.1, 5] },
  ],
  taxiWaypoints: [
    { 
      id: 'taxiway-1', 
      position: [0, 0.1, 0],
      /** Orientation at this checkpoint (Euler angles in radians) - particle faces this direction when reaching waypoint */
      orientation: [0, 0, 0] as [number, number, number],
    },
    { 
      id: 'taxiway-2', 
      position: [0, 0.1, 0],
      /** Orientation at this checkpoint */
      orientation: [0, 0, 0] as [number, number, number],
    },
    { 
      id: 'runway-start', 
      position: [0, 0.1, 0],
      /** Orientation at runway start - typically aligned with runway direction */
      orientation: [0, 0, 0] as [number, number, number],
    },
  ],
  takeoff: {
    /**
     * ========== BASIC PARAMETERS ==========
     */

    /** Base upward acceleration (Y-axis) in units/s² - can be overridden per phase */
    acceleration: 250.0,

    /** Forward speed along runway (X-axis) in units/s */
    liftSpeed: 600.0,

    /** Maximum height before transitioning to orbit */
    maxHeight: 50.0,

    /** Maximum time allowed for takeoff before forcing orbit transition (seconds) */
    maxDuration: 3.0,

    /**
     * ========== SPEED CONTROL ==========
     */

    /** Speed multiplier range that increases with height [min, max] */
    speedMultiplierRange: [1.0, 3.0] as [number, number],

    /** Easing type for speed increase: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'smoothstep' */
    speedIncreaseEasing: 'easeOut' as const,

    /**
     * ========== VERTICAL MOTION ==========
     */

    /** Initial vertical velocity before gravity applies (units/s) */
    initialVerticalVelocity: 50.0,

    /** How long before gravity starts pulling particles toward orbit (seconds) */
    gravityStartDelay: 1.0,

    /** Duration of gravity ramp from initial to max strength (seconds) */
    gravityRampDuration: 1.0,

    /** Initial gravity strength when pulling toward orbit (units/s²) */
    initialGravityStrength: 50.0,

    /** Maximum gravity strength when pulling toward orbit (units/s²) */
    maxGravityStrength: 150.0,

    /** Easing type for gravity ramp: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'smoothstep' */
    gravityRampEasing: 'easeIn' as const,

    /** Climb curve type: 'linear' | 'exponential' | 'parabolic' */
    climbCurveType: 'parabolic' as const,

    /**
     * ========== ROTATION & PITCH ==========
     */

    /** Pitch angle at takeoff start (degrees) */
    takeoffPitch: 0.0,

    /** Maximum pitch angle during climb (degrees) */
    climbPitch: 15.0,

    /** Easing type for pitch rotation: 'linear' | 'easeOut' | 'smoothstep' */
    pitchEasing: 'easeOut' as const,

    /**
     * ========== ACCELERATION PHASES ==========
     */

    /** Duration of acceleration phase (seconds) */
    accelerationDuration: 1.0,

    /** Duration of climb phase (seconds) */
    climbDuration: 1.5,

    /**
     * Multi-phase acceleration profile
     * Allows different acceleration at different times
     * Leave empty to use constant acceleration value above
     * @example
     * [
     *   { startTime: 0, endTime: 0.5, startAccel: 200, endAccel: 300, easing: 'easeIn' },
     *   { startTime: 0.5, endTime: 2.0, startAccel: 300, endAccel: 100, easing: 'easeOut' }
     * ]
     */
    accelerationPhases: [] as Array<{
      startTime: number;
      endTime: number;
      startAccel: number;
      endAccel: number;
      easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'smoothstep';
    }>,

    /**
     * ========== LATERAL SPREADING ==========
     */

    /** Lateral spreading pattern: null | 'linear' | 'easeOut' | 'exponential' */
    lateralSpreadPattern: 'easeOut' as const,

    /** Maximum lateral spread distance during takeoff (units) */
    takeoffLateralSpread: 5.0,

    /**
     * ========== ORBIT TRANSITION ==========
     */

    /** Detection radius for matching nearby orbiting particles (units) */
    orbitMatchRadius: 30.0,

    /**
     * ========== ADVANCED OPTIONS ==========
     */

    /** Whether to apply smooth damping to velocity changes */
    useSmoothDamping: true,

    /** Damping factor for smooth motion (0-1, higher = more damping) */
    dampingFactor: 0.5,

    /** Enable forward momentum carryover to orbit phase */
    carryForwardMomentum: true,

    /** Scale forward velocity as percentage when transitioning to orbit (0-1) */
    forwardMomentumScale: 0.8,

    /** Enable vertical momentum carryover to orbit phase */
    carryVerticalMomentum: false,

    /** Scale vertical velocity as percentage when transitioning to orbit (0-1) */
    verticalMomentumScale: 0.2,

    /** Enable adaptive takeoff duration based on particle height */
    adaptiveDuration: false,

    /** Scale particle radius at altitude (height-dependent scaling) */
    altitudeScaling: null as Array<{ height: number; scale: number }> | null,
  },
  orbit: {
    center: [20, 50, 0] as [number, number, number],
    radius: 15.0,
    speed: 0.5,            // Increased significantly (12.5x original)
    orbitsBeforeLanding: 2.0,
  },
  timing: {
    /** Time delay between particle spawns (seconds) */
    staggerDelay: 2.0,
    /** Minimum distance between particles when spawning (units) - ensures spacing */
    minDistanceBetweenParticles: 5.0,
    /** Base taxi speed (multiplied by 10 for velocity) */
    taxiSpeed: 0.3,
    /** Acceleration multiplier for smooth taxiing movement */
    taxiAccelerationMultiplier: 5.0,
    evaluationTime: 1.0,
    /** Time particle waits at gate before taxiing (seconds) */
    parkedTime: 0.5,
    flyingDuration: 5.0,
    mergeToOrbitDuration: 0.04,  // 1/10th of original - very fast transition to orbit
  },
  particles: {
    count: 10,
    radius: 1.5,
    color: '#6366f1',
    emissive: '#4f46e5',
  },
  /** Default model ID to use if particle doesn't specify one */
  defaultModelId: 1,
  collision: {
    avoidanceRadius: 12.0,      // Increased from 8.0 (larger detection radius for faster speeds)
    avoidanceStrength: 0.25,    // Increased from 0.15 (stronger avoidance at higher speeds)
    minSeparation: 3.0,
    takeoffSeparation: 8.0,     // NEW: Minimum separation during takeoff
    takeoffLateralSpread: 5.0,   // NEW: Lateral spread during takeoff
  },
  annotations: [
    {
      id: 'gate-a1',
      title: 'Gate A1',
      position: [-10, 0.2, -5],
      color: '#4CAF50',
    },
    {
      id: 'gate-a2',
      title: 'Gate A2',
      position: [-10, 0.2, 0],
      color: '#4CAF50',
    },
    {
      id: 'gate-a3',
      title: 'Gate A3',
      position: [-10, 0.2, 5],
      color: '#4CAF50',
    },
    {
      id: 'runway-start',
      title: 'Runway 27L',
      position: [15, 0.2, 0],
      color: '#2196F3',
    },
  ],
} as const;
