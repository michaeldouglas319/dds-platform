/**
 * Source Schema
 *
 * Configuration for individual particle spawn sources.
 * Supports per-source overrides for physics, orientation, collision, etc.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';
import { OrbitPhysicsSchema } from './physics.schema';
import { VerticalWaveSchema } from './vertical-wave.schema';
import { SoftGuidanceSchema } from './soft-guidance.schema';
import { OrientationSchema } from './orientation.schema';
import { CollisionSchema } from './collision.schema';

/**
 * Base source configuration (auto-generated fields)
 */
export const SourceBaseSchema = z.object({
  id: z.string(),

  spawnRate: withMeta(
    z.number().min(0.1).max(5),
    {
      control: 'slider',
      label: 'Spawn Rate',
      description: 'Seconds between particle spawns',
      unit: 'seconds',
      category: 'timing',
      min: 0.1,
      max: 5,
      step: 0.1
    }
  ),

  orbitEntryAngle: withMeta(
    z.number().min(0).max(360),
    {
      control: 'slider',
      label: 'Orbit Entry Angle',
      description: 'Angle where particles enter the orbital path',
      unit: 'degrees',
      category: 'geometry',
      min: 0,
      max: 360,
      step: 5
    }
  ),

  particleColor: withMeta(
    z.string().regex(/^#[0-9a-fA-F]{8}$/),
    {
      control: 'color',
      label: 'Particle Color',
      description: 'RGBA hex color for particles from this source',
      category: 'appearance'
    }
  ),

  modelScale: withMeta(
    z.number().min(0.01).max(2),
    {
      control: 'slider',
      label: 'Model Scale',
      description: 'Scale multiplier for 3D models',
      unit: 'factor',
      category: 'appearance',
      min: 0.01,
      max: 2,
      step: 0.01
    }
  ),
});

/**
 * Per-source flight pattern overrides
 * All fields are partial/optional to allow selective overrides
 */
export const FlightPatternOverridesSchema = z.object({
  physics: OrbitPhysicsSchema.partial().optional(),
  verticalWave: VerticalWaveSchema.partial().optional(),
  softGuidance: SoftGuidanceSchema.partial().optional(),
  orientation: OrientationSchema.partial().optional(),
  collision: CollisionSchema.partial().optional(),
}).optional();

/**
 * Complete source configuration schema
 * Note: gatePosition (Vector3) is handled manually in UI
 */
export const SourceSchema = SourceBaseSchema.extend({
  flightPattern: FlightPatternOverridesSchema,
});

/**
 * TypeScript type inferred from schema
 */
export type SourceConfig = z.infer<typeof SourceSchema>;

/**
 * Helper to create a default source configuration
 */
export function createDefaultSource(id: string): Partial<SourceConfig> {
  return {
    id,
    spawnRate: 2.0,
    orbitEntryAngle: 0,
    particleColor: '#4466ffff',
    modelScale: 0.1,
    flightPattern: undefined, // No overrides by default
  };
}
