'use client'

/**
 * Ideas V3 Layout - Redesigned
 * Uses the new modern pitch deck viewer with efficient model loading
 * Replaces UnifiedScrollLayout with the redesigned carousel experience
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ideasPitchDeckExtended } from '../config/ideasPitchDeck-extended.config';
import PitchDeckSlideViewerRedesign from '../components/PitchDeckSlideViewer-Redesign';
import SlideThumbnailCarouselRedesign from '../components/SlideThumbnailCarousel-Redesign';
import type { UnifiedSection } from '@/lib/config/content';

/**
 * Ideas V3 Layout
 * Modern redesigned carousel with model loading
 */
export default function IdeaV3Layout() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slides = ideasPitchDeckExtended as UnifiedSection[];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const goToPreviousSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
    return <div className="w-full h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Main Content */}
      <div className="relative">
        {/* Main Slide Viewer */}
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-6xl">
              <PitchDeckSlideViewerRedesign
                slide={currentSlide}
                slideNumber={currentSlideIndex + 1}
                totalSlides={slides.length}
              />
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-t from-slate-950 to-transparent">
            <button
              onClick={goToPreviousSlide}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 transition-all text-white border border-slate-700/50 hover:border-slate-600"
              title="Previous slide (← key)"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex flex-col items-center gap-4">
              {/* Slide Number Card */}
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-lg px-8 py-4 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-5xl md:text-6xl font-bold text-white/30 -mb-2">
                    {(currentSlideIndex + 1).toString().padStart(2, '0')}
                  </p>
                  <p className="text-gray-300 text-sm">
                    of <span className="font-semibold text-white">{slides.length}</span>
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-xs">Use arrow keys to navigate</p>
            </div>

            <button
              onClick={goToNextSlide}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-700 transition-all text-white border border-blue-500/50"
              title="Next slide (→ key)"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Thumbnail Carousel */}
        <div className="bg-gradient-to-t from-slate-950 to-slate-900/50 border-t border-slate-800/50 backdrop-blur-sm sticky bottom-0 left-0 right-0">
          <SlideThumbnailCarouselRedesign
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSelectSlide={setCurrentSlideIndex}
          />
        </div>
      </div>
    </div>
  );
}

export { IdeaV3Layout };
