import { TransitionEffectPlugin, EffectExecutionParams } from './types'

/**
 * Effect Registry Singleton
 *
 * Manages registration and execution of transition effects.
 * Acts as a plugin system allowing effects to be added independently.
 *
 * Usage:
 * ```typescript
 * import { effectRegistry } from '@/lib/threejs/transitions'
 *
 * // Register a custom effect
 * effectRegistry.register({
 *   type: 'myEffect',
 *   execute({ timeline, beforeModel, afterModel, config }) {
 *     timeline.to(beforeModel, { opacity: 0, duration: config.duration })
 *   }
 * })
 *
 * // Execute an effect
 * effectRegistry.executeEffect('myEffect', params)
 * ```
 */
class TransitionEffectRegistry {
  private effects: Map<string, TransitionEffectPlugin> = new Map()

  /**
   * Register a new transition effect
   * @param effect - The effect plugin to register
   * @throws Error if effect type is already registered
   */
  register(effect: TransitionEffectPlugin): void {
    if (this.effects.has(effect.type)) {
      console.warn(
        `Effect "${effect.type}" is already registered. Overwriting...`
      )
    }

    this.effects.set(effect.type, effect)
  }

  /**
   * Get a registered effect by type
   * @param type - The effect type to retrieve
   * @returns The effect plugin or undefined if not found
   */
  get(type: string): TransitionEffectPlugin | undefined {
    return this.effects.get(type)
  }

  /**
   * Check if an effect is registered
   * @param type - The effect type to check
   * @returns True if the effect is registered
   */
  has(type: string): boolean {
    return this.effects.has(type)
  }

  /**
   * Get all registered effect types
   * @returns Array of registered effect type names
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.effects.keys())
  }

  /**
   * Execute a registered effect
   * Validates the effect exists before executing
   * @param type - The effect type to execute
   * @param params - Parameters to pass to the effect
   * @throws Error if effect type is not found
   */
  executeEffect(type: string, params: EffectExecutionParams): void {
    const effect = this.get(type)

    if (!effect) {
      console.error(
        `Effect "${type}" not found in registry. Available effects: ${this.getRegisteredTypes().join(', ')}`
      )
      return
    }

    // Optional: Validate effect configuration
    if (effect.validate) {
      const validationResult = effect.validate(params.config)
      if (validationResult === false) {
        console.warn(`Effect "${type}" validation failed`)
        return
      } else if (typeof validationResult === 'string') {
        console.warn(`Effect "${type}" validation: ${validationResult}`)
      }
    }

    // Execute the effect
    effect.execute(params)
  }

  /**
   * Dispose all registered effects
   * Call this when cleaning up the registry
   */
  disposeAll(): void {
    this.effects.forEach((effect) => {
      if (effect.dispose) {
        effect.dispose()
      }
    })

    this.effects.clear()
  }

  /**
   * Clear all registered effects
   * WARNING: Use with caution - this removes all effect registrations
   */
  clear(): void {
    this.disposeAll()
  }
}

/**
 * Global effect registry singleton
 * Import this to register or execute effects
 */
export const effectRegistry = new TransitionEffectRegistry()
