import { TransitionEffectPlugin, EffectExecutionParams } from '../types'

/**
 * Scale Effect
 *
 * Scales a model up or down by animating the position scale.
 *
 * @example
 * ```typescript
 * // Scale down before model to 0 over 0.5s
 * { type: 'scale', duration: 0.5, target: 'before', from: 1, to: 0 }
 *
 * // Scale up after model from 0 to 1 over 0.8s with easing
 * { type: 'scale', duration: 0.8, target: 'after', from: 0, to: 1, ease: 'back.out(1.7)' }
 *
 * // Scale both models down to 50%
 * { type: 'scale', duration: 0.6, target: 'both', from: 1, to: 0.5 }
 * ```
 */
export const ScaleEffect: TransitionEffectPlugin = {
  type: 'scale',

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
      ease = 'back.out(1.7)',
      target = 'both',
      from = 1,
      to = 0
    } = config

    if (target === 'before' || target === 'both') {
      timeline.to(
        beforeModel.scale,
        {
          x: to,
          y: to,
          z: to,
          duration,
          ease
        },
        delay
      )
    }

    if (target === 'after' || target === 'both') {
      timeline.fromTo(
        afterModel.scale,
        { x: from, y: from, z: from },
        { x: to, y: to, z: to, duration, ease },
        delay
      )
    }
  }
}
