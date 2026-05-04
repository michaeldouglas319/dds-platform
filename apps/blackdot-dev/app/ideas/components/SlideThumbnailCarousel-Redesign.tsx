'use client';

/**
 * Slide Thumbnail Carousel
 * Horizontal scrolling thumbnails at bottom for quick navigation
 */

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UnifiedSection } from '@/lib/config/content';

interface SlideThumbnailCarouselProps {
  slides: UnifiedSection[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

function getThumbnailGradient(index: number): string {
  const gradients = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-green-500 to-green-700',
    'from-indigo-500 to-indigo-700',
    'from-cyan-500 to-cyan-700',
    'from-teal-500 to-teal-700',
    'from-amber-500 to-amber-700',
  ];
  return gradients[index % gradients.length];
}

export default function SlideThumbnailCarousel({
  slides,
  currentSlideIndex,
  onSelectSlide,
}: SlideThumbnailCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Auto-scroll to current slide when it changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentElement = scrollContainerRef.current.children[currentSlideIndex] as HTMLElement;
      if (currentElement) {
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const elementRect = currentElement.getBoundingClientRect();

        if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
          currentElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
          setTimeout(checkScroll, 300);
        }
      }
    }
  }, [currentSlideIndex]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative flex items-center gap-3 max-w-full">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gradient-to-r from-slate-900 via-slate-900 to-transparent hover:from-slate-800 transition-all text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto no-scrollbar flex-1 px-8 sm:px-0"
          style={{
            scrollBehavior: 'smooth',
            scrollPaddingLeft: '2rem',
          }}
        >
          {slides.map((slide, index) => (
            <motion.button
              key={slide.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSlide(index)}
              className={`flex-shrink-0 relative group transition-all duration-300 ${
                currentSlideIndex === index ? 'ring-2 ring-blue-400' : ''
              }`}
            >
              {/* Thumbnail */}
              <div
                className={`relative w-24 h-32 sm:w-28 sm:h-36 rounded-lg overflow-hidden transition-all duration-300 ${
                  currentSlideIndex === index ? 'ring-2 ring-blue-400' : 'hover:ring-1 hover:ring-slate-600'
                }`}
              >
                {/* Gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getThumbnailGradient(index)} opacity-70 group-hover:opacity-90 transition-opacity`}
                />

                {/* Number overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white/30">{(index + 1).toString().padStart(2, '0')}</span>
                  <span className="text-xs sm:text-sm text-white/30 mt-1 text-center px-1">
                    {slide.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>

                {/* Active indicator */}
                {currentSlideIndex === index && (
                  <motion.div
                    layoutId="active-thumbnail"
                    className="absolute inset-0 border-2 border-blue-400 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover glow */}
                {currentSlideIndex !== index && (
                  <div className="absolute inset-0 group-hover:bg-white/5 transition-colors rounded-lg" />
                )}
              </div>

              {/* Slide number label below thumbnail */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Slide {index + 1}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Right Scroll Button */}
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-gradient-to-l from-slate-900 via-slate-900 to-transparent hover:from-slate-800 transition-all text-white/60 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-gray-500 text-center mt-6">
        Click a thumbnail to jump to that slide, or use arrow keys to navigate
      </p>
    </div>
  );
}
