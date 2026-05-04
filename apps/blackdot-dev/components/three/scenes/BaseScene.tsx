'use client'

/**
 * BaseScene - Base scene with lighting, camera, and controls
 * 
 * Standardized base scene component with common setup.
 * 
 * @category three
 * @layer 2
 */

import React from 'react'
import { OrbitControls, Environment } from '@react-three/drei'
import { StandardCanvas } from '../StandardCanvas'
import type { StandardCanvasProps } from '../StandardCanvas'

export interface BaseSceneProps extends Omit<StandardCanvasProps, 'children'> {
  /**
   * Scene content
   */
  children?: React.ReactNode

  /**
   * Camera position
   */
  cameraPosition?: [number, number, number]

  /**
   * Camera FOV
   */
  fov?: number

  /**
   * Show orbit controls
   */
  showControls?: boolean

  /**
   * Auto-rotate controls
   */
  autoRotate?: boolean

  /**
   * Controls target
   */
  controlsTarget?: [number, number, number]

  /**
   * Environment preset
   */
  environment?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'

  /**
   * Ambient light intensity
   */
  ambientIntensity?: number

  /**
   * Directional light
   */
  directionalLight?: {
    position: [number, number, number]
    intensity: number
    castShadow?: boolean
  }
}

/**
 * BaseScene Component
 * 
 * @example
 * ```tsx
 * <BaseScene cameraPosition={[0, 0, 5]}>
 *   <mesh>
 *     <boxGeometry />
 *     <meshStandardMaterial />
 *   </mesh>
 * </BaseScene>
 * ```
 */
export function BaseScene({
  children,
  cameraPosition = [0, 0, 5],
  fov = 75,
  showControls = true,
  autoRotate = false,
  controlsTarget,
  environment = 'city',
  ambientIntensity = 0.5,
  directionalLight,
  ...canvasProps
}: BaseSceneProps) {
  return (
    <StandardCanvas
      camera={{ position: cameraPosition, fov }}
      {...canvasProps}
    >
      {/* Environment */}
      <Environment preset={environment} />

      {/* Lighting */}
      <ambientLight intensity={ambientIntensity} />
      {directionalLight && (
        <directionalLight
          position={directionalLight.position}
          intensity={directionalLight.intensity}
          castShadow={directionalLight.castShadow}
        />
      )}

      {/* Controls */}
      {showControls && (
        <OrbitControls
          autoRotate={autoRotate}
          target={controlsTarget}
        />
      )}

      {/* Scene content */}
      {children}
    </StandardCanvas>
  )
}
