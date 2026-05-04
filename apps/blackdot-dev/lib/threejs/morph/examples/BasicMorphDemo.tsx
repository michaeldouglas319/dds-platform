/**
 * Basic Morph Demo
 *
 * Demonstrates the morph system with a simple click-through example.
 * Shows spherify, twist, and wave morphs on a cube.
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { BoxGeometry } from 'three'
import { MorphModel } from '../MorphModel'
import { MorphTransition } from '../MorphTransition'
import {
  generateSpherifyMorph,
  generateTwistMorph,
  generateWaveMorph,
} from '../generators'
import { useMemo } from 'react'

export default function BasicMorphDemo() {
  // Create geometry with enough subdivisions for smooth morphing
  const geometry = useMemo(() => new BoxGeometry(2, 2, 2, 32, 32, 32), [])

  // Generate morph targets
  const morphTargets = useMemo(
    () => [
      generateSpherifyMorph(geometry, 'spherify', 1.0),
      generateTwistMorph(geometry, 'twist', 0.5, 'y'),
      generateWaveMorph(geometry, 'wave', 0.4, 3.0, 'y'),
    ],
    [geometry]
  )

  // Define morph states
  const states = useMemo(
    () => [
      { name: 'Cube', influences: { 0: 0, 1: 0, 2: 0 } },
      { name: 'Sphere', influences: { 0: 1, 1: 0, 2: 0 } },
      { name: 'Twisted', influences: { 0: 0, 1: 1, 2: 0 } },
      { name: 'Wavy', influences: { 0: 0, 1: 0, 2: 1 } },
      { name: 'Mixed', influences: { 0: 0.5, 1: 0.3, 2: 0.2 } },
    ],
    []
  )

  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        {/* Morph System */}
        <MorphTransition
          states={states}
          trigger="click"
          loop={true}
          animation={{
            targetInfluence: 1,
            duration: 1.2,
            easing: 'power2.inOut',
          }}
        >
          {({ morphRef, currentState }) => (
            <>
              <MorphModel ref={morphRef} morphTargets={morphTargets} computeNormals={true}>
                <mesh geometry={geometry}>
                  <meshStandardMaterial
                    color="#60a5fa"
                    metalness={0.3}
                    roughness={0.4}
                  />
                </mesh>
              </MorphModel>

              {/* State Label */}
              <Html position={[0, 3, 0]} center>
                <div className="rounded-lg bg-black/80 px-4 py-2 text-white">
                  <p className="text-sm">Click to morph</p>
                  <p className="text-lg font-bold">{states[currentState].name}</p>
                </div>
              </Html>
            </>
          )}
        </MorphTransition>

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={15}
        />

        {/* Grid Helper */}
        <gridHelper args={[10, 10, '#444', '#222']} />
      </Canvas>

      {/* Instructions */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg bg-black/60 px-6 py-3 text-white backdrop-blur-sm">
        <p className="text-center text-sm">
          Click the cube to cycle through morph states
        </p>
        <p className="text-center text-xs opacity-70">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  )
}
