'use client';

import { useEffect } from 'react';
import { SectionModelViewer } from '@/lib/components/SectionModelViewer';
import { usePathnameBreadcrumbs, useNavigationVisibility } from '@/lib/contexts';

/**
 * Business Page Layout - Gold Standard
 * Professional 3D model viewer with discrete section navigation
 *
 * Features:
 * - Full-screen 3D canvas with centered model
 * - Right-side info panel with section details
 * - Discrete section navigation (scroll or dots)
 * - Smooth spring animations
 * - Mobile responsive
 * - Production optimized
 *
 * Pattern: https://codesandbox.io/s/ioxywi (shader customizer)
 */
export default function BusinessLayout() {
  const { setVariant, setShowBreadcrumbs } = useNavigationVisibility();

  // Set breadcrumbs for business page
  usePathnameBreadcrumbs();

  // Use hidden navigation for full-screen 3D showcase
  useEffect(() => {
    setVariant('hidden');
    setShowBreadcrumbs(false);

    return () => {
      setVariant('full');
      setShowBreadcrumbs(true);
    };
  }, [setVariant, setShowBreadcrumbs]);

  return (
    <SectionModelViewer
      page="business"
      pageLabel="Business Model"
      emptyMessage="No business sections configured"
      useSectionTitles={true}
      cyclingTimeInView={3}
      syncWithActiveSection={false} // Set to true to show active section title instead of cycling
    />
  );
}

