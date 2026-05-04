/**
 * NASA BGA (Beginner's Guide to Aeronautics) Type Definitions
 * Based on FoilSimStudent calculations
 */

import { Vector3 } from 'three';

/**
 * Input parameters for airfoil aerodynamic analysis
 */
export interface AirfoilParameters {
  /** Angle of attack in degrees, range: -20 to +20 */
  angle: number;

  /** Camber as percentage of chord, range: 0 to 20 */
  camber: number;

  /** Thickness as percentage of chord, range: 5 to 20 */
  thickness: number;

  /** Velocity in ft/s */
  velocity: number;

  /** Altitude in feet, range: 0 to 60000 */
  altitude: number;

  /** Wing area in ft² */
  wingArea: number;

  /** Chord length in feet */
  chord: number;

  /** Wing span in feet (optional, for aspect ratio calculations) */
  span?: number;

  /** Enable aspect ratio correction for finite wing effects (default: true) */
  aspectRatioCorrection?: boolean;
}

/**
 * Atmospheric conditions at a given altitude and velocity
 */
export interface AtmosphericConditions {
  /** Temperature in °F */
  temperature: number;

  /** Pressure in psf (pounds per square foot) */
  pressure: number;

  /** Density in slug/ft³ */
  density: number;

  /** Dynamic viscosity in slug/(ft·s) */
  viscosity: number;

  /** Dynamic pressure (q₀) in psf */
  dynamicPressure: number;

  /** Reynolds number (dimensionless) */
  reynoldsNumber: number;

  /** Atmospheric regime */
  regime: 'troposphere' | 'stratosphere';
}

/**
 * Aerodynamic force coefficients and forces
 */
export interface AerodynamicForces {
  /** Lift coefficient (dimensionless) */
  liftCoefficient: number;

  /** Drag coefficient (dimensionless) */
  dragCoefficient: number;

  /** Lift force in pounds */
  liftForce: number;

  /** Drag force in pounds */
  dragForce: number;

  /** Lift-to-drag ratio */
  liftToDragRatio: number;
}

/**
 * Joukowski transformation geometry parameters
 */
export interface JoukowskiGeometry {
  /** X-coordinate of cylinder center */
  xcval: number;

  /** Y-coordinate of cylinder center */
  ycval: number;

  /** Radius of generating circle */
  rval: number;

  /** Angle beta in radians */
  beta: number;

  /** Circulation (Gamma) */
  gamval: number;

  /** Chord length */
  chord: number;
}

/**
 * Complete airfoil geometry for rendering and SDF
 */
export interface AirfoilGeometry {
  /** Chord length in feet */
  chord: number;

  /** Center position in 3D space */
  center: Vector3;

  /** Angle of attack in radians */
  angleOfAttack: number;

  /** Upper surface coordinate points */
  upperSurfacePoints: Vector3[];

  /** Lower surface coordinate points */
  lowerSurfacePoints: Vector3[];

  /** Joukowski transformation parameters */
  joukowski?: JoukowskiGeometry;
}

/**
 * Complete NASA calculation results
 */
export interface NASACalculationResults {
  /** Atmospheric conditions */
  atmospheric: AtmosphericConditions;

  /** Aerodynamic forces and coefficients */
  forces: AerodynamicForces;

  /** Joukowski geometry parameters */
  geometry: JoukowskiGeometry;

  /** Input parameters used for calculation */
  parameters: AirfoilParameters;
}

/**
 * Unit conversion constants and physical constants
 */
export const CONSTANTS = {
  /** Mathematical constant π */
  PI: Math.PI,

  /** Velocity conversion factor (mph to ft/s) */
  VELOCITY_CONVERSION: 0.6818,

  /** Gas constant for air in ft·lbf/(slug·°R) */
  GAS_CONSTANT: 1718,

  /** Reference viscosity in slug/(ft·s) */
  MU0: 0.000000362,

  /** Reference temperature for viscosity in °R */
  TS0: 518.6,

  /** Troposphere altitude limit in feet */
  TROPOSPHERE_LIMIT: 36000,

  /** Stratosphere altitude limit in feet */
  STRATOSPHERE_LIMIT: 82345,

  /** Standard sea level temperature in °F */
  SEA_LEVEL_TEMP: 59,

  /** Standard sea level pressure in psf */
  SEA_LEVEL_PRESSURE: 2116,

  /** Stratosphere temperature in °F */
  STRATOSPHERE_TEMP: -70,

  /** Temperature lapse rate in troposphere (°F/ft) */
  TEMP_LAPSE_RATE: 0.00356,
} as const;

/**
 * Drag polynomial coefficients for camber/thickness combinations
 * Organized as [camber][thickness] = [a6, a5, a4, a3, a2, a1, a0]
 * where drag = a6*α^6 + a5*α^5 + a4*α^4 + a3*α^3 + a2*α^2 + a1*α + a0
 */
export type DragPolynomial = [number, number, number, number, number, number, number];

/**
 * Configuration for NASA aerodynamic model
 */
export interface NASAModelConfig {
  /** Enable stall factor modeling for high angles of attack */
  enableStallModeling: boolean;

  /** Enable aspect ratio correction */
  enableAspectRatioCorrection: boolean;

  /** Enable Reynolds number effects */
  enableReynoldsEffects: boolean;

  /** Number of points to generate for airfoil surface */
  surfacePointCount: number;
}

/**
 * Default configuration for NASA model
 */
export const DEFAULT_NASA_CONFIG: NASAModelConfig = {
  enableStallModeling: true,
  enableAspectRatioCorrection: true,
  enableReynoldsEffects: true,
  surfacePointCount: 100,
};
