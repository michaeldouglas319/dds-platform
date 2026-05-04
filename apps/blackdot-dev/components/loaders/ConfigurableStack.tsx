'use client'

import { useGSAP } from '@gsap/react'
import { Center, RoundedBox } from '@react-three/drei'
import gsap from 'gsap'
import { useCallback, useRef } from 'react'
import * as THREE from 'three'

/**
 * Configurable stacked boxes loader
 *
 * Renders N stacked rounded boxes with staggered rotation. Perfect for:
 * - System architecture layers
 * - Building floor status
 * - Stack hierarchy visualization
 * - Process stages
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <ConfigurableStack
 *   count={5}
 *   colors={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#f9ca24']}
 *   labels={['UI', 'API', 'Logic', 'Data', 'Infrastructure']}
 * />
 * ```
 */

export interface ConfigurableStackProps {
  /** Number of boxes in stack (default: 5) */
  count?: number
  /** Size of each box as [width, height, depth] (default: [1, 0.1, 1]) */
  boxSize?: [number, number, number]
  /** Spacing between boxes (default: 0.05) */
  spacing?: number
  /** Rotation angle in degrees (default: 45) */
  rotationDegrees?: number
  /** Duration of rotation animation (default: 1) */
  duration?: number
  /** Stagger delay between animations (default: 0.1) */
  staggerDelay?: number
  /** Ease function for animation (default: 'back') */
  ease?: string
  /** Repeat delay between cycles (default: 0.5) */
  repeatDelay?: number
  /** Colors for each box (cycles if fewer than count) */
  colors?: string[]
  /** Rounded corner radius (default: 0.02) */
  radius?: number
  /** Initial position */
  position?: [number, number, number]
  /** Initial scale */
  scale?: number | [number, number, number]
  /** Initial rotation */
  rotation?: [number, number, number]
  /** Labels for each layer */
  labels?: string[]
  /** Opacity of boxes (default: 1) */
  opacity?: number
}

export const ConfigurableStack = ({
  count = 5,
  boxSize = [1, 0.1, 1],
  spacing = 0.05,
  rotationDegrees = 45,
  duration = 1,
  staggerDelay = 0.1,
  ease = 'back',
  repeatDelay = 0.5,
  colors = ['#ffffff'],
  radius = 0.02,
  position,
  scale,
  rotation,
  labels,
  opacity = 1,
}: ConfigurableStackProps) => {
  const refList = useRef<THREE.Mesh[]>([])

  const getRef = useCallback((mesh: THREE.Mesh) => {
    if (mesh && !refList.current.includes(mesh)) {
      refList.current.push(mesh)
    }
  }, [])

  useGSAP(() => {
    if (refList.current.length === 0) return

    const rotationRadians = (rotationDegrees * Math.PI) / 180

    gsap.to(
      refList.current.map((i) => i.rotation),
      {
        y: `+=${rotationRadians}`,
        repeat: -1,
        repeatDelay,
        ease,
        stagger: {
          each: staggerDelay,
        },
        duration,
      }
    )
  }, [rotationDegrees, duration, staggerDelay, ease, repeatDelay])

  const totalHeight = (count - 1) * (boxSize[1] + spacing)
  const centerOffset = totalHeight / 2

  return (
    <Center position={position} scale={scale} rotation={rotation}>
      <group>
        {Array.from({ length: count }).map((_, index) => {
          const color = colors[index % colors.length]
          const yPos = (index - count / 2) * (boxSize[1] + spacing) + centerOffset

          return (
            <RoundedBox
              ref={getRef}
              args={boxSize}
              key={index}
              radius={radius}
              position={[0, yPos, 0]}
            >
              <meshMatcapMaterial
                color={color}
                transparent
                opacity={opacity}
              />
            </RoundedBox>
          )
        })}
      </group>
    </Center>
  )
}
