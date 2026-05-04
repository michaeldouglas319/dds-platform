"use client"

import type React from "react"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"
import { useRef } from "react"
import type { Group } from "three"

interface CanvasSceneProps {
  children?: React.ReactNode
  cameraPosition?: [number, number, number]
  showControls?: boolean
  autoRotate?: boolean
}

export function CanvasScene({
  children,
  cameraPosition = [0, 0, 5],
  showControls = true,
  autoRotate = true,
}: CanvasSceneProps) {
  return (
    <Canvas camera={{ position: cameraPosition, fov: 75 }} className="w-full h-full">
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {showControls && <OrbitControls autoRotate={autoRotate} />}

      {children}
    </Canvas>
  )
}

interface FloatingObjectProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  children: React.ReactNode
}

export function FloatingObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  children,
}: FloatingObjectProps) {
  const ref = useRef<Group>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.005
      ref.current.rotation.y += 0.01
    }
  })

  return (
    <Float position={position} rotation={rotation} scale={scale} ref={ref}>
      {children}
    </Float>
  )
}
