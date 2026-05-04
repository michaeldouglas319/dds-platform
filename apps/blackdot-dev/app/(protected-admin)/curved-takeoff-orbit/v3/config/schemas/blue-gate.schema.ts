/**
 * Blue Gate Attraction Schema
 *
 * Auto-generated UI for state-based attraction system.
 * Controls entry attraction (trajectory → orbit) and exit attraction (orbit → landing).
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

/**
 * Common attraction parameters schema
 */
const AttractionSchema = z.object({
  enabled: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Attraction',
      description: 'Toggle this attraction force',
      category: 'toggle'
    }
  ),

  maxStrength: withMeta(
    z.number().min(0).max(10),
    {
      control: 'slider',
      label: 'Max Strength',
      description: 'Maximum attraction force magnitude',
      unit: 'force',
      category: 'forces',
      min: 0,
      max: 10,
      step: 0.5
    }
  ),

  falloffPower: withMeta(
    z.number().min(0.5).max(3),
    {
      control: 'slider',
      label: 'Falloff Power',
      description: 'Distance falloff exponent (higher = sharper dropoff)',
      unit: 'exponent',
      category: 'forces',
      min: 0.5,
      max: 3,
      step: 0.1
    }
  ),
});

/**
 * Entry attraction schema (trajectory → orbit transition)
 */
const EntryAttractionSchema = AttractionSchema.extend({
  activationProgress: withMeta(
    z.number().min(0.7).max(1.0),
    {
      control: 'slider',
      label: 'Activation Progress',
      description: 'Start attraction at this curve progress (0.8 = 80% through takeoff)',
      unit: 'progress',
      category: 'timing',
      min: 0.7,
      max: 1.0,
      step: 0.05
    }
  ),
});

/**
 * Exit attraction schema (orbit → landing transition)
 */
const ExitAttractionSchema = AttractionSchema.extend({
  minAngleTraveled: withMeta(
    z.number().min(Math.PI).max(4 * Math.PI),
    {
      control: 'slider',
      label: 'Min Angle Traveled',
      description: 'Radians particle must travel before exit allowed (2π × 1.1 = 1.1 orbits)',
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
 * Complete Blue Gate configuration schema
 * (Omits 'position' field - that's per-source)
 */
export const BlueGateSchema = z.object({
  radius: withMeta(
    z.number().min(2).max(30),
    {
      control: 'slider',
      label: 'Gate Radius',
      description: 'Capture zone radius around gate center',
      unit: 'units',
      category: 'geometry',
      min: 2,
      max: 30,
      step: 0.5
    }
  ),

  entryAttraction: EntryAttractionSchema,

  exitAttraction: ExitAttractionSchema,

  transitionBlendTime: withMeta(
    z.number().min(0.1).max(5),
    {
      control: 'slider',
      label: 'Transition Blend Time',
      description: 'Seconds for smooth momentum blending during transitions',
      unit: 'seconds',
      category: 'timing',
      min: 0.1,
      max: 5,
      step: 0.1
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type BlueGateConfig = z.infer<typeof BlueGateSchema>;

/**
 * Default blue gate configuration
 */
export const DEFAULT_BLUE_GATE_CONFIG: BlueGateConfig = {
  radius: 5.0,
  entryAttraction: {
    enabled: true,
    maxStrength: 2.0,
    activationProgress: 0.8,
    falloffPower: 2.0,
  },
  exitAttraction: {
    enabled: true,
    maxStrength: 1.5,
    minAngleTraveled: Math.PI * 2 * 1.1,
    minTimeInOrbit: 8.0,
    falloffPower: 2.0,
  },
  transitionBlendTime: 0.3,
};
