'use client';

import { useRef, useState, useEffect } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  useVelocityHistory,
  DEFAULT_VELOCITY_HISTORY_CONFIG,
  type VelocityHistoryConfig,
  type CapturedVelocityState,
} from './useVelocityHistory';
import {
  validateCapturedVelocity,
  DEFAULT_VALIDATION_CONFIG,
  type VelocityValidationConfig,
} from './velocityValidation';

/**
 * Props for the velocity capture test component
 */
interface VelocityCaptureTestComponentProps {
  /** Position to spawn the test vehicle */
  position?: [number, number, number];
  /** Configuration for velocity capture */
  captureConfig?: VelocityHistoryConfig;
  /** Configuration for velocity validation */
  validationConfig?: VelocityValidationConfig;
  /** Callback when capture completes */
  onCaptureComplete?: (state: CapturedVelocityState | null) => void;
  /** Enable visual debugging */
  debugMode?: boolean;
}

/**
 * Test component demonstrating velocity capture workflow
 *
 * This component:
 * 1. Simulates a kinematic vehicle moving upward (like takeoff)
 * 2. Starts velocity capture at a specified trigger point
 * 3. Captures velocity for a set duration
 * 4. Validates the captured velocity
 * 5. Reports results including quality metrics
 *
 * @example
 * <VelocityCaptureTestComponent
 *   position={[0, 0, 0]}
 *   onCaptureComplete={(state) => console.log('Captured:', state)}
 *   debugMode={true}
 * />
 */
export function VelocityCaptureTestComponent({
  position = [0, 0.1, 0],
  captureConfig = DEFAULT_VELOCITY_HISTORY_CONFIG,
  validationConfig = DEFAULT_VALIDATION_CONFIG,
  onCaptureComplete,
  debugMode = false,
}: VelocityCaptureTestComponentProps) {
  const rigidBodyRef = useRef<any>(null);
  const [currentVelocity, setCurrentVelocity] = useState<THREE.Vector3>(new THREE.Vector3());
  const [capturedState, setCapturedState] = useState<CapturedVelocityState | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const velocityHistory = useVelocityHistory(rigidBodyRef, captureConfig);

  const stateRef = useRef({
    phase: 'takeoff' as 'takeoff' | 'capture' | 'complete',
    upwardVelocity: 0,
    height: 0,
    captureStartHeight: 10,
    captureEndHeight: 20,
  });

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    const state = stateRef.current;
    const linvel = rigidBodyRef.current.linvel();

    // Simulate upward movement during takeoff
    if (state.phase === 'takeoff') {
      state.upwardVelocity += 50 * delta; // Accelerate upward
      state.height += state.upwardVelocity * delta;

      // Move the rigidbody upward using kinematic API
      const pos = rigidBodyRef.current.translation();
      rigidBodyRef.current.setNextKinematicTranslation(
        {
          x: pos.x,
          y: state.height,
          z: pos.z,
        },
        false
      );

      // Set velocity on rigidbody so capture sees it
      rigidBodyRef.current.setLinvel(
        {
          x: 0,
          y: state.upwardVelocity,
          z: 0,
        },
        false
      );

      // Trigger capture when reaching start height
      if (state.height >= state.captureStartHeight && !velocityHistory.isCapturing()) {
        velocityHistory.startCapture();
        state.phase = 'capture';

        if (debugMode) {
          console.log('[VelocityCapture] Started capture at height:', state.height.toFixed(2));
        }
      }
    }

    // Continue capture phase
    if (state.phase === 'capture') {
      velocityHistory.recordSample();

      // Stop capture when reaching end height
      if (state.height >= state.captureEndHeight) {
        velocityHistory.completeCapture();
        state.phase = 'complete';

        // Get captured state
        const captured = velocityHistory.getCapturedState();
        if (captured) {
          setCapturedState(captured);
          onCaptureComplete?.(captured);

          // Validate captured velocity
          const validationRes = validateCapturedVelocity(
            captured,
            currentVelocity,
            validationConfig
          );
          setValidationResult(validationRes);

          if (debugMode) {
            console.log('[VelocityCapture] Capture complete:');
            console.log('  - Captured velocity:', captured.velocity);
            console.log('  - Quality:', captured.quality.toFixed(2));
            console.log('  - Samples:', captured.samplesIncluded);
            console.log('  - Validation:', validationRes.isValid ? 'PASS' : 'FAIL');
          }
        }
      }
    }

    // Update current velocity display
    const vel = rigidBodyRef.current.linvel();
    const currentVel = new THREE.Vector3(vel.x, vel.y, vel.z);
    setCurrentVelocity(currentVel);
  });

  // Log diagnostics when requested
  useEffect(() => {
    if (debugMode && capturedState) {
      const diag = velocityHistory.getDiagnostics();
      setDiagnostics(diag);
    }
  }, [capturedState, debugMode, velocityHistory]);

  return (
    <group>
      <RigidBody
        ref={rigidBodyRef}
        type="kinematicPosition"
        position={position}
        colliders={false}
      >
        {/* Visual representation */}
        <mesh>
          <boxGeometry args={[1, 0.5, 2]} />
          <meshStandardMaterial
            color={
              stateRef.current.phase === 'takeoff'
                ? '#ff6347'
                : stateRef.current.phase === 'capture'
                  ? '#ffa500'
                  : '#4169e1'
            }
          />
        </mesh>

        {/* Collision shape */}
        <CuboidCollider args={[0.5, 0.25, 1]} />
      </RigidBody>

      {/* Debug display */}
      {debugMode && (
        <group position={[3, 0, 0]}>
          {/* This could be replaced with a Canvas DOM overlay in a real app */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2, 4]} />
            <meshBasicMaterial transparent opacity={0.1} color="#000000" />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Development utility: Display velocity capture state
 * This should be rendered as a DOM overlay, not in 3D space
 */
export function VelocityCaptureDebugDisplay({
  state,
  validation,
}: {
  state: CapturedVelocityState | null;
  validation: any | null;
}) {
  if (!state) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#0f0',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Velocity Capture Debug</div>

      <div>Status: {validation?.isValid ? '✓ VALID' : '✗ INVALID'}</div>
      <div>Quality Score: {state.quality.toFixed(3)}</div>
      <div>Samples: {state.samplesIncluded}</div>

      <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
        <div>Velocity:</div>
        <div>  X: {state.velocity.x.toFixed(3)}</div>
        <div>  Y: {state.velocity.y.toFixed(3)}</div>
        <div>  Z: {state.velocity.z.toFixed(3)}</div>
        <div>  Magnitude: {state.velocity.length().toFixed(3)}</div>
      </div>

      {validation && (
        <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
          <div>Validation Score: {validation.score.toFixed(3)}</div>
          <div>
            Checks:
            <div style={{ paddingLeft: '10px' }}>
              <div>Magnitude: {validation.checks.magnitudeInRange ? '✓' : '✗'}</div>
              <div>Quality: {validation.checks.qualityScore ? '✓' : '✗'}</div>
              <div>Acceleration: {validation.checks.accelerationReasonable ? '✓' : '✗'}</div>
              <div>Position: {validation.checks.positionValid ? '✓' : '✗'}</div>
            </div>
          </div>
          {validation.warnings.length > 0 && (
            <div style={{ marginTop: '8px', color: '#ffa500' }}>
              Warnings:
              {validation.warnings.map((w: string, i: number) => (
                <div key={i} style={{ paddingLeft: '10px', fontSize: '10px' }}>
                  • {w}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
