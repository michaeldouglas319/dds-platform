/**
 * Performance Monitor Component
 *
 * Real-time FPS and performance metrics display for the orbital system.
 * Provides visual warnings when frame rate drops below acceptable thresholds.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <PerformanceMonitor />
 *   <CurvedTakeoffOrbit />
 * </Canvas>
 * ```
 */

'use client';

import { useFrame } from '@react-three/fiber';
import { useState, useRef } from 'react';
import { Html } from '@react-three/drei';

interface PerformanceStats {
  fps: number;
  avgFrameTime: number; // milliseconds
  minFps: number;
  maxFps: number;
  warning: string | null;
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    avgFrameTime: 16.67,
    minFps: 60,
    maxFps: 60,
    warning: null
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const minFpsRef = useRef(60);
  const maxFpsRef = useRef(60);
  const updateCounterRef = useRef(0);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Track frame times (rolling window of 60 frames)
    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    // Update stats every 10 frames (reduces React re-renders)
    updateCounterRef.current++;
    if (updateCounterRef.current >= 10) {
      updateCounterRef.current = 0;

      // Calculate average frame time
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const currentFps = Math.round(1000 / avgFrameTime);

      // Track min/max FPS
      minFpsRef.current = Math.min(minFpsRef.current, currentFps);
      maxFpsRef.current = Math.max(maxFpsRef.current, currentFps);

      // Determine warning level
      let warning: string | null = null;
      if (currentFps < 20) {
        warning = '⚠️ CRITICAL: Very low FPS. Reduce particle count.';
      } else if (currentFps < 30) {
        warning = '⚠️ WARNING: Low FPS detected. Performance degraded.';
      } else if (currentFps < 50) {
        warning = '⚠️ NOTICE: Minor frame drops detected.';
      }

      setStats({
        fps: currentFps,
        avgFrameTime: Math.round(avgFrameTime * 10) / 10,
        minFps: minFpsRef.current,
        maxFps: maxFpsRef.current,
        warning
      });
    }
  });

  // Determine color based on FPS
  const getFpsColor = (fps: number): string => {
    if (fps >= 55) return '#10b981'; // Green
    if (fps >= 40) return '#f59e0b'; // Yellow
    if (fps >= 25) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      <div className="bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg font-mono text-sm border border-slate-700 min-w-[280px]">
        {/* Main FPS Display */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-slate-400">FPS:</span>
          <span
            className="text-3xl font-bold"
            style={{ color: getFpsColor(stats.fps) }}
          >
            {stats.fps}
          </span>
          <span className="text-slate-500 text-xs">
            ({stats.avgFrameTime}ms/frame)
          </span>
        </div>

        {/* Min/Max FPS */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div>
            <span className="text-slate-400">Min:</span>{' '}
            <span className="text-blue-400 font-semibold">{stats.minFps}</span>
          </div>
          <div>
            <span className="text-slate-400">Max:</span>{' '}
            <span className="text-green-400 font-semibold">{stats.maxFps}</span>
          </div>
        </div>

        {/* Warning Message */}
        {stats.warning && (
          <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-300 text-xs">
            {stats.warning}
          </div>
        )}

        {/* Performance Status Indicator */}
        <div className="mt-3 pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getFpsColor(stats.fps) }}
            />
            <span className="text-slate-400">
              {stats.fps >= 55 ? 'Excellent' :
               stats.fps >= 40 ? 'Good' :
               stats.fps >= 25 ? 'Fair' :
               'Poor'}
            </span>
          </div>
        </div>

        {/* Optimization Hint */}
        {stats.fps < 40 && (
          <div className="mt-2 text-xs text-slate-500">
            Tip: Reduce particle count or disable trails
          </div>
        )}
      </div>
    </Html>
  );
}

/**
 * Simplified performance monitor for embedded use
 * Shows just FPS without detailed stats
 */
export function SimpleFpsCounter() {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const updateCounterRef = useRef(0);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    updateCounterRef.current++;
    if (updateCounterRef.current >= 10) {
      updateCounterRef.current = 0;
      const avgFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      setFps(Math.round(1000 / avgFrameTime));
    }
  });

  const color = fps >= 55 ? '#10b981' : fps >= 40 ? '#f59e0b' : fps >= 25 ? '#f97316' : '#ef4444';

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded font-mono text-sm">
        <span className="text-slate-400">FPS:</span>{' '}
        <span className="font-bold" style={{ color }}>{fps}</span>
      </div>
    </Html>
  );
}
