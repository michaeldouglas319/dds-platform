import * as THREE from 'three';
import type { Path, PathSegment, Waypoint } from '@/lib/threejs/utils/pathSystem';
import type { TaxiWaypoint, TakeoffConfiguration } from '../types/path-particle.types';

/**
 * Build a complete gate-to-orbit path
 *
 * Path consists of:
 * 1. Linear taxi segment (gate → runway)
 * 2. Bezier takeoff curve (runway → orbit entry)
 * 3. Arc orbital segment (orbit at constant altitude)
 */
export function buildGateToOrbitPath(
  gatePosition: [number, number, number],
  taxiWaypoints: TaxiWaypoint[],
  runwayEnd: [number, number, number],
  orbitCenter: [number, number, number],
  orbitRadius: number,
  orbitAltitude: number,
  takeoffCurveIntensity: number = 0.7
): Path {
  const segments: PathSegment[] = [];

  // Segment 1: Taxi from gate to runway (linear)
  if (taxiWaypoints.length > 0) {
    const taxiWaypointObjects: Waypoint[] = taxiWaypoints.map((wp) => ({
      id: wp.id,
      position: wp.position,
    }));
    // Add runway end as final waypoint
    taxiWaypointObjects.push({
      id: 'runway-start',
      position: runwayEnd,
    });

    segments.push({
      type: 'linear',
      waypoints: taxiWaypointObjects,
      duration: 2.0, // 2 seconds for taxi
    });
  } else {
    // Direct taxi from gate to runway
    segments.push({
      type: 'linear',
      waypoints: [
        {
          id: 'gate',
          position: gatePosition,
        },
        {
          id: 'runway-start',
          position: runwayEnd,
        },
      ],
      duration: 1.0,
    });
  }

  // Segment 2: Takeoff curve (bezier from runway to orbit entry)
  // Calculate takeoff curve with control points
  const runwayEndVec = new THREE.Vector3(...runwayEnd);
  const orbitCenterVec = new THREE.Vector3(...orbitCenter);
  const orbitEntryPos = new THREE.Vector3(
    orbitCenter[0] + orbitRadius,
    orbitAltitude,
    orbitCenter[2]
  );

  // Control points for smooth takeoff curve
  const cp1Pos = runwayEndVec.clone().lerp(orbitEntryPos, 0.3);
  cp1Pos.y = runwayEnd[1] + 15 * takeoffCurveIntensity; // Curve upward

  const cp2Pos = runwayEndVec.clone().lerp(orbitEntryPos, 0.7);
  cp2Pos.y = orbitAltitude - 10 * takeoffCurveIntensity; // Approach from below

  segments.push({
    type: 'bezier',
    waypoints: [
      {
        id: 'takeoff-start',
        position: runwayEnd,
      },
      {
        id: 'takeoff-cp1',
        position: [cp1Pos.x, cp1Pos.y, cp1Pos.z],
      },
      {
        id: 'takeoff-cp2',
        position: [cp2Pos.x, cp2Pos.y, cp2Pos.z],
      },
      {
        id: 'orbit-entry',
        position: [orbitEntryPos.x, orbitEntryPos.y, orbitEntryPos.z],
      },
    ],
    duration: 3.0, // 3 seconds for takeoff
  });

  // Segment 3: Orbital arc (full circle at constant altitude)
  segments.push({
    type: 'arc',
    waypoints: [
      {
        id: 'orbit-center',
        position: orbitCenter,
      },
      {
        id: 'orbit-radius',
        position: [
          orbitCenter[0] + orbitRadius,
          orbitAltitude,
          orbitCenter[2],
        ],
      },
    ],
    duration: 0, // Arc segment loops continuously
  });

  return {
    id: `gate-orbit-${Date.now()}`,
    segments,
    loop: false, // Arc segment handles its own looping
  };
}

/**
 * Build a landing path (orbit exit → runway → gate)
 *
 * Reverse of takeoff path
 */
export function buildLandingPath(
  orbitCenter: [number, number, number],
  orbitRadius: number,
  orbitAltitude: number,
  runwayEnd: [number, number, number],
  gatePosition: [number, number, number],
  taxiWaypoints: TaxiWaypoint[],
  takeoffCurveIntensity: number = 0.7
): Path {
  const segments: PathSegment[] = [];

  // Segment 1: Descent curve (bezier from orbit to runway)
  const orbitCenterVec = new THREE.Vector3(...orbitCenter);
  const orbitExitPos = new THREE.Vector3(
    orbitCenter[0] + orbitRadius,
    orbitAltitude,
    orbitCenter[2]
  );
  const runwayEndVec = new THREE.Vector3(...runwayEnd);

  const cp1Pos = orbitExitPos.clone().lerp(runwayEndVec, 0.3);
  cp1Pos.y = orbitAltitude - 15 * takeoffCurveIntensity;

  const cp2Pos = orbitExitPos.clone().lerp(runwayEndVec, 0.7);
  cp2Pos.y = runwayEnd[1] + 10 * takeoffCurveIntensity;

  segments.push({
    type: 'bezier',
    waypoints: [
      {
        id: 'descent-start',
        position: [orbitExitPos.x, orbitExitPos.y, orbitExitPos.z],
      },
      {
        id: 'descent-cp1',
        position: [cp1Pos.x, cp1Pos.y, cp1Pos.z],
      },
      {
        id: 'descent-cp2',
        position: [cp2Pos.x, cp2Pos.y, cp2Pos.z],
      },
      {
        id: 'landing-start',
        position: runwayEnd,
      },
    ],
    duration: 3.0, // 3 seconds for descent
  });

  // Segment 2: Landing taxi (runway → gate)
  if (taxiWaypoints.length > 0) {
    const taxiWaypointObjects: Waypoint[] = [];
    // Reverse taxi waypoints
    for (let i = taxiWaypoints.length - 1; i >= 0; i--) {
      taxiWaypointObjects.push({
        id: taxiWaypoints[i].id,
        position: taxiWaypoints[i].position,
      });
    }
    // Add gate as final waypoint
    taxiWaypointObjects.push({
      id: 'gate',
      position: gatePosition,
    });

    segments.push({
      type: 'linear',
      waypoints: taxiWaypointObjects,
      duration: 2.0,
    });
  } else {
    // Direct taxi from runway to gate
    segments.push({
      type: 'linear',
      waypoints: [
        {
          id: 'runway-start',
          position: runwayEnd,
        },
        {
          id: 'gate',
          position: gatePosition,
        },
      ],
      duration: 1.0,
    });
  }

  return {
    id: `landing-${Date.now()}`,
    segments,
    loop: false,
  };
}

/**
 * Create a figure-8 pattern path (for testing multi-loop patterns)
 */
export function buildFigureEightPath(
  center: [number, number, number],
  radius: number,
  altitude: number
): Path {
  const centerVec = new THREE.Vector3(...center);

  return {
    id: `figure8-${Date.now()}`,
    segments: [
      {
        type: 'arc',
        waypoints: [
          {
            id: 'center',
            position: center,
          },
          {
            id: 'radius1',
            position: [center[0] + radius, altitude, center[2]],
          },
        ],
        duration: 10.0,
      },
      {
        type: 'arc',
        waypoints: [
          {
            id: 'center',
            position: center,
          },
          {
            id: 'radius2',
            position: [center[0] - radius, altitude, center[2]],
          },
        ],
        duration: 10.0,
      },
    ],
    loop: true,
  };
}

/**
 * Create a helix ascent path (spiral upward)
 */
export function buildHelixPath(
  center: [number, number, number],
  radius: number,
  maxAltitude: number,
  turns: number = 2
): Path {
  const waypoints: Waypoint[] = [];
  const pointsPerTurn = 12;
  const totalPoints = pointsPerTurn * turns;

  for (let i = 0; i <= totalPoints; i++) {
    const progress = i / totalPoints;
    const angle = progress * Math.PI * 2 * turns;
    const altitude = center[1] + progress * maxAltitude;

    waypoints.push({
      id: `helix-${i}`,
      position: [
        center[0] + radius * Math.cos(angle),
        altitude,
        center[2] + radius * Math.sin(angle),
      ],
    });
  }

  return {
    id: `helix-${Date.now()}`,
    segments: [
      {
        type: 'spline',
        waypoints,
        duration: 5.0 * turns,
      },
    ],
    loop: false,
  };
}

/**
 * Helper to calculate waypoints along a runway
 */
export function buildRunwayWaypoints(
  gatePos: [number, number, number],
  runwayEnd: [number, number, number]
): TaxiWaypoint[] {
  const gateVec = new THREE.Vector3(...gatePos);
  const endVec = new THREE.Vector3(...runwayEnd);
  const direction = endVec.clone().sub(gateVec);
  const numWaypoints = 2;

  const waypoints: TaxiWaypoint[] = [];
  for (let i = 1; i < numWaypoints; i++) {
    const progress = i / numWaypoints;
    const wp = gateVec.clone().add(direction.clone().multiplyScalar(progress));

    waypoints.push({
      id: `taxi-${i}`,
      position: [wp.x, wp.y, wp.z],
      description: `Taxi waypoint ${i}`,
    });
  }

  return waypoints;
}
