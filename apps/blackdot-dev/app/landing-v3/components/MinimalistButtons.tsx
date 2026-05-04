'use client'

import { useFrame } from '@react-three/fiber'
import React, { useRef, useState } from 'react'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'

interface ButtonProps {
  label: string
  position: [number, number, number]
  onClick?: () => void
  href?: string
}

/**
 * 3D button with hover effects
 */
function Button3D({ label, position, onClick, href }: ButtonProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  useFrame(() => {
    if (!groupRef.current) return

    // Hover animation
    const targetScale = isHovered ? 1.15 : 1.0
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1)

    // Subtle floating
    groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.1
  })

  const handleClick = () => {
    if (href) {
      router.push(href)
    }
    onClick?.()
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Button background */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshStandardMaterial
          color={isHovered ? '#4ECDC4' : '#2A2A3E'}
          metalness={0.3}
          roughness={0.4}
          emissive={isHovered ? '#4ECDC4' : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>

      {/* Simple text canvas texture - avoids font loading issues */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.0, 0.3]} />
        <meshStandardMaterial map={createTextTexture(label, isHovered)} />
      </mesh>
    </group>
  )
}

/**
 * Create a canvas texture with text
 */
function createTextTexture(text: string, isHovered: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = 'transparent'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Text
  ctx.fillStyle = isHovered ? '#000000' : '#FFFFFF'
  ctx.font = 'bold 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

/**
 * Minimalist button group positioned below the aircraft
 */
export function MinimalistButtons() {
  const buttons: ButtonProps[] = [
    { label: 'About', href: '/about', position: [-1.8, -5, 0] },
    { label: 'Projects', href: '/dashboard', position: [0, -5, 0] },
    { label: 'Contact', href: '/business', position: [1.8, -5, 0] },
  ]

  return (
    <group>
      {buttons.map((btn) => (
        <Button3D key={btn.label} {...btn} />
      ))}
    </group>
  )
}
