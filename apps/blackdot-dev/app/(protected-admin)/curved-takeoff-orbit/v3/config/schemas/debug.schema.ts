/**
 * Debug Visualization Schema
 *
 * Auto-generated UI for 11 debug visualization toggles.
 * All fields render as checkboxes with descriptive labels.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

export const DebugSchema = z.object({
  showTrajectories: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Trajectories',
      description: 'Display takeoff/landing curves (yellow/orange)',
      category: 'paths'
    }
  ),

  showWaypoints: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Waypoints',
      description: 'Display curve control points as spheres',
      category: 'paths'
    }
  ),

  showVelocityVectors: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Velocity Vectors',
      description: 'Display particle velocity direction arrows',
      category: 'motion'
    }
  ),

  showHandoffZone: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Handoff Zone',
      description: 'Highlight 85-95% physics handoff zone',
      category: 'physics'
    }
  ),

  showGateZones: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Gate Zones',
      description: 'Display blue gate attraction zone boundaries',
      category: 'gates'
    }
  ),

  showOrbitPath: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Orbit Path',
      description: 'Display nominal orbit circle guide',
      category: 'paths'
    }
  ),

  showCollisionSpheres: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Collision Spheres',
      description: 'Display collision shape wireframes around particles',
      category: 'physics'
    }
  ),

  showAssemblyProgress: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Assembly Progress',
      description: 'Display assembly progress indicator spheres',
      category: 'staging'
    }
  ),

  showTaxiPaths: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Taxi Paths',
      description: 'Display ground movement paths and staging zones',
      category: 'staging'
    }
  ),

  showHealthIndicators: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Health Indicators',
      description: 'Display health status color indicators',
      category: 'status'
    }
  ),

  showPhysicsBounds: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Physics Bounds',
      description: 'Display orbital donut thickness boundary rings',
      category: 'physics'
    }
  ),

  showExitCaptureZones: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Exit Capture Zones',
      description: 'Display pre-landing and capture distance boundaries (circles around blue gate)',
      category: 'gates'
    }
  ),

  showBluGateCenter: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Blue Gate Centers',
      description: 'Display exact blue gate center points (where attraction originates)',
      category: 'gates'
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type DebugConfig = z.infer<typeof DebugSchema>;

/**
 * Default debug configuration (all visualizations off for performance)
 */
export const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  showTrajectories: false,
  showWaypoints: false,
  showVelocityVectors: false,
  showHandoffZone: false,
  showGateZones: false,
  showOrbitPath: false,
  showCollisionSpheres: false,
  showAssemblyProgress: false,
  showTaxiPaths: false,
  showHealthIndicators: false,
  showPhysicsBounds: false,
  showExitCaptureZones: false,
  showBluGateCenter: false,
};
