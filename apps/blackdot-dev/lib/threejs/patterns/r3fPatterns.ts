/**
 * R3F Pattern Library
 * 
 * Standardized patterns for React Three Fiber components.
 * Provides reusable hooks and utilities for common R3F operations.
 * 
 * Best Practices:
 * - useFrame with priority system
 * - useLoader integration
 * - Animation hooks (rotation, position, scale)
 * - Interaction handlers (hover, click, drag)
 * - Performance optimization (instancing, LOD)
 */

'use client'

import { useRef, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Object3D } from 'three'

/**
 * Animation Hook - Rotation
 * 
 * @example
 * ```tsx
 * function RotatingBox() {
 *   const ref = useRotation({ speed: 0.01, axis: 'y' })
 *   return <mesh ref={ref}><boxGeometry /></mesh>
 * }
 * ```
 */
export function useRotation(options: {
  speed?: number
  axis?: 'x' | 'y' | 'z' | [number, number, number]
  priority?: number
} = {}) {
  const { speed = 0.01, axis = 'y', priority = 0 } = options
  const ref = useRef<Object3D>(null)

  const axisVector = useMemo(() => {
    if (typeof axis === 'string') {
      switch (axis) {
        case 'x':
          return new THREE.Vector3(1, 0, 0)
        case 'y':
          return new THREE.Vector3(0, 1, 0)
        case 'z':
          return new THREE.Vector3(0, 0, 1)
        default:
          return new THREE.Vector3(0, 1, 0)
      }
    }
    return new THREE.Vector3(...axis)
  }, [axis])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotateOnAxis(axisVector, speed * delta)
    }
  }, priority)

  return ref
}

/**
 * Animation Hook - Position Oscillation
 * 
 * @example
 * ```tsx
 * function FloatingBox() {
 *   const ref = useOscillation({ axis: 'y', amplitude: 0.5, speed: 1 })
 *   return <mesh ref={ref}><boxGeometry /></mesh>
 * }
 * ```
 */
export function useOscillation(options: {
  axis?: 'x' | 'y' | 'z'
  amplitude?: number
  speed?: number
  offset?: number
  priority?: number
} = {}) {
  const { axis = 'y', amplitude = 0.5, speed = 1, offset = 0, priority = 0 } = options
  const ref = useRef<Object3D>(null)
  const initialPosition = useRef<THREE.Vector3 | null>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      if (!initialPosition.current) {
        initialPosition.current = ref.current.position.clone()
      }

      const time = Date.now() * 0.001 * speed + offset
      const value = Math.sin(time) * amplitude

      switch (axis) {
        case 'x':
          ref.current.position.x = initialPosition.current.x + value
          break
        case 'y':
          ref.current.position.y = initialPosition.current.y + value
          break
        case 'z':
          ref.current.position.z = initialPosition.current.z + value
          break
      }
    }
  }, priority)

  return ref
}

/**
 * Animation Hook - Scale Pulse
 * 
 * @example
 * ```tsx
 * function PulsingSphere() {
 *   const ref = usePulse({ min: 0.8, max: 1.2, speed: 2 })
 *   return <mesh ref={ref}><sphereGeometry /></mesh>
 * }
 * ```
 */
export function usePulse(options: {
  min?: number
  max?: number
  speed?: number
  priority?: number
} = {}) {
  const { min = 0.8, max = 1.2, speed = 1, priority = 0 } = options
  const ref = useRef<Object3D>(null)
  const initialScale = useRef<number>(1)

  useFrame((_, delta) => {
    if (ref.current) {
      if (initialScale.current === 1) {
        initialScale.current = ref.current.scale.x
      }

      const time = Date.now() * 0.001 * speed
      const scale = min + (max - min) * (Math.sin(time) * 0.5 + 0.5)
      ref.current.scale.setScalar(initialScale.current * scale)
    }
  }, priority)

  return ref
}

/**
 * Interaction Hook - Hover
 * 
 * @example
 * ```tsx
 * function InteractiveBox() {
 *   const { isHovered, handlers } = useHover({
 *     onEnter: () => console.log('hovered'),
 *     onLeave: () => console.log('unhovered')
 *   })
 *   return (
 *     <mesh {...handlers}>
 *       <boxGeometry />
 *       <meshStandardMaterial color={isHovered ? 'hotpink' : 'orange'} />
 *     </mesh>
 *   )
 * }
 * ```
 */
export function useHover(options: {
  onEnter?: () => void
  onLeave?: () => void
} = {}) {
  const { onEnter, onLeave } = options
  const isHoveredRef = useRef(false)

  const handlePointerEnter = useCallback(() => {
    if (!isHoveredRef.current) {
      isHoveredRef.current = true
      onEnter?.()
    }
  }, [onEnter])

  const handlePointerLeave = useCallback(() => {
    if (isHoveredRef.current) {
      isHoveredRef.current = false
      onLeave?.()
    }
  }, [onLeave])

  return {
    isHovered: isHoveredRef.current,
    handlers: {
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
    },
  }
}

/**
 * Interaction Hook - Click
 * 
 * @example
 * ```tsx
 * function ClickableBox() {
 *   const handlers = useClick({ onClick: () => console.log('clicked') })
 *   return <mesh {...handlers}><boxGeometry /></mesh>
 * }
 * ```
 */
export function useClick(options: {
  onClick?: (event: THREE.Event) => void
  onDoubleClick?: (event: THREE.Event) => void
} = {}) {
  const { onClick, onDoubleClick } = options

  const handleClick = useCallback(
    (event: THREE.Event) => {
      (event as any).stopPropagation?.()
      onClick?.(event)
    },
    [onClick]
  )

  const handleDoubleClick = useCallback(
    (event: THREE.Event) => {
      (event as any).stopPropagation?.()
      onDoubleClick?.(event)
    },
    [onDoubleClick]
  )

  return {
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
  }
}

/**
 * Camera Hook - Look at target
 * 
 * @example
 * ```tsx
 * function CameraController() {
 *   useLookAt([0, 0, 0], { smooth: true })
 *   return null
 * }
 * ```
 */
export function useLookAt(
  target: [number, number, number] | THREE.Vector3,
  options: {
    smooth?: boolean
    speed?: number
    priority?: number
  } = {}
) {
  const { smooth = false, speed = 1, priority = 0 } = options
  const { camera } = useThree()
  const targetVector = useMemo(() => {
    return Array.isArray(target) ? new THREE.Vector3(...target) : target.clone()
  }, [target])

  useFrame(() => {
    if (smooth) {
      camera.lookAt(
        THREE.MathUtils.lerp(camera.position.x, targetVector.x, speed * 0.1),
        THREE.MathUtils.lerp(camera.position.y, targetVector.y, speed * 0.1),
        THREE.MathUtils.lerp(camera.position.z, targetVector.z, speed * 0.1)
      )
    } else {
      camera.lookAt(targetVector)
    }
  }, priority)
}

/**
 * Performance Hook - Distance-based LOD
 * 
 * @example
 * ```tsx
 * function LODModel() {
 *   const { level, ref } = useLOD({ distances: [5, 10, 20] })
 *   return (
 *     <group ref={ref}>
 *       {level === 0 && <HighDetailModel />}
 *       {level === 1 && <MediumDetailModel />}
 *       {level === 2 && <LowDetailModel />}
 *     </group>
 *   )
 * }
 * ```
 */
export function useLOD(options: {
  distances: number[]
  priority?: number
} = { distances: [] }) {
  const { distances, priority = 0 } = options
  const ref = useRef<Object3D>(null)
  const { camera } = useThree()
  const levelRef = useRef(0)

  useFrame(() => {
    if (ref.current) {
      const distance = camera.position.distanceTo(ref.current.position)
      let level = distances.length - 1

      for (let i = 0; i < distances.length; i++) {
        if (distance < distances[i]) {
          level = i
          break
        }
      }

      levelRef.current = level
    }
  }, priority)

  return {
    level: levelRef.current,
    ref,
  }
}

/**
 * Performance Hook - Visibility culling
 * 
 * @example
 * ```tsx
 * function CulledModel() {
 *   const { isVisible, ref } = useVisibilityCulling({ distance: 50 })
 *   if (!isVisible) return null
 *   return <mesh ref={ref}><boxGeometry /></mesh>
 * }
 * ```
 */
export function useVisibilityCulling(options: {
  distance?: number
  priority?: number
} = {}) {
  const { distance = 50, priority = 0 } = options
  const ref = useRef<Object3D>(null)
  const { camera } = useThree()
  const isVisibleRef = useRef(true)

  useFrame(() => {
    if (ref.current) {
      const dist = camera.position.distanceTo(ref.current.position)
      isVisibleRef.current = dist < distance
    }
  }, priority)

  return {
    isVisible: isVisibleRef.current,
    ref,
  }
}

/**
 * Utility - Create instanced mesh helper
 * 
 * @example
 * ```tsx
 * function InstancedBoxes({ count }: { count: number }) {
 *   const { mesh, setInstance } = useInstancedMesh(count, <boxGeometry />, <meshStandardMaterial />)
 *   // Use setInstance to update individual instances
 *   return <primitive object={mesh} />
 * }
 * ```
 */
export function useInstancedMesh(
  count: number,
  geometry: React.ReactElement,
  material: React.ReactElement
) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const setInstance = useCallback(
    (index: number, position: [number, number, number], rotation?: [number, number, number], scale?: number) => {
      if (meshRef.current) {
        const matrix = new THREE.Matrix4()
        matrix.setPosition(...position)
        if (rotation) {
          matrix.makeRotationFromEuler(new THREE.Euler(...rotation))
        }
        if (scale) {
          matrix.scale(new THREE.Vector3(scale, scale, scale))
        }
        meshRef.current.setMatrixAt(index, matrix)
        meshRef.current.instanceMatrix.needsUpdate = true
      }
    },
    []
  )

  return {
    mesh: meshRef.current,
    setInstance,
  }
}
