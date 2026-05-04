'use client'

import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import React, { useRef, useState } from 'react'
import * as THREE from 'three'

interface AircraftModelProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  onClick?: () => void
  onHover?: (hovered: boolean) => void
}

/**
 * Interactive aircraft model with hover effects and rotation
 * Uses aircraft_presentation_cover.glb from assets
 */
export function AircraftModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  onHover,
}: AircraftModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Load GLTF model
  const { scene } = useGLTF('/assets/models/aircraft_presentation_cover.glb')

  // Clone scene to avoid reusing same instance
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone()
    // Simplify materials for better performance
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  // Animation loop
  useFrame(() => {
    if (!groupRef.current) return

    // Gentle base rotation
    groupRef.current.rotation.y += 0.001

    // Hover scale effect
    if (isHovered) {
      groupRef.current.scale.lerp(
        new THREE.Vector3(1.3, 1.3, 1.3),
        0.05
      )
    } else {
      const targetScale = typeof scale === 'number' ? scale : 1
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.05
      )
    }

    // Floating animation
    groupRef.current.position.y = (position[1] || 0) + Math.sin(Date.now() * 0.001) * 0.3
  })

  const handlePointerEnter = () => {
    setIsHovered(true)
    onHover?.(true)
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
    onHover?.(false)
  }

  const handleClick = () => {
    onClick?.()
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

// Preload the model
useGLTF.preload('/assets/models/aircraft_presentation_cover.glb')
