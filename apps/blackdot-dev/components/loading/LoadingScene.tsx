'use client'

import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { NeuralNetwork } from '@/components/three/models/NeuralNetwork'
import { NetworkRef } from '@/app/landing/types/network.types'
import * as THREE from 'three'

interface LoadingSceneProps {
  /** Sphere configuration */
  sphere?: {
    color?: string
    emissiveColor?: string
    emissiveIntensity?: number
    scale?: number
    position?: [number, number, number]
    pulseSpeed?: number
    pulseIntensity?: number
  }
  /** Neural network configuration */
  network?: {
    position?: [number, number, number]
    scale?: number
  }
  /** Camera configuration */
  camera?: {
    position?: [number, number, number]
    fov?: number
  }
  /** Lighting configuration */
  lighting?: {
    ambientIntensity?: number
    pointLightIntensity?: number
    pointLightColor?: string
  }
}

/**
 * Minimal loading scene with neural network and center sphere
 * Designed for loading overlays with clean, simple aesthetic
 */
function SceneContent({
  sphere = {},
  network = {},
  lighting = {}
}: Omit<LoadingSceneProps, 'camera'>) {
  const networkCollisionRef = useRef<NetworkRef | null>(null)
  const sphereRef = useRef<THREE.Mesh>(null)

  // Default configurations
  const sphereConfig = {
    color: sphere.color || '#3b82f6',
    emissiveColor: sphere.emissiveColor || '#3b82f6',
    emissiveIntensity: sphere.emissiveIntensity || 0.5,
    scale: sphere.scale || 0.3,
    position: sphere.position || [0, -0.09, 0] as [number, number, number],
    pulseSpeed: sphere.pulseSpeed || 2,
    pulseIntensity: sphere.pulseIntensity || 0.3,
  }

  const networkConfig = {
    position: network.position || [0, -0.09, 0] as [number, number, number],
    scale: network.scale || 1,
  }

  const lightingConfig = {
    ambientIntensity: lighting.ambientIntensity || 0.4,
    pointLightIntensity: lighting.pointLightIntensity || 1,
    pointLightColor: lighting.pointLightColor || '#ffffff',
  }

  // Animate sphere pulsing
  useFrame((state) => {
    if (sphereRef.current) {
      const time = state.clock.getElapsedTime()
      const pulse = Math.sin(time * sphereConfig.pulseSpeed) * sphereConfig.pulseIntensity
      const scale = sphereConfig.scale * (1 + pulse)
      sphereRef.current.scale.setScalar(scale)

      // Update emissive intensity with pulse
      const material = sphereRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = sphereConfig.emissiveIntensity * (1 + pulse * 0.5)
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={lightingConfig.ambientIntensity} />
      <pointLight
        position={[5, 5, 5]}
        intensity={lightingConfig.pointLightIntensity}
        color={lightingConfig.pointLightColor}
      />
      <pointLight
        position={[-5, -5, 5]}
        intensity={lightingConfig.pointLightIntensity * 0.5}
        color={lightingConfig.pointLightColor}
      />

      {/* Neural Network */}
      <group scale={networkConfig.scale}>
        <NeuralNetwork
          position={networkConfig.position}
          collisionRef={networkCollisionRef as React.RefObject<NetworkRef>}
        />
      </group>

      {/* Center Sphere */}
      <mesh ref={sphereRef} position={sphereConfig.position}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={sphereConfig.color}
          emissive={sphereConfig.emissiveColor}
          emissiveIntensity={sphereConfig.emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
    </>
  )
}

export function LoadingScene({
  sphere,
  network,
  camera = {},
  lighting,
}: LoadingSceneProps) {
  const cameraConfig = {
    position: camera.position || [0, 0, 8] as [number, number, number],
    fov: camera.fov || 50,
  }

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: cameraConfig.position,
          fov: cameraConfig.fov,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        <color attach="background" args={['transparent']} />
        <SceneContent
          sphere={sphere}
          network={network}
          lighting={lighting}
        />
      </Canvas>
    </div>
  )
}

// Import useFrame
import { useFrame } from '@react-three/fiber'
