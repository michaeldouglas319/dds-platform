/**
 * Schema Metadata System for Auto-Generated UI Controls
 *
 * This module provides type-safe metadata decorators for Zod schemas
 * that enable automatic UI generation from configuration schemas.
 *
 * @example
 * ```typescript
 * const OrbitRadiusSchema = withMeta(
 *   z.number().min(10).max(50),
 *   {
 *     control: 'slider',
 *     label: 'Orbit Radius',
 *     description: 'Nominal orbit radius from center',
 *     unit: 'units',
 *     min: 10,
 *     max: 50,
 *     step: 0.5
 *   }
 * );
 * ```
 */

import { z } from 'zod';

/**
 * UI control type hints for auto-generation
 */
export type ControlType =
  | 'slider'       // Number input with visual slider
  | 'input'        // Raw number/text input
  | 'select'       // Dropdown menu for enums
  | 'checkbox'     // Boolean toggle
  | 'color'        // Color picker (hex with alpha)
  | 'toggle';      // Alternative boolean UI

/**
 * Extended metadata for UI generation
 *
 * This interface defines all possible metadata that can be attached
 * to a Zod schema to control how it's rendered in the UI.
 */
export interface FieldMetadata {
  /** Type of UI control to render */
  control: ControlType;

  /** Human-readable label for the control */
  label: string;

  /** Optional detailed description (shown as tooltip/help text) */
  description?: string;

  /** Optional unit label (e.g., 'units', 'seconds', 'degrees') */
  unit?: string;

  /** Optional icon identifier (for future icon support) */
  icon?: string;

  /** Optional category for grouping related fields */
  category?: string;

  /** Minimum value (for number inputs/sliders) */
  min?: number;

  /** Maximum value (for number inputs/sliders) */
  max?: number;

  /** Step increment (for number inputs/sliders) */
  step?: number;

  /** Options for select/dropdown controls */
  options?: Array<{ value: string | number; label: string }>;
}

/**
 * Attaches UI metadata to a Zod schema
 *
 * This function stores metadata in the schema's description field as JSON.
 * The metadata can later be extracted by getFieldMeta() for UI generation.
 *
 * @param schema - The Zod schema to decorate
 * @param meta - The UI metadata to attach
 * @returns The same schema with metadata embedded
 *
 * @example
 * ```typescript
 * const GravitySchema = withMeta(
 *   z.number().min(0).max(200),
 *   {
 *     control: 'slider',
 *     label: 'Gravitational Constant',
 *     unit: 'force',
 *     min: 0,
 *     max: 200,
 *     step: 5
 *   }
 * );
 * ```
 */
export function withMeta<T extends z.ZodTypeAny>(
  schema: T,
  meta: FieldMetadata
): T {
  // Store metadata as JSON string in description
  return schema.describe(JSON.stringify(meta)) as T;
}

/**
 * Extracts UI metadata from a Zod schema
 *
 * This function attempts to parse the schema's description field as JSON
 * to retrieve the metadata attached by withMeta().
 *
 * @param schema - The Zod schema to extract metadata from
 * @returns The metadata object, or null if no valid metadata exists
 *
 * @example
 * ```typescript
 * const meta = getFieldMeta(GravitySchema);
 * if (meta) {
 *   console.log(meta.label); // "Gravitational Constant"
 *   console.log(meta.control); // "slider"
 * }
 * ```
 */
export function getFieldMeta(schema: z.ZodTypeAny): FieldMetadata | null {
  const description = schema.description;
  if (!description) return null;

  try {
    const parsed = JSON.parse(description);
    // Validate that it's actually FieldMetadata
    if (typeof parsed === 'object' && parsed !== null && 'control' in parsed && 'label' in parsed) {
      return parsed as FieldMetadata;
    }
    return null;
  } catch {
    // Not valid JSON or not FieldMetadata
    return null;
  }
}

/**
 * Type guard to check if a schema has valid UI metadata
 *
 * @param schema - The Zod schema to check
 * @returns True if the schema has valid FieldMetadata
 */
export function hasFieldMeta(schema: z.ZodTypeAny): boolean {
  return getFieldMeta(schema) !== null;
}

/**
 * Common metadata presets for frequently used patterns
 *
 * These presets provide consistent styling for common parameter types.
 */
export const MetaPresets = {
  /**
   * Standard physics force parameter (0-1000 range)
   */
  force: (label: string, description?: string): Partial<FieldMetadata> => ({
    control: 'slider',
    label,
    description,
    unit: 'force',
    category: 'forces',
    min: 0,
    max: 1000,
    step: 10
  }),

  /**
   * Standard speed parameter (0-20 range)
   */
  speed: (label: string, description?: string): Partial<FieldMetadata> => ({
    control: 'slider',
    label,
    description,
    unit: 'units/sec',
    category: 'motion',
    min: 0,
    max: 20,
    step: 0.5
  }),

  /**
   * Standard angle parameter (0-360 degrees)
   */
  angle: (label: string, description?: string): Partial<FieldMetadata> => ({
    control: 'slider',
    label,
    description,
    unit: 'degrees',
    min: 0,
    max: 360,
    step: 5
  }),

  /**
   * Standard time parameter (0-10 seconds)
   */
  time: (label: string, description?: string): Partial<FieldMetadata> => ({
    control: 'slider',
    label,
    description,
    unit: 'seconds',
    min: 0,
    max: 10,
    step: 0.1
  }),

  /**
   * Standard normalized factor (0-1 range)
   */
  factor: (label: string, description?: string): Partial<FieldMetadata> => ({
    control: 'slider',
    label,
    description,
    unit: 'factor',
    min: 0,
    max: 1,
    step: 0.01
  }),

  /**
   * Standard boolean toggle
   */
  toggle: (label: string, description?: string): Partial<FieldMetadata> => ({
    control: 'checkbox',
    label,
    description
  }),
};
