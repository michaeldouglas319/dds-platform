import { TransitionEffectPlugin, EffectExecutionParams } from '../types'
import * as THREE from 'three'

/**
 * Morph Effect
 *
 * Simple, practical cross-fade between two 3D models.
 * Fades models in/out while scaling for smooth transitions.
 *
 * **RECOMMENDED:** For production 3D animations, use Framer Motion for React Three Fiber instead.
 * See: ~/Desktop/ref/2026_01_FRAMER_MOTION_R3F_PRACTICAL_GUIDE.md
 *
 * @example
 * ```typescript
 * { type: 'morph', duration: 2.0, ease: 'power2.inOut' }
 * ```
 */

export const MorphEffect: TransitionEffectPlugin = {
  type: 'morph',

  validate(config) {
    if (config.duration && config.duration <= 0) {
      return 'duration must be greater than 0'
    }
    if (config.delay && config.delay < 0) {
      return 'delay must be non-negative'
    }
    return true
  },

  execute({ timeline, beforeModel, afterModel, config }: EffectExecutionParams) {
    const {
      duration = 2.0,
      delay = 0,
      ease = 'power2.inOut'
    } = config

    // Make materials transparent for fading
    // Source: THREE.Material.transparent/opacity (three.js library)
    afterModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as any
        mat.transparent = true
        mat.opacity = 0
      }
    })

    beforeModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as any
        mat.transparent = true
      }
    })

    // Simple cross-fade using opacity and scale
    // Source: GSAP timeline.to() API (gsap library)
    const tweenDuration = duration * 0.8

    // Fade/scale out before model
    timeline.to(beforeModel.scale, { x: 0.8, y: 0.8, z: 0.8, duration: tweenDuration, ease }, delay)

    beforeModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        timeline.to((child.material as any), { opacity: 0, duration: tweenDuration, ease }, delay)
      }
    })

    // Fade/scale in after model
    timeline.to(afterModel.scale, { x: 1, y: 1, z: 1, duration: tweenDuration, ease }, delay)

    afterModel.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        timeline.to((child.material as any), { opacity: 1, duration: tweenDuration, ease }, delay)
      }
    })

    // Note: Visibility management is handled by ModelTransition component
    // Effects should only handle opacity/scale/position animations, not visibility
  }
}

