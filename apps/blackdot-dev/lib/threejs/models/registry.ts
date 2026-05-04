/**
 * Central Model Registry
 * Single source of truth for all 3D models in the application
 * Provides metadata, bounds, and configuration for every model
 *
 * Benefits:
 * - Know exactly where every model is in the scene
 * - Know the exact size/bounds of every model
 * - Consistent camera framing across the app
 * - Centralized annotation management
 */

import type { ModelDefinition, BoundingBoxInfo, CameraConfig, TransformConfig, AnnotationPoint } from './types';

/**
 * BUILDING MODEL
 * 3D model of office building with interior visualization
 */
const buildingModel: ModelDefinition = {
  metadata: {
    id: 'building',
    name: 'Office Building',
    path: '/assets/models/building.glb',
    category: 'building',
    description: 'Main office building with workspace sections',
  },
  boundingBox: {
    width: 2.1,
    height: 3.5,
    depth: 1.8,
    center: [0, 0, 0],
    radius: 2.2,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1.2,
  },
  defaultCamera: {
    position: [1.5, 1.5, 4],
    target: [0, 0, 0],
    fov: 75,
    distance: 5.2,
  },
  annotations: [
    {
      id: 'entrance',
      title: 'Main Entrance',
      description: 'Welcome to the building. This is the main entrance area.',
      position: [0, 0.5, 1.5],
      color: '#4CAF50',
      camera: {
        position: [0, 1.5, 4],
        target: [0, 0.5, 1.5],
        fov: 75,
      },
    },
    {
      id: 'lobby',
      title: 'Lobby',
      description: 'The main lobby area with reception desk.',
      position: [0, 1.5, 0],
      color: '#2196F3',
      camera: {
        position: [0, 2.5, 3],
        target: [0, 1.5, 0],
        fov: 75,
      },
    },
    {
      id: 'office-floor',
      title: 'Office Floor',
      description: 'Modern office spaces with collaborative workspaces.',
      position: [0, 3, 0],
      color: '#FF9800',
      camera: {
        position: [0, 4.5, 4],
        target: [0, 3, 0],
        fov: 75,
      },
    },
    {
      id: 'roof',
      title: 'Roof Terrace',
      description: 'Rooftop terrace with panoramic views.',
      position: [0, 6.5, 0],
      color: '#9C27B0',
      camera: {
        position: [0, 7.5, 5],
        target: [0, 6.5, 0],
        fov: 75,
      },
    },
  ],
};

/**
 * NEURON MODEL
 * Neural network/neuron visualization
 */
const neuronModel: ModelDefinition = {
  metadata: {
    id: 'neuron',
    name: 'Neural Network',
    path: '/assets/models/neuron/neuron.gltf',
    category: 'interactive',
    description: 'Interactive neuron structure visualization',
  },
  boundingBox: {
    width: 2.0,
    height: 2.0,
    depth: 2.0,
    center: [0, 0, 0],
    radius: 1.73,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 0.8,
  },
  defaultCamera: {
    position: [0, 0, 4],
    target: [0, 0, 0],
    fov: 75,
    distance: 4.8,
  },
};

/**
 * BOOK MODEL
 * Book object for resume/portfolio section
 */
const bookModel: ModelDefinition = {
  metadata: {
    id: 'book',
    name: 'Book',
    path: '/assets/models/book/book.gltf',
    category: 'interactive',
    description: 'Decorative book model for portfolio sections',
  },
  boundingBox: {
    width: 1.2,
    height: 1.8,
    depth: 0.3,
    center: [0, 0, 0],
    radius: 1.1,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1.2,
  },
  defaultCamera: {
    position: [0, 0, 3.5],
    target: [0, 0, 0],
    fov: 75,
    distance: 4.2,
  },
};

/**
 * UAV MODELS
 * Drone/UAV models for interactive display
 */
const uavModel: ModelDefinition = {
  metadata: {
    id: 'uav',
    name: 'UAV Drone',
    path: '/assets/models/uav/Meshy_AI_Make_a_engineering_ap_1230052632_generate.glb',
    category: 'interactive',
    description: 'Engineering-focused UAV visualization',
  },
  boundingBox: {
    width: 1.5,
    height: 1.0,
    depth: 1.5,
    center: [0, 0, 0],
    radius: 1.3,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1.0,
  },
  defaultCamera: {
    position: [2, 1.5, 2.5],
    target: [0, 0, 0],
    fov: 75,
    distance: 3.8,
  },
};

const droneModel: ModelDefinition = {
  metadata: {
    id: 'drone',
    name: 'Reconnaissance Drone',
    path: '/assets/models/super_cam__-_rusian_reconnaissance_drone.glb',
    category: 'interactive',
    description: 'Advanced reconnaissance drone model',
  },
  boundingBox: {
    width: 2.0,
    height: 0.5,
    depth: 1.8,
    center: [0, 0, 0],
    radius: 1.5,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1.0,
  },
  defaultCamera: {
    position: [2.5, 1.5, 2.5],
    target: [0, 0, 0],
    fov: 75,
    distance: 4.2,
  },
};

/**
 * ENVIRONMENT MODELS
 * Scene/environment models
 */
const futureIslandModel: ModelDefinition = {
  metadata: {
    id: 'future-island',
    name: 'Future Island',
    path: '/assets/models/future-island/scene.gltf',
    category: 'environment',
    description: 'Futuristic island environment scene',
  },
  boundingBox: {
    width: 50,
    height: 30,
    depth: 50,
    center: [0, 0, 0],
    radius: 43.3,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 0.1, // Large model, scaled down
  },
  defaultCamera: {
    position: [0, 15, 20],
    target: [0, 0, 0],
    fov: 60,
    distance: 25,
  },
};

const ventisModel: ModelDefinition = {
  metadata: {
    id: 'ventis',
    name: 'Ventis Structure',
    path: '/assets/models/ventis_3015_aj/scene.gltf',
    category: 'environment',
    description: 'Architectural structure model',
  },
  boundingBox: {
    width: 5.0,
    height: 4.0,
    depth: 5.0,
    center: [0, 0, 0],
    radius: 4.3,
  },
  defaultTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1.0,
  },
  defaultCamera: {
    position: [8, 3, 8],
    target: [0, 2, 0],
    fov: 75,
    distance: 11,
  },
};

/**
 * REGISTRY MAPPING
 * Maps model IDs to their definitions
 * Central lookup for all model metadata
 */
export const modelRegistry: Record<string, ModelDefinition> = {
  building: buildingModel,
  neuron: neuronModel,
  book: bookModel,
  uav: uavModel,
  drone: droneModel,
  'future-island': futureIslandModel,
  ventis: ventisModel,
};

/**
 * Get model definition by ID
 * Throws error if model not found
 */
export function getModelDefinition(id: string): ModelDefinition {
  const model = modelRegistry[id];
  if (!model) {
    throw new Error(`Model not found in registry: ${id}`);
  }
  return model;
}

/**
 * Get all models in a category
 */
export function getModelsByCategory(category: string): ModelDefinition[] {
  return Object.values(modelRegistry).filter(m => m.metadata.category === category);
}

/**
 * Get all model IDs
 */
export function getAllModelIds(): string[] {
  return Object.keys(modelRegistry);
}

/**
 * Get all models
 */
export function getAllModels(): ModelDefinition[] {
  return Object.values(modelRegistry);
}

/**
 * Check if model exists in registry
 */
export function hasModel(id: string): boolean {
  return id in modelRegistry;
}

/**
 * Get model path by ID
 */
export function getModelPath(id: string): string {
  return getModelDefinition(id).metadata.path;
}

/**
 * Get model bounds by ID
 */
export function getModelBounds(id: string): BoundingBoxInfo {
  return getModelDefinition(id).boundingBox;
}

/**
 * Get default camera config for model
 */
export function getDefaultCamera(id: string): CameraConfig {
  return getModelDefinition(id).defaultCamera;
}

/**
 * Get annotations for model
 */
export function getModelAnnotations(id: string): AnnotationPoint[] {
  return getModelDefinition(id).annotations ?? [];
}

/**
 * Get default transform for model
 */
export function getDefaultTransform(id: string): TransformConfig {
  return getModelDefinition(id).defaultTransform;
}
