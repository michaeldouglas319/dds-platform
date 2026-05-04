'use client';

import * as THREE from 'three';
import type { CapturedVelocityState } from './useVelocityHistory';

/**
 * Validation result for captured velocity
 */
export interface VelocityValidationResult {
  /** Whether the velocity passes all validation checks */
  isValid: boolean;
  /** Overall validation score (0-1) */
  score: number;
  /** Individual check results */
  checks: {
    magnitudeInRange: boolean;
    qualityScore: boolean;
    accelerationReasonable: boolean;
    positionValid: boolean;
  };
  /** Warnings for borderline cases */
  warnings: string[];
  /** Fallback velocity to use if validation fails */
  fallbackVelocity: THREE.Vector3;
}

/**
 * Configuration for velocity validation
 */
export interface VelocityValidationConfig {
  /** Minimum acceptable quality score (0-1) */
  minQualityScore: number;
  /** Maximum acceptable quality score (0-1) - catch suspicious 1.0 scores */
  maxQualityScore: number;
  /** Minimum velocity magnitude (units/frame) */
  minMagnitude: number;
  /** Maximum velocity magnitude (units/frame) - prevent outliers */
  maxMagnitude: number;
  /** Maximum acceptable acceleration magnitude (units/frame²) */
  maxAccelerationMagnitude: number;
  /** Whether to use fallback estimation if validation fails */
  useFallback: boolean;
}

/**
 * Validates captured velocity state and provides fallback estimation
 *
 * Checks:
 * - Velocity magnitude within bounds
 * - Quality score acceptable
 * - Acceleration within reasonable bounds
 * - Position not NaN/Inf
 *
 * Provides fallback velocity based on position delta if main validation fails
 */
export function validateCapturedVelocity(
  capturedState: CapturedVelocityState | null,
  lastKnownVelocity: THREE.Vector3,
  config: VelocityValidationConfig = DEFAULT_VALIDATION_CONFIG
): VelocityValidationResult {
  const warnings: string[] = [];

  // Null state check
  if (!capturedState) {
    return {
      isValid: false,
      score: 0,
      checks: {
        magnitudeInRange: false,
        qualityScore: false,
        accelerationReasonable: false,
        positionValid: false,
      },
      warnings: ['Captured state is null'],
      fallbackVelocity: lastKnownVelocity.clone(),
    };
  }

  // Check 1: Magnitude in range
  const magnitude = capturedState.velocity.length();
  const magnitudeInRange = magnitude >= config.minMagnitude && magnitude <= config.maxMagnitude;
  if (!magnitudeInRange) {
    warnings.push(
      `Velocity magnitude ${magnitude.toFixed(2)} outside range [${config.minMagnitude}, ${config.maxMagnitude}]`
    );
  }

  // Check 2: Quality score acceptable
  const qualityInRange =
    capturedState.quality >= config.minQualityScore && capturedState.quality <= config.maxQualityScore;
  if (!qualityInRange) {
    warnings.push(
      `Quality score ${capturedState.quality.toFixed(2)} outside acceptable range [${config.minQualityScore}, ${config.maxQualityScore}]`
    );
  }

  // Check 3: Acceleration within bounds
  const accelerationMagnitude = capturedState.acceleration.length();
  const accelerationReasonable = accelerationMagnitude <= config.maxAccelerationMagnitude;
  if (!accelerationReasonable) {
    warnings.push(
      `Acceleration magnitude ${accelerationMagnitude.toFixed(2)} exceeds max ${config.maxAccelerationMagnitude}`
    );
  }

  // Check 4: Position validity
  const positionValid =
    Number.isFinite(capturedState.position.x) &&
    Number.isFinite(capturedState.position.y) &&
    Number.isFinite(capturedState.position.z);
  if (!positionValid) {
    warnings.push('Captured position contains NaN or Inf values');
  }

  // Compute overall validation score
  let scoreSum = 0;
  let maxScore = 0;

  // Magnitude contribution (30%)
  if (magnitudeInRange) scoreSum += 0.3;
  maxScore += 0.3;

  // Quality contribution (40%)
  const qualityScore = Math.max(0, 1 - Math.abs(capturedState.quality - 0.8) * 2);
  scoreSum += qualityScore * 0.4;
  maxScore += 0.4;

  // Acceleration contribution (20%)
  if (accelerationReasonable) scoreSum += 0.2;
  maxScore += 0.2;

  // Position validity contribution (10%)
  if (positionValid) scoreSum += 0.1;
  maxScore += 0.1;

  const finalScore = maxScore > 0 ? scoreSum / maxScore : 0;

  // Determine if valid
  const isValid = magnitudeInRange && qualityInRange && accelerationReasonable && positionValid;

  // Compute fallback velocity
  let fallbackVelocity = lastKnownVelocity.clone();
  if (config.useFallback && !isValid) {
    // If magnitude is out of range, scale the captured velocity
    if (!magnitudeInRange && magnitude > 0) {
      fallbackVelocity = capturedState.velocity
        .clone()
        .normalize()
        .multiplyScalar(
          Math.max(config.minMagnitude, Math.min(config.maxMagnitude, magnitude))
        );
    }
    // If still using last known velocity, add estimated acceleration
    if (capturedState.acceleration.length() > 0) {
      fallbackVelocity = fallbackVelocity
        .clone()
        .add(capturedState.acceleration.clone().multiplyScalar(0.5));
    }
  }

  return {
    isValid,
    score: finalScore,
    checks: {
      magnitudeInRange,
      qualityScore: qualityInRange,
      accelerationReasonable,
      positionValid,
    },
    warnings,
    fallbackVelocity,
  };
}

/**
 * Create a fallback velocity estimate from position delta
 * Useful when primary velocity capture fails
 */
export function estimateVelocityFromPositionDelta(
  currentPosition: THREE.Vector3,
  previousPosition: THREE.Vector3,
  deltaTime: number
): THREE.Vector3 {
  const positionDelta = new THREE.Vector3().subVectors(currentPosition, previousPosition);
  return positionDelta.divideScalar(deltaTime);
}

/**
 * Validate multiple velocity samples to detect anomalies
 */
export function detectVelocityAnomalies(
  samples: THREE.Vector3[],
  threshold: number = 2.5 // Standard deviations
): { anomalies: number[]; isAnomaly: (idx: number) => boolean } {
  if (samples.length < 2) {
    return {
      anomalies: [],
      isAnomaly: () => false,
    };
  }

  const magnitudes = samples.map((s) => s.length());
  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  const variance =
    magnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / magnitudes.length;
  const stdDev = Math.sqrt(variance);

  const anomalies = magnitudes
    .map((mag, idx) => ({ idx, mag, deviation: Math.abs(mag - mean) }))
    .filter((item) => item.deviation > stdDev * threshold)
    .map((item) => item.idx);

  return {
    anomalies,
    isAnomaly: (idx: number) => anomalies.includes(idx),
  };
}

/**
 * Default validation configuration
 * Conservative thresholds to prevent issues during physics handoff
 */
export const DEFAULT_VALIDATION_CONFIG: VelocityValidationConfig = {
  minQualityScore: 0.5, // Accept quality >= 50%
  maxQualityScore: 1.0, // 100% is theoretically perfect
  minMagnitude: 0.05, // Minimum 0.05 units/frame
  maxMagnitude: 150, // Maximum 150 units/frame
  maxAccelerationMagnitude: 500, // Max acceleration 500 units/frame²
  useFallback: true, // Use fallback if validation fails
};

/**
 * Strict validation configuration
 * Only accepts high-quality captures
 */
export const STRICT_VALIDATION_CONFIG: VelocityValidationConfig = {
  minQualityScore: 0.8, // Accept quality >= 80%
  maxQualityScore: 1.0,
  minMagnitude: 0.1, // Minimum 0.1 units/frame
  maxMagnitude: 100, // More conservative max
  maxAccelerationMagnitude: 200, // Stricter acceleration limit
  useFallback: true,
};

/**
 * Lenient validation configuration
 * Accepts lower-quality captures for high-speed scenarios
 */
export const LENIENT_VALIDATION_CONFIG: VelocityValidationConfig = {
  minQualityScore: 0.3, // Accept quality >= 30%
  maxQualityScore: 1.0,
  minMagnitude: 0.01, // Very low minimum
  maxMagnitude: 200, // Higher max for fast-moving objects
  maxAccelerationMagnitude: 1000, // Lenient acceleration
  useFallback: true,
};
