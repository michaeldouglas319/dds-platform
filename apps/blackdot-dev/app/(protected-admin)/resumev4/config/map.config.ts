/**
 * Resume V4 - Interactive Map Configuration
 * Inspired by Plateforme 10 Interactive Map (https://github.com/Kirilbt/interactive-map)
 *
 * This config defines the spatial layout of resume experiences in 3D space,
 * with annotation markers for each job position.
 */

import type { ModelType } from '@/lib/config/models/resumeModels.config';
import { resumeJobs } from '@/app/constants/resumeData.config';

export interface MapAnnotation {
  id: string;
  position: [number, number, number];
  label: string;
  company: string;
  enabled: boolean; // For graceful handling of missing/incomplete data
}

export interface MapJobPosition {
  jobId: string;
  position: [number, number, number];
  annotation: MapAnnotation;
  modelType?: ModelType;
  modelPath?: string;
  textureUrl?: string;
  scale?: number;
  rotation?: [number, number, number];
}

/**
 * Camera configuration for the interactive map
 */
export const CAMERA_CONFIG = {
  defaultPosition: [0, 5, 10] as [number, number, number],
  defaultTarget: [0, 0, 0] as [number, number, number],
  minDistance: 5,
  maxDistance: 30,
  enableDamping: true,
  dampingFactor: 0.05,
  enablePan: true,
  enableZoom: true,
  enableRotate: true,
  autoRotate: false,
  autoRotateSpeed: 0.5,
} as const;

/**
 * Annotation marker styling
 */
export const ANNOTATION_CONFIG = {
  markerSize: 0.3,
  markerColor: '#ffffff',
  markerOpacity: 0.9,
  labelOffset: 0.5,
  hoverScale: 1.2,
  activeColor: '#3b82f6',
  inactiveColor: '#6b7280',
} as const;

/**
 * Map layout configuration - arranges jobs spatially
 *
 * Layout pattern: Spiral outward from center
 * - Recent jobs closer to center
 * - Older jobs farther out
 * - Y-axis represents career progression height
 */
export const createMapLayout = (): MapJobPosition[] => {
  return resumeJobs.map((job, index) => {
    // Calculate spiral position
    const angle = index * (Math.PI / 3); // 60 degrees apart
    const radius = 3 + index * 1.5; // Spiral outward
    const height = 0.5 + index * 0.3; // Slight elevation increase

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    return {
      jobId: job.id,
      position: [x, height, z],
      annotation: {
        id: `annotation-${job.id}`,
        position: [x, height + 1.5, z], // Annotation floats above model
        label: job.role,
        company: job.company,
        enabled: true, // All annotations enabled by default
      },
      modelType: job.modelType,
      modelPath: job.modelPath,
      textureUrl: job.textureUrl,
      scale: 0.8,
      rotation: [0, angle, 0], // Models face outward from center
    };
  });
};

/**
 * Get map layout with graceful fallback for missing data
 */
export const getMapLayout = (): MapJobPosition[] => {
  try {
    const layout = createMapLayout();

    // Filter out positions with critical missing data
    return layout.map(position => ({
      ...position,
      annotation: {
        ...position.annotation,
        // Gracefully handle missing labels
        label: position.annotation.label || 'Position',
        company: position.annotation.company || 'Company',
        // Only enable if we have required data
        enabled: Boolean(position.annotation.label && position.annotation.company),
      },
    }));
  } catch (error) {
    console.warn('Error creating map layout, returning empty layout:', error);
    return [];
  }
};

/**
 * Find job position by ID
 */
export const getJobPosition = (jobId: string): MapJobPosition | undefined => {
  const layout = getMapLayout();
  return layout.find(pos => pos.jobId === jobId);
};

/**
 * Get all enabled annotations
 */
export const getEnabledAnnotations = (): MapAnnotation[] => {
  const layout = getMapLayout();
  return layout
    .map(pos => pos.annotation)
    .filter(annotation => annotation.enabled);
};
