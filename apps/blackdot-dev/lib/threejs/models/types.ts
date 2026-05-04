/**
 * Central Type Definitions for Model System
 * Defines all model-related types for type-safe model management
 */

import * as THREE from 'three';

/**
 * Model metadata for identification and lookup
 */
export interface ModelMetadata {
  id: string;
  name: string;
  path: string;
  category: 'building' | 'resume' | 'interactive' | 'environment' | string;
  description?: string;
}

/**
 * Bounding box information computed from model geometry
 */
export interface BoundingBoxInfo {
  width: number;  // X dimension
  height: number; // Y dimension
  depth: number;  // Z dimension
  center: [number, number, number];
  radius: number; // Distance from center to furthest vertex
}

/**
 * Camera configuration for framing a model
 */
export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  distance?: number; // Computed from bounds
  upVector?: [number, number, number];
}

/**
 * Transform configuration for positioning/rotating models
 */
export interface TransformConfig {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

/**
 * Annotation point in 3D space
 */
export interface AnnotationPoint {
  id: string;
  title: string;
  description?: string;
  position: [number, number, number]; // World position
  camera?: CameraConfig; // Optional camera setup for this annotation
  color?: string;
  icon?: string;
  isVisible?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Complete model definition with all metadata
 */
export interface ModelDefinition {
  metadata: ModelMetadata;
  boundingBox: BoundingBoxInfo;
  defaultTransform: TransformConfig;
  defaultCamera: CameraConfig;
  annotations?: AnnotationPoint[];
  variants?: {
    lod?: string[]; // LOD model paths for performance
    mobile?: string; // Mobile-optimized version
  };
  metadata_custom?: Record<string, unknown>;
}

/**
 * Cached model data in memory
 */
export interface CachedModelData {
  scene: THREE.Group;
  boundingBox: BoundingBoxInfo;
  metadata: ModelMetadata;
  loaded: number; // Timestamp
}

/**
 * Asset loader state
 */
export enum AssetLoadState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

/**
 * Asset loading result
 */
export interface AssetLoadResult<T> {
  data: T | null;
  state: AssetLoadState;
  error: Error | null;
  progress: number; // 0-1
}

/**
 * Multi-model scene configuration
 */
export interface SceneDefinition {
  id: string;
  name: string;
  models: Array<{
    modelId: string;
    transform?: TransformConfig;
    camera?: CameraConfig;
  }>;
  lighting?: {
    ambient?: number;
    directional?: {
      intensity: number;
      position: [number, number, number];
    };
  };
  environment?: string; // Drei preset
  background?: string | number;
}
