'use client';

import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';

/**
 * Configuration for velocity capture and averaging
 */
export interface VelocityHistoryConfig {
  /** Number of frames to sample for velocity averaging (3-5 recommended) */
  captureFrames: number;
  /** Minimum velocity magnitude to consider valid (prevents noise at low speeds) */
  minVelocityThreshold: number;
  /** Maximum velocity magnitude to consider valid (prevents outliers) */
  maxVelocityThreshold: number;
  /** Enable outlier detection and filtering */
  enableOutlierDetection: boolean;
  /** Standard deviation multiplier for outlier detection (2-3 recommended) */
  outlierSigmaThreshold: number;
}

/**
 * Captured velocity state for physics handoff
 */
export interface CapturedVelocityState {
  /** Averaged velocity vector */
  velocity: THREE.Vector3;
  /** Position at capture time */
  position: THREE.Vector3;
  /** Rotation quaternion at capture time */
  rotation: THREE.Quaternion;
  /** Linear acceleration (for prediction) */
  acceleration: THREE.Vector3;
  /** Timestamp of capture */
  timestamp: number;
  /** Number of frames included in average */
  samplesIncluded: number;
  /** Quality score (0-1) indicating confidence in capture */
  quality: number;
}

/**
 * Internal frame sample for velocity history
 */
interface VelocitySample {
  velocity: THREE.Vector3;
  timestamp: number;
}

/**
 * Custom hook for capturing velocity history from Rapier rigidbodies
 *
 * Maintains a sliding window of velocity samples and provides methods to:
 * - Sample current velocity
 * - Average captured velocities
 * - Validate velocity quality
 * - Detect and filter outliers
 *
 * @example
 * const velocityHistory = useVelocityHistory(rigidBodyRef, config);
 *
 * // Start sampling on takeoff completion
 * velocityHistory.startCapture();
 *
 * // Wait for capture completion (uses requestAnimationFrame)
 * await velocityHistory.waitForCapture();
 *
 * // Get the captured velocity state
 * const capturedState = velocityHistory.getCapturedState();
 */
// Note: RigidBody from @react-three/rapier is a React component, not a class.
// Using any to work around library type issues.
export function useVelocityHistory(
  rigidBodyRef: React.RefObject<any>,
  config: VelocityHistoryConfig = DEFAULT_VELOCITY_HISTORY_CONFIG
) {
  const samplesRef = useRef<VelocitySample[]>([]);
  const isCapturingRef = useRef(false);
  const captureCompleteRef = useRef(false);
  const capturedStateRef = useRef<CapturedVelocityState | null>(null);
  const captureResolveRef = useRef<(() => void) | null>(null);

  /**
   * Record a single velocity sample
   */
  const recordSample = useCallback(() => {
    if (!rigidBodyRef.current) return;

    const linvel = rigidBodyRef.current.linvel();
    const velocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

    samplesRef.current.push({
      velocity,
      timestamp: performance.now(),
    });

    // Keep only the latest N samples
    if (samplesRef.current.length > config.captureFrames) {
      samplesRef.current.shift();
    }
  }, [config.captureFrames]);

  /**
   * Calculate statistics for outlier detection
   */
  const calculateVelocityStats = useCallback(() => {
    const samples = samplesRef.current;
    if (samples.length === 0) {
      return { mean: 0, stdDev: 0, magnitudes: [] };
    }

    const magnitudes = samples.map((s) => s.velocity.length());
    const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const variance =
      magnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) /
      magnitudes.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev, magnitudes };
  }, []);

  /**
   * Filter out velocity samples that are statistical outliers
   */
  const filterOutliers = useCallback((): THREE.Vector3[] => {
    if (!config.enableOutlierDetection) {
      return samplesRef.current.map((s) => s.velocity.clone());
    }

    const samples = samplesRef.current;
    const { mean, stdDev } = calculateVelocityStats();

    return samples
      .map((s, idx) => ({ velocity: s.velocity.clone(), magnitude: s.velocity.length(), idx }))
      .filter((item) => {
        const magnitude = item.magnitude;
        const deviation = Math.abs(magnitude - mean);
        const isOutlier = deviation > stdDev * config.outlierSigmaThreshold;
        return !isOutlier;
      })
      .map((item) => item.velocity);
  }, [config.enableOutlierDetection, config.outlierSigmaThreshold, calculateVelocityStats]);

  /**
   * Validate if captured velocity meets thresholds
   */
  const validateVelocity = useCallback((velocity: THREE.Vector3): boolean => {
    const magnitude = velocity.length();
    return magnitude >= config.minVelocityThreshold && magnitude <= config.maxVelocityThreshold;
  }, [config.minVelocityThreshold, config.maxVelocityThreshold]);

  /**
   * Compute quality score for captured state (0-1)
   * Higher score = more confidence in capture
   */
  const computeQualityScore = useCallback((samples: THREE.Vector3[]): number => {
    if (samples.length === 0) return 0;

    // Score based on number of samples
    const sampleScore = Math.min(samples.length / config.captureFrames, 1.0);

    // Score based on velocity consistency (low variance = high consistency)
    if (samples.length > 1) {
      const magnitudes = samples.map((s) => s.length());
      const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
      const variance =
        magnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / magnitudes.length;
      const stdDev = Math.sqrt(variance);

      // Normalize stdDev to 0-1 score (lower stdDev = higher score)
      const consistencyScore = Math.max(0, 1 - stdDev / (mean + 0.001));

      // Combined score weighted: 60% samples, 40% consistency
      return sampleScore * 0.6 + consistencyScore * 0.4;
    }

    return sampleScore;
  }, [config.captureFrames]);

  /**
   * Average the captured velocity samples
   */
  const averageVelocities = useCallback((velocities: THREE.Vector3[]): THREE.Vector3 => {
    if (velocities.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    const average = new THREE.Vector3();
    velocities.forEach((v) => average.add(v));
    average.divideScalar(velocities.length);

    return average;
  }, []);

  /**
   * Start capturing velocity samples
   */
  const startCapture = useCallback(() => {
    samplesRef.current = [];
    isCapturingRef.current = true;
    captureCompleteRef.current = false;
    capturedStateRef.current = null;
  }, []);

  /**
   * Complete the capture and compute averaged velocity
   */
  const completeCapture = useCallback(() => {
    if (!isCapturingRef.current || !rigidBodyRef.current) {
      return;
    }

    // Get current position and rotation
    const translation = rigidBodyRef.current.translation();
    const rotation = rigidBodyRef.current.rotation();

    const position = new THREE.Vector3(translation.x, translation.y, translation.z);
    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

    // Filter outliers and average
    const filteredVelocities = filterOutliers();
    const averagedVelocity = averageVelocities(filteredVelocities);

    // Validate the captured velocity
    if (!validateVelocity(averagedVelocity)) {
      console.warn(
        `[VelocityHistory] Captured velocity magnitude ${averagedVelocity.length().toFixed(2)} outside threshold range [${config.minVelocityThreshold}, ${config.maxVelocityThreshold}]`
      );
    }

    // Compute acceleration (change in velocity per frame)
    let acceleration = new THREE.Vector3(0, 0, 0);
    if (samplesRef.current.length >= 2) {
      const first = samplesRef.current[0];
      const last = samplesRef.current[samplesRef.current.length - 1];
      const timeDelta = (last.timestamp - first.timestamp) / 1000; // Convert to seconds
      if (timeDelta > 0) {
        acceleration = new THREE.Vector3()
          .subVectors(last.velocity, first.velocity)
          .divideScalar(timeDelta);
      }
    }

    // Compute quality score
    const quality = computeQualityScore(filteredVelocities);

    capturedStateRef.current = {
      velocity: averagedVelocity,
      position,
      rotation: quaternion,
      acceleration,
      timestamp: performance.now(),
      samplesIncluded: filteredVelocities.length,
      quality,
    };

    isCapturingRef.current = false;
    captureCompleteRef.current = true;

    // Resolve any waiting promises
    if (captureResolveRef.current) {
      captureResolveRef.current();
      captureResolveRef.current = null;
    }
  }, [
    filterOutliers,
    averageVelocities,
    validateVelocity,
    computeQualityScore,
  ]);

  /**
   * Check if capture is currently in progress
   */
  const isCapturing = useCallback((): boolean => isCapturingRef.current, []);

  /**
   * Check if capture has completed
   */
  const isCaptureComplete = useCallback((): boolean => captureCompleteRef.current, []);

  /**
   * Get the captured velocity state
   */
  const getCapturedState = useCallback((): CapturedVelocityState | null => {
    return capturedStateRef.current;
  }, []);

  /**
   * Wait for capture to complete (returns a promise)
   * Useful for async workflows
   */
  const waitForCapture = useCallback(
    (maxWaitTime = 1000): Promise<CapturedVelocityState | null> => {
      return new Promise((resolve) => {
        if (captureCompleteRef.current) {
          resolve(capturedStateRef.current);
          return;
        }

        // Set up resolver
        captureResolveRef.current = () => resolve(capturedStateRef.current);

        // Timeout safety
        const timeoutId = setTimeout(() => {
          captureResolveRef.current = null;
          resolve(null);
        }, maxWaitTime);

        // Clear timeout if capture completes before timeout
        const originalResolve = captureResolveRef.current;
        captureResolveRef.current = () => {
          clearTimeout(timeoutId);
          originalResolve();
        };
      });
    },
    []
  );

  /**
   * Reset velocity history and captured state
   */
  const reset = useCallback(() => {
    samplesRef.current = [];
    isCapturingRef.current = false;
    captureCompleteRef.current = false;
    capturedStateRef.current = null;
  }, []);

  /**
   * Get detailed diagnostics for debugging
   */
  const getDiagnostics = useCallback(() => {
    const samples = samplesRef.current;
    const magnitudes = samples.map((s) => s.velocity.length());
    const { mean, stdDev } = calculateVelocityStats();

    return {
      totalSamples: samples.length,
      minMagnitude: magnitudes.length > 0 ? Math.min(...magnitudes) : 0,
      maxMagnitude: magnitudes.length > 0 ? Math.max(...magnitudes) : 0,
      meanMagnitude: mean,
      stdDeviation: stdDev,
      isCapturing: isCapturingRef.current,
      isCaptureComplete: captureCompleteRef.current,
      capturedState: capturedStateRef.current,
    };
  }, [calculateVelocityStats]);

  return {
    // Recording
    recordSample,

    // Capture control
    startCapture,
    completeCapture,
    isCapturing,
    isCaptureComplete,

    // Data access
    getCapturedState,
    waitForCapture,

    // Utilities
    reset,
    getDiagnostics,
  };
}

/**
 * Default configuration for velocity history capture
 * Optimized for aircraft takeoff → orbit transitions
 */
export const DEFAULT_VELOCITY_HISTORY_CONFIG: VelocityHistoryConfig = {
  captureFrames: 5, // Capture 5 frames (≈83ms at 60fps)
  minVelocityThreshold: 0.1, // Minimum 0.1 units/frame
  maxVelocityThreshold: 100, // Maximum 100 units/frame
  enableOutlierDetection: true,
  outlierSigmaThreshold: 2.5, // 2.5σ standard deviation threshold
};
