import * as THREE from 'three'
import { AnimationState } from './physicsUtils'

/**
 * Animation action state tracking
 */
export interface AnimationAction {
  name: string
  clip: THREE.AnimationClip
  action?: THREE.AnimationAction
  isActive: boolean
}

/**
 * Animation state machine configuration
 */
export interface AnimationTransition {
  from: AnimationState
  to: AnimationState
  duration: number // Transition blend duration in seconds
}

/**
 * Animation mixer wrapper with state management
 */
export class CharacterAnimationMixer {
  mixer: THREE.AnimationMixer
  animations: Map<AnimationState, AnimationAction>
  currentState: AnimationState
  currentAction: THREE.AnimationAction | null
  transitionDuration: number

  constructor(model: THREE.Object3D, transitionDuration: number = 0.3) {
    this.mixer = new THREE.AnimationMixer(model)
    this.animations = new Map()
    this.currentState = AnimationState.Idle
    this.currentAction = null
    this.transitionDuration = transitionDuration
  }

  /**
   * Add animation clip to mixer
   */
  addAnimation(state: AnimationState, clip: THREE.AnimationClip): void {
    const action = this.mixer.clipAction(clip)
    this.animations.set(state, {
      name: clip.name,
      clip,
      action,
      isActive: false,
    })
  }

  /**
   * Transition to new animation state with blending
   */
  transitionTo(state: AnimationState): void {
    if (state === this.currentState || !this.animations.has(state)) {
      return
    }

    const nextAction = this.animations.get(state)?.action
    if (!nextAction) return

    // Fade out current animation
    if (this.currentAction) {
      this.currentAction.fadeOut(this.transitionDuration)
    }

    // Fade in next animation
    nextAction.reset()
    nextAction.fadeIn(this.transitionDuration)
    nextAction.play()

    this.currentState = state
    this.currentAction = nextAction
  }

  /**
   * Update mixer and return current state
   */
  update(delta: number): AnimationState {
    this.mixer.update(delta)
    return this.currentState
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.mixer.stopAllAction()
    this.animations.clear()
  }
}

/**
 * Create default animation clips if model doesn't have them
 * These are placeholder animations for development
 */
export function createPlaceholderAnimations(): Map<AnimationState, THREE.AnimationClip> {
  const animationMap = new Map<AnimationState, THREE.AnimationClip>()

  // Create placeholder animations with different durations
  const animations: { state: AnimationState; duration: number }[] = [
    { state: AnimationState.Idle, duration: 2 },
    { state: AnimationState.Walking, duration: 1 },
    { state: AnimationState.Running, duration: 0.6 },
    { state: AnimationState.Jumping, duration: 0.8 },
    { state: AnimationState.Falling, duration: 1 },
    { state: AnimationState.Landing, duration: 0.5 },
  ]

  // Create simple keyframe animations
  for (const { state, duration } of animations) {
    const times = [0, duration]
    const positionValues = [0, 0, 0, 0, 0, 0] // No position change
    const rotationValues = [0, 0, 0, 1, 0, 0, 0, 1] // No rotation change

    const positionTrack = new THREE.VectorKeyframeTrack(
      '.position',
      times,
      positionValues
    )
    const rotationTrack = new THREE.QuaternionKeyframeTrack(
      '.quaternion',
      times,
      rotationValues
    )

    const clip = new THREE.AnimationClip(state, duration, [positionTrack, rotationTrack])
    animationMap.set(state, clip)
  }

  return animationMap
}

/**
 * Extract animations from loaded model
 */
export function extractAnimationsFromModel(
  model: THREE.Object3D
): Map<AnimationState, THREE.AnimationClip> {
  const animationMap = new Map<AnimationState, THREE.AnimationClip>()

  if (!(model as THREE.Object3D & { animations?: THREE.AnimationClip[] }).animations) {
    return animationMap
  }

  const animations = (
    model as THREE.Object3D & { animations?: THREE.AnimationClip[] }
  ).animations

  for (const clip of animations) {
    const name = clip.name.toLowerCase()

    // Map clip names to animation states
    if (name.includes('idle')) {
      animationMap.set(AnimationState.Idle, clip)
    } else if (name.includes('walk')) {
      animationMap.set(AnimationState.Walking, clip)
    } else if (name.includes('run')) {
      animationMap.set(AnimationState.Running, clip)
    } else if (name.includes('jump')) {
      animationMap.set(AnimationState.Jumping, clip)
    } else if (name.includes('fall')) {
      animationMap.set(AnimationState.Falling, clip)
    } else if (name.includes('land')) {
      animationMap.set(AnimationState.Landing, clip)
    }
  }

  return animationMap
}

/**
 * Ensure all required animations exist in map
 */
export function ensureAllAnimationsExist(
  animationMap: Map<AnimationState, THREE.AnimationClip>
): Map<AnimationState, THREE.AnimationClip> {
  const requiredStates = [
    AnimationState.Idle,
    AnimationState.Walking,
    AnimationState.Running,
    AnimationState.Jumping,
    AnimationState.Falling,
    AnimationState.Landing,
  ]

  const placeholders = createPlaceholderAnimations()

  for (const state of requiredStates) {
    if (!animationMap.has(state)) {
      const placeholder = placeholders.get(state)
      if (placeholder) {
        animationMap.set(state, placeholder)
      }
    }
  }

  return animationMap
}
