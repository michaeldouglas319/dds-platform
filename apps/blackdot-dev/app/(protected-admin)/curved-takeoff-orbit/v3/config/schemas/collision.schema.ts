/**
 * Collision Schema
 *
 * Auto-generated UI for particle collision and repulsion system.
 * Supports 4 collision shapes: sphere, ellipsoid, squircle, box.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

/**
 * Collision shape enum
 */
export const CollisionShapeSchema = withMeta(
  z.enum(['sphere', 'ellipsoid', 'squircle', 'box']),
  {
    control: 'select',
    label: 'Collision Shape',
    description: 'Shape of particle collision volume',
    category: 'geometry',
    options: [
      { value: 'sphere', label: 'Sphere (uniform radius)' },
      { value: 'ellipsoid', label: 'Ellipsoid (stretched sphere)' },
      { value: 'squircle', label: 'Squircle (rounded box)' },
      { value: 'box', label: 'Box (cuboid)' },
    ]
  }
);

/**
 * 3D dimensions for collision shape
 */
const DimensionsSchema = z.object({
  width: withMeta(
    z.number().min(0.1).max(10),
    {
      control: 'slider',
      label: 'Width (X-axis)',
      description: 'X-axis extent of collision shape',
      unit: 'units',
      min: 0.1,
      max: 10,
      step: 0.1
    }
  ),

  height: withMeta(
    z.number().min(0.1).max(10),
    {
      control: 'slider',
      label: 'Height (Y-axis)',
      description: 'Y-axis extent of collision shape',
      unit: 'units',
      min: 0.1,
      max: 10,
      step: 0.1
    }
  ),

  depth: withMeta(
    z.number().min(0.1).max(10),
    {
      control: 'slider',
      label: 'Depth (Z-axis)',
      description: 'Z-axis extent of collision shape',
      unit: 'units',
      min: 0.1,
      max: 10,
      step: 0.1
    }
  ),
});

/**
 * 3D offset for collision shape center
 */
const OffsetSchema = z.object({
  x: withMeta(
    z.number().min(-5).max(5),
    {
      control: 'slider',
      label: 'X Offset',
      description: 'X-axis offset from particle center',
      unit: 'units',
      min: -5,
      max: 5,
      step: 0.1
    }
  ),

  y: withMeta(
    z.number().min(-5).max(5),
    {
      control: 'slider',
      label: 'Y Offset',
      description: 'Y-axis offset from particle center',
      unit: 'units',
      min: -5,
      max: 5,
      step: 0.1
    }
  ),

  z: withMeta(
    z.number().min(-5).max(5),
    {
      control: 'slider',
      label: 'Z Offset',
      description: 'Z-axis offset from particle center',
      unit: 'units',
      min: -5,
      max: 5,
      step: 0.1
    }
  ),
});

/**
 * Complete collision configuration schema
 */
export const CollisionSchema = z.object({
  enabled: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Collision',
      description: 'Enable particle-particle repulsion forces',
      category: 'toggle'
    }
  ),

  shape: CollisionShapeSchema,

  dimensions: DimensionsSchema,

  offset: OffsetSchema,

  strength: withMeta(
    z.number().min(0).max(10),
    {
      control: 'slider',
      label: 'Repulsion Strength',
      description: 'Force strength when particles collide',
      unit: 'force',
      category: 'forces',
      min: 0,
      max: 10,
      step: 0.5
    }
  ),

  damping: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Damping',
      description: 'Velocity damping on collision (0 = none, 1 = full absorption)',
      unit: 'factor',
      category: 'forces',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  squircleExponent: withMeta(
    z.number().min(2).max(12).optional(),
    {
      control: 'slider',
      label: 'Squircle Exponent',
      description: 'Corner sharpness for squircle (2 = ellipse, 4 = squircle, 8+ = box)',
      unit: 'exponent',
      category: 'geometry',
      min: 2,
      max: 12,
      step: 0.5
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type CollisionConfig = z.infer<typeof CollisionSchema>;

/**
 * Default collision configuration
 */
export const DEFAULT_COLLISION_CONFIG: CollisionConfig = {
  enabled: true,
  shape: 'sphere',
  dimensions: {
    width: 2.0,
    height: 2.0,
    depth: 2.0,
  },
  offset: {
    x: 0,
    y: 0,
    z: 0,
  },
  strength: 5.0,
  damping: 0.3,
  squircleExponent: 4.0,
};
