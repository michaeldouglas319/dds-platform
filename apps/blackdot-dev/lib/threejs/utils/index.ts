/**
 * Three.js Utilities Barrel Export
 *
 * Performance optimization, caching, and resource management utilities
 * for Three.js and React Three Fiber components.
 */

export { useModelAutoScaling } from './modelScaling';
export { useCachedModel, clearModelCache } from './modelCache';
export { useCachedTexture, clearTextureCache } from './textureCache';
export { disposeModel } from './modelDisposal';
export { useDispose, disposeResource, disposeResources } from './resource';

// Path system exports
export type { Waypoint, PathSegment, Path, Origin } from './pathSystem';
export { PathEvaluator, getLinearPathPosition, getBezierPathPosition, getArcPathPosition, getPathSegmentPosition } from './pathSystem';

// Takeoff path exports
export type { TakeoffPathConfig } from './takeoffPath';
export { createTakeoffPath, calculateTakeoffPosition } from './takeoffPath';

// Orbit path exports
export type { OrbitPathConfig } from './orbitPath';
export { createOrbitPath, orbitalParamsToPathConfig, createOrbitPathFromParams } from './orbitPath';

// Waypoint path exports
export { createWaypointPath, getWaypointPathDistance, getWaypointPathPosition } from './waypointPath';

// Orientation exports
export type { Orientation } from './orientation';
export { 
  orientationFromDirection, 
  orientationFromPoints, 
  lerpOrientation, 
  orientationForPathFollowing,
  applyOrientation,
  calculateBankAngle,
  orientationWithBank
} from './orientation';

// Model registry exports
export type { ModelType, ModelConfig, ParticleModel } from './modelRegistry';
export { 
  modelRegistry, 
  DEFAULT_MODELS, 
  createSphereModel, 
  useModelLoader, 
  createModelFromConfig 
} from './modelRegistry';
