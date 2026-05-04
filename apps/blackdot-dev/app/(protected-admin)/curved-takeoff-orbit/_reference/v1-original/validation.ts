/**
 * Configuration Validation Schema
 *
 * Validates orbital system configuration using Zod schema validation.
 * Prevents runtime crashes from invalid configuration values.
 *
 * @see MULTI_SOURCE_ORBIT_CONFIG in multi-source.config.ts
 */

import { z } from 'zod';

// Vector3 schema
const Vector3Schema = z.object({
  x: z.number().finite('X coordinate must be a finite number'),
  y: z.number().finite('Y coordinate must be a finite number'),
  z: z.number().finite('Z coordinate must be a finite number')
});

// Color schema (hex color format)
const ColorSchema = z.string().regex(
  /^#[0-9A-Fa-f]{6}$/,
  'Color must be a valid hex color (e.g., #FF0000)'
);

// Model orientation config schema
const ModelOrientationSchema = z.object({
  scale: z.union([
    z.number().positive('Scale must be positive'),
    z.tuple([
      z.number().positive('X scale must be positive'),
      z.number().positive('Y scale must be positive'),
      z.number().positive('Z scale must be positive')
    ])
  ]).optional(),
  rotationOffset: z.tuple([
    z.number().finite('X rotation must be finite'),
    z.number().finite('Y rotation must be finite'),
    z.number().finite('Z rotation must be finite')
  ]).optional(),
  positionOffset: z.tuple([
    z.number().finite('X offset must be finite'),
    z.number().finite('Y offset must be finite'),
    z.number().finite('Z offset must be finite')
  ]).optional(),
  lockToTrail: z.boolean().optional()
}).optional();

// Source configuration schema
const SourceConfigSchema = z.object({
  id: z.string()
    .min(1, 'Source ID must not be empty')
    .max(50, 'Source ID must be 50 characters or less'),
  gatePosition: Vector3Schema,
  particleColor: ColorSchema,
  spawnRate: z.number()
    .positive('Spawn rate must be positive')
    .max(10, 'Spawn rate must be 10 seconds or less'),
  takeoffDuration: z.number()
    .positive('Takeoff duration must be positive')
    .min(0.5, 'Takeoff duration must be at least 0.5 seconds')
    .max(20, 'Takeoff duration must be 20 seconds or less'),
  orbitEntryAngle: z.number()
    .min(0, 'Orbit entry angle must be between 0 and 2π')
    .max(Math.PI * 2, 'Orbit entry angle must be between 0 and 2π'),
  orbitEntryVelocity: z.number()
    .positive('Orbit entry velocity must be positive')
    .max(5, 'Orbit entry velocity must be 5 or less'),
  takeoffWaypoints: z.array(Vector3Schema)
    .min(2, 'Must have at least 2 takeoff waypoints'),
  modelOrientation: ModelOrientationSchema
});

// Orbit configuration schema
const OrbitConfigSchema = z.object({
  center: Vector3Schema,
  radius: z.number()
    .positive('Orbit radius must be positive')
    .max(100, 'Orbit radius must be 100 units or less'),
  nominalSpeed: z.number()
    .positive('Nominal speed must be positive')
    .max(5, 'Nominal speed must be 5 or less')
});

// Avoidance configuration schema
const AvoidanceConfigSchema = z.object({
  gridSectorCount: z.number()
    .int('Grid sector count must be an integer')
    .positive('Grid sector count must be positive')
    .max(128, 'Grid sector count must be 128 or less'),
  allowVerticalAdjustment: z.boolean(),
  verticalAdjustmentStrength: z.number()
    .nonnegative('Vertical adjustment strength must be non-negative')
    .max(10, 'Vertical adjustment strength must be 10 or less'),
  maxVerticalOffset: z.number()
    .positive('Max vertical offset must be positive')
    .max(50, 'Max vertical offset must be 50 units or less')
});

// Exit zone configuration schema
const ExitZoneConfigSchema = z.object({
  radius: z.number()
    .positive('Exit zone radius must be positive')
    .max(20, 'Exit zone radius must be 20 units or less'),
  attractionStrength: z.number()
    .nonnegative('Attraction strength must be non-negative')
    .max(5, 'Attraction strength must be 5 or less'),
  attractionMaxDistance: z.number()
    .positive('Attraction max distance must be positive')
    .max(100, 'Attraction max distance must be 100 units or less'),
  requireProximity: z.boolean()
});

// Main orbit configuration schema
export const OrbitSystemConfigSchema = z.object({
  sources: z.array(SourceConfigSchema)
    .min(1, 'Must have at least 1 source')
    .max(10, 'Cannot have more than 10 sources'),
  orbit: OrbitConfigSchema,
  avoidance: AvoidanceConfigSchema,
  exitZone: ExitZoneConfigSchema.optional(),
  particleCount: z.number()
    .int('Particle count must be an integer')
    .positive('Particle count must be positive')
    .max(500, 'Particle count must be 500 or less'),
  orbitDuration: z.number()
    .positive('Orbit duration must be positive')
    .max(60, 'Orbit duration must be 60 seconds or less'),
  landingDuration: z.number()
    .positive('Landing duration must be positive')
    .max(20, 'Landing duration must be 20 seconds or less'),
  orbitHeightVariation: z.number()
    .nonnegative('Orbit height variation must be non-negative')
    .max(50, 'Orbit height variation must be 50 units or less'),
  defaultStartPhase: z.enum(['takeoff', 'orbit', 'landing']),
  landingWaypoints: z.array(Vector3Schema)
    .min(1, 'Must have at least 1 landing waypoint')
});

// Type inference from schema
export type ValidatedOrbitConfig = z.infer<typeof OrbitSystemConfigSchema>;

/**
 * Validates orbital system configuration
 *
 * @param config - Configuration object to validate
 * @returns Validation result with errors or validated data
 *
 * @example
 * ```typescript
 * const result = validateOrbitConfig(MULTI_SOURCE_ORBIT_CONFIG);
 * if (!result.success) {
 *   console.error('Config errors:', result.errors);
 *   return <ErrorDisplay errors={result.errors} />;
 * }
 * // Use result.data (validated config)
 * ```
 */
export function validateOrbitConfig(config: any): {
  success: boolean;
  errors?: string[];
  data?: ValidatedOrbitConfig;
} {
  try {
    const validated = OrbitSystemConfigSchema.parse(config);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => {
          const path = e.path.join('.');
          return `${path}: ${e.message}`;
        })
      };
    }
    return {
      success: false,
      errors: [`Unknown validation error: ${error}`]
    };
  }
}

/**
 * Validates configuration and throws detailed error if invalid
 * Use this in development for immediate feedback
 *
 * @param config - Configuration to validate
 * @throws Error with detailed validation errors
 */
export function validateOrbitConfigStrict(config: any): ValidatedOrbitConfig {
  const result = validateOrbitConfig(config);
  if (!result.success) {
    throw new Error(
      `Orbit configuration validation failed:\n${result.errors?.join('\n')}`
    );
  }
  return result.data!;
}
