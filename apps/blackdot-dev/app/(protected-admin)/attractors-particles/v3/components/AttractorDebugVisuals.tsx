'use client'

import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { V3Config } from '../config/attractors.config'
import { AttractorsPhysicsState } from '../hooks/useAttractorsPhysics'

interface AttractorDebugVisualsProps {
  config: V3Config
  physics: AttractorsPhysicsState
  scene: THREE.Scene
}

/**
 * Debug visualization overlay for attractors and particles
 * Follows curved-takeoff-orbit V3DebugVisuals pattern
 */
export function AttractorDebugVisuals({
  config,
  physics,
  scene,
}: AttractorDebugVisualsProps) {
  const visualsRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    // Clean up previous visuals
    if (visualsRef.current) {
      scene.remove(visualsRef.current)
    }

    const visuals = new THREE.Group()
    visuals.name = 'debug-visuals'

    // Attractor zones (blue spheres)
    if (config.debug.showAttractorZones) {
      physics.positions.forEach((pos, i) => {
        const geometry = new THREE.SphereGeometry(2, 16, 16)
        const material = new THREE.MeshBasicMaterial({
          color: 0x0088ff,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.copy(pos)
        visuals.add(mesh)
      })
    }

    // Orbital bounds (green wireframe box)
    if (config.debug.showPhysicsBounds) {
      const halfExtent = config.particles.boundHalfExtent / 2
      const geometry = new THREE.BoxGeometry(
        halfExtent * 2,
        halfExtent * 2,
        halfExtent * 2
      )
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      })
      const mesh = new THREE.Mesh(geometry, material)
      visuals.add(mesh)
    }

    // Stage indicators (text-based, using helper spheres)
    if (config.debug.showStageIndicators) {
      const stageLabels = ['Attraction', 'Orbital', 'Dispersal']
      const colors = [0xff6600, 0x00ff00, 0xff00ff]

      stageLabels.forEach((label, i) => {
        const geometry = new THREE.SphereGeometry(0.3, 8, 8)
        const material = new THREE.MeshBasicMaterial({ color: colors[i] })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 5 + i * 2
        visuals.add(mesh)
      })
    }

    scene.add(visuals)
    visualsRef.current = visuals

    return () => {
      if (visualsRef.current) {
        scene.remove(visualsRef.current)
        visualsRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }
    }
  }, [config, physics.positions, scene])

  return null
}
