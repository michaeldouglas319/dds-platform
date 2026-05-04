/**
 * Orbit Physics Schema - Rapier Integration
 *
 * Auto-generated UI for all 12 Rapier physics parameters.
 * Controls orbital mechanics, particle dynamics, and collision behavior.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

export const OrbitPhysicsSchema = z.object({
  // Donut Geometry
  orbitRadius: withMeta(
    z.number().min(10).max(50),
    {
      control: 'slider',
      label: 'Orbit Radius',
      description: 'Nominal orbit radius from center point',
      unit: 'units',
      category: 'geometry',
      min: 10,
      max: 50,
      step: 0.5
    }
  ),

  donutThickness: withMeta(
    z.number().min(5).max(30),
    {
      control: 'slider',
      label: 'Donut Thickness',
      description: 'Vertical range particles can occupy (±thickness from nominal)',
      unit: 'units',
      category: 'geometry',
      min: 5,
      max: 30,
      step: 0.5
    }
  ),

  // Core Physics Forces
  gravitationalConstant: withMeta(
    z.number().min(50).max(200),
    {
      control: 'slider',
      label: 'Gravitational Constant',
      description: 'Strength of central gravity well pulling particles inward',
      unit: 'force',
      category: 'forces',
      min: 50,
      max: 200,
      step: 5
    }
  ),

  nominalOrbitSpeed: withMeta(
    z.number().min(0.1).max(20),
    {
      control: 'slider',
      label: 'Nominal Orbit Speed',
      description: 'Target tangential velocity for stable orbit',
      unit: 'units/sec',
      category: 'motion',
      min: 0.1,
      max: 20,
      step: 0.5
    }
  ),

  // Particle Properties
  particleMass: withMeta(
    z.number().min(0.1).max(10),
    {
      control: 'slider',
      label: 'Particle Mass',
      description: 'Mass of each particle (affects inertia and forces)',
      unit: 'kg',
      category: 'properties',
      min: 0.1,
      max: 10,
      step: 0.1
    }
  ),

  collisionRadius: withMeta(
    z.number().min(0.5).max(5),
    {
      control: 'slider',
      label: 'Collision Radius',
      description: 'Particle collision sphere radius for Rapier physics',
      unit: 'units',
      category: 'properties',
      min: 0.5,
      max: 5,
      step: 0.1
    }
  ),

  // Damping (Air Resistance)
  dampingLinear: withMeta(
    z.number().min(0).max(0.5),
    {
      control: 'slider',
      label: 'Linear Damping',
      description: 'Linear velocity damping / air resistance (0 = none, 0.5 = high)',
      unit: 'factor',
      category: 'damping',
      min: 0,
      max: 0.5,
      step: 0.01
    }
  ),

  dampingAngular: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Angular Damping',
      description: 'Angular velocity damping / rotational resistance',
      unit: 'factor',
      category: 'damping',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  // Orbit Maintenance Forces
  tangentialBoost: withMeta(
    z.number().min(10).max(1000),
    {
      control: 'slider',
      label: 'Tangential Boost',
      description: 'Force applied to maintain target orbital speed',
      unit: 'force',
      category: 'forces',
      min: 10,
      max: 1000,
      step: 10
    }
  ),

  radialConfinement: withMeta(
    z.number().min(10).max(300),
    {
      control: 'slider',
      label: 'Radial Confinement',
      description: 'Force to keep particles within donut boundaries',
      unit: 'force',
      category: 'forces',
      min: 10,
      max: 300,
      step: 10
    }
  ),

  // Collision Properties
  restitution: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Restitution',
      description: 'Bounciness of particle collisions (0 = no bounce, 1 = perfectly elastic)',
      unit: 'factor',
      category: 'collision',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  friction: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Friction',
      description: 'Surface friction during collisions (0 = frictionless, 1 = high friction)',
      unit: 'factor',
      category: 'collision',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type OrbitPhysicsConfig = z.infer<typeof OrbitPhysicsSchema>;

/**
 * Default orbit physics configuration
 */
export const DEFAULT_ORBIT_PHYSICS_CONFIG: OrbitPhysicsConfig = {
  orbitRadius: 25.0,
  donutThickness: 10.0,
  gravitationalConstant: 100.0,
  nominalOrbitSpeed: 5.0,
  particleMass: 1.0,
  collisionRadius: 1.5,
  dampingLinear: 0.1,
  dampingAngular: 0.3,
  tangentialBoost: 200.0,
  radialConfinement: 120.0,
  restitution: 0.5,
  friction: 0.1,
};
