'use client'

import { useGSAP } from '@gsap/react'
import { Center, Instance, Instances } from '@react-three/drei'
import gsap from 'gsap'
import { useCallback, useRef } from 'react'
import * as THREE from 'three'

/**
 * Configurable cylinder wave loader
 *
 * Renders N cylinders with staggered scale pulse animation. Perfect for:
 * - Audio equalizer visualization
 * - Time series data
 * - Activity levels (hourly, by category)
 * - Progress stages
 * - Frequency bars
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <ConfigurableWave
 *   count={10}
 *   colors={['#ff6b6b']}
 *   heights={[0.3, 0.5, 0.7, 0.9, 1.0, 0.9, 0.7, 0.5, 0.3, 0.2]}
 * />
 * ```
 */

export interface ConfigurableWaveProps {
  /** Number of cylinders (default: 10) */
  count?: number
  /** Radius of each cylinder (default: 1) */
  cylinderRadius?: number
  /** Spacing between cylinders (default: 0.5) */
  spacing?: number
  /** Min scale value for pulse (default: 0.3) */
  minScale?: number
  /** Max scale value for pulse (default: 1.0) */
  maxScale?: number
  /** Duration of pulse animation (default: 1) */
  duration?: number
  /** Stagger delay between cylinders (default: 0.25) */
  staggerDelay?: number
  /** Ease function for animation (default: 'sine.inOut') */
  ease?: string
  /** Repeat delay between cycles (default: 0) */
  repeatDelay?: number
  /** Colors for cylinders (cycles if fewer than count) */
  colors?: string[]
  /** Custom heights for each cylinder (overrides min/max scale) */
  heights?: number[]
  /** Initial position */
  position?: [number, number, number]
  /** Initial scale */
  scale?: number | [number, number, number]
  /** Initial rotation */
  rotation?: [number, number, number]
  /** Opacity of cylinders (default: 1) */
  opacity?: number
  /** Thickness of cylinder walls (default: 0.2) */
  cylinderHeight?: number
}

export const ConfigurableWave = ({
  count = 10,
  cylinderRadius = 1,
  spacing = 0.5,
  minScale = 0.3,
  maxScale = 1.0,
  duration = 1,
  staggerDelay = 0.25,
  ease = 'sine.inOut',
  repeatDelay = 0,
  colors = ['#ffffff'],
  heights,
  position,
  scale,
  rotation,
  opacity = 1,
  cylinderHeight = 0.2,
}: ConfigurableWaveProps) => {
  const refList = useRef<THREE.InstancedMesh | null>(null)
  const meshRefs = useRef<THREE.Object3D[]>([])

  const getRef = useCallback((mesh: THREE.Object3D) => {
    if (mesh && !meshRefs.current.includes(mesh)) {
      meshRefs.current.push(mesh)
    }
  }, [])

  useGSAP(() => {
    if (meshRefs.current.length === 0) return

    meshRefs.current.forEach((mesh, index) => {
      if (mesh && 'scale' in mesh) {
        const scaleTarget = heights ? heights[index] / maxScale : 1

        gsap.to(mesh.scale, {
          x: scaleTarget,
          z: scaleTarget,
          delay: staggerDelay * index,
          repeat: -1,
          repeatDelay,
          yoyo: true,
          ease,
          duration,
        })
      }
    })
  }, [duration, staggerDelay, ease, repeatDelay, heights, maxScale])

  return (
    <Center position={position} scale={scale} rotation={rotation}>
      <group rotation={[0, 0, Math.PI / 4]}>
        <group rotation={[0, 0, Math.PI / 2]}>
          <Instances ref={refList}>
            <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderHeight, 64]} />
            <meshMatcapMaterial
              color={colors[0]}
              transparent
              opacity={opacity}
            />
            {Array.from({ length: count }).map((_, index) => {
              const color = colors[index % colors.length]

              return (
                <Instance
                  ref={getRef}
                  key={index}
                  position={[0, spacing * index, 2]}
                  userData={{ color }}
                />
              )
            })}
          </Instances>
        </group>
      </group>
    </Center>
  )
}
