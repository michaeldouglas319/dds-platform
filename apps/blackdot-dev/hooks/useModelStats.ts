/**
 * Hook for attaching stat displays to 3D models
 *
 * Handles positioning, visibility, and LOD (level of detail) for loader
 * components attached to 3D models in a scene.
 */

import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface ModelStatsConfig {
  /** Position offset from model [x, y, z] */
  offset: [number, number, number]
  /** Scale of the stat display relative to model */
  scale?: number
  /** Hide stat display when camera is farther than this distance */
  lodDistance?: number
  /** Fade out stat display gradually (LOD fade) */
  useFadeLOD?: boolean
  /** Additional rotation offset */
  rotation?: [number, number, number]
  /** Whether stat display should face camera */
  billboarded?: boolean
}

export interface ModelStatsData {
  value?: number | number[]
  label?: string
  color?: string
  colors?: string[]
  status?: 'idle' | 'active' | 'warning' | 'error'
  metadata?: Record<string, any>
}

/**
 * Hook for managing stat displays attached to models
 *
 * @param config - Configuration for the stat display positioning
 * @param data - Data to display
 * @returns Object with position, scale, and visibility state
 *
 * @example
 * ```tsx
 * const stats = useModelStats(
 *   {
 *     offset: [0, 5, 0],
 *     lodDistance: 50,
 *     useFadeLOD: true,
 *   },
 *   { value: 75, label: 'Production' }
 * )
 *
 * return (
 *   <group position={stats.position} scale={stats.scale}>
 *     <ConfigurableRings {...config} />
 *   </group>
 * )
 * ```
 */
export function useModelStats(
  config: ModelStatsConfig,
  data: ModelStatsData
) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)

  const {
    offset,
    scale = 1,
    lodDistance = 50,
    useFadeLOD = true,
    rotation = [0, 0, 0],
    billboarded = false,
  } = config

  useEffect(() => {
    if (!groupRef.current) return

    const checkLOD = () => {
      const distance = camera.position.distanceTo(groupRef.current!.position)

      if (useFadeLOD) {
        // Fade LOD: gradually reduce opacity
        const fadeStart = lodDistance * 0.8
        const fadeEnd = lodDistance

        if (distance > fadeEnd) {
          setVisible(false)
          setOpacity(0)
        } else if (distance > fadeStart) {
          const fadeFactor = 1 - (distance - fadeStart) / (fadeEnd - fadeStart)
          setOpacity(Math.max(0, fadeFactor))
          setVisible(true)
        } else {
          setOpacity(1)
          setVisible(true)
        }
      } else {
        // Hard LOD: show/hide at threshold
        setVisible(distance < lodDistance)
      }
    }

    const animationId = window.requestAnimationFrame(checkLOD)
    return () => cancelAnimationFrame(animationId)
  }, [camera, lodDistance, useFadeLOD])

  // Apply billboard effect if enabled
  useEffect(() => {
    if (!billboarded || !groupRef.current) return

    const updateBillboard = () => {
      const direction = camera.position
        .clone()
        .sub(groupRef.current!.position)
        .normalize()

      // Rotate to face camera
      groupRef.current!.lookAt(
        groupRef.current!.position.clone().add(direction)
      )
    }

    const animationId = window.requestAnimationFrame(updateBillboard)
    return () => cancelAnimationFrame(animationId)
  }, [camera, billboarded])

  return {
    ref: groupRef,
    position: offset as [number, number, number],
    scale,
    rotation: rotation as [number, number, number],
    visible,
    opacity,
    data,
  }
}

/**
 * Position loader relative to model bounds
 *
 * Automatically positions the stat display above or around a model
 * based on its bounding box
 *
 * @param model - THREE.Object3D model
 * @param position - 'top' | 'bottom' | 'sides' | 'center'
 * @param distance - Distance from model surface
 * @returns [x, y, z] offset position
 *
 * @example
 * ```tsx
 * const model = useGLTF('/models/factory.glb')
 * const offset = usePositionFromModel(model.scene, 'top', 2)
 * ```
 */
export function usePositionFromModel(
  model: THREE.Object3D,
  position: 'top' | 'bottom' | 'sides' | 'center' = 'top',
  distance: number = 2
): [number, number, number] {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())

  switch (position) {
    case 'top':
      return [center.x, center.y + size.y / 2 + distance, center.z]
    case 'bottom':
      return [center.x, center.y - size.y / 2 - distance, center.z]
    case 'sides':
      return [center.x + size.x / 2 + distance, center.y, center.z]
    case 'center':
    default:
      return [center.x, center.y, center.z]
  }
}

/**
 * Color mapper for status values
 *
 * Maps numeric or status values to colors for visualization
 *
 * @param value - Value to map
 * @param type - Mapping type
 * @returns Color string (hex)
 *
 * @example
 * ```tsx
 * const color = getStatusColor(75, 'percentage')  // '#4ecdc4' (green)
 * const color = getStatusColor('warning', 'status')  // '#f39c12' (orange)
 * ```
 */
export function getStatusColor(
  value: number | string,
  type: 'percentage' | 'status' | 'intensity' = 'percentage'
): string {
  if (typeof value === 'string') {
    switch (value) {
      case 'idle':
        return '#95a5a6' // gray
      case 'active':
        return '#27ae60' // green
      case 'warning':
        return '#f39c12' // orange
      case 'error':
        return '#e74c3c' // red
      default:
        return '#ffffff'
    }
  }

  // Percentage: green (high) -> yellow (medium) -> red (low)
  if (type === 'percentage') {
    if (value >= 75) return '#27ae60' // green
    if (value >= 50) return '#f39c12' // orange
    if (value >= 25) return '#e67e22' // dark orange
    return '#e74c3c' // red
  }

  // Intensity: low intensity (dark) -> high intensity (bright)
  if (type === 'intensity') {
    const normalized = Math.max(0, Math.min(1, value / 100))
    const hue = normalized * 120 // Green to Red
    return `hsl(${hue}, 100%, 50%)`
  }

  return '#ffffff'
}

/**
 * Data mapper for loader visualization
 *
 * Converts raw data into colors and heights for loaders
 *
 * @param data - Array of data values
 * @param options - Mapping options
 * @returns Object with colors and heights arrays
 *
 * @example
 * ```tsx
 * const { colors, heights } = mapDataToVisuals([10, 30, 50, 70, 90], {
 *   maxHeight: 2,
 *   colorScheme: 'heat'
 * })
 * ```
 */
export function mapDataToVisuals(
  data: number[],
  options: {
    maxHeight?: number
    minHeight?: number
    maxColor?: string
    minColor?: string
    colorScheme?: 'heat' | 'cool' | 'gradient'
    normalize?: boolean
  } = {}
) {
  const {
    maxHeight = 1,
    minHeight = 0.3,
    colorScheme = 'heat',
    normalize = true,
  } = options

  let normalized = data
  if (normalize) {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    normalized = data.map((v) => (v - min) / range)
  } else {
    normalized = data.map((v) => Math.max(0, Math.min(1, v)))
  }

  const heights = normalized.map(
    (v) => minHeight + (maxHeight - minHeight) * v
  )

  const colors = normalized.map((v) => {
    switch (colorScheme) {
      case 'heat':
        if (v < 0.5) {
          return `hsl(${120 - v * 240}, 100%, ${50 + v * 10}%)`
        }
        return `hsl(${120 - v * 240}, 100%, ${50 + v * 10}%)`

      case 'cool':
        return `hsl(${240 - v * 120}, 100%, ${50 + v * 10}%)`

      case 'gradient':
      default:
        if (v < 0.33) {
          return '#e74c3c' // red
        } else if (v < 0.66) {
          return '#f39c12' // orange
        }
        return '#27ae60' // green
    }
  })

  return { colors, heights }
}
