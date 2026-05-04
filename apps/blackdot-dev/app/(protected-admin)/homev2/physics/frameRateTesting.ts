'use client';

import * as THREE from 'three';

/**
 * Frame rate detection and adaptive parameter adjustment
 */
export interface FrameRateInfo {
  /** Current FPS estimate */
  currentFps: number;
  /** Frame time in milliseconds */
  frameTimeMs: number;
  /** Detected frame rate category */
  category: 'low' | 'medium' | 'high';
  /** Whether frame rate is stable */
  isStable: boolean;
  /** Variance in frame times (stdDev) */
  variance: number;
}

/**
 * Jitter metrics for transition quality assessment
 */
export interface JitterMetrics {
  /** Position jitter (distance variation) */
  positionJitter: number;
  /** Velocity jitter (magnitude variation) */
  velocityJitter: number;
  /** Rotation jitter (angle variation) */
  rotationJitter: number;
  /** Overall jitter score (0-1, lower is better) */
  overallScore: number;
  /** Whether jitter is within acceptable bounds */
  isAcceptable: boolean;
}

/**
 * Frame rate detector for adaptive parameter adjustment
 */
export class FrameRateDetector {
  private frameTimes: number[] = [];
  private lastFrameTime: number = 0;
  private maxSamples: number = 60; // Last second at 60fps

  /**
   * Record a frame and update statistics
   */
  recordFrame(deltaTime: number): FrameRateInfo {
    const now = performance.now();
    const frameTimeMs = (now - this.lastFrameTime) || deltaTime * 1000;
    this.lastFrameTime = now;

    this.frameTimes.push(frameTimeMs);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    return this.getInfo();
  }

  /**
   * Get current frame rate information
   */
  getInfo(): FrameRateInfo {
    if (this.frameTimes.length === 0) {
      return {
        currentFps: 0,
        frameTimeMs: 0,
        category: 'low',
        isStable: false,
        variance: 0,
      };
    }

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const currentFps = 1000 / avgFrameTime;

    // Calculate variance (standard deviation of frame times)
    const variance = Math.sqrt(
      this.frameTimes.reduce((sum, ft) => sum + Math.pow(ft - avgFrameTime, 2), 0) /
      this.frameTimes.length
    );

    // Detect category
    let category: 'low' | 'medium' | 'high' = 'low';
    if (currentFps >= 50) category = 'high';
    else if (currentFps >= 30) category = 'medium';

    // Check stability (low variance = stable)
    const isStable = variance < avgFrameTime * 0.2; // 20% variance threshold

    return {
      currentFps: Math.round(currentFps),
      frameTimeMs: Math.round(avgFrameTime * 10) / 10,
      category,
      isStable,
      variance: Math.round(variance * 100) / 100,
    };
  }

  /**
   * Get recommended transition parameters for current frame rate
   */
  getAdaptiveConfig() {
    const info = this.getInfo();
    const fps = info.currentFps;

    // Scale capture frames and blend duration based on frame rate
    const captureFrames = fps >= 50 ? 5 : fps >= 30 ? 4 : 3;
    const blendDuration = fps >= 50 ? 0.5 : fps >= 30 ? 0.75 : 1.0;

    return {
      captureFrames,
      blendDuration,
      linearDamping: 0.3 + (60 - fps) * 0.002, // More damping at low FPS
      angularDamping: 0.7 + (60 - fps) * 0.005,
    };
  }

  /**
   * Reset detector
   */
  reset() {
    this.frameTimes = [];
    this.lastFrameTime = 0;
  }
}

/**
 * Jitter detector for transition quality assessment
 */
export class JitterDetector {
  private positionHistory: THREE.Vector3[] = [];
  private velocityHistory: THREE.Vector3[] = [];
  private rotationHistory: THREE.Quaternion[] = [];
  private maxSamples: number = 30; // Half second at 60fps

  /**
   * Record a sample for jitter analysis
   */
  recordSample(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    rotation: THREE.Quaternion
  ) {
    this.positionHistory.push(position.clone());
    this.velocityHistory.push(velocity.clone());
    this.rotationHistory.push(rotation.clone());

    // Keep only recent samples
    if (this.positionHistory.length > this.maxSamples) {
      this.positionHistory.shift();
      this.velocityHistory.shift();
      this.rotationHistory.shift();
    }
  }

  /**
   * Analyze jitter in collected samples
   */
  analyzeJitter(acceptableJitterThreshold: number = 0.05): JitterMetrics {
    if (this.positionHistory.length < 2) {
      return {
        positionJitter: 0,
        velocityJitter: 0,
        rotationJitter: 0,
        overallScore: 1.0,
        isAcceptable: true,
      };
    }

    // Position jitter: average distance variance
    const positionJitter = this.calculatePositionVariance();

    // Velocity jitter: average velocity magnitude variance
    const velocityJitter = this.calculateVelocityVariance();

    // Rotation jitter: average angle variance
    const rotationJitter = this.calculateRotationVariance();

    // Overall score (0-1, 1 is perfect)
    const overallScore = Math.max(
      0,
      1 - (positionJitter + velocityJitter + rotationJitter) / 3
    );

    const isAcceptable = overallScore >= 1 - acceptableJitterThreshold;

    return {
      positionJitter,
      velocityJitter,
      rotationJitter,
      overallScore: Math.round(overallScore * 1000) / 1000,
      isAcceptable,
    };
  }

  /**
   * Calculate position variance
   */
  private calculatePositionVariance(): number {
    if (this.positionHistory.length < 2) return 0;

    const distances = [];
    for (let i = 1; i < this.positionHistory.length; i++) {
      const distance = this.positionHistory[i].distanceTo(
        this.positionHistory[i - 1]
      );
      distances.push(distance);
    }

    const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = Math.sqrt(
      distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length
    );

    // Normalize to 0-1 (assuming normal variation is < 0.5 units)
    return Math.min(1, variance / 0.5);
  }

  /**
   * Calculate velocity magnitude variance
   */
  private calculateVelocityVariance(): number {
    if (this.velocityHistory.length < 2) return 0;

    const magnitudes = this.velocityHistory.map((v) => v.length());
    const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const variance = Math.sqrt(
      magnitudes.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / magnitudes.length
    );

    // Normalize to 0-1
    return Math.min(1, variance / (mean + 0.1));
  }

  /**
   * Calculate rotation variance (angle between consecutive quaternions)
   */
  private calculateRotationVariance(): number {
    if (this.rotationHistory.length < 2) return 0;

    const angles = [];
    for (let i = 1; i < this.rotationHistory.length; i++) {
      const q1 = this.rotationHistory[i - 1];
      const q2 = this.rotationHistory[i];

      // Calculate angle between quaternions
      const dot = Math.max(-1, Math.min(1, q1.dot(q2)));
      const angle = Math.acos(dot) * 2; // Convert to angle
      angles.push(angle);
    }

    const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
    const variance = Math.sqrt(
      angles.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / angles.length
    );

    // Normalize to 0-1 (assuming normal variation is < 0.1 radians)
    return Math.min(1, variance / 0.1);
  }

  /**
   * Get detailed sample analysis
   */
  getSampleStats() {
    return {
      positionSamples: this.positionHistory.length,
      velocitySamples: this.velocityHistory.length,
      rotationSamples: this.rotationHistory.length,
      positionRange: this.positionHistory.length > 0 ? {
        min: new THREE.Vector3().copy(this.positionHistory[0]),
        max: new THREE.Vector3().copy(this.positionHistory[0]),
      } : null,
    };
  }

  /**
   * Reset detector
   */
  reset() {
    this.positionHistory = [];
    this.velocityHistory = [];
    this.rotationHistory = [];
  }
}

/**
 * Multi-frame rate test harness
 * Tests transitions at different frame rates
 */
export interface FrameRateTestConfig {
  targetFrameRates: number[]; // [30, 60, 120]
  testDurationMs: number; // Duration per frame rate
  recordJitter: boolean; // Record jitter metrics
}

/**
 * Results from multi-frame rate testing
 */
export interface FrameRateTestResults {
  frameRate: number;
  jitterMetrics: JitterMetrics | null;
  transitionSuccess: boolean;
  transitionDurationMs: number;
  avgFrameTime: number;
  frameRateStability: number;
}

/**
 * Test transition performance at different frame rates
 */
export class TransitionFrameRateTester {
  private frameRateDetector: FrameRateDetector;
  private jitterDetector: JitterDetector;
  private results: FrameRateTestResults[] = [];

  constructor() {
    this.frameRateDetector = new FrameRateDetector();
    this.jitterDetector = new JitterDetector();
  }

  /**
   * Start recording a test at specified frame rate
   */
  startTest(targetFps: number) {
    this.frameRateDetector.reset();
    this.jitterDetector.reset();
  }

  /**
   * Record a frame during test
   */
  recordTestFrame(
    deltaTime: number,
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    rotation: THREE.Quaternion
  ) {
    this.frameRateDetector.recordFrame(deltaTime);
    this.jitterDetector.recordSample(position, velocity, rotation);
  }

  /**
   * Complete test and analyze results
   */
  completeTest(
    targetFps: number,
    transitionSuccess: boolean,
    transitionDurationMs: number
  ) {
    const frameInfo = this.frameRateDetector.getInfo();
    const jitterMetrics = this.jitterDetector.analyzeJitter();

    this.results.push({
      frameRate: frameInfo.currentFps,
      jitterMetrics,
      transitionSuccess,
      transitionDurationMs,
      avgFrameTime: frameInfo.frameTimeMs,
      frameRateStability: frameInfo.isStable ? 1.0 : 0.7,
    });
  }

  /**
   * Get test results
   */
  getResults(): FrameRateTestResults[] {
    return [...this.results];
  }

  /**
   * Get summary of all tests
   */
  getSummary() {
    const successRate =
      this.results.filter((r) => r.transitionSuccess).length / Math.max(1, this.results.length);
    const avgJitterScore =
      this.results.reduce((sum, r) => sum + (r.jitterMetrics?.overallScore || 1), 0) /
      Math.max(1, this.results.length);

    return {
      testCount: this.results.length,
      successRate: Math.round(successRate * 100),
      avgJitterScore: Math.round(avgJitterScore * 1000) / 1000,
      allTestsPassed: successRate === 1.0 && avgJitterScore > 0.95,
    };
  }
}
