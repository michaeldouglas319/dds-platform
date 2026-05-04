'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface PitchDeckSectionCardProps {
  id: string;
  heading: string;
  color?: string;
  subtitle?: string;
  children: ReactNode;
  onNext?: () => void;
  showNextButton?: boolean;
  nextButtonText?: string;
  additionalActions?: ReactNode;
  className?: string;
}

/**
 * Reusable section card component for pitch deck presentations
 * Provides consistent glass-morphism styling and navigation
 */
export function PitchDeckSectionCard({
  id,
  heading,
  color = '#ffffff',
  subtitle,
  children,
  onNext,
  showNextButton = true,
  nextButtonText = 'Next →',
  additionalActions,
  className = '',
}: PitchDeckSectionCardProps) {
  return (
    <div className={`bg-background/90 backdrop-blur-lg border border-border rounded-lg p-8 shadow-xl max-w-2xl mx-auto lg:mx-0 ${className}`}>
      <div className="mb-6">
        <h2 className="text-4xl font-black mb-2" style={{ color }}>
          {heading}
        </h2>
        {subtitle && (
          <p className="text-2xl font-semibold text-foreground/80 mb-2">{subtitle}</p>
        )}
      </div>

      {children}

      <div className="flex flex-col gap-2">
        {showNextButton && onNext && (
          <Button
            onClick={onNext}
            className="w-full md:w-auto"
            style={{ backgroundColor: color }}
          >
            {nextButtonText}
          </Button>
        )}
        {additionalActions}
      </div>
    </div>
  );
}
