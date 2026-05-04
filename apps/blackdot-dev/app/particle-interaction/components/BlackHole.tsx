'use client'

/**
 * BlackHole Component for React Three Fiber
 *
 * Renders a volumetric black hole effect with configurable parameters
 * Based on MisterPrada/singularity raymarching technique
 *
 * @usage
 * ```tsx
 * <BlackHole
 *   scale={2}
 *   power={0.3}
 *   colors={{ inner: '#000000', middle: '#8B0503', outer: '#F2B640' }}
 * />
 * ```
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useBlackHoleMaterial, BlackHoleMaterialConfig } from '../hooks/useBlackHoleMaterial'

export interface BlackHoleProps {
  /** Scale of the black hole sphere */
  scale?: number | [number, number, number]

  /** Position in 3D space */
  position?: [number, number, number]

  /** Rotation in radians */
  rotation?: [number, number, number]

  /** Black hole accretion disk color */
  accretionColor?: string | THREE.Color

  /** Disk inner radius */
  diskInnerRadius?: number

  /** Disk outer radius */
  diskOuterRadius?: number

  /** Disk intensity multiplier */
  diskIntensity?: number

  /** Disk glow falloff */
  diskGlow?: number

  /** Event horizon radius */
  eventHorizonRadius?: number

  /** Emission intensity */
  emissionIntensity?: number

  /** Power curve exponent */
  power?: number

  /** Custom geometry segments */
  segments?: number

  /** Callback when material is ready */
  onReady?: (material: THREE.ShaderMaterial) => void

  /** Debug mode - shows uniform values */
  debug?: boolean
}

/**
 * BlackHole Component - Advanced realistic black hole with accretion disk
 */
export function BlackHole({
  scale = 2.0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  accretionColor,
  diskInnerRadius = 0.3,
  diskOuterRadius = 1.2,
  diskIntensity = 3.0,
  diskGlow = 2.5,
  eventHorizonRadius = 0.15,
  emissionIntensity = 4.0,
  power = 2.0,
  segments = 64,
  onReady,
  debug = false,
  ...materialConfig
}: BlackHoleProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  // Parse accretion color
  const parsedAccretionColor = useMemo(() => {
    if (accretionColor instanceof THREE.Color) return accretionColor
    if (typeof accretionColor === 'string') return new THREE.Color(accretionColor)
    return new THREE.Color(1.0, 0.6, 0.1) // Default orange/gold
  }, [accretionColor])

  // Create material with configuration
  const { material, setUniform, setUniforms, uniforms } = useBlackHoleMaterial({
    power,
    diskInnerRadius,
    diskOuterRadius,
    diskIntensity,
    diskGlow,
    eventHorizonRadius,
    accretionColor: parsedAccretionColor,
    emissionIntensity,
    ...materialConfig,
  })

  // Notify when ready
  useEffect(() => {
    if (onReady && material) {
      onReady(material)
    }
  }, [material, onReady])

  // Animation loop - update time uniform for shader animation
  useFrame((state, deltaTime) => {
    if (!meshRef.current) return

    timeRef.current += deltaTime

    // Update time uniform for shader
    setUniform('time', timeRef.current)

    // Debug logging
    if (debug && timeRef.current % 1 < deltaTime) {
      console.log('BlackHole Uniforms:', {
        diskIntensity: uniforms.diskIntensity?.value,
        eventHorizonRadius: uniforms.eventHorizonRadius?.value,
        time: timeRef.current,
      })
    }
  })

  // Create geometry
  const geometry = useMemo(
    () => new THREE.SphereGeometry(1, segments, segments),
    [segments]
  )

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        scale={scale}
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
    </group>
  )
}

/**
 * Example usage with typical configuration
 * Can be used as a reference for integrating BlackHole into your scene
 */
export function BlackHoleExample() {
  return (
    <BlackHole
      scale={2.0}
      accretionColor="#FFA500"
      diskInnerRadius={0.3}
      diskOuterRadius={1.2}
      diskIntensity={3.0}
      diskGlow={2.5}
      eventHorizonRadius={0.15}
      emissionIntensity={4.0}
      power={2.0}
      debug={false}
    />
  )
}
