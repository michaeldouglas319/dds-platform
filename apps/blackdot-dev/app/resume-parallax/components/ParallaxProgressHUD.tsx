'use client';

import type { ParallaxScrollState } from '../hooks/useParallaxScroll';
import type { JobSection } from '@/lib/config/content';

interface ParallaxProgressHUDProps {
  /** Array of job sections */
  sections: JobSection[];
  /** Scroll state from useParallaxScroll */
  scrollState: ParallaxScrollState;
  /** Optional className */
  className?: string;
}

/**
 * ParallaxProgressHUD Component
 * Displays current section info and scroll progress
 *
 * Features:
 * - Current section name and color
 * - Scroll progress indicator
 * - Percentage complete
 * - Animated progress bar
 *
 * Position: Bottom-left corner
 *
 * @example
 * <ParallaxProgressHUD sections={resumeJobs} scrollState={scrollState} />
 */
export function ParallaxProgressHUD({
  sections,
  scrollState,
  className
}: ParallaxProgressHUDProps) {
  const currentSectionIdx = scrollState.sectionIndex;
  const isHero = currentSectionIdx === 0;
  const currentSection =
    !isHero && currentSectionIdx - 1 < sections.length
      ? sections[currentSectionIdx - 1]
      : null;

  return (
    <div
      className={`fixed bottom-8 left-8 z-40 bg-background/80 backdrop-blur-lg border border-border rounded-xl p-6 max-w-xs space-y-4 ${className}`}
    >
      {/* Current Section */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
          {isHero ? 'Hero Section' : 'Current Position'}
        </p>
        <div className="space-y-1">
          <h3
            className="text-2xl font-black tracking-tight"
            style={{ color: currentSection?.color || '#888' }}
          >
            {isHero ? 'Parallax' : currentSection?.company}
          </h3>
          {!isHero && currentSection && (
            <p className="text-sm text-foreground/60">{currentSection.role}</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-foreground/60">
          <span>Journey Progress</span>
          <span className="font-semibold">{Math.round(scrollState.progress * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${scrollState.progress * 100}%` }}
          />
        </div>
      </div>

      {/* Section Counter */}
      <div className="flex justify-between items-center text-xs text-foreground/60">
        <span>Section</span>
        <span className="font-mono font-semibold">
          {currentSectionIdx + 1} / {sections.length + 1}
        </span>
      </div>

      {/* Scroll Indicator */}
      {scrollState.progress < 1 && (
        <div className="pt-2 border-t border-border text-xs text-foreground/50">
          <span className="inline-block animate-pulse">↓ Keep scrolling to explore</span>
        </div>
      )}

      {scrollState.progress >= 1 && (
        <div className="pt-2 border-t border-border text-xs text-foreground/50">
          <span className="inline-block">✓ Journey complete!</span>
        </div>
      )}
    </div>
  );
}
