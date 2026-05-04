/**
 * V3 Configuration Master Schema
 *
 * Combines all sub-schemas into the complete V3 configuration.
 * Enables type inference, runtime validation, and auto-generated UI.
 *
 * Note: Some complex fields (Vector3, arrays) are handled manually in UI.
 */

import { z } from 'zod';
import { withMeta } from './schema-metadata';

// Import all sub-schemas
import { DebugSchema } from './schemas/debug.schema';
import { DisplaySchema } from './schemas/display.schema';
import { OrientationSchema } from './schemas/orientation.schema';
import { OrbitPhysicsSchema } from './schemas/physics.schema';
import { BlueGateSchema } from './schemas/blue-gate.schema';
import { VerticalWaveSchema } from './schemas/vertical-wave.schema';
import { CollisionSchema } from './schemas/collision.schema';
import { SoftGuidanceSchema } from './schemas/soft-guidance.schema';
import { TrajectorySchema } from './schemas/trajectory.schema';
import { CursorEventsSchema } from './schemas/cursor-events.schema';
import {
  ExitRequirementsSchema,
  LandingTransitionSchema,
  ModelOrientationSchema,
  OrbitSettingsSchema
} from './schemas/common.schema';
import { SourceSchema } from './schemas/source.schema';

/**
 * Master V3 Configuration Schema
 *
 * Note: This schema covers the core configuration sections.
 * Complex extensions (TaxiStagingConfig, AssemblyConfig, HealthConfig)
 * are kept as separate TypeScript interfaces for now due to their
 * complexity (Vector3 arrays, deeply nested structures).
 */
export const V3ConfigSchema = z.object({
  // Scene Settings
  particleCount: withMeta(
    z.number().int().min(10).max(200),
    {
      control: 'slider',
      label: 'Particle Count',
      description: 'Total number of particles in the scene',
      unit: 'particles',
      category: 'scene',
      min: 10,
      max: 200,
      step: 5
    }
  ),

  // Orbit Settings
  // Note: orbit.center (Vector3) is handled manually in UI
  orbit: OrbitSettingsSchema,

  // Multi-Source Support
  // Note: source.gatePosition (Vector3) is handled manually in UI
  sources: z.array(SourceSchema),

  // Physics (Rapier)
  physics: OrbitPhysicsSchema,

  // Blue Gate Attraction
  blueGate: BlueGateSchema,

  // Exit Eligibility
  exitRequirements: ExitRequirementsSchema,

  // Landing Transition
  landingTransition: LandingTransitionSchema,

  // 3D Orbit Settings
  verticalWave: VerticalWaveSchema,

  // Orientation Settings
  orientation: OrientationSchema,

  // Model Orientation Override
  modelOrientation: ModelOrientationSchema,

  // Collision/Repulsion
  collision: CollisionSchema,

  // Soft Guidance
  softGuidance: SoftGuidanceSchema,

  // Trajectory Curves
  trajectorySettings: TrajectorySchema,

  // Display Toggles (Model & Particle Visibility)
  display: DisplaySchema,

  // Debug Visualizations
  debug: DebugSchema,

  // Cursor Events (Pointer Interaction)
  cursorEvents: CursorEventsSchema,

  // Note: taxiStaging, assembly, and health configs are kept as
  // TypeScript interfaces (not Zod schemas) for now due to their
  // complexity. They can be added later if needed.
});

/**
 * TypeScript type inferred from schema
 *
 * This type automatically stays in sync with the Zod schema,
 * following the "single source of truth" principle.
 */
export type V3Config = z.infer<typeof V3ConfigSchema>;

/**
 * Validate a configuration object at runtime
 *
 * @param config - The configuration to validate
 * @returns Validation result with typed data or error details
 *
 * @example
 * ```typescript
 * const result = validateV3Config(userProvidedConfig);
 * if (result.success) {
 *   console.log('Valid config:', result.data);
 * } else {
 *   console.error('Validation errors:', result.error.issues);
 * }
 * ```
 */
export function validateV3Config(config: unknown) {
  return V3ConfigSchema.safeParse(config);
}

/**
 * Parse and validate a configuration, throwing on error
 *
 * @param config - The configuration to parse
 * @returns Validated and typed configuration
 * @throws ZodError if validation fails
 *
 * @example
 * ```typescript
 * try {
 *   const validConfig = parseV3Config(userProvidedConfig);
 *   // Use validConfig...
 * } catch (error) {
 *   console.error('Invalid config:', error);
 * }
 * ```
 */
export function parseV3Config(config: unknown): V3Config {
  return V3ConfigSchema.parse(config);
}

/**
 * Create a partial schema for specific sections
 *
 * Useful for validating individual config sections in isolation.
 */
export const V3ConfigPartialSchemas = {
  debug: DebugSchema,
  display: DisplaySchema,
  orientation: OrientationSchema,
  physics: OrbitPhysicsSchema,
  blueGate: BlueGateSchema,
  verticalWave: VerticalWaveSchema,
  collision: CollisionSchema,
  softGuidance: SoftGuidanceSchema,
  trajectory: TrajectorySchema,
  exitRequirements: ExitRequirementsSchema,
  landingTransition: LandingTransitionSchema,
  modelOrientation: ModelOrientationSchema,
  orbit: OrbitSettingsSchema,
  source: SourceSchema,
  cursorEvents: CursorEventsSchema,
} as const;

/**
 * Re-export all schemas for convenience
 */
export {
  DebugSchema,
  DisplaySchema,
  OrientationSchema,
  OrbitPhysicsSchema,
  BlueGateSchema,
  VerticalWaveSchema,
  CollisionSchema,
  SoftGuidanceSchema,
  TrajectorySchema,
  ExitRequirementsSchema,
  LandingTransitionSchema,
  ModelOrientationSchema,
  OrbitSettingsSchema,
  SourceSchema,
  CursorEventsSchema,
};

/**
 * Re-export all types for convenience
 */
export type {
  DebugConfig,
  DisplayConfig,
  OrientationConfig,
  OrbitPhysicsConfig,
  BlueGateConfig,
  VerticalWaveConfig,
  CollisionConfig,
  SoftGuidanceConfig,
  TrajectoryConfig,
  ExitRequirementsConfig,
  LandingTransitionConfig,
  ModelOrientationConfig,
  OrbitSettingsConfig,
  SourceConfig,
  CursorEventsConfig,
} from './schemas';

// Create barrel export for schemas
export * from './schemas/debug.schema';
export * from './schemas/display.schema';
export * from './schemas/orientation.schema';
export * from './schemas/physics.schema';
export * from './schemas/blue-gate.schema';
export * from './schemas/vertical-wave.schema';
export * from './schemas/collision.schema';
export * from './schemas/soft-guidance.schema';
export * from './schemas/trajectory.schema';
export * from './schemas/cursor-events.schema';
export * from './schemas/common.schema';
export * from './schemas/source.schema';
