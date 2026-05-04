'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { AttractorParticlesState } from '../hooks/useAttractorParticles'
import { V3Config } from '../config/attractors.config'

interface AttractorParticleRendererProps {
  config: V3Config
  particlesState: AttractorParticlesState
}

/**
 * GPU-instanced particle renderer
 * Follows curved-takeoff-orbit V3ParticleRenderer pattern
 */
export function AttractorParticleRenderer({
  config,
  particlesState,
}: AttractorParticleRendererProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    if (!meshRef.current) return

    // Initialize hidden particles
    const hiddenMatrix = new THREE.Matrix4()
    const zeroScale = new THREE.Vector3(0, 0, 0)

    for (let i = 0; i < config.particleCount; i++) {
      hiddenMatrix.compose(
        new THREE.Vector3(0, 0, 0),
        new THREE.Quaternion(),
        zeroScale
      )
      meshRef.current.setMatrixAt(i, hiddenMatrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  }, [config.particleCount])

  return (
    <instancedMesh
      ref={meshRef}
      args={[particlesState.geometry, particlesState.material as THREE.Material, config.particleCount]}
      frustumCulled={false}
    />
  )
}
