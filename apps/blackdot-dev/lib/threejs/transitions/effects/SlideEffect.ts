import { TransitionEffectPlugin, EffectExecutionParams } from '../types'

type SlideDirection = 'left' | 'right' | 'up' | 'down' | 'forward' | 'back'

interface SlideOffset {
  x: number
  y: number
  z: number
}

/**
 * Slide Effect
 *
 * Slides a model in a specific direction by animating position.
 *
 * @example
 * ```typescript
 * // Slide before model to the left over 1s
 * { type: 'slide', duration: 1.0, target: 'before', direction: 'left', distance: 10 }
 *
 * // Slide after model in from the right with ease
 * { type: 'slide', duration: 0.8, target: 'after', direction: 'right', distance: 5, ease: 'power2.out' }
 *
 * // Slide both models up
 * { type: 'slide', duration: 0.6, target: 'both', direction: 'up', distance: 3 }
 * ```
 */
export const SlideEffect: TransitionEffectPlugin = {
  type: 'slide',

  validate(config) {
    if (config.duration && config.duration <= 0) {
      return 'duration must be greater than 0'
    }
    if (config.delay && config.delay < 0) {
      return 'delay must be non-negative'
    }
    if (
      config.direction &&
      !['left', 'right', 'up', 'down', 'forward', 'back'].includes(
        config.direction
      )
    ) {
      return "direction must be one of: left, right, up, down, forward, back"
    }
    return true
  },

  execute({ timeline, beforeModel, afterModel, config }: EffectExecutionParams) {
    const {
      duration = 1.0,
      delay = 0,
      ease = 'power2.out',
      target = 'both',
      direction = 'left' as SlideDirection,
      distance = 10
    } = config

    // Helper to get offset vector from direction
    const getOffset = (dir: SlideDirection): SlideOffset => {
      switch (dir) {
        case 'left':
          return { x: -distance, y: 0, z: 0 }
        case 'right':
          return { x: distance, y: 0, z: 0 }
        case 'up':
          return { x: 0, y: distance, z: 0 }
        case 'down':
          return { x: 0, y: -distance, z: 0 }
        case 'forward':
          return { x: 0, y: 0, z: distance }
        case 'back':
          return { x: 0, y: 0, z: -distance }
        default:
          return { x: 0, y: 0, z: 0 }
      }
    }

    const offset = getOffset(direction)

    if (target === 'before' || target === 'both') {
      timeline.to(
        beforeModel.position,
        {
          x: `+=${offset.x}`,
          y: `+=${offset.y}`,
          z: `+=${offset.z}`,
          duration,
          ease
        },
        delay
      )
    }

    if (target === 'after' || target === 'both') {
      // Use relative positioning: slide from offset position to current position
      const currentPos = afterModel.position.clone()
      const startPos = {
        x: currentPos.x - offset.x,
        y: currentPos.y - offset.y,
        z: currentPos.z - offset.z
      }

      timeline.fromTo(
        afterModel.position,
        startPos,
        { x: currentPos.x, y: currentPos.y, z: currentPos.z, duration, ease },
        delay
      )
    }
  }
}
