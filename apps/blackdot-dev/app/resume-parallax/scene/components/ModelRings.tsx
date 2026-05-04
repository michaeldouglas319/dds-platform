'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

interface ModelRingsProps {
  color: string
  position?: [number, number, number]
  scale?: number
}

/**
 * Model Rings Component
 *
 * Renders 3 concentric rotating torus rings around a 3D model.
 * Each ring rotates at different speeds to create dynamic visual effect.
 *
 * @category composite
 * @layer 2
 */
export function ModelRings({
  color,
  position = [0, 0, 0],
  scale = 1
}: ModelRingsProps) {
  const ring1Ref = useRef<Mesh>(null)
  const ring2Ref = useRef<Mesh>(null)
  const ring3Ref = useRef<Mesh>(null)

  // Animate rings with different rotation speeds
  useFrame((state, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.3
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.2
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Ring 1 - Innermost, fastest rotation */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.8, 0.03, 6, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Ring 2 - Middle, counter-rotating */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.1, 0.024, 6, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          wireframe={false}
        />
      </mesh>

      {/* Ring 3 - Outermost, slow rotation */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[1.4, 0.016, 6, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </mesh>
    </group>
  )
}
