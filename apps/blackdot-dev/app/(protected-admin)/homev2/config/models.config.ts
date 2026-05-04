import type { ModelConfig } from '@/lib/threejs/utils/modelRegistry';
import { modelRegistry } from '@/lib/threejs/utils/modelRegistry';

/**
 * Model configurations for runway particles
 * Register custom models here to use them in the particle system
 */

export const PARTICLE_MODELS: ModelConfig[] = [
  // Default sphere models
  {
    id: 'sphere-default',
    type: 'sphere',
    radius: 1.5,
    segments: 16,
    scale: 0.5,
  },
  {
    id: 'sphere-small',
    type: 'sphere',
    radius: 0.5,
    segments: 8,
    scale: 0.5,
  },
  
  // Example: GLTF model (uncomment and provide path)
  // {
  //   id: 'aircraft-model',
  //   type: 'gltf',
  //   path: '/models/aircraft.glb',
  //   scale: 0.5,
  //   rotation: [0, Math.PI / 2, 0], // Rotate 90 degrees around Y
  // },
  
  // Example: Custom React component
  // {
  //   id: 'custom-particle',
  //   type: 'custom',
  //   component: MyCustomParticleComponent,
  //   scale: 1.0,
  // },
];

/**
 * Register all models in the registry
 */
export function registerParticleModels(): void {
  PARTICLE_MODELS.forEach(model => {
    modelRegistry.register(model);
  });
}

/**
 * Get default model ID
 */
export const DEFAULT_MODEL_ID = 'sphere-default';
