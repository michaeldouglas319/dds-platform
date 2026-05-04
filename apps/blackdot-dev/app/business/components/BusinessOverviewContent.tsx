'use client';

import { OverviewContent } from '@/components/PitchDeck';
import { businessSections } from '../config/businessData.config';
import { Building2, Zap, Target, Rocket } from 'lucide-react';

/**
 * Business Overview Content Component
 * Wrapper around generic OverviewContent component
 * Scroll-based pitch deck style presentation with business-specific configuration
 */
export function BusinessOverviewContent() {
  return (
    <OverviewContent
      sections={businessSections.map((section) => ({
        id: section.id,
        heading: section.content.heading || section.title,
        title: section.title,
        subtitle: section.subtitle,
        color: section.color || '#3b82f6',
        paragraphs: section.content.paragraphs,
        highlights: section.content.highlights,
      }))}
      hero={{
        id: 'business-hero',
        title: 'Production Strategy',
        subtitle: 'Transforming Innovation into Scalable Solutions',
        avatarFallback: <Building2 className="w-12 h-12" />,
        stats: [
          {
            icon: <Target className="w-4 h-4" />,
            label: `${businessSections.length} Strategic Phases`,
          },
          {
            icon: <Zap className="w-4 h-4" />,
            label: 'Gold Standard Production',
          },
          {
            icon: <Rocket className="w-4 h-4" />,
            label: 'Scalable & Efficient',
          },
        ],
      }}
      nextButtonText="Next Phase →"
    />
  );
}

