/**
 * Transition Effects Registry
 *
 * Auto-imports and registers all built-in transition effects.
 * This module is imported by the main transitions/index.ts barrel export
 * to ensure all core effects are available.
 */

import { effectRegistry } from '../effectRegistry'
import { FadeEffect } from './FadeEffect'
import { ScaleEffect } from './ScaleEffect'
import { RotateEffect } from './RotateEffect'
import { SlideEffect } from './SlideEffect'
import { CameraEffect } from './CameraEffect'
import { GLTFAnimationEffect } from './GLTFAnimationEffect'
import { MorphEffect } from './MorphEffect'

/**
 * Register all built-in effects
 */
effectRegistry.register(FadeEffect)
effectRegistry.register(ScaleEffect)
effectRegistry.register(RotateEffect)
effectRegistry.register(SlideEffect)
effectRegistry.register(CameraEffect)
effectRegistry.register(GLTFAnimationEffect)
effectRegistry.register(MorphEffect)

// Export individual effects for manual registration if needed
export {
  FadeEffect,
  ScaleEffect,
  RotateEffect,
  SlideEffect,
  CameraEffect,
  GLTFAnimationEffect,
  MorphEffect
}
