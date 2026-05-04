import * as THREE from 'three'
import type gsap from 'gsap'

/**
 * Union type for all available transition effect types
 */
export type EffectType =
  | 'fade'
  | 'scale'
  | 'rotate'
  | 'slide'
  | 'camera'
  | 'gltfAnimation'
  | 'dissolve'
  | 'particleBurst'
  | 'fragment'
  | 'morph'
  | 'custom'
  | string // Allow custom effect types

/**
 * Trigger modes for ModelTransition
 * - 'click': Transition occurs on click
 * - 'hover': Transition occurs on hover
 * - 'manual': Transition is controlled externally
 */
export type TransitionTrigger = 'click' | 'hover' | 'manual'

/**
 * Configuration for a single transition effect
 * Each effect is a self-contained module that can be composited
 */
export interface TransitionEffect {
  /** Type of effect to apply (must be registered in effectRegistry) */
  type: EffectType

  /** Duration of the effect in seconds */
  duration?: number

  /** Delay before effect starts in seconds */
  delay?: number

  /** GSAP easing function (e.g., 'power2.inOut', 'back.out(1.7)') */
  ease?: string

  /** Which model(s) to apply the effect to */
  target?: 'before' | 'after' | 'both'

  /** Additional effect-specific parameters */
  [key: string]: any
}

/**
 * Parameters passed to effect execute() method
 * Contains references to models, camera, and timeline for effect implementation
 */
export interface EffectExecutionParams {
  /** GSAP timeline to add animations to */
  timeline: ReturnType<typeof gsap.timeline>

  /** Three.js group containing the "before" model */
  beforeModel: THREE.Group

  /** Three.js group containing the "after" model */
  afterModel: THREE.Group

  /** Camera instance for camera-based effects */
  camera: THREE.Camera

  /** Effect configuration */
  config: TransitionEffect
}

/**
 * Interface for transition effect plugins
 * Each effect is a self-contained module that implements this interface
 */
export interface TransitionEffectPlugin {
  /** Unique identifier for this effect */
  type: string

  /**
   * Execute the effect on a GSAP timeline
   * The effect should add animations to the timeline at appropriate positions
   */
  execute(params: EffectExecutionParams): void

  /**
   * Optional: Clean up resources (e.g., dispose textures, remove listeners)
   */
  dispose?(): void

  /**
   * Optional: Validate effect configuration before execution
   * Useful for catching configuration errors early
   */
  validate?(config: TransitionEffect): boolean | string
}

/**
 * Props for the ModelTransition component
 */
export interface ModelTransitionProps {
  // Models
  /** React element or component to render as the "before" state */
  beforeModel: React.ReactNode

  /** React element or component to render as the "after" state */
  afterModel: React.ReactNode

  // Trigger
  /** How the transition is triggered (click, hover, or manual) */
  trigger?: TransitionTrigger

  /** For manual mode: controls whether transition is active */
  isActive?: boolean

  /** If true, clicking again reverses the transition back to before state */
  reverseOnSecondClick?: boolean

  // Effects (Config-based API)
  /** Array of effect configurations to apply during transition */
  effects?: TransitionEffect[]

  // Effect Components (Component-based API)
  /** Effect components (for component-based API) */
  children?: React.ReactNode

  // Events
  /** Called when transition starts playing */
  onTransitionStart?: () => void

  /** Called when transition completes */
  onTransitionComplete?: () => void

  /** Called when an individual effect starts */
  onEffectStart?: (effectType: string) => void

  /** Called when an individual effect completes */
  onEffectComplete?: (effectType: string) => void

  // Advanced
  /** Enable cursor changes on hover */
  enableHover?: boolean

  /** External GSAP timeline for advanced control */
  timeline?: ReturnType<typeof gsap.timeline>
}
