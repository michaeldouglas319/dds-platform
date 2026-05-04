/**
 * Hover Morph Demo
 *
 * Demonstrates hover-triggered morphing with reverse animation.
 * Morphs expand on hover and return to original state on leave.
 */

'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { BoxGeometry, SphereGeometry, ConeGeometry } from 'three'
import { MorphModel } from '../MorphModel'
import { MorphTransition } from '../MorphTransition'
import { generateInflateMorph, generateWaveMorph } from '../generators'
import { useMemo } from 'react'

function HoverCube({ position }: { position: [number, number, number] }) {
  const geometry = useMemo(() => new BoxGeometry(1.5, 1.5, 1.5, 24, 24, 24), [])

  const morphTargets = useMemo(
    () => [
      generateInflateMorph(geometry, 'inflate', 0.6),
      generateWaveMorph(geometry, 'wave', 0.3, 4.0),
    ],
    [geometry]
  )

  const states = useMemo(
    () => [
      { name: 'normal', influences: { 0: 0, 1: 0 } },
      { name: 'inflated', influences: { 0: 1, 1: 0.5 } },
    ],
    []
  )

  return (
    <group position={position}>
      <MorphTransition
        states={states}
        trigger="hover"
        reverseOnSecondTrigger={true}
        animation={{ targetInfluence: 1, duration: 0.6, easing: 'power2.out' }}
      >
        {({ morphRef }) => (
          <MorphModel ref={morphRef} morphTargets={morphTargets}>
            <mesh geometry={geometry}>
              <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.3} />
            </mesh>
          </MorphModel>
        )}
      </MorphTransition>

      <Text position={[0, -1.5, 0]} fontSize={0.2} color="white" anchorX="center">
        Cube
      </Text>
    </group>
  )
}

function HoverSphere({ position }: { position: [number, number, number] }) {
  const geometry = useMemo(() => new SphereGeometry(0.8, 32, 32), [])

  const morphTargets = useMemo(
    () => [generateInflateMorph(geometry, 'inflate', 0.8)],
    [geometry]
  )

  const states = useMemo(
    () => [
      { name: 'normal', influences: { 0: 0 } },
      { name: 'puffed', influences: { 0: 1 } },
    ],
    []
  )

  return (
    <group position={position}>
      <MorphTransition
        states={states}
        trigger="hover"
        reverseOnSecondTrigger={true}
        animation={{ targetInfluence: 1, duration: 0.5, easing: 'back.out(1.4)' }}
      >
        {({ morphRef }) => (
          <MorphModel ref={morphRef} morphTargets={morphTargets}>
            <mesh geometry={geometry}>
              <meshStandardMaterial color="#8b5cf6" metalness={0.3} roughness={0.4} />
            </mesh>
          </MorphModel>
        )}
      </MorphTransition>

      <Text position={[0, -1.5, 0]} fontSize={0.2} color="white" anchorX="center">
        Sphere
      </Text>
    </group>
  )
}

function HoverCone({ position }: { position: [number, number, number] }) {
  const geometry = useMemo(() => new ConeGeometry(0.8, 1.6, 32, 24), [])

  const morphTargets = useMemo(
    () => [generateWaveMorph(geometry, 'wave', 0.5, 5.0, 'y')],
    [geometry]
  )

  const states = useMemo(
    () => [
      { name: 'normal', influences: { 0: 0 } },
      { name: 'wavy', influences: { 0: 1 } },
    ],
    []
  )

  return (
    <group position={position}>
      <MorphTransition
        states={states}
        trigger="hover"
        reverseOnSecondTrigger={true}
        animation={{ targetInfluence: 1, duration: 0.7, easing: 'elastic.out(1, 0.5)' }}
      >
        {({ morphRef }) => (
          <MorphModel ref={morphRef} morphTargets={morphTargets}>
            <mesh geometry={geometry}>
              <meshStandardMaterial color="#10b981" metalness={0.4} roughness={0.3} />
            </mesh>
          </MorphModel>
        )}
      </MorphTransition>

      <Text position={[0, -1.5, 0]} fontSize={0.2} color="white" anchorX="center">
        Cone
      </Text>
    </group>
  )
}

export default function HoverMorphDemo() {
  return (
    <div className="h-screen w-full bg-gradient-to-b from-gray-900 to-black">
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#60a5fa" />

        {/* Hover Shapes */}
        <HoverCube position={[-3, 0, 0]} />
        <HoverSphere position={[0, 0, 0]} />
        <HoverCone position={[3, 0, 0]} />

        {/* Title */}
        <Text position={[0, 3, 0]} fontSize={0.5} color="white" anchorX="center">
          Hover to Morph
        </Text>

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Environment */}
        <gridHelper args={[12, 12, '#333', '#111']} position={[0, -2, 0]} />
      </Canvas>

      {/* Instructions */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg bg-black/70 px-6 py-3 text-white backdrop-blur">
        <p className="text-center text-sm">Hover over shapes to see morphing effects</p>
      </div>
    </div>
  )
}
