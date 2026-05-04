'use client'

/**
 * ModelScene - Standardized model viewer scene
 * 
 * Scene component optimized for viewing 3D models with auto-scaling and camera framing.
 * 
 * @category three
 * @layer 2
 */

import React, { Suspense } from 'react'
import { PerspectiveCamera, OrbitControls, Environment } from '@react-three/drei'
import { StandardCanvas } from '../StandardCanvas'
import { useModelLoader, ModelLoader } from '@/lib/threejs/loaders/modelLoader'
import { useModelAutoScaling } from '@/lib/threejs/utils/modelScaling'
import type { StandardCanvasProps } from '../StandardCanvas'

export interface ModelSceneProps extends Omit<StandardCanvasProps, 'children'> {
  /**
   * Path to GLTF/GLB model
   */
  modelPath: string

  /**
   * Auto-scale model to fit view
   */
  autoScale?: boolean

  /**
   * Target size for auto-scaling
   */
  targetSize?: number

  /**
   * Camera position (overridden by auto-scale if enabled)
   */
  cameraPosition?: [number, number, number]

  /**
   * Show orbit controls
   */
  showControls?: boolean

  /**
   * Auto-rotate
   */
  autoRotate?: boolean

  /**
   * Environment preset
   */
  environment?: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'

  /**
   * Loading fallback
   */
  fallback?: React.ReactNode

  /**
   * Additional scene content
   */
  children?: React.ReactNode
}

/**
 * ModelScene Component
 * 
 * @example
 * ```tsx
 * <ModelScene
 *   modelPath="/models/robot.glb"
 *   autoScale
 *   targetSize={2.5}
 * />
 * ```
 */
export function ModelScene({
  modelPath,
  autoScale = true,
  targetSize = 2.5,
  cameraPosition,
  showControls = true,
  autoRotate = false,
  environment = 'city',
  fallback,
  children,
  ...canvasProps
}: ModelSceneProps) {
  return (
    <StandardCanvas
      camera={{ position: cameraPosition || [0, 0, 5], fov: 75 }}
      {...canvasProps}
    >
      <Suspense fallback={fallback || <ModelLoadingFallback />}>
        <ModelSceneContent
          modelPath={modelPath}
          autoScale={autoScale}
          targetSize={targetSize}
          cameraPosition={cameraPosition}
          showControls={showControls}
          autoRotate={autoRotate}
          environment={environment}
        />
        {children}
      </Suspense>
    </StandardCanvas>
  )
}

function ModelSceneContent({
  modelPath,
  autoScale,
  targetSize,
  cameraPosition,
  showControls,
  autoRotate,
  environment,
}: Omit<ModelSceneProps, 'fallback' | 'children' | 'canvasProps'>) {
  const { scene } = useModelLoader(modelPath, {
    componentName: 'ModelScene',
  })

  const { scale, center } = useModelAutoScaling(scene, targetSize)

  return (
    <>
      <Environment preset={environment} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {showControls && <OrbitControls autoRotate={autoRotate} />}

      <group
        scale={autoScale ? [scale, scale, scale] : [1, 1, 1]}
        position={autoScale ? [-center.x * scale, -center.y * scale, -center.z * scale] : [0, 0, 0]}
      >
        <primitive object={scene} />
      </group>
    </>
  )
}

function ModelLoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  )
}
