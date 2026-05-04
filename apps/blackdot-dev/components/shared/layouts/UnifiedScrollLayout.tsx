'use client'

import { Suspense, useRef, useState, useMemo, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { StandardCanvas } from '@/components/three';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import * as THREE from 'three';
import { useScrollSection } from '@/hooks/useScrollSection';
import { PageSidebar } from '@/components/shared/layouts/PageSidebar';
import { SidebarHeader, SidebarFooter } from '@/components/sidebars';
import { cn } from '@/lib/utils';
import { LayoutGrid, Home } from 'lucide-react';
import {
  useAdaptiveResolution,
  createPerformanceMonitor,
  getOptimizedCanvasSettings,
  detectDeviceCapabilities,
  type ResolutionSettings
} from '@/lib/utils/resolutionOptimization';

export interface ScrollLayoutSection {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface UnifiedScrollLayoutProps<T extends ScrollLayoutSection> {
  // Core configuration
  sections: T[];
  pageLabel: string; // "Resume", "Ideas", etc.
  versionLabel: string; // "V3.0"
  navigationLabel: string; // "Project Hierarchy", "Pitch Deck"

  // Scene component
  SceneComponent: React.ComponentType<{
    currentSection: number;
    scrollProgress: number;
    modelOffset?: number;
    onCarouselCardClick?: (index: number, sectionId: string) => void;
    [key: string]: unknown;
  }>;
  sceneProps?: Record<string, unknown>;
  modelOffset: number;

  // Content component
  ContentComponent: React.ComponentType;

  // Optional footer actions
  footerActions?: ReactNode;

  // Optional handlers
  onSectionClick?: (sectionId: string) => void;
  onCarouselCardClick?: (index: number, sectionId: string) => void;
}

/**
 * Unified Scroll Layout Component
 * Consolidates Resume V3Layout and Ideas V3Layout into a single reusable component
 * Eliminates ~700 lines of duplicate code across the codebase
 *
 * Architecture:
 * - Fixed 3D Background (z-0)
 * - HTML Content Overlay (z-10)
 * - Sidebar Navigation (z-50)
 * - Progress HUD (z-20)
 *
 * Performance Optimizations:
 * - Adaptive Canvas DPR based on device
 * - Performance monitoring for dynamic quality adjustment
 * - Memoized calculations
 * - Lazy-loaded 3D scene and content
 */
export function UnifiedScrollLayout<T extends ScrollLayoutSection>({
  sections,
  pageLabel,
  versionLabel,
  navigationLabel,
  SceneComponent,
  sceneProps = {},
  modelOffset,
  ContentComponent,
  footerActions,
  onSectionClick,
  onCarouselCardClick,
}: UnifiedScrollLayoutProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentSection, scrollProgress } = useScrollSection(sections.length + 1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('medium');

  // Adaptive resolution optimization
  const { capabilities, settings } = useAdaptiveResolution();

  // Detect mobile screen size (for layout, separate from device detection)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Performance monitoring for dynamic quality adjustment
  useEffect(() => {
    if (!isMobile && isCanvasReady) {
      const cleanup = createPerformanceMonitor((quality) => {
        setRenderQuality(quality);
      });
      return cleanup;
    }
  }, [isMobile, isCanvasReady]);

  // Get optimized settings based on current quality
  const optimizedSettings = useMemo((): ResolutionSettings => {
    if (renderQuality !== settings.quality) {
      const caps = detectDeviceCapabilities();
      const adjustedCaps = { ...caps, recommendedQuality: renderQuality };
      return getOptimizedCanvasSettings(adjustedCaps);
    }
    return settings;
  }, [settings, renderQuality]);

  // Memoize scroll handler to prevent re-renders
  const handleSectionClick = useCallback((sectionId: string) => {
    onSectionClick?.(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsSidebarOpen(false);
    }
  }, [onSectionClick]);

  // Handler for carousel card clicks
  const handleCarouselCardClickInternal = useCallback((index: number, sectionId: string) => {
    onCarouselCardClick?.(index, sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [onCarouselCardClick]);

  // Calculate progress percentage with memoization
  const progressPercentage = useMemo(() => Math.round(scrollProgress * 100), [scrollProgress]);

  // Section label with memoization
  const sectionLabel = useMemo(() => {
    if (currentSection === 0) {
      return pageLabel === 'Resume' ? 'Executive Summary' : 'Cover';
    }
    const prefix = pageLabel === 'Resume' ? 'Role' : 'Slide';
    return `${prefix} ${currentSection} of ${sections.length}`;
  }, [currentSection, pageLabel, sections.length]);

  return (
    <div ref={containerRef} className="relative w-full lg:pl-72">
      {/* Custom Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background/60 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label={`${pageLabel} navigation`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* HUD scanline effect - reduced opacity for better performance */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

          {/* Header - Page Name */}
          <header className="p-8 border-b border-white/5 relative bg-white/5">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <LayoutGrid size={40} strokeWidth={1} aria-hidden="true" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/assets/michael_douglas_profile.png"
                alt="Michael Douglas"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-primary/20 object-cover shadow-lg"
                style={{
                  filter: 'brightness(1.1) contrast(1.15) saturate(1.1)',
                }}
              />
              <div>
                <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                  MD
                </div>
                <div className="text-xs font-semibold text-foreground/80">
                  michaeldouglas
                </div>
              </div>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2">
              {pageLabel}
            </h2>
          </header>

          {/* Nav List - Page Section Navigation */}
          <PageSidebar
            currentSection={currentSection}
            sections={sections}
            navigationLabel={navigationLabel}
            onSectionClick={handleSectionClick}
          />

          {/* Footer / Status HUD */}
          <footer className="p-8 border-t border-white/5 bg-black/20 space-y-4">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
              <span className="text-muted-foreground/60">Profile Status</span>
              <span className="text-primary flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary animate-ping" aria-hidden="true" />
                <span>Online</span>
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-primary/40 w-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between text-[8px] font-medium uppercase tracking-widest text-muted-foreground/40">
              <span>{pageLabel} Version</span>
              <span>{versionLabel}</span>
            </div>
            {footerActions && (
              <div className="pt-2 border-t border-white/5">
                {footerActions}
              </div>
            )}
          </footer>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "fixed top-6 left-6 z-[60] p-3 rounded-xl bg-background/80 backdrop-blur-xl border-2 shadow-2xl transition-all hover:scale-105 active:scale-95 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isSidebarOpen ? "left-[280px]" : "left-6"
        )}
        aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isSidebarOpen}
      >
        <LayoutGrid size={24} className={isSidebarOpen ? "text-primary" : "text-muted-foreground"} />
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Layout: 3D Overlay Background with Content on Top */}
      <div className="relative w-full">
        {/* 3D Model Area - Fixed overlay behind content, hidden on mobile */}
        <div className="hidden lg:block fixed inset-0 z-0 pointer-events-none">
          <SceneErrorBoundary>
            <Suspense fallback={null}>
              <StandardCanvas
                shadows={optimizedSettings.shadows}
                dpr={optimizedSettings.dpr}
                camera={{ position: [0, 1.5, 5], fov: 75 }}
                gl={{
                  antialias: optimizedSettings.antialias,
                  powerPreference: optimizedSettings.powerPreference,
                  preserveDrawingBuffer: false,
                  alpha: true,
                  stencil: false,
                  depth: true,
                }}
                frameloop={optimizedSettings.frameloop === 'never' ? 'demand' : (optimizedSettings.frameloop as 'always' | 'demand' | undefined)}
                performance={typeof optimizedSettings.performance === 'string' ? (optimizedSettings.performance as 'low' | 'medium' | 'high' | 'auto') : 'auto'}
                route={pageLabel.toLowerCase().replace(/\s+/g, '-')}
                componentName="UnifiedScrollLayout"
                onCanvasCreated={(state) => {
                  setIsCanvasReady(true);

                  const { gl } = state as { gl: THREE.WebGLRenderer };
                  gl.setPixelRatio(optimizedSettings.pixelRatio);

                  if (process.env.NODE_ENV === 'development') {
                    console.log('🎨 Canvas Optimization:', {
                      quality: optimizedSettings.quality,
                      dpr: optimizedSettings.dpr,
                      pixelRatio: optimizedSettings.pixelRatio,
                      shadows: optimizedSettings.shadows,
                      antialias: optimizedSettings.antialias,
                      deviceMemory: capabilities.deviceMemory,
                      cores: capabilities.hardwareConcurrency,
                      isLowEnd: capabilities.isLowEnd,
                    });
                  }
                }}
                onContextLost={() => {
                  console.warn('WebGL context lost - GPU memory exhausted');
                  setIsCanvasReady(false);
                }}
                onContextRestored={() => {
                  console.log('WebGL context restored');
                  setIsCanvasReady(true);
                }}
              >
                <Suspense fallback={null}>
                  <SceneComponent
                    currentSection={currentSection}
                    scrollProgress={scrollProgress}
                    modelOffset={modelOffset}
                    onCarouselCardClick={handleCarouselCardClickInternal}
                    {...sceneProps}
                  />
                </Suspense>
              </StandardCanvas>
            </Suspense>
          </SceneErrorBoundary>
        </div>

        {/* Content Area - Overlay on top of 3D scene */}
        <main className="relative z-10 min-h-screen w-full">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-pulse text-muted-foreground">Loading content...</div>
            </div>
          }>
            <ContentComponent />
          </Suspense>
        </main>
      </div>

      {/* Progress Indicator HUD - Smaller on mobile */}
      <div
        className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 z-20 pointer-events-none group"
        role="status"
        aria-live="polite"
        aria-label={`Progress: ${progressPercentage}% - ${sectionLabel}`}
      >
        <div className="bg-background/40 backdrop-blur-2xl border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-5 shadow-2xl transition-all group-hover:bg-background/60">
          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
            <div
              className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"
              aria-hidden="true"
            />
            <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
              {pageLabel}
            </div>
          </div>
          <div className="space-y-1.5 lg:space-y-2">
            <div className="flex justify-between text-[8px] lg:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <span className="truncate max-w-[120px] lg:max-w-none">{sectionLabel}</span>
              <span className="ml-2">{progressPercentage}%</span>
            </div>
            <div className="w-40 lg:w-48 h-1 lg:h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { UnifiedScrollLayoutProps };
