'use client'

import { useEffect, useState } from 'react'
import { usePathnameBreadcrumbs, useNavigationVisibility } from '@/lib/contexts'
import { useResponsiveCamera } from '@/lib/hooks/useResponsiveCamera'
import { Scene3D } from '../scene/Scene3D'
import { ThreeDLoadingOverlay, LoadingPresets } from '@/components/loading/ThreeDLoadingOverlay'

/**
 * Landing page v3 - Minimalist aircraft-focused design
 * Inspired by https://github.com/A-HK/threejs-drone-landing-page
 */
export function LandingLayout() {
  const { setVariant, setShowBreadcrumbs, setIsVisible } = useNavigationVisibility()
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Responsive camera for different screen sizes
  const [cameraPos, cameraFov] = useResponsiveCamera({
    basePosition: [0, 6, 18],
    baseFov: 50,
    breakpoints: [
      { width: 0, yPosition: 1, fov: 45 },      // Mobile
      { width: 640, yPosition: 2, fov: 48 },    // Tablet
      { width: 1024, yPosition: 4, fov: 50 },   // Desktop
      { width: 1536, yPosition: 6, fov: 52 },   // Large desktop
    ],
    debounceDelay: 150,
  })

  usePathnameBreadcrumbs()

  // Minimize navigation UI for landing page
  useEffect(() => {
    setVariant('minimal')
    setShowBreadcrumbs(false)
    setIsVisible(false)

    // Clear loading state after brief delay
    const timer = setTimeout(() => setIsInitialLoad(false), 300)
    return () => {
      clearTimeout(timer)
      setVariant('full')
      setShowBreadcrumbs(true)
      setIsVisible(true)
    }
  }, [setVariant, setShowBreadcrumbs, setIsVisible])

  return (
    <div
      className="w-full h-screen overflow-hidden"
      style={{
        background: 'linear-gradient(15deg, #0a0a0a 0%, #444 100%)',
      }}
    >
      {/* Hero Section - Full screen Canvas with Text Overlay */}
      <div className="relative w-full h-screen">
        {/* Background Layer - Static text behind canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight leading-tight select-none" style={{
            color: '#00ffff',
            opacity: 0.08,
            fontFamily: '"Thunder", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
          }}>
            AIRCRAFT
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-5">
          <Scene3D
            cameraPos={cameraPos}
            cameraFov={cameraFov}
            backgroundColor="transparent"
          />
        </div>

        {/* Mobile Background Layer - Title + Separator + Subtitle behind model (md and below) */}
        <div className="md:hidden absolute inset-0 z-10 flex flex-col items-center justify-center w-full h-full p-5 sm:p-8 pointer-events-none">
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-center"
            style={{
              color: '#00ffff',
              fontFamily: '"Thunder", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            NOT JUST<br />ANY<br />ORDINARY<br />AIRCRAFT
          </h1>

          {/* Cyan line separator */}
          <div
            className="mt-6 h-1 w-16 mx-auto"
            style={{ backgroundColor: '#00ffff' }}
          />

          {/* Subtitle */}
          <p
            className="mt-6 text-xs sm:text-sm tracking-widest"
            style={{ color: '#00ffff' }}
          >
            EXPLORE EXCELLENCE
          </p>
        </div>

        {/* Foreground Layer - Interactive elements */}
        <div className="absolute inset-0 z-20">
          {/* Mobile: V3 Label only (md and below) */}
          <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center w-full h-full">
            <div
              className="text-5xl sm:text-6xl font-black"
              style={{ color: '#252525' }}
            >
              V3
            </div>
            <p
              className="mt-2 text-xs sm:text-sm tracking-widest"
              style={{ color: '#00ffff' }}
            >
              AIRCRAFT
            </p>
          </div>

          {/* Desktop side-by-side layout (md and up) */}
          <div className="hidden md:flex absolute inset-0 items-stretch justify-between w-full h-full">
            {/* Left Column - Bold Text */}
            <div className="flex flex-col justify-center items-start p-12 lg:p-20 text-left">
              <h1
                className="text-5xl lg:text-7xl font-black tracking-tight leading-tight"
                style={{
                  color: '#00ffff',
                  fontFamily: '"Thunder", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                }}
              >
                NOT JUST<br />ANY<br />ORDINARY<br />AIRCRAFT
              </h1>

              {/* Cyan line separator */}
              <div
                className="mt-8 h-1 w-16"
                style={{ backgroundColor: '#00ffff' }}
              />

              {/* Subtitle */}
              <p
                className="mt-8 text-sm md:text-base tracking-widest"
                style={{ color: '#00ffff' }}
              >
                EXPLORE EXCELLENCE
              </p>
            </div>

            {/* Right Column - Aircraft label */}
            <div className="flex flex-col items-center justify-center pr-12 lg:pr-20">
              <div
                className="text-8xl lg:text-9xl font-black"
                style={{ color: '#252525' }}
              >
                V3
              </div>
              <p
                className="mt-4 text-sm tracking-widest"
                style={{ color: '#00ffff' }}
              >
                AIRCRAFT
              </p>
            </div>
          </div>
        </div>

        {/* Loading overlays */}
        <ThreeDLoadingOverlay
          isLoading={isInitialLoad}
          config={LoadingPresets.navigation}
        />
      </div>
    </div>
  )
}

export default LandingLayout
