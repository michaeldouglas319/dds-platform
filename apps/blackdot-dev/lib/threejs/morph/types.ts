/**
 * Morph System Types
 *
 * Type definitions for the reusable Three.js morph target system.
 * Enables smooth transitions between different 3D model states.
 */

import { Vector3 } from 'three'

/**
 * Morph target definition
 * Contains vertex positions for a specific morph state
 */
export interface MorphTarget {
  /** Unique identifier for this morph target */
  name: string

  /** Array of vertex positions (x, y, z) for this morph state */
  positions: Float32Array

  /** Optional normals array for lighting accuracy during morph */
  normals?: Float32Array

  /** Optional metadata for debugging/tracking */
  metadata?: Record<string, unknown>
}

/**
 * Morph animation configuration
 */
export interface MorphAnimationConfig {
  /** Target morph influence value (0-1) */
  targetInfluence: number

  /** Animation duration in seconds */
  duration?: number

  /** GSAP easing function */
  easing?: string

  /** Delay before animation starts */
  delay?: number

  /** Callback when animation completes */
  onComplete?: () => void

  /** Callback on animation update */
  onUpdate?: (progress: number) => void
}

/**
 * Morph state definition
 * Maps multiple morph targets to their influence values
 */
export interface MorphState {
  /** State identifier */
  name: string

  /** Morph target influences (index: influence value 0-1) */
  influences: Record<number, number>

  /** Optional display label */
  label?: string
}

/**
 * Pre-built morph target generators
 */
export type MorphTargetGenerator =
  | 'spherify'
  | 'twist'
  | 'wave'
  | 'inflate'
  | 'explode'
  | 'custom'

/**
 * Configuration for morph target generation
 */
export interface MorphGeneratorConfig {
  /** Type of morph to generate */
  type: MorphTargetGenerator

  /** Intensity/amount of the morph effect (0-1) */
  intensity?: number

  /** Custom function for 'custom' type */
  customFn?: (vertex: Vector3, index: number, originalPositions: Float32Array) => Vector3

  /** Additional parameters specific to generator type */
  params?: Record<string, number>
}

/**
 * Trigger type for morph transitions
 */
export type MorphTrigger = 'click' | 'hover' | 'manual' | 'auto'

/**
 * Complete morph transition configuration
 */
export interface MorphTransitionConfig {
  /** Morph states to transition between */
  states: MorphState[]

  /** Initial state index */
  initialState?: number

  /** Trigger mechanism */
  trigger?: MorphTrigger

  /** Auto-play interval in ms (for 'auto' trigger) */
  autoInterval?: number

  /** Animation configuration */
  animation?: MorphAnimationConfig

  /** Loop back to first state after last */
  loop?: boolean

  /** Reverse animation on second click/hover */
  reverseOnSecondTrigger?: boolean
}

/**
 * Morph model component props
 */
export interface MorphModelProps {
  /** Base model geometry/mesh */
  children: React.ReactNode

  /** Array of morph targets to apply */
  morphTargets: MorphTarget[]

  /** Initial morph influences (optional) */
  initialInfluences?: number[]

  /** Enable automatic normal recalculation */
  computeNormals?: boolean

  /** Ref to access morph controls imperatively */
  morphRef?: React.RefObject<MorphControls>
}

/**
 * Imperative API for controlling morphs
 */
export interface MorphControls {
  /** Set specific morph target influence */
  setInfluence: (index: number, value: number, animate?: boolean) => void

  /** Get current influence value */
  getInfluence: (index: number) => number

  /** Transition to a named state */
  transitionToState: (stateName: string, config?: MorphAnimationConfig) => Promise<void>

  /** Reset all influences to 0 */
  reset: (animate?: boolean) => void

  /** Get all current influences */
  getAllInfluences: () => number[]
}
