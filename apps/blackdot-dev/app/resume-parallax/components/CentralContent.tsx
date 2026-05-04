'use client';

import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import type { JobSection } from '@/lib/config/content';

interface CentralContentProps {
  /** Currently selected job (can be null for hero) */
  selectedJob: JobSection | null;
  /** Total number of cards */
  totalCards: number;
  /** Current selection index */
  selectedIndex: number;
  /** Callback to advance to next card */
  onNext: () => void;
  /** Callback to go to previous card */
  onPrevious: () => void;
}

/**
 * Hook for responsive HTML scale based on window width
 */
function useResponsiveHtmlScale() {
  const [scale, setScale] = useState(0.15);

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const baseWidth = 1920;
      const baseScale = 0.15;
      const scaleFactor = Math.min(width / baseWidth, 2);
      setScale(baseScale * scaleFactor);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return scale;
}

/**
 * CentralContent Component
 * Displays detailed information about selected job in center of orbit
 *
 * Features:
 * - Shows full job details (vs card summary)
 * - Navigation controls (prev/next buttons)
 * - Progress indicator (X of Y cards)
 * - Smooth transitions between jobs
 * - Responsive layout
 *
 * Design:
 * - Centered glass panel
 * - Large readable text
 * - Full content display (all paragraphs, all skills)
 * - Navigation controls
 *
 * @example
 * <CentralContent
 *   selectedJob={jobs[selectedIndex]}
 *   totalCards={jobs.length}
 *   selectedIndex={selectedIndex}
 *   onNext={nextCard}
 *   onPrevious={previousCard}
 * />
 */
export function CentralContent({
  selectedJob,
  totalCards,
  selectedIndex,
  onNext,
  onPrevious
}: CentralContentProps) {
  const htmlScale = useResponsiveHtmlScale();

  return (
    <Html position={[0, 0, 0]} transform scale={htmlScale}>
      <div className="w-screen max-w-2xl mx-auto">
        {/* Hero Content - Empty state */}
        {!selectedJob && (
          <div className="bg-background/90 backdrop-blur-lg border border-border rounded-xl p-8 text-center space-y-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Parallax Resume
              </h1>
              <p className="text-base text-foreground/70">
                Explore my professional journey
              </p>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <p className="text-sm text-foreground/60">
                Click on any card in the orbit to view details
              </p>
              <p className="text-xs text-foreground/40">
                {totalCards} positions • 7+ years experience
              </p>
            </div>
          </div>
        )}

        {/* Selected Job Content */}
        {selectedJob && (
          <div className="bg-background/90 backdrop-blur-lg border border-border rounded-xl p-8 space-y-6">
            {/* Header */}
            <div>
              <h1
                className="text-4xl font-black tracking-tight mb-2"
                style={{ color: selectedJob.color }}
              >
                {selectedJob.company}
              </h1>
              <h2 className="text-2xl font-semibold text-foreground/80 mb-2">
                {selectedJob.role}
              </h2>
              <p className="text-sm text-foreground/60">{selectedJob.period}</p>
            </div>

            <div className="h-px bg-border" />

            {/* Content */}
            <div className="space-y-4">
              <p className="text-base font-semibold text-foreground/90">
                {selectedJob.content.heading}
              </p>

              {selectedJob.content.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-sm text-foreground/70 leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Skills */}
            {selectedJob.content.highlights &&
              selectedJob.content.highlights.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <p className="text-sm font-semibold text-foreground/80">
                    Key Skills
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedJob.content.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: selectedJob.color }}
                        />
                        <span className="text-foreground/70">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Navigation */}
            <div className="space-y-3 pt-4 border-t border-border">
              <p className="text-xs text-foreground/50 text-center">
                {selectedIndex + 1} of {totalCards}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={onPrevious}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground/80 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={onNext}
                  className="px-4 py-2 text-sm font-semibold rounded-lg"
                  style={{
                    backgroundColor: selectedJob.color + '20',
                    color: selectedJob.color,
                    border: `1px solid ${selectedJob.color}40`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = selectedJob.color + '40';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selectedJob.color + '20';
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}
