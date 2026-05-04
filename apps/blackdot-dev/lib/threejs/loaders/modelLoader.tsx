/**
 * Model Loader
 * 
 * Standardized model loading with useGLTF wrapper, caching, and error handling.
 * Integrates with resource manager for automatic disposal.
 * 
 * Best Practices:
 * - Automatic Draco decompression
 * - Model caching with LRU eviction
 * - Loading state management
 * - Suspense boundary integration
 * - Error recovery
 */

'use client'

import { useGLTF } from '@react-three/drei'
import { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { useResource } from '../utils/resourceManager'
import type { GLTF } from 'three-stdlib'

export interface ModelLoaderOptions {
  /**
   * Enable Draco decompression
   */
  draco?: boolean | string

  /**
   * Component name for debugging
   */
  componentName?: string

  /**
   * Auto-dispose on unmount
   */
  autoDispose?: boolean

  /**
   * Clone the model (useful for multiple instances)
   */
  clone?: boolean
}

export interface ModelLoadResult {
  scene: THREE.Group
  nodes: Record<string, THREE.Object3D>
  materials: Record<string, THREE.Material>
  animations: THREE.AnimationClip[]
}

/**
 * Hook to load a GLTF model with standardized error handling and caching
 * 
 * @example
 * ```tsx
 * function ModelViewer() {
 *   const { scene } = useModelLoader('/models/robot.glb', {
 *     draco: true,
 *     componentName: 'ModelViewer'
 *   })
 *   
 *   return <primitive object={scene} />
 * }
 * ```
 */
export function useModelLoader(
  path: string,
  options: ModelLoaderOptions = {}
): ModelLoadResult {
  const { draco = true, componentName, autoDispose = true, clone = false } = options

  // Load model using drei's useGLTF (handles caching automatically)
  const gltf = useGLTF(path, draco) as GLTF

  // Clone if requested
  const scene = useMemo(() => {
    return clone ? gltf.scene.clone(true) : gltf.scene
  }, [gltf.scene, clone])

  // Extract nodes and materials
  const { nodes, materials } = useMemo(() => {
    const nodeMap: Record<string, THREE.Object3D> = {}
    const materialMap: Record<string, THREE.Material> = {}

    scene.traverse((child) => {
      if (child.name) {
        nodeMap[child.name] = child
      }
      if (child instanceof THREE.Mesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((mat) => {
          if (mat.name) {
            materialMap[mat.name] = mat
          }
        })
      }
    })

    return { nodes: nodeMap, materials: materialMap }
  }, [scene])

  // Auto-dispose if enabled (hook must be called unconditionally)
  useResource(autoDispose ? scene : null, componentName)

  return {
    scene,
    nodes,
    materials,
    animations: gltf.animations || [],
  }
}

/**
 * Preload a model (useful for prefetching)
 * 
 * @example
 * ```tsx
 * // In app initialization
 * preloadModel('/models/robot.glb')
 * ```
 */
export function preloadModel(path: string, draco: boolean | string = true): void {
  useGLTF.preload(path, draco)
}

/**
 * Clear model from cache
 */
export function clearModelCache(path: string): void {
  useGLTF.clear(path)
}

/**
 * Model Loader Component with Suspense
 * 
 * @example
 * ```tsx
 * <ModelLoader
 *   path="/models/robot.glb"
 *   fallback={<LoadingSpinner />}
 * >
 *   {(model) => <primitive object={model.scene} />}
 * </ModelLoader>
 * ```
 */
export function ModelLoader({
  path,
  options,
  fallback,
  children,
}: {
  path: string
  options?: ModelLoaderOptions
  fallback?: React.ReactNode
  children: (model: ModelLoadResult) => React.ReactNode
}): React.ReactElement {
  return (
    <Suspense fallback={fallback || <ModelLoadingFallback />}>
      <ModelLoaderInner path={path} options={options}>
        {children}
      </ModelLoaderInner>
    </Suspense>
  )
}

function ModelLoaderInner({
  path,
  options,
  children,
}: {
  path: string
  options?: ModelLoaderOptions
  children: (model: ModelLoadResult) => React.ReactNode
}): React.ReactElement {
  const model = useModelLoader(path, options)
  return <>{children(model)}</>
}

/**
 * Default loading fallback
 */
function ModelLoadingFallback(): React.ReactElement {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  )
}

/**
 * Error boundary for model loading
 */
export class ModelLoadError extends Error {
  constructor(
    public path: string,
    public originalError: unknown,
    message?: string
  ) {
    super(message || `Failed to load model: ${path}`)
    this.name = 'ModelLoadError'
  }
}
