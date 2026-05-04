import { TransitionEffectPlugin, EffectExecutionParams } from '../types'

/**
 * Camera Effect
 *
 * Animates camera position and look-at target during transition.
 *
 * @example
 * ```typescript
 * // Move camera from position A to position B
 * {
 *   type: 'camera',
 *   duration: 1.5,
 *   from: [0, 0, 20],
 *   to: [-10, 10, 20]
 * }
 *
 * // Move camera and change look-at target
 * {
 *   type: 'camera',
 *   duration: 2.0,
 *   from: [0, 0, 20],
 *   to: [10, 5, 15],
 *   lookAt: [5, 0, 0]
 * }
 * ```
 */
export const CameraEffect: TransitionEffectPlugin = {
  type: 'camera',

  validate(config) {
    if (config.duration && config.duration <= 0) {
      return 'duration must be greater than 0'
    }
    if (config.delay && config.delay < 0) {
      return 'delay must be non-negative'
    }
    if (config.from && !Array.isArray(config.from) && config.from.length !== 3) {
      return 'from must be an array [x, y, z]'
    }
    if (config.to && !Array.isArray(config.to) && config.to.length !== 3) {
      return 'to must be an array [x, y, z]'
    }
    if (
      config.lookAt &&
      !Array.isArray(config.lookAt) &&
      config.lookAt.length !== 3
    ) {
      return 'lookAt must be an array [x, y, z]'
    }
    return true
  },

  execute({ timeline, camera, config }: EffectExecutionParams) {
    const {
      duration = 1.5,
      delay = 0,
      ease = 'power1.inOut',
      from,
      to,
      lookAt
    } = config

    // Capture original camera state for restoration
    const originalPosition = camera.position.clone()
    const originalQuaternion = camera.quaternion.clone()

    // Animate position if both from and to are provided
    if (from && to) {
      timeline.fromTo(
        camera.position,
        { x: from[0], y: from[1], z: from[2] },
        { x: to[0], y: to[1], z: to[2], duration, ease },
        delay
      )
    }

    // Animate look-at target if provided
    if (lookAt) {
      // Create a helper object to animate the look-at target
      const target = { x: 0, y: 0, z: 0 }

      timeline.to(
        target,
        {
          x: lookAt[0],
          y: lookAt[1],
          z: lookAt[2],
          duration,
          ease,
          onUpdate: () => {
            camera.lookAt(target.x, target.y, target.z)
          }
        },
        delay
      )
    }

    // Restore original camera state after effect completes
    timeline.call(() => {
      // Only restore if we haven't been moved by another effect
      if (!from || !to) {
        camera.position.copy(originalPosition)
        camera.quaternion.copy(originalQuaternion)
      }
    }, undefined, delay + duration)
  }
}
