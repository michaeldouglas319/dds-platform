import { Vector3 } from 'three';

/**
 * Perlin noise implementation for 3D flow fields
 * Fast, deterministic pseudo-random noise for particle motion
 */
class PerlinNoise {
  private permutation: number[];
  private p: number[];

  constructor(seed: number = 12345) {
    // Generate permutation table from seed
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }

    // Fisher-Yates shuffle with seed
    let random = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [
        this.permutation[j],
        this.permutation[i],
      ];
    }

    // Duplicate permutation table for wrapping
    this.p = [...this.permutation, ...this.permutation];
  }

  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, y: number, z: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const aa = this.p[this.p[xi] + yi];
    const ab = this.p[this.p[xi] + yi + 1];
    const ba = this.p[this.p[xi + 1] + yi];
    const bb = this.p[this.p[xi + 1] + yi + 1];

    const aaa = this.p[aa + zi];
    const aab = this.p[aa + zi + 1];
    const aba = this.p[ab + zi];
    const abb = this.p[ab + zi + 1];
    const baa = this.p[ba + zi];
    const bab = this.p[ba + zi + 1];
    const bba = this.p[bb + zi];
    const bbb = this.p[bb + zi + 1];

    const x1 = this.lerp(
      u,
      this.grad(aaa, xf, yf, zf),
      this.grad(baa, xf - 1, yf, zf)
    );
    const x2 = this.lerp(
      u,
      this.grad(aba, xf, yf - 1, zf),
      this.grad(bba, xf - 1, yf - 1, zf)
    );
    const y1 = this.lerp(v, x1, x2);

    const x3 = this.lerp(
      u,
      this.grad(aab, xf, yf, zf - 1),
      this.grad(bab, xf - 1, yf, zf - 1)
    );
    const x4 = this.lerp(
      u,
      this.grad(abb, xf, yf - 1, zf - 1),
      this.grad(bbb, xf - 1, yf - 1, zf - 1)
    );
    const y2 = this.lerp(v, x3, x4);

    return this.lerp(w, y1, y2);
  }
}

/**
 * Catmull-Rom spline interpolation for smooth curve generation
 * Provides C1 continuous curves through control points
 */
class CatmullRomSpline {
  private points: Vector3[];

  constructor(points: Vector3[]) {
    if (points.length < 2) {
      throw new Error('CatmullRomSpline requires at least 2 points');
    }
    this.points = points.map((p) => p.clone());
  }

  /**
   * Evaluate the spline at parameter t in [0, 1]
   * Maps to the appropriate segment and interpolates
   */
  public evaluate(t: number): Vector3 {
    const clampedT = Math.max(0, Math.min(1, t));
    const numSegments = this.points.length - 1;
    const segmentIndex = Math.floor(clampedT * numSegments);
    const finalSegmentIndex = Math.min(segmentIndex, numSegments - 1);

    const localT = clampedT * numSegments - finalSegmentIndex;

    // Get control points for this segment
    const p0 = this.points[Math.max(0, finalSegmentIndex - 1)];
    const p1 = this.points[finalSegmentIndex];
    const p2 = this.points[Math.min(finalSegmentIndex + 1, this.points.length - 1)];
    const p3 = this.points[Math.min(finalSegmentIndex + 2, this.points.length - 1)];

    return this.catmullRom(localT, p0, p1, p2, p3);
  }

  /**
   * Catmull-Rom basis function evaluation
   * Provides smooth interpolation through p1 and p2
   */
  private catmullRom(
    t: number,
    p0: Vector3,
    p1: Vector3,
    p2: Vector3,
    p3: Vector3
  ): Vector3 {
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom basis coefficients
    const v0 = (p2.x - p0.x) * 0.5;
    const v1 = (p3.x - p1.x) * 0.5;
    const x =
      p1.x +
      v0 * t +
      (3 * (p2.x - p1.x) - 2 * v0 - v1) * t2 +
      (2 * (p1.x - p2.x) + v0 + v1) * t3;

    const v0y = (p2.y - p0.y) * 0.5;
    const v1y = (p3.y - p1.y) * 0.5;
    const y =
      p1.y +
      v0y * t +
      (3 * (p2.y - p1.y) - 2 * v0y - v1y) * t2 +
      (2 * (p1.y - p2.y) + v0y + v1y) * t3;

    const v0z = (p2.z - p0.z) * 0.5;
    const v1z = (p3.z - p1.z) * 0.5;
    const z =
      p1.z +
      v0z * t +
      (3 * (p2.z - p1.z) - 2 * v0z - v1z) * t2 +
      (2 * (p1.z - p2.z) + v0z + v1z) * t3;

    return new Vector3(x, y, z);
  }
}

/**
 * Flow field based on Catmull-Rom spline interpolation
 * Smoothly morphs particles from source to target positions
 */
export class SplineFlowField {
  private sourcePoints: Vector3[];
  private targetPoints: Vector3[];
  private splines: CatmullRomSpline[];

  /**
   * Initialize flow field with source and target point sets
   * Creates splines connecting corresponding points
   */
  constructor(sourcePoints: Vector3[], targetPoints: Vector3[]) {
    if (sourcePoints.length !== targetPoints.length) {
      throw new Error('Source and target point arrays must have equal length');
    }
    if (sourcePoints.length < 2) {
      throw new Error('Must provide at least 2 points');
    }

    this.sourcePoints = sourcePoints.map((p) => p.clone());
    this.targetPoints = targetPoints.map((p) => p.clone());

    // Pre-compute splines for each dimension to optimize runtime
    this.splines = this.sourcePoints.map((source, index) => {
      const target = this.targetPoints[index];
      // Create intermediate points for smoother curve
      const mid1 = new Vector3().lerpVectors(source, target, 0.33);
      const mid2 = new Vector3().lerpVectors(source, target, 0.67);
      return new CatmullRomSpline([source, mid1, mid2, target]);
    });
  }

  /**
   * Get the flow vector at a position in 3D space at a given time
   * Returns the direction and magnitude from current position toward target
   */
  public getFlowVector(position: Vector3, time: number): Vector3 {
    // Find the nearest point index to determine trajectory
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.sourcePoints.length; i++) {
      const distance = position.distanceTo(this.sourcePoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Clamp time to [0, 1] for spline evaluation
    const clampedTime = Math.max(0, Math.min(1, time));

    // Evaluate position on spline
    const targetPosition = this.splines[nearestIndex].evaluate(clampedTime);

    // Return flow vector from current position toward target
    const flowVector = new Vector3().subVectors(targetPosition, position);

    // Normalize and scale based on time (slower near convergence)
    const speedFactor = clampedTime < 0.9 ? 1.0 : 1.0 - (clampedTime - 0.9) * 10;

    return flowVector.multiplyScalar(speedFactor);
  }
}

/**
 * Flow field based on 3D Perlin noise
 * Creates organic, chaotic particle movement
 */
export class NoiseFlowField {
  private noise: PerlinNoise;
  private scale: number;
  private speed: number;

  /**
   * Initialize noise flow field
   * @param scale - Frequency of noise (larger = more variation)
   * @param speed - Time evolution speed (larger = faster changes)
   */
  constructor(scale: number = 0.5, speed: number = 0.5) {
    this.noise = new PerlinNoise();
    this.scale = Math.max(0.01, scale);
    this.speed = Math.max(0.01, speed);
  }

  /**
   * Get the flow vector at a position at a given time
   * Uses 3D Perlin noise sampled at position and time coordinates
   */
  public getFlowVector(position: Vector3, time: number): Vector3 {
    const scaledX = position.x * this.scale;
    const scaledY = position.y * this.scale;
    const scaledZ = position.z * this.scale;
    const scaledTime = time * this.speed;

    // Sample noise in three directions to get 3D flow vector
    const noiseX = this.noise.noise(
      scaledX + 0.5,
      scaledY,
      scaledZ + scaledTime
    );
    const noiseY = this.noise.noise(
      scaledX,
      scaledY + 0.5,
      scaledZ + scaledTime
    );
    const noiseZ = this.noise.noise(
      scaledX,
      scaledY,
      scaledZ + 0.5 + scaledTime
    );

    // Convert noise values [-1, 1] to flow vectors
    return new Vector3(
      (noiseX - 0.5) * 2,
      (noiseY - 0.5) * 2,
      (noiseZ - 0.5) * 2
    ).normalize();
  }
}

/**
 * Blends between spline and noise flow fields
 * Creates morphing animations with controlled chaos
 */
export class FlowFieldMixer {
  private splineField: SplineFlowField;
  private noiseField: NoiseFlowField;

  /**
   * Initialize mixer with both flow fields
   */
  constructor(splineField: SplineFlowField, noiseField: NoiseFlowField) {
    this.splineField = splineField;
    this.noiseField = noiseField;
  }

  /**
   * Get blended flow vector based on morphing phase
   * noiseInfluence controls the mix between spline and noise
   *
   * Morphing phases:
   * - Early (0-30%): High noise (chaotic dissolution)
   * - Middle (30-70%): Spline dominant with noise accent
   * - Final (70-100%): Pure spline (convergence)
   */
  public getFlowVector(position: Vector3, time: number, noiseInfluence: number = 0): Vector3 {
    // Clamp influence to [0, 1]
    const clampedInfluence = Math.max(0, Math.min(1, noiseInfluence));

    // Get vectors from both fields
    const splineVector = this.splineField.getFlowVector(position, time);
    const noiseVector = this.noiseField.getFlowVector(position, time);

    // Blend vectors
    const blendedVector = new Vector3()
      .copy(splineVector)
      .multiplyScalar(1 - clampedInfluence)
      .addScaledVector(noiseVector, clampedInfluence);

    return blendedVector;
  }

  /**
   * Get noise influence based on animation progress
   * Implements automatic phase transitions
   */
  public getAutoInfluence(progress: number): number {
    // Clamp progress to [0, 1]
    const clampedProgress = Math.max(0, Math.min(1, progress));

    if (clampedProgress < 0.3) {
      // Early phase: Ramp up noise (0 -> 1)
      return clampedProgress / 0.3;
    } else if (clampedProgress < 0.7) {
      // Middle phase: High noise that decreases
      const middleProgress = (clampedProgress - 0.3) / 0.4;
      return Math.cos(middleProgress * Math.PI) * 0.5 + 0.5;
    } else {
      // Final phase: Ramp down noise (1 -> 0)
      return Math.max(0, 1 - (clampedProgress - 0.7) / 0.3);
    }
  }
}

/**
 * Compute particle trajectory through a flow field
 * Returns array of positions tracing particle path
 */
export function computeParticleTrajectory(
  start: Vector3,
  end: Vector3,
  flowField: SplineFlowField | NoiseFlowField | FlowFieldMixer,
  duration: number,
  steps: number = 32
): Vector3[] {
  const trajectory: Vector3[] = [];
  const position = start.clone();
  const timeStep = duration / (steps - 1);

  for (let i = 0; i < steps; i++) {
    trajectory.push(position.clone());

    if (i < steps - 1) {
      const time = (i / (steps - 1)) * duration;
      const flowVector = flowField.getFlowVector(position, time);

      // Move position along flow field
      position.addScaledVector(flowVector, timeStep * 0.1);
    }
  }

  return trajectory;
}

/**
 * Generate grid of positions in 3D space
 * Useful for creating uniform particle distributions
 */
export function generateGridPositions(
  width: number,
  height: number,
  depth: number,
  spacing: number = 1.0
): Vector3[] {
  const positions: Vector3[] = [];

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < depth; z++) {
        positions.push(
          new Vector3(
            (x - width / 2) * spacing,
            (y - height / 2) * spacing,
            (z - depth / 2) * spacing
          )
        );
      }
    }
  }

  return positions;
}

/**
 * Generate positions distributed on sphere surface
 * Creates radially symmetric particle distributions
 */
export function generateSpherePositions(radius: number, count: number): Vector3[] {
  const positions: Vector3[] = [];

  // Use Fibonacci sphere algorithm for even distribution
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const angleIncrement = (2 * Math.PI) / goldenRatio;

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);

    const angle = angleIncrement * i;
    const x = Math.cos(angle) * radiusAtY;
    const z = Math.sin(angle) * radiusAtY;

    positions.push(new Vector3(x * radius, y * radius, z * radius));
  }

  return positions;
}

/**
 * Easing function type
 */
export type EasingType = 'easeInOutQuad' | 'easeInOutCubic' | 'linear';

/**
 * Get easing function by name
 * Returns normalized easing function t: [0, 1] -> [0, 1]
 */
export function getEasingFunction(type: EasingType): (t: number) => number {
  switch (type) {
    case 'easeInOutQuad':
      return (t: number): number => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };

    case 'easeInOutCubic':
      return (t: number): number => {
        return t < 0.5
          ? 4 * t * t * t
          : 1 + (t - 1) * (2 * (t - 2)) * (2 * (t - 2));
      };

    case 'linear':
    default:
      return (t: number): number => t;
  }
}

/**
 * Apply easing to time parameter
 */
export function applyEasing(time: number, easingType: EasingType = 'easeInOutQuad'): number {
  const easing = getEasingFunction(easingType);
  return easing(Math.max(0, Math.min(1, time)));
}

/**
 * Utility to create a complete morphing animation setup
 */
export function createMorphingFlowField(
  sourcePoints: Vector3[],
  targetPoints: Vector3[],
  noiseScale: number = 0.5,
  noiseSpeed: number = 0.5
): FlowFieldMixer {
  const splineField = new SplineFlowField(sourcePoints, targetPoints);
  const noiseField = new NoiseFlowField(noiseScale, noiseSpeed);
  return new FlowFieldMixer(splineField, noiseField);
}
