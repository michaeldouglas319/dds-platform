"use client"

/**
 * Inline Model Grid Component
 * Displays all carousel models in a static grid for mobile hero section
 * Clickable cards that navigate to their corresponding job sections
 */

import { carouselModels } from '../scene/components/carouselModels.config';
import { InlineModelViewer } from './InlineModelViewer';
import { cn } from '@/lib/utils';

interface InlineModelGridProps {
  onModelClick?: (jobIndex: number, jobId: string) => void;
  className?: string;
}

/**
 * Inline Model Grid
 * Static grid display of all unique models for hero section on mobile
 */
export function InlineModelGrid({ onModelClick, className = '' }: InlineModelGridProps) {
  const handleClick = (jobIndex: number, jobId: string) => {
    if (onModelClick) {
      onModelClick(jobIndex, jobId);
    } else {
      // Fallback: scroll to section
      const element = document.getElementById(jobId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-lg font-bold mb-4 text-foreground/90">Professional Experience</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {carouselModels.map((model) => (
          <div
            key={model.jobId}
            className="group cursor-pointer"
            onClick={() => handleClick(model.jobIndex + 1, model.jobId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(model.jobIndex + 1, model.jobId);
              }
            }}
          >
            <InlineModelViewer
              modelType={model.modelType}
              textureUrl={model.textureUrl}
              height={200}
              autoRotate={false}
              className="transition-transform group-hover:scale-105"
            />
            <div className="mt-2 text-center">
              <p className="text-xs font-medium text-foreground/80 truncate">
                {model.jobId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

