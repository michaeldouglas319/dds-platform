import type { ModelType } from '@/lib/config/models/resumeModels.config';

/**
 * Carousel Model Configuration
 * Maps unique models to their corresponding job sections
 * Used for the hero section carousel display
 */

export interface CarouselModelConfig {
  modelType: ModelType;
  jobIndex: number; // Index in resumeJobs array
  jobId: string; // Job ID for scrolling
  color: string; // Company color
  textureUrl?: string; // Optional texture URL for image-based logos
}

/**
 * Unique model configurations for carousel
 * Each model appears once, mapped to its first occurrence in resumeJobs
 */
export const carouselModels: CarouselModelConfig[] = [
  {
    modelType: 'tesla',
    jobIndex: 0, // First Tesla job (Software Engineer)
    jobId: 'tesla',
    color: '#cc0000', // Tesla red
  },
  {
    modelType: 'renewed-vision',
    jobIndex: 2, // Renewed Vision (index 2 in resumeJobs)
    jobId: 'renewed-vision',
    color: '#6366f1',
    textureUrl: '/assets/pictures/renewed-vision.png',
  },
  {
    modelType: 'skyline',
    jobIndex: 3, // Skyline Products (index 3 in resumeJobs)
    jobId: 'skyline',
    color: '#10b981',
    textureUrl: '/assets/pictures/skyline-products.png',
  },
  {
    modelType: 'neural-network',
    jobIndex: 4, // LAPP (index 4 in resumeJobs)
    jobId: 'lapp',
    color: '#f59e0b',
  },
  {
    modelType: 'gcs',
    jobIndex: 5, // Global Call Solutions (index 5 in resumeJobs)
    jobId: 'global-call',
    color: '#8b5cf6',
    textureUrl: '/assets/pictures/GCS+Logo+white+transparent.webp',
  },
];

