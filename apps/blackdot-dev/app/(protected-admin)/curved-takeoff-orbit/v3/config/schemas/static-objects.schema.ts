/**
 * Static Objects Schema
 *
 * Configuration for static 3D scene objects (buildings, skyscrapers, decorations).
 * Objects use absolute world coordinates, separate from the particle source system.
 */

import { z } from 'zod';
import { withMeta } from '../schema-metadata';

/**
 * Rotation schema for static objects
 */
export const RotationSchema = z.object({
  x: withMeta(
    z.number().min(-Math.PI).max(Math.PI),
    {
      control: 'slider',
      label: 'X-axis Rotation',
      description: 'Rotation around X-axis in radians',
      unit: 'radians',
      category: 'rotation',
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
    }
  ),

  y: withMeta(
    z.number().min(-Math.PI).max(Math.PI),
    {
      control: 'slider',
      label: 'Y-axis Rotation',
      description: 'Rotation around Y-axis in radians',
      unit: 'radians',
      category: 'rotation',
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
    }
  ),

  z: withMeta(
    z.number().min(-Math.PI).max(Math.PI),
    {
      control: 'slider',
      label: 'Z-axis Rotation',
      description: 'Rotation around Z-axis in radians',
      unit: 'radians',
      category: 'rotation',
      min: -Math.PI,
      max: Math.PI,
      step: 0.1,
    }
  ),
}).optional();

/**
 * Static object base schema
 * Note: position (Vector3) is handled manually in UI
 */
export const StaticObjectSchema = z.object({
  id: withMeta(
    z.string(),
    {
      control: 'input',
      label: 'Object ID',
      description: 'Unique identifier for this static object',
      category: 'identity',
    }
  ),

  modelPath: withMeta(
    z.string().startsWith('/assets/'),
    {
      control: 'input',
      label: 'Model Path',
      description: 'Path to GLTF or GLB file (e.g., /assets/models/building/scene.gltf or /assets/models/prop.glb)',
      category: 'model',
    }
  ),

  scale: withMeta(
    z.number().min(0.1).max(10).optional(),
    {
      control: 'slider',
      label: 'Scale',
      description: 'Uniform scale multiplier for the model',
      unit: 'factor',
      category: 'transform',
      min: 0.1,
      max: 10,
      step: 0.1,
    }
  ),

  rotation: RotationSchema,

  color: withMeta(
    z.string().regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/).optional(),
    {
      control: 'color',
      label: 'Tint Color',
      description: 'Color tint to apply to all materials (hex format)',
      category: 'appearance',
    }
  ),
});

/**
 * Array of static objects
 */
export const StaticObjectsArraySchema = StaticObjectSchema.array().optional();

/**
 * TypeScript types inferred from schemas
 */
export type RotationConfig = z.infer<typeof RotationSchema>;
export type StaticObjectConfig = z.infer<typeof StaticObjectSchema>;
export type StaticObjectsArrayConfig = z.infer<typeof StaticObjectsArraySchema>;

/**
 * Helper to create a default static object
 */
export function createDefaultStaticObject(id: string): Partial<StaticObjectConfig> {
  return {
    id,
    modelPath: '/assets/models/example/scene.gltf',
    scale: 1.0,
    rotation: { x: 0, y: 0, z: 0 },
  };
}
