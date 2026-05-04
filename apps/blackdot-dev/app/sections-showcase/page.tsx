'use client';

/**
 * Sections Showcase Page
 *
 * Displays all section layout types with particle morphing transitions
 * - Cycles through: scroll-based → grid → carousel → timeline → gallery → scroll-based
 * - Each transition emits particles in a unique pattern
 * - 3D canvas with OrbitControls for camera interaction
 * - Mobile fallback with HTML grid layout
 */

import { Suspense, useState, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { sectionsShowcase } from '@/lib/config/content';
import SectionShowcaseCanvas from './components/SectionShowcaseCanvas';

const LAYOUT_TYPES = ['scroll-based', 'grid', 'carousel', 'timeline', 'gallery'] as const;

function SectionWrapper({ children, id }: { children: React.ReactNode; id: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, once: false });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      id={id}
    >
      {children}
    </motion.div>
  );
}

export default function SectionShowcasePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasKeyRef = useRef(0);

  const currentSection = sectionsShowcase[currentIndex];
  const currentLayoutType = LAYOUT_TYPES[currentIndex];

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + sectionsShowcase.length) % sectionsShowcase.length);
    canvasKeyRef.current += 1;
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % sectionsShowcase.length);
    canvasKeyRef.current += 1;
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-b from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Sections Showcase
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-2xl md:text-3xl font-semibold text-blue-300 mb-6">
              Interactive Layout Demonstrations
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              Explore five different layout types with particle morphing transitions.
              Navigate through each section to see unique visual patterns and 3D models.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <a
              href="#showcase"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              View Showcase
            </a>
          </motion.div>
        </div>
      </section>

      {/* Showcase Section */}
      <SectionWrapper id="showcase">
        <section className="w-full py-24 px-4 bg-gradient-to-b from-slate-900/50 to-slate-950">
          <div className="max-w-6xl mx-auto">
            {/* Canvas Container */}
            <div className="mb-12">
              <div className="inline-block relative mb-8">
                <h2 className="text-5xl font-bold text-white">Live Showcase</h2>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 w-32" />
              </div>

              <div className="relative w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl mb-8">
                {/* 3D Canvas */}
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
                        <p className="text-gray-400">Loading 3D scene...</p>
                      </div>
                    </div>
                  }
                >
                  <SectionShowcaseCanvas
                    key={canvasKeyRef.current}
                    section={currentSection}
                    layoutType={currentLayoutType}
                    isTransitioning={isTransitioning}
                  />
                </Suspense>

                {/* Layout Type Indicator */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-500/30">
                  <p className="text-sm font-semibold text-blue-300">
                    Layout: <span className="text-white">{currentLayoutType}</span>
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {sectionsShowcase.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'w-8 bg-blue-500'
                          : 'w-2 bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Section Info Panel */}
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 p-8 mb-8"
              >
                <div className="mb-6">
                  <h3 className="text-4xl font-bold text-white mb-2">
                    {currentSection.title}
                  </h3>
                  <p className="text-xl text-blue-300 mb-4">{currentSection.subtitle}</p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {typeof currentSection.content?.paragraphs?.[0] === 'string'
                      ? currentSection.content.paragraphs[0]
                      : currentSection.content?.paragraphs?.[0]?.description}
                  </p>
                </div>

                {/* Highlights */}
                {currentSection.content?.highlights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
                    {currentSection.content.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <p className="text-gray-300">
                          {typeof highlight === 'string' ? highlight : highlight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <button
                onClick={handlePrevious}
                disabled={isTransitioning}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>

              <div className="text-center">
                <p className="text-gray-400">
                  Section <span className="text-blue-300 font-semibold">{currentIndex + 1}</span> of{' '}
                  <span className="text-blue-300 font-semibold">{sectionsShowcase.length}</span>
                </p>
              </div>

              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Additional Info */}
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">About This Showcase</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-blue-300 font-semibold mb-2">Particle Transitions</h5>
                  <p className="text-gray-400">
                    Each section transition emits particles in a unique pattern specific to the layout type.
                    The particle behavior creates visual continuity between sections.
                  </p>
                </div>
                <div>
                  <h5 className="text-blue-300 font-semibold mb-2">3D Interaction</h5>
                  <p className="text-gray-400">
                    Use your mouse to orbit around the 3D models. Scroll to zoom in and out.
                    Each layout type features a different 3D model representing its characteristics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionWrapper>

      {/* Mobile Fallback */}
      <div className="md:hidden w-full py-12 px-4 bg-slate-950 border-t border-slate-700">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6">Layout Types</h3>
          <div className="space-y-4">
            {sectionsShowcase.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
              >
                <h4 className="text-lg font-semibold text-white mb-2">{section.title}</h4>
                <p className="text-sm text-gray-300 mb-3">{section.subtitle}</p>
                <p className="text-xs text-gray-400 italic">
                  {typeof section.content?.paragraphs?.[0] === 'string'
                    ? section.content.paragraphs[0]
                    : section.content?.paragraphs?.[0]?.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-4 border-t border-slate-700 bg-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            Built with Next.js, React Three Fiber, and Tailwind CSS
          </p>
          <p className="text-gray-600 text-sm mt-2">
            © 2024 Sections Showcase. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
