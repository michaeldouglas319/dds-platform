'use client'

import { Html } from '@react-three/drei'

interface SceneAnnotationProps {
  position: [number, number, number]
  children: React.ReactNode
  onClick?: () => void
}

/**
 * SceneAnnotation Component
 *
 * Renders text/info labels positioned in 3D scene space.
 * Uses Html component with occlude="blending" for proper depth handling.
 *
 * @category composite
 * @layer 2
 */
export function SceneAnnotation({
  position,
  children,
  onClick
}: SceneAnnotationProps) {
  return (
    <Html
      position={position}
      transform
      occlude="blending"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="select-none pointer-events-auto">
        {children}
      </div>
    </Html>
  )
}
