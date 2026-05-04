'use client';

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import type { CapturedVelocityState } from './useVelocityHistory';
import type { VelocityValidationConfig } from './velocityValidation';

/**
 * The 5 phases of kinematic↔dynamic transition
 *
 * Phase 1 (Capturing): Sample velocity across multiple frames
 * Phase 2 (Switching): Change rigidbody type (kinematic→dynamic or vice versa)
 * Phase 3 (Restoring): Restore position and rotation to prevent visual snaps
 * Phase 4 (Setting): Apply captured velocity and damping
 * Phase 5 (Blending): Smooth physics introduction (optional, for visual smoothness)
 */
export type TransitionPhase = 'idle' | 'capturing' | 'switching' | 'restoring' | 'setting' | 'blending' | 'complete';

/**
 * Rigidbody type for transitions
 */
export type RigidBodyType = 'kinematicPosition' | 'kinematicVelocity' | 'dynamic';

/**
 * Configuration for physics transition
 */
export interface PhysicsTransitionConfig {
  /** Duration of the blending phase (seconds) - smooth physics introduction */
  blendDuration: number;

  /** Number of frames to capture velocity (3-5 recommended) */
  captureFrames: number;

  /** Linear damping to apply after transition (0 = no damping, 1 = max) */
  linearDamping: number;

  /** Angular damping to apply after transition */
  angularDamping: number;

  /** Initial impulse strength when switching to dynamic (0 = none) */
  initialImpulseStrength: number;

  /** Enable detailed logging for debugging */
  enableLogging: boolean;

  /** Timeout for transition completion (milliseconds) */
  transitionTimeout: number;
}

/**
 * State of an active transition
 */
export interface TransitionState {
  /** Current phase of transition */
  phase: TransitionPhase;

  /** Time elapsed in current phase (seconds) */
  phaseTimer: number;

  /** Captured velocity at handoff point */
  capturedVelocity: THREE.Vector3 | null;

  /** Captured position at handoff point */
  capturedPosition: THREE.Vector3 | null;

  /** Captured rotation at handoff point */
  capturedRotation: THREE.Quaternion | null;

  /** Captured acceleration (for prediction) */
  capturedAcceleration: THREE.Vector3 | null;

  /** Quality score of capture (0-1) */
  captureQuality: number;

  /** Target rigidbody type for transition */
  targetType: RigidBodyType;

  /** Source rigidbody type (before transition) */
  sourceType: RigidBodyType;

  /** Whether transition has completed */
  isComplete: boolean;

  /** Error message if transition failed */
  error: string | null;
}

/**
 * Detailed transition diagnostics for debugging
 */
export interface TransitionDiagnostics {
  phase: TransitionPhase;
  elapsedTime: number;
  capturedVelocityMagnitude: number;
  velocityValidation: {
    isInRange: boolean;
    hasAcceleration: boolean;
  };
  positionDelta: number | null;
  phaseTimings: Record<TransitionPhase, number>;
}

/**
 * Transition completion event details
 */
export interface TransitionCompleteEvent {
  success: boolean;
  phase: TransitionPhase;
  error?: string;
  diagnostics: TransitionDiagnostics;
  finalVelocity: THREE.Vector3;
}

/**
 * Hook for managing kinematic↔dynamic rigidbody transitions
 *
 * Implements the critical 5-phase transition system:
 * 1. Capturing - sample velocity (uses external velocity history)
 * 2. Switching - change rigidbody type
 * 3. Restoring - restore position/rotation
 * 4. Setting - apply velocity and damping
 * 5. Blending - optional smooth physics introduction
 *
 * @example
 * const transition = usePhysicsTransition(rigidBodyRef, config);
 *
 * // Start kinematic→dynamic transition
 * transition.startTransition(
 *   'dynamic',
 *   capturedVelocityState,
 *   'kinematicPosition'
 * );
 *
 * // Listen for completion
 * transition.onTransitionComplete((event) => {
 *   console.log('Transition success:', event.success);
 * });
 */
// Note: RigidBody from @react-three/rapier is a React component, not a class.
// Using any to work around library type issues.
export function usePhysicsTransition(
  rigidBodyRef: React.RefObject<any>,
  config: PhysicsTransitionConfig = DEFAULT_TRANSITION_CONFIG
) {
  const stateRef = useRef<TransitionState>({
    phase: 'idle',
    phaseTimer: 0,
    capturedVelocity: null,
    capturedPosition: null,
    capturedRotation: null,
    capturedAcceleration: null,
    captureQuality: 0,
    targetType: 'dynamic',
    sourceType: 'kinematicPosition',
    isComplete: false,
    error: null,
  });

  const callbacksRef = useRef<{
    onPhaseChange?: (phase: TransitionPhase) => void;
    onTransitionComplete?: (event: TransitionCompleteEvent) => void;
    onTransitionError?: (error: Error) => void;
  }>({});

  const phaseTimingsRef = useRef<Record<TransitionPhase, number>>({
    idle: 0,
    capturing: 0,
    switching: 0,
    restoring: 0,
    setting: 0,
    blending: 0,
    complete: 0,
  });

  const transitionStartTimeRef = useRef<number>(0);

  /**
   * Change to a new phase and trigger callbacks
   */
  const setPhase = useCallback((newPhase: TransitionPhase) => {
    const state = stateRef.current;
    if (state.phase !== newPhase) {
      if (config.enableLogging) {
        console.log(
          `[PhysicsTransition] Phase change: ${state.phase} → ${newPhase}`
        );
      }
      state.phase = newPhase;
      state.phaseTimer = 0;
      callbacksRef.current.onPhaseChange?.(newPhase);
    }
  }, [config.enableLogging]);

  /**
   * Log transition event
   */
  const log = useCallback((message: string) => {
    if (config.enableLogging) {
      const elapsed = (performance.now() - transitionStartTimeRef.current) / 1000;
      console.log(`[PhysicsTransition +${elapsed.toFixed(3)}s] ${message}`);
    }
  }, [config.enableLogging]);

  /**
   * Initialize a new transition with captured velocity state
   */
  const startTransition = useCallback(
    (
      targetType: RigidBodyType,
      capturedState: CapturedVelocityState,
      sourceType: RigidBodyType = 'kinematicPosition'
    ) => {
      if (!rigidBodyRef.current) {
        const error = 'RigidBody ref not initialized';
        if (callbacksRef.current.onTransitionError) {
          callbacksRef.current.onTransitionError(new Error(error));
        }
        return;
      }

      transitionStartTimeRef.current = performance.now();
      const state = stateRef.current;

      // Reset state
      state.phase = 'capturing';
      state.phaseTimer = 0;
      state.capturedVelocity = capturedState.velocity.clone();
      state.capturedPosition = capturedState.position.clone();
      state.capturedRotation = capturedState.rotation.clone();
      state.capturedAcceleration = capturedState.acceleration.clone();
      state.captureQuality = capturedState.quality;
      state.targetType = targetType;
      state.sourceType = sourceType;
      state.isComplete = false;
      state.error = null;

      log(
        `Starting transition: ${sourceType} → ${targetType} (quality: ${state.captureQuality.toFixed(3)})`
      );
      setPhase('switching');
    },
    [log, setPhase]
  );

  /**
   * Execute Phase 2: Switch rigidbody type
   */
  const executeSwitch = useCallback(() => {
    const state = stateRef.current;
    if (!rigidBodyRef.current || state.phase !== 'switching') return;

    const rb = rigidBodyRef.current;

    try {
      // Convert target type to Rapier internal representation
      // 0 = fixed, 1 = dynamic, 2 = kinematicPosition, 3 = kinematicVelocity
      let typeCode = 1; // default to dynamic
      if (state.targetType === 'kinematicPosition') typeCode = 2;
      if (state.targetType === 'kinematicVelocity') typeCode = 3;

      rb.setBodyType(typeCode, true);
      log(`Switched rigidbody type to ${state.targetType}`);

      setPhase('restoring');
    } catch (error) {
      state.error = `Failed to switch rigidbody type: ${error}`;
      log(`ERROR: ${state.error}`);
      if (callbacksRef.current.onTransitionError) {
        callbacksRef.current.onTransitionError(new Error(state.error));
      }
      setPhase('complete');
    }
  }, [log, setPhase]);

  /**
   * Execute Phase 3: Restore position and rotation
   */
  const executeRestore = useCallback(() => {
    const state = stateRef.current;
    if (!rigidBodyRef.current || state.phase !== 'restoring') return;

    if (!state.capturedPosition || !state.capturedRotation) {
      state.error = 'No captured position/rotation available';
      log(`ERROR: ${state.error}`);
      setPhase('complete');
      return;
    }

    const rb = rigidBodyRef.current;

    try {
      // Restore position
      rb.setTranslation(
        {
          x: state.capturedPosition.x,
          y: state.capturedPosition.y,
          z: state.capturedPosition.z,
        },
        true // wakeUp
      );

      // Restore rotation
      rb.setRotation(state.capturedRotation, true);

      log(
        `Restored position [${state.capturedPosition.x.toFixed(2)}, ${state.capturedPosition.y.toFixed(2)}, ${state.capturedPosition.z.toFixed(2)}]`
      );

      setPhase('setting');
    } catch (error) {
      state.error = `Failed to restore position/rotation: ${error}`;
      log(`ERROR: ${state.error}`);
      if (callbacksRef.current.onTransitionError) {
        callbacksRef.current.onTransitionError(new Error(state.error));
      }
      setPhase('complete');
    }
  }, [log, setPhase]);

  /**
   * Execute Phase 4: Set velocity and damping
   */
  const executeSetting = useCallback(() => {
    const state = stateRef.current;
    if (!rigidBodyRef.current || state.phase !== 'setting') return;

    if (!state.capturedVelocity) {
      state.error = 'No captured velocity available';
      log(`ERROR: ${state.error}`);
      setPhase('complete');
      return;
    }

    const rb = rigidBodyRef.current;

    try {
      // Set linear velocity
      rb.setLinvel(
        {
          x: state.capturedVelocity.x,
          y: state.capturedVelocity.y,
          z: state.capturedVelocity.z,
        },
        true
      );

      // Set damping for smooth motion
      rb.setLinearDamping(config.linearDamping);
      rb.setAngularDamping(config.angularDamping);

      log(
        `Set velocity [${state.capturedVelocity.x.toFixed(2)}, ${state.capturedVelocity.y.toFixed(2)}, ${state.capturedVelocity.z.toFixed(2)}]`
      );

      // Apply initial impulse if configured
      if (config.initialImpulseStrength > 0 && state.targetType === 'dynamic') {
        const impulseDir = state.capturedVelocity.clone().normalize();
        const impulse = impulseDir.multiplyScalar(config.initialImpulseStrength);
        rb.applyImpulse(
          {
            x: impulse.x,
            y: impulse.y,
            z: impulse.z,
          },
          true
        );
        log(`Applied impulse: ${config.initialImpulseStrength}`);
      }

      // Move to blending or complete
      if (config.blendDuration > 0) {
        setPhase('blending');
      } else {
        setPhase('complete');
      }
    } catch (error) {
      state.error = `Failed to set velocity: ${error}`;
      log(`ERROR: ${state.error}`);
      if (callbacksRef.current.onTransitionError) {
        callbacksRef.current.onTransitionError(new Error(state.error));
      }
      setPhase('complete');
    }
  }, [config.linearDamping, config.angularDamping, config.initialImpulseStrength, config.blendDuration, log, setPhase]);

  /**
   * Execute Phase 5: Blending (smooth physics introduction)
   */
  const executeBlending = useCallback((delta: number) => {
    const state = stateRef.current;
    if (state.phase !== 'blending') return;

    state.phaseTimer += delta;

    if (state.phaseTimer >= config.blendDuration) {
      log(`Blending complete`);
      setPhase('complete');
    }
  }, [config.blendDuration, log, setPhase]);

  /**
   * Execute transition frame update
   */
  const updateTransition = useCallback(
    (delta: number) => {
      const state = stateRef.current;
      const timeoutExpired =
        performance.now() - transitionStartTimeRef.current > config.transitionTimeout;

      if (timeoutExpired && !state.isComplete) {
        state.error = 'Transition timeout';
        state.isComplete = true;
        log('ERROR: Transition timeout');
        setPhase('complete');
        return;
      }

      state.phaseTimer += delta;

      // Execute current phase
      switch (state.phase) {
        case 'switching':
          executeSwitch();
          break;
        case 'restoring':
          executeRestore();
          break;
        case 'setting':
          executeSetting();
          break;
        case 'blending':
          executeBlending(delta);
          break;
        case 'complete':
          if (!state.isComplete) {
            state.isComplete = true;
            const finalVelocity = state.capturedVelocity || new THREE.Vector3();
            const event: TransitionCompleteEvent = {
              success: state.error === null,
              phase: state.phase,
              error: state.error || undefined,
              diagnostics: getDiagnostics(),
              finalVelocity,
            };
            callbacksRef.current.onTransitionComplete?.(event);
          }
          break;
      }
    },
    [
      executeSwitch,
      executeRestore,
      executeSetting,
      executeBlending,
      log,
      setPhase,
      config.transitionTimeout,
    ]
  );

  /**
   * Get current transition state
   */
  const getState = useCallback(() => stateRef.current, []);

  /**
   * Register callback for phase changes
   */
  const onPhaseChange = useCallback((callback: (phase: TransitionPhase) => void) => {
    callbacksRef.current.onPhaseChange = callback;
  }, []);

  /**
   * Register callback for transition completion
   */
  const onTransitionComplete = useCallback(
    (callback: (event: TransitionCompleteEvent) => void) => {
      callbacksRef.current.onTransitionComplete = callback;
    },
    []
  );

  /**
   * Register callback for errors
   */
  const onTransitionError = useCallback((callback: (error: Error) => void) => {
    callbacksRef.current.onTransitionError = callback;
  }, []);

  /**
   * Get detailed diagnostics
   */
  const getDiagnostics = useCallback((): TransitionDiagnostics => {
    const state = stateRef.current;
    const elapsed = (performance.now() - transitionStartTimeRef.current) / 1000;

    let positionDelta: number | null = null;
    if (state.capturedPosition && rigidBodyRef.current) {
      const current = rigidBodyRef.current.translation();
      const currentPos = new THREE.Vector3(current.x, current.y, current.z);
      positionDelta = currentPos.distanceTo(state.capturedPosition);
    }

    return {
      phase: state.phase,
      elapsedTime: elapsed,
      capturedVelocityMagnitude: state.capturedVelocity?.length() || 0,
      velocityValidation: {
        isInRange:
          !state.capturedVelocity ||
          (state.capturedVelocity.length() >= 0.05 && state.capturedVelocity.length() <= 150),
        hasAcceleration:
          state.capturedAcceleration !== null &&
          state.capturedAcceleration.length() > 0.001,
      },
      positionDelta,
      phaseTimings: { ...phaseTimingsRef.current },
    };
  }, []);

  return {
    // Control
    startTransition,
    updateTransition,

    // State access
    getState,
    getDiagnostics,

    // Callbacks
    onPhaseChange,
    onTransitionComplete,
    onTransitionError,
  };
}

/**
 * Default transition configuration
 * Optimized for aircraft takeoff→orbit transitions
 */
export const DEFAULT_TRANSITION_CONFIG: PhysicsTransitionConfig = {
  blendDuration: 0.5, // 500ms smooth blending
  captureFrames: 5, // 5 frames of velocity sampling
  linearDamping: 0.3, // Medium damping for stability
  angularDamping: 0.7, // Higher angular damping for stable orientation
  initialImpulseStrength: 0, // No initial impulse (velocity is set directly)
  enableLogging: false, // Disable logging by default (enable for debugging)
  transitionTimeout: 5000, // 5 second timeout
};

/**
 * Aggressive transition configuration
 * Minimal blending, quick transitions
 */
export const AGGRESSIVE_TRANSITION_CONFIG: PhysicsTransitionConfig = {
  blendDuration: 0.1,
  captureFrames: 3,
  linearDamping: 0.1,
  angularDamping: 0.3,
  initialImpulseStrength: 50,
  enableLogging: false,
  transitionTimeout: 2000,
};

/**
 * Conservative transition configuration
 * Maximum stability and smoothing
 */
export const CONSERVATIVE_TRANSITION_CONFIG: PhysicsTransitionConfig = {
  blendDuration: 1.0,
  captureFrames: 5,
  linearDamping: 0.5,
  angularDamping: 0.9,
  initialImpulseStrength: 0,
  enableLogging: false,
  transitionTimeout: 10000,
};
