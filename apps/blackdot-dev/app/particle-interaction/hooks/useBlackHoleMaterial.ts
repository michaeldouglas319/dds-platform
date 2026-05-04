'use client'

/**
 * useBlackHoleMaterial Hook
 *
 * Manages the black hole shader material with configurable parameters
 * Supports real-time uniform updates
 */

import { useMemo, useRef, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import {
  DEFAULT_BLACK_HOLE_UNIFORMS,
  BlackHoleUniforms,
  advancedBlackHoleVertexShader,
  advancedBlackHoleFragmentShader,
} from './blackHoleShaders'

export interface BlackHoleMaterialConfig extends Partial<BlackHoleUniforms> {
  time?: number
}

export interface BlackHoleMaterial extends THREE.ShaderMaterial {
  uniforms: {
    accretionColor: THREE.Uniform
    diskInnerRadius: THREE.Uniform
    diskOuterRadius: THREE.Uniform
    diskIntensity: THREE.Uniform
    diskGlow: THREE.Uniform
    eventHorizonRadius: THREE.Uniform
    power: THREE.Uniform
    emissionIntensity: THREE.Uniform
    time: THREE.Uniform
    [key: string]: any
  }
}

/**
 * Hook for creating and managing black hole material
 */
export function useBlackHoleMaterial(config: BlackHoleMaterialConfig = {}) {
  const materialRef = useRef<BlackHoleMaterial | null>(null)
  const uniformsRef = useRef<Record<string, THREE.Uniform>>({})

  // Merge config with defaults
  const finalConfig = useMemo(
    () => ({
      ...DEFAULT_BLACK_HOLE_UNIFORMS,
      ...config,
    }),
    [config]
  )

  // Create material and uniforms
  const material = useMemo(() => {
    // Create uniforms
    const uniforms = {
      accretionColor: new THREE.Uniform(finalConfig.accretionColor),
      diskInnerRadius: new THREE.Uniform(finalConfig.diskInnerRadius),
      diskOuterRadius: new THREE.Uniform(finalConfig.diskOuterRadius),
      diskIntensity: new THREE.Uniform(finalConfig.diskIntensity),
      diskGlow: new THREE.Uniform(finalConfig.diskGlow),
      eventHorizonRadius: new THREE.Uniform(finalConfig.eventHorizonRadius),
      power: new THREE.Uniform(finalConfig.power),
      emissionIntensity: new THREE.Uniform(finalConfig.emissionIntensity),
      time: new THREE.Uniform(0),
    }

    uniformsRef.current = uniforms

    // Create shader material
    const mat = new THREE.ShaderMaterial({
      vertexShader: advancedBlackHoleVertexShader,
      fragmentShader: advancedBlackHoleFragmentShader,
      uniforms,
      transparent: true,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }) as BlackHoleMaterial

    materialRef.current = mat
    return mat
  }, [finalConfig])

  // Update uniform value
  const setUniform = useCallback((key: string, value: any) => {
    if (uniformsRef.current[key]) {
      uniformsRef.current[key].value = value
    }
  }, [])

  // Update multiple uniforms
  const setUniforms = useCallback((updates: Partial<BlackHoleUniforms>) => {
    Object.entries(updates).forEach(([key, value]) => {
      setUniform(key, value)
    })
  }, [setUniform])

  // Get uniform value
  const getUniform = useCallback((key: string) => {
    return uniformsRef.current[key]?.value
  }, [])

  return {
    material,
    setUniform,
    setUniforms,
    getUniform,
    uniforms: uniformsRef.current,
  }
}

/**
 * Hook for time-based uniform updates
 */
export function useBlackHoleAnimation(
  material: BlackHoleMaterial | null,
  animationConfig?: {
    rotationSpeed?: number
    emissionPulse?: boolean
    pulseSpeed?: number
  }
) {
  const timeRef = useRef(0)

  useEffect(() => {
    if (!material || !animationConfig) return

    const animate = (deltaTime: number) => {
      timeRef.current += deltaTime

      if (animationConfig.emissionPulse) {
        const pulse = Math.sin(timeRef.current * (animationConfig.pulseSpeed || 1)) * 0.5 + 0.5
        const emission = (material.uniforms as any).rampEmission
        if (emission) {
          emission.value = 2.0 * pulse + 1.0
        }
      }
    }

    // This would be called from useFrame in R3F
    return () => {
      timeRef.current = 0
    }
  }, [material, animationConfig])
}

/**
 * Hook for creating multiple material instances
 */
export function useBlackHoleMaterials(count: number, configs: BlackHoleMaterialConfig[] = []) {
  const materials = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const { material } = useBlackHoleMaterial(configs[i] || {})
        return material
      }),
    [count, configs]
  )

  return materials
}
