"use client"

/**
 * Gold Standard Resume V3 Layout
 * 
 * Implements industry best practices:
 * - Fixed 3D background + HTML overlay (optimal pattern)
 * - Position generator integration
 * - Responsive scaling
 * - Performance optimizations
 * - Accessibility support
 * 
 * Architecture:
 * Layer 1: Fixed 3D Background (z-0)
 * Layer 2: HTML Content Overlay (z-10)
 * Layer 3: 3D Labels (optional, optimized)
 */

import { Suspense, useRef, useState, useMemo, useCallback, lazy, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneErrorBoundary } from '@/components/SceneErrorBoundary';
import { useScrollSection } from '@/hooks/useScrollSection';
import { resumeJobs } from '@/lib/config/content';
import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { 
  useAdaptiveResolution, 
  createPerformanceMonitor,
  getOptimizedCanvasSettings,
  detectDeviceCapabilities,
  type ResolutionSettings
} from '@/lib/utils/resolutionOptimization';
import { BaseScene } from '@/components/shared/layouts/BaseScene';

// Lazy load heavy components for better initial load performance
const ResumeContent = dynamic(() => import('../components/ResumeContent').then(mod => ({ default: mod.ResumeContent })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-muted-foreground">Loading content...</div>
    </div>
  ),
  ssr: false,
});

const ResumeV3SceneWithBase = lazy(() => import('../scene/ResumeV3SceneWithBase').then(mod => ({ default: mod.ResumeV3SceneWithBase })));

/**
 * Gold Standard Resume V3 Layout
 * 
 * Performance Optimizations:
 * - Dynamic imports for heavy components
 * - Adaptive Canvas DPR based on device
 * - Memoized calculations
 * - Lazy-loaded 3D scene
 * - Position generator for scalability
 * 
 * Visual Enhancements:
 * - Smooth transitions
 * - Responsive scaling
 * - Optimized label rendering
 * - Enhanced accessibility
 */
export default function ResumeV3LayoutGoldStandard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentSection, scrollProgress } = useScrollSection(resumeJobs.length + 1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('medium');
  const [layoutType, setLayoutType] = useState<'timeline' | 'gallery' | 'arch' | 'grid'>('gallery');

  // Adaptive resolution optimization
  const { capabilities, settings } = useAdaptiveResolution();
  const isMobileDevice = capabilities.isMobile;

  // Detect mobile screen size (for layout, separate from device detection)
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024); // lg breakpoint
      
      // Auto-select layout based on screen size
      if (width < 768) {
        setLayoutType('timeline'); // Single column on mobile
      } else if (width < 1024) {
        setLayoutType('gallery'); // Two column on tablet
      } else {
        setLayoutType('gallery'); // Gallery on desktop
      }
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

  // Memoize active job for performance
  const activeJob = useMemo(() => {
    if (currentSection === 0) return null;
    return resumeJobs[currentSection - 1];
  }, [currentSection]);

  // Memoize scroll handler to prevent re-renders
  const handleJobClick = useCallback((jobId: string) => {
    const element = document.getElementById(jobId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsSidebarOpen(false);
    }
  }, []);

  // Calculate progress percentage with memoization
  const progressPercentage = useMemo(() => Math.round(scrollProgress * 100), [scrollProgress]);

  // Section label with memoization
  const sectionLabel = useMemo(() => {
    if (currentSection === 0) return 'Executive Summary';
    return `Role ${currentSection} of ${resumeJobs.length}`;
  }, [currentSection]);

  return (
    <div ref={containerRef} className="relative w-full lg:pl-72">
      {/* Custom Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background/60 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Resume navigation"
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* HUD scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
          
          {/* Header */}
          <header className="p-8 border-b border-white/5 relative bg-white/5">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <LayoutGrid size={40} strokeWidth={1} aria-hidden="true" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-2">
              Resume
            </h2>
            <p className="text-2xl font-black tracking-tighter leading-none">Career Journey</p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Layout: {layoutType}
            </p>
          </header>

          {/* Nav List */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-3" aria-label="Job navigation">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 px-4">
              Project Hierarchy
            </div>
            {resumeJobs.map((job, index) => {
              const isActive = currentSection === index + 1;
              return (
                <button
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isActive 
                      ? "bg-primary text-primary-foreground font-bold shadow-md" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full transition-all flex-shrink-0",
                    isActive ? "bg-primary-foreground" : "bg-muted-foreground/40 group-hover:bg-primary/60"
                  )} aria-hidden="true" />
                  <span className="flex-1 text-left truncate">{job.role}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer / Status HUD */}
          <footer className="p-8 border-t border-white/5 bg-black/20 space-y-4">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
              <span className="text-muted-foreground/60">Core Sync</span>
              <span className="text-primary flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary animate-ping" aria-hidden="true" />
                <span>Active</span>
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-primary/40 w-[85%] animate-pulse" />
            </div>
            <div className="flex items-center justify-between text-[8px] font-medium uppercase tracking-widest text-muted-foreground/40">
              <span>Secure Node: root</span>
              <span>V3.0.0 Gold</span>
            </div>
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
        {/* Layer 1: Fixed 3D Background (z-0) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <SceneErrorBoundary>
            <Suspense fallback={null}>
              <Canvas
                shadows={optimizedSettings.shadows}
                dpr={optimizedSettings.dpr}
                camera={{ position: [0, 0, 0], fov: 90 }}
                gl={{ 
                  antialias: optimizedSettings.antialias,
                  powerPreference: optimizedSettings.powerPreference,
                  preserveDrawingBuffer: false,
                  alpha: true,
                  stencil: false,
                  depth: true,
                }}
                frameloop={optimizedSettings.frameloop}
                performance={optimizedSettings.performance}
                onCreated={({ gl }) => {
                  setIsCanvasReady(true);
                  gl.setPixelRatio(optimizedSettings.pixelRatio);
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🎨 Gold Standard Canvas Optimization:', {
                      quality: optimizedSettings.quality,
                      layout: layoutType,
                      dpr: optimizedSettings.dpr,
                      deviceMemory: capabilities.deviceMemory,
                      isLowEnd: capabilities.isLowEnd,
                    });
                  }
                  
                  const canvas = gl.domElement;
                  const handleContextLost = (event: Event) => {
                    event.preventDefault();
                    console.warn('WebGL context lost - GPU memory exhausted');
                    setIsCanvasReady(false);
                  };
                  
                  const handleContextRestored = () => {
                    console.log('WebGL context restored');
                    setIsCanvasReady(true);
                  };
                  
                  canvas.addEventListener('webglcontextlost', handleContextLost);
                  canvas.addEventListener('webglcontextrestored', handleContextRestored);
                  
                  return () => {
                    canvas.removeEventListener('webglcontextlost', handleContextLost);
                    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
                  };
                }}
              >
                <Suspense fallback={null}>
                  {/* Option A: Use scroll-based scene (current) */}
                  <ResumeV3SceneWithBase 
                    currentSection={currentSection}
                    scrollProgress={scrollProgress}
                    modelOffset={-15.0}
                  />
                  
                  {/* Option B: Use gold standard gallery (alternative) */}
                  {/* Uncomment to use position generator-based gallery */}
                  {/* 
                  <BaseScene
                    detailContent={
                      <ResumeGalleryGoldStandard 
                        currentIndex={currentSection - 1}
                        onSectionChange={() => {}}
                        isOverview={false}
                        layout={layoutType}
                      />
                    }
                    lighting={{
                      ambientIntensity: { portal: 1.2, detail: 0.8 },
                      directionalIntensity: { portal: 1.5, detail: 1.0 },
                      directionalPosition: [5, 5, 5],
                      castShadows: true,
                    }}
                    floor={{
                      enabled: true,
                      size: [50, 50],
                      color: { dark: '#050505', light: '#f5f5f5' },
                    }}
                    environment="city"
                    fog={{
                      enabled: true,
                      near: 0,
                      far: 15,
                    }}
                    contentPosition={[0, -0.5, 0]}
                  />
                  */}
                </Suspense>
              </Canvas>
            </Suspense>
          </SceneErrorBoundary>
        </div>

        {/* Layer 2: HTML Content Overlay (z-10) - Scrollable */}
        <main className="relative z-10 min-h-screen w-full">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-pulse text-muted-foreground">Loading resume content...</div>
            </div>
          }>
            <ResumeContent />
          </Suspense>
        </main>
      </div>

      {/* Progress Indicator HUD */}
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
              Career Trajectory
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

export { ResumeV3LayoutGoldStandard };




