/**
 * Morph System - Reusable Three.js Morph Target Library
 *
 * Export all morph system components, utilities, and types.
 */

// Components
export { MorphModel } from './MorphModel'
export { MorphTransition } from './MorphTransition'

// Generators
export {
  generateSpherifyMorph,
  generateTwistMorph,
  generateWaveMorph,
  generateInflateMorph,
  generateExplodeMorph,
  generateCustomMorph,
  generateMorphTarget,
} from './generators'

// Types
export type {
  MorphTarget,
  MorphAnimationConfig,
  MorphState,
  MorphTargetGenerator,
  MorphGeneratorConfig,
  MorphTrigger,
  MorphTransitionConfig,
  MorphModelProps,
  MorphControls,
} from './types'
