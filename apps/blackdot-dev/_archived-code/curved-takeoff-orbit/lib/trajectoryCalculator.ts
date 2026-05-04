/**
 * Trajectory Calculator
 *
 * Auto-calculates realistic entry/exit points for orbit merging.
 * Uses closest-point geometry to ensure smooth, natural transitions.
 */

import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export interface OrbitConfig {
  center: THREE.Vector3;
  radius: number;
  nominalSpeed: number;
}

export interface SourceDefinition {
  id: string;
  gatePosition: THREE.Vector3;

  // User-defined: general trajectory direction
  takeoffDirection?: THREE.Vector3; // Optional: defaults to (orbit.center - gate).normalize()
  takeoffHeight?: number;            // Optional: altitude to reach (defaults to orbit.center.y)
  takeoffArcHeight?: number;         // Optional: how high the arc goes (defaults to smooth parabola)

  // Auto-calculated (read-only after calculation)
  calculatedEntryPoint?: THREE.Vector3;
  calculatedEntryAngle?: number;
  calculatedEntryTangent?: THREE.Vector3;

  // Landing (destination, usually same as gate)
  landingDestination?: THREE.Vector3; // Defaults to gatePosition
  calculatedExitPoint?: THREE.Vector3;
  calculatedExitAngle?: number;
}

export interface TrajectoryResult {
  // Takeoff
  takeoffCurve: THREE.CatmullRomCurve3;
  takeoffWaypoints: THREE.Vector3[];
  entryPoint: THREE.Vector3;
  entryAngle: number;        // Radians, for orbit positioning
  entryTangent: THREE.Vector3; // Direction of curve at entry

  // Landing
  landingCurve: THREE.CatmullRomCurve3;
  landingWaypoints: THREE.Vector3[];
  exitPoint: THREE.Vector3;
  exitAngle: number;
  exitTangent: THREE.Vector3;

  // Diagnostics
  curveToOrbitDistance: number; // Minimum distance achieved
  mergeQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
}

// ============================================================================
// CLOSEST POINT CALCULATIONS
// ============================================================================

/**
 * Find the closest point on a circle (in XZ plane) to a target point
 */
export function closestPointOnCircle(
  circleCenter: THREE.Vector3,
  circleRadius: number,
  targetPoint: THREE.Vector3
): { point: THREE.Vector3; angle: number } {
  // Project to XZ plane for circular orbit
  const dx = targetPoint.x - circleCenter.x;
  const dz = targetPoint.z - circleCenter.z;

  // Direction from center to target (ignore Y)
  const angle = Math.atan2(dz, dx);

  // Closest point on circle circumference
  const point = new THREE.Vector3(
    circleCenter.x + Math.cos(angle) * circleRadius,
    targetPoint.y, // Preserve height of target point
    circleCenter.z + Math.sin(angle) * circleRadius
  );

  return { point, angle };
}

/**
 * Sample a curve and find the point closest to the orbit circle
 */
export function findCurveOrbitMergePoint(
  curve: THREE.CatmullRomCurve3,
  orbit: OrbitConfig,
  samples: number = 200
): {
  curveProgress: number;      // 0-1, where on curve
  curvePoint: THREE.Vector3;  // Point on curve
  orbitPoint: THREE.Vector3;  // Closest point on orbit
  orbitAngle: number;         // Angle on orbit circle
  distance: number;           // How far apart they are
  curveTangent: THREE.Vector3; // Direction at merge point
} {
  let minDistance = Infinity;
  let bestProgress = 0;
  let bestCurvePoint = new THREE.Vector3();
  let bestOrbitPoint = new THREE.Vector3();
  let bestAngle = 0;
  let bestTangent = new THREE.Vector3();

  // Sample curve at regular intervals
  for (let i = 0; i <= samples; i++) {
    const progress = i / samples;
    const curvePoint = curve.getPoint(progress);

    // Find closest point on orbit to this curve sample
    const { point: orbitPoint, angle } = closestPointOnCircle(
      orbit.center,
      orbit.radius,
      curvePoint
    );

    // Calculate distance (3D, includes height difference)
    const distance = curvePoint.distanceTo(orbitPoint);

    if (distance < minDistance) {
      minDistance = distance;
      bestProgress = progress;
      bestCurvePoint.copy(curvePoint);
      bestOrbitPoint.copy(orbitPoint);
      bestAngle = angle;
      bestTangent.copy(curve.getTangent(progress));
    }
  }

  return {
    curveProgress: bestProgress,
    curvePoint: bestCurvePoint,
    orbitPoint: bestOrbitPoint,
    orbitAngle: bestAngle,
    distance: minDistance,
    curveTangent: bestTangent
  };
}

// ============================================================================
// WAYPOINT GENERATION
// ============================================================================

/**
 * Generate smooth takeoff waypoints from gate to orbit approach
 * Creates a parabolic arc that naturally flows toward orbit altitude
 */
export function generateTakeoffWaypoints(
  gate: THREE.Vector3,
  orbit: OrbitConfig,
  options: {
    direction?: THREE.Vector3;    // Optional preferred direction
    arcHeight?: number;           // How high the peak of arc (default: orbit.center.y * 1.2)
    intermediatePoints?: number;  // Number of waypoints (default: 3)
  } = {}
): THREE.Vector3[] {
  const {
    direction = new THREE.Vector3().subVectors(orbit.center, gate).normalize(),
    arcHeight = orbit.center.y * 1.2,
    intermediatePoints = 3
  } = options;

  const waypoints: THREE.Vector3[] = [];

  // Start at gate
  waypoints.push(gate.clone());

  // Generate intermediate points along parabolic arc
  const horizontalDistance = orbit.radius * 0.7; // Approach distance

  for (let i = 1; i <= intermediatePoints; i++) {
    const t = i / (intermediatePoints + 1); // 0 to 1 progression

    // Parabolic height profile (peaks in middle)
    const heightProgress = Math.sin(t * Math.PI); // 0 → 1 → 0 (bell curve)
    const height = gate.y + heightProgress * (arcHeight - gate.y);

    // Horizontal progression toward orbit
    const horizontal = t * horizontalDistance;

    const waypoint = new THREE.Vector3(
      gate.x + direction.x * horizontal,
      height,
      gate.z + direction.z * horizontal
    );

    waypoints.push(waypoint);
  }

  // Final approach point (will be adjusted to merge with orbit)
  const approachPoint = new THREE.Vector3(
    gate.x + direction.x * horizontalDistance,
    orbit.center.y,
    gate.z + direction.z * horizontalDistance
  );

  waypoints.push(approachPoint);

  return waypoints;
}

/**
 * Generate landing waypoints from orbit exit to destination
 * Mirror of takeoff - smooth descent curve
 */
export function generateLandingWaypoints(
  exitPoint: THREE.Vector3,
  destination: THREE.Vector3,
  options: {
    descentArcHeight?: number;    // Height of descent arc peak
    intermediatePoints?: number;  // Number of waypoints
  } = {}
): THREE.Vector3[] {
  const {
    descentArcHeight = exitPoint.y * 0.8, // Slightly lower than exit
    intermediatePoints = 3
  } = options;

  const waypoints: THREE.Vector3[] = [];

  // Start at orbit exit
  waypoints.push(exitPoint.clone());

  // Direction from exit to destination
  const direction = new THREE.Vector3().subVectors(destination, exitPoint).normalize();
  const totalDistance = exitPoint.distanceTo(destination);

  // Generate intermediate descent points
  for (let i = 1; i <= intermediatePoints; i++) {
    const t = i / (intermediatePoints + 1);

    // Inverse parabola for descent
    const heightProgress = Math.sin(t * Math.PI);
    const height = exitPoint.y - heightProgress * (exitPoint.y - destination.y);

    const horizontal = t * totalDistance;

    const waypoint = new THREE.Vector3(
      exitPoint.x + direction.x * horizontal,
      height,
      exitPoint.z + direction.z * horizontal
    );

    waypoints.push(waypoint);
  }

  // End at destination
  waypoints.push(destination.clone());

  return waypoints;
}

// ============================================================================
// MAIN TRAJECTORY CALCULATOR
// ============================================================================

/**
 * Calculate complete trajectory for a source: takeoff → orbit entry → orbit exit → landing
 */
export function calculateSourceTrajectory(
  source: SourceDefinition,
  orbit: OrbitConfig
): TrajectoryResult {
  // -------------------------------------------------------------------------
  // STEP 1: Generate initial takeoff waypoints
  // -------------------------------------------------------------------------
  const takeoffWaypoints = generateTakeoffWaypoints(
    source.gatePosition,
    orbit,
    {
      direction: source.takeoffDirection,
      arcHeight: source.takeoffArcHeight,
      intermediatePoints: 3
    }
  );

  // -------------------------------------------------------------------------
  // STEP 2: Create preliminary curve
  // -------------------------------------------------------------------------
  const preliminaryCurve = new THREE.CatmullRomCurve3(takeoffWaypoints);

  // -------------------------------------------------------------------------
  // STEP 3: Find best merge point with orbit
  // -------------------------------------------------------------------------
  const mergeAnalysis = findCurveOrbitMergePoint(preliminaryCurve, orbit);

  // -------------------------------------------------------------------------
  // STEP 4: Adjust final waypoint to match orbit entry point
  // -------------------------------------------------------------------------
  // Replace last waypoint with calculated orbit entry point
  takeoffWaypoints[takeoffWaypoints.length - 1] = mergeAnalysis.orbitPoint.clone();

  // Recreate curve with adjusted endpoint
  const finalTakeoffCurve = new THREE.CatmullRomCurve3(takeoffWaypoints);

  // -------------------------------------------------------------------------
  // STEP 5: Calculate landing trajectory (reverse process)
  // -------------------------------------------------------------------------
  const landingDestination = source.landingDestination || source.gatePosition;

  // Find best exit point from orbit toward destination
  const { point: exitPoint, angle: exitAngle } = closestPointOnCircle(
    orbit.center,
    orbit.radius,
    landingDestination
  );

  // Generate landing waypoints from exit to destination
  const landingWaypoints = generateLandingWaypoints(exitPoint, landingDestination);
  const landingCurve = new THREE.CatmullRomCurve3(landingWaypoints);

  // Get exit tangent (direction leaving orbit)
  const exitTangent = landingCurve.getTangent(0); // Tangent at start of landing curve

  // -------------------------------------------------------------------------
  // STEP 6: Assess merge quality
  // -------------------------------------------------------------------------
  let mergeQuality: TrajectoryResult['mergeQuality'];
  const distance = mergeAnalysis.distance;

  if (distance < 1.0) mergeQuality = 'excellent';
  else if (distance < 3.0) mergeQuality = 'good';
  else if (distance < 6.0) mergeQuality = 'acceptable';
  else mergeQuality = 'poor';

  // -------------------------------------------------------------------------
  // STEP 7: Return complete trajectory
  // -------------------------------------------------------------------------
  return {
    // Takeoff
    takeoffCurve: finalTakeoffCurve,
    takeoffWaypoints,
    entryPoint: mergeAnalysis.orbitPoint,
    entryAngle: mergeAnalysis.orbitAngle,
    entryTangent: mergeAnalysis.curveTangent,

    // Landing
    landingCurve,
    landingWaypoints,
    exitPoint,
    exitAngle,
    exitTangent,

    // Diagnostics
    curveToOrbitDistance: mergeAnalysis.distance,
    mergeQuality
  };
}

// ============================================================================
// BATCH CALCULATION
// ============================================================================

/**
 * Calculate trajectories for all sources, ensuring no collisions at entry/exit
 */
export function calculateAllTrajectories(
  sources: SourceDefinition[],
  orbit: OrbitConfig,
  options: {
    minimumAngularSeparation?: number; // Radians between entry points (default: π/4 = 45°)
  } = {}
): Map<string, TrajectoryResult> {
  const { minimumAngularSeparation = Math.PI / 4 } = options;

  const results = new Map<string, TrajectoryResult>();
  const usedAngles: number[] = [];

  for (const source of sources) {
    const trajectory = calculateSourceTrajectory(source, orbit);

    // Check for angular collisions with existing entry points
    let adjustedAngle = trajectory.entryAngle;

    for (const existingAngle of usedAngles) {
      const separation = Math.abs(adjustedAngle - existingAngle);
      if (separation < minimumAngularSeparation) {
        // Too close - shift by minimum separation
        adjustedAngle += minimumAngularSeparation;

        // Recalculate entry point with adjusted angle
        trajectory.entryPoint = new THREE.Vector3(
          orbit.center.x + Math.cos(adjustedAngle) * orbit.radius,
          orbit.center.y,
          orbit.center.z + Math.sin(adjustedAngle) * orbit.radius
        );
        trajectory.entryAngle = adjustedAngle;
      }
    }

    usedAngles.push(adjustedAngle);
    results.set(source.id, trajectory);
  }

  return results;
}

// ============================================================================
// VALIDATION & DIAGNOSTICS
// ============================================================================

/**
 * Validate trajectory quality and identify potential issues
 */
export function validateTrajectory(trajectory: TrajectoryResult): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check merge quality
  if (trajectory.mergeQuality === 'poor') {
    warnings.push(`Poor orbit merge quality (distance: ${trajectory.curveToOrbitDistance.toFixed(2)})`);
  }

  // Check for extremely short curves
  if (trajectory.takeoffWaypoints.length < 3) {
    errors.push('Takeoff curve has too few waypoints (minimum 3)');
  }

  // Check for extreme angles
  const entryDegrees = (trajectory.entryAngle * 180 / Math.PI);
  if (entryDegrees < 0 || entryDegrees > 360) {
    warnings.push(`Entry angle out of normal range: ${entryDegrees.toFixed(1)}°`);
  }

  // Check tangent alignment (should be somewhat aligned with orbit tangent)
  const orbitTangent = new THREE.Vector3(
    -Math.sin(trajectory.entryAngle),
    0,
    Math.cos(trajectory.entryAngle)
  );

  const alignment = trajectory.entryTangent.dot(orbitTangent);
  if (alignment < 0.3) { // Less than ~70° alignment
    warnings.push(`Curve entry tangent poorly aligned with orbit (${(alignment * 100).toFixed(0)}%)`);
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}
