/**
 * 3D Loading Overlay System
 *
 * Provides a branded loading experience with neural network and configurable sphere
 *
 * @example
 * ```tsx
 * import { useLoading, LoadingPresets } from '@/components/loading'
 *
 * function MyComponent() {
 *   const { startLoading, stopLoading } = useLoading()
 *
 *   const handleClick = async () => {
 *     startLoading('operation', LoadingPresets.dataLoad)
 *     await fetchData()
 *     stopLoading()
 *   }
 * }
 * ```
 */

// Core Components
export { LoadingScene } from './LoadingScene'
export { ThreeDLoadingOverlay, LoadingPresets } from './ThreeDLoadingOverlay'
export { LoadingExamples } from './LoadingExamples'

// Context & Hooks (re-exported for convenience)
export {
  LoadingProvider,
  useLoading,
  useNavigationLoading,
  useLoadingOperation,
} from '@/lib/contexts/LoadingContext'

// Types
export type { LoadingOverlayConfig } from './ThreeDLoadingOverlay'
