'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import { FrameRateDetector, JitterDetector } from './frameRateTesting';
import type { TransitionState } from './usePhysicsTransition';

/**
 * Props for physics debug overlay
 */
interface PhysicsDebugOverlayProps {
  /** Whether to show the overlay */
  visible: boolean;
  /** Reference to rigidbody being monitored */
  // Note: RigidBody from @react-three/rapier is a React component, not a class.
  // Using any to work around library type issues.
  rigidBodyRef?: React.RefObject<any | null>;
  /** Current transition state (optional) */
  transitionState?: TransitionState | null;
  /** Custom data to display */
  customData?: Record<string, any>;
  /** Position of overlay */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Real-time physics debugging overlay
 *
 * Displays:
 * - Frame rate and stability
 * - Position, velocity, rotation
 * - Jitter metrics
 * - Transition state and phase
 * - Custom diagnostic data
 *
 * @example
 * <PhysicsDebugOverlay
 *   visible={debugMode}
 *   rigidBodyRef={rigidBodyRef}
 *   transitionState={transition.getState()}
 *   position="top-right"
 * />
 */
export function PhysicsDebugOverlay({
  visible,
  rigidBodyRef,
  transitionState,
  customData,
  position = 'top-right',
}: PhysicsDebugOverlayProps) {
  const frameRateDetectorRef = useRef(new FrameRateDetector());
  const jitterDetectorRef = useRef(new JitterDetector());
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useFrame((_, delta) => {
    if (!visible || !rigidBodyRef?.current) {
      return;
    }

    const rb = rigidBodyRef.current;
    const frameInfo = frameRateDetectorRef.current.recordFrame(delta);

    // Get rigidbody state
    const pos = rb.translation();
    const vel = rb.linvel();
    const rot = rb.rotation();

    const position = new THREE.Vector3(pos.x, pos.y, pos.z);
    const velocity = new THREE.Vector3(vel.x, vel.y, vel.z);
    const rotation = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

    jitterDetectorRef.current.recordSample(position, velocity, rotation);
    const jitterMetrics = jitterDetectorRef.current.analyzeJitter();

    setDebugInfo({
      frameRate: frameInfo,
      position: {
        x: pos.x.toFixed(2),
        y: pos.y.toFixed(2),
        z: pos.z.toFixed(2),
      },
      velocity: {
        x: vel.x.toFixed(3),
        y: vel.y.toFixed(3),
        z: vel.z.toFixed(3),
        magnitude: velocity.length().toFixed(3),
      },
      rotation: {
        x: (rot.x * 180 / Math.PI).toFixed(1),
        y: (rot.y * 180 / Math.PI).toFixed(1),
        z: (rot.z * 180 / Math.PI).toFixed(1),
      },
      jitter: jitterMetrics,
    });
  });

  if (!visible || !debugInfo) {
    return null;
  }

  const positionStyle = getPositionStyle(position);

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyle,
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#0f0',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        maxWidth: '400px',
        zIndex: 2000,
        border: '1px solid #0f0',
        borderRadius: '4px',
        boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#0f0' }}>
        ⚙️ Physics Debug Monitor
      </div>

      {/* Frame Rate Section */}
      <FrameRateSection frameInfo={debugInfo.frameRate} />

      {/* Position Section */}
      <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
        <div style={{ fontWeight: 'bold' }}>Position</div>
        <div>X: {debugInfo.position.x}</div>
        <div>Y: {debugInfo.position.y}</div>
        <div>Z: {debugInfo.position.z}</div>
      </div>

      {/* Velocity Section */}
      <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
        <div style={{ fontWeight: 'bold' }}>Velocity</div>
        <div>X: {debugInfo.velocity.x}</div>
        <div>Y: {debugInfo.velocity.y}</div>
        <div>Z: {debugInfo.velocity.z}</div>
        <div style={{ color: '#fff' }}>Mag: {debugInfo.velocity.magnitude}</div>
      </div>

      {/* Jitter Section */}
      <JitterSection jitter={debugInfo.jitter} />

      {/* Transition State Section */}
      {transitionState && (
        <TransitionSection transitionState={transitionState} />
      )}

      {/* Custom Data Section */}
      {customData && (
        <CustomDataSection customData={customData} />
      )}
    </div>
  );
}

/**
 * Frame rate display component
 */
function FrameRateSection({ frameInfo }: { frameInfo: any }) {
  const statusColor = frameInfo.isStable ? '#0f0' : '#ff0';

  return (
    <div>
      <div style={{ fontWeight: 'bold', color: statusColor }}>
        Frame Rate: {frameInfo.currentFps} FPS ({frameInfo.category})
      </div>
      <div>Frame Time: {frameInfo.frameTimeMs.toFixed(2)}ms</div>
      <div>Variance: {frameInfo.variance.toFixed(2)}ms</div>
      <div style={{ color: statusColor }}>
        Status: {frameInfo.isStable ? '✓ Stable' : '⚠ Unstable'}
      </div>
    </div>
  );
}

/**
 * Jitter metrics display component
 */
function JitterSection({ jitter }: { jitter: any }) {
  const scoreColor = jitter.isAcceptable ? '#0f0' : '#f00';

  return (
    <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
      <div style={{ fontWeight: 'bold', color: scoreColor }}>Jitter Metrics</div>
      <div>Position: {(jitter.positionJitter * 100).toFixed(1)}%</div>
      <div>Velocity: {(jitter.velocityJitter * 100).toFixed(1)}%</div>
      <div>Rotation: {(jitter.rotationJitter * 100).toFixed(1)}%</div>
      <div style={{ color: '#fff', marginTop: '4px' }}>
        Score: {(jitter.overallScore * 100).toFixed(1)}%
      </div>
      <div style={{ color: scoreColor }}>
        {jitter.isAcceptable ? '✓ Acceptable' : '✗ Excessive'}
      </div>
    </div>
  );
}

/**
 * Transition state display component
 */
function TransitionSection({ transitionState }: { transitionState: any }) {
  const phaseColors: Record<string, string> = {
    idle: '#666',
    capturing: '#ffa500',
    switching: '#87ceeb',
    restoring: '#87ceeb',
    setting: '#87ceeb',
    blending: '#87ceeb',
    complete: '#0f0',
  };

  const phaseColor = phaseColors[transitionState.phase] || '#0f0';

  return (
    <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
      <div style={{ fontWeight: 'bold' }}>Transition</div>
      <div style={{ color: phaseColor }}>
        Phase: {transitionState.phase.toUpperCase()}
      </div>
      <div>
        {transitionState.sourceType} → {transitionState.targetType}
      </div>
      <div>Quality: {(transitionState.captureQuality * 100).toFixed(0)}%</div>
      {transitionState.error && (
        <div style={{ color: '#f00', marginTop: '4px' }}>⚠ {transitionState.error}</div>
      )}
    </div>
  );
}

/**
 * Custom data display component
 */
function CustomDataSection({ customData }: { customData: Record<string, any> }) {
  return (
    <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
      <div style={{ fontWeight: 'bold' }}>Custom Data</div>
      {Object.entries(customData).map(([key, value]) => (
        <div key={key}>
          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </div>
      ))}
    </div>
  );
}

/**
 * Get CSS position style based on position prop
 */
function getPositionStyle(
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
): React.CSSProperties {
  const margin = 10;
  switch (position) {
    case 'top-left':
      return { top: margin, left: margin };
    case 'top-right':
      return { top: margin, right: margin };
    case 'bottom-left':
      return { bottom: margin, left: margin };
    case 'bottom-right':
      return { bottom: margin, right: margin };
    default:
      return { top: margin, right: margin };
  }
}

/**
 * Simple text-based timeline logger for transition debugging
 */
export class TransitionTimelineLogger {
  private events: Array<{ time: number; message: string }> = [];
  private startTime: number = 0;

  startLogging() {
    this.events = [];
    this.startTime = performance.now();
  }

  logEvent(message: string) {
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.events.push({ time: elapsed, message });
  }

  getTimeline(): string {
    return this.events
      .map((e) => `[${e.time.toFixed(3)}s] ${e.message}`)
      .join('\n');
  }

  exportAsCSV(): string {
    const headers = 'Time (s),Message\n';
    const rows = this.events
      .map((e) => `${e.time.toFixed(3)},${e.message}`)
      .join('\n');
    return headers + rows;
  }
}
