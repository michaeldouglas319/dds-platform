/**
 * Concurrent R3F Patterns
 * 
 * React 18 concurrency patterns for React Three Fiber.
 * Integrates startTransition, Suspense, and priority-based rendering.
 * 
 * Best Practices:
 * - startTransition for expensive operations
 * - Suspense boundaries for async model loading
 * - Concurrent rendering patterns
 * - Priority-based rendering
 */

'use client'

import { startTransition, useTransition, Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Hook to load model with concurrent rendering
 *
 * @example
 * ```tsx
 * function ModelViewer() {
 *   const model = useConcurrentModel('/models/robot.glb')
 *   return <primitive object={model.scene} />
 * }
 * ```
 */
export function useConcurrentModel(path: string): THREE.Group {
  const gltf = useGLTF(path)
  return gltf.scene
}

/**
 * Component wrapper for concurrent model loading with Suspense
 * 
 * @example
 * ```tsx
 * <ConcurrentModelLoader
 *   path="/models/robot.glb"
 *   fallback={<LoadingSpinner />}
 * >
 *   {(model) => <primitive object={model.scene} />}
 * </ConcurrentModelLoader>
 * ```
 */
export function ConcurrentModelLoader({
  path,
  fallback,
  children,
}: {
  path: string
  fallback?: React.ReactNode
  children: (model: { scene: THREE.Group }) => React.ReactNode
}): React.ReactElement {
  return (
    <Suspense fallback={fallback || <ModelLoadingFallback />}>
      <ConcurrentModelLoaderInner path={path}>
        {children}
      </ConcurrentModelLoaderInner>
    </Suspense>
  )
}

function ConcurrentModelLoaderInner({
  path,
  children,
}: {
  path: string
  children: (model: { scene: THREE.Group }) => React.ReactNode
}): React.ReactElement {
  const model = useConcurrentModel(path)
  return <>{children({ scene: model })}</>
}

function ModelLoadingFallback(): React.ReactElement {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  )
}

/**
 * Hook to update state with transition (for expensive operations)
 * 
 * @example
 * ```tsx
 * function Scene() {
 *   const [models, setModels] = useState([])
 *   const updateModels = useTransitionState(setModels)
 *   
 *   const loadHeavyContent = () => {
 *     updateModels(generateHundredsOfModels()) // Won't block UI
 *   }
 * }
 * ```
 */
export function useTransitionState<T>(
  setState: React.Dispatch<React.SetStateAction<T>>
): (value: T | ((prev: T) => T)) => void {
  return (value) => {
    startTransition(() => {
      setState(value)
    })
  }
}

/**
 * Hook with loading state for transitions
 * 
 * @example
 * ```tsx
 * function Scene() {
 *   const [isPending, startTransition] = useTransition()
 *   const [count, setCount] = useState(0)
 *   
 *   const handleClick = () => {
 *     startTransition(() => {
 *       setCount(c => c + 100) // Add 100 expensive meshes
 *     })
 *   }
 *   
 *   return (
 *     <>
 *       {isPending && <LoadingIndicator />}
 *       <Meshes count={count} />
 *     </>
 *   )
 * }
 * ```
 */
export { useTransition }

/**
 * Preload models during idle time
 * 
 * @example
 * ```tsx
 * // In app initialization
 * preloadModelsConcurrent(['/model1.glb', '/model2.glb', '/model3.glb'])
 * ```
 */
export function preloadModelsConcurrent(paths: string[]): void {
  startTransition(() => {
    paths.forEach((path) => {
      useGLTF.preload(path)
    })
  })
}

/**
 * Priority-based rendering hook
 * 
 * @example
 * ```tsx
 * function PriorityScene() {
 *   const highPriorityRef = usePriorityRender(1) // High priority
 *   const lowPriorityRef = usePriorityRender(-1) // Low priority
 *   
 *   return (
 *     <>
 *       <mesh ref={highPriorityRef}>...</mesh>
 *       <mesh ref={lowPriorityRef}>...</mesh>
 *     </>
 *   )
 * }
 * ```
 */
export function usePriorityRender(priority: number) {
  // Priority is handled via useFrame priority parameter
  // This is a placeholder for priority-based rendering logic
  return { priority }
}
