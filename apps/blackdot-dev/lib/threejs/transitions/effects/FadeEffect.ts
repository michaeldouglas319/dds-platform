import { TransitionEffectPlugin, EffectExecutionParams } from '../types'
import * as THREE from 'three'

/**
 * Fade Effect
 *
 * Fades a model in or out by animating material opacity.
 * Makes all meshes transparent and animates opacity from 1 → 0 or 0 → 1.
 *
 * @example
 * ```typescript
 * // Fade out before model over 0.5s
 * { type: 'fade', duration: 0.5, target: 'before' }
 *
 * // Fade in after model over 1s with delay
 * { type: 'fade', duration: 1.0, delay: 0.5, target: 'after' }
 *
 * // Fade both models simultaneously
 * { type: 'fade', duration: 0.6, target: 'both' }
 * ```
 */
export const FadeEffect: TransitionEffectPlugin = {
  type: 'fade',

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
      duration = 0.5,
      delay = 0,
      ease = 'power2.inOut',
      target = 'both'
    } = config

    // Store original material states for restoration
    const originalMaterials = new Map<THREE.Mesh, { transparent: boolean; opacity: number }>()

    // Helper to fade a model
    const fadeModel = (model: THREE.Group, toOpacity: number) => {
      const materials: THREE.Material[] = []

      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as any

          // Skip materials already in the list (shared materials)
          if (materials.includes(mat)) return

          materials.push(mat)

          // Store original state
          if (!originalMaterials.has(child)) {
            originalMaterials.set(child, {
              transparent: mat.transparent,
              opacity: mat.opacity ?? 1
            })
          }

          // Make material transparent
          mat.transparent = true

          // Animate opacity
          timeline.to(
            mat,
            {
              opacity: toOpacity,
              duration,
              ease
            },
            delay
          )
        }
      })
    }

    if (target === 'before' || target === 'both') {
      fadeModel(beforeModel, 0)
    }

    if (target === 'after' || target === 'both') {
      fadeModel(afterModel, 1)
    }

    // Restore original material states after fade completes
    timeline.call(() => {
      originalMaterials.forEach((original, mesh) => {
        if (mesh.material) {
          const mat = mesh.material as any
          mat.transparent = original.transparent
          mat.opacity = original.opacity
        }
      })
      originalMaterials.clear()
    }, undefined, delay + duration)
  }
}
