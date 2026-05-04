/**
 * V3 Trajectories Hook
 *
 * Phase 1: Purple Waypoint Auto-Generation Integration
 *
 * Generates takeoff and landing curves using physics-based trajectory calculation.
 * Formula: green + yellow + blue = purple (auto-calculated waypoints)
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { V3SourceConfig, V3Config } from '../config/v3.config';
import { generateBlueGatePosition } from '../../lib/waypointCalculator';

/**
 * Create cached curve data from a CatmullRom curve
 * Pre-samples positions and tangents for O(1) lookups
 */
function cacheCurve(curve: THREE.CatmullRomCurve3, sampleCount: number = 150): CachedCurveData {
  const samples: THREE.Vector3[] = [];
  const tangentSamples: THREE.Vector3[] = [];
  const curveLength = curve.getLength();

  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1); // 0 to 1
    samples.push(curve.getPoint(t).clone());
    tangentSamples.push(curve.getTangent(t).clone().normalize());
  }

  return {
    samples,
    tangentSamples,
    sampleCount,
    curveLength,
  };
}

/**
 * Get interpolated position from cached curve samples
 */
export function getCachedCurvePoint(cache: CachedCurveData, progress: number): THREE.Vector3 {
  const t = Math.max(0, Math.min(1, progress)); // Clamp to [0, 1]
  const floatIndex = t * (cache.sampleCount - 1);
  const index = Math.floor(floatIndex);
  const fraction = floatIndex - index;

  // Handle edge case: exactly at end
  if (index >= cache.sampleCount - 1) {
    return cache.samples[cache.sampleCount - 1].clone();
  }

  // Linear interpolation between samples
  const p1 = cache.samples[index];
  const p2 = cache.samples[index + 1];
  return p1.clone().lerp(p2, fraction);
}

/**
 * Get interpolated tangent from cached curve samples
 */
export function getCachedCurveTangent(cache: CachedCurveData, progress: number): THREE.Vector3 {
  const t = Math.max(0, Math.min(1, progress)); // Clamp to [0, 1]
  const floatIndex = t * (cache.sampleCount - 1);
  const index = Math.floor(floatIndex);
  const fraction = floatIndex - index;

  // Handle edge case: exactly at end
  if (index >= cache.sampleCount - 1) {
    return cache.tangentSamples[cache.sampleCount - 1].clone();
  }

  // Linear interpolation between tangent samples
  const t1 = cache.tangentSamples[index];
  const t2 = cache.tangentSamples[index + 1];
  return t1.clone().lerp(t2, fraction).normalize();
}

/**
 * Generate exit waypoints for landing curve
 * REUSABLE for any exit angle, destination, and configuration
 */
function generateExitWaypoints(
  exitPoint: THREE.Vector3,      // Blue gate position on orbit
  destination: THREE.Vector3,    // Ground landing gate
  exitAngle: number,             // Angle of exit point on orbit (radians)
  orbitCenter: THREE.Vector3,    // Orbit center
  config: {
    exitPreOrbitDistance: number;
    exitMidpointHeightMultiplier: number;
    baseHeight?: number;
  }
): THREE.Vector3[] {
  // Calculate orbit tangent at exit angle (clockwise direction)
  const exitTangent = new THREE.Vector3(
    Math.sin(exitAngle),
    0,
    -Math.cos(exitAngle)
  );

  // Place post-orbit waypoint AFTER exit point along tangent
  const postOrbit = new THREE.Vector3()
    .copy(exitPoint)
    .add(exitTangent.clone().multiplyScalar(config.exitPreOrbitDistance));

  // Calculate exit midpoint between exit and destination
  const exitMidpoint = new THREE.Vector3()
    .addVectors(destination, exitPoint)
    .multiplyScalar(0.5);

  // Add configurable height to midpoint
  const baseHeight = config.baseHeight ?? 15;
  exitMidpoint.y += baseHeight * config.exitMidpointHeightMultiplier;

  // Adjust post-orbit height for smooth descent arc
  postOrbit.y = (exitPoint.y + exitMidpoint.y) * 0.5;

  // Return waypoint sequence
  return [
    exitPoint.clone(),
    postOrbit.clone(),
    exitMidpoint.clone(),
    destination.clone(),
  ];
}

/**
 * Cached curve data for performance optimization
 */
export interface CachedCurveData {
  samples: THREE.Vector3[];       // Pre-sampled positions
  tangentSamples: THREE.Vector3[]; // Pre-sampled tangents
  sampleCount: number;
  curveLength: number;
}

export interface SourceTrajectories {
  takeoffCurve: THREE.CatmullRomCurve3;
  landingCurve: THREE.CatmullRomCurve3;
  blueGatePosition: THREE.Vector3;
  metadata: {
    takeoffDuration: number;
    landingDuration: number;
    entryVelocity: THREE.Vector3;
    exitVelocity: THREE.Vector3;
  };
  // Cached curve samples for performance (optional, enabled by config)
  takeoffCache?: CachedCurveData;
  landingCache?: CachedCurveData;
}

export interface V3TrajectoriesState {
  trajectories: Map<string, SourceTrajectories>;
  isReady: boolean;
}

/**
 * Hook for managing trajectory curves for all sources
 */
export function useV3Trajectories(config: V3Config): V3TrajectoriesState {
  const trajectories = useMemo(() => {
    const map = new Map<string, SourceTrajectories>();

    for (const source of config.sources) {
      // Calculate blue gate position on orbit perimeter
      const blueGatePosition = generateBlueGatePosition(
        config.orbit.center,
        config.orbit.radius,
        source.orbitEntryAngle
      );

      // Simple trajectory: spawn → midpoint → gate
      // Use simple interpolation instead of complex physics
      const green = source.gatePosition.clone();
      const blue = blueGatePosition.clone();

      // Calculate midpoint with arc
      const midpoint = new THREE.Vector3()
        .addVectors(green, blue)
        .multiplyScalar(0.5);

      // Add height to midpoint for smooth arc (configurable)
      const baseHeight = 15;
      midpoint.y += baseHeight * config.trajectorySettings.midpointHeightMultiplier;

      // Calculate pre-orbit waypoint for tangent approach
      // This ensures the curve smoothly intersects the orbit circle
      const toGate = new THREE.Vector3().subVectors(blue, config.orbit.center);
      const gateAngle = Math.atan2(toGate.z, toGate.x);
      // Tangent direction for orbit (reversed for opposite direction)
      const orbitTangent = new THREE.Vector3(Math.sin(gateAngle), 0, -Math.cos(gateAngle));

      // Place pre-orbit waypoint along the tangent, before the gate (configurable)
      const preOrbit = new THREE.Vector3()
        .copy(blue)
        .sub(orbitTangent.clone().multiplyScalar(config.trajectorySettings.preOrbitDistance));

      // Adjust pre-orbit height to match approach (between midpoint and orbit)
      preOrbit.y = (midpoint.y + blue.y) * 0.5;

      // Create smooth curve through waypoints (configurable tension)
      const takeoffWaypoints = [
        green.clone(),
        midpoint.clone(),
        preOrbit.clone(),  // NEW: tangent approach waypoint
        blue.clone(),
      ];
      const takeoffCurve = new THREE.CatmullRomCurve3(
        takeoffWaypoints,
        false,
        'catmullrom',
        config.trajectorySettings.curveTension
      );

      // Generate exit waypoints using reusable utility
      const landingWaypoints = generateExitWaypoints(
        blue,                   // Exit point (blue gate)
        green,                  // Destination (ground gate)
        gateAngle,             // Exit angle on orbit
        config.orbit.center,   // Orbit center
        {
          exitPreOrbitDistance: config.trajectorySettings.exitPreOrbitDistance,
          exitMidpointHeightMultiplier: config.trajectorySettings.exitMidpointHeightMultiplier,
          baseHeight: 15,
        }
      );

      // Create landing curve with exit-specific settings
      const landingCurve = new THREE.CatmullRomCurve3(
        landingWaypoints,
        false,
        'catmullrom',
        config.trajectorySettings.exitCurveTension
      );

      // Calculate entry velocity (orbit tangent at gate) - reuse gateAngle from above
      // Match the reversed orbit direction
      const entryVelocity = new THREE.Vector3(
        Math.sin(gateAngle),
        0,
        -Math.cos(gateAngle)
      ).multiplyScalar(config.orbit.nominalSpeed);

      // Calculate exit velocity (use configurable landing speed)
      const exitVelocity = new THREE.Vector3(
        Math.sin(gateAngle),
        0,
        -Math.cos(gateAngle)
      ).multiplyScalar(config.orbit.nominalSpeed * config.trajectorySettings.exitLandingSpeed);

      // Cache curves for performance (enabled by default)
      const enableCaching = config.performance?.enableCurveCaching ?? true;
      const sampleCount = config.performance?.curveSampleCount ?? 150;

      const trajectoryData: SourceTrajectories = {
        takeoffCurve,
        landingCurve,
        blueGatePosition,
        metadata: {
          takeoffDuration: 5.0,
          landingDuration: 3.0,
          entryVelocity,
          exitVelocity,
        },
      };

      // Add cached samples if enabled
      if (enableCaching) {
        trajectoryData.takeoffCache = cacheCurve(takeoffCurve, sampleCount);
        trajectoryData.landingCache = cacheCurve(landingCurve, sampleCount);
      }

      map.set(source.id, trajectoryData);
    }

    return map;
  }, [config.sources, config.orbit, config.trajectorySettings, config.performance]);

  return {
    trajectories,
    isReady: trajectories.size > 0,
  };
}
