import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

/**
 * Model registry system for pluggable particle models
 */

export type ModelType = 'sphere' | 'gltf' | 'custom';

export interface ModelConfig {
  id: string;
  type: ModelType;
  // For sphere
  radius?: number;
  segments?: number;
  // For GLTF
  path?: string;
  // For custom component
  component?: React.ComponentType<any>;
  // Scale
  scale?: number | [number, number, number];
  // Offset
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export interface ParticleModel {
  id: string;
  geometry?: THREE.BufferGeometry;
  material?: THREE.Material | THREE.Material[];
  mesh?: THREE.Mesh;
  component?: React.ComponentType<any>;
  scale: THREE.Vector3;
  offset: THREE.Vector3;
  rotation: THREE.Euler;
}

/**
 * Model registry - stores available models
 */
class ModelRegistry {
  private models: Map<string, ModelConfig> = new Map();
  private loadedModels: Map<string, ParticleModel> = new Map();

  /**
   * Register a model configuration
   */
  register(config: ModelConfig): void {
    this.models.set(config.id, config);
  }

  /**
   * Get model configuration
   */
  getConfig(id: string): ModelConfig | undefined {
    return this.models.get(id);
  }

  /**
   * Get loaded model
   */
  getModel(id: string): ParticleModel | undefined {
    return this.loadedModels.get(id);
  }

  /**
   * Set loaded model
   */
  setModel(id: string, model: ParticleModel): void {
    this.loadedModels.set(id, model);
  }

  /**
   * Check if model is registered
   */
  has(id: string): boolean {
    return this.models.has(id);
  }

  /**
   * List all registered model IDs
   */
  list(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Clear registry
   */
  clear(): void {
    this.models.clear();
    this.loadedModels.clear();
  }
}

// Singleton instance
export const modelRegistry = new ModelRegistry();

/**
 * Default model configurations
 */
export const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: 'sphere-default',
    type: 'sphere',
    radius: 1.5,
    segments: 16,
    scale: 1.0,
  },
  {
    id: 'sphere-small',
    type: 'sphere',
    radius: 0.5,
    segments: 8,
    scale: 1.0,
  },
  {
    id: 'sphere-large',
    type: 'sphere',
    radius: 3.0,
    segments: 32,
    scale: 1.0,
  },
];

// Register default models
DEFAULT_MODELS.forEach(model => modelRegistry.register(model));

/**
 * Create sphere geometry and material
 */
export function createSphereModel(config: ModelConfig): ParticleModel {
  if (config.type !== 'sphere') {
    throw new Error(`Expected sphere model, got ${config.type}`);
  }

  const radius = config.radius || 1.0;
  const segments = config.segments || 16;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  
  const material = new THREE.MeshStandardMaterial({
    color: '#6366f1',
    emissive: '#4f46e5',
    emissiveIntensity: 0.5,
  });

  const scale = Array.isArray(config.scale)
    ? new THREE.Vector3(...config.scale)
    : new THREE.Vector3(config.scale || 1.0, config.scale || 1.0, config.scale || 1.0);

  const offset = config.position
    ? new THREE.Vector3(...config.position)
    : new THREE.Vector3(0, 0, 0);

  const rotation = config.rotation
    ? new THREE.Euler(...config.rotation)
    : new THREE.Euler(0, 0, 0);

  return {
    id: config.id,
    geometry,
    material,
    scale,
    offset,
    rotation,
  };
}

/**
 * Hook to load GLTF model
 */
export function useModelLoader(config: ModelConfig): ParticleModel | null {
  if (config.type !== 'gltf' || !config.path) {
    return null;
  }

  const { scene } = useGLTF(config.path);
  
  return useMemo(() => {
    // Clone the scene to avoid mutating the original
    const clonedScene = scene.clone();
    
    // Extract geometry and material from first mesh
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const geometry = child.geometry.clone();
        const material = child.material instanceof THREE.Material
          ? child.material.clone()
          : child.material.map((m: THREE.Material) => m.clone());

        const scale = Array.isArray(config.scale)
          ? new THREE.Vector3(...config.scale)
          : new THREE.Vector3(config.scale || 1.0, config.scale || 1.0, config.scale || 1.0);

        const offset = config.position
          ? new THREE.Vector3(...config.position)
          : new THREE.Vector3(0, 0, 0);

        const rotation = config.rotation
          ? new THREE.Euler(...config.rotation)
          : new THREE.Euler(0, 0, 0);

        return {
          id: config.id,
          geometry,
          material,
          scale,
          offset,
          rotation,
        };
      }
    });

    return null;
  }, [scene, config]);
}

/**
 * Create model from config (for non-GLTF models)
 */
export function createModelFromConfig(config: ModelConfig): ParticleModel | null {
  switch (config.type) {
    case 'sphere':
      return createSphereModel(config);
    case 'gltf':
      // GLTF models should be loaded via useModelLoader hook
      console.warn('GLTF models should be loaded via useModelLoader hook');
      return null;
    case 'custom':
      // Custom components are handled separately
      return {
        id: config.id,
        component: config.component,
        scale: Array.isArray(config.scale)
          ? new THREE.Vector3(...config.scale)
          : new THREE.Vector3(config.scale || 1.0, config.scale || 1.0, config.scale || 1.0),
        offset: config.position
          ? new THREE.Vector3(...config.position)
          : new THREE.Vector3(0, 0, 0),
        rotation: config.rotation
          ? new THREE.Euler(...config.rotation)
          : new THREE.Euler(0, 0, 0),
      };
    default:
      return null;
  }
}
