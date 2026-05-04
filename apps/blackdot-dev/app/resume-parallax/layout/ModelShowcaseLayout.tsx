'use client'

import { Suspense, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary'
import { resumeJobs } from '@/lib/config/content'
import { useModelShowcase } from '../hooks/useModelShowcase'
import { ShowcaseScene } from '../scene/ShowcaseScene'
import { CanvasWrapper } from './CanvasWrapper'

/**
 * ModelShowcaseLayout Component
 *
 * 3D scene-based resume showcase layout with:
 * - Multiple job cards visible simultaneously in 3D space
 * - Cards rendered IN Canvas using Html component
 * - Central model with decorative rotating rings
 * - Spatial card arrangement in arc layout
 *
 * Features:
 * - Canvas-based 3D scene with Fiber
 * - Html component for card rendering
 * - Decorative ring animations
 * - Click-to-select navigation
 * - Glass-morphism design system integration
 * - Responsive and performant
 */
export function ModelShowcaseLayout() {
  const {
    activeIndex,
    totalJobs,
    setActiveIndex,
    navigateNext,
    navigatePrev
  } = useModelShowcase(resumeJobs)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        navigateNext()
      } else if (event.key === 'ArrowLeft') {
        navigatePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateNext, navigatePrev])

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* 3D Canvas Scene */}
      <SceneErrorBoundary>
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-foreground/60 mb-4">Loading 3D scene...</p>
                <div className="w-12 h-12 border-3 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto" />
              </div>
            </div>
          }
        >
          <CanvasWrapper
            camera={{
              position: [0, 4, 16],
              fov: 60
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'default',
              stencil: false,
              preserveDrawingBuffer: false
            }}
          >
            <ShowcaseScene
              jobs={resumeJobs}
              selectedIndex={activeIndex}
              onSelectJob={setActiveIndex}
            />

            {/* LAYER 7: OrbitControls */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI * 0.55}
              minPolarAngle={Math.PI * 0.3}
              autoRotate={false}
            />
          </CanvasWrapper>
        </Suspense>
      </SceneErrorBoundary>

      {/* Navigation Controls - Bottom Center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 z-10">
        {/* Previous Button */}
        <button
          onClick={navigatePrev}
          className="group p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 text-foreground/70 hover:text-foreground hover:scale-110 active:scale-95"
          aria-label="Previous job"
          title="Previous (← Arrow)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Counter */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{activeIndex + 1}</p>
            <p className="text-xs text-foreground/50">of {totalJobs}</p>
          </div>

          {/* Progress Dots */}
          <div className="flex gap-2 ml-2">
            {Array.from({ length: totalJobs }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 bg-white/60'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to job ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={navigateNext}
          className="group p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all duration-300 text-foreground/70 hover:text-foreground hover:scale-110 active:scale-95"
          aria-label="Next job"
          title="Next (→ Arrow)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Help Text - Bottom Right */}
      <div className="absolute bottom-8 right-8 text-xs text-foreground/40 z-10 text-right">
        <p>← → Arrow keys</p>
        <p>or click dots</p>
      </div>
    </div>
  )
}
