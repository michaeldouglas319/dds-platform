/**
 * Config Validation Utilities
 *
 * Runtime validation helpers for V3 configuration using Zod schemas.
 * Provides user-friendly error messages and type-safe validation.
 */

import { V3ConfigSchema, V3ConfigPartialSchemas } from '../config/v3-config.schema';
import type { V3Config } from '../config/v3.config';
import type { TaxiStagingConfig, AssemblyConfig, HealthConfig } from '../types/extended';
import * as THREE from 'three';

/**
 * Default configurations for extended fields (not in Zod schema)
 */
const DEFAULT_TAXI_STAGING: TaxiStagingConfig = {
  enabled: false,
  stagingZones: [],
  groundSpeed: 3.0,
  queueSpacing: 5.0,
  pathSmoothness: 0.5,
};

const DEFAULT_ASSEMBLY: AssemblyConfig = {
  enabled: false,
  maxSteps: 10,
  advancementMode: 'time',
  timePerStep: 5.0,
  orbitsPerStep: 1,
  visual: {
    mode: 'color',
    colorStart: new THREE.Color(0x3b82f6),
    colorEnd: new THREE.Color(0xec4899),
    scaleStart: 1.0,
    scaleEnd: 1.2,
    glowIntensity: 0.5,
  },
  stations: [],
};

const DEFAULT_HEALTH: HealthConfig = {
  enabled: false,
  startingHealth: 100,
  damage: {
    decayRate: 0.1,
    collisionDamage: 10,
    environmentalDamage: 20,
    overcrowdingDamage: 5,
    overcrowdingDistance: 5.0,
  },
  regeneration: {
    enabled: true,
    stagingRegen: 10,
    repairZoneRegen: 20,
  },
  death: {
    behavior: 'remove',
    respawnDelay: 5.0,
  },
  visual: {
    colorHealthIndicator: true,
    particleEffects: false,
    healthBars: false,
  },
};

/**
 * Validation result with typed data or errors
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

/**
 * User-friendly validation error
 */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

/**
 * Validate complete V3 configuration
 *
 * @param config - Configuration to validate
 * @returns Validation result with typed data or errors
 *
 * @example
 * ```typescript
 * const result = validateV3Config(userConfig);
 * if (result.success) {
 *   applyConfig(result.data);
 * } else {
 *   showErrors(result.errors);
 * }
 * ```
 */
export function validateV3Config(config: unknown): ValidationResult<V3Config> {
  const result = V3ConfigSchema.safeParse(config);

  if (result.success) {
    // Merge schema-validated data with defaults for extended fields
    const inputConfig = config as any;
    const fullConfig: V3Config = {
      ...(result.data as unknown as any),
      // Add orbit.center if missing (Vector3 not in schema)
      orbit: {
        ...result.data.orbit,
        center: inputConfig?.orbit?.center || new THREE.Vector3(0, 0, 0),
      },
      taxiStaging: inputConfig?.taxiStaging || DEFAULT_TAXI_STAGING,
      assembly: inputConfig?.assembly || DEFAULT_ASSEMBLY,
      health: inputConfig?.health || DEFAULT_HEALTH,
    };

    return {
      success: true,
      data: fullConfig,
    };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Validate specific config section
 *
 * @param section - Section name (e.g., 'physics', 'debug')
 * @param value - Section value to validate
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateConfigSection('physics', physicsConfig);
 * if (!result.success) {
 *   console.error('Physics validation failed:', result.errors);
 * }
 * ```
 */
export function validateConfigSection<K extends keyof typeof V3ConfigPartialSchemas>(
  section: K,
  value: unknown
): ValidationResult<any> {
  const schema = V3ConfigPartialSchemas[section];
  if (!schema) {
    return {
      success: false,
      errors: [{ path: section, message: 'Unknown config section', code: 'invalid_section' }],
    };
  }

  const result = schema.safeParse(value);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: `${section}.${issue.path.join('.')}`,
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Format validation errors for user display
 *
 * @param errors - Array of validation errors
 * @returns Human-readable error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return `${errors[0].path}: ${errors[0].message}`;
  }

  return `Found ${errors.length} validation errors:\n${errors
    .map((e) => `  • ${e.path}: ${e.message}`)
    .join('\n')}`;
}

/**
 * Check if value is within schema constraints
 *
 * @param section - Section name
 * @param field - Field name
 * @param value - Value to check
 * @returns True if valid, false otherwise
 */
export function isValueValid(section: keyof typeof V3ConfigPartialSchemas, field: string, value: unknown): boolean {
  const schema = V3ConfigPartialSchemas[section];
  if (!schema || !('shape' in schema)) return false;

  const fieldSchema = (schema.shape as any)[field];
  if (!fieldSchema) return false;

  const result = fieldSchema.safeParse(value);
  return result.success;
}

/**
 * Get validation constraints for a field
 *
 * @param section - Section name
 * @param field - Field name
 * @returns Constraints object or null
 */
export function getFieldConstraints(
  section: keyof typeof V3ConfigPartialSchemas,
  field: string
): { min?: number; max?: number; type?: string } | null {
  const schema = V3ConfigPartialSchemas[section];
  if (!schema || !('shape' in schema)) return null;

  const fieldSchema = (schema.shape as any)[field];
  if (!fieldSchema) return null;

  // Extract constraints from Zod schema
  const def = fieldSchema._def;
  const constraints: any = {
    type: def.typeName,
  };

  // For number types, try to extract min/max
  if (def.typeName === 'ZodNumber') {
    def.checks?.forEach((check: any) => {
      if (check.kind === 'min') constraints.min = check.value;
      if (check.kind === 'max') constraints.max = check.value;
    });
  }

  return constraints;
}

/**
 * Validate and sanitize imported config
 *
 * Reconstructs complex types (Vector3) and validates structure.
 *
 * @param imported - Imported JSON object
 * @returns Sanitized and validated config or null
 */
export function sanitizeImportedConfig(imported: any): V3Config | null {
  try {
    // Reconstruct THREE.Vector3 objects
    if (imported.orbit?.center) {
      const THREE = require('three');
      imported.orbit.center = new THREE.Vector3(
        imported.orbit.center.x,
        imported.orbit.center.y,
        imported.orbit.center.z
      );
    }

    imported.sources?.forEach((source: any) => {
      if (source.gatePosition) {
        const THREE = require('three');
        source.gatePosition = new THREE.Vector3(
          source.gatePosition.x,
          source.gatePosition.y,
          source.gatePosition.z
        );
      }
    });

    // Validate partial config (allow missing fields)
    const result = V3ConfigSchema.partial().safeParse(imported);

    if (result.success) {
      return result.data as V3Config;
    }

    console.error('Import validation failed:', result.error.issues);
    return null;
  } catch (error) {
    console.error('Failed to sanitize imported config:', error);
    return null;
  }
}

/**
 * Compare two configs and return differences
 *
 * Useful for detecting changes and showing what's been modified.
 *
 * @param original - Original config
 * @param modified - Modified config
 * @returns Array of changed paths
 */
export function getConfigDifferences(original: V3Config, modified: V3Config): string[] {
  const differences: string[] = [];

  const compare = (path: string, origVal: any, modVal: any) => {
    if (origVal === modVal) return;

    if (typeof origVal === 'object' && typeof modVal === 'object') {
      if (Array.isArray(origVal) && Array.isArray(modVal)) {
        if (JSON.stringify(origVal) !== JSON.stringify(modVal)) {
          differences.push(path);
        }
      } else {
        for (const key in { ...origVal, ...modVal }) {
          compare(`${path}.${key}`, origVal?.[key], modVal?.[key]);
        }
      }
    } else {
      differences.push(path);
    }
  };

  compare('config', original, modified);
  return differences;
}
