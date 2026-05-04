'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PhysicsDebugInfo } from '../lib/physicsUtils'
import {
  CharacterAnimationMixer,
  ensureAllAnimationsExist,
} from '../lib/animationUtils'

interface CharacterModelProps {
  model?: THREE.Object3D
  debugInfo?: PhysicsDebugInfo
  scale?: number
}

/**
 * Animated character model component
 *
 * Manages skeleton animations, state transitions, and synchronization
 * with physics body. When a model is provided, it handles animations
 * and state transitions. When no model is provided, uses placeholder
 * from parent Character component.
 *
 * @param model - Optional loaded 3D model with skeleton
 * @param debugInfo - Physics debug info for animation state updates
 * @param scale - Model scale factor
 */
export function CharacterModel({
  model,
  debugInfo,
  scale = 1,
}: CharacterModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<CharacterAnimationMixer | null>(null)

  // Initialize animation mixer only for external models
  useEffect(() => {
    if (!model || !groupRef.current) return

    // Create animation mixer for external model
    const mixer = new CharacterAnimationMixer(model, 0.3)

    // Get or create animations
    const animationMap = ensureAllAnimationsExist(new Map())

    // Add all animations to mixer
    for (const [state, clip] of animationMap) {
      mixer.addAnimation(state, clip)
    }

    // Start with idle animation
    const idleClip = mixer.animations.get(mixer.currentState)
    if (idleClip) {
      mixer.transitionTo(mixer.currentState)
    }

    mixerRef.current = mixer

    return () => {
      mixer.dispose()
    }
  }, [model])

  // Update animations based on physics state
  useFrame((_, delta) => {
    if (!mixerRef.current || !debugInfo) return

    // Transition animation if state changed
    mixerRef.current.transitionTo(debugInfo.animationState)

    // Update mixer
    mixerRef.current.update(delta)
  })

  // If no external model, render nothing (Character component renders fallback)
  if (!model) {
    return null
  }

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={model} />
    </group>
  )
}
