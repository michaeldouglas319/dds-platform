'use client'

import { useState } from 'react'
import * as THREE from 'three'
import { PhysicsDebugInfo, AnimationState } from '../lib/physicsUtils'
import { Character } from './Character'
import { CharacterModel } from './CharacterModel'

interface AnimatedCharacterProps {
  gravity: number
  bounce: number
  maxSpeed: number
  acceleration: number
  jumpForce: number
  model?: THREE.Object3D
  showDebugCapsule?: boolean
  onDebugInfoChange?: (info: PhysicsDebugInfo) => void
}

/**
 * Complete animated character system
 *
 * Combines physics body, keyboard controls, and skeletal animations
 * into a single integrated component. Supports external rigged models
 * or falls back to placeholder capsule.
 */
export function AnimatedCharacter({
  gravity,
  bounce,
  maxSpeed,
  acceleration,
  jumpForce,
  model,
  showDebugCapsule = false,
  onDebugInfoChange,
}: AnimatedCharacterProps) {
  const [debugInfo, setDebugInfo] = useState<PhysicsDebugInfo>({
    isGrounded: false,
    velocity: { x: 0, y: 0, z: 0 },
    position: { x: 0, y: 0, z: 0 },
    rayHitDistance: null,
    animationState: AnimationState.Idle,
    moveInput: { x: 0, z: 0 },
  })

  const handlePhysicsUpdate = (info: PhysicsDebugInfo) => {
    setDebugInfo(info)
    onDebugInfoChange?.(info)
  }

  return (
    <>
      <Character
        gravity={gravity}
        bounce={bounce}
        maxSpeed={maxSpeed}
        acceleration={acceleration}
        jumpForce={jumpForce}
      />

      {/* Animated visual positioned at physics body location */}
      <CharacterModel
        model={model}
        debugInfo={debugInfo}
        scale={1}
      />

      {/* Optional debug capsule visualization */}
      {showDebugCapsule && (
        <mesh position={[0, 0, 0]} name="debug-capsule">
          <capsuleGeometry args={[0.5, 1.8, 4, 8]} />
          <meshBasicMaterial
            color="#ff00ff"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </>
  )
}
