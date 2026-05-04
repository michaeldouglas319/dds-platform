/**
 * MorphModel Component
 *
 * Wraps a 3D model and enables morph target animations.
 * Integrates with GSAP for smooth transitions and provides imperative controls.
 */

'use client'

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import { Mesh, BufferGeometry, Material } from 'three'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import { MorphModelProps, MorphControls, MorphAnimationConfig } from './types'

/**
 * MorphModel Component
 *
 * Apply morph targets to any 3D model with GSAP-powered animations
 *
 * @example
 * ```tsx
 * const morphTargets = [
 *   generateSpherifyMorph(geometry),
 *   generateTwistMorph(geometry)
 * ]
 *
 * <MorphModel
 *   morphTargets={morphTargets}
 *   initialInfluences={[0, 0]}
 *   ref={morphRef}
 * >
 *   <mesh geometry={geometry}>
 *     <meshStandardMaterial />
 *   </mesh>
 * </MorphModel>
 * ```
 */
export const MorphModel = forwardRef<MorphControls, MorphModelProps>(
  ({ children, morphTargets, initialInfluences = [], computeNormals = true }, ref) => {
    const groupRef = useRef<THREE.Group>(null)
    const meshRef = useRef<Mesh | null>(null)
    const influencesRef = useRef<number[]>([])
    const timelineRef = useRef<gsap.core.Timeline | null>(null)

    // Initialize morph targets on the mesh
    useEffect(() => {
      if (!groupRef.current) return

      // Find the first mesh in the group
      groupRef.current.traverse((child: THREE.Object3D) => {
        if (child instanceof Mesh && !meshRef.current) {
          meshRef.current = child as Mesh<BufferGeometry, Material>
        }
      })

      const mesh = meshRef.current
      if (!mesh || !mesh.geometry) {
        console.warn('MorphModel: No mesh found in children')
        return
      }

      const geometry = mesh.geometry as BufferGeometry

      // Apply morph targets to geometry
      if (!geometry.morphAttributes.position) {
        geometry.morphAttributes.position = []
      }

      // Set up morph target positions
      morphTargets.forEach((target, index) => {
        // Initialize morphAttributes if they don't exist
        if (!geometry.morphAttributes) {
          geometry.morphAttributes = {};
        }
        if (!geometry.morphAttributes.position) {
          geometry.morphAttributes.position = [];
        }

        const existingAttr = geometry.morphAttributes.position[index];
        if (!existingAttr || existingAttr.array !== target.positions) {
          geometry.morphAttributes.position[index] = new THREE.Float32BufferAttribute(
            target.positions,
            3
          );
        }

        // Set normals if provided
        if (target.normals) {
          if (!geometry.morphAttributes.normal) {
            geometry.morphAttributes.normal = [];
          }
          geometry.morphAttributes.normal[index] = new THREE.Float32BufferAttribute(
            target.normals,
            3
          );
        }
      })

      // Initialize influences
      if (!mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences = []
      }

      morphTargets.forEach((_, index) => {
        const initialValue = initialInfluences[index] ?? 0
        mesh.morphTargetInfluences![index] = initialValue
        influencesRef.current[index] = initialValue
      })

      // Update geometry
      geometry.attributes.position.needsUpdate = true
      if (computeNormals) {
        geometry.computeVertexNormals()
      }
    }, [morphTargets, initialInfluences, computeNormals])

    // Sync influences with ref for GSAP
    useFrame(() => {
      const mesh = meshRef.current
      if (!mesh?.morphTargetInfluences) return

      // Update mesh from ref (driven by GSAP)
      influencesRef.current.forEach((value, index) => {
        if (mesh.morphTargetInfluences![index] !== value) {
          mesh.morphTargetInfluences![index] = value
        }
      })

      // Mark geometry for update if changed
      if (mesh.geometry && computeNormals) {
        mesh.geometry.attributes.position.needsUpdate = true
        mesh.geometry.computeVertexNormals()
      }
    })

    // Imperative API
    useImperativeHandle(ref, () => ({
      setInfluence: (index: number, value: number, animate = false) => {
        if (index < 0 || index >= influencesRef.current.length) {
          console.warn(`MorphModel: Invalid morph index ${index}`)
          return
        }

        if (animate) {
          // Kill existing timeline
          if (timelineRef.current) {
            timelineRef.current.kill()
          }

          // Create animation
          timelineRef.current = gsap.timeline()
          timelineRef.current.to(influencesRef.current, {
            [index]: value,
            duration: 0.5,
            ease: 'power2.inOut',
          })
        } else {
          influencesRef.current[index] = value
          if (meshRef.current?.morphTargetInfluences) {
            meshRef.current.morphTargetInfluences[index] = value
          }
        }
      },

      getInfluence: (index: number) => {
        return influencesRef.current[index] ?? 0
      },

      transitionToState: async (stateName: string, config?: MorphAnimationConfig) => {
        // This will be used by MorphTransition component
        // For now, log a warning
        console.warn(
          'MorphModel: transitionToState requires MorphTransition wrapper. Use setInfluence directly or wrap with MorphTransition.'
        )
        return Promise.resolve()
      },

      reset: (animate = false) => {
        influencesRef.current.forEach((_, index) => {
          if (animate) {
            if (timelineRef.current) {
              timelineRef.current.kill()
            }
            timelineRef.current = gsap.timeline()
            timelineRef.current.to(influencesRef.current, {
              [index]: 0,
              duration: 0.5,
              ease: 'power2.inOut',
            })
          } else {
            influencesRef.current[index] = 0
            if (meshRef.current?.morphTargetInfluences) {
              meshRef.current.morphTargetInfluences[index] = 0
            }
          }
        })
      },

      getAllInfluences: () => {
        return [...influencesRef.current]
      },
    }))

    // Cleanup
    useEffect(() => {
      return () => {
        if (timelineRef.current) {
          timelineRef.current.kill()
        }
      }
    }, [])

    return <group ref={groupRef}>{children}</group>
  }
)

MorphModel.displayName = 'MorphModel'
