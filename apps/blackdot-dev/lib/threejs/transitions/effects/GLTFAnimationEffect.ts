import { TransitionEffectPlugin, EffectExecutionParams } from '../types'

/**
 * GLTF Animation Effect
 *
 * Triggers embedded GLTF animations on a model when it becomes visible.
 * The animations are created in Blender and exported with the model.
 *
 * This effect doesn't add animations to the timeline directly.
 * Instead, it signals to the model component that it should play its
 * built-in animations when `playAnimations` prop becomes true.
 *
 * @example
 * ```typescript
 * // Play GLTF animations on the after model
 * { type: 'gltfAnimation', target: 'after' }
 *
 * // With custom animation name (if supported by model component)
 * { type: 'gltfAnimation', target: 'after', animationName: 'explode' }
 * ```
 *
 * ## Model Component Setup
 *
 * The model component should accept a `playAnimations` prop:
 *
 * ```typescript
 * export function MyModel({ playAnimations, visible }: { playAnimations?: boolean; visible?: boolean }) {
 *   const { actions } = useAnimations(animations, ref)
 *
 *   useEffect(() => {
 *     if (playAnimations && actions.explode) {
 *       actions.explode.reset().play()
 *     }
 *   }, [playAnimations, actions])
 *
 *   return <primitive object={scene} />
 * }
 * ```
 */
export const GLTFAnimationEffect: TransitionEffectPlugin = {
  type: 'gltfAnimation',

  execute({ timeline, config }: EffectExecutionParams) {
    const { target = 'after' } = config

    // This effect adds a label to the timeline for debugging purposes
    // The actual animation playback is handled by the model component's
    // useEffect when playAnimations prop becomes true
    timeline.addLabel(`gltfAnimation-${target}`, timeline.duration())
  }
}
