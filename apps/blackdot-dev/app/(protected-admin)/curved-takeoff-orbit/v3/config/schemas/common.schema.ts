/**
 * Common Schemas
 *
 * Shared schemas used across multiple configuration sections.
 * Includes exit requirements, landing transition, model orientation, and orbit settings.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

/**
 * Exit requirements schema (when particles can leave orbit)
 */
export const ExitRequirementsSchema = z.object({
  minAngleTraveled: withMeta(
    z.number().min(Math.PI).max(4 * Math.PI),
    {
      control: 'slider',
      label: 'Min Angle Traveled',
      description: 'Radians particle must travel before exit (2π × 1.1 = 1.1 orbits)',
      unit: 'radians',
      category: 'eligibility',
      min: Math.PI,
      max: 4 * Math.PI,
      step: 0.1
    }
  ),

  minTimeInOrbit: withMeta(
    z.number().min(1).max(20),
    {
      control: 'slider',
      label: 'Min Time in Orbit',
      description: 'Seconds particle must orbit before exit allowed',
      unit: 'seconds',
      category: 'eligibility',
      min: 1,
      max: 20,
      step: 0.5
    }
  ),
});

/**
 * Landing transition schema (orbit → landing curve)
 */
export const LandingTransitionSchema = z.object({
  blendDuration: withMeta(
    z.number().min(0.1).max(2),
    {
      control: 'slider',
      label: 'Blend Duration',
      description: 'Seconds to blend from orbit motion to landing curve',
      unit: 'seconds',
      category: 'timing',
      min: 0.1,
      max: 2,
      step: 0.1
    }
  ),

  captureDistance: withMeta(
    z.number().min(2).max(15),
    {
      control: 'slider',
      label: 'Capture Distance',
      description: 'Distance to gate to trigger landing sequence',
      unit: 'units',
      category: 'geometry',
      min: 2,
      max: 15,
      step: 0.5
    }
  ),

  positionBlendMode: withMeta(
    z.enum(['lerp', 'physics']),
    {
      control: 'select',
      label: 'Position Blend Mode',
      description: 'How to blend position during transition',
      options: [
        { value: 'lerp', label: 'Lerp (smooth interpolation)' },
        { value: 'physics', label: 'Physics (force-based)' },
      ]
    }
  ),

  preLandingDistance: withMeta(
    z.number().min(5).max(25),
    {
      control: 'slider',
      label: 'Pre-Landing Distance',
      description: 'Distance to start slowing/redirecting before landing',
      unit: 'units',
      category: 'geometry',
      min: 5,
      max: 25,
      step: 1
    }
  ),

  preLandingSlowdown: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Pre-Landing Slowdown',
      description: 'Speed reduction factor in pre-landing phase (0 = stop, 1 = no slowdown)',
      unit: 'factor',
      category: 'motion',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),
});

/**
 * Model orientation override schema
 */
export const ModelOrientationSchema = z.object({
  scale: withMeta(
    z.number().min(0.1).max(5),
    {
      control: 'slider',
      label: 'Model Scale',
      description: 'Uniform scale multiplier for 3D model',
      unit: 'factor',
      category: 'transform',
      min: 0.1,
      max: 5,
      step: 0.1
    }
  ),

  rotationX: withMeta(
    z.number().min(-Math.PI).max(Math.PI),
    {
      control: 'slider',
      label: 'X-axis Rotation (Pitch)',
      description: 'Model rotation around X-axis in radians',
      unit: 'radians',
      category: 'rotation',
      min: -Math.PI,
      max: Math.PI,
      step: 0.1
    }
  ),

  rotationY: withMeta(
    z.number().min(-Math.PI).max(Math.PI),
    {
      control: 'slider',
      label: 'Y-axis Rotation (Yaw)',
      description: 'Model rotation around Y-axis in radians',
      unit: 'radians',
      category: 'rotation',
      min: -Math.PI,
      max: Math.PI,
      step: 0.1
    }
  ),

  rotationZ: withMeta(
    z.number().min(-Math.PI).max(Math.PI),
    {
      control: 'slider',
      label: 'Z-axis Rotation (Roll)',
      description: 'Model rotation around Z-axis in radians',
      unit: 'radians',
      category: 'rotation',
      min: -Math.PI,
      max: Math.PI,
      step: 0.1
    }
  ),
});

/**
 * Orbit settings schema
 * Note: 'center' is Vector3, handled manually in UI
 */
export const OrbitSettingsSchema = z.object({
  radius: withMeta(
    z.number().min(10).max(50),
    {
      control: 'slider',
      label: 'Orbit Radius',
      description: 'Radius of orbital path',
      unit: 'units',
      min: 10,
      max: 50,
      step: 0.5
    }
  ),

  nominalSpeed: withMeta(
    z.number().min(0.1).max(20),
    {
      control: 'slider',
      label: 'Nominal Speed',
      description: 'Target orbital speed',
      unit: 'units/sec',
      min: 0.1,
      max: 20,
      step: 0.5
    }
  ),
});

/**
 * TypeScript types inferred from schemas
 */
export type ExitRequirementsConfig = z.infer<typeof ExitRequirementsSchema>;
export type LandingTransitionConfig = z.infer<typeof LandingTransitionSchema>;
export type ModelOrientationConfig = z.infer<typeof ModelOrientationSchema>;
export type OrbitSettingsConfig = z.infer<typeof OrbitSettingsSchema>;
