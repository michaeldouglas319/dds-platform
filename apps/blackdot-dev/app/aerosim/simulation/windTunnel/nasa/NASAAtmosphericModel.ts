/**
 * NASA BGA Atmospheric Model
 *
 * Calculates atmospheric conditions based on NASA's standard atmosphere model
 * from the Beginner's Guide to Aeronautics (BGA) FoilSimStudent simulation.
 *
 * References:
 * - FoilSimStudent_Calc.js: Lines 64-710
 * - U.S. Standard Atmosphere, 1976
 */

import { CONSTANTS, AtmosphericConditions } from './NASATypes';

export class NASAAtmosphericModel {
  /**
   * Calculate complete atmospheric conditions at given altitude and velocity
   *
   * @param velocity - Velocity in ft/s
   * @param altitude - Altitude in feet (0 to 60000)
   * @param chord - Chord length in feet (for Reynolds number)
   * @returns Complete atmospheric conditions
   */
  static calculate(
    velocity: number,
    altitude: number,
    chord: number
  ): AtmosphericConditions {
    // Determine atmospheric regime
    const regime = altitude <= CONSTANTS.TROPOSPHERE_LIMIT ? 'troposphere' : 'stratosphere';

    // Calculate temperature based on regime
    const temperature = this.calculateTemperature(altitude, regime);

    // Calculate pressure based on regime
    const pressure = this.calculatePressure(altitude, temperature, regime);

    // Calculate density
    const density = this.calculateDensity(temperature, pressure);

    // Calculate dynamic viscosity (Sutherland's formula)
    const viscosity = this.calculateViscosity(temperature);

    // Calculate dynamic pressure q₀ = 0.5 * ρ * V²
    const dynamicPressure = this.calculateDynamicPressure(velocity, density);

    // Calculate Reynolds number
    const reynoldsNumber = this.calculateReynoldsNumber(
      velocity,
      chord,
      density,
      viscosity
    );

    return {
      temperature,
      pressure,
      density,
      viscosity,
      dynamicPressure,
      reynoldsNumber,
      regime,
    };
  }

  /**
   * Calculate temperature at given altitude
   *
   * Troposphere (0-36000 ft): T = 59 - 0.00356 * h
   * Stratosphere (>36000 ft): T = -70°F (constant)
   *
   * From FoilSimStudent_Calc.js lines 64-78
   */
  private static calculateTemperature(
    altitude: number,
    regime: 'troposphere' | 'stratosphere'
  ): number {
    if (regime === 'troposphere') {
      // Troposphere: linear temperature decrease
      return CONSTANTS.SEA_LEVEL_TEMP - CONSTANTS.TEMP_LAPSE_RATE * altitude;
    } else {
      // Stratosphere: constant temperature
      return CONSTANTS.STRATOSPHERE_TEMP;
    }
  }

  /**
   * Calculate atmospheric pressure at given altitude
   *
   * Troposphere: p = 2116 * ((T + 459.7) / 518.6)^5.256
   * Stratosphere: p = 473.1 * exp(1.73 - 0.000048 * h)
   *
   * From FoilSimStudent_Calc.js lines 81-95
   */
  private static calculatePressure(
    altitude: number,
    temperature: number,
    regime: 'troposphere' | 'stratosphere'
  ): number {
    if (regime === 'troposphere') {
      // Troposphere: pressure from temperature ratio
      const tempRatio = (temperature + 459.7) / CONSTANTS.TS0; // Convert to Rankine
      return CONSTANTS.SEA_LEVEL_PRESSURE * Math.pow(tempRatio, 5.256);
    } else {
      // Stratosphere: exponential pressure decay
      return 473.1 * Math.exp(1.73 - 0.000048 * altitude);
    }
  }

  /**
   * Calculate air density from ideal gas law
   *
   * ρ = p / (R * T)
   * where R = 1718 ft·lbf/(slug·°R)
   *
   * From FoilSimStudent_Calc.js lines 99-119
   */
  private static calculateDensity(temperature: number, pressure: number): number {
    // Convert temperature to Rankine (°R = °F + 459.7)
    const tempRankine = temperature + 459.7;

    // Ideal gas law: ρ = p / (R * T)
    return pressure / (CONSTANTS.GAS_CONSTANT * tempRankine);
  }

  /**
   * Calculate dynamic viscosity using Sutherland's formula
   *
   * μ = μ₀ * (T/T₀)^1.5 * (T₀ + 198.6)/(T + 198.6)
   *
   * From FoilSimStudent_Calc.js lines 643-648
   */
  private static calculateViscosity(temperature: number): number {
    // Convert to Rankine
    const tempRankine = temperature + 459.7;

    // Sutherland's formula
    const ts0 = CONSTANTS.TS0; // Reference temperature 518.6°R
    const mu0 = CONSTANTS.MU0; // Reference viscosity

    // Simplified Sutherland formula from NASA code
    const tempRatio = Math.pow(tempRankine / ts0, 1.5);
    const sutherlandFactor = (ts0 + 198.6) / (tempRankine + 198.6);

    return mu0 * tempRatio * sutherlandFactor;
  }

  /**
   * Calculate dynamic pressure
   *
   * q₀ = 0.5 * ρ * V²
   *
   * From FoilSimStudent_Calc.js lines 124-141
   */
  private static calculateDynamicPressure(velocity: number, density: number): number {
    // Dynamic pressure: q = 0.5 * ρ * V²
    return 0.5 * density * velocity * velocity;
  }

  /**
   * Calculate Reynolds number
   *
   * Re = ρ * V * c / μ
   *
   * From FoilSimStudent_Calc.js lines 651-710
   */
  private static calculateReynoldsNumber(
    velocity: number,
    chord: number,
    density: number,
    viscosity: number
  ): number {
    // Reynolds number: Re = ρVc/μ
    return (density * velocity * chord) / viscosity;
  }

  /**
   * Get atmospheric conditions at standard sea level
   * (Utility function for testing and reference)
   */
  static getSeaLevelConditions(velocity: number, chord: number): AtmosphericConditions {
    return this.calculate(velocity, 0, chord);
  }

  /**
   * Get atmospheric conditions at stratosphere entry
   * (Utility function for testing boundary conditions)
   */
  static getStratosphereEntryConditions(
    velocity: number,
    chord: number
  ): AtmosphericConditions {
    return this.calculate(velocity, CONSTANTS.TROPOSPHERE_LIMIT + 1, chord);
  }
}
