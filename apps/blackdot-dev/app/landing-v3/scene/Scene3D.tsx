'use client'

import { Canvas } from '@react-three/fiber'
import { CameraControls, Stars } from '@react-three/drei'
import { useState, useEffect } from 'react'
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary'
import { AircraftModel } from './AircraftModel'

interface Scene3DProps {
  cameraPos: [number, number, number]
  cameraFov?: number
  backgroundColor: string
}

export function Scene3D({
  cameraPos,
  cameraFov = 50,
  backgroundColor,
}: Scene3DProps) {
  // Canvas dpr state (for hydration safety)
  const [dpr, setDpr] = useState<[number, number]>([1, 1])

  // Set canvas dpr after hydration
  useEffect(() => {
    if (typeof window === 'undefined') return
    const actualDPR = Math.min(window.devicePixelRatio, 1.5)
    setDpr([1, actualDPR])
  }, [])

  return (
    <SceneErrorBoundary>
      <Canvas
        dpr={dpr}
        camera={{ position: cameraPos, fov: cameraFov }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
          alpha: true,
          stencil: false,
          depth: true,
        }}
      >
        {backgroundColor === 'transparent' ? (
          <color attach="background" args={['#0a0a0a']} />
        ) : (
          <color attach="background" args={[backgroundColor]} />
        )}

        {/* Camera controls - locked to prevent unwanted movement */}
        <CameraControls
          makeDefault
          minAzimuthAngle={-0.4}
          maxAzimuthAngle={0.4}
          minPolarAngle={1.3}
          maxPolarAngle={1.9}
          minDistance={10}
          maxDistance={25}
        />

        {/* Minimal starfield - subtle */}
        <Stars count={5000} speed={0.3} radius={80} factor={0.8} saturation={0.6} fade={true} />

        {/* Lighting setup for aircraft */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[12, 18, 10]} intensity={1.0} castShadow />
        <directionalLight position={[-8, 12, -12]} intensity={0.4} />
        <pointLight position={[5, 8, 5]} intensity={0.6} />

        {/* Aircraft model - hero element */}
        <AircraftModel
          position={[0, 0, 0]}
          scale={1.3}
          rotation={[0, 0, 0]}
        />
      </Canvas>
    </SceneErrorBoundary>
  )
}
