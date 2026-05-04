/**
 * Example scenarios demonstrating path system capabilities
 * These can be used as templates or directly integrated
 */

import { useMemo } from 'react';
import { PathEvaluator } from '@/lib/threejs/utils/pathSystem';
import {
  createCustomRunwayPath,
  createHelixPath,
  createFigureEightPath,
  createMixedPathPath,
  createMultiOriginSystem,
  PathLibrary,
  composePaths,
  createDynamicPath,
} from '@/lib/threejs/utils/pathExamples';

/**
 * Scenario 1: Standard Runway System
 * Uses pre-defined paths from PathLibrary
 */
export function useStandardRunwayPaths() {
  return useMemo(() => {
    const taxiPath = PathLibrary.standardTaxi();
    const takeoffPath = PathLibrary.standardTakeoff();
    const orbitPath = PathLibrary.standardOrbit();

    return {
      taxi: new PathEvaluator(taxiPath),
      takeoff: new PathEvaluator(takeoffPath),
      orbit: new PathEvaluator(orbitPath),
    };
  }, []);
}

/**
 * Scenario 2: Helix Ascent Pattern
 * Particles spiral upward
 */
export function useHelixPaths() {
  return useMemo(() => {
    const helixPath = createHelixPath([0, 0, 0], 10, 50, 2);
    return {
      helix: new PathEvaluator(helixPath),
    };
  }, []);
}

/**
 * Scenario 3: Figure-8 Holding Pattern
 * Particles follow figure-8 pattern
 */
export function useFigureEightPaths() {
  return useMemo(() => {
    const figureEightPath = createFigureEightPath([0, 50, 0], 15);
    return {
      figureEight: new PathEvaluator(figureEightPath),
    };
  }, []);
}

/**
 * Scenario 4: Multi-Origin System
 * Different particles start from different gates with different paths
 */
export function useMultiOriginPaths() {
  return useMemo(() => {
    const { origins, paths } = createMultiOriginSystem();
    const evaluators = new Map<string, PathEvaluator>();

    paths.forEach((path, pathId) => {
      evaluators.set(pathId, new PathEvaluator(path));
    });

    return {
      origins,
      pathEvaluators: evaluators,
      getPathForOrigin: (originId: string) => {
        return evaluators.get(`${originId}-taxi`);
      },
      getTakeoffForOrigin: (originId: string) => {
        return evaluators.get(`${originId}-takeoff`);
      },
    };
  }, []);
}

/**
 * Scenario 5: Composed Full Flight Path
 * Single path combining taxi, takeoff, and orbit
 */
export function useComposedFlightPath() {
  return useMemo(() => {
    const fullPath = PathLibrary.fullFlight();
    return {
      fullFlight: new PathEvaluator(fullPath),
    };
  }, []);
}

/**
 * Scenario 6: Dynamic Paths with Modifiers
 * Same base path, modified for different particles
 */
export function useDynamicPaths() {
  return useMemo(() => {
    const basePath = PathLibrary.standardOrbit();
    
    // Create variations
    const fastPath = createDynamicPath(basePath, { speedMultiplier: 2.0 });
    const largePath = createDynamicPath(basePath, { scale: 1.5 });
    const offsetPath = createDynamicPath(basePath, { offset: [10, 0, 10] });

    return {
      base: new PathEvaluator(basePath),
      fast: new PathEvaluator(fastPath),
      large: new PathEvaluator(largePath),
      offset: new PathEvaluator(offsetPath),
    };
  }, []);
}

/**
 * Scenario 7: Mixed Path Types
 * Combines linear, bezier, and arc segments
 */
export function useMixedPath() {
  return useMemo(() => {
    const mixedPath = createMixedPathPath();
    return {
      mixed: new PathEvaluator(mixedPath),
    };
  }, []);
}

/**
 * Example: Using paths in particle system
 */
export function ExampleParticlePathUsage() {
  const paths = useStandardRunwayPaths();

  // In your particle update loop:
  // const progress = particle.pathProgress;
  // const position = paths.taxi.getPosition(progress);
  // const orientation = paths.taxi.getOrientation(progress);

  return null; // This is just for demonstration
}
