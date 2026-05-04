/**
 * Trajectory Schema
 *
 * Auto-generated UI for takeoff/landing curve parameters.
 * Controls CatmullRom spline curves for entry and exit paths.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

export const TrajectorySchema = z.object({
  // Entry trajectory (takeoff)
  curveTension: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Entry Curve Tension',
      description: 'CatmullRom tension for takeoff curve (0 = loose, 1 = tight)',
      unit: 'factor',
      category: 'entry',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  midpointHeightMultiplier: withMeta(
    z.number().min(0).max(2),
    {
      control: 'slider',
      label: 'Entry Midpoint Height',
      description: 'Height multiplier for arc midpoint (0 = flat, 2 = very tall)',
      unit: 'factor',
      category: 'entry',
      min: 0,
      max: 2,
      step: 0.1
    }
  ),

  approachAngle: withMeta(
    z.number().min(0).max(90),
    {
      control: 'slider',
      label: 'Approach Angle',
      description: 'Entry approach angle to orbit plane',
      unit: 'degrees',
      category: 'entry',
      min: 0,
      max: 90,
      step: 5
    }
  ),

  landingSpeed: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Entry Landing Speed',
      description: 'Speed multiplier when entering orbit (0 = stop, 1 = full speed)',
      unit: 'factor',
      category: 'entry',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  preOrbitDistance: withMeta(
    z.number().min(5).max(15),
    {
      control: 'slider',
      label: 'Pre-Orbit Distance',
      description: 'Distance before orbit for tangent approach alignment',
      unit: 'units',
      category: 'entry',
      min: 5,
      max: 15,
      step: 0.5
    }
  ),

  // Exit trajectory (landing)
  exitCurveTension: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Exit Curve Tension',
      description: 'CatmullRom tension for landing curve (0 = loose, 1 = tight)',
      unit: 'factor',
      category: 'exit',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  exitMidpointHeightMultiplier: withMeta(
    z.number().min(0).max(2),
    {
      control: 'slider',
      label: 'Exit Midpoint Height',
      description: 'Height multiplier for exit arc midpoint',
      unit: 'factor',
      category: 'exit',
      min: 0,
      max: 2,
      step: 0.1
    }
  ),

  exitPreOrbitDistance: withMeta(
    z.number().min(5).max(15),
    {
      control: 'slider',
      label: 'Exit Pre-Orbit Distance',
      description: 'Departure distance from orbit to landing target',
      unit: 'units',
      category: 'exit',
      min: 5,
      max: 15,
      step: 0.5
    }
  ),

  exitLandingSpeed: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Exit Landing Speed',
      description: 'Speed multiplier during landing descent',
      unit: 'factor',
      category: 'exit',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type TrajectoryConfig = z.infer<typeof TrajectorySchema>;

/**
 * Default trajectory configuration
 */
export const DEFAULT_TRAJECTORY_CONFIG: TrajectoryConfig = {
  curveTension: 0.5,
  midpointHeightMultiplier: 1.0,
  approachAngle: 30,
  landingSpeed: 0.8,
  preOrbitDistance: 10.0,
  exitCurveTension: 0.5,
  exitMidpointHeightMultiplier: 0.8,
  exitPreOrbitDistance: 10.0,
  exitLandingSpeed: 0.6,
};
