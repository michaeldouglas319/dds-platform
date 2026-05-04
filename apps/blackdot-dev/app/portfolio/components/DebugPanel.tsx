'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, CSSProperties } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Device tier detection based on performance characteristics
 */
export type DeviceTier = 'low' | 'mid' | 'high';

/**
 * Device capabilities detected at runtime
 */
export interface DeviceCapabilities {
  tier: DeviceTier;
  particleCount: number;
  pixelRatio: number;
  reducedMotion: boolean;
  gpuMemory: number;
}

/**
 * Debug metrics tracked in real-time
 */
interface DebugMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number | null;
  particleCount: number;
  canvasWidth: number;
  canvasHeight: number;
  devicePixelRatio: number;
}

/**
 * Props for the DebugPanel component
 */
interface DebugPanelProps {
  /**
   * Device capabilities (tier, particle count, GPU memory, etc.)
   */
  capabilities?: DeviceCapabilities;
  /**
   * Current particle count in the scene
   */
  particleCount?: number;
  /**
   * Custom CSS class for styling
   */
  className?: string;
  /**
   * Custom styles
   */
  style?: CSSProperties;
}

/**
 * Hook for tracking FPS and frame metrics
 * Works both inside and outside of Canvas context
 */
function useDebugMetrics(enabled: boolean) {
  const metricsRef = useRef<{
    fps: number;
    frameTime: number;
    frameCount: number;
    lastTime: number;
  }>({
    fps: 0,
    frameTime: 0,
    frameCount: 0,
    lastTime: performance.now(),
  });

  const [metrics, setMetrics] = useState<DebugMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: null,
    particleCount: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    devicePixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
  });

  const updateMetrics = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    const deltaTime = now - metricsRef.current.lastTime;

    metricsRef.current.frameCount++;
    metricsRef.current.frameTime = deltaTime;

    // Update FPS every 500ms
    if (deltaTime >= 500) {
      metricsRef.current.fps = Math.round((metricsRef.current.frameCount * 1000) / deltaTime);
      metricsRef.current.frameCount = 0;
      metricsRef.current.lastTime = now;

      // Update metrics state
      const memoryUsage =
        typeof performance !== 'undefined' && (performance as any).memory
          ? (performance as any).memory.usedJSHeapSize / 1048576
          : null;

      const canvas = document.querySelector('canvas');
      const canvasWidth = canvas?.width || window.innerWidth;
      const canvasHeight = canvas?.height || window.innerHeight;

      setMetrics({
        fps: metricsRef.current.fps,
        frameTime: Math.round(metricsRef.current.frameTime * 100) / 100,
        memoryUsage,
        particleCount: 0,
        canvasWidth,
        canvasHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
      });
    }
  }, [enabled]);

  // Try to use useFrame if inside Canvas context
  const isInCanvasContext = useRef(false);
  try {
    useFrame(() => {
      if (enabled) {
        updateMetrics();
      }
    });
    isInCanvasContext.current = true;
  } catch {
    // Not in Canvas context, will use RAF instead
    isInCanvasContext.current = false;
  }

  // Fallback to RAF if not in Canvas context
  useEffect(() => {
    if (isInCanvasContext.current || !enabled) return;

    let frameId: number;
    const animate = () => {
      updateMetrics();
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [enabled, updateMetrics]);

  return metrics;
}

/**
 * Hook for tracking canvas resolution
 */
function useCanvasResolution(enabled: boolean) {
  const [resolution, setResolution] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    pixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
  });

  useEffect(() => {
    if (!enabled) return;

    const handleResize = () => {
      const canvas = document.querySelector('canvas');
      setResolution({
        width: canvas?.width || window.innerWidth,
        height: canvas?.height || window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  return resolution;
}

/**
 * Standalone DebugPanel component for Canvas-based applications
 * Only renders in development mode (process.env.NODE_ENV === 'development')
 *
 * Features:
 * - FPS counter with frame time tracking
 * - Device tier and capabilities display
 * - GPU memory estimation
 * - Particle count tracking
 * - Reduced motion preference detection
 * - Canvas resolution and pixel ratio
 * - Memory usage (when available)
 * - Keyboard shortcut (Alt+D) to toggle
 * - LocalStorage persistence
 * - Smooth animations
 * - Zero performance impact when collapsed
 *
 * Usage:
 * ```tsx
 * <Canvas>
 *   <DebugPanel capabilities={deviceCapabilities} particleCount={particles.length} />
 * </Canvas>
 * ```
 */
const DebugPanel: React.FC<DebugPanelProps> = ({
  capabilities,
  particleCount = 0,
  className,
  style,
}) => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Hydration-safe: same initial state on server and client, then sync from localStorage after mount
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Track metrics in real-time (resolution is client-only; avoid hydration mismatch)
  const metrics = useDebugMetrics(isOpen);
  const resolution = useCanvasResolution(isOpen);

  // After mount: restore panel open state from localStorage; mark mounted so we can show client-only values
  useEffect(() => {
    setHasMounted(true);
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem('debug-panel-open') === 'true') {
        setIsOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle keyboard shortcut (Alt+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        setIsOpen((prev) => {
          const newState = !prev;
          try {
            localStorage.setItem('debug-panel-open', newState.toString());
          } catch {
            // Silently fail if localStorage is unavailable
          }
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Default capabilities if not provided
  const displayCapabilities: DeviceCapabilities = useMemo(
    () =>
      capabilities || {
        tier: 'mid',
        particleCount: 0,
        pixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
        reducedMotion: false,
        gpuMemory: 2048,
      },
    [capabilities]
  );

  // Container styles
  const panelContainerStyles: CSSProperties = {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 9999,
    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    fontSize: '11px',
    lineHeight: '1.5',
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  // Background styles with semi-transparent dark theme
  const panelStyles: CSSProperties = {
    background: 'rgba(10, 10, 15, 0.92)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '12px 16px',
    maxWidth: '280px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    color: 'rgba(255, 255, 255, 0.9)',
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-12px)',
    transformOrigin: 'top right',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'auto',
  };

  // Toggle button styles
  const toggleButtonStyles: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    fontWeight: 600,
    transition: 'all 150ms ease-out',
    marginBottom: isOpen ? '12px' : '0',
    pointerEvents: 'auto',
  };

  // Metric row styles
  const metricRowStyles: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  };

  // Label styles
  const labelStyles: CSSProperties = {
    color: 'rgba(255, 255, 255, 0.6)',
    flex: '0 0 auto',
    marginRight: '12px',
  };

  // Value styles
  const valueStyles: CSSProperties = {
    color: '#00ff88',
    fontWeight: 600,
    flex: '0 0 auto',
    textAlign: 'right',
  };

  // Warning value style (for low FPS)
  const getValueStyle = (value: number, warningThreshold: number): CSSProperties => ({
    ...valueStyles,
    color: value < warningThreshold ? '#ff6b6b' : '#00ff88',
  });

  return (
    <div style={panelContainerStyles} className={className}>
      {/* Toggle Button */}
      <button
        style={toggleButtonStyles}
        onClick={() => {
          const newState = !isOpen;
          setIsOpen(newState);
          try {
            localStorage.setItem('debug-panel-open', newState.toString());
          } catch {
            // Silently fail if localStorage is unavailable
          }
        }}
        aria-label="Toggle debug panel"
        title="Toggle debug panel (Alt+D)"
      >
        {isOpen ? '×' : 'D'}
      </button>

      {/* Panel Content */}
      <div style={panelStyles}>
        {/* Header */}
        <div
          style={{
            fontWeight: 700,
            marginBottom: '10px',
            color: '#00ff88',
            letterSpacing: '0.05em',
          }}
        >
          DEBUG PANEL
        </div>

        {/* Performance Section */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Performance
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>FPS</span>
            <span style={getValueStyle(metrics.fps, 30)}>{Math.round(metrics.fps)}</span>
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>Frame Time</span>
            <span style={valueStyles}>{metrics.frameTime.toFixed(2)}ms</span>
          </div>

          {metrics.memoryUsage !== null && (
            <div style={metricRowStyles}>
              <span style={labelStyles}>Memory</span>
              <span style={valueStyles}>{metrics.memoryUsage.toFixed(1)}MB</span>
            </div>
          )}
        </div>

        {/* Device Section */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Device
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>Tier</span>
            <span style={valueStyles}>{displayCapabilities.tier.toUpperCase()}</span>
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>GPU Memory</span>
            <span style={valueStyles}>{displayCapabilities.gpuMemory}MB</span>
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>Pixel Ratio</span>
            <span style={valueStyles} suppressHydrationWarning>
              {hasMounted ? `${resolution.pixelRatio.toFixed(1)}x` : '—'}
            </span>
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>Motion</span>
            <span style={valueStyles}>
              {displayCapabilities.reducedMotion ? 'Reduced' : 'Normal'}
            </span>
          </div>
        </div>

        {/* Scene Section */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Scene
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>Particles</span>
            <span style={valueStyles}>
              {particleCount || displayCapabilities.particleCount}
            </span>
          </div>

          <div style={metricRowStyles}>
            <span style={labelStyles}>Canvas</span>
            <span style={valueStyles} suppressHydrationWarning>
              {hasMounted ? `${resolution.width}×${resolution.height}` : '—×—'}
            </span>
          </div>
        </div>

        {/* Keyboard Shortcut Help */}
        <div
          style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.3)',
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
          }}
        >
          Press <code style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '2px 4px', borderRadius: '2px' }}>Alt + D</code> to toggle
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
