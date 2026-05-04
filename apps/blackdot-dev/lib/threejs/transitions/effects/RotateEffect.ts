import { TransitionEffectPlugin, EffectExecutionParams } from '../types'

/**
 * Rotate Effect
 *
 * Rotates a model around a specific axis by a specified amount.
 *
 * @example
 * ```typescript
 * // Rotate before model 360 degrees around Y axis
 * { type: 'rotate', duration: 1.0, target: 'before', axis: 'y', amount: Math.PI * 2 }
 *
 * // Rotate after model 180 degrees around X axis with ease
 * { type: 'rotate', duration: 0.8, target: 'after', axis: 'x', amount: Math.PI, ease: 'power2.out' }
 *
 * // Rotate both models 90 degrees around Z axis
 * { type: 'rotate', duration: 0.5, target: 'both', axis: 'z', amount: Math.PI / 2 }
 * ```
 */
export const RotateEffect: TransitionEffectPlugin = {
  type: 'rotate',

  validate(config) {
    if (config.duration && config.duration <= 0) {
      return 'duration must be greater than 0'
    }
    if (config.delay && config.delay < 0) {
      return 'delay must be non-negative'
    }
    if (config.axis && !['x', 'y', 'z'].includes(config.axis)) {
      return "axis must be 'x', 'y', or 'z'"
    }
    return true
  },

  execute({ timeline, beforeModel, afterModel, config }: EffectExecutionParams) {
    const {
      duration = 1.0,
      delay = 0,
      ease = 'power2.inOut',
      target = 'both',
      axis = 'y',
      amount = Math.PI * 2
    } = config

    // Map axis name to property name
    const rotationProp = axis === 'x' ? 'x' : axis === 'y' ? 'y' : 'z'

    if (target === 'before' || target === 'both') {
      // Use absolute values instead of += to avoid accumulation on rebuilds
      const beforeCurrentRotation = (beforeModel.rotation as any)[rotationProp]
      const beforeTargetRotation = beforeCurrentRotation + amount

      timeline.to(
        beforeModel.rotation,
        {
          [rotationProp]: beforeTargetRotation,
          duration,
          ease
        },
        delay
      )
    }

    if (target === 'after' || target === 'both') {
      // Use absolute values instead of += to avoid accumulation on rebuilds
      const afterCurrentRotation = (afterModel.rotation as any)[rotationProp]
      const afterTargetRotation = afterCurrentRotation + amount

      timeline.to(
        afterModel.rotation,
        {
          [rotationProp]: afterTargetRotation,
          duration,
          ease
        },
        delay
      )
    }
  }
}
