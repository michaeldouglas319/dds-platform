// Physics utilities
export { DEFAULT_PHYSICS_CONFIG } from './physicsUtils'
export { AnimationState, getAnimationState, isJumpValid } from './physicsUtils'
export { normalizeMovement, smoothAccelerate, formatPhysicsDebugInfo } from './physicsUtils'
export type { CharacterPhysicsConfig, PhysicsDebugInfo } from './physicsUtils'

// Animation utilities
export { CharacterAnimationMixer } from './animationUtils'
export { createPlaceholderAnimations, extractAnimationsFromModel } from './animationUtils'
export { ensureAllAnimationsExist } from './animationUtils'
export type { AnimationAction, AnimationTransition } from './animationUtils'
