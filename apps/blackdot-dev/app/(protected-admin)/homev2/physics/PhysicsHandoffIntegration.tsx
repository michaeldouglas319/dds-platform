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
  usePhysicsTransition,
  DEFAULT_TRANSITION_CONFIG,
  type PhysicsTransitionConfig,
  type TransitionPhase,
  type TransitionCompleteEvent,
} from './usePhysicsTransition';
import {
  validateCapturedVelocity,
  DEFAULT_VALIDATION_CONFIG,
  type VelocityValidationConfig,
} from './velocityValidation';

/**
 * Workflow state for the physics handoff process
 */
export type PhysicsHandoffState =
  | 'idle'           // Waiting to start
  | 'kinematic'      // Moving in kinematic mode
  | 'capturing'      // Capturing velocity samples
  | 'validating'     // Validating captured velocity
  | 'transitioning'  // Executing 5-phase transition
  | 'dynamic'        // Moving in dynamic/physics mode
  | 'landing'        // Returning to kinematic (future)
  | 'error';         // Error state

/**
 * Props for the physics handoff integration component
 */
interface PhysicsHandoffIntegrationProps {
  /** Position to spawn the vehicle */
  position?: [number, number, number];
  /** Configuration for velocity capture */
  velocityConfig?: VelocityHistoryConfig;
  /** Configuration for transitions */
  transitionConfig?: PhysicsTransitionConfig;
  /** Configuration for validation */
  validationConfig?: VelocityValidationConfig;
  /** Callback when state changes */
  onStateChange?: (state: PhysicsHandoffState) => void;
  /** Callback when transition completes */
  onTransitionComplete?: (event: TransitionCompleteEvent) => void;
  /** Enable detailed logging */
  debugMode?: boolean;
}

/**
 * Comprehensive integration component demonstrating the complete physics handoff workflow
 *
 * Workflow:
 * 1. Start in kinematic mode (controlled movement)
 * 2. At trigger point (e.g., takeoff completion), start velocity capture
 * 3. Sample velocity for 3-5 frames, averaging to smooth value
 * 4. Validate captured velocity quality
 * 5. Execute 5-phase transition:
 *    - Phase 1: Capturing (already done above)
 *    - Phase 2: Switching (kinematic→dynamic)
 *    - Phase 3: Restoring (position/rotation)
 *    - Phase 4: Setting (velocity/damping)
 *    - Phase 5: Blending (smooth introduction)
 * 6. Continue in dynamic/physics mode
 *
 * @example
 * <PhysicsHandoffIntegration
 *   position={[0, 10, 0]}
 *   onStateChange={(state) => console.log('State:', state)}
 *   onTransitionComplete={(event) => console.log('Transition:', event.success)}
 *   debugMode={true}
 * />
 */
export function PhysicsHandoffIntegration({
  position = [0, 0.1, 0],
  velocityConfig = DEFAULT_VELOCITY_HISTORY_CONFIG,
  transitionConfig = DEFAULT_TRANSITION_CONFIG,
  validationConfig = DEFAULT_VALIDATION_CONFIG,
  onStateChange,
  onTransitionComplete,
  debugMode = false,
}: PhysicsHandoffIntegrationProps) {
  const rigidBodyRef = useRef<any>(null);
  const [handoffState, setHandoffState] = useState<PhysicsHandoffState>('kinematic');
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Initialize velocity history and transition systems
  const velocityHistory = useVelocityHistory(rigidBodyRef, velocityConfig);
  const transition = usePhysicsTransition(rigidBodyRef, transitionConfig);

  // Simulation parameters
  const simStateRef = useRef({
    phase: 'kinematic' as 'kinematic' | 'transition' | 'dynamic',
    upwardVelocity: 0,
    height: 0,
    distance: 0,
    captureStartHeight: 15,
    captureEndHeight: 25,
    lastValidVelocity: new THREE.Vector3(0, 1, 0),
  });

  /**
   * Update handoff state and trigger callbacks
   */
  const updateHandoffState = (newState: PhysicsHandoffState) => {
    setHandoffState(newState);
    onStateChange?.(newState);
    if (debugMode) {
      console.log('[PhysicsHandoff] State change:', newState);
    }
  };

  /**
   * Handle transition phase changes
   */
  useEffect(() => {
    transition.onPhaseChange((phase) => {
      setTransitionPhase(phase);
      if (debugMode) {
        console.log('[PhysicsHandoff] Transition phase:', phase);
      }
    });

    transition.onTransitionComplete((event) => {
      if (event.success) {
        updateHandoffState('dynamic');
        simStateRef.current.phase = 'dynamic';
        if (debugMode) {
          console.log('[PhysicsHandoff] Transition successful, now in dynamic mode');
        }
      } else {
        updateHandoffState('error');
        if (debugMode) {
          console.error('[PhysicsHandoff] Transition failed:', event.error);
        }
      }
      onTransitionComplete?.(event);
    });

    transition.onTransitionError((error) => {
      updateHandoffState('error');
      if (debugMode) {
        console.error('[PhysicsHandoff] Transition error:', error);
      }
    });
  }, [transition, debugMode]);

  /**
   * Main simulation loop
   */
  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    const simState = simStateRef.current;
    const rb = rigidBodyRef.current;

    // Phase 1: Kinematic movement (takeoff simulation)
    if (simState.phase === 'kinematic') {
      simState.upwardVelocity += 50 * delta; // Accelerate upward
      simState.height += simState.upwardVelocity * delta;

      // Move rigidbody
      const pos = rb.translation();
      rb.setNextKinematicTranslation(
        {
          x: pos.x,
          y: simState.height,
          z: pos.z,
        },
        false
      );

      // Set velocity on rigidbody (captured by velocity history)
      rb.setLinvel(
        {
          x: 0,
          y: simState.upwardVelocity,
          z: 0,
        },
        false
      );

      // Trigger capture at takeoff completion
      if (
        simState.height >= simState.captureStartHeight &&
        !velocityHistory.isCapturing()
      ) {
        updateHandoffState('capturing');
        velocityHistory.startCapture();

        if (debugMode) {
          console.log(
            '[PhysicsHandoff] Started velocity capture at height:',
            simState.height.toFixed(2)
          );
        }
      }
    }

    // Phase 2: Capturing velocity
    if (simState.phase === 'kinematic' && velocityHistory.isCapturing()) {
      velocityHistory.recordSample();

      // Complete capture at end height
      if (simState.height >= simState.captureEndHeight) {
        velocityHistory.completeCapture();
        updateHandoffState('validating');

        // Get captured state
        const capturedState = velocityHistory.getCapturedState();
        if (capturedState) {
          // Validate captured velocity
          const validation = validateCapturedVelocity(
            capturedState,
            simState.lastValidVelocity,
            validationConfig
          );

          if (debugMode) {
            console.log('[PhysicsHandoff] Velocity capture complete:');
            console.log('  - Captured:', capturedState.velocity);
            console.log('  - Quality:', capturedState.quality.toFixed(3));
            console.log('  - Validation:', validation.isValid ? 'PASS' : 'FAIL');
            console.log('  - Warnings:', validation.warnings);
          }

          // Start transition if validation passes
          if (validation.isValid) {
            updateHandoffState('transitioning');
            simState.phase = 'transition';

            // Use validated velocity or fallback
            const velocityToUse = validation.isValid
              ? capturedState.velocity
              : validation.fallbackVelocity;

            // Update captured state with validated velocity
            const validatedState: CapturedVelocityState = {
              ...capturedState,
              velocity: velocityToUse,
            };

            // Start the transition
            transition.startTransition('dynamic', validatedState, 'kinematicPosition');
          } else {
            // Validation failed, stay in kinematic or use fallback
            if (debugMode) {
              console.warn('[PhysicsHandoff] Validation failed, staying kinematic');
            }
            updateHandoffState('kinematic');
          }
        }
      }
    }

    // Phase 3: Execute transition frame updates
    if (simState.phase === 'transition') {
      transition.updateTransition(delta);
    }

    // Phase 4: Dynamic mode (physics driven)
    if (simState.phase === 'dynamic') {
      // Physics engine now controls motion
      // Apply additional forces as needed
    }

    // Update debug info
    if (debugMode) {
      const vel = rb.linvel();
      const trans = rb.translation();
      setDebugInfo({
        position: [trans.x.toFixed(2), trans.y.toFixed(2), trans.z.toFixed(2)],
        velocity: [vel.x.toFixed(2), vel.y.toFixed(2), vel.z.toFixed(2)],
        height: simState.height.toFixed(2),
        state: handoffState,
        transitionPhase,
      });
    }
  });

  return (
    <group>
      <RigidBody
        ref={rigidBodyRef}
        type="kinematicPosition"
        position={position}
        colliders={false}
      >
        {/* Visual representation with color-coded state */}
        <mesh>
          <boxGeometry args={[1, 0.5, 2]} />
          <meshStandardMaterial
            color={
              handoffState === 'kinematic'
                ? '#ff6347' // Red - kinematic
                : handoffState === 'capturing'
                  ? '#ffa500' // Orange - capturing
                  : handoffState === 'validating'
                    ? '#ffff00' // Yellow - validating
                    : handoffState === 'transitioning'
                      ? '#87ceeb' // Sky blue - transitioning
                      : handoffState === 'dynamic'
                        ? '#4169e1' // Blue - dynamic
                        : '#ff0000' // Red - error
            }
          />
        </mesh>

        {/* Collision shape */}
        <CuboidCollider args={[0.5, 0.25, 1]} />
      </RigidBody>

      {/* Debug display component */}
      {debugMode && debugInfo && (
        <PhysicsHandoffDebugDisplay info={debugInfo} />
      )}
    </group>
  );
}

/**
 * Debug display for physics handoff state
 */
function PhysicsHandoffDebugDisplay({ info }: { info: any }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#0f0',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        maxWidth: '350px',
        zIndex: 1001,
        border: '1px solid #0f0',
        borderRadius: '4px',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Physics Handoff Debug</div>

      <div>State: {info.state.toUpperCase()}</div>
      <div>Transition Phase: {info.transitionPhase}</div>

      <div style={{ marginTop: '8px', borderTop: '1px solid #0f0', paddingTop: '8px' }}>
        <div>Position:</div>
        <div>  [{info.position.join(', ')}]</div>
        <div>Height: {info.height}m</div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <div>Velocity:</div>
        <div>  [{info.velocity.join(', ')}]</div>
      </div>

      <div style={{ marginTop: '8px', fontSize: '9px', color: '#aaa' }}>
        Watch the color change:
        <div>🔴 Red = Kinematic</div>
        <div>🟠 Orange = Capturing velocity</div>
        <div>🟡 Yellow = Validating</div>
        <div>🔵 Blue = Transitioning/Dynamic</div>
      </div>
    </div>
  );
}
