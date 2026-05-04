'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import type { ParallaxScrollState } from '../hooks/useParallaxScroll';
import type { JobSection } from '@/lib/config/content';

interface ParallaxSidebarProps {
  /** Array of job sections */
  sections: JobSection[];
  /** Scroll state from useParallaxScroll */
  scrollState: ParallaxScrollState;
  /** Optional className */
  className?: string;
}

/**
 * ParallaxSidebar Component
 * Navigation sidebar for parallax resume layout
 *
 * Features:
 * - Section list with click navigation
 * - Smooth scroll to section
 * - Current section highlighting
 * - Progress indicator
 * - Collapsible on mobile
 *
 * @example
 * <ParallaxSidebar sections={resumeJobs} scrollState={scrollState} />
 */
export function ParallaxSidebar({
  sections,
  scrollState,
  className
}: ParallaxSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionClick = (index: number) => {
    // Calculate scroll position for section
    if (typeof window !== 'undefined') {
      const sectionHeight =
        (document.documentElement.scrollHeight - window.innerHeight) /
        (sections.length + 1);
      const targetScroll = sectionHeight * (index + 1); // +1 for hero
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleHeroClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed right-0 top-0 z-50 h-screen flex flex-col bg-background/95 backdrop-blur-lg border-l border-border transition-all duration-300 ${
        isOpen ? 'w-80' : 'w-20'
      } ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between h-20">
        {isOpen && (
          <div className="text-sm font-semibold text-foreground/80">Navigation</div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto p-2 hover:bg-background/50 rounded-lg transition-colors"
        >
          <ChevronRight
            className={`w-5 h-5 text-foreground/60 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <nav className="p-2 space-y-2">
          {/* Hero Link */}
          <button
            onClick={handleHeroClick}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              scrollState.sectionIndex === 0
                ? 'bg-primary/20 text-primary'
                : 'hover:bg-background/50 text-foreground/60'
            }`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {isOpen && <span className="text-sm font-medium">Hero</span>}
          </button>

          {/* Job Links */}
          {sections.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => handleSectionClick(idx)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                scrollState.sectionIndex === idx + 1
                  ? 'text-foreground'
                  : 'hover:bg-background/50 text-foreground/60'
              }`}
              style={{
                backgroundColor:
                  scrollState.sectionIndex === idx + 1
                    ? `${section.color}20`
                    : undefined,
                borderLeft:
                  scrollState.sectionIndex === idx + 1
                    ? `3px solid ${section.color}`
                    : undefined
              }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: section.color }}
              />
              {isOpen && (
                <span className="text-sm font-medium">{section.company}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer Progress */}
      {isOpen && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-foreground/60">
              <span>Progress</span>
              <span>{Math.round(scrollState.progress * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${scrollState.progress * 100}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-foreground/50">
            Section {scrollState.sectionIndex + 1} of {sections.length + 1}
          </p>
        </div>
      )}
    </div>
  );
}
