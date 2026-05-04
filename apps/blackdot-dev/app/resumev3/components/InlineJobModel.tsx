"use client"

/**
 * Inline Job Model Component
 * Wrapper for displaying job-specific models inline within job section cards
 * Maps job index to the correct model type
 */

import { InlineModelViewer } from './InlineModelViewer';
import { type ModelType } from '../scene/components/ModelRenderer';

interface InlineJobModelProps {
  jobIndex: number;
  jobsCount?: number;
  height?: number | string;
  className?: string;
}

/**
 * Maps job index to model type and texture URL
 */
function getModelConfigForJob(index: number): { modelType: ModelType; textureUrl?: string } {
  // Map job indices to model types (matching ScrollBasedResumeScene logic)
  switch (index) {
    case 0: // Tesla - Software Engineer
    case 1: // Tesla - Vision Engineering Technician
      return { modelType: 'tesla' };
    
    case 2: // Renewed Vision
      return { modelType: 'renewed-vision', textureUrl: '/assets/pictures/renewed-vision.png' };
    
    case 3: // Skyline Products
      return { modelType: 'skyline', textureUrl: '/assets/pictures/skyline-products.png' };
    
    case 4: // LAPP
      return { modelType: 'neural-network' };
    
    case 5: // Global Call Solutions
      return { modelType: 'gcs', textureUrl: '/assets/pictures/GCS+Logo+white+transparent.webp' };
    
    default:
      // Fallback to neural network for unknown indices
      return { modelType: 'neural-network' };
  }
}

/**
 * Inline Job Model
 * Displays the appropriate model for a given job index
 */
export function InlineJobModel({ jobIndex, jobsCount, height = 250, className = '' }: InlineJobModelProps) {
  const { modelType, textureUrl } = getModelConfigForJob(jobIndex);

  if (jobIndex < 0 || (jobsCount && jobIndex >= jobsCount)) {
    return null;
  }

  return (
    <div className={className}>
      <InlineModelViewer
        modelType={modelType}
        textureUrl={textureUrl}
        height={height}
        autoRotate={false}
      />
    </div>
  );
}

