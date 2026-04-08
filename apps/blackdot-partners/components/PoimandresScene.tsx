'use client'

import { useRef } from 'react'
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber'
import { Environment, Text } from '@react-three/drei'
import type { Group, Mesh, PerspectiveCamera } from 'three'
import { MathUtils } from 'three'

type SphereProps = ThreeElements['mesh'] & {
  scale?: number
}

function Sphere({ scale = 1, position, ...props }: SphereProps) {
  return (
    <mesh receiveShadow castShadow position={position} scale={scale} {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="white" roughness={0.5} />
    </mesh>
  )
}

function Spheres() {
  const group = useRef<Group>(null)
  useFrame((state) => {
    if (!group.current) return
    group.current.position.x = MathUtils.lerp(
      group.current.position.x,
      state.pointer.x * 2,
      0.1,
    )
  })
  return (
    <group ref={group}>
      <Sphere position={[-40, 1, 10]} />
      <Sphere position={[-20, 10, -20]} scale={10} />
      <Sphere position={[40, 3, -4]} scale={3} />
      <Sphere position={[30, 0.75, 10]} scale={0.75} />
    </group>
  )
}

function BlackDot() {
  const ref = useRef<Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3
  })
  return (
    <mesh ref={ref} position={[0, 0, 0]} scale={0.8} castShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#000" roughness={0.3} />
    </mesh>
  )
}

function Zoom() {
  useFrame((state) => {
    const cam = state.camera as PerspectiveCamera
    cam.position.lerp({ x: state.pointer.x * 10, y: 0, z: 100 } as never, 0.1)
    cam.fov = MathUtils.lerp(cam.fov, 22, 0.1)
    cam.updateProjectionMatrix()
  })
  return null
}

export default function PoimandresScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 100], fov: 22 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#f0f0f0']} />
      <fog attach="fog" args={['#f0f0f0', 100, 150]} />
      <hemisphereLight intensity={0.2} />
      <ambientLight intensity={0.5} />
      <spotLight
        penumbra={1}
        angle={1}
        castShadow
        position={[10, 60, -5]}
        intensity={8}
      />
      <Spheres />
      <BlackDot />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 500]} />
        <shadowMaterial color="#251005" opacity={0.25} />
      </mesh>
      <Text position={[0, -2.5, -50]} fontSize={30} color="white">
        BlackDot
      </Text>
      <Environment preset="warehouse" />
      <Zoom />
    </Canvas>
  )
}
