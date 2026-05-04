"use client"

import { BaseScene } from '@/components/shared/layouts/BaseScene';
import { ResumeV3ScenePortal } from './ResumeV3ScenePortal';
import { ScrollBasedResumeScene } from './components/ScrollBasedResumeScene';

interface ResumeV3SceneWithBaseProps {
  currentSection?: number;
  scrollProgress?: number;
  modelOffset?: number;
  onCarouselCardClick?: (jobIndex: number, jobId: string) => void;
}

/**
 * ResumeV3SceneWithBase - Wraps ScrollBasedResumeScene with BaseScene for portal compatibility
 * This allows the scene to work in both overview cards (portal) and full page (detail)
 * Uses scroll-based navigation similar to UAV pitch deck style
 */
export function ResumeV3SceneWithBase({ 
  currentSection = 0, 
  scrollProgress = 0,
  modelOffset = 0,
  onCarouselCardClick
}: ResumeV3SceneWithBaseProps) {
  return (
    <BaseScene
      portalContent={<ResumeV3ScenePortal />}
      detailContent={
        <ScrollBasedResumeScene 
          currentSection={currentSection}
          scrollProgress={scrollProgress}
          modelOffset={modelOffset}
          onCarouselCardClick={onCarouselCardClick}
        />
      }
      lighting={{
        ambientIntensity: { portal: 1.2, detail: 0.8 },
        directionalIntensity: { portal: 1.5, detail: 1.0 },
        directionalPosition: [5, 5, 5],
        castShadows: true,
      }}
      floor={{
        enabled: false, // No floor for cleaner view
      }}
      environment="city"
      fog={{
        enabled: false, // No fog for cleaner view
      }}
      contentPosition={[0, 0, 0]}
      portalContentPosition={[0, 0, 0]}
      disableBackground={false}
    />
  );
}

