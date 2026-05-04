'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'

import {
  ModelTransitionProps,
  TransitionEffect,
  EffectExecutionParams
} from './types'
import { effectRegistry } from './effectRegistry'

/**
 * ModelTransition Component
 *
 * A modular, plugin-based transition system for React Three Fiber that allows
 * composing multiple effects with independent timing controls.
 *
 * Features:
 * - Config-based or component-based effect API
 * - Support for click, hover, and manual triggers
 * - External timeline control for advanced use cases
 * - Full TypeScript support
 * - Automatic model visibility toggling
 *
 * @example
 * ```typescript
 * <ModelTransition
 *   beforeModel={<Building />}
 *   afterModel={<BuildingFragments />}
 *   trigger="click"
 *   effects={[
 *     { type: 'fade', duration: 0.5, target: 'before' },
 *     { type: 'camera', duration: 1.5, from: [0,0,20], to: [-10,10,20] },
 *     { type: 'scale', duration: 0.8, from: 1, to: 0, target: 'after' }
 *   ]}
 * />
 * ```
 *
 * @category 3d
 * @layer 2
 */

interface InitialState {
  beforeModel: {
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
    materials: Map<THREE.Mesh, { transparent: boolean; opacity: number }>
  }
  afterModel: {
    position: THREE.Vector3
    rotation: THREE.Euler
    scale: THREE.Vector3
    materials: Map<THREE.Mesh, { transparent: boolean; opacity: number }>
  }
  camera?: {
    position: THREE.Vector3
    target: THREE.Vector3
  }
}

export function ModelTransition({
  beforeModel,
  afterModel,
  trigger = 'click',
  isActive: externalIsActive,
  reverseOnSecondClick = false,
  enableHover = true,
  effects = [],
  children,
  onTransitionStart,
  onTransitionComplete,
  onEffectStart,
  onEffectComplete,
  timeline: externalTimeline
}: ModelTransitionProps) {
  const [internalIsActive, setInternalIsActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()

  // Refs for model groups
  const beforeGroupRef = useRef<THREE.Group>(null)
  const afterGroupRef = useRef<THREE.Group>(null)

  // GSAP timeline
  const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null)

  // Store initial state for restoration
  const initialState = useRef<InitialState | null>(null)

  // Use external state if provided (manual mode), otherwise internal
  const isActive =
    trigger === 'manual' ? (externalIsActive ?? false) : internalIsActive

  // Update cursor when hovering on interactive model
  const shouldShowPointer = enableHover && hovered && !isActive
  useCursor(shouldShowPointer)

  // Parse effect children (Component-based API)
  const effectConfigs = useMemo(() => {
    if (effects.length > 0) return effects

    // Extract effect configs from children
    const childEffects: TransitionEffect[] = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type) {
        const effectType = (child.type as any).effectType
        if (effectType) {
          childEffects.push({
            type: effectType,
            ...(child.props as any)
          })
        }
      }
    })

    return childEffects
  }, [effects, children])

  // Capture initial state once on mount
  useEffect(() => {
    if (!beforeGroupRef.current || !afterGroupRef.current || initialState.current) {
      return
    }

    const captureModelState = (group: THREE.Group) => {
      const materials = new Map<THREE.Mesh, { transparent: boolean; opacity: number }>()
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.Material
          materials.set(child, {
            transparent: mat.transparent,
            opacity: mat.opacity
          })
        }
      })
      return {
        position: group.position.clone(),
        rotation: new THREE.Euler(group.rotation.x, group.rotation.y, group.rotation.z),
        scale: group.scale.clone(),
        materials
      }
    }

    initialState.current = {
      beforeModel: captureModelState(beforeGroupRef.current),
      afterModel: captureModelState(afterGroupRef.current),
      camera: camera
        ? {
            position: camera.position.clone(),
            target: new THREE.Vector3(0, 0, 0)
          }
        : undefined
    }
  }, [camera])

  // Build and execute transition timeline (ONLY when effects or config changes, not on isActive)
  useEffect(() => {
    if (!beforeGroupRef.current || !afterGroupRef.current || !initialState.current) {
      return
    }

    // Reset models to initial state before building timeline
    const resetToInitialState = () => {
      if (!initialState.current) return

      const { beforeModel: beforeState, afterModel: afterState } = initialState.current

      if (beforeGroupRef.current) {
        beforeGroupRef.current.position.copy(beforeState.position)
        beforeGroupRef.current.rotation.set(
          beforeState.rotation.x,
          beforeState.rotation.y,
          beforeState.rotation.z
        )
        beforeGroupRef.current.scale.copy(beforeState.scale)

        beforeGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && beforeState.materials.has(child)) {
            const original = beforeState.materials.get(child)!
            const mat = child.material as THREE.Material
            mat.transparent = original.transparent
            ;(mat as any).opacity = original.opacity
          }
        })
      }

      if (afterGroupRef.current) {
        afterGroupRef.current.position.copy(afterState.position)
        afterGroupRef.current.rotation.set(
          afterState.rotation.x,
          afterState.rotation.y,
          afterState.rotation.z
        )
        afterGroupRef.current.scale.copy(afterState.scale)

        afterGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh && afterState.materials.has(child)) {
            const original = afterState.materials.get(child)!
            const mat = child.material as THREE.Material
            mat.transparent = original.transparent
            ;(mat as any).opacity = original.opacity
          }
        })
      }

      if (initialState.current.camera && camera) {
        camera.position.copy(initialState.current.camera.position)
      }
    }

    // Reset state before rebuilding timeline
    resetToInitialState()

    // Create or use external timeline
    const tl = externalTimeline
      ? externalTimeline
      : gsap.timeline({
          paused: true,
          onStart: onTransitionStart,
          onComplete: onTransitionComplete
        })

    timelineRef.current = tl

    // Execute each effect on the timeline
    effectConfigs.forEach((effectConfig) => {
      const params: EffectExecutionParams = {
        timeline: tl,
        beforeModel: beforeGroupRef.current!,
        afterModel: afterGroupRef.current!,
        camera,
        config: effectConfig
      }

      effectRegistry.executeEffect(effectConfig.type, params)
    })

    return () => {
      // Don't kill external timeline
      if (!externalTimeline && tl) {
        tl.kill()
      }
    }
  }, [effectConfigs, camera, externalTimeline])

  // Play/reverse timeline when isActive changes (SEPARATE from construction)
  useEffect(() => {
    if (!timelineRef.current) return

    if (trigger === 'manual') {
      if (isActive) {
        timelineRef.current.restart()
      } else if (reverseOnSecondClick) {
        timelineRef.current.reverse()
      }
    }
  }, [isActive, trigger, reverseOnSecondClick])

  // Initialize models with proper starting states for effects
  useEffect(() => {
    if (!beforeGroupRef.current || !afterGroupRef.current) return

    // Set up initial opacity so fade effects work
    beforeGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as any
        mat.transparent = true
        if (mat.opacity === undefined || mat.opacity === 0) {
          mat.opacity = 1
        }
      }
    })

    afterGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as any
        mat.transparent = true
        if (mat.opacity === undefined) {
          mat.opacity = 0
        }
      }
    })
  }, [])

  const handleClick = () => {
    if (trigger !== 'click') return

    if (reverseOnSecondClick) {
      setInternalIsActive((prev) => !prev)
    } else {
      setInternalIsActive(true)
    }
  }

  const handlePointerOver = () => {
    if (!enableHover) return

    setHovered(true)
    if (trigger === 'hover') {
      setInternalIsActive(true)
    }
  }

  const handlePointerOut = () => {
    setHovered(false)
    if (trigger === 'hover') {
      setInternalIsActive(false)
    }
  }

  return (
    <>
      {/* Before model - always visible, effects control opacity */}
      <group
        ref={beforeGroupRef}
        onClick={!isActive ? handleClick : undefined}
        onPointerOver={!isActive ? handlePointerOver : undefined}
        onPointerOut={!isActive ? handlePointerOut : undefined}
      >
        {React.isValidElement(beforeModel)
          ? React.cloneElement(beforeModel as React.ReactElement, {} as any)
          : beforeModel}
      </group>

      {/* After model - always visible, effects control opacity */}
      <group ref={afterGroupRef}>
        {React.isValidElement(afterModel)
          ? React.cloneElement(afterModel as React.ReactElement, {
              playAnimations: isActive
            } as any)
          : afterModel}
      </group>
    </>
  )
}
