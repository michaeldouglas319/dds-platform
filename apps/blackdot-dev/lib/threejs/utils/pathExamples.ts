/**
 * Practical examples demonstrating the abstract path system capabilities
 * Shows how to define custom paths, mix path types, and create complex scenarios
 */

import type { Path, PathSegment, Waypoint, Origin } from './pathSystem';
import { createWaypointPath } from './waypointPath';
import { createTakeoffPath } from './takeoffPath';
import { createOrbitPath } from './orbitPath';

/**
 * Example 1: Custom Multi-Segment Path
 * Combines linear waypoints with a curved takeoff segment
 */
export function createCustomRunwayPath(): Path {
  const segments: PathSegment[] = [
    // Segment 1: Taxi to runway (linear)
    {
      type: 'linear',
      waypoints: [
        { id: 'gate', position: [-10, 0.1, 0] },
        { id: 'taxiway-1', position: [0, 0.1, 0] },
        { id: 'taxiway-2', position: [10, 0.1, 0] },
        { id: 'runway-start', position: [15, 0.1, 0] },
      ],
      duration: 5.0,
      speed: 0.05,
    },
    // Segment 2: Takeoff curve (bezier)
    {
      type: 'bezier',
      waypoints: [
        { id: 'takeoff-start', position: [15, 0.1, 0] },
        { id: 'takeoff-cp1', position: [20, 10, 20] },
        { id: 'takeoff-cp2', position: [25, 30, 40] },
        { id: 'takeoff-end', position: [30, 50, 60] },
      ],
      duration: 8.0,
    },
  ];

  return {
    id: 'custom-runway-path',
    segments,
    loop: false,
  };
}

/**
 * Example 2: Helix/Spiral Path
 * Creates a spiral ascent path
 */
export function createHelixPath(
  center: [number, number, number] = [0, 0, 0],
  radius: number = 10,
  height: number = 50,
  turns: number = 2
): Path {
  const numPoints = 16;
  const waypoints: Waypoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const angle = t * Math.PI * 2 * turns;
    const currentRadius = radius * (1 - t * 0.3); // Shrinking radius
    const y = center[1] + t * height;

    waypoints.push({
      id: `helix-${i}`,
      position: [
        center[0] + Math.cos(angle) * currentRadius,
        y,
        center[2] + Math.sin(angle) * currentRadius,
      ],
    });
  }

  return {
    id: 'helix-path',
    segments: [
      {
        type: 'linear',
        waypoints,
        duration: 10.0,
      },
    ],
    loop: false,
  };
}

/**
 * Example 3: Figure-8 Path
 * Creates a figure-8 orbital pattern
 */
export function createFigureEightPath(
  center: [number, number, number] = [0, 50, 0],
  radius: number = 15
): Path {
  const numPoints = 32;
  const waypoints: Waypoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * Math.PI * 2;
    const x = center[0] + Math.sin(t) * radius;
    const y = center[1];
    const z = center[2] + Math.sin(t * 2) * radius * 0.5; // Figure-8 pattern

    waypoints.push({
      id: `figure8-${i}`,
      position: [x, y, z],
    });
  }

  return {
    id: 'figure-eight-path',
    segments: [
      {
        type: 'linear',
        waypoints,
        duration: 20.0,
      },
    ],
    loop: true,
  };
}

/**
 * Example 4: Mixed Path Types
 * Combines linear, bezier, and arc segments
 */
export function createMixedPathPath(): Path {
  return {
    id: 'mixed-path',
    segments: [
      // Linear approach
      {
        type: 'linear',
        waypoints: [
          { id: 'start', position: [0, 0, 0] },
          { id: 'approach', position: [10, 5, 10] },
        ],
        duration: 3.0,
      },
      // Bezier curve transition
      {
        type: 'bezier',
        waypoints: [
          { id: 'bezier-start', position: [10, 5, 10] },
          { id: 'bezier-cp1', position: [15, 15, 15] },
          { id: 'bezier-cp2', position: [20, 20, 20] },
          { id: 'bezier-end', position: [25, 25, 25] },
        ],
        duration: 5.0,
      },
      // Arc orbit
      {
        type: 'arc',
        waypoints: [
          { id: 'arc-center', position: [25, 25, 25] },
          { id: 'arc-radius', position: [40, 25, 25] },
        ],
        duration: 8.0,
      },
    ],
    loop: false,
  };
}

/**
 * Example 5: Multiple Origins with Different Paths
 * Different particles can start from different origins and follow different paths
 */
export function createMultiOriginSystem(): {
  origins: Origin[];
  paths: Map<string, Path>;
} {
  const origins: Origin[] = [
    { id: 'gate-a', position: [-10, 0.1, -5], spawnRadius: 0.5 },
    { id: 'gate-b', position: [-10, 0.1, 0], spawnRadius: 0.5 },
    { id: 'gate-c', position: [-10, 0.1, 5], spawnRadius: 0.5 },
  ];

  const paths = new Map<string, Path>();

  // Each gate has its own taxi path
  origins.forEach((origin, idx) => {
    const taxiPath = createWaypointPath([
      { id: `${origin.id}-start`, position: origin.position },
      { id: `${origin.id}-waypoint1`, position: [0, 0.1, origin.position[2]] },
      { id: `${origin.id}-waypoint2`, position: [10, 0.1, origin.position[2]] },
      { id: `${origin.id}-runway`, position: [15, 0.1, 0] },
    ]);

    paths.set(`${origin.id}-taxi`, taxiPath);

    // Each gate has a different takeoff path
    const takeoffPath = createTakeoffPath({
      startPosition: [15, 0.1, 0],
      endPosition: [15 + idx * 5, 50, 50 + idx * 10],
      acceleration: 2.0,
      liftSpeed: 5.0,
      maxHeight: 50.0,
      curveIntensity: 0.2 + idx * 0.1,
    });

    paths.set(`${origin.id}-takeoff`, takeoffPath);
  });

  return { origins, paths };
}

/**
 * Example 6: Reusable Path Templates
 * Create path templates that can be instantiated with different parameters
 */
export class PathTemplate {
  constructor(
    private templateFn: (params: Record<string, any>) => Path,
    private defaultParams: Record<string, any>
  ) {}

  create(params?: Partial<Record<string, any>>): Path {
    return this.templateFn({ ...this.defaultParams, ...params });
  }
}

// Example: Reusable orbit template
export const orbitPathTemplate = new PathTemplate(
  (params: Record<string, any>) =>
    createOrbitPath({
      center: params.center as [number, number, number],
      radius: params.radius as number,
      altitude: params.altitude as number,
      speed: params.speed as number,
    }),
  {
    center: [0, 50, 0],
    radius: 15,
    altitude: 50,
    speed: 0.04,
  }
);

// Usage:
// const orbit1 = orbitPathTemplate.create({ center: [10, 50, 10], radius: 20 });
// const orbit2 = orbitPathTemplate.create({ center: [-10, 50, -10], radius: 25 });

/**
 * Example 7: Path Composition
 * Combine multiple paths into a single complex path
 */
export function composePaths(...paths: Path[]): Path {
  const allSegments: PathSegment[] = [];
  
  paths.forEach((path, idx) => {
    path.segments.forEach((segment, segIdx) => {
      // Update waypoint IDs to be unique
      const updatedSegment: PathSegment = {
        ...segment,
        waypoints: segment.waypoints.map(wp => ({
          ...wp,
          id: `${path.id}-${idx}-${segIdx}-${wp.id}`,
        })),
      };
      allSegments.push(updatedSegment);
    });
  });

  return {
    id: `composed-${paths.map(p => p.id).join('-')}`,
    segments: allSegments,
    loop: paths.every(p => p.loop), // Loop if all paths loop
  };
}

/**
 * Example 8: Conditional Path Selection
 * Select different paths based on particle properties
 */
export function selectPathForParticle(
  particleId: number,
  availablePaths: Path[]
): Path {
  // Example: Alternate between paths
  return availablePaths[particleId % availablePaths.length];
}

/**
 * Example 9: Dynamic Path Modification
 * Modify paths at runtime based on conditions
 */
export function createDynamicPath(basePath: Path, modifiers: {
  scale?: number;
  offset?: [number, number, number];
  speedMultiplier?: number;
}): Path {
  const { scale = 1.0, offset = [0, 0, 0], speedMultiplier = 1.0 } = modifiers;

  return {
    ...basePath,
    segments: basePath.segments.map(segment => ({
      ...segment,
      waypoints: segment.waypoints.map(wp => ({
        ...wp,
        position: [
          wp.position[0] * scale + offset[0],
          wp.position[1] * scale + offset[1],
          wp.position[2] * scale + offset[2],
        ] as [number, number, number],
        speed: wp.speed ? wp.speed * speedMultiplier : undefined,
      })),
      duration: segment.duration ? segment.duration / speedMultiplier : undefined,
      speed: segment.speed ? segment.speed * speedMultiplier : undefined,
    })),
  };
}

/**
 * Example 10: Path Library
 * Pre-defined paths for common scenarios
 */
export const PathLibrary = {
  // Standard runway paths
  standardTaxi: () => createWaypointPath([
    { id: 'gate', position: [-10, 0.1, 0] },
    { id: 'taxiway', position: [0, 0.1, 0] },
    { id: 'runway', position: [15, 0.1, 0] },
  ]),

  standardTakeoff: () => createTakeoffPath({
    startPosition: [15, 0.1, 0],
    endPosition: [15, 50, 100],
    acceleration: 2.0,
    liftSpeed: 5.0,
    maxHeight: 50.0,
  }),

  standardOrbit: () => createOrbitPath({
    center: [20, 50, 0],
    radius: 15,
    speed: 0.04,
    altitude: 50,
  }),

  // Special paths
  helix: (params?: { center?: [number, number, number]; radius?: number; height?: number; turns?: number }) =>
    createHelixPath(params?.center, params?.radius, params?.height, params?.turns),

  figureEight: (params?: { center?: [number, number, number]; radius?: number }) =>
    createFigureEightPath(params?.center, params?.radius),

  // Composed paths
  fullFlight: () => composePaths(
    PathLibrary.standardTaxi(),
    PathLibrary.standardTakeoff(),
    PathLibrary.standardOrbit()
  ),
};
