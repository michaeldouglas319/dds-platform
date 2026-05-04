import * as THREE from 'three'

/**
 * Attractors Particles Configuration
 * Single source of truth for all simulation parameters
 */

export interface AttractorConfig {
  position: THREE.Vector3
  orientation: THREE.Vector3
  mass: number
}

export interface V3Config {
  // Particle simulation
  particleCount: number

  // Physics parameters
  physics: {
    attractorMass: number
    particleGlobalMass: number
    gravityConstant: number
    spinningStrength: number
    maxSpeed: number
    velocityDamping: number
  }

  // Particle rendering
  particles: {
    scale: number
    boundHalfExtent: number
    colorA: string
    colorB: string
  }

  // Morphing stages
  morphing: {
    stageLength: number
    attractionPhaseLength: number
    orbitalPhaseLength: number
    dispersalPhaseLength: number
  }

  // Attractors
  attractors: AttractorConfig[]

  // Debug visualization
  debug: {
    showHelpers: boolean
    showVelocityVectors: boolean
    showTrajectories: boolean
    showAttractorZones: boolean
    showStageIndicators: boolean
    showCollisionSpheres: boolean
    showPhysicsBounds: boolean
    showParticleScales: boolean
  }
}

export const V3_CONFIG: V3Config = {
  particleCount: Math.pow(2, 18), // 262,144 particles

  physics: {
    attractorMass: Number(`1e7`),
    particleGlobalMass: Number(`1e4`),
    gravityConstant: 6.67e-11,
    spinningStrength: 2.75,
    maxSpeed: 8,
    velocityDamping: 0.1,
  },

  particles: {
    scale: 0.008,
    boundHalfExtent: 8,
    colorA: '#5900ff',
    colorB: '#ffa575',
  },

  morphing: {
    stageLength: 8,
    attractionPhaseLength: 2,
    orbitalPhaseLength: 4,
    dispersalPhaseLength: 2,
  },

  attractors: [
    {
      position: new THREE.Vector3(-1, 0, 0),
      orientation: new THREE.Vector3(0, 1, 0),
      mass: Number(`1e7`),
    },
    {
      position: new THREE.Vector3(1, 0, -0.5),
      orientation: new THREE.Vector3(0, 1, 0),
      mass: Number(`1e7`),
    },
    {
      position: new THREE.Vector3(0, 0.5, 1),
      orientation: new THREE.Vector3(1, 0, -0.5).normalize(),
      mass: Number(`1e7`),
    },
  ],

  debug: {
    showHelpers: true,
    showVelocityVectors: false,
    showTrajectories: true,
    showAttractorZones: false,
    showStageIndicators: true,
    showCollisionSpheres: false,
    showPhysicsBounds: false,
    showParticleScales: false,
  },
}

/**
 * Preset configurations for different scenarios
 */

export const SYNCHRONIZED_FORMATION: V3Config = {
  ...V3_CONFIG,
  physics: {
    ...V3_CONFIG.physics,
    spinningStrength: 3.5,
    maxSpeed: 6,
  },
  morphing: {
    ...V3_CONFIG.morphing,
    stageLength: 6,
  },
}

export const GENTLE_DRIFT: V3Config = {
  ...V3_CONFIG,
  physics: {
    ...V3_CONFIG.physics,
    spinningStrength: 1.5,
    maxSpeed: 4,
    velocityDamping: 0.2,
  },
  morphing: {
    ...V3_CONFIG.morphing,
    stageLength: 12,
  },
}

export const CHAOTIC_SWARM: V3Config = {
  ...V3_CONFIG,
  physics: {
    ...V3_CONFIG.physics,
    spinningStrength: 5.0,
    maxSpeed: 12,
    velocityDamping: 0.05,
  },
  morphing: {
    ...V3_CONFIG.morphing,
    stageLength: 4,
  },
}
