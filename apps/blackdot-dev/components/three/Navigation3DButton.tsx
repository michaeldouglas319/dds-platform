'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

export interface Navigation3DButtonProps {
  id: string
  label: string
  path: string
  position: [number, number, number]
  onClick?: () => void
  color?: string
  hoverColor?: string
}

export function Navigation3DButton({
  id,
  label,
  path,
  position,
  onClick,
  color = '#3b82f6',
  hoverColor = '#60a5fa',
}: Navigation3DButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(() => {
    if (meshRef.current && materialRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.008
      materialRef.current.color.set(hovered ? hoverColor : color)
    }
  })

  return (
    <group position={position}>
      {/* 3D Cube Button */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Label Text */}
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
      >
        {label}
      </Text>
    </group>
  )
}
