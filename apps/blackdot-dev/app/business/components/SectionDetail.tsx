"use client";

import { useResponsiveOffset } from '@/hooks/useResponsiveOffset';
import { getSectionsByPage } from '@/lib/portfolio/config/sections.config';
import { BusinessOverviewScene } from '../scene/BusinessOverviewScene';
import { BusinessOverviewSceneWithBase } from '../scene/BusinessOverviewSceneWithBase';

/**
 * Business Section Detail Component
 * Handles drilldown routes for business sections
 * TODO: Implement SectionDetailBase component for full functionality
 */
export default function BusinessSectionDetail() {
  const { modelOffset } = useResponsiveOffset();
  const businessSections = getSectionsByPage('business');

  // Placeholder implementation - SectionDetailBase component needs to be created
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Business Section Detail</h1>
        <p className="text-muted-foreground">
          Section detail view for business sections. 
          {businessSections.length > 0 && ` Found ${businessSections.length} sections.`}
        </p>
      </div>
    </div>
  );
}

