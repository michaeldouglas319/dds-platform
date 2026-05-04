/**
 * Resolution Optimization Utilities
 * Adaptive quality and resolution based on device capabilities
 * Prioritizes performance and responsiveness across all devices
 */

export interface ResolutionSettings {
  dpr: [number, number];
  shadows: boolean;
  antialias: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
  frameloop: 'always' | 'demand' | 'never';
  performance: {
    min: number;
    max: number;
    debounce: number;
  };
  pixelRatio: number;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

/**
 * Detect device capabilities for performance optimization
 */
export function detectDeviceCapabilities(): {
  deviceMemory: number | undefined;
  hardwareConcurrency: number;
  isMobile: boolean;
  isLowEnd: boolean;
  maxDPR: number;
  recommendedQuality: 'low' | 'medium' | 'high' | 'ultra';
} {
  if (typeof window === 'undefined') {
    return {
      deviceMemory: undefined,
      hardwareConcurrency: 4,
      isMobile: false,
      isLowEnd: true,
      maxDPR: 1,
      recommendedQuality: 'low',
    };
  }

  interface NavigatorWithDeviceMemory extends Navigator {
    deviceMemory?: number;
  }
  const deviceMemory = (navigator as NavigatorWithDeviceMemory).deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const pixelRatio = window.devicePixelRatio || 1;

  // Determine if device is low-end
  const isLowEnd = 
    (deviceMemory !== undefined && deviceMemory <= 2) ||
    hardwareConcurrency <= 2 ||
    (screenWidth * screenHeight * pixelRatio) < 1000000; // Low resolution

  // Calculate max DPR based on device capabilities
  let maxDPR = pixelRatio;
  if (isLowEnd) {
    maxDPR = Math.min(pixelRatio, 1.5);
  } else if (isMobile) {
    maxDPR = Math.min(pixelRatio, 2);
  } else {
    maxDPR = Math.min(pixelRatio, 2.5);
  }

  // Determine recommended quality
  let recommendedQuality: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
  if (isLowEnd) {
    recommendedQuality = 'low';
  } else if (deviceMemory && deviceMemory >= 8 && hardwareConcurrency >= 8) {
    recommendedQuality = 'ultra';
  } else if (deviceMemory && deviceMemory >= 4 && hardwareConcurrency >= 4) {
    recommendedQuality = 'high';
  } else {
    recommendedQuality = 'medium';
  }

  return {
    deviceMemory,
    hardwareConcurrency,
    isMobile,
    isLowEnd,
    maxDPR,
    recommendedQuality,
  };
}

/**
 * Get optimized Canvas settings based on device capabilities
 */
export function getOptimizedCanvasSettings(
  capabilities: ReturnType<typeof detectDeviceCapabilities>
): ResolutionSettings {
  const { isMobile, maxDPR, recommendedQuality } = capabilities;

  // Base DPR calculation
  const baseDPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const optimizedDPR = Math.min(baseDPR, maxDPR);

  // Quality-based settings
  const qualitySettings = {
    low: {
      dpr: [1, Math.min(optimizedDPR, 1)] as [number, number],
      shadows: false,
      antialias: false,
      powerPreference: 'low-power' as const,
      frameloop: 'demand' as const,
      performance: { min: 0.3, max: 0.6, debounce: 200 },
      pixelRatio: 1,
      quality: 'low' as const,
    },
    medium: {
      dpr: [1, Math.min(optimizedDPR, 1.5)] as [number, number],
      shadows: !isMobile,
      antialias: !isMobile,
      powerPreference: 'default' as const,
      frameloop: 'demand' as const,
      performance: { min: 0.4, max: 0.7, debounce: 150 },
      pixelRatio: Math.min(optimizedDPR, 1.5),
      quality: 'medium' as const,
    },
    high: {
      dpr: [1, Math.min(optimizedDPR, 2)] as [number, number],
      shadows: true,
      antialias: true,
      powerPreference: 'high-performance' as const,
      frameloop: 'demand' as const,
      performance: { min: 0.5, max: 0.8, debounce: 100 },
      pixelRatio: Math.min(optimizedDPR, 2),
      quality: 'high' as const,
    },
    ultra: {
      dpr: [1, Math.min(optimizedDPR, 2.5)] as [number, number],
      shadows: true,
      antialias: true,
      powerPreference: 'high-performance' as const,
      frameloop: 'always' as const,
      performance: { min: 0.6, max: 1.0, debounce: 50 },
      pixelRatio: Math.min(optimizedDPR, 2.5),
      quality: 'ultra' as const,
    },
  };

  return qualitySettings[recommendedQuality];
}

/**
 * Adaptive resolution hook for React components
 * Automatically adjusts quality based on performance
 */
export function useAdaptiveResolution() {
  if (typeof window === 'undefined') {
    return {
      capabilities: detectDeviceCapabilities(),
      settings: getOptimizedCanvasSettings(detectDeviceCapabilities()),
    };
  }

  const capabilities = detectDeviceCapabilities();
  const settings = getOptimizedCanvasSettings(capabilities);

  return {
    capabilities,
    settings,
  };
}

/**
 * Calculate optimal texture resolution based on viewport and quality
 */
export function getOptimalTextureResolution(
  viewportWidth: number,
  viewportHeight: number,
  quality: 'low' | 'medium' | 'high' | 'ultra' = 'medium'
): number {
  const baseResolution = Math.max(viewportWidth, viewportHeight);
  
  const qualityMultipliers = {
    low: 0.5,
    medium: 0.75,
    high: 1.0,
    ultra: 1.5,
  };

  // Round to nearest power of 2 for optimal GPU performance
  const targetResolution = baseResolution * qualityMultipliers[quality];
  const powerOf2 = Math.pow(2, Math.round(Math.log2(targetResolution)));
  
  // Cap at reasonable maximum
  return Math.min(powerOf2, 2048);
}

/**
 * Monitor frame rate and adjust quality dynamically
 */
export function createPerformanceMonitor(
  onQualityChange: (quality: 'low' | 'medium' | 'high' | 'ultra') => void
) {
  if (typeof window === 'undefined') return () => {};

  let frameCount = 0;
  let lastTime = performance.now();
  let currentQuality: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
  const _targetFPS = 60; // Target FPS for performance monitoring
  const checkInterval = 1000; // Check every second

  const checkPerformance = () => {
    const now = performance.now();
    const elapsed = now - lastTime;
    
    if (elapsed >= checkInterval) {
      const fps = (frameCount * 1000) / elapsed;
      frameCount = 0;
      lastTime = now;

      // Adjust quality based on FPS
      if (fps < 30 && currentQuality !== 'low') {
        const qualityOrder: Array<'low' | 'medium' | 'high' | 'ultra'> = ['ultra', 'high', 'medium', 'low'];
        const currentIndex = qualityOrder.indexOf(currentQuality);
        if (currentIndex < qualityOrder.length - 1) {
          currentQuality = qualityOrder[currentIndex + 1];
          onQualityChange(currentQuality);
        }
      } else if (fps > 55 && currentQuality !== 'ultra') {
        const qualityOrder: Array<'low' | 'medium' | 'high' | 'ultra'> = ['low', 'medium', 'high', 'ultra'];
        const currentIndex = qualityOrder.indexOf(currentQuality);
        if (currentIndex < qualityOrder.length - 1) {
          currentQuality = qualityOrder[currentIndex + 1];
          onQualityChange(currentQuality);
        }
      }
    }
    
    frameCount++;
    requestAnimationFrame(checkPerformance);
  };

  const rafId = requestAnimationFrame(checkPerformance);

  return () => {
    cancelAnimationFrame(rafId);
  };
}




