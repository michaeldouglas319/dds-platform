/**
 * Three.js Fiber Scalable Architecture
 * Complete system for managing models, scenes, and cameras at production scale
 *
 * Key exports for each module:
 */

// ============================================================================
// MODELS - Central registry for all 3D models
// ============================================================================
export type {
  ModelMetadata,
  BoundingBoxInfo,
  ModelDefinition,
  CachedModelData,
  TransformConfig,
  AnnotationPoint,
  CameraConfig,
  SceneDefinition,
} from './models/types';

export {
  modelRegistry,
  getModelDefinition,
  getModelsByCategory,
  getAllModelIds,
  getAllModels,
  hasModel,
  getModelPath,
  getModelBounds,
  getDefaultCamera,
  getModelAnnotations,
  getDefaultTransform,
} from './models/registry';

// ============================================================================
// CAMERA - Smart camera positioning and transitions
// ============================================================================
export {
  computeCameraDistance,
  computeCameraPosition,
  computeFramingCamera,
  computeResponsiveCameraDistance,
  lerpCamera,
  computeScrollCamera,
  validateCameraView,
  computeInspectionCameras,
  computeWalkthroughCamera,
} from './camera/utilities';

// ============================================================================
// ASSET LOADING - Production-grade model loading and caching
// ============================================================================
export {
  getAssetManager,
  loadAsset,
  preloadModels,
  areModelsLoaded,
  disposeAsset,
  disposeAllAssets,
  getAssetStats,
} from './loaders/assetManager';

// ============================================================================
// ANNOTATIONS - 3D annotation markers and descriptions
// ============================================================================
export type {} from './annotations/annotationManager';
export {
  AnnotationManager,
  useAnnotations,
  getAnnotationById,
  filterAnnotationsByDistance,
} from './annotations/annotationManager';

// ============================================================================
// SCENES - Multi-model scene management
// ============================================================================
export {
  SceneManagerComponent,
  useSceneManager,
  ModelCarousel,
} from './scenes/sceneManager';

// ============================================================================
// CONTEXT - WebGL context and Canvas management
// ============================================================================
export {
  contextManager,
} from './context/contextManager';
export type {
  ContextState,
  ContextInfo,
} from './context/contextManager';

export {
  canvasRegistry,
} from './context/canvasRegistry';
export type {
  CanvasInstance,
} from './context/canvasRegistry';

// ============================================================================
// RESOURCE MANAGEMENT - Centralized resource disposal
// ============================================================================
export {
  resourceManager,
  useResourceTracking,
  useResource,
} from './utils/resourceManager';
export type {
  ResourceStats,
  TrackedResource,
} from './utils/resourceManager';

// ============================================================================
// MODEL LOADING - Standardized model loading
// ============================================================================
export {
  useModelLoader,
  preloadModel,
  clearModelCache,
  ModelLoader,
  ModelLoadError,
} from './loaders/modelLoader';
export type {
  ModelLoaderOptions,
  ModelLoadResult,
} from './loaders/modelLoader';

// ============================================================================
// TEXTURE MANAGEMENT - Texture caching and optimization
// ============================================================================
export {
  textureManager,
  useManagedTexture,
} from './utils/textureManager';
export type {
  TextureOptions,
  TextureCacheEntry,
} from './utils/textureManager';

// ============================================================================
// R3F PATTERNS - Standardized R3F patterns
// ============================================================================
export {
  useRotation,
  useOscillation,
  usePulse,
  useHover,
  useClick,
  useLookAt,
  useLOD,
  useVisibilityCulling,
  useInstancedMesh,
} from './patterns/r3fPatterns';

// ============================================================================
// CONCURRENT R3F - React 18 concurrency patterns
// ============================================================================
export {
  useConcurrentModel,
  ConcurrentModelLoader,
  useTransitionState,
  preloadModelsConcurrent,
  usePriorityRender,
} from './patterns/concurrentR3F';
export { useTransition } from 'react';

// ============================================================================
// PERFORMANCE - Performance monitoring
// ============================================================================
export {
  performanceMonitor,
  usePerformanceMonitor,
} from './performance/monitor';
export type {
  PerformanceMetrics,
  PerformanceMonitorOptions,
} from './performance/monitor';

// ============================================================================
// OPTIMIZATION - Optimization utilities
// ============================================================================
export {
  createLOD,
  mergeGeometries,
  createInstancedMesh,
  optimizeTexture,
  simplifyGeometry,
  batchGeometries,
} from './optimization';
