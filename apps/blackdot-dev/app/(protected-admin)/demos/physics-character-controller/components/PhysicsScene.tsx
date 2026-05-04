'use client'

import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { OrbitControls, Grid } from '@react-three/drei'
import { Character } from './Character'

interface PhysicsSceneProps {
  gravity: number
  bounce: number
  maxSpeed: number
  acceleration: number
  jumpForce: number
}

export function PhysicsScene({
  gravity,
  bounce,
  maxSpeed,
  acceleration,
  jumpForce,
}: PhysicsSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 5, 8], fov: 75 }}
      shadows
      gl={{ antialias: true }}
    >
      <Physics gravity={[0, -gravity, 0]}>
        {/* Character controller */}
        <Character
          gravity={gravity}
          bounce={bounce}
          maxSpeed={maxSpeed}
          acceleration={acceleration}
          jumpForce={jumpForce}
        />

        {/* Ground plane */}
        <RigidBody type="fixed" position={[0, -2, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[20, 0.2, 20]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          <CuboidCollider args={[10, 0.1, 10]} />
        </RigidBody>
      </Physics>

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Scene helpers */}
      <Grid args={[20, 20]} cellSize={1} cellColor="#6f7280" sectionSize={5} />
      <OrbitControls makeDefault />
    </Canvas>
  )
}
