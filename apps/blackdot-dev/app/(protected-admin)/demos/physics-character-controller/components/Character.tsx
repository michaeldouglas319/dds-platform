'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider, RigidBodyApi } from '@react-three/rapier'
import * as THREE from 'three'
import { useKeyboardControls } from '../hooks/useKeyboardControls'

// Type for Rapier RigidBody
interface RapierRigidBody {
  translation(): { x: number; y: number; z: number }
  linvel(): { x: number; y: number; z: number }
  setLinvel(
    velocity: { x: number; y: number; z: number },
    wakeUp: boolean
  ): void
}

interface CharacterProps {
  gravity: number
  bounce: number
  maxSpeed: number
  acceleration: number
  jumpForce: number
}

export function Character({
  gravity,
  bounce,
  maxSpeed,
  acceleration,
  jumpForce,
}: CharacterProps) {
  const bodyRef = useRef<RigidBodyApi>(null)
  const keysRef = useKeyboardControls()
  const jumpCooldownRef = useRef(0)
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))

  // Update jump cooldown in useFrame
  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body) return

    // Decrease jump cooldown
    jumpCooldownRef.current = Math.max(0, jumpCooldownRef.current - delta)

    // Get current body state
    const position = body.translation()
    const currentVelocity = body.linvel()

    // Ground detection (simplified - check if close to ground)
    const isGrounded = position.y < 0.1

    // Calculate movement direction from keyboard input
    const moveDirection = new THREE.Vector3()

    if (keysRef.current.forward) moveDirection.z -= 1
    if (keysRef.current.backward) moveDirection.z += 1
    if (keysRef.current.left) moveDirection.x -= 1
    if (keysRef.current.right) moveDirection.x += 1

    // Normalize to prevent diagonal speed boost
    if (moveDirection.length() > 0) moveDirection.normalize()

    // Calculate target velocity
    const targetVelocityX = moveDirection.x * maxSpeed
    const targetVelocityZ = moveDirection.z * maxSpeed

    // Lerp current velocity to target velocity for smooth acceleration
    const newVelocityX = THREE.MathUtils.lerp(
      currentVelocity.x,
      targetVelocityX,
      acceleration * delta
    )
    const newVelocityZ = THREE.MathUtils.lerp(
      currentVelocity.z,
      targetVelocityZ,
      acceleration * delta
    )

    // Handle jumping
    let newVelocityY = currentVelocity.y

    if (keysRef.current.jump && isGrounded && jumpCooldownRef.current === 0) {
      newVelocityY = jumpForce
      jumpCooldownRef.current = 0.3 // 300ms cooldown
    }

    // Apply velocity
    body.setLinvel(
      { x: newVelocityX, y: newVelocityY, z: newVelocityZ },
      true
    )

    // Store velocity for reference
    velocityRef.current.set(newVelocityX, newVelocityY, newVelocityZ)
  })

  return (
    <RigidBody
      ref={bodyRef}
      position={[0, 3, 0]}
      lockRotations
      gravityScale={gravity / 9.81}
      restitution={bounce}
      friction={0.5}
      linearDamping={0.5}
      angularDamping={1}
    >
      {/* Capsule collider for player collision */}
      <CapsuleCollider args={[0.9, 0.5]} />

      {/* Visual representation */}
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1.8, 4, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </RigidBody>
  )
}
