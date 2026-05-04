'use client'

/**
 * usePerformanceAdaptive Hook
 * Monitors FPS and adapts quality settings for optimal performance
 *
 * Best Practices Applied:
 * - Adaptive quality based on FPS
 * - Battery-aware fallbacks
 * - Mobile-specific optimizations
 * - Research-based: PerformanceMonitor pattern from drei
 */

import { useState, useEffect, useCallback } from 'react';

export interface PerformanceLevel {
  level: 'high' | 'medium' | 'low';
  pixelRatio: number;
  particleCount: number;
  shadowMapSize: number;
  enablePostProcessing: boolean;
}

export interface PerformanceConfig {
  targetFPS: number;
  sampleDuration: number; // milliseconds
  levels: {
    high: PerformanceLevel;
    medium: PerformanceLevel;
    low: PerformanceLevel;
  };
}

const defaultConfig: PerformanceConfig = {
  targetFPS: 60,
  sampleDuration: 1000,
  levels: {
    high: {
      level: 'high',
      pixelRatio: 2,
      particleCount: 200,
      shadowMapSize: 2048,
      enablePostProcessing: true,
    },
    medium: {
      level: 'medium',
      pixelRatio: 1.5,
      particleCount: 100,
      shadowMapSize: 1024,
      enablePostProcessing: false,
    },
    low: {
      level: 'low',
      pixelRatio: 1,
      particleCount: 50,
      shadowMapSize: 512,
      enablePostProcessing: false,
    },
  },
};

/**
 * Hook to monitor performance and adaptively adjust quality
 *
 * @param config - Performance configuration
 * @returns Current performance level settings
 */
export function usePerformanceAdaptive(
  config: Partial<PerformanceConfig> = {}
): PerformanceLevel {
  const fullConfig = { ...defaultConfig, ...config };

  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>(
    fullConfig.levels.high
  );

  const checkBattery = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
      return { level: 100, charging: false };
    }

    try {
      interface BatteryManager {
        level: number;
        charging: boolean;
      }
      const battery = await (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery?.();
      if (!battery) {
        return { level: 100, charging: false };
      }
      return {
        level: battery.level * 100,
        charging: battery.charging,
      };
    } catch {
      return { level: 100, charging: false };
    }
  }, []);

  const isMobile = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= fullConfig.sampleDuration) {
        const fps = (frameCount / elapsed) * 1000;

        // Determine performance level based on FPS
        (async () => {
          const battery = await checkBattery();
          const mobile = isMobile();

          // Low battery or very low FPS → low quality
          if (battery.level < 25 && !battery.charging) {
            setPerformanceLevel(fullConfig.levels.low);
          }
          // Mobile or low FPS → medium quality
          else if (mobile || fps < 30) {
            setPerformanceLevel(fullConfig.levels.low);
          }
          // Medium FPS → medium quality
          else if (fps < 50) {
            setPerformanceLevel(fullConfig.levels.medium);
          }
          // High FPS → high quality
          else {
            setPerformanceLevel(fullConfig.levels.high);
          }
        })();

        // Reset counters
        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [fullConfig, checkBattery, isMobile]);

  return performanceLevel;
}
