/**
 * PHYSICS TEST UTILITIES
 *
 * Helper functions for testing physics transitions and validating behavior.
 * Provides metrics collection, jitter detection, and state validation.
 */

import * as THREE from 'three';

/**
 * Represents a single frame's data capture
 */
export interface FrameCapture {
  timestamp: number;
  frameIndex: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Quaternion;
  frameTime: number;
}

/**
 * Metrics collected during a physics transition test
 */
export interface TransitionMetrics {
  name: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  frameCount: number;
  frameRateStats: {
    average: number;
    min: number;
    max: number;
    stdDev: number;
  };
  positionStats: {
    maxDelta: number; // Largest single-frame position change
    avgDelta: number; // Average position change
    jitterDetected: boolean;
    jitterThreshold: number;
  };
  velocityStats: {
    smoothness: number; // How smooth velocity changes are (0-1)
    maxChange: number;
    avgChange: number;
  };
  rotationStats: {
    smoothness: number;
    maxDelta: number;
  };
  transitionSuccess: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Particle state for validation
 */
export interface ParticleState {
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number, number]; // quaternion
  mass: number;
}

/**
 * Test scenario definition
 */
export interface PhysicsTestScenario {
  name: string;
  initialState: ParticleState;
  expectedFinalState: Partial<ParticleState>;
  duration: number; // Seconds
  tolerance: {
    position: number;
    velocity: number;
    jitter: number;
  };
  description?: string;
}

/**
 * Capture frame data at regular intervals
 */
export class FrameDataCapture {
  private frames: FrameCapture[] = [];
  private startTime: number;
  private frameIndex: number = 0;
  private previousFrameTime: number;

  constructor() {
    this.startTime = performance.now();
    this.previousFrameTime = this.startTime;
  }

  captureFrame(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    rotation: THREE.Quaternion
  ): void {
    const now = performance.now();
    const frameTime = now - this.previousFrameTime;

    this.frames.push({
      timestamp: now,
      frameIndex: this.frameIndex,
      position: position.clone(),
      velocity: velocity.clone(),
      rotation: rotation.clone(),
      frameTime,
    });

    this.previousFrameTime = now;
    this.frameIndex++;
  }

  getFrames(): FrameCapture[] {
    return [...this.frames];
  }

  getDuration(): number {
    if (this.frames.length < 2) return 0;
    return this.frames[this.frames.length - 1].timestamp - this.frames[0].timestamp;
  }

  getFrameCount(): number {
    return this.frames.length;
  }

  clear(): void {
    this.frames = [];
    this.frameIndex = 0;
    this.startTime = performance.now();
    this.previousFrameTime = this.startTime;
  }
}

/**
 * Detect jitter in position history
 * Jitter = sudden, erratic position changes that shouldn't happen
 */
export function detectJitter(
  positions: THREE.Vector3[],
  threshold: number = 0.1
): {
  detected: boolean;
  maxDelta: number;
  avgDelta: number;
  jitterPoints: number[];
} {
  if (positions.length < 3) {
    return {
      detected: false,
      maxDelta: 0,
      avgDelta: 0,
      jitterPoints: [],
    };
  }

  const deltas: number[] = [];
  const jitterPoints: number[] = [];

  for (let i = 1; i < positions.length; i++) {
    const delta = positions[i].distanceTo(positions[i - 1]);
    deltas.push(delta);

    if (delta > threshold) {
      jitterPoints.push(i);
    }
  }

  const maxDelta = Math.max(...deltas);
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;

  return {
    detected: jitterPoints.length > 0,
    maxDelta,
    avgDelta,
    jitterPoints,
  };
}

/**
 * Calculate smoothness metric for velocity changes
 * Returns 0-1 where 1 = perfectly smooth
 */
export function calculateVelocitySmoothness(velocities: THREE.Vector3[]): number {
  if (velocities.length < 3) return 1.0;

  const changes: number[] = [];

  for (let i = 1; i < velocities.length; i++) {
    const delta = velocities[i].clone().sub(velocities[i - 1]).length();
    changes.push(delta);
  }

  // Smoothness = inverse of variance in changes
  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance =
    changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) /
    changes.length;

  const stdDev = Math.sqrt(variance);

  // Normalize: perfect smoothness = 0 stdDev = 1.0, high variance = lower score
  // Clamp between 0 and 1
  return Math.max(0, 1 - stdDev / (avgChange + 0.001));
}

/**
 * Calculate frame rate statistics from frame times
 */
export function calculateFrameRateStats(frameTimes: number[]): {
  average: number;
  min: number;
  max: number;
  stdDev: number;
} {
  if (frameTimes.length === 0) {
    return { average: 0, min: 0, max: 0, stdDev: 0 };
  }

  const fps = frameTimes.map((ms) => 1000 / ms);
  const average = fps.reduce((a, b) => a + b, 0) / fps.length;
  const min = Math.min(...fps);
  const max = Math.max(...fps);

  const variance =
    fps.reduce((sum, f) => sum + Math.pow(f - average, 2), 0) / fps.length;
  const stdDev = Math.sqrt(variance);

  return { average, min, max, stdDev };
}

/**
 * Analyze frame captures and produce detailed metrics
 */
export function analyzeFrameCaptures(
  captures: FrameCapture[],
  testName: string,
  jitterThreshold: number = 0.1
): TransitionMetrics {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (captures.length < 2) {
    errors.push('Not enough frames captured for analysis');
    return {
      name: testName,
      startTime: 0,
      endTime: 0,
      durationMs: 0,
      frameCount: 0,
      frameRateStats: { average: 0, min: 0, max: 0, stdDev: 0 },
      positionStats: { maxDelta: 0, avgDelta: 0, jitterDetected: false, jitterThreshold },
      velocityStats: { smoothness: 0, maxChange: 0, avgChange: 0 },
      rotationStats: { smoothness: 0, maxDelta: 0 },
      transitionSuccess: false,
      errors,
      warnings,
    };
  }

  const startTime = captures[0].timestamp;
  const endTime = captures[captures.length - 1].timestamp;
  const durationMs = endTime - startTime;

  // Frame rate analysis
  const frameTimes = captures.slice(1).map((f) => f.frameTime);
  const frameRateStats = calculateFrameRateStats(frameTimes);

  // Position analysis
  const positions = captures.map((f) => f.position);
  const jitterAnalysis = detectJitter(positions, jitterThreshold);

  const positionDeltas = [];
  for (let i = 1; i < positions.length; i++) {
    positionDeltas.push(positions[i].distanceTo(positions[i - 1]));
  }

  const avgPositionDelta =
    positionDeltas.length > 0
      ? positionDeltas.reduce((a, b) => a + b, 0) / positionDeltas.length
      : 0;

  // Velocity analysis
  const velocities = captures.map((f) => f.velocity);
  const velocitySmoothness = calculateVelocitySmoothness(velocities);

  const velocityChanges = [];
  for (let i = 1; i < velocities.length; i++) {
    velocityChanges.push(velocities[i].clone().sub(velocities[i - 1]).length());
  }

  const maxVelocityChange = Math.max(...velocityChanges);
  const avgVelocityChange =
    velocityChanges.length > 0
      ? velocityChanges.reduce((a, b) => a + b, 0) / velocityChanges.length
      : 0;

  // Rotation analysis
  const rotations = captures.map((f) => f.rotation);
  const rotationDeltas = [];
  for (let i = 1; i < rotations.length; i++) {
    const angle = rotations[i - 1].angleTo(rotations[i]);
    rotationDeltas.push(angle);
  }

  const maxRotationDelta = Math.max(...rotationDeltas);
  const rotationSmoothness = calculateVelocitySmoothness(
    rotations.map((q) => new THREE.Vector3(q.x, q.y, q.z))
  );

  // Determine success
  let transitionSuccess = true;
  if (jitterAnalysis.detected) {
    warnings.push(
      `Jitter detected: ${jitterAnalysis.jitterPoints.length} frames with ` +
        `position deltas > ${jitterThreshold} units`
    );
  }

  if (frameRateStats.min < 30) {
    warnings.push(`Frame rate dropped to ${frameRateStats.min.toFixed(1)} FPS`);
  }

  return {
    name: testName,
    startTime,
    endTime,
    durationMs,
    frameCount: captures.length,
    frameRateStats,
    positionStats: {
      maxDelta: jitterAnalysis.maxDelta,
      avgDelta: avgPositionDelta,
      jitterDetected: jitterAnalysis.detected,
      jitterThreshold,
    },
    velocityStats: {
      smoothness: velocitySmoothness,
      maxChange: maxVelocityChange,
      avgChange: avgVelocityChange,
    },
    rotationStats: {
      smoothness: rotationSmoothness,
      maxDelta: maxRotationDelta,
    },
    transitionSuccess,
    errors,
    warnings,
  };
}

/**
 * Validate particle state against expected values
 */
export function validateParticleState(
  actual: ParticleState,
  expected: Partial<ParticleState>,
  tolerance: {
    position?: number;
    velocity?: number;
  } = {}
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const posTol = tolerance.position ?? 1.0;
  const velTol = tolerance.velocity ?? 0.5;

  if (expected.position) {
    const dist = Math.sqrt(
      Math.pow(actual.position[0] - expected.position[0], 2) +
        Math.pow(actual.position[1] - expected.position[1], 2) +
        Math.pow(actual.position[2] - expected.position[2], 2)
    );

    if (dist > posTol) {
      errors.push(
        `Position mismatch: actual [${actual.position.join(', ')}] ` +
          `vs expected [${expected.position.join(', ')}], distance: ${dist.toFixed(3)}`
      );
    }
  }

  if (expected.velocity) {
    const dist = Math.sqrt(
      Math.pow(actual.velocity[0] - expected.velocity[0], 2) +
        Math.pow(actual.velocity[1] - expected.velocity[1], 2) +
        Math.pow(actual.velocity[2] - expected.velocity[2], 2)
    );

    if (dist > velTol) {
      errors.push(
        `Velocity mismatch: actual [${actual.velocity.join(', ')}] ` +
          `vs expected [${expected.velocity.join(', ')}], distance: ${dist.toFixed(3)}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a test particle state
 */
export function createTestParticleState(
  position: [number, number, number] = [0, 0, 0],
  velocity: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number, number] = [0, 0, 0, 1]
): ParticleState {
  return {
    position,
    velocity,
    rotation,
    mass: 1000,
  };
}

/**
 * Print metrics in human-readable format
 */
export function printMetrics(metrics: TransitionMetrics): void {
  console.log(`\n=== Test: ${metrics.name} ===`);
  console.log(`Duration: ${metrics.durationMs.toFixed(2)}ms (${metrics.frameCount} frames)`);
  console.log(
    `FPS: ${metrics.frameRateStats.average.toFixed(1)} ` +
      `(min: ${metrics.frameRateStats.min.toFixed(1)}, ` +
      `max: ${metrics.frameRateStats.max.toFixed(1)}, ` +
      `stdDev: ${metrics.frameRateStats.stdDev.toFixed(2)})`
  );
  console.log(
    `Position: max delta ${metrics.positionStats.maxDelta.toFixed(4)} units, ` +
      `avg ${metrics.positionStats.avgDelta.toFixed(4)} units` +
      (metrics.positionStats.jitterDetected ? ' ⚠ JITTER DETECTED' : ' ✓')
  );
  console.log(
    `Velocity smoothness: ${(metrics.velocityStats.smoothness * 100).toFixed(1)}% ` +
      `(max change: ${metrics.velocityStats.maxChange.toFixed(3)})`
  );
  console.log(
    `Rotation smoothness: ${(metrics.rotationStats.smoothness * 100).toFixed(1)}% ` +
      `(max delta: ${metrics.rotationStats.maxDelta.toFixed(4)} rad)`
  );

  if (metrics.errors.length > 0) {
    console.error('Errors:');
    metrics.errors.forEach((err) => console.error(`  ✗ ${err}`));
  }

  if (metrics.warnings.length > 0) {
    console.warn('Warnings:');
    metrics.warnings.forEach((warn) => console.warn(`  ⚠ ${warn}`));
  }

  console.log(`Result: ${metrics.transitionSuccess ? '✓ PASS' : '✗ FAIL'}\n`);
}
