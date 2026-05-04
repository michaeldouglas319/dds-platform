/**
 * Common animation patterns for loader components
 *
 * These utilities build common GSAP animation patterns used across loaders:
 * - Staggered rotations
 * - Circular arrangements with counter-rotation
 * - Scale pulses
 * - Layer animations
 */

import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Create staggered rotation animation
 *
 * @param targets - Array of objects with rotation property
 * @param axis - 'x', 'y', or 'z'
 * @param amount - Amount to rotate in radians
 * @param options - GSAP animation options
 * @returns GSAP timeline
 */
export function createStaggeredRotation(
  targets: Pick<THREE.Object3D, 'rotation'>[],
  axis: 'x' | 'y' | 'z',
  amount: number,
  options: {
    duration?: number
    staggerDelay?: number
    ease?: string
    repeat?: number
    repeatDelay?: number
  } = {}
) {
  const {
    duration = 1.5,
    staggerDelay = 0.15,
    ease = 'none',
    repeat = -1,
    repeatDelay = 0.5,
  } = options

  const rotationTargets = targets.map((target) => target.rotation)

  return gsap.to(rotationTargets, {
    [axis]: `+=${amount}`,
    duration,
    ease,
    repeat,
    repeatDelay,
    stagger: {
      each: staggerDelay,
    },
  })
}

/**
 * Create counter-rotation effect
 *
 * Parent group rotates in one direction, children rotate in opposite
 *
 * @param parentGroup - Parent THREE.Group
 * @param childrenRefs - Array of child objects
 * @param options - Animation options
 * @returns GSAP timeline
 */
export function createCounterRotation(
  parentGroup: THREE.Group | THREE.Object3D,
  childrenRefs: THREE.Object3D[],
  options: {
    parentSpeed?: number
    childSpeed?: number
    axis?: 'x' | 'y' | 'z'
    duration?: number
    ease?: string
    repeat?: number
  } = {}
) {
  const {
    parentSpeed = 1,
    childSpeed = 1,
    axis = 'y',
    duration = 2,
    ease = 'none',
    repeat = -1,
  } = options

  const timeline = gsap.timeline({ repeat })

  // Parent rotation
  timeline.to(
    parentGroup.rotation,
    {
      [axis]: `+=${Math.PI * 2 * parentSpeed}`,
      duration: duration / parentSpeed,
      ease,
    },
    0
  )

  // Children counter-rotation
  childrenRefs.forEach((child, i) => {
    timeline.to(
      child.rotation,
      {
        [axis]: `-=${Math.PI * 2 * childSpeed}`,
        duration: duration / childSpeed,
        ease,
      },
      0
    )
  })

  return timeline
}

/**
 * Create scale pulse animation
 *
 * Animates objects between minScale and maxScale
 *
 * @param targets - Array of objects with scale property
 * @param options - Animation options
 * @returns GSAP timeline
 */
export function createScalePulse(
  targets: Pick<THREE.Object3D, 'scale'>[],
  options: {
    minScale?: number
    maxScale?: number
    duration?: number
    staggerDelay?: number
    ease?: string
    repeat?: number
    yoyo?: boolean
  } = {}
) {
  const {
    minScale = 0.3,
    maxScale = 1.0,
    duration = 1,
    staggerDelay = 0.25,
    ease = 'sine.inOut',
    repeat = -1,
    yoyo = true,
  } = options

  const scaleTargets = targets.map((t) => t.scale)

  return gsap.to(scaleTargets, {
    x: maxScale,
    y: maxScale,
    z: maxScale,
    duration,
    ease,
    repeat,
    yoyo,
    stagger: {
      each: staggerDelay,
    },
  })
}

/**
 * Create layer animation for stacked/layered objects
 *
 * Animates multiple layers in sequence or staggered
 *
 * @param layerGroups - Array of layer groups
 * @param animation - Animation config
 * @param options - Timing options
 * @returns GSAP timeline
 */
export function createLayerAnimation(
  layerGroups: THREE.Group[],
  animation: {
    property: 'rotation' | 'position' | 'scale'
    axis?: 'x' | 'y' | 'z'
    startValue?: number
    endValue: number
  },
  options: {
    duration?: number
    staggerDelay?: number
    ease?: string
    repeat?: number
    sequential?: boolean // If true, layers animate one after another, else staggered
  } = {}
) {
  const {
    duration = 1,
    staggerDelay = 0.1,
    ease = 'power1.inOut',
    repeat = -1,
    sequential = false,
  } = options

  const timeline = gsap.timeline({ repeat })

  layerGroups.forEach((layer, index) => {
    const animationConfig: Record<string, any> = {
      duration,
      ease,
    }

    const prop = animation.property
    const axis = animation.axis || 'y'

    if (prop === 'rotation' || prop === 'position' || prop === 'scale') {
      animationConfig[`${prop}.${axis}`] = animation.endValue
    }

    const startTime = sequential ? index * duration : index * staggerDelay

    timeline.to(layer[prop], animationConfig, startTime)
  })

  return timeline
}

/**
 * Create ripple/wave effect
 *
 * Objects pulse outward in waves, like water ripples
 *
 * @param targets - Array of objects
 * @param options - Animation options
 * @returns GSAP timeline
 */
export function createRippleEffect(
  targets: Pick<THREE.Object3D, 'scale' | 'position'>[],
  options: {
    duration?: number
    staggerDelay?: number
    minScale?: number
    maxScale?: number
    ease?: string
    repeat?: number
  } = {}
) {
  const {
    duration = 0.8,
    staggerDelay = 0.1,
    minScale = 0.8,
    maxScale = 1.2,
    ease = 'back.out',
    repeat = -1,
  } = options

  return gsap.to(targets, {
    scale: maxScale,
    duration,
    ease,
    repeat,
    yoyo: true,
    stagger: {
      each: staggerDelay,
    },
  })
}

/**
 * Create color animation/morph
 *
 * Smoothly transitions between colors
 *
 * @param targets - Array of materials or objects with color
 * @param colors - Array of colors to cycle through
 * @param options - Animation options
 * @returns GSAP timeline
 */
export function createColorAnimation(
  targets: { color?: THREE.Color | { clone(): THREE.Color } }[],
  colors: string[],
  options: {
    duration?: number
    ease?: string
    repeat?: number
    staggerDelay?: number
  } = {}
) {
  const {
    duration = 2,
    ease = 'linear',
    repeat = -1,
    staggerDelay = 0,
  } = options

  const timeline = gsap.timeline({ repeat })

  colors.forEach((color, index) => {
    const nextColor = colors[(index + 1) % colors.length]
    const startTime = index * duration + staggerDelay

    targets.forEach((target) => {
      if (target.color) {
        timeline.to(target.color, { hex: nextColor, duration }, startTime)
      }
    })
  })

  return timeline
}

/**
 * Create orbit animation
 *
 * Objects orbit around a center point
 *
 * @param targets - Array of objects to orbit
 * @param center - Center point [x, y, z]
 * @param options - Animation options
 * @returns GSAP timeline
 */
export function createOrbitAnimation(
  targets: THREE.Object3D[],
  center: [number, number, number] = [0, 0, 0],
  options: {
    radius?: number
    duration?: number
    plane?: 'xy' | 'xz' | 'yz'
    ease?: string
    repeat?: number
  } = {}
) {
  const {
    radius = 5,
    duration = 6,
    plane = 'xz',
    ease = 'none',
    repeat = -1,
  } = options

  const timeline = gsap.timeline({ repeat })

  targets.forEach((target, index) => {
    const angle = (index / targets.length) * Math.PI * 2

    const config: Record<string, any> = {
      duration,
      ease,
      modifiers: {
        x: (gsap as any).unitize((x: any) => {
          const t = (gsap.getProperty(target, 'progress') as number) || 0
          if (plane === 'xz' || plane === 'xy') {
            return center[0] + Math.cos(t * Math.PI * 2 + angle) * radius
          }
          return center[0]
        }),
        z: (gsap as any).unitize((z: any) => {
          const t = (gsap.getProperty(target, 'progress') as number) || 0
          if (plane === 'xz') {
            return center[2] + Math.sin(t * Math.PI * 2 + angle) * radius
          }
          return center[2]
        }),
      },
    }

    timeline.to(target, config, 0)
  })

  return timeline
}

/**
 * Create bounce animation
 *
 * Objects bounce up and down
 *
 * @param targets - Array of objects
 * @param options - Animation options
 * @returns GSAP timeline
 */
export function createBounceAnimation(
  targets: Pick<THREE.Object3D, 'position'>[],
  options: {
    height?: number
    duration?: number
    ease?: string
    repeat?: number
    staggerDelay?: number
  } = {}
) {
  const {
    height = 2,
    duration = 0.8,
    ease = 'back.inOut',
    repeat = -1,
    staggerDelay = 0.1,
  } = options

  return gsap.to(targets, {
    y: (i) => {
      const currentY = (targets[i] as any).position.y || 0
      return currentY + height
    },
    duration,
    ease,
    repeat,
    yoyo: true,
    stagger: {
      each: staggerDelay,
    },
  })
}
