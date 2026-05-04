'use client';

import { Suspense, useMemo } from 'react';
import { useParallaxScroll } from '../hooks/useParallaxScroll';
import { ParallaxScrollContainer } from '../components/ParallaxScrollContainer';
import { ParallaxResumeScene } from '../scene/ParallaxResumeScene';
import { ParallaxSidebar } from '../components/ParallaxSidebar';
import { ParallaxProgressHUD } from '../components/ParallaxProgressHUD';
import { resumeJobs } from '@/lib/config/content';
import { useMobileDetection } from '@/hooks';

/**
 * ParallaxResumeLayout Component
 * Main layout for parallax resume page
 *
 * Architecture:
 * - Desktop: Fixed 3D canvas with parallax scroll
 * - Mobile: Traditional scroll with inline models
 *
 * @example
 * export default function ResumeParallaxPage() {
 *   return <ParallaxResumeLayout />;
 * }
 */
export function ParallaxResumeLayout() {
  // Calculate total sections: 1 hero + job count
  const totalSections = resumeJobs.length + 1;

  // Initialize scroll state
  const scrollState = useParallaxScroll(totalSections);

  // Detect mobile for fallback rendering
  const isMobile = useMobileDetection(1024);

  // Memoize scene configuration
  const sceneConfig = useMemo(
    () => ({
      jobCount: resumeJobs.length // Will be used by JobBlock components
    }),
    []
  );

  if (isMobile) {
    // Mobile fallback: Traditional scroll layout
    return (
      <div className="w-full bg-background">
        <MobileParallaxFallback jobs={resumeJobs} />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-foreground/60 mb-2">Loading parallax scene...</p>
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <div className="relative">
        <ParallaxScrollContainer
          totalSections={totalSections}
          sectionHeightFactor={2.5}
          scrollState={scrollState}
        >
          <ParallaxResumeScene scrollState={scrollState} />
        </ParallaxScrollContainer>

        {/* Navigation Sidebar */}
        <ParallaxSidebar sections={resumeJobs} scrollState={scrollState} />

        {/* Progress HUD */}
        <ParallaxProgressHUD sections={resumeJobs} scrollState={scrollState} />
      </div>
    </Suspense>
  );
}

/**
 * Mobile Fallback Component
 * Traditional scroll-based resume for mobile devices
 * Provides same content as parallax layout but without 3D
 */
function MobileParallaxFallback({
  jobs
}: {
  jobs: typeof resumeJobs;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border p-6 mb-8">
        <h1 className="text-4xl font-black tracking-tighter mb-2">Resume</h1>
        <p className="text-base text-foreground/60">
          Parallax - Scroll to explore positions
        </p>
      </section>

      {/* Jobs List */}
      <div className="space-y-6 px-4 pb-12">
        {jobs.map((job, idx) => (
          <div
            key={job.id}
            className="bg-background/50 backdrop-blur-lg border border-border rounded-xl p-6 space-y-4 animate-fade-in transition-all"
            style={{
              animationDelay: `${idx * 0.05}s`,
              borderLeftWidth: '4px',
              borderLeftColor: job.color
            }}
          >
            {/* Header */}
            <div className="space-y-2">
              <h2
                className="text-2xl font-black tracking-tight"
                style={{ color: job.color }}
              >
                {job.company}
              </h2>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground/80">
                  {job.role}
                </h3>
                <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                  {job.period}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Content */}
            <div className="space-y-3">
              <p className="text-base font-semibold text-foreground/90">
                {job.content.heading}
              </p>

              {job.content.paragraphs.map((para, pIdx) => (
                <p
                  key={pIdx}
                  className="text-sm text-foreground/70 leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Highlights */}
            {job.content.highlights && job.content.highlights.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
                  Key Skills
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {job.content.highlights.map((highlight, hIdx) => (
                    <div
                      key={hIdx}
                      className="flex items-start gap-2 text-xs text-foreground/70"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: job.color }}
                      />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center py-8 text-foreground/40 text-sm">
          <p>End of resume • Try the desktop version for 3D parallax effect</p>
        </div>
      </div>
    </div>
  );
}
