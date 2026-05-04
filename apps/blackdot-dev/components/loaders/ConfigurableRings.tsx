'use client'

import { Center } from '@react-three/drei'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useCallback, useRef } from 'react'
import * as THREE from 'three'
import { CustomMaterial } from '@/components/shared/loaders/material'

/**
 * Configurable concentric rings loader
 *
 * Renders N rotating toruses at increasing radii. Perfect for:
 * - Production stages (ring count = stages)
 * - Priority levels (inner to outer = high to low)
 * - Network layers (OSI model layers)
 * - Signal strength zones
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <ConfigurableRings
 *   count={4}
 *   colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']}
 *   speeds={[1, 0.8, 0.6, 0.4]}
 * />
 * ```
 */

export interface ConfigurableRingsProps {
  /** Number of rings (default: 4) */
  count?: number
  /** Base radius of innermost ring (default: 0.5) */
  baseRadius?: number
  /** Radius increment between rings (default: 0.5) */
  radiusIncrement?: number
  /** Tube radius of each torus (default: 0.1) */
  tubeRadius?: number
  /** Rotation speed multiplier (default: 1) */
  rotationSpeed?: number
  /** Stagger delay between ring animations in seconds (default: 0.15) */
  staggerDelay?: number
  /** Colors for each ring (cycles if fewer than count) */
  colors?: string[]
  /** Custom rotation speeds for each ring */
  speeds?: number[]
  /** Repeat delay between animation cycles (default: 0.5) */
  repeatDelay?: number
  /** Initial position */
  position?: [number, number, number]
  /** Initial scale */
  scale?: number | [number, number, number]
  /** Initial rotation */
  rotation?: [number, number, number]
  /** Labels for each ring (for data visualization) */
  labels?: string[]
  /** Opacity of rings (default: 1) */
  opacity?: number
}

export const ConfigurableRings = ({
  count = 4,
  baseRadius = 0.5,
  radiusIncrement = 0.5,
  tubeRadius = 0.1,
  rotationSpeed = 1,
  staggerDelay = 0.15,
  colors = ['#ffffff'],
  speeds,
  repeatDelay = 0.5,
  position,
  scale,
  rotation,
  labels,
  opacity = 1,
}: ConfigurableRingsProps) => {
  const refList = useRef<THREE.Mesh[]>([])

  const getRef = useCallback((mesh: THREE.Mesh) => {
    if (mesh && !refList.current.includes(mesh)) {
      refList.current.push(mesh)
    }
  }, [])

  useGSAP(() => {
    if (refList.current.length === 0) return

    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay,
    })

    refList.current.forEach((mesh, index) => {
      const speed = speeds?.[index] ?? rotationSpeed
      const duration = 1.5 / speed

      timeline.to(
        mesh.rotation,
        {
          y: `+=${Math.PI * 2}`,
          x: `-=${Math.PI * 2}`,
          duration,
        },
        index * staggerDelay
      )
    })
  }, [rotationSpeed, staggerDelay, repeatDelay, speeds])

  return (
    <Center position={position} scale={scale} rotation={rotation}>
      <group>
        {Array.from({ length: count }).map((_, index) => {
          const radius = baseRadius + radiusIncrement * index
          const color = colors[index % colors.length]

          return (
            <mesh key={index} ref={getRef}>
              <torusGeometry args={[radius, tubeRadius, 32, 100]} />
              <meshMatcapMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </mesh>
          )
        })}
      </group>
    </Center>
  )
}
