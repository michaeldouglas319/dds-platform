'use client'

import React, { useRef, useState, ReactNode, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Helper to create Three.js geometry from constructor args
 *
 * Supported geometries:
 * - Primitive shapes: box, sphere, cone, cylinder, plane
 * - Polyhedrons: tetrahedron, octahedron, icosahedron, dodecahedron
 * - Special shapes: torus, lathe, capsule
 */
function createGeometryFromType(
  type: string,
  args: undefined[]
): THREE.BufferGeometry | null {
  try {
    switch (type) {
      // Primitive shapes
      case 'sphereGeometry':
        return new THREE.SphereGeometry(...(args as any[]))
      case 'boxGeometry':
        return new THREE.BoxGeometry(...(args as any[]))
      case 'planeGeometry':
        return new THREE.PlaneGeometry(...(args as any[]))
      case 'coneGeometry':
        return new THREE.ConeGeometry(...(args as any[]))
      case 'cylinderGeometry':
        return new THREE.CylinderGeometry(...(args as any[]))

      // Polyhedrons
      case 'tetrahedronGeometry':
        return new THREE.TetrahedronGeometry(...(args as any[]))
      case 'octahedronGeometry':
        return new THREE.OctahedronGeometry(...(args as any[]))
      case 'icosahedronGeometry':
        return new THREE.IcosahedronGeometry(...(args as any[]))
      case 'dodecahedronGeometry':
        return new THREE.DodecahedronGeometry(...(args as any[]))

      // Special shapes
      case 'torusGeometry':
        return new THREE.TorusGeometry(...(args as any[]))
      case 'torusKnotGeometry':
        return new THREE.TorusKnotGeometry(...(args as any[]))
      case 'latheGeometry':
        return new THREE.LatheGeometry(...(args as any[]))
      case 'capsuleGeometry':
        return new THREE.CapsuleGeometry(...(args as any[]))

      default:
        console.warn(`Unknown geometry type: ${type}`)
        return null
    }
  } catch (e) {
    console.warn(`Failed to create geometry of type ${type}:`, e)
    return null
  }
}

/**
 * Smoothly morphs between two geometries by lerping position attributes
 * Compatible with geometries that have different vertex counts
 */
function createMorphedGeometry(
  fromGeom: THREE.BufferGeometry,
  toGeom: THREE.BufferGeometry,
  progress: number
): THREE.BufferGeometry {
  const result = fromGeom.clone()

  const fromPos = fromGeom.attributes.position
  const toPos = toGeom.attributes.position

  // Safety check: ensure both geometries have position attributes
  if (!fromPos || !toPos) {
    console.warn('createMorphedGeometry: Missing position attributes, returning original geometry')
    return result
  }

  // Use the smaller vertex count to ensure compatibility
  const vertexCount = Math.min(fromPos.count, toPos.count)

  const resultPos = result.attributes.position as THREE.BufferAttribute

  // Lerp positions
  for (let i = 0; i < vertexCount; i++) {
    const fromX = fromPos.getX(i)
    const fromY = fromPos.getY(i)
    const fromZ = fromPos.getZ(i)

    const toX = toPos.getX(i)
    const toY = toPos.getY(i)
    const toZ = toPos.getZ(i)

    resultPos.setXYZ(
      i,
      THREE.MathUtils.lerp(fromX, toX, progress),
      THREE.MathUtils.lerp(fromY, toY, progress),
      THREE.MathUtils.lerp(fromZ, toZ, progress)
    )
  }

  resultPos.needsUpdate = true
  return result
}

export interface InteractiveGeometryProps {
  /** Mesh position in 3D space */
  position?: [number, number, number]
  /** Mesh rotation */
  rotation?: [number, number, number]
  /** Base scale */
  scale?: number
  /** Scale multiplier on hover */
  hoverScale?: number
  /** Scale multiplier on active/click */
  activeScale?: number
  /** Enables floating animation */
  float?: boolean
  /** Float intensity (amplitude) */
  floatIntensity?: number
  /** Float speed */
  floatSpeed?: number
  /** Enable smooth scale lerp */
  smoothScale?: boolean
  /** Scale lerp speed (0-1) */
  scaleLerpSpeed?: number
  /** Base color */
  color?: string
  /** Hover color */
  hoverColor?: string
  /** Material properties */
  materialProps?: THREE.MeshStandardMaterialParameters
  /** Geometry - pass custom geometry or use children */
  geometry?: React.ReactNode
  /** Hover geometry - smoothly morph to this geometry on hover */
  hoverGeometry?: React.ReactNode
  /** Morph speed (0-1, higher = faster) */
  morphSpeed?: number
  /** Custom children to render inside mesh (replaces geometry) */
  children?: ReactNode
  /** Click handler */
  onClick?: (event: THREE.Intersection<THREE.Object3D>) => void
  /** Pointer enter handler */
  onHover?: (hovered: boolean) => void
  /** Pointer down handler */
  onPointerDown?: (event: THREE.Intersection<THREE.Object3D>) => void
  /** Pointer up handler */
  onPointerUp?: (event: THREE.Intersection<THREE.Object3D>) => void
  /** Enable pointer interactions */
  interactive?: boolean
  /** Cursor style on hover */
  hoverCursor?: string
  /** Additional mesh props */
  [key: string]: any
}

export function InteractiveGeometry({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  hoverScale = 1.15,
  activeScale = 1.3,
  float = true,
  floatIntensity = 0.15,
  floatSpeed = 1,
  smoothScale = true,
  scaleLerpSpeed = 0.1,
  color = '#4ECDC4',
  hoverColor = '#E8B059',
  materialProps = {},
  geometry,
  hoverGeometry,
  morphSpeed = 0.15,
  children,
  onClick,
  onHover,
  onPointerDown: onPointerDownProp,
  onPointerUp: onPointerUpProp,
  interactive = true,
  hoverCursor = 'pointer',
}: InteractiveGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  const initialPositionRef = useRef(position)
  const morphProgressRef = useRef(0)
  const fromGeometryRef = useRef<THREE.BufferGeometry | null>(null)
  const toGeometryRef = useRef<THREE.BufferGeometry | null>(null)

  // Update cursor
  React.useEffect(() => {
    if (interactive) {
      document.body.style.cursor = hovered ? hoverCursor : 'auto'
    }
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered, interactive, hoverCursor])

  // Extract geometries from React nodes
  useEffect(() => {
    if (!geometry || !hoverGeometry) return

    const tempGeometries: { from?: THREE.BufferGeometry; to?: THREE.BufferGeometry } = {}

    // Parse base geometry
    if (React.isValidElement(geometry)) {
      const props = geometry.props as any
      const type = (geometry.type as any).name || geometry.type
      if (props.args) {
        tempGeometries.from = createGeometryFromType(type, props.args) || undefined
      }
    }

    // Parse hover geometry
    if (React.isValidElement(hoverGeometry)) {
      const props = hoverGeometry.props as any
      const type = (hoverGeometry.type as any).name || hoverGeometry.type
      if (props.args) {
        tempGeometries.to = createGeometryFromType(type, props.args) || undefined
      }
    }

    fromGeometryRef.current = tempGeometries.from || null
    toGeometryRef.current = tempGeometries.to || null
  }, [geometry, hoverGeometry])

  // Animation loop
  useFrame(() => {
    if (!meshRef.current) return

    // Scale animation
    if (smoothScale) {
      const targetScale = active ? activeScale : hovered ? hoverScale : 1
      const newScale = scale * targetScale
      meshRef.current.scale.lerp(new THREE.Vector3(newScale, newScale, newScale), scaleLerpSpeed)
    } else {
      const targetScale = active ? activeScale : hovered ? hoverScale : 1
      const newScale = scale * targetScale
      meshRef.current.scale.set(newScale, newScale, newScale)
    }

    // Float animation
    if (float) {
      meshRef.current.position.y = initialPositionRef.current[1] + Math.sin(Date.now() * 0.001 * floatSpeed) * floatIntensity
    }

    // Geometry morphing animation
    if (fromGeometryRef.current && toGeometryRef.current) {
      const targetMorphProgress = hovered ? 1 : 0
      morphProgressRef.current += (targetMorphProgress - morphProgressRef.current) * morphSpeed

      // Create morphed geometry and apply it
      const morphedGeom = createMorphedGeometry(
        fromGeometryRef.current,
        toGeometryRef.current,
        morphProgressRef.current
      )
      meshRef.current.geometry = morphedGeom
    }
  })

  const defaultMaterialProps: THREE.MeshStandardMaterialParameters = {
    color: hovered ? hoverColor : color,
    metalness: 0.6,
    roughness: 0.2,
    emissive: hovered ? hoverColor : '#000000',
    emissiveIntensity: hovered ? 0.5 : 0,
    ...materialProps,
  }

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

  const handlePointerDown = (e: THREE.Intersection<THREE.Object3D>) => {
    if (!interactive) return
    setActive(true)
    onPointerDownProp?.(e)
  }

  const handlePointerUp = (e: THREE.Intersection<THREE.Object3D>) => {
    if (!interactive) return
    setActive(false)
    onClick?.(e)
    onPointerUpProp?.(e)
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {children || geometry || <sphereGeometry args={[0.8, 64, 64]} />}
      <meshStandardMaterial {...defaultMaterialProps} />
    </mesh>
  )
}

// Convenience export with default sphere geometry
export function InteractiveSphere(props: InteractiveGeometryProps) {
  return (
    <InteractiveGeometry
      {...props}
      geometry={<sphereGeometry args={[0.8, 64, 64]} />}
    />
  )
}
