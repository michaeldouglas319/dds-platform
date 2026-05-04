/**
 * 3D Model Transition System
 *
 * A modular, plugin-based transition system for React Three Fiber that allows
 * composing multiple effects with independent timing controls.
 *
 * ## Key Features
 *
 * - **Modular Effects**: Each effect is a self-contained plugin
 * - **Timing Control**: Per-effect duration, delay, and easing
 * - **Multiple APIs**: Config-based or component-based effect composition
 * - **TypeScript**: Full type safety with comprehensive interfaces
 * - **GSAP-Powered**: Built on GSAP timeline for precise control
 * - **Plugin System**: Easy to extend with custom effects
 *
 * ## Quick Start
 *
 * ```typescript
 * import { ModelTransition } from '@/lib/threejs/transitions'
 *
 * <ModelTransition
 *   beforeModel={<Building />}
 *   afterModel={<BuildingFragments />}
 *   trigger="click"
 *   effects={[
 *     { type: 'fade', duration: 0.5, target: 'before' },
 *     { type: 'camera', duration: 1.5, from: [0,0,20], to: [-10,10,20] },
 *     { type: 'scale', duration: 0.8, from: 1, to: 0, target: 'after' }
 *   ]}
 * />
 * ```
 *
 * ## Effect Registry
 *
 * Register custom effects:
 *
 * ```typescript
 * import { effectRegistry } from '@/lib/threejs/transitions'
 *
 * effectRegistry.register({
 *   type: 'myEffect',
 *   execute({ timeline, beforeModel, afterModel, config }) {
 *     // Add animations to timeline
 *   }
 * })
 * ```
 *
 * ## Built-in Effects
 *
 * - `fade` - Opacity fade transition
 * - `scale` - Scale up/down transition
 * - `rotate` - Rotation transition
 * - `slide` - Position slide transition
 * - `camera` - Camera movement
 * - `gltfAnimation` - Trigger embedded GLTF animations
 *
 * See `/lib/threejs/transitions/effects/` for implementation details.
 */

export { ModelTransition } from './ModelTransition'
export { effectRegistry } from './effectRegistry'
export type {
  EffectType,
  TransitionTrigger,
  TransitionEffect,
  EffectExecutionParams,
  TransitionEffectPlugin,
  ModelTransitionProps
} from './types'

// Auto-import and register all built-in effects
import './effects'
