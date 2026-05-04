'use client'

import React, { useRef, useState, Suspense, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getGeometryArgsAtDetail, createGeometryFromType } from '@/lib/threejs/utils/simplifyGeometry'

// Reuse material instances
const MORPHING_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#4ECDC4',
  metalness: 0.6,
  roughness: 0.2,
})

// Cache for created geometries
const GEOMETRY_CACHE = new Map<string, THREE.BufferGeometry>()

export interface InteractiveModelProps {
  /**
   * Path to GLTF/GLB model (relative to /public)
   * Example: '/assets/models/golden_globe_decoration.glb'
   */
  modelPath: string
  /**
   * Geometry to morph to on hover (optional)
   * If provided, model will smoothly morph to this geometry when hovered
   * Can be used with or without morphDetail
   */
  hoverGeometry?: React.ReactNode
  /**
   * Type of geometry for auto-generated morph target
   * Options: 'sphere', 'box', 'icosahedron', 'torus', 'torusKnot', 'cone', 'cylinder'
   * If provided with morphDetail, auto-generates hover geometry
   */
  morphGeometryType?: string
  /**
   * Detail level for simplified morph target (0-1)
   * 0 = ultra-jagged/blocky, 0.5 = medium detail, 1 = smooth/detailed
   * Only used if morphGeometryType is provided
   */
  morphDetail?: number
  /**
   * Morph speed (0-1, higher = faster)
   * Only used if hoverGeometry is provided
   */
  morphSpeed?: number
  /**
   * Position in 3D space
   */
  position?: [number, number, number]
  /**
   * Rotation
   */
  rotation?: [number, number, number]
  /**
   * Base scale
   */
  scale?: number | [number, number, number]
  /**
   * Scale multiplier on hover
   */
  hoverScale?: number
  /**
   * Scale multiplier on active/click
   */
  activeScale?: number
  /**
   * Enable floating animation
   */
  float?: boolean
  /**
   * Float intensity
   */
  floatIntensity?: number
  /**
   * Float speed
   */
  floatSpeed?: number
  /**
   * Enable rotation on hover
   */
  hoverRotate?: boolean
  /**
   * Rotation speed on hover
   */
  rotationSpeed?: number
  /**
   * Click handler
   */
  onClick?: () => void
  /**
   * Hover handler
   */
  onHover?: (hovered: boolean) => void
  /**
   * Enable pointer interactions
   */
  interactive?: boolean
  /**
   * Cursor style on hover
   */
  hoverCursor?: string
}

/**
 * Morphs geometry in-place without cloning (memory efficient)
 */
function morphGeometryInPlace(
  targetGeom: THREE.BufferGeometry,
  fromGeom: THREE.BufferGeometry,
  toGeom: THREE.BufferGeometry,
  progress: number
): void {
  const fromPos = fromGeom.attributes.position
  const toPos = toGeom.attributes.position
  const targetPos = targetGeom.attributes.position as THREE.BufferAttribute

  const vertexCount = Math.min(fromPos.count, toPos.count, targetPos.count)

  for (let i = 0; i < vertexCount; i++) {
    const fromX = fromPos.getX(i)
    const fromY = fromPos.getY(i)
    const fromZ = fromPos.getZ(i)

    const toX = toPos.getX(i)
    const toY = toPos.getY(i)
    const toZ = toPos.getZ(i)

    targetPos.setXYZ(
      i,
      THREE.MathUtils.lerp(fromX, toX, progress),
      THREE.MathUtils.lerp(fromY, toY, progress),
      THREE.MathUtils.lerp(fromZ, toZ, progress)
    )
  }

  targetPos.needsUpdate = true
}

/**
 * Create geometry with caching to avoid recreating the same geometry
 * Local wrapper around imported createGeometryFromType with caching layer
 */
function createCachedGeometry(type: string, args: any[]): THREE.BufferGeometry | null {
  // Create cache key from type and args
  const cacheKey = `${type}:${JSON.stringify(args)}`

  // Return cached geometry if available
  if (GEOMETRY_CACHE.has(cacheKey)) {
    return GEOMETRY_CACHE.get(cacheKey)!
  }

  // Use imported function to create geometry
  const geom = createGeometryFromType(type, args)

  if (geom) {
    // Cache for future use
    GEOMETRY_CACHE.set(cacheKey, geom)
  }

  return geom
}

function ModelContent({
  modelPath,
  hoverGeometry,
  morphGeometryType,
  morphDetail = 0.5,
  morphSpeed = 0.15,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  hoverScale = 1.15,
  activeScale = 1.3,
  float = true,
  floatIntensity = 0.15,
  floatSpeed = 1,
  hoverRotate = true,
  rotationSpeed = 2,
  onClick,
  onHover,
  interactive = true,
  hoverCursor = 'pointer',
}: InteractiveModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const initialPositionRef = useRef(position)
  const morphProgressRef = useRef(0)
  const lastMorphProgressRef = useRef(-1) // Track last update to skip unnecessary updates
  const modelGeometryRef = useRef<THREE.BufferGeometry | null>(null)
  const targetGeometryRef = useRef<THREE.BufferGeometry | null>(null)

  // Load model
  const { scene } = useGLTF(modelPath)
  const clonedScene = React.useMemo(() => scene.clone(), [scene])

  // Extract model geometry and setup morphing (memoized)
  React.useEffect(() => {
    // Determine if we have a hover geometry (either explicit or auto-generated)
    const hasHoverGeometry = hoverGeometry || (morphGeometryType && morphDetail !== undefined)

    if (!clonedScene || !hasHoverGeometry) return

    // Extract first mesh geometry from model (only once)
    if (!modelGeometryRef.current) {
      let modelGeom: THREE.BufferGeometry | null = null
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh && !modelGeom) {
          modelGeom = (child.geometry as THREE.BufferGeometry).clone()
        }
      })
      modelGeometryRef.current = modelGeom
    }

    // Parse target geometry (only once)
    if (!targetGeometryRef.current) {
      if (hoverGeometry && React.isValidElement(hoverGeometry)) {
        // Use explicit hoverGeometry prop
        const props = hoverGeometry.props as any
        const type = (hoverGeometry.type as any).name || hoverGeometry.type
        if (props.args) {
          targetGeometryRef.current = createCachedGeometry(type, props.args)
        }
      } else if (morphGeometryType && morphDetail !== undefined) {
        // Auto-generate geometry at specified detail level
        const args = getGeometryArgsAtDetail(morphGeometryType, morphDetail)
        if (args.length > 0) {
          targetGeometryRef.current = createCachedGeometry(morphGeometryType, args)
        }
      }
    }
  }, [clonedScene, hoverGeometry, morphGeometryType, morphDetail])

  // Update cursor
  React.useEffect(() => {
    if (interactive) {
      document.body.style.cursor = hovered ? hoverCursor : 'auto'
    }
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, interactive, hoverCursor])

  // Cleanup geometries when component unmounts
  React.useEffect(() => {
    return () => {
      // Dispose geometries to free GPU memory
      if (modelGeometryRef.current) {
        modelGeometryRef.current.dispose()
      }
      if (targetGeometryRef.current) {
        targetGeometryRef.current.dispose()
      }
    }
  }, [])

  // Animation loop
  useFrame(() => {
    if (!groupRef.current) return

    // Scale animation
    const targetScale = active ? activeScale : hovered ? hoverScale : 1
    const numScale = Array.isArray(scale) ? scale[0] : scale
    const newScale = numScale * targetScale

    groupRef.current.scale.lerp(
      new THREE.Vector3(newScale, newScale, newScale),
      0.1
    )

    // Float animation
    if (float) {
      groupRef.current.position.y =
        initialPositionRef.current[1] +
        Math.sin(Date.now() * 0.001 * floatSpeed) * floatIntensity
    }

    // Hover rotation
    if (hoverRotate && hovered) {
      groupRef.current.rotation.y += (0.01 * rotationSpeed)
    } else if (!hoverRotate) {
      // Auto-rotate when not hovering
      groupRef.current.rotation.y += 0.001
    }

    // Geometry morphing animation (optimized - skip if progress unchanged)
    if (meshRef.current && modelGeometryRef.current && targetGeometryRef.current) {
      const targetMorphProgress = hovered ? 1 : 0
      morphProgressRef.current += (targetMorphProgress - morphProgressRef.current) * morphSpeed

      // Only update if progress changed by more than 0.001 (prevents redundant updates)
      if (Math.abs(morphProgressRef.current - lastMorphProgressRef.current) > 0.001) {
        morphGeometryInPlace(
          meshRef.current.geometry,
          modelGeometryRef.current,
          targetGeometryRef.current,
          morphProgressRef.current
        )
        lastMorphProgressRef.current = morphProgressRef.current
      }
    }
  })

  const handlePointerEnter = () => {
    if (!interactive) return
    setHovered(true)
    onHover?.(true)
  }

  const handlePointerLeave = () => {
    if (!interactive) return
    setHovered(false)
    onHover?.(false)
  }

  const handlePointerDown = () => {
    if (!interactive) return
    setActive(true)
  }

  const handlePointerUp = () => {
    if (!interactive) return
    setActive(false)
    onClick?.()
  }

  // If morphing is enabled, show morphing mesh; otherwise show model
  const showMorphing = modelGeometryRef.current && targetGeometryRef.current

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {showMorphing && modelGeometryRef.current ? (
        // Morphing mesh - clone once for in-place morphing
        // Uses shared material instance to save memory
        <mesh ref={meshRef} geometry={modelGeometryRef.current.clone()} material={MORPHING_MATERIAL} />
      ) : (
        // Regular model
        <primitive object={clonedScene} />
      )}
    </group>
  )
}

/**
 * Interactive 3D Model Component
 *
 * Loads GLTF/GLB models from assets and makes them interactive
 *
 * @example
 * <InteractiveModel
 *   modelPath="/assets/models/golden_globe_decoration.glb"
 *   position={[0, -2.5, 0]}
 *   scale={1}
 *   float={true}
 *   hoverRotate={true}
 *   onClick={() => console.log('Clicked')}
 * />
 */
export function InteractiveModel(props: InteractiveModelProps) {
  return (
    <Suspense fallback={null}>
      <ModelContent {...props} />
    </Suspense>
  )
}
